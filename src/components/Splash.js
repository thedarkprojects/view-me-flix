import React from "react";
import { useNavigate } from "react-router-dom";

function Splash() {

    const navigate = useNavigate();
    const splashSpan = React.useRef();

    React.useEffect(() => {
        setTimeout(() => splashSpan.current.classList.add("splash-animation") /*||  playButton.current.click()*/, 1500);
        setTimeout(() => navigate("/select-user"), 4000);
    });

    return <div className="splash">
        <span ref={splashSpan}>VM</span>
        {/**<button style={{ display: "none" }} ref={playButton} onClick={() => new Audio(netflix_intro_sound).play()}>Hello</button>**/}
    </div>
}

export default Splash;