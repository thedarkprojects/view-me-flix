import React from "react";
import { useLocation } from 'react-router-dom';
import { Button } from '@ronuse/norseu/core/buttons';
import { Alignment, Scheme } from "@ronuse/norseu/core/variables";
import { TabPane, TabPanel } from '@ronuse/norseu/core/panels';
import Home from "./landing/Home";
import Search from "./landing/Search";
import More from "./landing/More";
import Downloads from "./landing/Downloads";

function Landing() {

    const location = useLocation();
    const user = location.state.user;

    React.useEffect(() => {
        //console.log(">>>>>>", user)
    }, []);

    return (<div className="landing">
        <TabPane scheme={user.color_scheme} activeTabIndex={0} renderActiveTabOnly alignNavigator={Alignment.BOTTOM}>
            <TabPanel title={landingIcon("fa fa-home", "Home")} contentClassName="landing-tab-content">
                <Home user={user}/>
            </TabPanel>
            <TabPanel title={landingIcon("fa fa-search", "Search")}>
                <Search user={user}/>
            </TabPanel>
            <TabPanel title={landingIcon("fa fa-download", "Downloads")}>
            <Downloads user={user}/>
            </TabPanel>
            <TabPanel title={landingIcon("fa fa-list", "More")}>
            <More user={user}/>
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