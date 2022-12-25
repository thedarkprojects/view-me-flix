
import { ScrollPanel } from "@ronuse/norseu/core/panels";
import { ViewportSensor } from "@ronuse/norseu/sensors";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Database, viewMeConsole } from "../../../utils";

function Favourites(props) {

    let scrollPanelRef;
    const navigate = useNavigate();
    const { user } = props.relaysProps;
    const [favourites, setFavourites] = React.useState(Database.getFavourites());

    React.useEffect(() => {
        scrollPanelRef?.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (<div style={{ height: "100%", paddingTop: 75, background: "black" }}>
        <ScrollPanel scheme={user.color_scheme} className="movie-list vertical" ref={(r) => scrollPanelRef = r}>
            {favourites.map(movie => {
                return (<div onClick={() => goToMovie(movie)} className={`movie-item ${user.color_scheme}`}
                    style={{ backgroundImage: `url('${movie.preview_image.replace("178x268", "500x700")}')` }}></div>);
            })}
        </ScrollPanel>
    </div>);

    function goToMovie(movie) {
        const media = movie;
        navigate("/watch", { state: { user, media } });
    }

}

export default Favourites;