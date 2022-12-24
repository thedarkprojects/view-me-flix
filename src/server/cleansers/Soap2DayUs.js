const { default: parse } = require("node-html-parser");

module.exports = class Soap2DayUs {

    static cleanMoviesList(html) {
        const result = [];
        const root = parse(html);
        const movies = root.querySelectorAll('.flw-item');
        for (const movie of movies) {
            const fileNameEL = movie.querySelector('.film-name');
            result.push({
                title: fileNameEL.text.trim(),
                media_link: fileNameEL.querySelector('a').getAttribute("href"),
                preview_image: movie.querySelector('img').getAttribute("data-src")
            });
        }
        //console.log("RESULT", result);
        return result;
    }

}
