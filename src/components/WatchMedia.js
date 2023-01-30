
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
let seasonOption = { index: 0, label: "Season 1" };
function WatchMedia() {

    const navigate = useNavigate();
    const location = useLocation();
    const { user, media } = location.state;
    const requestService = new RequestService(user);
    const [mainMedia, setMainMedia] = React.useState(media);
    const [isFavourite, setIsFavourite] = React.useState(Database.isFavourite(mainMedia, user));
    const [isActivelyWatching, setIsActivelyWatching] = React.useState(Database.isActivelyWatching(user, mainMedia));
    const [selectedSeasonEpisodes, setSelectedSeasonEpisodes] = React.useState(mainMedia.type === "show" ? ((mainMedia?.seasons) ? mainMedia?.seasons[(mainMedia || cMedia).season_index || 0].episodes : []) : []);

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
                        text={<span>{isActivelyWatching ? window.viewmore.i18nData.resume_watching : window.viewmore.i18nData.play}{" " + (mainMedia.season_episode_name || "")}</span>} scheme={user.color_scheme}
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
                            <span>{window.viewmore.i18nData.favourite}</span>
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
                        options={mainMedia?.seasons?.map((season, index) => {
                            return { label: season.name, value: season.name, index, episodes: season.episodes };
                        })} onSelectOption={(e) => {
                            seasonOption = e.option;
                            setSelectedSeasonEpisodes(e.option.episodes);
                        }} selectedOptionIndex={(cMedia || mainMedia).season_index || 0} matchTargetSize />
                    <div className="episode-list">
                        {selectedSeasonEpisodes.map((episode, index) => {
                            return (<Button key={episode.title} scheme={user.color_scheme} className="ep" onClick={() => playMedia(episode, index)} 
                                outlined={(cMedia || mainMedia).episode_index !== index} fillOnHover>
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
                            style={{ backgroundImage: `url('${movie.preview_image.replace("178x268", "500x700")}')` }}>
                                <div className="movie-title">{movie.title}</div>
                            </div>);
                    })}
                </div>
            </div>
        </ScrollPanel>
    </div>);

    function fetchMediaDetails(media) {
        requestService.getMovieDetail(media.media_link, media.scrapper_class_name).then(res => {
            cMedia = { ...media, ...res.data };
            setMainMedia(cMedia);
            if (cMedia.type === "show" && cMedia.seasons.length) {
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
                src={`https://www.youtube.com/v/2942BB1JXFk?enablejsapi=1&controls=0&autoplay=1`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-mainMedia; gyroscope; picture-in-picture"
                allowFullScreen
                title="Embedded youtube"
            />),
            confirmLabel: "Close",
            confirmScheme: user.color_scheme,
        });
    }

    function playMedia(mainMedia, eindex) {
        mainMedia = mainMedia || cMedia;
        if (mainMedia.final_media_link) {
            navigateToMediaPlayer(mainMedia, mainMedia.final_media_link);
            return;
        }
        if (cMedia.type === "show") {
            cMedia.episode_index = eindex;
            cMedia.actively_watching_episode = { ...mainMedia };
            mainMedia = {
                ...cMedia,
                servers: ((mainMedia.servers.length > 0) ? mainMedia.servers : mainMedia.seasons[0].episodes[0].servers)
            };
        }
        //mainMedia.servers = ((mainMedia.servers.length > 0) ? mainMedia.servers : mainMedia.seasons[0].episodes[0].servers)
        if (!mainMedia || !mainMedia.servers) return;
        if (/*mainMedia.type !== "show" && */mainMedia.servers.length === 1) {
            navigateToMediaPlayer(mainMedia, mainMedia.servers[0].link);
            return;
        }
        alertDialog({
            style: { minWidth: "50%" },
            message: (<div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <span style={{ marginBottom: 20 }}>Select a server</span>
                <ButtonGroup scheme={user.color_scheme} direction={Orientation.VERTICAL} fill>
                    {mainMedia.servers.map((server, index) => {
                        return (<Button key={index} text={server.name} style={{ marginTop: 10 }}
                            onClick={() => {
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
        if (media.actively_watching_episode && media.actively_watching_episode.title) {
            media.season_index = seasonOption.index;
            media.season_episode_name = `${seasonOption.label} - ${media.actively_watching_episode.title}`;
        }
        Database.addToActivelyWatching(user, { ...media, final_media_link });
        window.location = final_media_link;
    }

}

export default WatchMedia;