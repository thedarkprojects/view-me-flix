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
        res.send(err.message);
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
        var stream = fs.createWriteStream(`server/cleansers/mediaplugins/${req.query.name}.js`);
        stream.once('open', function () {
            stream.write(response.data);
            stream.end();
        });
        ffs.get(req.query.player_injection_script_location, { responseType: "text" }).then(function (response) {
            var stream = fs.createWriteStream(`server/cleansers/mediaplugins/${req.query.name}.player.js`);
            stream.once('open', function () {
                stream.write(response.data);
                stream.end();
            });
            res.send("{ success: true }")
        }).catch(function (err) {
            console.error(err);
            res.send(err.message);
        });
    }).catch(function (err) {
        console.error(err);
        res.send(err.message);
    });
});

app.get('/mediaplugin/plugin/uninstall', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    fs.unlink(`server/cleansers/mediaplugins/${req.query.name}.js`, (a, b) => console.log(a, b));
    fs.unlink(`server/cleansers/mediaplugins/${req.query.name}.player.js`, (a, b) => console.log(a, b));
    res.send("{ success: true }");
});

function startExpressServer(options, cb) {
    options = options || {};
    options.port = options.port || 3001;
    console.log(`view more middleware trying to start on port ${options.port}`);
    const listener = app.listen(options.port, () => {
        options.listerner = listener;
        options.listenAddress = listener.address();
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

