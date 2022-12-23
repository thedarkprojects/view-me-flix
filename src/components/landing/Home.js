
import React from "react";
import { Database, viewMeConsole } from "../../utils";
import { ScrollPanel } from "@ronuse/norseu/core/panels";
import { Button, ButtonGroup } from "@ronuse/norseu/core/buttons";
import { Scheme } from "@ronuse/norseu/core/variables";
import { Link } from "react-router-dom";
import { RequestsService } from "../../services/RequestsService";

function Home(props) {

    let previewTimerId;
    const user = props.user;
    const requestService = new RequestsService();
    const [moviesByGenres, setMoviesByGenres] = React.useState(Database._genres.reduce((a, v) => ({ ...a, [v]: [] }), {}));
    const [previewMovie, setPreviewMovie] = React.useState({ preview_image: Database.getAsset("green2") });

    React.useEffect(() => {
        requestService.mapppedRequest(Object.keys(moviesByGenres).reduce((acc, genre) => {
            acc[genre] = genre == "Popular" ? "https://soap2day.rs/movie" : `https://soap2day.rs/genre/${genre}`;
            return acc;
        }, {})).then(res => {
            setMoviesByGenres(res.data);
            setPreviewMovie(res.data["Popular"][Math.floor(Math.random() * ((res.data["Popular"].length - 1) - 0 + 1)) + 0] || previewMovie);
            if (!previewTimerId) {
                console.log("SETTING REVIEW", previewTimerId);
                previewTimerId = (setInterval(function (previews) {
                    setPreviewMovie(previews[Math.floor(Math.random() * ((previews.length - 1) - 0 + 1)) + 0] || previewMovie);
                }, 10000, res.data["Popular"]));
            }
        }).catch(err => {
            viewMeConsole.error(err);
        });

        return () => {
            if (previewTimerId) clearInterval(previewTimerId);
        }
    }, []);

    return (<ScrollPanel className="home" scheme={user.color_scheme} style={{ backgroundImage: `url('${previewMovie.preview_image?.replace("178x268", "5000x5000")}')` }}>
        <div className="clearer1"></div>
        <div className="header">
            <Link to="/" className="app-name" style={{ color: Database.getColorHex(user.color_scheme), fontSize: 50 }}>VM</Link>
            <Button scheme={Scheme.LIGHT} text="TV Shows" textOnly />
            <Button scheme={Scheme.LIGHT} text="Movies" textOnly />
            <Button scheme={Scheme.LIGHT} text="Favourites" textOnly />
        </div>
        <div className="content">
            <div className="preview">
                <div className="blur"></div>
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
            <div className="sections" style={{ background: "black" }}>
                {Object.keys(moviesByGenres).map(moviesByGenre => {
                    return (<div className="section norseu-scrollpanel">
                        <span>{moviesByGenre}</span>
                        <ScrollPanel className="movie-list" scheme={user.color_scheme}>
                            {[...(moviesByGenres[moviesByGenre] || []), { is_genre: true, genre: "popular" }].map(movie => {
                                return (<div onClick={() => (movie.is_genre ? gotoGenre(movie.genre) : goToMovie(movie))}
                                    className={`${user.color_scheme} ${movie.is_genre ? "genre-button" : ""}`}
                                    style={{ backgroundImage: (movie.is_genre ? "inherit" : `url('${movie.preview_image.replace("178x268", "500x700")}')`) }}>
                                    {movie.is_genre ? <i className="fa fa-arrow-right"></i> : null}
                                    {movie.is_genre ? <span>View More</span> : null}
                                </div>);
                            })}
                        </ScrollPanel>
                    </div>);
                })}
            </div>
        </div>
    </ScrollPanel>);

    function goToMovie(movie) {
        viewMeConsole.clog("GOTO-MOVIE", movie);
    }

    function gotoGenre(genre) {
        viewMeConsole.clog("GOTO-GENRE", genre);
    }

}

export default Home;