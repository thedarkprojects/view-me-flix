
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
        <span className="title">{window.viewmore.i18nData.settings}</span>
        <div className="group" style={{ marginTop: 30 }}>
            <span className="title">{window.viewmore.i18nData.provider_address}</span>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                <InputText ref={pluginHostInputRef} defaultValue={Database.getPluginHost(user)} fill/>
                <Button alignText={Alignment.LEFT} scheme={user.color_scheme} style={{ marginLeft: 10 }} text={window.viewmore.i18nData.save}
                    onClick={() => Database.updatePluginHost(user, pluginHostInputRef.current.value())}/>
            </div>
        </div>
        <hr/>
        <div className="group" style={{ marginTop: 30 }}>
            <Button scheme={Scheme.LIGHT} alignText={Alignment.LEFT} style={{ paddingLeft: 0, fontSize: 16 }}
                text={`${window.viewmore.i18nData.language}: ${window.viewmore.i18nData._}`} onClick={changeLanguageEvent} textOnly fill/>
        </div>
        <hr/>
        <div className="group" style={{ marginTop: 30 }}>
            <span className="title">{window.viewmore.i18nData.genres}</span>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
                {Object.keys(genres).map(key => {
                    const genre = genres[key];
                    return (<Checkbox key={key} scheme={user.color_scheme} style={{ marginRight: 15 }} 
                        checked={genre.active} onChange={(e) => Database.toggleGenreActive(genre, e.checked)}
                        label={key}/>)
                })}
                <Button scheme={user.color_scheme} text={window.viewmore.i18nData.add_genre} onClick={addGenreEvent} textOnly/>
            </div>
            <span className="norseu-warning-text" style={{ marginTop: 10 }}>{window.viewmore.i18nData.reload_to_apply_genre}</span>
        </div>
        <hr/>
        <div className="group" style={{ marginTop: 30 }}>
            <span className="title">{window.viewmore.i18nData.media_sources}</span>
            <div className="section">
                {mediaSources.map(mediaSource => <Checkbox scheme={user.color_scheme} 
                    checked={mediaSource.active} label={mediaSource.name} 
                    onChange={(e) => Database.toggleMediaSource(user, mediaSource, e.checked)}/>)}
            </div>
            <Button alignText={Alignment.LEFT} scheme={user.color_scheme} style={{ marginTop: 20, marginBottom: 10 }} text={window.viewmore.i18nData.add_media_source} fill
                onClick={addSourceDialogEvent}/>
            <Button alignText={Alignment.LEFT} scheme={user.color_scheme} style={{ marginTop: 10, marginBottom: 10 }} text={window.viewmore.i18nData.import_media_source} fill
                onClick={importDialogEvent}/>
        </div>
        <hr/>
        <div className="group">
            <span className="title">{window.viewmore.i18nData.middleware_address}</span>
            <span style={{ marginTop: 10, marginBottom: 3 }}>{window.viewmore.i18nData.your_personal_middleware_address}: <b>{BaseService.StartupBaseUrl}</b></span>
            <span style={{ marginBottom: 5 }}>{window.viewmore.i18nData.network_proxy_client_addresses}: 
            {clientProxyAddresses.map((clientProxyAddress, index) => <a key={index} style={{ marginLeft: 2, marginRight: 2 }} target="_blank" href={clientProxyAddress}>{clientProxyAddress}/client</a>)}</span>
            <span className="norseu-warning-text" style={{ marginBottom: 10 }}>{window.viewmore.i18nData.network_proxy_client_addresses_desc1} 
                ({clientProxyAddresses.map((clientProxyAddress, index) => <a key={index} style={{ marginLeft: 2, marginRight: 2 }} target="_blank" href={clientProxyAddress}>{clientProxyAddress}/client</a>)}) 
                {window.viewmore.i18nData.network_proxy_client_addresses_desc2}</span>
            <InputText style={{ marginBottom: 25, marginTop: 10 }} ref={middlewareAddressRef}
                defaultValue={BaseService.BaseUrl}
                inputStyle={{ marginTop: 5 }} label={window.viewmore.i18nData.custom_middleware_address_with_port} 
                helpLabel={<span className="norseu-warning-text">{window.viewmore.i18nData.custom_middleware_address_with_port_desc}
                    (<a href={BaseService.StartupBaseUrl}>{BaseService.StartupBaseUrl}</a>)</span>} fill/>
            <Button alignText={Alignment.LEFT} scheme={user.color_scheme} style={{ marginTop: 10 }} 
                text={window.viewmore.i18nData.update_middleware_address} onClick={changeMiddlewareAddress} fill/>
        </div>
        <hr/>
        <div className="group">
            <Button alignText={Alignment.LEFT} scheme={user.color_scheme} style={{ marginTop: 10, marginBottom: 20 }} 
                text={window.viewmore.i18nData.view_middleware_log} onClick={viewMiddlewareLog} fill/>
            <Button alignText={Alignment.LEFT} scheme={Scheme.SECONDARY} style={{ marginBottom: 20 }} 
                text={window.viewmore.i18nData.check_for_update} onClick={checkNewVersionEvent} fill/>
            <span styel={{ marginTop: 20 }} className="title">{window.viewmore.i18nData.version}: {Database.VERSION}</span>
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
            onHide={() => setLogDialogContent(null)} icons={[ <Button onClick={clearMiddlewareLog} text={window.viewmore.i18nData.clear_log} style={{ marginRight: 20 }} /> ]}
            maximized maximizable>
            <textarea style={{ height: "100%", width: "100%", color: "white", background: "black" }} 
                readOnly>{logDialogContent}</textarea>
        </Dialog>
    </ScrollPanel>);

    function changeLanguageEvent() {
        let currentLanguage = Database.getLanguage(user);
        loadingDialog({}, {
            loadingIcon: "fas fa-spinner fa-pulse",
            onLoading: (params, dialog) => {
                requestService.getAvailableLanguages(pluginHostInputRef.current.value()).then((res) => {
                    Database.updatePluginHost(user, pluginHostInputRef.current.value());
                    dialog.update({
                        message: (<div className="ms-list">
                                <p style={{ marginTop: 0, marginBottom: 10, fontWeight: "bold" }}>{window.viewmore.i18nData.available_languages}</p>
                                {res.data.map(language => {
                                    const isCurrentLanguage = currentLanguage._ === language.label;
                                    return (<div className="item lang">
                                        <Button scheme={user.color_scheme} onClick={() => changeLanguage(dialog, language)}
                                            text={`${language.label}${isCurrentLanguage ? ` (${window.viewmore.i18nData.active})` : ""}`} textOnly/>
                                    </div>);
                                })}
                            </div>),
                        icon: null,
                        confirmLabel: window.viewmore.i18nData.close,
                        confirmScheme: Scheme.DANGER
                    });
                }).catch(err => {
                    dialog.update({
                        message: err.message,
                        icon: "fa fa-info",
                        confirmLabel: window.viewmore.i18nData.close,
                        confirmScheme: Scheme.DANGER
                    });
                });
            }
        });
    }

    function changeLanguage(dialog, language) {
        dialog.update({
            style: { minWidth: "max-content" },
            message: null,
            confirmLabel: null,
            icon: "fas fa-spinner fa-pulse",
        });
        requestService.getLanguageData(pluginHostInputRef.current.value(), language).then((res) => {
            Database.changeLanguage(user, res.data);
            window.location.reload();
        }).catch(err => dialog.update({ icon: null, message: err.message, confirmLabel: window.viewmore.i18nData.cancel }));
    }

    function addGenreEvent() {
        alertDialog({
            message: (<div>
                <span style={{ fontWeight: "bold" }}>{window.viewmore.i18nData.add_new_genre}</span>
                <InputText ref={newGenreLabelRef} style={{ marginTop: 10, marginBottom: 10 }} 
                    label={window.viewmore.i18nData.genre_label_eg} scheme={user.color_scheme} fill/>
                <TextArea ref={newGenreAliasesRef} inputStyle={{ color: "white" }} label={window.viewmore.i18nData.aliases_seperated_by_comma} scheme={user.color_scheme} fill/>
                <span ref={dialogInputErrorRef} style={{ color: "red" }}></span>
            </div>),
            confirmLabel: window.viewmore.i18nData.add,
            cancelLabel: window.viewmore.i18nData.cancel,
            confirmScheme: user.color_scheme,
            cancelScheme: Scheme.SECONDARY,
            onConfirm: () => {
                if (!newGenreLabelRef.current.value()) {
                    dialogInputErrorRef.current.innerHTML = window.viewmore.i18nData.genre_value_is_required;
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
                    Database.updatePluginHost(user, pluginHostInputRef.current.value());
                    dialog.update({
                        style: { minWidth: "30%" },
                        message: (<div className="ms-list">
                                <p style={{ marginTop: 0, marginBottom: 10, fontWeight: "bold" }}>{window.viewmore.i18nData.available_media_plugin}</p>
                                {res.data.media_plugins.map(media_plugin => {
                                    let installedCopy = Database.getMediaSources(user, [{ field: "name", value: media_plugin.name }], true);
                                    installedCopy = (installedCopy.length ? installedCopy[0] : null);
                                    return (<div className="item">
                                        <span>{media_plugin.name} ({media_plugin.base_url})</span>
                                        <Button scheme={user.color_scheme} text={installedCopy ? window.viewmore.i18nData.uninstall : window.viewmore.i18nData.install} 
                                            onClick={() => uninstallInstallMediaPlugin(dialog, media_plugin, installedCopy)} textOnly/>
                                    </div>);
                                })}
                            </div>),
                        icon: null,
                        confirmLabel: window.viewmore.i18nData.close,
                        confirmScheme: Scheme.DANGER
                    });
                }).catch(err => {
                    dialog.update({
                        message: err.message,
                        icon: "fa fa-info",
                        confirmLabel: window.viewmore.i18nData.close,
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
                }).catch(err => dialog.update({ icon: null, message: err.message, confirmLabel: window.viewmore.i18nData.cancel }));
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
            }).catch(err => dialog.update({ icon: null, message: err.message, confirmLabel: window.viewmore.i18nData.cancel }));
        } else {
            Database.addMediaSource(user, mediaPlugin);
            window.location.reload();
        }
    }

    function importDialogEvent() {
        alertDialog({
            style: { minWidth: "50%" },
            message: (<div style={{ width: "100%" }}>
                <span style={{ fontWeight: "bold" }}>{window.viewmore.i18nData.paste_media_source_json}</span>
                <TextArea ref={mediaSourceTextArea} scheme={user.color_scheme} 
                    inputStyle={{ color: "white", height: "30vh", marginTop: 20 }} 
                    placeholder={Database.SampleMediaSourceJson} fill/>
            </div>),
            confirmLabel: window.viewmore.i18nData.import,
            cancelLabel: window.viewmore.i18nData.cancel,
            confirmScheme: user.color_scheme,
            cancelScheme: Scheme.SECONDARY,
            onConfirm: () => {
                try {
                    const media_plugin = JSON.parse(mediaSourceTextArea.current.value());
                    let installedCopy = Database.getMediaSources(user, [{ field: "name", value: media_plugin.name }], true);
                    installedCopy = (installedCopy.length ? installedCopy[0] : null);
                    loadingDialog({}, {
                        loadingIcon: "fas fa-spinner fa-pulse",
                        onLoading: (params, dialog) => {
                            uninstallInstallMediaPlugin(dialog, media_plugin, installedCopy);
                        }
                    });
                } catch (err) {
                    alertDialog({ icon: null, message: err.message, confirmLabel: window.viewmore.i18nData.cancel });
                    return true;
                }
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
                    dialog.hide(); setLogDialogContent(res.data || window.viewmore.i18nData.log_is_empty);
                }).catch(err => {
                    dialog.update({
                        icon: "fa fa-info",
                        message: err.message,
                        confirmLabel: window.viewmore.i18nData.retry,
                        cancelLabel: window.viewmore.i18nData.close,
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
                        confirmLabel: window.viewmore.i18nData.retry,
                        cancelLabel: window.viewmore.i18nData.close,
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

    function checkNewVersionEvent() {
        loadingDialog({}, {
            loadingIcon: "fas fa-spinner fa-pulse",
            onLoading: (params, dialog) => {
                requestService.checkForUpdate(pluginHostInputRef.current.value()).then((res) => {
                    if (Database.VERSION !== res.data.version) {
                        dialog.update({
                            icon: null,
                            cancelScheme: Scheme.DANGER,
                            confirmScheme: user.color_scheme,
                            message: (<div>{window.viewmore.i18nData.new_version_desc1}
                                <br/>{window.viewmore.i18nData.new_version_desc2} {res.data.version}<br/></div>),
                            confirmLabel: window.viewmore.i18nData.download,
                            cancelLabel: window.viewmore.i18nData.close,
                            onConfirm: () => {
                                window.open(res.data.download_location, '_blank').focus();
                            }
                        });
                    } else {
                        dialog.update({
                            icon: null,
                            confirmScheme: user.color_scheme,
                            message: "Your version of view-me is upto date",
                            confirmLabel: window.viewmore.i18nData.close,
                        });
                    }
                    //dialog.hide(); setLogDialogContent(null);
                }).catch(err => {
                    dialog.update({
                        icon: "fa fa-info",
                        message: err.message,
                        confirmLabel: window.viewmore.i18nData.retry,
                        cancelLabel: window.viewmore.i18nData.close,
                        confirmScheme: user.color_scheme,
                        onConfirm: () => {
                            checkNewVersionEvent();
                        }
                    });
                })
            }
        });
    }

}

export default Settings;