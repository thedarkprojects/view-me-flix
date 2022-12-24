
const Soap2DayUs = require("./Soap2DayUs");

function useCleanser(clazzName, func, html) {
    if (clazzName.toLowerCase() === "soap2dayus") return Soap2DayUs[func](html);
    return {};
}

module.exports = {
    useCleanser
};

/*

JSON Spec

{
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

