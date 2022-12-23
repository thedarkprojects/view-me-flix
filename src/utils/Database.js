
import green1 from "../assets/images/green1.jpg";
import green2 from "../assets/images/green2.jpg";
import plus_add from "../assets/images/plus_add.png";

export const Database = {

    _encryptor: (v) => btoa(v), // base 64 for encryption and decryption, likely move to more secure encryption strategy;
    _decryptor: (v) => atob(v), // base 64 for encryption and decryption, likely move to more secure encryption strategy;
    _cacheImpl: /*!localStorage.getItem("view.me") ? sessionStorage :*/ localStorage,

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
        "News"
    ],

    // assets
    getAsset(asset) {
        if (asset === "green1") return green1;
        if (asset === "green2") return green2;
        if (asset === "plus_add") return plus_add;
        return plus_add;
    },

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

    saveRecords(tableName, records) {
        Database.cacheObject(tableName, records);
        return records;
    },

    getRecords(tableName) {
        const records = Database.objectFromCache(tableName, []);
        return records;
    },

    addToRecord(tableName, newRecord) {
        const records = Database.objectFromCache(tableName, []);
        newRecord.id = records.length+1;
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

    deleteFromRecord(tableName, record) {
        const records = Database.getRecords(tableName);
        const index = records.findIndex(x => x.id === record.id);
        records.splice(index, 1);
        return Database.saveRecords(tableName, records);
    },

    /** User Record */

    getUsers() {
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

    addNewUser(user) {
        const users = Database.addToRecord("view.me.users", user);
        users.push({
            id: 0,
            username: "Add Profile",
            profile_piture: plus_add,
            color_scheme: "transparent"
        });
        return users;
    },

    updateUser(user) {
        Database.updateInRecord("view.me.users", user);
        return Database.getUsers();
    },

    deleteUser(user) {
        Database.deleteFromRecord("view.me.users", user);
        return Database.getUsers();
    },

    /* COlor Map */
    
    _tempNorseUColorMap: {
        "norseu-stateless": "maroon",
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