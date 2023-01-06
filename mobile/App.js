/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
    NativeEventEmitter,
    NativeModules,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { WebView } from 'react-native-webview';
import RNFS from 'react-native-fs';
import { fetchSiteData, Soap2DayUsPlayerTrimmerHardcoded } from './cleansers';
const ffs = require("kyofuuc");
const { default: parse } = require("node-html-parser");
const { CreateRingBuffer } = require('./thegreatbridge');

/*RNFS.readFileAssets('custom/index.html').then((res) => {
    console.log('read file res: ', res);
})*/

const App = () => {

    const [clientSource, setClientSource] = React.useState({ uri: 'file:///android_asset/loader.html' });
    const [serverProxy, setServerProxy] = React.useState();

    React.useEffect(() => {
        const _serverProxy = new ServerProxy(NativeModules.LanerBridge);
        const _server = _serverProxy.startExpressServer({ useAnotherPort: true, port: 7001 }, (options) => {
            _serverProxy.vmServeConsole.log(`view more middleware running on address ${options.url}`);
            //createWindow(options.url);
            setClientSource({ uri: `file:///android_asset/build/index.html?middlewareurl=${options.url}` });
        });
        setServerProxy(_serverProxy);
        //AppState.addEventListener('change', handleAppStateChange);

        return () => {
            if (serverProxy) serverProxy.stopServer();
        }
    }, []);

    return (
        <SafeAreaView style={{ backgroundColor: "black", height: "100%" }}>
            <StatusBar barStyle={'light-content'} backgroundColor={"black"} />
            <WebView injectedJavaScript={debugging} onMessage={onWebViewMessage}
                onNavigationStateChange={onNavigationStateChangeEvent}
                style={{ backgroundColor: 'white' }} source={clientSource} />
        </SafeAreaView>
    );

    function onWebViewMessage(payload) {
        (vmServeConsoleCache || console).log("FROM WEBVIEW", payload.nativeEvent.data);
    }

    function onNavigationStateChangeEvent(state) {
        //console.log("URL CHANGING", state)
    }

    function handleAppStateChange(nextAppState) {
        console.log("APP CHANGES:", nextAppState);
        if (nextAppState === 'inactive') {
            console.log('the app is closed');
        }
    }
};

let vmServeConsoleCache = console;
const MediaPluginFolder = RNFS.DocumentDirectoryPath + "/view.me/server/cleansers/mediaplugins";

class ServerProxy {

    logStore = CreateRingBuffer(5000);
    serverKey = null;
    finalPort = 7001;
    startupOption = {};
    eventEmitter = null;
    vmServeConsole = {
        log: (...args) => { this.logStore.push(...args); console.log(...args); },
        error: (...args) => { this.logStore.push(...args); console.log(...args); }
    };

    constructor(lanerBridge) {
        this.LanerBridge = lanerBridge;
        this.eventEmitter = new NativeEventEmitter(NativeModules.ToastExample);
        this.eventListener = this.eventEmitter.addListener('LanerServerError', (event) => {
            const err = event.errorMessage;
            const errPort = event.errorPort;
            if (!(err.includes("already in use") && this.startupOption.useAnotherPort)) {
                this.vmServeConsole.error("START SERVER ERROR", errPort, err);
                return;
            }
            this.startupOption.port++;
            this.vmServeConsole.error("START SERVER ERROR BEFORE RETRY", errPort, err, "OPTIONS", this.startupOption);
            //this.startExpressServer(this.startupOption, this.startupOption.cb);
        });
        vmServeConsoleCache = this.vmServeConsole;
    }

    startExpressServer = (options, cb) => {
        options = options || {};
        options.port = options.port || this.finalPort;
        this.startupOption = options;
        this.startupOption.cb = cb;
        this.LanerBridge.startServer({ hostOnAllAddress: true, ipAddress: "127.0.0.1", murderExisting: true, port: options.port }, (err, lboptions) => {
            if (err) {
                this.vmServeConsole.error("WTF! HOW");
                return;
            }
            this.serverKey = lboptions.serverKey;
            this.finalPort = options.port;
            this.prepareMediaPluginFolder();
            this.vmServeConsole.log(`client proxy online serving ${options.clientLocation || "build/"}`);
            //this.vmServeConsole.log("plugin installation path", path.resolve(MediaPluginFolder));
            //options.listerner = listener;
            options.listenAddress = { address: lboptions.ipAddress, port: lboptions.port };
            //options.getPlayerInjectionScript = getPlayerInjectionScript;
            options.url = `http://${options.listenAddress.address.replace("::", "127.0.0.1")}:${options.listenAddress.port}`;
            this.setupRoutes();
            cb(options);

            this.eventEmitter.addListener(`LanerServerListener_${this.serverKey}`, (event) => {
                const { req, res } = event;
                this.__ResolveResponseMethods(event);
                //console.log("REQRES", req, res);
            });
        });
    }

    stopServer() {
        this.LanerBridge.stopServer(this.serverKey, (err, _) => this.vmServeConsole.error("SERVER.PROXY.STOP", err))
    }

    async prepareMediaPluginFolder() {
        if (await RNFS.exists(`${MediaPluginFolder}`)) return;
        await RNFS.mkdir(`${MediaPluginFolder}`);
        // create PlayerInjectionScriptsMap
        RNFS.writeFile(`${MediaPluginFolder}/PlayerInjectionScriptsMap.json`,
            `{"Soap2DayUs":"Soap2DayUs.player.js","https://soap2day.rs":"Soap2DayUs.player.js"}`, 'utf8')
            .then((_) => vmServeConsoleCache.log("successfully created the PlayerInjectionScriptsMap.json file"))
            .catch((err) => vmServeConsoleCache.log("error creating PlayerInjectionScriptsMap.json:", err.message));
        // install default plugin, Soap2Day.rs
        RNFS.writeFile(`${MediaPluginFolder}/Soap2DayUs.player.js`, Soap2DayUsPlayerTrimmerHardcoded, 'utf8')
            .then((_) => vmServeConsoleCache.log("successfully created the Soap2DayUs.player.js file"))
            .catch((err) => vmServeConsoleCache.log("error creating Soap2DayUs.player.js:", err.message));
        const sourceCode = await ffs.get("https://raw.githubusercontent.com/thedarkprojects/view-me-registry/main/mediaplugins/soap2day_rs/Soap2DayUs.js", { responseType: "text" });
        RNFS.writeFile(`${MediaPluginFolder}/Soap2DayUs.js`, sourceCode.data, 'utf8')
            .then((_) => vmServeConsoleCache.log("successfully created the Soap2DayUs.js file"))
            .catch((err) => vmServeConsoleCache.log("error creating Soap2DayUs.js:", err.message));
    }

    setupRoutes() {
        const app = this.app;

        app.get('/ext/json', async (req, res) => {
            res.set('Access-Control-Allow-Origin', '*');
            if (!req.query.url) return res.json([]);
            req.logger = this.vmServeConsole;
            await fetchSiteData(loadAndMediaPlugin, jsRequiredRunner, MediaPluginFolder, req, res);
        });

        // LOGGER

        app.get('/log/json', async (req, res) => {
            return res.json(req.query.size ? this.logStore.buffer.splice(req.query.size) : this.logStore.buffer);
        });

        app.get('/log/text', async (req, res) => {
            return res.send((req.query.size ? this.logStore.buffer.splice(req.query.size) : this.logStore.buffer).join("\n"));
        });

        app.get('/log/clear', async (req, res) => {
            this.logStore.buffer.length = 0;
            this.logStore = CreateRingBuffer(req.query.new_size || 1000);
            return res.json({ success: true });
        });

        // proxy for stupid devices

        app.get('/get_client_proxies', async (_, res) => {
            this.LanerBridge.getIPV4Addresses((err, addresses) => {
                addresses.push("127.0.0.1");
                return res.json(addresses.map(address => `http://${address}:${this.finalPort}`));
            })
        });
    }

    app = {
        get: (...args) => this.___RequestBridgeHelper("GET", ...args),
        post: (...args) => this.___RequestBridgeHelper("POST", ...args)
    }

    ___RequestBridgeHelper(method, route, cb) {
        this.LanerBridge.route(this.serverKey, method, route, (err, _) => {
            if (err) {
                this.vmServeConsole.error(`Unable to setup route ${method}:${route}. Cause:`, err);
                return;
            }
            this.eventEmitter.addListener(`LanerServerRequestListener_${this.serverKey}_${method}_${route}`, (event) => {
                const { err, req, res } = event;
                //console.log("BEFORE", err, req, res, responseKey);
                req.query = req.parameters;
                req.socket = { localPort: this.finalPort };
                this.__ResolveResponseMethods(event, this.LanerBridge);
                cb(req, res, err);
            });
        });
    }

    __ResolveResponseMethods = (event, lanerBridge) => {
        const { res, responseKey } = event;
        res.send = (data) => lanerBridge.response_close(responseKey, data, this.__ProcessRequestError);
        res.set = (key, value) => lanerBridge.response_appendHeader(responseKey, key, value, this.__ProcessRequestError);
        res.json = (data) => {
            lanerBridge.response_appendHeader(responseKey, "Content-Type", "application/json", this.__ProcessRequestError);
            lanerBridge.response_close(responseKey, JSON.stringify(data), this.__ProcessRequestError);
        };
    }

    __ProcessRequestError = (err, _) => {
        if (err) vmServeConsoleCache.error("REQUEST.ERR", err)
    }

}

const MediaPlugins = {};
async function loadAndMediaPlugin(mediaPluginFolder, logger, name, port) {
    if (MediaPlugins[name]) return MediaPlugins[name];
    const mediaPluginClassSource = await RNFS.readFile(`${mediaPluginFolder}/${name}.js`, 'utf8');
    const mediaPlugin = eval(mediaPluginClassSource.replace("module.exports =", ""));
    mediaPlugin.ffs = ffs; mediaPlugin.parse = parse; mediaPlugin.logger = logger;
    mediaPlugin.buildProxyPath = (url, params) => `http://127.0.0.1:${port}/ext/raw?method=GET&url=${url}&${params}`;
    MediaPlugins[name] = mediaPlugin;
    return mediaPlugin;
}

function jsRequiredRunner(actualUrl, req, cb) {
    eval('console.log("TO FETCH WITH JS")');
}

const debugging = `
  const consoleLog = (type, log) => window.ReactNativeWebView.postMessage(JSON.stringify({'type': 'Console', 'data': {'type': type, 'log': log}}));
  console = {
      log: (log) => consoleLog('log', log),
      debug: (log) => consoleLog('debug', log),
      info: (log) => consoleLog('info', log),
      warn: (log) => consoleLog('warn', log),
      error: (log) => consoleLog('error', log),
    };
    //console.log(document.documentElement.innerHTML);
`;

export default App;
