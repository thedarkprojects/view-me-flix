
import { Button } from "@ronuse/norseu/core/buttons";
import { Checkbox, InputText, TextArea } from "@ronuse/norseu/core/form";
import { alertDialog, Dialog, loadingDialog } from "@ronuse/norseu/core/overlay";
import { ScrollPanel } from "@ronuse/norseu/core/panels";
import { Alignment, Scheme } from "@ronuse/norseu/core/variables";
import React from "react";
import { BaseService } from "../../services";
import { RequestService } from "../../services/RequestService";
import { Database } from "../../utils";

function Settings(props) {

    const { user } = props;
    const genres = Database.getGenres(user);
    const newGenreLabelRef = React.useRef();
    const pluginHostInputRef = React.useRef();
    const newGenreAliasesRef = React.useRef();
    const mediaSourceTextArea = React.useRef();
    const middlewareAddressRef = React.useRef();
    const dialogInputErrorRef = React.useRef();
    const requestService = new RequestService(user);
    const [logDialogContent, setLogDialogContent] = React.useState();
    const [mediaSources, setMediaSources] = React.useState(Database.getMediaSources(user));
    const [clientProxyAddresses, setClientProxyAddresses] = React.useState([ BaseService.StartupBaseUrl ]);

    React.useEffect(() => {
        requestService.getClientProxyAddress().then(res => {
            setClientProxyAddresses(res.data);
        }).catch(err => {
            console.log(err);
        })
    }, []);

    return (<ScrollPanel className="settings">
        <span className="title">Settings</span>
        <div className="group" style={{ marginTop: 30 }}>
            <Button scheme={Scheme.LIGHT} alignText={Alignment.LEFT} style={{ paddingLeft: 0, fontSize: 16 }}
                text="Language: English" onClick={changeLanguageEvent} textOnly fill/>
        </div>
        <hr/>
        <div className="group" style={{ marginTop: 30 }}>
            <span className="title">Genres</span>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
                {Object.keys(genres).map(key => {
                    const genre = genres[key];
                    return (<Checkbox key={key} scheme={user.color_scheme} style={{ marginRight: 15 }} 
                        checked={genre.active} onChange={(e) => Database.toggleGenreActive(genre, e.checked)}
                        label={key}/>)
                })}
                <Button scheme={user.color_scheme} text="Add Genre" onClick={addGenreEvent} textOnly/>
            </div>
            <span className="norseu-warning-text" style={{ marginTop: 10 }}>Reload the 
                page or restart the app to apply genre changes</span>
        </div>
        <hr/>
        <div className="group" style={{ marginTop: 30 }}>
            <span className="title">Media Sources</span>
            <InputText style={{ marginBottom: 25, marginTop: 10 }} ref={pluginHostInputRef}
                inputStyle={{ marginTop: 5 }} label="Plugin Host" defaultValue={Database.getPluginHost(user)} fill/>
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
        <hr/>
        <div className="group">
            <span className="title">Middleware Address</span>
            <span style={{ marginTop: 10, marginBottom: 3 }}>Your personal middleware address: <b>{BaseService.StartupBaseUrl}</b></span>
            <span style={{ marginBottom: 5 }}>Network Proxy Client Addresses: 
            {clientProxyAddresses.map((clientProxyAddress, index) => <a key={index} style={{ marginLeft: 2, marginRight: 2 }} target="_blank" href={clientProxyAddress}>{clientProxyAddress}/index.html</a>)}</span>
            <span className="norseu-warning-text" style={{ marginBottom: 10 }}>For device unable to download the app, visit any of these proxy client address 
                ({clientProxyAddresses.map((clientProxyAddress, index) => <a key={index} style={{ marginLeft: 2, marginRight: 2 }} target="_blank" href={clientProxyAddress}>{clientProxyAddress}/index.html</a>)}) 
                in your browser to access the application. Note that you must be connected to the same network (Wifi, Ethernet e.t.c.) as this instance.</span>
            <InputText style={{ marginBottom: 25, marginTop: 10 }} ref={middlewareAddressRef}
                defaultValue={BaseService.BaseUrl}
                inputStyle={{ marginTop: 5 }} label="Custom middleware address (with port)" 
                helpLabel={<span className="norseu-warning-text">Changing your middleware address means that you will be fetching media through the specified
                    address (usually another user view more middleware). Your middlware address works if you are on the same 
                    network usually Wifi, Ethernet or WAN. If you are not getting any media from the set middleware address specified in the text box
                    change the value to your personal middleware address ({BaseService.StartupBaseUrl})</span>} fill/>
            <Button alignText={Alignment.LEFT} scheme={user.color_scheme} style={{ marginTop: 10 }} 
                text="Update Middleware Address" onClick={changeMiddlewareAddress} fill/>
        </div>
        <hr/>
        <div className="group">
            <Button alignText={Alignment.LEFT} scheme={user.color_scheme} style={{ marginTop: 10 }} 
                text="View Middlware Log" onClick={viewMiddlewareLog} fill/>
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
        <Dialog header={"Middleware Log"} isVisible={logDialogContent} contentClassName="log-dialog-content"
            onHide={() => setLogDialogContent(null)} icons={[ <Button onClick={clearMiddlewareLog} text="Clear Log" style={{ marginRight: 20 }} /> ]}
            maximized maximizable>
            <textarea style={{ height: "100%", width: "100%", color: "white", background: "black" }} 
                readOnly>{logDialogContent}</textarea>
        </Dialog>
    </ScrollPanel>);

    function changeLanguageEvent() {

    }

    function addGenreEvent() {
        alertDialog({
            message: (<div>
                <span style={{ fontWeight: "bold" }}>Add new Genre</span>
                <InputText ref={newGenreLabelRef} style={{ marginTop: 10, marginBottom: 10 }} label="Genre Label e.g. Action" 
                    scheme={user.color_scheme} fill/>
                <TextArea ref={newGenreAliasesRef} inputStyle={{ color: "white" }} label="Aliases seperated by comma" scheme={user.color_scheme} fill/>
                <span ref={dialogInputErrorRef} style={{ color: "red" }}></span>
            </div>),
            confirmLabel: "Add",
            cancelLabel: "Cancel",
            confirmScheme: user.color_scheme,
            cancelScheme: Scheme.SECONDARY,
            onConfirm: () => {
                if (!newGenreLabelRef.current.value()) {
                    dialogInputErrorRef.current.innerHTML = "The Genre value is required";
                    return true;
                }
                const newGenre = {
                    active: true,
                    label: newGenreLabelRef.current.value(),
                    aliases: newGenreAliasesRef.current.value().split(",")
                };
                Database.addNewGenre(user, newGenre);
                window.location.reload();
            }
        });
    }
    
    function addSourceDialogEvent() {
        loadingDialog({}, {
            loadingIcon: "fas fa-spinner fa-pulse",
            onLoading: (params, dialog) => {
                requestService.getMediaPlugins(pluginHostInputRef.current.value()).then((res) => {
                    Database.updatePluginHost(user, res.config.url);
                    dialog.update({
                        style: { minWidth: "30%" },
                        message: (<div className="ms-list">
                                <p style={{ marginTop: 0, marginBottom: 10, fontWeight: "bold" }}>Available Media Plugins</p>
                                {res.data.media_plugins.map(media_plugin => {
                                    let installedCopy = Database.getMediaSources(user, [{ field: "name", value: media_plugin.name }], true);
                                    installedCopy = (installedCopy.length ? installedCopy[0] : null);
                                    return (<div className="item">
                                        <span>{media_plugin.name} ({media_plugin.base_url})</span>
                                        <Button scheme={user.color_scheme} text={installedCopy ? "Uninstall" : "Install"} 
                                            onClick={() => uninstallInstallMediaPlugin(dialog, media_plugin, installedCopy)} textOnly/>
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

    function uninstallInstallMediaPlugin(dialog, mediaPlugin, installedCopy) {
        if (installedCopy) {
            Database.removeMediaSource(user, installedCopy);
            if (!Database.getMediaSourcByScrapperClassName(installedCopy.scrapper_class_name).length) {
                dialog.update({
                    style: { minWidth: "max-content" },
                    message: null,
                    confirmLabel: null,
                    icon: "fas fa-spinner fa-pulse",
                });
                requestService.unInstallMediaSource(pluginHostInputRef.current.value(), installedCopy).then(() => {
                    window.location.reload();
                }).catch(err => dialog.update({ icon: null, message: err.message, confirmLabel: "Cancel" }));
            } else {
                window.location.reload();
            }
            return;
        }
        if (!Database.getMediaSourcByScrapperClassName(mediaPlugin.scrapper_class_name).length) {
            dialog.update({
                style: { minWidth: "max-content" },
                message: null,
                confirmLabel: null,
                icon: "fas fa-spinner fa-pulse",
            });
            requestService.installMediaSource(pluginHostInputRef.current.value(), mediaPlugin).then(() => {
                Database.addMediaSource(user, mediaPlugin);
                window.location.reload();
            }).catch(err => dialog.update({ icon: null, message: err.message, confirmLabel: "Cancel" }));
        } else {
            Database.addMediaSource(user, mediaPlugin);
            window.location.reload();
        }
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

    function changeMiddlewareAddress() {
        const newMiddlewareAddress = middlewareAddressRef.current.value();
        if (!newMiddlewareAddress) {
            return;
        }
        Database.setMiddlewareUrl(newMiddlewareAddress);
        window.location.reload();
    }

    function viewMiddlewareLog() {
        loadingDialog({}, {
            loadingIcon: "fas fa-spinner fa-pulse",
            onLoading: (params, dialog) => {
                requestService.getMiddlewareLog().then((res) => {
                    dialog.hide(); setLogDialogContent(res.data || "Log is empty");
                }).catch(err => {
                    dialog.update({
                        icon: "fa fa-info",
                        message: err.message,
                        confirmLabel: "Retry",
                        cancelLabel: "Close",
                        confirmScheme: user.color_scheme,
                        onConfirm: () => {
                            viewMiddlewareLog();
                        }
                    });
                })
            }
        });
    }

    function clearMiddlewareLog() {
        loadingDialog({}, {
            loadingIcon: "fas fa-spinner fa-pulse",
            onLoading: (params, dialog) => {
                requestService.clearMiddlewareLog().then((res) => {
                    dialog.hide(); setLogDialogContent(null);
                }).catch(err => {
                    dialog.update({
                        icon: "fa fa-info",
                        message: err.message,
                        confirmLabel: "Retry",
                        cancelLabel: "Close",
                        confirmScheme: user.color_scheme,
                        onConfirm: () => {
                            clearMiddlewareLog();
                        }
                    });
                })
            }
        });
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