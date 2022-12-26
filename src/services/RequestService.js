import { viewMeConsole } from "../utils";
import { BaseService } from "./BaseService";

export class RequestService extends BaseService {

    getTopRamdomMovie() {
        return this.report(this.transport.get(`${this.baseUrl}/ext/json?url=https://soap2day.rs/movie&method=GET`, { refreshCache: false }), (response) => {
            //console.log("RESPONSE:::::::::", response);
        });
    }

    search(value, page) {
        value = value.replace(/ /g, '-');
        return this.report(this.transport.get(`${this.baseUrl}/ext/json?url=https://soap2day.rs/search/${value}?page=${page}&method=GET`, { refreshCache: false }), (response) => {
            //console.log("RESPONSE:::::::::", response);
        });
    }

    getGenreList(genre, page) {
        genre = genre.replace(/& /g,'').replace(/\s/g, '-');
        const url = genre == "Popular" 
            ? "https://soap2day.rs/home" 
            : genre === "Coming-Soon" 
                ? "https://soap2day.rs/coming-soon" 
                : `https://soap2day.rs/genre/${genre}` ;
        return this.report(this.transport.get(`${this.baseUrl}/ext/json?url=${url}?page=${page}&method=GET`, { refreshCache: false }), (response) => {
            //console.log("RESPONSE:::::::::", response);
        });
    }

    getCastList(cast, page) {
        cast = cast.replace(/& /g,'').replace(/\s/g, '-');
        const url = `https://soap2day.rs/cast/${cast}` ;
        return this.report(this.transport.get(`${this.baseUrl}/ext/json?url=${url}?page=${page}&method=GET`, { refreshCache: false }), (response) => {
            //console.log("RESPONSE:::::::::", response);
        });
    }

    getMoviesList(page) {
        const url = "https://soap2day.rs/movie" ;
        return this.report(this.transport.get(`${this.baseUrl}/ext/json?url=${url}?page=${page}&method=GET`, { refreshCache: false }), (response) => {
            //console.log("RESPONSE:::::::::", response);
        });
    }

    getTvShowsList(page) {
        const url = "https://soap2day.rs/tv-show" ;
        return this.report(this.transport.get(`${this.baseUrl}/ext/json?url=${url}?page=${page}&method=GET`, { refreshCache: false }), (response) => {
            //console.log("RESPONSE:::::::::", response);
        });
    }

    getMovieDetail(url, source) {
        return this.report(this.transport.get(`${this.baseUrl}/ext/json?url=${url}&method=GET&requires_js=true&func=cleanMoviePage`, 
            { refreshCache: false }), (response) => {
                //console.log("RESPONSE:::::::::", response);
                response.data.similarMovies = this.shuffleArray(response.data.similarMovies || []);
        });
    }

}