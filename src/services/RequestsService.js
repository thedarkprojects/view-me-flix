import { viewMeConsole } from "../utils";
import { BaseService } from "./BaseService";

export class RequestsService extends BaseService {

    getTopRamdomMovie() {
        return this.report(this.transport.get(`${window.location.protocol + '//' + window.location.hostname}:3001/ext/json?url=https://soap2day.rs/movie&method=GET`, { refreshCache: false }), (response) => {
            //console.log("RESPONSE:::::::::", response);
        });
    }

    search(value) {
        value = value.replace(/ /g, '-');
        return this.report(this.transport.get(`${window.location.protocol + '//' + window.location.hostname}:3001/ext/json?url=https://soap2day.rs/search/${value}&method=GET`, { refreshCache: false }), (response) => {
            //console.log("RESPONSE:::::::::", response);
        });
    }

}