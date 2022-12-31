import React from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { Button } from '@ronuse/norseu/core/buttons';
import { Alignment, Scheme } from "@ronuse/norseu/core/variables";
import { TabPane, TabPanel } from '@ronuse/norseu/core/panels';
import Home from "./landing/Home";
import Search from "./landing/Search";
import Settings from "./landing/Settings";
import Downloads from "./landing/Downloads";

function Landing() {

    const navigate = useNavigate();
    const location = useLocation();
    const { user, genre, cast } = location.state;

    React.useEffect(() => {
        //console.log(">>>>>>", user) 
    }, []);
    if (!user) navigate("/");

    return (<div className="landing">
        <TabPane scheme={user?.color_scheme} activeTabIndex={0} alignNavigator={Alignment.BOTTOM}>
            <TabPanel title={landingIcon("fa fa-home", "Home")} contentClassName="landing-tab-content">
                <Home user={user} genre={genre} cast={cast}/>
            </TabPanel>
            <TabPanel title={landingIcon("fa fa-search", "Search")}>
                <Search user={user} />
            </TabPanel>
            {/** <TabPanel title={landingIcon("fa fa-ship", "Grand Fleet")}>
                <Downloads user={user} />
            </TabPanel> **/}
            <TabPanel title={landingIcon("fa fa-cog", "Settings")}>
                <Settings user={user} />
            </TabPanel>
        </TabPane>
    </div>);

    function landingIcon(icon, label, oevent) {
        return (<div className="landing-tab-button" onClick={oevent}>
            <i className={icon}></i>
            <span>{label}</span>
        </div>)
    }

}

export default Landing;