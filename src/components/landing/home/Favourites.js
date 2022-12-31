
import { ScrollPanel } from "@ronuse/norseu/core/panels";
import { ViewportSensor } from "@ronuse/norseu/sensors";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Database, viewMeConsole } from "../../../utils";

function Favourites(props) {

    let scrollPanelRef;
    const navigate = useNavigate();
    const { user } = props.relaysProps;
    const [favourites, setFavourites] = React.useState(Database.getFavourites(user));

    React.useEffect(() => {
        scrollPanelRef?.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (<div style={{ height: "100%", paddingTop: 30, background: "black" }}>
        <ScrollPanel scheme={user.color_scheme} style={{ height: "auto" }} className="movie-list vertical" ref={(r) => scrollPanelRef = r}>
            {favourites.map(movie => {
                return (<div onClick={() => goToMovie(movie)} className={`movie-item ${user.color_scheme}`}
                    style={{ backgroundImage: `url('${movie.preview_image.replace("178x268", "500x700")}')` }}>
                        <i className="fa fa-times-circle" onClick={(e) => {
                            e.stopPropagation();
                            Database.removeFromFavourite(movie);
                            setFavourites(Database.getFavourites(user))
                        }}></i>
                        <div className="movie-title">{movie.title}</div>
                    </div>);
            })}
        </ScrollPanel>
    </div>);

    function goToMovie(movie) {
        const media = movie;
        navigate("/watch", { state: { user, media } });
    }

}

export default Favourites;