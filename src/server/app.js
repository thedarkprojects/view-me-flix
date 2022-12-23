const ffs = require("kyofuuc");
const express = require('express');
const { useCleanser } = require("./cleansers");
const app = express()
const port = 3001

app.get('/ext/raw', (req, res) => {
    if (!req.query.url) return res.send("");
    ffs[(req.query.method || "get").toLowerCase()](req.query.url, { responseType: "text", ...req.query }).then(function (response) {
        res.set('Access-Control-Allow-Origin', '*');
        res.send(response.data)
    }).catch(function (err) {
        console.error(err);
        res.send(err);
    });
});

app.get('/ext/json', (req, res) => {
    if (!req.query.url) return res.send("");
    ffs[(req.query.method || "get").toLowerCase()](req.query.url, { responseType: "text", ...req.query }).then(function (response) {
        res.set('Access-Control-Allow-Origin', '*');
        if (req.query.clazz === "managed") {
            return res.json(JSON.parse(response.data));
        }
        res.json(useCleanser((req.query.clazz || "Soap2DayUs"), (req.query.func || "cleanMoviesList"), response.data));
    }).catch(function (err) {
        console.error(err);
        res.send(err.message);
    });
});

// client proxies

function getClientUrl(url, req, res) {
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

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})