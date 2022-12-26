

import _Database from "./Database";
export { AssetLoader } from "./AssetLoader";
export { ScrollToTop } from "./ScrollToTop";
export const Database = _Database;
export { ResultAggregator } from "./ResultAggregator";

export const viewMeConsole = {
    log: (...args) => console.log("VIEWME.LOG", ...args),
    error: (...args) => console.error("VIEWME.LOG", ...args),
    clog: (...args) => console.clear() || console.log("VIEWME.LOG", ...args),
    cerror: (...args) => console.clear() || console.error("VIEWME.LOG", ...args)
};