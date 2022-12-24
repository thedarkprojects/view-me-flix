import { viewMeConsole } from "../utils";
import { BaseService } from "./BaseService";

export class RequestsService extends BaseService {

    getTopRamdomMovie() {
        return this.report(this.transport.get(`${window.location.protocol + '//' + window.location.hostname}:3001/ext/json?url=https://soap2day.rs/movie&method=GET`, { refreshCache: false }), (response) => {
            //console.log("RESPONSE:::::::::", response);
        });
    }

    search(value, page) {
        value = value.replace(/ /g, '-');
        return this.report(this.transport.get(`${window.location.protocol + '//' + window.location.hostname}:3001/ext/json?url=https://soap2day.rs/search/${value}?page=${page}&method=GET`, { refreshCache: false }), (response) => {
            //console.log("RESPONSE:::::::::", response);
        });
    }

    getGenreList(genre, page) {
        genre = genre.replace(/ /g, '-');
        const url = genre == "Popular" 
            ? "https://soap2day.rs/home" 
            : genre === "Coming-Soon" 
                ? "https://soap2day.rs/coming-soon" 
                : `https://soap2day.rs/genre/${genre}` ;
        return this.report(this.transport.get(`${window.location.protocol + '//' + window.location.hostname}:3001/ext/json?url=${url}?page=${page}&method=GET`, { refreshCache: false }), (response) => {
            //console.log("RESPONSE:::::::::", response);
        });
    }

}