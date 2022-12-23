
export { Database } from "./Database"
export { ScrollToTop } from "./ScrollToTop"
export { ResultAggregator } from "./ResultAggregator"

export const viewMeConsole = {
    log: (...args) => console.log("VIEWME.LOG", ...args),
    error: (...args) => console.error("VIEWME.LOG", ...args),
    clog: (...args) => console.clear() || console.log("VIEWME.LOG", ...args),
    cerror: (...args) => console.clear() || console.error("VIEWME.LOG", ...args)
};