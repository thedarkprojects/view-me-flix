
import { Button, ButtonGroup } from "@ronuse/norseu/core/buttons";
import { ScrollPanel } from "@ronuse/norseu/core/panels";
import { Scheme } from "@ronuse/norseu/core/variables";
import { ViewportSensor } from "@ronuse/norseu/sensors";
import React from "react";
import { useNavigate } from "react-router-dom";
import { RequestService } from "../../../services/RequestService";
import { Database, AssetLoader, viewMeConsole } from "../../../utils";

let activeMedia;

function Genre(props) {

    const { user, genre } = props;
    const navigate = useNavigate();
    const moviesScrollPanel = React.useRef();
    const requestService = new RequestService(user);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [searchResult, setSearchResult] = React.useState([]);
    const [previewIsFavourite, setPreviewIsFavourite] = React.useState(false);
    const [activelyWatchingPreview, setActivelyWatchingPreview] = React.useState(false);
    const genreObject = Object.values(Database.getGenres(user, [{ field: "label", value: props.genre }]));
    const [previewMovie, setPreviewMovie] = React.useState({ preview_image: AssetLoader.getAsset("green2") });

    React.useEffect(() => {
        fetchGenreMedias(currentPage);
    }, []);

    return (<div className="search" style={{ padding: 0, backgroundImage: `url('${previewMovie.preview_image?.replace("178x268", "5000x5000")}')` }}>
        <div style={{ fontWeight: "bold", fontSize: 20, padding: 20, backgroundColor: "rgba(0, 0, 0, 0.6)" }}>
            <i className="fa fa-angle-left" style={{ marginRight: 30, cursor: "pointer" }} onClick={() => props.setCurrentGenre(null)}></i>
            <span>{genre}</span>
        </div>
        <ScrollPanel scheme={user.color_scheme} ref={moviesScrollPanel} style={{ height: "100%" }}>
            <div className="preview" style={{ paddingTop: "50vh" }}>
                <div className="blur" style={{ background: "linear-gradient(to bottom, transparent 0%, black 90%)" }}></div>
                <span className="title">{previewMovie.title}</span>
                <ButtonGroup className="controls" fill>
                    <Button scheme={Scheme.LIGHT} className="b" onClick={() => {
                        Database.addToFavourite(activeMedia, user);
                        setPreviewIsFavourite(Database.isFavourite(activeMedia, user));
                        setActivelyWatchingPreview(Database.isActivelyWatching(user, activeMedia));
                    }}>
                        <i className={previewIsFavourite ? `fa fa-minus ${user.color_scheme}-text` : "fa fa-plus"} />
                        {previewIsFavourite
                            ? <span className={previewIsFavourite ? user.color_scheme + "-text" : ""}>{window.viewmore.i18nData.favourite}</span>
                            : <span>{window.viewmore.i18nData.favourite}</span>}
                    </Button>
                    <Button onClick={() => goToMovie(activeMedia, activeMedia.final_media_link)} scheme={user.color_scheme} className="play">
                        <i className="fa fa-play" style={{ marginRight: 5 }} />
                        <span>{activelyWatchingPreview ? window.viewmore.i18nData.resume_watching : window.viewmore.i18nData.play}{" " + (activeMedia?.season_episode_name || "")}</span>
                    </Button>
                    <Button onClick={() => { delete activeMedia.final_media_link; goToMovie(activeMedia); }} scheme={Scheme.LIGHT} className="b">
                        <i className="fa fa-info" />
                        <span>{window.viewmore.i18nData.info}</span>
                    </Button>
                </ButtonGroup>
            </div>
            <div className="movie-list vertical" style={{ marginTop: 0, overflow: "unset", height: "unset" }}>
                {searchResult.map((movie, index) => {
                    return (<div key={index} onMouseEnter={() => {
                        activeMedia = movie; setPreviewMovie(movie);
                        setPreviewIsFavourite(Database.isFavourite(movie, user));
                        setActivelyWatchingPreview(Database.isActivelyWatching(user, activeMedia));
                    }}
                        onClick={() => goToMovie(movie)} className={`movie-item ${user.color_scheme}`}
                        style={{ backgroundImage: `url('${movie.preview_image.replace("178x268", "500x700")}')` }}>
                            <div className="movie-title">{movie.title}</div>
                        </div>);
                })}
                <ViewportSensor onEnterViewport={onScrollToBottom} scrollContainerRef={moviesScrollPanel} />
            </div>
        </ScrollPanel>
    </div>);

    function resolveGenreListRsponse(medaiList) {
        activeMedia = medaiList[Math.floor(Math.random() * ((medaiList.length - 1) - 0 + 1)) + 0] || previewMovie;
        setSearchResult([...searchResult, ...medaiList]);
        setPreviewMovie(activeMedia);
        setPreviewIsFavourite(Database.isFavourite(activeMedia, user));
        setActivelyWatchingPreview(Database.isActivelyWatching(user, activeMedia));
    }

    function fetchGenreMedias(page) {
        if (genre === window.viewmore.i18nData.resume_watching) {
            resolveGenreListRsponse(Database.getActivelyWatchings(user));
            return;
        }
        requestService.getGenreList((genreObject.length ? genreObject[0] : { label: genre, aliases: []}), page).then(res => {
            setCurrentPage(page);
            if (!res.data.length) {
                setSearchResult([...searchResult])
                return;
            }
            resolveGenreListRsponse(res.data);
        }).catch(err => {
            viewMeConsole.error(err);
        });
    }

    function onScrollToBottom(e) {
        if (genre === window.viewmore.i18nData.resume_watching) return;
        fetchGenreMedias(currentPage + 1);
    }

    function goToMovie(movie, final_media_link) {
        if (final_media_link) {
            window.location = media.final_media_link;
            return;
        }
        const media = movie;
        navigate("/watch", { state: { user, media } });
    }

}

export default Genre;