import { createBrowserHistory } from 'history';
import React, { useEffect, Fragment } from "react";

export function ScrollToTop(props) {
    const history = createBrowserHistory({ forceRefresh:true });

    useEffect(() => {
        const unlisten = history.listen(() => {
            console.clear();
            console.log(props);
            window.scrollTo(0, 0);
        });

        return () => {
            unlisten();
        }
    });

    return <Fragment>{props.children}</Fragment>;
}
