
const ffs = require("kyofuuc");
const Soap2DayUs = require("./Soap2DayUs");
const { chromium, devices } = require("playwright");

async function useCleanser(clazzName, func, html, url) {
    if (clazzName.toLowerCase() === "soap2dayus") return await Soap2DayUs[func](html, url);
    return {};
}

let browser, context, page;
async function fetchSiteData(req, res, isRetry) {
    if (req.query.requires_js) {
        console.log("USING PLAYWRIGHT => ", req.query);
        try {
            if (!browser) browser = await chromium.launch();
            if (!context) context = await browser.newContext();
            if (!page) page = await context.newPage();
            await page.goto(req.query.url);
            page.content().then(async function (html) {
                return res.json(await useCleanser((req.query.clazz || "Soap2DayUs"), (req.query.func || "cleanMoviesList"), html, req.query.url));
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
        console.log("USING KYOFUUC => ", req.query);
        ffs[(req.query.method || "get").toLowerCase()](req.query.url, { responseType: "text", ...req.query }).then(async function (response) {
            if (req.query.clazz === "managed") {
                return res.json(JSON.parse(response.data));
            }
            return res.json(await useCleanser((req.query.clazz || "Soap2DayUs"), (req.query.func || "cleanMoviesList"), response.data, req.query.url));
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

