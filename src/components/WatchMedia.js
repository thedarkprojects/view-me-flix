
import React from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { AssetLoader, Database, viewMeConsole } from "../utils";
import { Button, ButtonGroup } from "@ronuse/norseu/core/buttons";
import { Dropdown } from "@ronuse/norseu/core/form";
import { alertDialog } from "@ronuse/norseu/core/overlay";
import { ScrollPanel } from "@ronuse/norseu/core/panels";
import { Alignment, Orientation, Scheme } from "@ronuse/norseu/core/variables";
import { RequestService } from "../services";

let cMedia = null;
function WatchMedia() {

    const navigate = useNavigate();
    const location = useLocation();
    const { user, media } = location.state;
    const requestService = new RequestService();
    const [mainMedia, setMainMedia] = React.useState(media);
    const [isFavourite, setIsFavourite] = React.useState(Database.isFavourite(mainMedia, user));
    const [selectedSeasonEpisodes, setSelectedSeasonEpisodes] = React.useState(mainMedia.type === "show" ? ((mainMedia?.seasons) ? mainMedia?.seasons[0].episodes : []) : []);
    const [isActivelyWatching, setIsActivelyWatching] = React.useState(Database.isActivelyWatching(user, mainMedia));

    React.useEffect(() => {
        cMedia = mainMedia;
        if (!isActivelyWatching) fetchMediaDetails(mainMedia);
    }, []);

    return (<div className="watch-media">
        <ScrollPanel className="watch-show" scheme={user.color_scheme}>
            <div className="blured-bg" style={{ backgroundImage: `url('${mainMedia.preview_image?.replace("178x268", "5000x5000")}')` }}></div>
            <div className="preview" style={{ /*(mainMedia.type != "show" ? "100%": "initial")*/ }}>
                <div className="header"><span onClick={() => navigate("/dashboard", { state: { user } })}>Back</span></div>
                <div className="blur" style={{ background: "linear-gradient(to bottom, transparent 0%, black 80%)" }}></div>
                <img className="poster" src={mainMedia.preview_image?.replace("178x268", "5000x5000")} />
                <div className="main-controls">
                    <Button icon={mainMedia.servers ? "fa fa-play" : "fa fa-spinner fa-spin"}
                        style={{ maxHeight: "50px" }}
                        disabled={mainMedia.servers === undefined}
                        alignIcon={Alignment.CENTER} 
                        text={<span>{isActivelyWatching ? "Resume Watching" : "Play"}{" " + (mainMedia.season_episode_name || "")}</span>} scheme={user.color_scheme}
                        onClick={() => playMedia()} fill />
                    {mainMedia.type !== "show" && isActivelyWatching
                        ? <Button icon={mainMedia.servers ? "fa fa-play" : "fa fa-spinner fa-spin"}
                            style={{ marginTop: "20px" }}
                            disabled={mainMedia.servers === undefined}
                            alignIcon={Alignment.CENTER} text={<span>Restart Play</span>} scheme={user.color_scheme}
                            onClick={() => { delete cMedia.final_media_link; delete mainMedia.final_media_link; playMedia(); }} fill />
                        : null}
                    <ButtonGroup style={{ display: (mainMedia.servers ? "flex" : "none"), marginTop: "30px" }} scheme={Scheme.LIGHT} fill>
                        <Button className="ws-bg-b" onClick={watchTrailer} textOnly>
                            <i className="fa fa-video"></i>
                            <span>Watch Trailer</span>
                        </Button>
                        <Button scheme={isFavourite ? user.color_scheme : Scheme.LIGHT}
                            className="ws-bg-b" onClick={() => { Database.addToFavourite(mainMedia, user); setIsFavourite(Database.isFavourite(mainMedia, user)) }}
                            textOnly>
                            <i className={isFavourite ? `fa fa-minus` : "fa fa-plus"} />
                            <span>Favourite</span>
                        </Button>
                        <Button className="ws-bg-b" textOnly>
                            <i className="fa fa-share"></i>
                            <span>Share</span>
                        </Button>
                    </ButtonGroup>
                </div>
                <span className="title">{mainMedia.title}</span>
                <p className="synopsis">{mainMedia.synopsis}</p>
                <p className="casts">Casts: {(mainMedia.casts || []).map((cast, index) => {
                    return (<span key={index} onClick={(e) => goToCast(cast)} className={`${user.color_scheme}-text`}>{cast}, </span>);
                })}</p>
                <p className="released">Released: <span className={`${user.color_scheme}-text`}>{mainMedia.release_date}</span></p>
                <p className="genres">Genre: {(mainMedia.genres || []).map((genre, index) => {
                    return (<span key={index} onClick={(e) => goToGenre(genre)} className={`${user.color_scheme}-text`}>{genre}, </span>);
                })}</p>
            </div>
            {mainMedia.type == "show" && mainMedia.seasons
                ? (<div className={`seasons-list ${user.color_scheme}-border-top-color`}>
                    <Dropdown className={`${user.color_scheme}-border-1px ${user.color_scheme}-text`} inputClassName={`${user.color_scheme}-border-1px ${user.color_scheme}-text`}
                        internalInputClassName={`${user.color_scheme}-text`} scheme={user.color_scheme}
                        options={mainMedia?.seasons?.map((season) => {
                            return { label: season.name, value: season.name, episodes: season.episodes };
                        })} onSelectOption={(e) => {
                            cMedia.active_season_title = e.option.label;
                            setSelectedSeasonEpisodes(e.option.episodes);
                        }} selectedOptionIndex={0} matchTargetSize />
                    <div className="episode-list">
                        {selectedSeasonEpisodes.map((episode) => {
                            return (<Button key={episode.title} scheme={user.color_scheme} className="ep" onClick={() => playMedia(episode)} outlined fillOnHover>
                                <i className="fa fa-play"></i>
                                <span>{episode.title}</span>
                            </Button>);
                        })}
                    </div>
                </div>)
                : null}
            <div className={`${user.color_scheme}-border-top-color`}
                style={{ flex: 1, borderTopStyle: "solid", background: "black", paddingTop: 20 }}>
                <span style={{ fontSize: 18, fontWeight: "bold", margin: 20 }}>Similar Titles</span>
                <div className={`movie-list vertical`}
                    style={{ height: "unset", margin: 0, padding: 15 }}>
                    {(mainMedia?.similarMovies || []).map((movie, index) => {
                        return (<div key={index} onClick={() => goToMovie(movie)} className={`movie-item ${user.color_scheme}`}
                            style={{ backgroundImage: `url('${movie.preview_image.replace("178x268", "500x700")}')` }}></div>);
                    })}
                </div>
            </div>
        </ScrollPanel>
    </div>);

    function fetchMediaDetails(media) {
        requestService.getMovieDetail(media.media_link, media.source).then(res => {
            cMedia = { ...media, ...res.data };
            setMainMedia(cMedia);
            if (cMedia.type === "show") {
                setSelectedSeasonEpisodes(cMedia.seasons[0].episodes);
            }
        }).catch(err => {
            viewMeConsole.error(err);
        });
    }

    function goToMovie(movie) {
        cMedia = movie;
        setMainMedia(movie); fetchMediaDetails(movie);
        setIsActivelyWatching(Database.isActivelyWatching(user, movie));
        //navigate("/watch", { state: { user, media } });
    }

    function goToCast(cast) {
        navigate("/dashboard", { state: { user, cast } });
    }

    function goToGenre(genre) {
        navigate("/dashboard", { state: { user, genre } });
    }

    function watchTrailer() {
        alertDialog({
            style: { width: "100%", height: "100%", maxWidth: "99%", maxHeight: "100%" },
            message: (<iframe style={{ width: "100vw", height: "85vh" }}
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/2942BB1JXFk?enablejsapi=1&controls=0&autoplay=1`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-mainMedia; gyroscope; picture-in-picture"
                allowFullScreen
                title="Embedded youtube"
            />),
            confirmLabel: "Close",
            confirmScheme: user.color_scheme,
        });
    }

    function playMedia(mainMedia) {
        mainMedia = mainMedia || cMedia;
        if (mainMedia.final_media_link) {
            navigateToMediaPlayer(mainMedia, mainMedia.final_media_link);
            return;
        }
        if (cMedia.type === "show") {
            cMedia.actively_watching_episode = { ...mainMedia };
            mainMedia = {
                ...cMedia,
                servers: ((mainMedia.servers.length > 0) ? mainMedia.servers : mainMedia.seasons[0].episodes[0].servers)
            };
        }
        //mainMedia.servers = ((mainMedia.servers.length > 0) ? mainMedia.servers : mainMedia.seasons[0].episodes[0].servers)
        if (!mainMedia || !mainMedia.servers) return;
        alertDialog({
            style: { minWidth: "50%" },
            message: (<div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <span style={{ marginBottom: 20 }}>Select a server</span>
                <ButtonGroup scheme={user.color_scheme} direction={Orientation.VERTICAL} fill>
                    {mainMedia.servers.map((server, index) => {
                        return (<Button key={index} text={server.name} style={{ marginTop: 10 }}
                            onClick={() => {
                                if (mainMedia.actively_watching_episode && mainMedia.actively_watching_episode.title) {
                                    mainMedia.season_episode_name = `${mainMedia.active_season_title || "Season 1"} - ${mainMedia.actively_watching_episode.title}`
                                }
                                navigateToMediaPlayer(mainMedia, server.link);
                            }} />);
                    })}
                </ButtonGroup>
            </div>),
            confirmLabel: "Close",
            confirmScheme: user.color_scheme,
        });
    }

    function navigateToMediaPlayer(media, final_media_link) {
        Database.addToActivelyWatching(user, { ...media, final_media_link });
        //window.location = final_media_link;
    }

}

export default WatchMedia;