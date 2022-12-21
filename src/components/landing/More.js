
import React from "react";

function More(props) {

    const ytEmbedIds = ["dQw4w9WgXcQ", "2942BB1JXFk"];

    return (<div className="video-responsive">
        <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${ytEmbedIds[Math.floor(Math.random() * (1 - 0 + 1)) + 0]}?controls=0&autoplay=1`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Embedded youtube"
        />
    </div>);

}

export default More;