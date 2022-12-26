const { default: parse } = require("node-html-parser");

module.exports = class Soap2DayUs {

    static buildFullUrl(part) {
        return part.startsWith("/") ? `https://soap2day.rs${part}` : part;
    }

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
                media_link: Soap2DayUs.buildFullUrl(medialLink),
                type: medialLink.includes("/tv") ? "show" : "movie",
                preview_image: movie.querySelector('img').getAttribute("data-src")
            });
        }
        return result;
    }

    // base
    static cleanMoviePage(html) {
        const result = {};
        const servers = [];
        const seasons = [];
        const similarMovies = [];
        const root = parse(html);
        result.source = "soap2day.rs";
        result.synopsis = root.querySelector(".section-description").querySelector("p").text.trim();

        const dpes = root.querySelectorAll('.dp-element');
        for (const dpe of dpes) {
            const dpeText = dpe.text.replace(/\s\s+/g, '');
            if (dpeText.includes("Title:")) result.title = dpeText.substring(6).trim();
            if (dpeText.includes("Released:")) result.release_date = dpeText.substring(9).trim();
            if (dpeText.includes("Genre:")) result.genres = dpeText.substring(6).trim().split(",").filter(n => n);
            if (dpeText.includes("Casts:")) result.casts = dpeText.substring(6).trim().split(",").filter(n => n);
        }

        const movies = root.querySelectorAll('.flw-item');
        for (const movie of movies) {
            const fileNameEL = movie.querySelector('.film-name');
            const medialLink = fileNameEL.querySelector('a').getAttribute("href");
            similarMovies.push({
                source: "soap2day.rs",
                title: fileNameEL.text.trim(),
                media_link: medialLink.startsWith("/") ? `https://soap2day.rs${medialLink}` : medialLink,
                type: medialLink.includes("/tv") ? "show" : "movie",
                preview_image: movie.querySelector('img').getAttribute("data-src")
            });
        }
        result.similarMovies = similarMovies;

        const serversEls = root.querySelector(".dp-s-line").querySelectorAll('.nav-item');
        for (const server of serversEls) {
            const link = server.querySelector("a");
            servers.push({
                name: link.text.trim(),
                link: Soap2DayUs.buildFullUrl(link.getAttribute("href"))
            });
        }
        result.servers = servers;

        const seasonsEls = root.querySelector(".slt-seasons-dropdown")?.querySelectorAll('a');
        for (const seasonEl of (seasonsEls || [])) {
            const link = seasonEl;
            seasons.push({
                name: link.text.trim(),
                episodes: [

                ]
            });
        }
        result.seasons = seasons;
        return result;
    }

}
