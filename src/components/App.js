import "../assets/css/App.css";
import Splash from "./Splash";
import Landing from "./Landing";
import SelectUser from "./SelectUser";
import { ScrollToTop } from "../utils";
import { createBrowserHistory } from "history";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const history = createBrowserHistory({forceRefresh:false}); // true?

function App() {
    return (
        <BrowserRouter history={history}>
            <ScrollToTop/>
            <Routes>
                <Route exact path="/" element={<Splash />}></Route>
                <Route exact path="/dashboard" element={<Landing />}></Route>
                <Route exact path="/select-user" element={<SelectUser />}></Route>
                {/* <Route path="/login" element={<Login />}></Route>
                <Route path="/signup" element={<SignUp />}></Route>
                <Route path="/stpin" element={<SetTransactionPin />}></Route>
                <Route path="/dashboard/*" element={<Dashboard />}></Route> */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;