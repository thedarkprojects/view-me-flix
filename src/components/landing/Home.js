
import React from "react";
import { Database, viewMeConsole } from "../../utils";
import { ScrollPanel } from "@ronuse/norseu/core/panels";
import { Button, ButtonGroup } from "@ronuse/norseu/core/buttons";
import { Scheme } from "@ronuse/norseu/core/variables";
import { Link } from "react-router-dom";
import { RequestsService } from "../../services/RequestsService";
import Genre from "./Genre";
import HomePreviews from "./home/HomePreviews";
import Favourites from "./home/Favourites";

function Home(props) {

    const user = props.user;
    const requestService = new RequestsService();
    const [homeView, setHomeView] = React.useState("favourites");
    const [currentGenre, setCurrentGenre] = React.useState(null);
    const [previewMovie, setPreviewMovie] = React.useState({ preview_image: Database.getAsset("green2") });
    const relaysProps = {
        user,
        previewMovie,
        requestService,
        setPreviewMovie,
        setCurrentGenre
    }
    const homePreviews = <HomePreviews relaysProps={relaysProps}/>

    React.useEffect(() => {
        if (currentGenre) {
            return;
        }
    }, []);

    return (currentGenre 
            ? <Genre user={user} genre={currentGenre} setCurrentGenre={setCurrentGenre}/> 
            : <ScrollPanel className="home" scheme={user.color_scheme} style={{ backgroundImage: `url('${previewMovie.preview_image?.replace("178x268", "5000x5000")}')` }}>
        <div className="clearer1"></div>
        <div className="header">
            <span className="app-name" 
                style={{ color: Database.getColorHex(user.color_scheme), fontSize: 50 }}
                onClick={() => setHomeView("home")}>VM</span>
            <Button scheme={Scheme.LIGHT} text="TV Shows" textOnly />
            <Button scheme={Scheme.LIGHT} text="Movies" textOnly />
            <Button scheme={Scheme.LIGHT} text="Favourites" textOnly />
        </div>
        {selectView(homeView)}
    </ScrollPanel>);

    function selectView(name) {
        if (name === "favourites") return <Favourites relaysProps={relaysProps}/>;
        return homePreviews;
    }

}

export default Home;