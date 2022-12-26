
import { Button, ButtonGroup } from "@ronuse/norseu/core/buttons";
import { ScrollPanel } from "@ronuse/norseu/core/panels";
import { Scheme } from "@ronuse/norseu/core/variables";
import { ViewportSensor } from "@ronuse/norseu/sensors";
import React from "react";
import { useNavigate } from "react-router-dom";
import { RequestService } from "../../../services/RequestService";
import { Database, AssetLoader, viewMeConsole } from "../../../utils";

let activeMedia;

function Cast(props) {

    const user = props.user;
    const cast = props.cast;
    const navigate = useNavigate();
    const moviesScrollPanel = React.useRef();
    const requestService = new RequestService();
    const [currentPage, setCurrentPage] = React.useState(1);
    const [searchResult, setSearchResult] = React.useState([]);
    const [previewIsFavourite, setPreviewIsFavourite] = React.useState(false);
    const [previewMovie, setPreviewMovie] = React.useState({ preview_image: AssetLoader.getAsset("green2") });

    React.useEffect(() => {
        fetchCastMedias(currentPage);
    }, []);

    return (<div className="search" style={{ padding: 0, backgroundImage: `url('${previewMovie.preview_image?.replace("178x268", "5000x5000")}')` }}>
        <div style={{ fontWeight: "bold", fontSize: 20, padding: 20, backgroundColor: "rgba(0, 0, 0, 0.6)" }}>
            <i className="fa fa-angle-left" style={{ marginRight: 30, cursor: "pointer" }} onClick={() => props.setCurrentCast(null)}></i>
            <span>{cast}</span>
        </div>
        <ScrollPanel scheme={user.color_scheme} ref={moviesScrollPanel} style={{ height: "100%" }}>
            <div className="preview" style={{ paddingTop: "50vh" }}>
                <div className="blur" style={{ background: "linear-gradient(to bottom, transparent 0%, black 90%)" }}></div>
                <span className="title">{previewMovie.title}</span>
                {/* <span className="casts">Movie</span> */}
                <ButtonGroup className="controls" fill>
                    <Button scheme={Scheme.LIGHT} className="b" onClick={() => { Database.addToFavourite(activeMedia); setPreviewIsFavourite(Database.isFavourite(activeMedia)) }}>
                        <i className={previewIsFavourite ? `fa fa-minus ${user.color_scheme}-text` : "fa fa-plus"} />
                        {previewIsFavourite
                            ? <span className={previewIsFavourite ? user.color_scheme + "-text" : ""}>Favorite</span>
                            : <span>Favorite</span>}
                    </Button>
                    <Button onClick={() => goToMovie(activeMedia)} scheme={user.color_scheme} className="play">
                        <i className="fa fa-play" style={{ marginRight: 5 }} />
                        <span>Play</span>
                    </Button>
                    <Button scheme={Scheme.LIGHT} className="b">
                        <i className="fa fa-info" />
                        <span>Info</span>
                    </Button>
                </ButtonGroup>
            </div>
            <div className="movie-list vertical" style={{ marginTop: 0, overflow: "unset", height: "unset" }}>
                {searchResult.map((movie, index) => {
                    return (<div key={index} onMouseEnter={() => { activeMedia = movie; setPreviewMovie(movie); setPreviewIsFavourite(Database.isFavourite(movie)); }}
                        onClick={() => goToMovie(movie)} className={`movie-item ${user.color_scheme}`}
                        style={{ backgroundImage: `url('${movie.preview_image.replace("178x268", "500x700")}')` }}></div>);
                })}
                <ViewportSensor onEnterViewport={onScrollToBottom} scrollContainerRef={moviesScrollPanel} />
            </div>
        </ScrollPanel>
    </div>);

    function fetchCastMedias(page) {
        requestService.getCastList(cast, page).then(res => {
            setCurrentPage(page);
            if (!res.data.length) {
                setSearchResult([...searchResult])
                return;
            }
            activeMedia = res.data[Math.floor(Math.random() * ((res.data.length - 1) - 0 + 1)) + 0] || previewMovie;
            setSearchResult([...searchResult, ...res.data]);
            setPreviewMovie(activeMedia);
            setPreviewIsFavourite(Database.isFavourite(activeMedia));
        }).catch(err => {
            viewMeConsole.error(err);
        });
    }

    function onScrollToBottom(e) {
        fetchCastMedias(currentPage + 1);
    }

    function goToMovie(movie) {
        const media = movie;
navigate("/watch", { state: { user, media } });
    }

}

export default Cast;