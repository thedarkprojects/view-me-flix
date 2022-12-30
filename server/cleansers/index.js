
const ffs = require("kyofuuc");
const { chromium, devices } = require("playwright");

const MediaPlugins = {};

function loadAndMediaPlugin(name, port) {
    try {
        if (!MediaPlugins[name]) {
            const mediaPlugin = require(`./mediaplugins/${name}`);
            mediaPlugin.buildProxyPath = (url, params) => `http://127.0.0.1:${port}/ext/raw?method=GET&url=${url}&${params}`;
            MediaPlugins[name] = mediaPlugin;
        }
        return MediaPlugins[name];
    } catch (err) {
        console.error(err);
        return Object.values(MediaPlugins)[0];
    }
}

async function useCleanser(port, clazzName, func, html, url, cb) {
    const clazz = loadAndMediaPlugin(clazzName, port);
    return await clazz[func](html, url, cb);
}

let browser, context, page;
async function fetchSiteData(req, res, isRetry) {
    const actualUrl = req.query.url = (Array.isArray(req.query.url) ? req.query.url.reduce((_, r) => (r.startsWith('http') ? r : ""), "") : req.query.url);
    if (req.query.requires_js) {
        console.log("USING PLAYWRIGHT => ", actualUrl, req.query);
        try {
            if (!browser) browser = await chromium.launch();
            if (!context) context = await browser.newContext();
            if (!page) page = await context.newPage();
            await page.goto(actualUrl);
            page.content().then(async function (html) {
                if (req.query.clazz === "managed") return res.json(JSON.parse(response.data));
                useCleanser(req.socket.localPort, (req.query.clazz || "Soap2DayUs"), (req.query.func || "cleanMoviesList"), html, actualUrl, (result) => {
                    return res.json(result);
                }).catch(function (err) {
                    console.error("fetchSiteData.useCleanser", err);
                    res.json([]);
                });
            }).catch(function (err) {
                console.error(err);
                return res.send([]);
            });
        } catch (err) {
            if (!isRetry) {
                context = browser = page = null;
                fetchSiteData(req, res, true);
                return;
            }
            return res.send([]);
        }
    } else {
        console.log("USING KYOFUUC => ", actualUrl, req.query);
        ffs[(req.query.method || "get").toLowerCase()](actualUrl, { responseType: "text", ...req.query }).then(async function (response) {
            if (req.query.clazz === "managed") return res.json(JSON.parse(response.data));
            useCleanser(req.socket.localPort, (req.query.clazz || "Soap2DayUs"), (req.query.func || "cleanMoviesList"), response.data, actualUrl, (result) => {
                return res.json(result);
            }).catch(function (err) {
                console.error("fetchSiteData.useCleanser", err);
                res.json([]);
            });
        }).catch(function (err) {
            console.error(err);
            return res.send([]);
        });
    }
}

module.exports = {
    useCleanser,
    fetchSiteData
};

/*

JSON Spec

{
    type: "show",
    "title": "Aftersun",
    "trailer": "https://youtube/link",
    "release_date": "2022-10-21",
    "genres": [
        "drama",
        "comedy"
    ],
    "countries": [
        "Turkey",
        "United States of America",
        "United Kingdom"
    ],
    "casts": [
        "Paul Mescal",
        "Spike Fearn",
        "John Stuifzand",
        "Frank Corio",
        "Ruby Thompson"
    ],
    "preview_image": "https://image.links.png.........",
    "images": [
        "https://image.links.png........."
    ],
    "synopsis": "Sophie reflects on the shared joy and private melancholy..."
    "media_link": "https://linkg.view/......",
    "extra_data": {

    }
}

extra_data can carry suplementary objects


*/

