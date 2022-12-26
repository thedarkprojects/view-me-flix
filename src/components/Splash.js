import React from "react";
import { useNavigate } from "react-router-dom";
import netflix_intro_sound from "../assets/audios/netflix_intro.mp3";
import { Database } from "../utils";

function Splash() {

    const navigate = useNavigate();
    const playButton = React.useRef();
    const splashSpan = React.useRef();
    const searchParams = new URLSearchParams(decodeURIComponent(window.location.search));

    React.useEffect(() => {
        console.log("||||||>>>>>>", decodeURIComponent(window.location.search), "--", searchParams.get("middlewareurl") || "http://127.0.0.1:3001");
        Database.setMiddlewareUrl(searchParams.get("middlewareurl") || "http://127.0.0.1:3001");
        setTimeout(() => splashSpan.current.classList.add("splash-animation") ||  playButton.current.click(), 1500);
        setTimeout(() => navigate("/select-user"), 4000);
    });

    return <div className="splash">
        <span ref={splashSpan}>VM</span>
        <button style={{ display: "none" }} ref={playButton} onClick={() => new Audio(netflix_intro_sound).play()}>Hello</button>
    </div>
}

export default Splash;