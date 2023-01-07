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
    BackHandler,
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

let superWhitelistedUrls = ["file://"];
let superSetJsRequiredUrl;
const App = () => {

    const webViewRef = React.useRef();
    const [serverProxy, setServerProxy] = React.useState();
    const [jsRequiredUrl, setJsRequiredUrl] = React.useState(null);
    const [pageIsLoading, setPageIsLoading] = React.useState(false);
    const [clientSource, setClientSource] = React.useState({ uri: 'file:///android_asset/loader.html' });

    React.useEffect(() => {
        const _serverProxy = new ServerProxy(NativeModules.LanerBridge);
        const _server = _serverProxy.startExpressServer({ useAnotherPort: true, port: 7001 }, (options) => {
            _serverProxy.vmServeConsole.log(`view more middleware running on address ${options.url}`);
            //createWindow(options.url);
            setClientSource({ uri: `file:///android_asset/build/index.html?middlewareurl=${options.url}` });
        });
        setServerProxy(_serverProxy);
        //AppState.addEventListener('change', handleAppStateChange);
        BackHandler.addEventListener("hardwareBackPress", handleBackButtonPress)

        return () => {
            if (serverProxy) serverProxy.stopServer();
            BackHandler.removeEventListener("hardwareBackPress", handleBackButtonPress)
        }
    }, []);
    superSetJsRequiredUrl = setJsRequiredUrl;

    return (
        <SafeAreaView style={{ backgroundColor: "black", height: "100%" }}>
            <StatusBar barStyle={'light-content'} backgroundColor={"black"} />
            <WebView containerStyle={{ display: (pageIsLoading ? null : "none") }} source={jsRequiredUrl} injectedJavaScript={jsLoadingInjection}
                onMessage={onJsLoaderWebViewMessage} onShouldStartLoadWithRequest={() => false} />
            <WebView allowsFullscreenVideo={true} thirdPartyCookiesEnabled={false} javaScriptCanOpenWindowsAutomatically={false}
                allowFileAccess={true} setSupportMultipleWindows={false} originWhitelist={["file://", "http://", "https://"]}
                containerStyle={{ display: (!pageIsLoading ? null : "none") }} ref={webViewRef} injectedJavaScript={debugging} onMessage={onWebViewMessage}
                onNavigationStateChange={onNavigationStateChangeEvent}
                style={{ backgroundColor: 'white' }} source={clientSource} onShouldStartLoadWithRequest={(request) => {
                    for (const superWhitelistedUrl of superWhitelistedUrls) {
                        if (request.url.startsWith(superWhitelistedUrl)) {
                            return true;
                        }
                    }
                    console.log("BLOCKING POP UP TO WEBSITE", request.url);
                    return false
                }} onError={(err) => console.log("WE ERRORING OUT", err)}/>
        </SafeAreaView>
    );

    function onJsLoaderWebViewMessage(payload) {
        if (!currentJsLoaderCb) return;
        (vmServeConsoleCache || console).log("::", payload.nativeEvent.data, "::");
        currentJsLoaderCb(payload.nativeEvent.data);
        currentJsLoaderCb = null;
    }

    function onWebViewMessage(payload) {
        const data = JSON.parse(payload.nativeEvent.data);
        if (data.type === "console") {
            (vmServeConsoleCache || console).log("FROM WEBVIEW", data.data.log);
            return;
        }
        if (data.type === "go_home") {
            console.log("GO HOME", clientSource);
            setClientSource({ uri: clientSource.uri.replace("&1", "") + "&1" });
            return;
        }
        if (data.type === "player_triming_done") {
            setPageIsLoading(false);
            return;
        }
    }

    async function onNavigationStateChangeEvent(state) {
        if (state.url.includes("file://")) { if (pageIsLoading) setPageIsLoading(false); return; }
        //console.log("STATE CHANGED", state)
        if (!pageIsLoading && state.loading) {
            setJsRequiredUrl({ uri: 'file:///android_asset/loader.html' });
            setPageIsLoading(true);
            return;
        }
        const baseUrl = state.url.substr(0, state.url.indexOf("/", 10));
        if (!baseUrl) { return setPageIsLoading(false); };
        const trimmerSource = await getPlayerInjectionScript(baseUrl);
        webViewRef.current?.postMessage(JSON.stringify({ type: 'player_trimmer', source: trimmerSource, control_injection: playerControlsInjection }));
    }

    function handleAppStateChange(nextAppState) {
        console.log("APP CHANGES:", nextAppState);
        if (nextAppState === 'inactive') {
            console.log('the app is closed');
        }
    }

    function handleBackButtonPress() {
        try {
            webViewRef.current?.goBack();
            return true;
        } catch (err) {
            console.log("[handleBackButtonPress] Error : ", err.message)
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
            this.vmServeConsole.log("plugin installation path", MediaPluginFolder);
            //options.listerner = listener;
            options.listenAddress = { address: lboptions.ipAddress, port: lboptions.port };
            options.getPlayerInjectionScript = getPlayerInjectionScript;
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

    loadTheWhitelistedUrls(playerInjectionScriptsMap) {
        superWhitelistedUrls = superWhitelistedUrls.concat(Object.keys(playerInjectionScriptsMap));
    }

    async prepareMediaPluginFolder() {
        if (await RNFS.exists(`${MediaPluginFolder}`)) {
            this.loadTheWhitelistedUrls(JSON.parse(await RNFS.readFile(`${MediaPluginFolder}/PlayerInjectionScriptsMap.json`, 'utf8')));
            return;
        }
        await RNFS.mkdir(`${MediaPluginFolder}`);
        // create PlayerInjectionScriptsMap
        const playerInjectionScriptsMap = JSON.parse(`{"Soap2DayUs":"Soap2DayUs.player.js","https://soap2day.rs":"Soap2DayUs.player.js"}`);
        RNFS.writeFile(`${MediaPluginFolder}/PlayerInjectionScriptsMap.json`,
            JSON.stringify(playerInjectionScriptsMap), 'utf8')
            .then((_) => vmServeConsoleCache.log("successfully created the PlayerInjectionScriptsMap.json file"))
            .catch((err) => vmServeConsoleCache.log("error creating PlayerInjectionScriptsMap.json:", err.message));
        this.loadTheWhitelistedUrls(playerInjectionScriptsMap);
        // install default plugin, Soap2Day.rs
        RNFS.writeFile(`${MediaPluginFolder}/Soap2DayUs.player.js`, Soap2DayUsPlayerTrimmerHardcoded, 'utf8')
            .then((_) => vmServeConsoleCache.log("successfully created the Soap2DayUs.player.js file"))
            .catch((err) => vmServeConsoleCache.log("error creating Soap2DayUs.player.js:", err.message));
        const sourceCode = await ffs.get("https://raw.githubusercontent.com/thedarkprojects/view-me-registry/main/mediaplugins/soap2day_rs/Soap2DayUs.js", { responseType: "text" });
        RNFS.writeFile(`${MediaPluginFolder}/Soap2DayUs.js`, sourceCode.data, 'utf8')
            .then((_) => vmServeConsoleCache.log("successfully created the Soap2DayUs.js file"))
            .catch((err) => vmServeConsoleCache.log("error creating Soap2DayUs.js:", err.message));
    }

    _arrayBufferToBase64(buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    setupRoutes() {
        const app = this.app;

        app.get('/ext/raw', async (req, res) => {
            if (!req.query.url) return res.send("");
            ffs[(req.query.method || "get").toLowerCase()](req.query.url, { responseType: "arraybuffer", ...req.query }).then(function (response) {
                if (req.query.content_type) res.set('Content-Type', req.query.content_type);
                //console.log("BEFORE SEND", this._arrayBufferToBase64(response.data))
                //res.send("this._arrayBufferToBase64(response.data)");
                res.send("not implemented");
            }).catch(function (err) {
                res.status(500); res.send(err.message);
                vmServeConsoleCache.error(err);
            });
        });

        app.get('/ext/json', async (req, res) => {
            res.set('Access-Control-Allow-Origin', '*');
            if (!req.query.url) return res.json([]);
            req.logger = vmServeConsoleCache;
            await fetchSiteData(loadAndMediaPlugin, jsRequiredRunner, MediaPluginFolder, req, res);
        });

        app.get('/favicon.ico', (req, res) => res.send(`success`));

        // plugin setups

        app.get('/mediaplugin/plugin/install', async (req, res) => {
            ffs.get(req.query.scrapper_class_location, { responseType: "text" }).then(async function (response) {
                RNFS.writeFile(`${MediaPluginFolder}/${req.query.name}.js`, response.data, 'utf8')
                    .then((_) => vmServeConsoleCache.log(`successfully created the ${req.query.name}.js file`))
                    .catch((err) => vmServeConsoleCache.log(`error creating ${req.query.name}.js:`, err.message));

                ffs.get(req.query.scrapper_class_location, { responseType: "text" }).then(async function (response) {
                    RNFS.writeFile(`${MediaPluginFolder}/${req.query.name}.player.js`, response.data, 'utf8')
                        .then((_) => vmServeConsoleCache.log(`successfully created the ${req.query.name}.player.js file`))
                        .catch((err) => vmServeConsoleCache.log(`error creating ${req.query.name}.player.js:`, err.message));

                    const playerInjectionScriptsMap = JSON.parse(await RNFS.readFile(`${MediaPluginFolder}/PlayerInjectionScriptsMap.json`, 'utf8'));
                    playerInjectionScriptsMap[req.query.name] = `${req.query.name}.player.js`;
                    playerInjectionScriptsMap[req.query.base_url] = `${req.query.name}.player.js`;
                    RNFS.writeFile(`${MediaPluginFolder}/PlayerInjectionScriptsMap.json`, JSON.stringify(playerInjectionScriptsMap), 'utf8')
                        .then((_) => vmServeConsoleCache.log(`successfully updated the PlayerInjectionScriptsMap.js file`))
                        .catch((err) => vmServeConsoleCache.log(`error updating PlayerInjectionScriptsMap.js:`, err.message));
                    this.loadTheWhitelistedUrls(playerInjectionScriptsMap);
                    res.send(`{ "success": true }`);
                    __CachedPlayerInjectionScripts = {};
                }).catch(function (err) {
                    vmServeConsoleCache.error(err);
                    res.status(500); res.send(err.message);
                });
            }).catch(function (err) {
                vmServeConsoleCache.error(err);
                res.status(500); res.send(err.message);
            });
        });

        app.get('/mediaplugin/plugin/uninstall', async (req, res) => {
            try {
                await RNFS.unlink(`${MediaPluginFolder}/${req.query.name}.js`);
                await RNFS.unlink(`${MediaPluginFolder}/${req.query.name}.player.js`);
                res.send(`{ "success": true }`);
                const playerInjectionScriptsMap = JSON.parse(await RNFS.readFile(`${MediaPluginFolder}/PlayerInjectionScriptsMap.json`, 'utf8'));
                delete playerInjectionScriptsMap[req.query.name];
                delete playerInjectionScriptsMap[req.query.base_url];
                RNFS.writeFile(`${MediaPluginFolder}/PlayerInjectionScriptsMap.json`, JSON.stringify(playerInjectionScriptsMap), 'utf8')
                    .then((_) => vmServeConsoleCache.log(`successfully updated the PlayerInjectionScriptsMap.js file`))
                    .catch((err) => vmServeConsoleCache.log(`error updating PlayerInjectionScriptsMap.js:`, err.message));
                __CachedPlayerInjectionScripts = {};
            } catch (err) {
                vmServeConsoleCache.error("Unable to delete the injection script entry", err);
            }
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
        res.status = (code) => lanerBridge.response_setStatusCode(responseKey, code, this.__ProcessRequestError);
        res.set = (key, value) => lanerBridge.response_appendHeader(responseKey, key, value, this.__ProcessRequestError);
        res.sendBytes = (data) => lanerBridge.response_closeWithBytes(responseKey, data, this.__ProcessRequestError);
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
    mediaPlugin.ffs = ffs.init({ responseType: "text" }); mediaPlugin.parse = parse; mediaPlugin.logger = logger;
    mediaPlugin.buildProxyPath = (url, params) => url;
    MediaPlugins[name] = mediaPlugin;
    return mediaPlugin;
}

let currentJsLoaderCb;
function jsRequiredRunner(actualUrl, req, cb) {
    currentJsLoaderCb = cb;
    if (req.query.element_to_wait_for) {
        if (actualUrl.includes("?")) actualUrl += "&wfel___="+req.query.element_to_wait_for;
        else actualUrl += "?wfel___="+req.query.element_to_wait_for;
    }
    superSetJsRequiredUrl({ uri: actualUrl });
}

let __CachedPlayerInjectionScripts = {};
async function getPlayerInjectionScript(baseUrlOrName) {
    try {
        const playerInjectionScriptsMap = JSON.parse(await RNFS.readFile(`${MediaPluginFolder}/PlayerInjectionScriptsMap.json`, 'utf8'));
        __CachedPlayerInjectionScripts[baseUrlOrName] = playerInjectionScriptsMap[baseUrlOrName];
        return (await RNFS.readFile(`${MediaPluginFolder}/${__CachedPlayerInjectionScripts[baseUrlOrName]}`, 'utf8'));
    } catch (err) {
        vmServeConsoleCache.error("Unable to read and load the injection script entry", err);
        return ``;
        //return `alert('Cannot Load PlayerInjectionScriptsMap.json');`;
    }
}

const jsLoadingInjection = `

function waitForElm(selector) {
    return new Promise(resolve => {
        alert(selector);
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

const searchParams = new URLSearchParams(decodeURIComponent(window.location.search));
if (!searchParams.get("wfel___")) {
    window.ReactNativeWebView.postMessage(document.documentElement.innerHTML);
} else {
    waitForElm(searchParams.get("wfel___")).then((elm) => {
        alert("DONE WAITING FOR "+searchParams.get("wfel___"));
        window.ReactNativeWebView.postMessage(document.documentElement.innerHTML);
    });
}
`;

const debugging = `
const consoleLog = (type, ...log) => window.ReactNativeWebView.postMessage(JSON.stringify({'type': 'console', 'data': {'type': type, 'log': log}}));
console = {
    log: (log) => consoleLog('log', log),
    debug: (log) => consoleLog('debug', log),
    info: (log) => consoleLog('info', log),
    warn: (log) => consoleLog('warn', log),
    error: (log) => consoleLog('error', log),
};

document.addEventListener("message", function(event) {
    const data = JSON.parse(event.data);
    if (data.type == 'player_trimmer') {
        try { eval(data.source); } catch (err) { console.error("LOADING PLUGIN PLAYER INJECTION", err); }
        try { eval(data.control_injection); } catch (err) { console.error("LOADING PLAYER CONTROL INJECTION",err); }
        window.ReactNativeWebView.postMessage(JSON.stringify({'type': 'player_triming_done'}))
    }
}, false);
`;

const playerControlsInjection = `
    document.body.style.background = "black";
    setTimeout(() => {
        document.getElementsByTagName('body')[0].innerHTML += (\`<div style='position: fixed; bottom: 20px; left: 20px; z-index: 999; display: flex; flex-wrap: wrap;'>
            <button onclick='window.history.go(-1); return false;'
                style='cursor: pointer; border-radius: 6px; padding: 16px 20px 16px 20px; background: white;'>Back</button>
            <button onclick='window.location.reload(); return false;'
                style='cursor: pointer; border-radius: 6px; padding: 16px 20px 16px 20px; background: white;'>Reload</button>
            <button onclick="window.ReactNativeWebView.postMessage(JSON.stringify({'type': 'go_home'}))"
                style='cursor: pointer; border-radius: 6px; padding: 16px 20px 16px 20px; background: white;'>Home</button>
        </div>\`);
    }, 1000);
    `;

export default App;
