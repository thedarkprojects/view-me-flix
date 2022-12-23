
import React from "react";
import { InputText } from "@ronuse/norseu/core/form";
import { Database, viewMeConsole } from "../../utils";
import { ViewportSensor } from "@ronuse/norseu/sensors";
import { ScrollPanel } from "@ronuse/norseu/core/panels";
import { RequestsService } from "../../services/RequestsService";
import { Orientation } from "@ronuse/norseu/core/variables";

function Search(props) {

    const user = props.user;
    const moviesScrollPanel = React.useRef();
    const requestService = new RequestsService();
    const [currentPage, setCurrentPage] = React.useState(1);
    const [searchResult, setSearchResult] = React.useState([]);
    const [currentlyFetching, setCurrentlyFetching] = React.useState(null);

    React.useEffect(() => {
        
    }, []);

    return (<div className="search">
        <div className="search-panel">
            <InputText scheme={user.color_scheme} leftIcon="fa fa-search" placeholder="Search" fill onInput={(e) => setSearchResult([]) || searchInputEvent(e)}/>
        </div>
        <ScrollPanel scheme={user.color_scheme} className="movie-list vertical" ref={moviesScrollPanel}>
            {searchResult.map(movie => {
                return (<div onClick={() => goToMovie(movie)} className={`movie-item ${user.color_scheme}`}
                    style={{ backgroundImage: `url('${movie.preview_image.replace("178x268", "500x700")}')` }}></div>);
            })}
            <ViewportSensor onEnterViewport={onScrollToBottom} scrollContainerRef={moviesScrollPanel} />
        </ScrollPanel>
    </div>);

    function goToMovie(movie) {
        viewMeConsole.clog("GOTO-MOVIE", movie);
    }

    function searchInputEvent(e, page) {
        //if (currentlyFetching) return;
        setCurrentPage(page || 1);
        requestService.search(e.target.value, (page || currentPage)).then(res => {
            if (!res.data.length) {
                setCurrentlyFetching(null);
                setSearchResult([...searchResult/*, { preview_image: Database.getAsset("green1") }, { preview_image: Database.getAsset("green2") }*/])
                return;
            }
            setCurrentlyFetching(e.target.value);
            setSearchResult([ ...searchResult, ...res.data ]);
        }).catch(err => {
            viewMeConsole.error(err);
        });
    }

    function onScrollToBottom(e) {
        if (!currentlyFetching) return;
        searchInputEvent({ target: { value: currentlyFetching }}, currentPage+1)
    }

}

export default Search;