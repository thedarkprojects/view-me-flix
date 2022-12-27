

const Database = {

    _encryptor: (v) => btoa(v), // base 64 for encryption and decryption, likely move to more secure encryption strategy;
    _decryptor: (v) => atob(v), // base 64 for encryption and decryption, likely move to more secure encryption strategy;
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
        "Coming Soon"
    ],

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
        newRecord.id = records.length+1;
        records.push(newRecord);
        console.log(">>>>>>>>>>>>", records);
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
        media.final_media_link = emedia?.final_media_link;
        media.season_episode_name = emedia?.season_episode_name;
        return emedia != undefined;
    },

    addToActivelyWatching(user, media) {
        const existInRecord = Database.existInRecord("view.me.actively-watching", [{ field: "title", value: media.title }, { field: "user_id", value: user.id }]);
        if (existInRecord) return Database.updateInRecord("view.me.actively-watching", media);;
        media.user_id = user.id;
        Database.addToRecord("view.me.actively-watching", media);
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