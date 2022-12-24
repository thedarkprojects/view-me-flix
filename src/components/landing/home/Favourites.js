
import { ScrollPanel } from "@ronuse/norseu/core/panels";
import { ViewportSensor } from "@ronuse/norseu/sensors";
import React from "react";
import { Database, viewMeConsole } from "../../../utils";

function Favourites(props) {

    const { user } = props.relaysProps;
    const [favourites, setFavourites] = React.useState(Database.getFavourites());

    return (<div style={{ height: "100%", paddingTop: 70, background: "black" }}>
        <ScrollPanel scheme={user.color_scheme} className="movie-list vertical">
            {favourites.map(movie => {
                return (<div onClick={() => goToMovie(movie)} className={`movie-item ${user.color_scheme}`}
                    style={{ backgroundImage: `url('${movie.preview_image.replace("178x268", "500x700")}')` }}></div>);
            })}
        </ScrollPanel>
    </div>);

    function goToMovie(movie) {
        viewMeConsole.clog("GOTO-MOVIE", movie);
    }

}

export default Favourites;