
import { Button } from "@ronuse/norseu/core/buttons";
import { Checkbox } from "@ronuse/norseu/core/form";
import { ScrollPanel } from "@ronuse/norseu/core/panels";
import { Alignment, Scheme } from "@ronuse/norseu/core/variables";
import React from "react";

function Settings(props) {

    const { user } = props;

    return (<ScrollPanel className="settings">
        <span className="title">Settings</span>
        <div className="group" style={{ marginTop: 10 }}>
            <Button scheme={Scheme.LIGHT} alignText={Alignment.LEFT} style={{ paddingLeft: 0, fontSize: 16 }}
                text="Language: English" textOnly fill/>
        </div>
        <hr/>
        <div className="group">
            <span className="title">Media Sources</span>
            <div className="section">
                <Checkbox scheme={user.color_scheme} label="Soap2day.rs"/>
                <Checkbox scheme={user.color_scheme} label="fzmovies.net"/>
                <Checkbox scheme={user.color_scheme} label="123animes.mobi"/>
            </div>
            <Button alignText={Alignment.LEFT} scheme={user.color_scheme} style={{ marginTop: 20, marginBottom: 10 }} text="Add Media Source"/>
        </div>
        <hr/>
        <div className="group">
            <span className="title">Data Management</span>
            <Button alignText={Alignment.LEFT} scheme={user.color_scheme} style={{ marginTop: 10 }} 
                text="Export your data" textOnly fill/>
            <Button alignText={Alignment.LEFT} scheme={user.color_scheme} style={{ marginTop: 10 }} 
                text="Import data" textOnly fill/>
            <Button alignText={Alignment.LEFT} scheme={user.color_scheme} style={{ marginTop: 10 }} 
                text="Copy data from other users" textOnly fill/>
            <Button alignText={Alignment.LEFT} scheme={Scheme.DANGER} style={{ marginTop: 10 }} 
                text="Reset all your data" textOnly fill/>
        </div>
    </ScrollPanel>);

}

export default Settings;