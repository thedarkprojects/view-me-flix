
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

let cMedia;
function WatchMedia() {

    const navigate = useNavigate();
    const location = useLocation();
    const { user, media } = location.state;
    const requestService = new RequestService();
    const [mainMedia, setMainMedia] = React.useState(media);
    const [isFavourite, setIsFavourite] = React.useState(Database.isFavourite(mainMedia));

    React.useEffect(() => {
        requestService.getMovieDetail(mainMedia.media_link, mainMedia.source).then(res => {
            cMedia = { ...media, ...res.data };
            setMainMedia(cMedia);
        }).catch(err => {
            viewMeConsole.error(err);
        });
    }, []);

    return (<div className="watch-mainMedia">
        <ScrollPanel className="watch-show" scheme={user.color_scheme}>
            <div className="blured-bg" style={{ backgroundImage: `url('${mainMedia.preview_image?.replace("178x268", "5000x5000")}')` }}></div>
            <div className="preview" style={{ height: "100vh"/*(mainMedia.type != "show" ? "100%": "initial")*/ }}>
                <div className="header"><span onClick={() => navigate("/dashboard", { state: { user } })}>Back</span></div>
                <div className="blur" style={{ background: "linear-gradient(to bottom, transparent 0%, black 80%)" }}></div>
                <img className="poster" src={mainMedia.preview_image?.replace("178x268", "5000x5000")} />
                <div className="main-controls">
                    <Button icon="fa fa-play" alignIcon={Alignment.CENTER} text="Play" scheme={user.color_scheme} 
                        onClick={playMedia} fill />
                    <ButtonGroup scheme={Scheme.LIGHT}fill>
                        <Button className="ws-bg-b" onClick={watchTrailer} textOnly>
                            <i className="fa fa-video"></i>
                            <span>Watch Trailer</span>
                        </Button>
                        <Button scheme={isFavourite ? user.color_scheme : Scheme.LIGHT}
                            className="ws-bg-b" onClick={() => { Database.addToFavourite(mainMedia); setIsFavourite(Database.isFavourite(mainMedia)) }}
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
            {mainMedia.type == "show"
                ? (<div className={`seasons-list ${user.color_scheme}-border-top-color`}>
                    <Dropdown className={`${user.color_scheme}-border-1px ${user.color_scheme}-text`} inputClassName={`${user.color_scheme}-border-1px ${user.color_scheme}-text`}
                        internalInputClassName={`${user.color_scheme}-text`} scheme={user.color_scheme} options={testOptions()} selectedOptionIndex={0} matchTargetSize />
                    <div className="episode-list">
                        <Button scheme={user.color_scheme} className="ep" outlined fillOnHover>
                            <i className="fa fa-play"></i>
                            <span>1. The film Thin</span>
                        </Button>
                        <Button scheme={user.color_scheme} className="ep" outlined fillOnHover>
                            <i className="fa fa-play"></i>
                            <span>1. The film Thin sdddddddddddd</span>
                        </Button>
                        <Button scheme={user.color_scheme} className="ep" outlined fillOnHover>
                            <i className="fa fa-play"></i>
                            <span>1. The film Thin       dc</span>
                        </Button>
                        <Button scheme={user.color_scheme} className="ep" outlined fillOnHover>
                            <i className="fa fa-play"></i>
                            <span>1. The film Thinsss ssss djsghdkjgjhd gjhdg jsg j</span>
                        </Button>
                        <Button scheme={user.color_scheme} className="ep" outlined fillOnHover>
                            <i className="fa fa-play"></i>
                            <span>1. The film Thinsss ssss djsghdkjgjhd gjhdg jsg j jdtwuydyuiy</span>
                        </Button>
                    </div>
                </div>)
                : null}
            <div className={`${user.color_scheme}-border-top-color`} 
                style={{ borderTopStyle: "solid", background: "black", paddingTop: 20 }}>
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

    function testOptions() {
        return [
            { label: "Season 1", value: "season-1" },
            { label: "Season 2", value: "season-1" },
            { label: "Season 3", value: "season-1" },
            { label: "Season 4", value: "season-1" },
            { label: "Season 5", value: "season-1" },
            { label: "Season 6", value: "season-1" },
            { label: "Season 7", value: "season-1" },
        ];
    }

    function goToMovie(movie) {
        const mainMedia = movie;
        navigate("/watch", { state: { user, mainMedia } });
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
        if (!cMedia || !cMedia.servers) return;
        alertDialog({
            style: { minWidth: "50%" },
            message: (<div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <span style={{ marginBottom: 20 }}>Select a server</span>
                <ButtonGroup scheme={user.color_scheme} direction={Orientation.VERTICAL} fill>
                    {cMedia.servers.map((server, index) => {
                        return (<Button key={index} text={server.name} style={{ marginTop: 10 }}
                            onClick={() => navigateToMediaPlayer(server.link)}/>);
                    })}
                </ButtonGroup>
            </div>),
            confirmLabel: "Close",
            confirmScheme: user.color_scheme,
        });
    }

    function navigateToMediaPlayer(videoLink) {
        window.location = videoLink;
    }

}

export default WatchMedia;