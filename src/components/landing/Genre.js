
import { Button, ButtonGroup } from "@ronuse/norseu/core/buttons";
import { ScrollPanel } from "@ronuse/norseu/core/panels";
import { Scheme } from "@ronuse/norseu/core/variables";
import { ViewportSensor } from "@ronuse/norseu/sensors";
import React from "react";
import { RequestsService } from "../../services/RequestsService";
import { Database, viewMeConsole } from "../../utils";

function Genre(props) {

    const user = props.user;
    const genre = props.genre;
    const moviesScrollPanel = React.useRef();
    const requestService = new RequestsService();
    const [currentPage, setCurrentPage] = React.useState(1);
    const [searchResult, setSearchResult] = React.useState([]);
    const [previewMovie, setPreviewMovie] = React.useState({ preview_image: Database.getAsset("green2") });

    React.useEffect(() => {
        fetchGenreMedias(currentPage);
    }, []);

    return (<div className="search" style={{ padding: 0, backgroundImage: `url('${previewMovie.preview_image?.replace("178x268", "5000x5000")}')` }}>
        <div style={{ fontWeight: "bold", fontSize: 20, padding: 20, backgroundColor: "rgba(0, 0, 0, 0.6)" }}>
            <i className="fa fa-angle-left" style={{ marginRight: 30 }} onClick={() => props.setCurrentGenre(null)}></i>
            <span>{genre}</span>
        </div>
        <ScrollPanel scheme={user.color_scheme} ref={moviesScrollPanel} style={{ height: "100%" }}>
            <div className="preview" style={{ paddingTop: "50vh" }}>
                <div className="blur" style={{ background: "linear-gradient(to bottom, transparent 0%, black 90%)" }}></div>
                <span className="title">{previewMovie.title}</span>
                <span className="genres">Movie</span>
                <ButtonGroup className="controls" fill>
                    <Button scheme={Scheme.LIGHT} className="b">
                        <i className="fa fa-heart" />
                        <span>Favorite</span>
                    </Button>
                    <Button scheme={user.color_scheme} className="play">
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
                    return (<div key={index} onMouseEnter={() => setPreviewMovie(movie)} onClick={() => goToMovie(movie)} className={`movie-item ${user.color_scheme}`}
                        style={{ backgroundImage: `url('${movie.preview_image.replace("178x268", "500x700")}')` }}></div>);
                })}
                <ViewportSensor onEnterViewport={onScrollToBottom} scrollContainerRef={moviesScrollPanel} />
            </div>
        </ScrollPanel>
    </div>);

    function fetchGenreMedias(page) {
        requestService.getGenreList(genre, page).then(res => {
            setCurrentPage(page);
            if (!res.data.length) {
                setSearchResult([ ...searchResult ])
                return;
            }
            setPreviewMovie(res.data[Math.floor(Math.random() * ((res.data.length - 1) - 0 + 1)) + 0] || previewMovie);
            setSearchResult([ ...searchResult, ...res.data ]);
        }).catch(err => {
            viewMeConsole.error(err);
        });
    }

    function onScrollToBottom(e) {
        fetchGenreMedias(currentPage+1);
    }

    function goToMovie(movie) {
        viewMeConsole.clog("GOTO-MOVIE", movie);
    }

}

export default Genre;