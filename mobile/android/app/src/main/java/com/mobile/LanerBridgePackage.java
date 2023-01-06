package com.mobile;

import android.annotation.SuppressLint;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.bytesaim.exceptions.ResponseHeaderException;
import com.bytesaim.http.EndpointRouter;
import com.bytesaim.http.Method;
import com.bytesaim.http.Request;
import com.bytesaim.http.Response;
import com.bytesaim.http.Server;
import com.bytesaim.http.ServerListener;
import com.bytesaim.http.StatusCode;
import com.bytesaim.lan.LanerNetworkInterface;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableNativeArray;
import com.facebook.react.bridge.ReadableNativeMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.ViewManager;

import java.io.IOException;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.net.UnknownHostException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Random;
import java.util.concurrent.atomic.AtomicBoolean;

public class LanerBridgePackage implements ReactPackage {

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }

    @Override
    public List<NativeModule> createNativeModules(
            ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();

        modules.add(new LanerBridgeModule(reactContext));

        return modules;
    }

    public static class LanerBridgeModule extends ReactContextBaseJavaModule {

        ReactContext reactContext;
        Map<String, Response> responses = new HashMap<>();
        Map<String, List<Server>> serversMap = new HashMap<>();
        Map<String, List<EndpointRouter>> endpointRoutersMap = new HashMap<>();

        LanerBridgeModule(ReactApplicationContext context) {
            super(context);
            this.reactContext = context;
        }

        @NonNull
        @Override
        public String getName() {
            return "LanerBridge";
        }

        @ReactMethod
        public void startServer(ReadableMap options, Callback cb) throws UnknownHostException, SocketException {
            if (options.getBoolean("murderExisting")) killAllExistingServer();
            List<Server> servers = new ArrayList<>();
            List<EndpointRouter> endpointRouters = new ArrayList<>();
            String serverKey = this.generateRandomString(10);
            if (!options.getBoolean("hostOnAllAddress") || options.getString("ipAddress") != null) {
                Server server = (options.getString("ipAddress") != null)
                        ? new Server(options.getString("ipAddress"), options.getInt("port"))
                        : new Server(options.getInt("port"));
                servers.add(server);
                server.addExceptor((thrower, ex) -> {
                    ex.printStackTrace();
                    WritableMap params = Arguments.createMap();
                    params.putString("errorMessage", ex.toString());
                    params.putInt("errorPort", options.getInt("port"));
                    sendEvent(reactContext, "LanerServerError", params);
                });
                new Thread(server).start();
                endpointRouters.add(new EndpointRouter(server));
                server.addServerListenerFactory((ServerListener) (request, response) -> {
                    try {
                        WritableMap params = Arguments.createMap();
                        params.putMap("req", new RequestProxy(request).toWritableNativeMap());
                        params.putMap("res", new ResponseProxy(response).toWritableNativeMap());
                        sendEvent(reactContext, "LanerServerListener_"+serverKey, params);
                        response.appendHeader("Access-Control-Allow-Origin", "*");
                    } catch (ResponseHeaderException | IOException e) {
                        e.printStackTrace();
                    }
                });
            }
            if (options.getBoolean("hostOnAllAddress")) {
                for (NetworkInterface networkInterface : LanerNetworkInterface.getNetworkInterfacesNoLoopback()) {
                    for (InetAddress inetAddress : LanerNetworkInterface.getValidInetAddresses(networkInterface)) {
                        Server server = new Server(inetAddress.getHostAddress(), options.getInt("port"));
                        servers.add(server);
                        server.addExceptor((thrower, ex) -> {
                            ex.printStackTrace();
                            WritableMap params = Arguments.createMap();
                            params.putString("errorMessage", ex.toString());
                            params.putInt("errorPort", options.getInt("port"));
                            params.putString("errorAddress", inetAddress.getHostAddress());
                            sendEvent(reactContext, "LanerServerError", params);
                        });
                        new Thread(server).start();
                        endpointRouters.add(new EndpointRouter(server));
                        server.addServerListenerFactory((ServerListener) (request, response) -> {
                            try {
                                WritableMap params = Arguments.createMap();
                                params.putMap("req", new RequestProxy(request).toWritableNativeMap());
                                params.putMap("res", new ResponseProxy(response).toWritableNativeMap());
                                sendEvent(reactContext, "LanerServerListener_"+serverKey, params);
                                response.appendHeader("Access-Control-Allow-Origin", "*");
                            } catch (ResponseHeaderException | IOException e) {
                                e.printStackTrace();
                            }
                        });
                    }
                }
            }
            serversMap.put(serverKey, servers);
            endpointRoutersMap.put(serverKey, endpointRouters);
            WritableMap lbOptions = new WritableNativeMap();
            lbOptions.putString("serverKey", serverKey);
            lbOptions.putInt("port", options.getInt("port"));
            lbOptions.putString("ipAddress", servers.get(0).getIpAddress());
            cb.invoke(null, lbOptions);
        }

        @ReactMethod
        public void stopServer(String serverKey, Callback cb) {
            try {
                List<Server> servers = Objects.requireNonNull(getServerFromKey(serverKey));
                for (Server server : servers) {
                    server.stop();
                }
                serversMap.remove(serverKey);
                endpointRoutersMap.remove(serverKey);
                cb.invoke(null, true);
            } catch (Exception e) {
                e.printStackTrace();
                cb.invoke(e.toString(), null);
            }
        }

        @ReactMethod
        public void route(String serverKey, String methodStr, String route, Callback cb) {
            try {
                Method method = Method.valueOf(methodStr);
                List<EndpointRouter> endpointRouters = Objects.requireNonNull(getEndpointRouterFromKey(serverKey));
                for (EndpointRouter endpointRouter : endpointRouters) {
                    endpointRouter.route(method, route, (ServerListener) (request, response) -> {
                        WritableMap params = Arguments.createMap();
                        try {
                            String responseKey = this.generateRandomString(10);
                            responses.put(responseKey, response);
                            params.putString("responseKey", responseKey);
                            params.putMap("req", new RequestProxy(request).toWritableNativeMap());
                            params.putMap("res", new ResponseProxy(response).toWritableNativeMap());
                            sendEvent(reactContext,
                                    "LanerServerRequestListener_" + serverKey + "_" + methodStr + "_" + route,
                                    params);
                        } catch (IOException e) {
                            params.putString("err", e.getMessage());
                            sendEvent(reactContext,
                                    "LanerServerRequestListener",
                                    params);
                        }
                    });
                }
                cb.invoke(null, true);
            } catch (Exception e) {
                cb.invoke(e.toString(), false);
            }
        }

        @ReactMethod
        public void response_appendHeader(String responseKey, String key, String value, Callback cb) {
            try {
                Log.d("LOGGIN HEADERS SENT", responseKey + "=>" + key + ":" + value);
                Objects.requireNonNull(getResponseFromKey(responseKey)).appendHeader(key, value);
                cb.invoke(null, true);
            } catch (Exception e){
                cb.invoke(e.toString(), false);
            }
        }

        @ReactMethod
        public void response_setStatusCode(String responseKey, String statusCode, Callback cb) {
            try {
                Objects.requireNonNull(getResponseFromKey(responseKey))
                        .setStatusCode(StatusCode.valueOf(statusCode));
                cb.invoke(null, true);
            } catch (Exception e){
                cb.invoke(e.toString(), false);
            }
        }

        @ReactMethod
        public void response_write(String responseKey, String data, Callback cb) {
            try {
                Objects.requireNonNull(getResponseFromKey(responseKey))
                        .write(data);
                cb.invoke(null, true);
            } catch (Exception e){
                cb.invoke(e.toString(), false);
            }
        }

        @ReactMethod
        public void response_close(String responseKey, String data, Callback cb) {
            try {
                Objects.requireNonNull(getResponseFromKey(responseKey))
                        .close(data);
                cb.invoke(null, true);
            } catch (Exception e){
                cb.invoke(e.toString(), false);
            }
        }

        @ReactMethod
        public void response_closeWithBytes(String responseKey, String dataBase65, Callback cb) {
            try {
                Log.e(">>>>>>>>>TEST", dataBase65);
                Objects.requireNonNull(getResponseFromKey(responseKey))
                        .close(dataBase65);
                cb.invoke(null, true);
            } catch (Exception e){
                cb.invoke(e.toString(), false);
            }
        }

        // non server

        @ReactMethod
        public void getIPV4Addresses(Callback cb) {
            try {
                WritableArray ipv4Addresses = Arguments.createArray();
                for (NetworkInterface networkInterface : LanerNetworkInterface.getNetworkInterfacesNoLoopback()) {
                    for (InetAddress inetAddress : LanerNetworkInterface.getValidInetAddresses(networkInterface)) {
                        ipv4Addresses.pushString(inetAddress.getHostAddress());
                    }
                }
                cb.invoke(null, ipv4Addresses);
            } catch (Exception e) {
                e.printStackTrace();
                cb.invoke(e.toString(), false);
            }
        }

        List<Server> getServerFromKey(String key) throws Exception {
            if (!serversMap.containsKey(key)) {
                throw new Exception("No running server found with the key: "+ key);
            }
            return serversMap.get(key);
        }

        List<EndpointRouter> getEndpointRouterFromKey(String serverKey) throws Exception {
            if (!endpointRoutersMap.containsKey(serverKey)) {
                throw new Exception("No running server EndpointRouter found with the key: "+ serverKey);
            }
            return endpointRoutersMap.get(serverKey);
        }

        Response getResponseFromKey(String key) throws Exception {
            if (!responses.containsKey(key)) {
                throw new Exception("No active response found with the key: "+ key);
            }
            return responses.get(key);
        }

        String generateRandomString(int length) {
            int leftLimit = 97; // letter 'a'
            int rightLimit = 122; // letter 'z'
            Random random = new Random();
            StringBuilder buffer = new StringBuilder(length);
            for (int i = 0; i < length; i++) {
                int randomLimitedInt = leftLimit + (int)
                        (random.nextFloat() * (rightLimit - leftLimit + 1));
                buffer.append((char) randomLimitedInt);
            }
            return buffer.toString();
        }

        void killAllExistingServer() {
            try {
                for (List<Server> servers : serversMap.values()) {
                    for (Server server : servers) {
                        server.stop();
                    }
                }
                serversMap = new HashMap<>();
            } catch (IOException e) {
                e.printStackTrace();
                WritableMap params = Arguments.createMap();
                params.putString("errorMessage", e.toString());
                sendEvent(reactContext, "LanerServersMurderError", params);
            }
        }

        // react shits

        private void sendEvent(ReactContext reactContext,
                               String eventName,
                               @Nullable WritableMap params) {
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(eventName, params);
        }

        private int listenerCount = 0;

        @ReactMethod
        public void addListener(String eventName) {
            if (listenerCount == 0) {
                // Set up any upstream listeners or background tasks as necessary
            }

            listenerCount += 1;
        }

        @ReactMethod
        public void removeListeners(Integer count) {
            listenerCount -= count;
            if (listenerCount == 0) {
                // Remove upstream listeners, stop unnecessary background tasks
            }
        }

    }

    static class RequestProxy {

        WritableMap writableMap = new WritableNativeMap();

        public RequestProxy(Request request) throws IOException {
            writableMap.putString("endpoint", request.getEndpoint());
            writableMap.putString("method", request.getMethod().name());
            writableMap.putString("httpVersion", request.getHttpVersion());
            writableMap.putString("body", new String(request.getBody(), StandardCharsets.UTF_8));

            // headers
            WritableMap headersMap = new WritableNativeMap();
            Map<String, String> headers = request.getHeaders();
            for (Map.Entry<String, String> header : headers.entrySet()) {
                headersMap.putString(header.getKey(), header.getValue());
            }
            writableMap.putMap("headers", headersMap);

            // parameter
            WritableMap parametersMap = new WritableNativeMap();
            Map<String, String> parameters = request.getParameters();
            for (Map.Entry<String, String> parameter : parameters.entrySet()) {
                parametersMap.putString(parameter.getKey(), parameter.getValue());
            }
            writableMap.putMap("parameters", parametersMap);
        }

        public WritableMap toWritableNativeMap() {
            return writableMap;
        }

    }

    static class ResponseProxy {

        WritableMap writableMap = new WritableNativeMap();

        public ResponseProxy(Response request) throws IOException {
            writableMap.putBoolean("isClosed", request.isClosed());
            writableMap.putInt("bufferSize", request.getBufferSize());
            writableMap.putString("reasonPhrase", request.getReasonPhrase());
            writableMap.putString("statusCode", request.getStatusCode().name());
        }

        public WritableMap toWritableNativeMap() {
            return writableMap;
        }

    }

}
