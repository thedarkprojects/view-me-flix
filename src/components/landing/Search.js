
import React from "react";
import { Database, viewMeConsole } from "../../utils";
import { InputText } from "@ronuse/norseu/core/form";
import { ScrollPanel } from "@ronuse/norseu/core/panels";
import { RequestsService } from "../../services/RequestsService";

function Search(props) {

    const user = props.user;
    const [searchResult, setSearchResult] = React.useState([]);
    const requestService = new RequestsService();

    React.useEffect(() => {
        
    }, []);

    return (<div className="search">
        <div className="search-panel">
            <InputText scheme={user.color_scheme} leftIcon="fa fa-search" placeholder="Search" fill onInput={searchInputEvent}/>
        </div>
        <ScrollPanel scheme={user.color_scheme} className="movie-list vertical">
            {searchResult.map(movie => {
                return (<div onClick={() => goToMovie(movie)} className={`movie-item ${user.color_scheme}`}
                    style={{ backgroundImage: `url('${movie.preview_image.replace("178x268", "500x700")}')` }}></div>);
            })}
        </ScrollPanel>
    </div>);

    function goToMovie(movie) {
        viewMeConsole.clog("GOTO-MOVIE", movie);
    }

    function searchInputEvent(e) {
        requestService.search(e.target.value).then(res => {
            if (!res.data.length) {
                setSearchResult([{ preview_image: Database.getAsset("green1") }, { preview_image: Database.getAsset("green2") }])
                return;
            }
            setSearchResult(res.data);
        }).catch(err => {
            viewMeConsole.error(err);
        });
    }

}

export default Search;