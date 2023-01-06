const ffs = require("kyofuuc");
const chromium = {};

async function useCleanser(loadAndMediaPlugin, mediaPluginFolder, logger, port, clazzName, func, html, url, cb) {
    const clazz = await loadAndMediaPlugin(mediaPluginFolder, logger, clazzName, port);
    return await clazz[func](html, url, cb);
}

async function fetchSiteData(loadAndMediaPlugin, jsRequiredRunner, mediaPluginFolder, req, res, isRetry) {
    const actualUrl = req.query.url = (Array.isArray(req.query.url) ? req.query.url.reduce((_, r) => (r.startsWith('http') ? r : ""), "") : req.query.url);
    const relayParams = Object.keys(req.query).reduce((acc, query) => {
        if (query.includes("clazz") || query.includes("func") || query.includes("method") || query.includes("url") 
            || query.includes("requires_js") || query.includes("element_to_wait_for")) {
            return acc;
        }
        acc[query] = req.query[query];
        return acc;
    }, {});
    if (req.query.requires_js) {
        console.log("USING PLAYWRIGHT => ", req.query, actualUrl, relayParams);
        try {
            jsRequiredRunner(actualUrl + "?" + new URLSearchParams(relayParams), req, async (html) => {
                if (req.query.clazz === "managed") return res.json(JSON.parse(response.data));
                useCleanser(loadAndMediaPlugin, mediaPluginFolder, req.logger, req.socket.localPort, (req.query.clazz || "Soap2DayUs"), (req.query.func || "cleanMoviesList"), html, actualUrl, (result) => {
                    return res.json(result);
                }).catch(function (err) {
                    req.logger.error("fetchSiteData.useCleanser", err);
                    res.json([]);
                });
            });
        } catch (err) {
            if (!isRetry) {
                context = browser = page = null;
                fetchSiteData(loadAndMediaPlugin, jsRequiredRunner, mediaPluginFolder, req, res, true);
                return;
            }
            req.logger.error(err);
            return res.json([]);
        }
    } else {
        console.log("USING KYOFUUC => ", req.query, actualUrl, relayParams);
        ffs[(req.query.method || "get").toLowerCase()](actualUrl, { responseType: "text", params: relayParams }).then(async function (response) {
            if (req.query.clazz === "managed") return res.json(JSON.parse(response.data));
            useCleanser(loadAndMediaPlugin, mediaPluginFolder, req.logger, req.socket.localPort, (req.query.clazz || "Soap2DayUs"), (req.query.func || "cleanMoviesList"), response.data, actualUrl, (result) => {
                return res.json(result);
            }).catch(function (err) {
                req.logger.error("fetchSiteData.useCleanser", err);
                res.json([]);
            });
        }).catch(function (err) {
            req.logger.error(err);
            return res.json([]);
        });
    }
}

const Soap2DayUsPlayerTrimmerHardcoded = `
let getSiblings = n => [...n.parentElement.children].filter(c=>c!=n)
function removeElementExcept(survivor) {
    if (!survivor) return;
    const parent = survivor.parentElement;
    if (survivor === document || !parent) return;
    const siblings = getSiblings(survivor);
    for (const sibling of siblings) {
    if (sibling.tagName === 'HEAD') continue;
        sibling.remove();
    }
    removeElementExcept(parent);
}
const playerElement = document.getElementsByClassName('watching_player-area')[0];
removeElementExcept(playerElement);
//document.getElementById("overlay-center").remove();
`;

module.exports = {
    useCleanser,
    fetchSiteData,
    Soap2DayUsPlayerTrimmerHardcoded
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

