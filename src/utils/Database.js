
import plus_add from "../assets/images/plus_add.png";

export class Database {

    static _encryptor = (v) => btoa(v); // base 64 for encryption and decryption, likely move to more secure encryption strategy;
    static _decryptor = (v) => atob(v); // base 64 for encryption and decryption, likely move to more secure encryption strategy;
    static _cacheImpl = /*!localStorage.getItem("view.me") ? sessionStorage :*/ localStorage;

    /** The Database Encryption Interface */

    static setEncryptor(encryptor) {
        Database._encryptor = encryptor;
    }

    static setDecryptor(decryptor) {
        Database._decryptor = decryptor;
    }

    /** The Database Engine Interface */

    static setCacheImpl(cacheImpl) {
        Database._cacheImpl = cacheImpl;
    }

    static inCache(key) {
        const item = Database._cacheImpl.getItem(key);
        return (item !== null && item !== "")
    }

    static removeFromCache(key) {
        Database._cacheImpl.removeItem(key);
    }

    static unsafelyCacheString(key, value) {
        Database._cacheImpl.setItem(key, (Database._encryptor ? Database._encryptor(value) : value))
    }

    static cacheString(key, value) {
        Database._cacheImpl.setItem(key, (Database._encryptor ? Database._encryptor(value) : value))
    }

    static cacheNumber(key, number) {
        Database.cacheString(key, "" + number)
    }

    static cacheObject(key, object) {
        Database.cacheString(key, JSON.stringify(object))
    }

    static unsafelyCacheObject(key, object) {
        Database.unsafelyCacheString(key, JSON.stringify(object))
    }

    static stringFromCache(key, fallback) {
        if (!Database.inCache(key)) return fallback;
        const item = Database._cacheImpl.getItem(key);
        return Database._decryptor ? Database._decryptor(item) : item;
    }

    static objectFromCache(key, fallback) {
        if (!Database.inCache(key)) return fallback;
        try {
            const item = Database.stringFromCache(key);
            return !item || item === "undefined" ? fallback : JSON.parse(item);
        } catch (error) {
            console.error(error);
        }
        return (fallback ? fallback : null);
    }

    static numberFromCache(key, fallback) {
        return parseInt(Database.stringFromCache(key, fallback))
    }

    static clearCache() {
        Database._cacheImpl.clear();
    }

    /** The Database Implementation */

    static getUsers() {
        /*return [
            { id: 1, username: "Thecarisma", color_scheme: "red", profile_piture: 'https://avatars.githubusercontent.com/u/14879387' },
            { id: 2, username: "Grace", color_scheme: "green", profile_piture: null },
        ]*/
        const users = Database.objectFromCache("view.me.users", []);
        users.push({
            id: 0,
            username: "Add Profile",
            profile_piture: plus_add,
            color_scheme: "transparent"
        });
        return users;
    }

    static addNewUser(user) {
        const users = Database.objectFromCache("view.me.users", []);
        user.id = users.length+1;
        users.push(user);
        Database.cacheObject("view.me.users", users);
        users.push({
            id: 0,
            username: "Add Profile",
            profile_piture: plus_add,
            color_scheme: "transparent"
        });
        return users;
    }

}