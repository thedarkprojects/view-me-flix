
import React from "react";
import { Button } from "@ronuse/norseu/core/buttons";
import { Scheme } from "@ronuse/norseu/core/variables";
import { Link } from "react-router-dom";
import lispic from "../../assets/images//lispic.jpg";

function Home(props) {
    
    const user = props.user;

    React.useEffect(() => {
        console.log(">>>>>>", user)
    }, []);

    return (<div className="home" style={{ backgroundImage: `url('${lispic}')` }}>
        <div className="header">
            <Link to="/" className="app-name" style={{ fontSize: 50 }}>VM</Link>
            <Button scheme={Scheme.LIGHT} text="TV Shows" textOnly/>
            <Button scheme={Scheme.LIGHT} text="Movies" textOnly/>
            <Button scheme={Scheme.LIGHT} text="My List" textOnly/>
        </div>
    </div>);

}

export default Home;