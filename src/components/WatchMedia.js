
import React from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { Database, viewMeConsole } from "../utils";
import { Button, ButtonGroup } from "@ronuse/norseu/core/buttons";
import { Dropdown } from "@ronuse/norseu/core/form";
import { alertDialog } from "@ronuse/norseu/core/overlay";
import { ScrollPanel } from "@ronuse/norseu/core/panels";
import { Alignment, Scheme } from "@ronuse/norseu/core/variables";

function WatchMedia() {

    const navigate = useNavigate();
    const location = useLocation();
    const { user, media } = location.state;
    const [isFavourite, setIsFavourite] = React.useState(Database.isFavourite(media));

    React.useEffect(() => {
        viewMeConsole.clog(user, media);
    }, []);

    return (<div className="watch-media">
        <ScrollPanel className="watch-show" scheme={user.color_scheme}>
            <div className="blured-bg" style={{ backgroundImage: `url('${media.preview_image?.replace("178x268", "5000x5000")}')` }}></div>
            <div className="preview" style={{ height: (media.type != "show" ? "100%": "initial") }}>
                <div className="header"><span onClick={() => navigate("/dashboard", { state: { user } })}>Back</span></div>
                <div className="blur" style={{ background: "linear-gradient(to bottom, transparent 0%, black 80%)" }}></div>
                <img className="poster" src={media.preview_image?.replace("178x268", "5000x5000")} />
                <div className="main-controls">
                    <Button icon="fa fa-play" alignIcon={Alignment.CENTER} text="Play" scheme={user.color_scheme} onClick={playMedia} fill />
                    <ButtonGroup scheme={Scheme.LIGHT} onClick={watchTrailer} fill>
                        <Button className="ws-bg-b" textOnly>
                            <i className="fa fa-video"></i>
                            <span>Watch Trailer</span>
                        </Button>
                        <Button scheme={isFavourite ? user.color_scheme : Scheme.LIGHT}
                            className="ws-bg-b" onClick={() => { Database.addToFavourite(media); setIsFavourite(Database.isFavourite(media)) }}
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
                <span className="title">{media.title}</span>
                <p className="synopsis">{media.synopsis || testSynp()}</p>
                <p className="casts">Casts: {(media.casts || testCasts()).map(cast => {
                    return (<span onClick={(e) => goToCast(cast)} className={`${user.color_scheme}-text`}>{cast}, </span>);
                })}</p>
                <p className="released">Released: <span className={`${user.color_scheme}-text`}>{media.release_date || "1999-01-31"}</span></p>
                <p className="genres">Genre: {(media.genres || ["Animation", "Comedy"]).map(genre => {
                    return (<span onClick={(e) => goToGenre(genre)} className={`${user.color_scheme}-text`}>{genre}, </span>);
                })}</p>
            </div>
            {media.type == "show"
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
        </ScrollPanel>
    </div>);

    function testSynp() {
        return `Sick, twisted, politically incorrect and Freakin' Sweet 
    animated series featuring the adventures of the dysfunctional Griffin family. 
    Bumbling Peter and long-suffering Lois have three kids. Stewie 
    (a brilliant but sadistic baby bent on killing his mother and taking 
        over the world), Meg (the oldest, and is the most unpopular girl in town) 
        and Chris (the middle kid, he's not very bright but has a passion for movies). 
        The final member of the family is Brian - a talking dog and much more than a pet, 
        he keeps Stewie in check whilst sipping Martinis and sorting through his own life issues.`;
    }

    function testCasts() {
        return ["Seth MacFarlane", "Alex Borstein", "Mila Kunis", "Seth Green", "Mike Henry"];
    }

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
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Embedded youtube"
            />),
            confirmLabel: "Close",
            confirmScheme: user.color_scheme,
        });
    }

    function playMedia() {
        window.location = media.media_link;
    }

}

export default WatchMedia;