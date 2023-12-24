import { Database, viewMeConsole } from "../utils";
import { BaseService } from "./BaseService";

export class RequestService extends BaseService {

    search(value, page) {
        value = value.replace(/ /g, '-');
        return this.report(this.aggregateListFromSites(Database.getMediaUrls(this.user).search.map(v => v.format(value, page)), { params: { page }}, true), (response) => {
            //console.log("RESPONSE:::::::::", response);
        });
    }

    getPopularComingSoonOrGenreLink(genre, page = 1) {
        genre = genre.label + genre.aliases.join("&");
        const urls = Database.getMediaUrls(this.user);
        genre = genre.replace(/& /g,'').replace(/\s/g, '-');
        return genre == "Popular"
            ? urls.popular
            : genre === "Coming-Soon"
                ? urls.coming_soon
                : urls.genre.map(genreUrl => genreUrl.format(genre, page)) ;
    }

    getGenreList(genre, page) {
        const urls = this.getPopularComingSoonOrGenreLink(genre, page);
        return this.report(this.aggregateListFromSites(urls, { params: { page }}, true));
    }

    getCastList(cast, page) {
        cast = cast.replace(/& /g,'').replace(/\s/g, '-');
        return this.report(this.aggregateListFromSites(Database.getMediaUrls(this.user).cast.map(v => v.format(cast, page)), { params: { page }}, true));
    }

    getMoviesList(page) {
        const urls = Database.getMediaUrls(this.user).movies.map(url => url.format(page));
        return this.report(this.aggregateListFromSites(urls, { params: { page }}, true));
    }

    getTvShowsList(page) {
        const urls = Database.getMediaUrls(this.user).tv_shows.map(url => url.format(page));
        return this.report(this.aggregateListFromSites(urls, { params: { page }}, true));
    }

    getMovieDetail(url, scrapperClass) {
        const elementToWaitFor = encodeURIComponent(Database.getMediaSourcByScrapperClassName(scrapperClass)[0].element_to_wait_for || "");
        console.log(">>>>>>>>>>|||||||||||", elementToWaitFor);
        return this.report(this.transport.get(`${BaseService.BaseUrl}/ext/json?url=${url}&method=GET&requires_js=true&func=cleanMoviePage&clazz=${scrapperClass}&element_to_wait_for=${elementToWaitFor}`, 
            { refreshCache: false }), (response) => {
                response.data.similarMovies = this.shuffleArray(response.data.similarMovies || []);
        });
    }

    getMiddlewareLog() {
        return this.report(this.transport.get(`${BaseService.BaseUrl}/log/text`, { responseType: "text" }));
    }

    clearMiddlewareLog() {
        return this.report(this.transport.get(`${BaseService.BaseUrl}/log/clear`));
    }

    getMediaPlugins(pluginHost) {
        return this.report(this.transport.get(`${pluginHost}/mediaplugins/registry.json`));
    }

    buildMediaPluginConfig(baseUrl, mediaPlugin) {
        return { responseType: "text", params: {
            base_url: mediaPlugin.base_url,
            name: mediaPlugin.scrapper_class_name,
            scrapper_class_location: baseUrl + mediaPlugin.scrapper_class_location,
            player_injection_script_location: baseUrl + mediaPlugin.player_injection_script_location
        }};
    }

    installMediaSource(baseUrl, mediaPlugin) {
        return this.report(this.transport.get(`${BaseService.BaseUrl}/mediaplugin/plugin/install`, this.buildMediaPluginConfig(baseUrl, mediaPlugin)));
    }

    unInstallMediaSource(baseUrl, mediaPlugin) {
        return this.report(this.transport.get(`${BaseService.BaseUrl}/mediaplugin/plugin/uninstall`, this.buildMediaPluginConfig(baseUrl, mediaPlugin)));
    }

    getClientProxyAddress() {
        return this.report(this.transport.get(`${BaseService.BaseUrl}/get_client_proxies`));
    }

    getAvailableLanguages(pluginHost) {
        return this.report(this.transport.get(`${pluginHost}/languages/registry.json`));
    }

    getLanguageData(providerUrl, language) {
        return this.report(this.transport.get(`${providerUrl}${language.location}`));
    }

    checkForUpdate(providerUrl) {
        return this.report(this.transport.get(`${providerUrl}/versioner.json`));
    }

}