
import { Button, ButtonGroup } from "@ronuse/norseu/core/buttons";
import { Dropdown } from "@ronuse/norseu/core/form";
import { alertDialog } from "@ronuse/norseu/core/overlay";
import { ScrollPanel } from "@ronuse/norseu/core/panels";
import { Alignment, Scheme } from "@ronuse/norseu/core/variables";
import React from "react";
import { Database, viewMeConsole } from "../../utils";

function WatchShow(props) {

    const { user, media, navigate } = props;
    const [isFavourite, setIsFavourite] = React.useState(Database.isFavourite(media));

    return (null);

    

}

export default WatchShow;