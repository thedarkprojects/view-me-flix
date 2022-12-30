import "../assets/css/App.css";
import Splash from "./Splash";
import Landing from "./Landing";
import SelectUser from "./SelectUser";
import { Database, ScrollToTop } from "../utils";
import { createBrowserHistory } from "history";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import WatchMedia from "./WatchMedia";

// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}
const history = createBrowserHistory({forceRefresh:false}); // true?
window.viewmore = window.viewmore || {};
window.viewmore.i18nData = Database.getLanguage();

function App() {
    return (
        <HashRouter history={history}>
            <ScrollToTop/>
            <Routes>
                <Route exact path="/" element={<Splash />}></Route>
                <Route exact path="/watch" element={<WatchMedia />}></Route>
                <Route exact path="/dashboard" element={<Landing />}></Route>
                <Route exact path="/select-user" element={<SelectUser />}></Route>
            </Routes>
        </HashRouter>
    );
}

export default App;