const { default: parse } = require("node-html-parser");

module.exports = class Soap2DayUs {

    // base
    static cleanMoviesList(html) {
        const result = [];
        const root = parse(html);
        const movies = root.querySelectorAll('.flw-item');
        for (const movie of movies) {
            const fileNameEL = movie.querySelector('.film-name');
            const medialLink = fileNameEL.querySelector('a').getAttribute("href");//
            result.push({
                source: "soap2day.rs",
                title: fileNameEL.text.trim(),
                media_link: medialLink.startsWith("/") ? `https://soap2day.rs${medialLink}` : medialLink,
                type: medialLink.includes("/tv") ? "show" : "movie",
                preview_image: movie.querySelector('img').getAttribute("data-src")
            });
        }
        //console.log("RESULT", result);
        return result;
    }

}
