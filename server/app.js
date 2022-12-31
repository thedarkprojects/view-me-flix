const fs = require('fs');
const ffs = require("kyofuuc");
const express = require('express');
const { fetchSiteData } = require("./cleansers");
const app = express();


app.use((err, req, res, next) => {
    console.log("Middleware Error Hadnling");
    const errStatus = err.statusCode || 500;
    const errMsg = err.message || 'Something went wrong';
    res.status(errStatus).json({
        success: false,
        status: errStatus,
        message: errMsg,
        stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    })
})

app.get('/ext/raw', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    if (!req.query.url) return res.send("");
    ffs[(req.query.method || "get").toLowerCase()](req.query.url, { responseType: "arraybuffer", ...req.query }).then(function (response) {
        if (req.query.content_type) res.set('Content-Type', req.query.content_type);
        res.send(response.data)
    }).catch(function (err) {
        console.error(err);
        res.status(500); res.send(err.message);
    });
});

app.get('/ext/json', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    if (!req.query.url) return res.json([]);
    await fetchSiteData(req, res);
});

app.get('/favicon.ico', (req, res) => res.send(`success`));


// tests

app.get('/mediaplugin/plugin/install', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    ffs.get(req.query.scrapper_class_location, { responseType: "text" }).then(function (response) {
        let stream1 = fs.createWriteStream(`server/cleansers/mediaplugins/${req.query.name}.js`);
        stream1.once('open', function () {
            stream1.write(response.data);
            stream1.end();
        });
        ffs.get(req.query.player_injection_script_location, { responseType: "text" }).then(function (response) {
            let stream2 = fs.createWriteStream(`server/cleansers/mediaplugins/${req.query.name}.player.js`);
            stream2.once('open', function () {
                stream2.write(response.data);
                stream2.end();
            });
            const playerInjectionScriptsMap = JSON.parse(fs.readFileSync('server/cleansers/mediaplugins/PlayerInjectionScriptsMap.json', 'utf8'));
            playerInjectionScriptsMap[req.query.name] = `${req.query.name}.player.js`;
            playerInjectionScriptsMap[req.query.base_url] = `${req.query.name}.player.js`;
            let stream3 = fs.createWriteStream('server/cleansers/mediaplugins/PlayerInjectionScriptsMap.json');
            stream3.once('open', function () {
                stream3.write(JSON.stringify(playerInjectionScriptsMap));
                stream3.end();
            });
            res.send(`{ "success": true }`);
            __CachedPlayerInjectionScripts = {};
        }).catch(function (err) {
            console.error(err);
            res.status(500); res.send(err.message);
        });
    }).catch(function (err) {
        console.error(err);
        res.status(500); res.send(err.message);
    });
});

app.get('/mediaplugin/plugin/uninstall', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    fs.unlink(`server/cleansers/mediaplugins/${req.query.name}.js`, (a, b) => console.log(a, b));
    fs.unlink(`server/cleansers/mediaplugins/${req.query.name}.player.js`, (a, b) => console.log(a, b));
    res.send(`{ "success": true }`);
    let playerInjectionScriptsMap = {};
    try {
        playerInjectionScriptsMap = JSON.parse(fs.readFileSync('server/cleansers/mediaplugins/PlayerInjectionScriptsMap.json', 'utf8'));
        delete playerInjectionScriptsMap[req.query.name];
        delete playerInjectionScriptsMap[req.query.base_url];
        let stream = fs.createWriteStream('server/cleansers/mediaplugins/PlayerInjectionScriptsMap.json');
        stream.once('open', function () {
            stream.write(JSON.stringify(playerInjectionScriptsMap));
            stream.end();
        });
        __CachedPlayerInjectionScripts = {};
    } catch (err) {
        console.error("Unable to delete the injection script entry", err);
    }
});

let __CachedPlayerInjectionScripts = {};
function getPlayerInjectionScript(baseUrlOrName) {
    if (__CachedPlayerInjectionScripts[baseUrlOrName]) {
        return fs.readFileSync(`server/cleansers/mediaplugins/${__CachedPlayerInjectionScripts[baseUrlOrName]}`, 'utf8');
    }
    try {
        const playerInjectionScriptsMap = JSON.parse(fs.readFileSync('server/cleansers/mediaplugins/PlayerInjectionScriptsMap.json', 'utf8'));
        __CachedPlayerInjectionScripts[baseUrlOrName] = playerInjectionScriptsMap[baseUrlOrName];
        return fs.readFileSync(`server/cleansers/mediaplugins/${__CachedPlayerInjectionScripts[baseUrlOrName]}`, 'utf8');
    } catch (err) {
        console.error(err);
        return "alert('Cannot Load PlayerInjectionScriptsMap.json');"
    }
}

function startExpressServer(options, cb) {
    options = options || {};
    options.port = options.port || 3001;
    console.log(`view more middleware trying to start on port ${options.port}`);
    const listener = app.listen(options.port, () => {
        options.listerner = listener;
        options.listenAddress = listener.address();
        options.getPlayerInjectionScript = getPlayerInjectionScript;
        options.url = `http://${options.listenAddress.address.replace("::", "127.0.0.1")}:${options.listenAddress.port}`;
        cb(options);
    }).on('error', function(err) {
        if (options.useAnotherPort) {
            options.port++;
            return startExpressServer(options, cb);
        }
        console.error("START SERVER ERROR", err);
    });
    return listener;
}

module.exports = {
    startExpressServer
}

