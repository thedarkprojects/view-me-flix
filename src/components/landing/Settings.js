
import { Button } from "@ronuse/norseu/core/buttons";
import { Checkbox, TextArea } from "@ronuse/norseu/core/form";
import { alertDialog, loadingDialog } from "@ronuse/norseu/core/overlay";
import { ScrollPanel } from "@ronuse/norseu/core/panels";
import { Alignment, Scheme } from "@ronuse/norseu/core/variables";
import React from "react";
import { RequestService } from "../../services/RequestService";
import { Database } from "../../utils";

function Settings(props) {

    const { user } = props;
    const mediaSourceTextArea = React.useRef();
    const requestService = new RequestService(user);
    const [mediaSources, setMediaSources] = React.useState(Database.getMediaSources(user));

    return (<ScrollPanel className="settings">
        <span className="title">Settings</span>
        <div className="group" style={{ marginTop: 10, display: "none" }}>
            <Button scheme={Scheme.LIGHT} alignText={Alignment.LEFT} style={{ paddingLeft: 0, fontSize: 16 }}
                text="Language: English" onClick={changeLanguageEvent} textOnly fill/>
        </div>
        <hr style={{ display: "none" }}/>
        <div className="group" style={{ marginTop: 30 }}>
            <span className="title">Media Sources</span>
            <div className="section">
                {mediaSources.map(mediaSource => <Checkbox scheme={user.color_scheme} 
                    checked={mediaSource.active} label={mediaSource.name} 
                    onChange={(e) => Database.toggleMediaSource(user, mediaSource, e.checked)}/>)}
            </div>
            <Button alignText={Alignment.LEFT} scheme={user.color_scheme} style={{ marginTop: 20, marginBottom: 10 }} text="Add Media Source" fill
                onClick={addSourceDialogEvent}/>
            <Button alignText={Alignment.LEFT} scheme={user.color_scheme} style={{ marginTop: 10, marginBottom: 10 }} text="Import Media Source" fill
                onClick={importDialogEvent}/>
        </div>
        <hr style={{ display: "none" }}/>
        <div className="group" style={{ display: "none" }}>
            <span className="title">Data Management</span>
            <Button alignText={Alignment.LEFT} scheme={user.color_scheme} style={{ marginTop: 10 }} 
                text="Export your data" onClick={exportDataEvent} textOnly fill/>
            <Button alignText={Alignment.LEFT} scheme={user.color_scheme} style={{ marginTop: 10 }} 
                text="Import data" onClick={importDataEvent} textOnly fill/>
            <Button alignText={Alignment.LEFT} scheme={user.color_scheme} style={{ marginTop: 10 }} 
                text="Copy data from other users" onClick={copyOtherUserDataEvent} textOnly fill/>
            <Button alignText={Alignment.LEFT} scheme={Scheme.DANGER} style={{ marginTop: 10 }} 
                text="Reset all your data" onClick={resetDataEvent} textOnly fill/>
        </div>
    </ScrollPanel>);

    function changeLanguageEvent() {

    }

    function addSourceDialogEvent() {
        loadingDialog({}, {
            loadingIcon: "fas fa-spinner fa-pulse",
            onLoading: (params, dialog) => {
                requestService.getMediaPlugins().then((res) => {
                    dialog.update({
                        style: { minWidth: "30%" },
                        message: (<div className="ms-list">
                                <p style={{ marginTop: 0, marginBottom: 10, fontWeight: "bold" }}>Available Media Sources</p>
                                {res.data.media_plugins.map(media_plugin => {
                                    let installedCopy = Database.getMediaSources(user, [{ field: "name", value: media_plugin.name }], true);
                                    installedCopy = (installedCopy.length ? installedCopy[0] : null);
                                    return (<div className="item">
                                        <span>{media_plugin.name} ({media_plugin.base_url})</span>
                                        <Button scheme={user.color_scheme} text={installedCopy ? "Uninstall" : "Install"} 
                                            onClick={() => uninstallInstallMediaPlugin(media_plugin, installedCopy)} textOnly/>
                                    </div>);
                                })}
                            </div>),
                        icon: null,
                        confirmLabel: "Close",
                        confirmScheme: Scheme.DANGER
                    });
                }).catch(err => {
                    dialog.update({
                        message: err.message,
                        icon: "fa fa-info",
                        confirmLabel: "Close",
                        confirmScheme: Scheme.DANGER
                    });
                });
            }
        });
    }

    function uninstallInstallMediaPlugin(mediaPlugin, installedCopy) {
        if (installedCopy) {
            Database.removeMediaSource(user, installedCopy);
            window.location.reload();
            // uninstall file from server
            return;
        }
        Database.addMediaSource(user, mediaPlugin);
        window.location.reload();
    }

    function importDialogEvent() {
        alertDialog({
            style: { minWidth: "40%" },
            message: (<div style={{ width: "100%" }}>
                <span style={{ fontWeight: "bold" }}>Paste the media source json object</span>
                <TextArea ref={mediaSourceTextArea} scheme={user.color_scheme} 
                    inputStyle={{ color: "white", height: "30vh", marginTop: 20 }} 
                    defaultValue={JSON.stringify(Database._mediaSources[1], 4)} fill/>
            </div>),
            confirmLabel: "Import",
            cancelLabel: "Cancel",
            confirmScheme: user.color_scheme,
            cancelScheme: Scheme.SECONDARY,
            onConfirm: () => {
                console.log(mediaSourceTextArea.current.value())
            }
        })
    }

    function exportDataEvent() {

    }

    function importDataEvent() {
        
    }

    function copyOtherUserDataEvent() {
        
    }

    function resetDataEvent() {
        
    }

}

export default Settings;