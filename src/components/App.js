import "../assets/css/App.css";
import Splash from "./Splash";
import Landing from "./Landing";
import SelectUser from "./SelectUser";
import { ScrollToTop } from "../utils";
import { createBrowserHistory } from "history";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import WatchMedia from "./WatchMedia";

const history = createBrowserHistory({forceRefresh:false}); // true?

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