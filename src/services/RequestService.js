import { Database, viewMeConsole } from "../utils";
import { BaseService } from "./BaseService";

export class RequestService extends BaseService {

    search(value, page) {
        value = value.replace(/ /g, '-');
        return this.report(this.aggregateListFromSites(Database.getMediaUrls(this.user).search.map(v => v.format(value)), { params: { page }}, true), (response) => {
            //console.log("RESPONSE:::::::::", response);
        });
    }

    getPopularComingSoonOrGenreLink(genre) {
        const urls = Database.getMediaUrls(this.user);
        genre = genre.replace(/& /g,'').replace(/\s/g, '-');
        return genre == "Popular"
            ? urls.popular
            : genre === "Coming-Soon"
                ? urls.coming_soon
                : urls.genre.map(genreUrl => genreUrl.format(genre)) ;
    }

    getGenreList(genre, page) {
        const urls = this.getPopularComingSoonOrGenreLink(genre);
        return this.report(this.aggregateListFromSites(urls, { params: { page }}, true));
    }

    getCastList(cast, page) {
        cast = cast.replace(/& /g,'').replace(/\s/g, '-');
        return this.report(this.aggregateListFromSites(Database.getMediaUrls(this.user).cast.map(v => v.format(cast)), { params: { page }}, true));
    }

    getMoviesList(page) {
        return this.report(this.aggregateListFromSites(Database.getMediaUrls(this.user).movies, { params: { page }}, true));
    }

    getTvShowsList(page) {
        return this.report(this.aggregateListFromSites(Database.getMediaUrls(this.user).tv_shows, { params: { page }}, true));
    }

    getMovieDetail(url, source) {
        return this.report(this.transport.get(`${this.baseUrl}/ext/json?url=${url}&method=GET&requires_js=true&func=cleanMoviePage`, 
            { refreshCache: false }), (response) => {
                response.data.similarMovies = this.shuffleArray(response.data.similarMovies || []);
        });
    }

    getMediaPlugins() {
        return this.report(this.transport.get("http://127.0.0.1:9002/mediaplugins/registry.json"));
    }

}