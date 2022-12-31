
const lzString = require('lz-string');

const Database = {

    _encryptor: (v) => lzString.compress(v),
    _decryptor: (v) => lzString.decompress(v),
    _cacheImpl: null,

    _genres: [
        "Popular",
        "Action",
        "Action & Adventure",
        "Adventure",
        "Animation",
        "Biography",
        "Comedy",
        "Crime",
        "Documentary",
        "Drama",
        "Family",
        "Fantasy",
        "History",
        "Horror",
        "Kids",
        "Music",
        "Mystery",
        "News",
        "Coming Soon",

        "Shounen"
    ],

    _mediaSources: [
        {
            active: true,
            name: "Soap2day.rs",
            author: "Theotherguy",
            base_url: "https://soap2day.rs",
            scrapper_class_name: "Soap2DayUs",
            scrapper_class_location: "https://github-link.js.file",
            player_injection_script_location: "https://github-link.js.file",
            urls: {
                popular: "https://soap2day.rs/home",
                movies: "https://soap2day.rs/movie",
                cast: "https://soap2day.rs/cast/{0}",
                genre: "https://soap2day.rs/genre/{0}",
                tv_shows: "https://soap2day.rs/tv-show",
                search: "https://soap2day.rs/search/{0}",
                coming_soon: "https://soap2day.rs/coming-soon",
            }
        }
    ],

    __Tables: ["view.me.users", "view.me.favourites", "view.me.actively-watching", "view.me.settings.media.sources", 
            "view.me.settings.plugin.host"],

    /** The Database Encryption Interface */

    setEncryptor(encryptor) {
        Database._encryptor = encryptor;
    },

    setDecryptor(decryptor) {
        Database._decryptor = decryptor;
    },

    /** The Database Engine Interface */

    setCacheImpl(cacheImpl) {
        Database._cacheImpl = cacheImpl;
    },

    inCache(key) {
        const item = Database._cacheImpl.getItem(key);
        return (item !== null && item !== "")
    },

    removeFromCache(key) {
        Database._cacheImpl.removeItem(key);
    },

    unsafelyCacheString(key, value) {
        Database._cacheImpl.setItem(key, (Database._encryptor ? Database._encryptor(value) : value))
    },

    cacheString(key, value) {
        Database._cacheImpl.setItem(key, (Database._encryptor ? Database._encryptor(value) : value))
    },

    cacheNumber(key, number) {
        Database.cacheString(key, "" + number)
    },

    cacheObject(key, object) {
        Database.cacheString(key, JSON.stringify(object))
    },

    unsafelyCacheObject(key, object) {
        Database.unsafelyCacheString(key, JSON.stringify(object))
    },

    stringFromCache(key, fallback) {
        if (!Database.inCache(key)) return fallback;
        const item = Database._cacheImpl.getItem(key);
        return Database._decryptor ? Database._decryptor(item) : item;
    },

    objectFromCache(key, fallback) {
        if (!Database.inCache(key)) return fallback;
        try {
            const item = Database.stringFromCache(key);
            return !item || item === "undefined" ? fallback : JSON.parse(item);
        } catch (error) {
            console.error(error);
        }
        return (fallback ? fallback : null);
    },

    numberFromCache(key, fallback) {
        return parseInt(Database.stringFromCache(key, fallback))
    },

    clearCache() {
        Database._cacheImpl.clear();
    },

    /** The Database Implementation */

    queryMatch(record, queries, relation = "OR") {
        relation = relation.toUpperCase();
        let queryMatcheCount = 0;
        for (const query of (queries || [])) {
            query.op = (query.op || "").toLowerCase();
            if ((query.op === "!=" || query.op === "nq") && (record[query.field] !== query.value)) if (relation === "OR") { return true } else { queryMatcheCount++ };
            if ((query.op === "LIKE" || query.op === "contains") && (record[query.field].includes(query.value))) if (relation === "OR") { return true } else { queryMatcheCount++ };
            if ((query.op === "RLIKE" || query.op === "endswith") && (record[query.field].endsWith(query.value))) if (relation === "OR") { return true } else { queryMatcheCount++ };
            if ((query.op === "LLIKE" || query.op === "startswith") && (record[query.field].startsWith(query.value))) if (relation === "OR") { return true } else { queryMatcheCount++ };
            if (record[query.field] === query.value) if (relation === "OR") { return true } else { queryMatcheCount++ };
        }
        return queryMatcheCount === queries.length;
    },

    saveRecords(tableName, records) {
        Database.cacheObject(tableName, records);
        return records;
    },

    getRecords(tableName, queries, relation) {
        const records = Array.isArray(tableName) ? tableName : Database.objectFromCache(tableName, []);
        if (!queries || !queries.length) {
            return records;
        }
        return records.filter(record => Database.queryMatch(record, queries, relation));
    },

    indexInRecord(tableName, queries, relation) {
        const records = Array.isArray(tableName) ? tableName : Database.objectFromCache(tableName, []);
        let index = -1;
        for (const query of queries) {
            index = records.findIndex(x => {
                query.op = (query.op || "").toLowerCase();
                if (query.op === "!=" || query.op === "nq") return x[query.field] !== query.value;
                if (query.op === "LIKE" || query.op === "contains") return x[query.field].includes(query.value);
                if (query.op === "RLIKE" || query.op === "endswith")  return x[query.field].endsWith(query.value);
                if (query.op === "LLIKE" || query.op === "startswith")  return x[query.field].startsWith(query.value);
                return x[query.field] === query.value;
            });
            if (index > -1) return index;
        }
        return index;
    },

    findInRecord(tableName, queries) {
        const records = Array.isArray(tableName) ? tableName : Database.getRecords(tableName, queries, "AND");
        return records[0];
    },

    existInRecord(tableName, queries) {
        return Database.getRecords(tableName, queries, "AND").length > 0;
    },

    addToRecord(tableName, newRecord) {
        const records = Array.isArray(tableName) ? tableName : Database.objectFromCache(tableName, []);
        if (newRecord.id) return Database.updateInRecord(tableName, newRecord);
        newRecord.id = (records.length ? records[records.length-1].id + 1: records.length+1);
        records.push(newRecord);
        Database.cacheObject(tableName, records);
        return records;
    },

    updateInRecord(tableName, record) {
        const records = Database.deleteFromRecord(tableName, record);
        records.splice(record.id-1, 0, record);
        Database.cacheObject(tableName, records);
        return records;
    },

    deleteFromRecord(tableName, record, queries) {
        const records = Database.getRecords(tableName);
        const index = queries ? Database.indexInRecord(tableName, queries): records.findIndex(x => x.id === record.id);
        records.splice(index, 1);
        return Database.saveRecords(tableName, records);
    },

    /* Middleware records */

    setMiddlewareUrl(url) {
        Database.cacheString("view.me.middleware.url", url);
        return url;
    },

    getMiddlewareUrl() {
        return Database.stringFromCache("view.me.middleware.url", "http://127.0.0.1:3001");
    },

    /** User Record */

    getUsers(plus_add) {
        /*return [
            { id: 1, username: "Thecarisma", color_scheme: "red", profile_piture: 'https://avatars.githubusercontent.com/u/14879387' },
            { id: 2, username: "Grace", color_scheme: "green", profile_piture: null },
        ]*/
        const users = Database.getRecords("view.me.users");
        users.push({
            id: 0,
            username: "Add Profile",
            profile_piture: plus_add,
            color_scheme: "transparent"
        });
        return users;
    },

    addNewUser(user, plus_add) {
        const users = Database.addToRecord("view.me.users", user);
        users.push({
            id: 0,
            username: "Add Profile",
            profile_piture: plus_add,
            color_scheme: "transparent"
        });
        return users;
    },

    updateUser(user, plus_add) {
        Database.updateInRecord("view.me.users", user);
        return Database.getUsers(plus_add);
    },

    deleteUser(user, plus_add) {
        Database.deleteFromRecord("view.me.users", user);
        for (const table of Database.__Tables) {
            const records = Database.getRecords(table, [{ field: "user_id", value: user.id }]);
            records.forEach(record => Database.deleteFromRecord(table, record));
        }
        return Database.getUsers(plus_add);
    },

    /** Favourites Record */

    getFavourites(user) {
        return Database.getRecords("view.me.favourites", [{ field: "user_id", value: user.id }]);
    },

    isFavourite(media, user) {
        return Database.existInRecord("view.me.favourites", [{ field: "title", value: media.title }, { field: "user_id", value: user.id }]);
    },

    addToFavourite(media, user) {
        const existInRecord = Database.existInRecord("view.me.favourites", [{ field: "title", value: media.title }, { field: "user_id", value: user.id }]);
        if (existInRecord) return Database.removeFromFavourite(media, user, [{ field: "title", value: media.title }, { field: "user_id", value: user.id }]);
        media.user_id = user.id;
        return Database.addToRecord("view.me.favourites", media);
    },

    removeFromFavourite(media, user, queries) {
        return Database.deleteFromRecord("view.me.favourites", media, queries);
    },

    /** Actively Watching Record */

    getActivelyWatchings(user) {
        return Database.getRecords("view.me.actively-watching", [{ field: "user_id", value: user.id }]);
    },

    isActivelyWatching(user, media) {
        const emedia = Database.findInRecord("view.me.actively-watching", [{ field: "title", value: media.title }, { field: "user_id", value: user.id }]);
        if (emedia) Object.keys(emedia).forEach(key => media[key] = emedia[key]);
        return emedia != undefined;
    },

    addToActivelyWatching(user, media) {
        const existInRecord = Database.existInRecord("view.me.actively-watching", [{ field: "title", value: media.title }, { field: "user_id", value: user.id }]);
        if (existInRecord) return Database.updateInRecord("view.me.actively-watching", media);;
        media.user_id = user.id;
        Database.addToRecord("view.me.actively-watching", media);
    },

    /** Settings - Media Sources */

    ___CachedUrls: {},

    getMediaSourcByScrapperClassName(className) {
        let records = Database.getRecords("view.me.settings.media.sources", [{ field: "scrapper_class_name", value: className }]);
        return records || Database._mediaSources;
    },

    getMediaSources(user, queries = [], failFast) {
        let records = Database.getRecords("view.me.settings.media.sources", [{ field: "user_id", value: user.id }, ...queries], "AND");
        if (!records || !records.length) {
            if (failFast) return records;
            records = Database._mediaSources;
            records.forEach(record => {
                record.user_id = user.id;
                Database.addToRecord("view.me.settings.media.sources", record);
            });
        }
        return records;
    },

    addMediaSource(user, mediaSource) {
        mediaSource.user_id = user.id;
        return Database.addToRecord("view.me.settings.media.sources", mediaSource);
    },

    removeMediaSource(user, mediaSource) {
        return Database.deleteFromRecord("view.me.settings.media.sources", mediaSource);
    },

    toggleMediaSource(user, mediaSource, active) {
        mediaSource.active = active;
        mediaSource.user_id = user.id;
        console.log("TO STORE", mediaSource);
        Database.updateInRecord("view.me.settings.media.sources", mediaSource);
        delete Database.___CachedUrls[user.id];
        window.location.reload();
    },

    getMediaUrls(user) {
        if (Database.___CachedUrls[user.id]) return Database.___CachedUrls[user.id];
        let mediaSources = Database.getMediaSources(user);
        mediaSources = mediaSources.reduce((acc, mediaSource) => {
            if (!mediaSource.active) return acc;
            const mediaSourceUrls = mediaSource.urls;
            Object.keys(mediaSourceUrls).map(urlKey => {
                if (!acc[urlKey]) acc[urlKey] = [];
                acc[urlKey].push(`null&clazz=${mediaSource.scrapper_class_name}&url=${mediaSourceUrls[urlKey]}`);
            });
            return acc;
        }, {});
        if (!mediaSources.genre) return { popular: [], genre: [], movies: [],
            cast: [], tv_shows: [], search: [], coming_soon: [],
        };
        Database.___CachedUrls[user.id] = mediaSources;
        return Database.___CachedUrls[user.id];
    },

    /** Settings - Plugin Host */

    //http://127.0.0.1:9002/mediaplugins/registry.json
    getPluginHost(user) {
        const records = Database.getRecords("view.me.settings.plugin.host", [{ field: "user_id", value: user.id }]);
        if (!records || !records.length) return "https://raw.githubusercontent.com/thedarkprojects/view-me-registry/main/mediaplugins/registry.json";
        return records[0].url;
    },

    updatePluginHost(user, url) {
        const pluginHost = { url, user_id: user.id };
        let records = Database.getRecords("view.me.settings.plugin.host", [{ field: "user_id", value: user.id }]);
        if (records && records.length) {
            pluginHost.id = records[0].id;
            return Database.updateInRecord("view.me.settings.plugin.host", pluginHost);
        }
        return Database.addToRecord("view.me.settings.plugin.host", pluginHost);
    },

    /* Settings - Langauge */

    __DefaultLanguage: {
        done: "Done",
        cancel: "Cancel",
        password: "Password",
        username: "Username",
        add_user: "Add User",
        color_scheme: "Color Scheme",
        remove_email: "Remove Email",
        add_new_user: "Add new user",
        who_s_watching: "Who's watching?",
        manage_profiles: "Manage Profiles",
        update_user_account: "Update User Account",
        delete_user_account: "Delete User Account",
        err_username_requires: "Error: username required",
        profile_picture_url: "Profile picture Url (optional)",
    },

    getLanguage(user) {
        return Database.__DefaultLanguage;
    },

    /* Color Map */
    
    _tempNorseUColorMap: {
        "norseu-stateless": "",
        "norseu-primary": "#3699ff",
        "norseu-secondary": "#e4e6ef",
        "norseu-success": "#1bc5bd",
        "norseu-info": "#8950fc",
        "norseu-warning": "#ffa800",
        "norseu-danger": "#f64e60",
        "norseu-skeleton": "maroon",
        "norseu-dark": "#000000",
        "norseu-light": "#ffffff"
    },

    getColorHex(scheme) { return Database._tempNorseUColorMap[scheme]; }

}

export default Database;