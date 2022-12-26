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
    ffs[(req.query.method || "get").toLowerCase()](req.query.url, { responseType: "text", ...req.query }).then(function (response) {
        res.send(response.data)
    }).catch(function (err) {
        console.error(err);
        res.send(err);
    });
});

app.get('/ext/json', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    if (!req.query.url) return res.send("");
    await fetchSiteData(req, res);
});

// client proxies

function getClientUrl(url, req, res) {
    res.set('Access-Control-Allow-Origin', '*');
    ffs.get(url, { responseType: "text", ...req.query }).then(function (response) {
        res.send(response.data)
    }).catch(function (err) {
        console.error(err);
        res.send("Error: the vm client is not started");
    });
}

app.get('/client', (req, res) => {
    const url = req.protocol + '://' + req.get('host').replace("3001", "3000");
    res.send(`<body style="margin: 0px;"><iframe style="width: 100vw; height: 100vh; border: none;" src="${url}"></iframe></body>`)
});

app.get('/**', (req, res) => {
    const url = req.protocol + '://' + req.get('host').replace("3001", "3000") + req.originalUrl;
    getClientUrl(url, req, res);
});

app.get('/dashboard', (req, res) => {
    ffs.get("https://soap2day.rs/movie", { responseType: "text" }).then(function (response) {
        console.log(response);
        res.send(response.data)
    }).catch(function (err) {
        console.log('Fetch Error :-S', err);
    });
})

function startExpressServer(options, cb) {
    options = options || {};
    options.port = options.port || 3001;
    console.log(`view more middleware trying to start on port ${options.port}`);
    const listener = app.listen(options.port, () => {
        options.listerner = listener;
        options.listenAddress = listener.address();
        options.url = `http://${options.listenAddress.address.replace("::", "[::]")}:${options.listenAddress.port}`;
        cb(options);
    }).on('error', function(err) {
        if (options.useAnotherPort) {
            options.port++;
            startExpressServer(options, cb);
            return;
        }
        console.error("START SERVER ERROR", err);
    });
}

module.exports = {
    startExpressServer
}