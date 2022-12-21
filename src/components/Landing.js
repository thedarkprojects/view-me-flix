import React from "react";
import { useLocation } from 'react-router-dom';

function Landing() {

    const location = useLocation();
    const user = location.state.user;

    React.useEffect(() => {
        console.log(">>>>>>", user)
    }, []);

    return (
        <div>Hello</div>
    )
}

export default Landing;