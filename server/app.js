const os = require('os');
const fs = require('fs');
const path = require("path");
const ffs = require("kyofuuc");
const express = require('express');
const { chromium } = require("playwright");
const { default: parse } = require("node-html-parser");
const { CreateRingBuffer } = require('../mobile/thegreatbridge');
const { fetchSiteData, Soap2DayUsPlayerTrimmerHardcoded } = require("../mobile/cleansers");
const app = express();


const MediaPluginFolder = path.resolve((process.env.APPDATA || (process.platform == 'darwin' 
        ? process.env.HOME + '/Library/Preferences' 
        : process.env.HOME + "/.local/share")) + "/view.me/server/cleansers/mediaplugins");

let logStore = CreateRingBuffer(5000);

const vmServeConsole = {
    log: (...args) => { logStore.push(...args); console.log(...args); },
    error: (...args) => { logStore.push(...args); console.log(...args); }
};

app.use((req, res, next) => {
    try {
        req.logger = vmServeConsole;
        next();
    } catch (err) {
        vmServeConsole.error(err);
        const errStatus = err.statusCode || 500;
        const errMsg = err.message || 'Something went wrong';
        res.status(errStatus).json({
            success: false,
            status: errStatus,
            message: errMsg,
            stack: process.env.NODE_ENV === 'development' ? err.stack : {}
        });
    }
});

app.get('/ext/raw', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    if (!req.query.url) return res.send("");
    ffs[(req.query.method || "get").toLowerCase()](req.query.url, { responseType: "arraybuffer", ...req.query }).then(function (response) {
        if (req.query.content_type) res.set('Content-Type', req.query.content_type);
        res.send(response.data)
    }).catch(function (err) {
        vmServeConsole.error(err);
        res.status(500); res.send(err.message);
    });
});


const MediaPlugins = {};
function loadAndMediaPlugin(mediaPluginFolder, logger, name, port) {
    try {
        if (!MediaPlugins[name]) {
            const mediaPlugin = require(path.resolve(`${mediaPluginFolder}/${name}.js`));
            mediaPlugin.ffs = ffs.init({ responseType: "text" }); mediaPlugin.parse = parse; mediaPlugin.logger = logger;
            mediaPlugin.buildProxyPath = (url, params) => `http://127.0.0.1:${port}/ext/raw?method=GET&url=${url}&${params}`;
            MediaPlugins[name] = mediaPlugin;
        }
        return MediaPlugins[name];
    } catch (err) {
        logger.error(`Error loading ${name} Before checking installed folder`, err);
        try {
            const mediaPlugin = require(`../mobile/cleansers/mediaplugins/${name}`);
            mediaPlugin.ffs = ffs.init({ responseType: "text" }); mediaPlugin.parse = parse; mediaPlugin.logger = logger;
            mediaPlugin.buildProxyPath = (url, params) => `http://127.0.0.1:${port}/ext/raw?method=GET&url=${url}&${params}`;
            MediaPlugins[name] = mediaPlugin;
            return MediaPlugins[name];
        } catch (err) {
            logger.error(err);
            return Object.values(MediaPlugins)[0];
        }
    }
}

let browser, context, page;
async function jsRequiredRunner(actualUrl, req, cb) {
    if (!browser) browser = await chromium.launch();
    if (!context) context = await browser.newContext();
    const page = await context.newPage();
    await page.route('**', async route => {
        if (!route.request().url().startsWith("https://movies7.to/")) return route.abort();
        const response = await route.fetch({ maxRedirects: 0});
        let headers = response.headers();
        return route.fulfill({
            response: response,
            headers: headers
        });
    });
    try {
        await page.goto(actualUrl);
    } catch (err) {
        vmServeConsole.error(err);
        return cb(null, req);
    };
    if (req.query.element_to_wait_for) {
        try {
            await page.click(req.query.element_to_wait_for, {timeout: 9000});
        } catch (err) {
            vmServeConsole.error(err);
        };
    }
    page.content().then(async function (html, req) {
        cb(html, req);
    }).catch(function (err) {
        vmServeConsole.error(err);
        return cb(null, req);
    });
}

app.get('/ext/json', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    if (!req.query.url) return res.json([]);
    await fetchSiteData(loadAndMediaPlugin, jsRequiredRunner, MediaPluginFolder, req, res);
});

app.get('/favicon.ico', (req, res) => res.send(`success`));


// plugin setups

app.get('/mediaplugin/plugin/install', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    ffs.get(req.query.scrapper_class_location, { responseType: "text" }).then(function (response) {
        let stream1 = fs.createWriteStream(`${MediaPluginFolder}/${req.query.name}.js`);
        stream1.once('open', function () {
            stream1.write(response.data);
            stream1.end();
        });
        ffs.get(req.query.player_injection_script_location, { responseType: "text" }).then(function (response) {
            let stream2 = fs.createWriteStream(`${MediaPluginFolder}/${req.query.name}.player.js`);
            stream2.once('open', function () {
                stream2.write(response.data);
                stream2.end();
            });
            let playerInjectionScriptsMap = JSON.parse(fs.readFileSync(`${MediaPluginFolder}/PlayerInjectionScriptsMap.json`, 'utf8'));
            playerInjectionScriptsMap[req.query.name] = `${req.query.name}.player.js`;
            playerInjectionScriptsMap[req.query.base_url] = `${req.query.name}.player.js`;
            let stream3 = fs.createWriteStream(`${MediaPluginFolder}/PlayerInjectionScriptsMap.json`);
            stream3.once('open', function () {
                stream3.write(JSON.stringify(playerInjectionScriptsMap));
                stream3.end();
            });
            res.send(`{ "success": true }`);
            __CachedPlayerInjectionScripts = {};
        }).catch(function (err) {
            vmServeConsole.error(err);
            res.status(500); res.send(err.message);
        });
    }).catch(function (err) {
        vmServeConsole.error(err);
        res.status(500); res.send(err.message);
    });
});

app.get('/mediaplugin/plugin/uninstall', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    fs.unlink(`${MediaPluginFolder}/${req.query.name}.js`, (a, b) => vmServeConsole.log(a, b));
    fs.unlink(`${MediaPluginFolder}/${req.query.name}.player.js`, (a, b) => vmServeConsole.log(a, b));
    res.send(`{ "success": true }`);
    try {
        let playerInjectionScriptsMap = JSON.parse(fs.readFileSync(`${MediaPluginFolder}/PlayerInjectionScriptsMap.json`, 'utf8'));
        delete playerInjectionScriptsMap[req.query.name];
        delete playerInjectionScriptsMap[req.query.base_url];
        let stream = fs.createWriteStream(`${MediaPluginFolder}/PlayerInjectionScriptsMap.json`);
        stream.once('open', function () {
            stream.write(JSON.stringify(playerInjectionScriptsMap));
            stream.end();
        });
        __CachedPlayerInjectionScripts = {};
    } catch (err) {
        vmServeConsole.error("Unable to delete the injection script entry", err);
    }
});

let __CachedPlayerInjectionScripts = {};
function getPlayerInjectionScript(baseUrlOrName) {
    if (__CachedPlayerInjectionScripts[baseUrlOrName]) {
        try {
            return fs.readFileSync(`${MediaPluginFolder}/${__CachedPlayerInjectionScripts[baseUrlOrName]}`, 'utf8');
        } catch (err) {
            return fs.readFileSync(`../mobile/cleansers/mediaplugins/${__CachedPlayerInjectionScripts[baseUrlOrName]}`, 'utf8');
        }
    }
    try {
        vmServeConsole.log("Trying to load plugin map from: " + `${MediaPluginFolder}/PlayerInjectionScriptsMap.json:` + 
        fs.existsSync(`${MediaPluginFolder}/PlayerInjectionScriptsMap.json`), ". For base url or name:", baseUrlOrName)
        let playerInjectionScriptsMap = JSON.parse(fs.readFileSync(`${MediaPluginFolder}/PlayerInjectionScriptsMap.json`, 'utf8'));
        __CachedPlayerInjectionScripts[baseUrlOrName] = playerInjectionScriptsMap[baseUrlOrName];
        vmServeConsole.log("The name for the player is:", __CachedPlayerInjectionScripts[baseUrlOrName], "<<", playerInjectionScriptsMap)
        return fs.readFileSync(`${MediaPluginFolder}/${__CachedPlayerInjectionScripts[baseUrlOrName]}`, 'utf8');
    } catch (err) {
        try {
            vmServeConsole.log("After first Trying to load plugin map from: " + `../mobile/cleansers/mediaplugins/PlayerInjectionScriptsMap.json, with error`, err)
            let playerInjectionScriptsMap = JSON.parse(fs.readFileSync(`../mobile/cleansers/mediaplugins/PlayerInjectionScriptsMap.json`, 'utf8'));
            __CachedPlayerInjectionScripts[baseUrlOrName] = playerInjectionScriptsMap[baseUrlOrName];
            return fs.readFileSync(`${MediaPluginFolder}/${__CachedPlayerInjectionScripts[baseUrlOrName]}`, 'utf8');
        } catch (err) {
            vmServeConsole.error(err);
            return "alert('Cannot Load PlayerInjectionScriptsMap.json');"
        }
    }
}

// LOGGER

app.get('/log/json', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    return res.json(req.query.size ? logStore.buffer.splice(req.query.size) : logStore.buffer);
});

app.get('/log/text', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    return res.send((req.query.size ? logStore.buffer.splice(req.query.size) : logStore.buffer).join("\n"));
});

app.get('/log/clear', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    logStore.buffer.length = 0;
    logStore = new CreateRingBuffer(req.query.new_size || 1000);
    return res.json({ success: true });
});

// proxy for stupid devices

let finalPort = 3001;
const interfaces = os.networkInterfaces();
const addresses = [ "127.0.0.1" ];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}

app.get('/get_client_proxies', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    return res.json(addresses.map(address => `http://${address}:${finalPort}`));
});

// start server

function startExpressServer(options, cb) {
    options = options || {};
    options.port = options.port || finalPort;
    app.use('/client', express.static(options.clientLocation || "build/"));
    vmServeConsole.log(`view more middleware trying to start on port ${options.port}`);
    const listener = app.listen(options.port, () => {
        finalPort = options.port;
        prepareMediaPluginFolder();
        vmServeConsole.log(`client proxy online serving ${options.clientLocation || "build/"}`);
        vmServeConsole.log("plugin installation path", path.resolve(MediaPluginFolder));
        options.listerner = listener;
        options.vmServeConsole = vmServeConsole;
        options.listenAddress = listener.address();
        options.getPlayerInjectionScript = getPlayerInjectionScript;
        options.url = `http://${options.listenAddress.address.replace("::", "127.0.0.1")}:${options.listenAddress.port}`;
        cb(options);
    }).on('error', function(err) {
        if (options.useAnotherPort) {
            options.port++;
            return startExpressServer(options, cb);
        }
        vmServeConsole.error("START SERVER ERROR", err);
    });
    return listener;
}

function prepareMediaPluginFolder() {
    if (fs.existsSync(`${MediaPluginFolder}`)) return;
    fs.mkdirSync(`${MediaPluginFolder}`, { recursive: true });
    // create PlayerInjectionScriptsMap
    let stream1 = fs.createWriteStream(`${MediaPluginFolder}/PlayerInjectionScriptsMap.json`);
    stream1.once('open', function () {
        stream1.write(`{"Soap2DayUs":"Soap2DayUs.player.js","https://soap2day.rs":"Soap2DayUs.player.js"}`);
        stream1.end();
    });
    // install default plugin
    let stream2 = fs.createWriteStream(`${MediaPluginFolder}/Soap2DayUs.player.js`);
    stream2.once('open', function () {
        stream2.write(Soap2DayUsPlayerTrimmerHardcoded);
        stream2.end();
    });
}

module.exports = {
    startExpressServer
}

