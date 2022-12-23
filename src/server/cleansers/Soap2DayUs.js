const { default: parse } = require("node-html-parser");


module.exports = class Soap2DayUs {

    static cleanMoviesList(html) {
        const result = [];
        const root = parse(html);
        const movies = root.querySelectorAll('.flw-item');
        for (const movie of movies) {
            result.push({
                title: movie.querySelector('.film-name').text.trim(),
                preview_image: movie.querySelector('img').getAttribute("data-src")
            });
        }
        return result;
    }


}
