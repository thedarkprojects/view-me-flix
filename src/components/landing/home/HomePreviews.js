
import { Button, ButtonGroup } from "@ronuse/norseu/core/buttons";
import { ScrollPanel } from "@ronuse/norseu/core/panels";
import { Scheme } from "@ronuse/norseu/core/variables";
import React from "react";
import { Database, viewMeConsole } from "../../../utils";

function HomePreviews(props) {

    const { user, previewMovie, setPreviewMovie, requestService, setCurrentGenre } = props.relaysProps;
    const [moviesByGenres, setMoviesByGenres] = React.useState(Database._genres.reduce((a, v) => ({ ...a, [v]: [] }), {}));

    React.useEffect(() => {
        requestService.mapppedRequest(Object.keys(moviesByGenres).reduce((acc, genre) => {
            acc[genre] = genre == "Popular" 
                ? "https://soap2day.rs/home" 
                : genre == "Coming Soon" 
                    ? "https://soap2day.rs/coming-soon" 
                    : `https://soap2day.rs/genre/${genre}`;
            return acc;
        }, {})).then(res => {
            setMoviesByGenres(res.data);
            setPreviewMovie(res.data["Popular"][Math.floor(Math.random() * ((res.data["Popular"].length - 1) - 0 + 1)) + 0] || previewMovie);
        }).catch(err => {
            viewMeConsole.error(err);
        });
    });

    return (<div className="content">
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
                        {[...(moviesByGenres[moviesByGenre] || []), { is_genre: true, genre: moviesByGenre }].map((movie, index) => {
                            return (<div key={index} onMouseEnter={() => setPreviewMovie(movie)} onClick={() => (movie.is_genre ? setCurrentGenre(movie.genre) : goToMovie(movie))}
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
    </div>);

    function goToMovie(movie) {
        viewMeConsole.clog("GOTO-MOVIE", movie);
    }

}

export default HomePreviews;