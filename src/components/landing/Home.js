
import React from "react";
import { Database, AssetLoader, viewMeConsole } from "../../utils";
import { ScrollPanel } from "@ronuse/norseu/core/panels";
import { Button, ButtonGroup } from "@ronuse/norseu/core/buttons";
import { Scheme } from "@ronuse/norseu/core/variables";
import { Link } from "react-router-dom";
import { RequestService } from "../../services/RequestService";
import Genre from "./home/Genre";
import HomePreviews from "./home/HomePreviews";
import Favourites from "./home/Favourites";
import Movies from "./home/Movies";
import TvShows from "./home/TvShows";
import Cast from "./home/Cast";
import { alertDialog } from "@ronuse/norseu/core/overlay";

function Home(props) {
    
    const { user, genre, cast } = props;
    const requestService = new RequestService(user);
    const [homeView, setHomeView] = React.useState("home");
    const [currentCast, setCurrentCast] = React.useState(cast);
    const [currentGenre, setCurrentGenre] = React.useState(genre);
    const [landingBackgroundImageLink, setLandingBackgroundImageLink] = React.useState(AssetLoader.getAsset("green2"));
    const relaysProps = {
        user,
        requestService,
        setCurrentGenre,
        setLandingBackgroundImageLink
    };

    React.useEffect(() => {
        if (currentGenre) {
            return;
        }
        if (!Database.getMediaUrls(user).genre.length) {
            alertDialog({
                style: { maxWidth: 300 },
                message: <pr>You do not have any media source activated therefor no media will be available for viewing<br/><br/></pr>,
                confirmLabel: "Close",
                confirmScheme: user.color_scheme
            });
        }
    }, []);

    return (currentGenre
        ? <Genre user={user} genre={currentGenre} setCurrentGenre={setCurrentGenre} />
        : currentCast
            ? <Cast user={user} cast={cast} setCurrentCast={setCurrentCast} />
            : <ScrollPanel className="home" scheme={user.color_scheme} style={{ backgroundImage: `url('${landingBackgroundImageLink?.replace("178x268", "5000x5000")}')` }}>
                <div className="clearer1"></div>
                <div className="header">
                    <span className="app-name"
                        style={{ cursor: "pointer", color: Database.getColorHex(user.color_scheme), fontSize: 50 }}
                        onClick={() => setHomeView("home")}>VM</span>
                    <Button scheme={homeView === "shows" ? user.color_scheme : Scheme.LIGHT} text="TV Shows" textOnly onClick={() => setHomeView("shows")} />
                    <Button scheme={homeView === "movies" ? user.color_scheme : Scheme.LIGHT} text="Movies" textOnly onClick={() => setHomeView("movies")} />
                    <Button scheme={homeView === "favourites" ? user.color_scheme : Scheme.LIGHT} text="Favourites" textOnly onClick={() => setHomeView("favourites")} />
                </div>
                {selectView(homeView)}
            </ScrollPanel>);

    function selectView(name) {
        if (name === "movies") return <Movies relaysProps={relaysProps} />;
        if (name === "shows") return <TvShows relaysProps={relaysProps} />;
        if (name === "favourites") return <Favourites relaysProps={relaysProps} />;
        return <HomePreviews relaysProps={relaysProps} />;
    }

}

export default Home;