import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AssetLoader, Database, viewMeConsole } from "../utils";
import { alertDialog } from "@ronuse/norseu/core/overlay";
import { Dropdown, InputText, PasswordInput } from "@ronuse/norseu/core/form";
import { Alignment, Scheme } from "@ronuse/norseu/core/variables";

function SelectUser() {

    const navigate = useNavigate();
    const addErrorRef = React.useRef();
    const usernameRef = React.useRef();
    const passwordRef = React.useRef();
    const profileUrlRef = React.useRef();
    const colorSchemeRef = React.useRef();
    const [editMode, setEditMode] = React.useState(false);
    const [users, setUsers] = React.useState(Database.getUsers(AssetLoader.getAsset("plus_add")));
    const colorDropdownOptions = Object.keys(Scheme).map((scheme) => {
        return {
            label: scheme,
            value: Scheme[scheme],
            icon: <div className="scheme-icon" style={{ background: Database.getColorHex([Scheme[scheme]]) }}></div>
        };
    });

    return (<div className="select-user">
        <Link to="/" className="app-name" style={{ fontSize: 50 }}>VM</Link>
        <div className="users-panel">
            <span style={{ fontSize: 40, textAlign: "center" }}>{window.viewmore.i18nData.who_s_watching}</span>
            <div className="users-list">
                {users.map(user => {
                    let style = { borderColor: Database.getColorHex(user.color_scheme), backgroundImage: `url('${user.profile_piture}')` };
                    if (!user.profile_piture) {
                        style = {
                            borderTopColor: `${Database.getColorHex(user.color_scheme)}`,
                            background: `linear-gradient(180deg, transparent 0, white 250%)`,
                            backgroundColor: `${Database.getColorHex(user.color_scheme)}`
                        }
                    }
                    if (user.id === 0) style.backgroundSize = "70%";
                    return <div key={user.id} className={`user-item  ${user.id == 0 && editMode ? "norseu-disabled" : ""}`} onClick={(e) => navigateToUserViewBoard(user)}>
                        {buildSingleProfilePicture(user, style)}
                        <span>{user.username}</span>
                    </div>
                })}
            </div>
            <button onClick={removeUserAccount} className="skeleton-button" style={{ marginTop: 30 }}>{!editMode ? window.viewmore.i18nData.manage_profiles : window.viewmore.i18nData.done}</button>
        </div>
    </div>);

    function buildSingleProfilePicture(user, style) {
        return (<div className={`default`} style={style}>
            <div className={`eyes ${user.profile_piture ? "invisible" : ""}`}><div></div><div></div></div>
            <div className={`mouth ${user.profile_piture ? "invisible" : ""}`}></div>
            {user.id > 0 && editMode ? <div onClick={() => editProfile(user)} className="edit-panel"><i className="fa fa-pen" style={{ margin: "auto" }}></i></div> : null}
        </div>);
    }

    function askForPassword(user, cb) {
        alertDialog({
            message: <div style={{ marginBottom: 10 }}>
                <PasswordInput inputStyle={{ marginTop: 15, marginBottom: 10 }} ref={passwordRef} 
                    label={window.viewmore.i18nData.password} scheme={Scheme.LIGHT} 
                    onInput={() => addErrorRef.current.innerText ? addErrorRef.current.innerText = null : null} fill toggleMask />
                <span ref={addErrorRef} style={{ color: "red" }}></span>
            </div>,
            cancelLabel: "Cancel",
            confirmLabel: "Continue",
            confirmScheme: Scheme.SUCCESS,
            onConfirm: () => {
                if (passwordRef.current.value() === user.password) {
                    cb(user, passwordRef.current.value());
                    return;
                }
                addErrorRef.current.innerText = "Password does not match";
                return true;
            }
        });
    }

    function navigateToUserViewBoard(user) {
        if (editMode) return;
        if (user.id != 0) {
            if (!user.password) {
                navigate("/dashboard", { state: { user } });
                return
            }
            askForPassword(user, () => {
                navigate("/dashboard", { state: { user } });
            })
            return;
        }
        alertDialog({
            style: { minWidth: "30%" },
            message: (<div className="add-user-dialog">
                <span>{window.viewmore.i18nData.add_new_user}</span>
                <InputText label={window.viewmore.i18nData.username} ref={usernameRef} placeholder="" scheme={Scheme.LIGHT} fill />
                <Dropdown ref={colorSchemeRef} label={window.viewmore.i18nData.color_scheme} scheme={Scheme.LIGHT} options={colorDropdownOptions} matchTargetSize fill selectedOptionIndex={3} />
                <InputText label={window.viewmore.i18nData.profile_picture_url} ref={profileUrlRef} placeholder="" scheme={Scheme.LIGHT} fill />
                <PasswordInput ref={passwordRef} label={window.viewmore.i18nData.password} scheme={Scheme.LIGHT} defaultValue={user.password} fill />
                <span ref={addErrorRef} style={{ color: "red" }}></span>
            </div>),
            confirmLabel: window.viewmore.i18nData.add_user,
            cancelLabel: window.viewmore.i18nData.cancel,
            confirmScheme: Scheme.SUCCESS,
            cancelScheme: Scheme.SECONDARY,
            scheme: Scheme.DANGER,
            alignFooter: Alignment.CENTER,
            onConfirm: () => {
                if (!usernameRef.current.value()) {
                    addErrorRef.current.innerText = window.viewmore.i18nData.err_username_requires;
                    return true;
                }
                const user = {
                    username: usernameRef.current.value(),
                    password: passwordRef.current.value(),
                    color_scheme: colorSchemeRef.current.value(),
                    profile_piture: profileUrlRef.current.value(),
                };
                setUsers(Database.addNewUser(user, AssetLoader.getAsset("plus_add")));
                return false;
            },
        });
    }

    function editProfile(user, checkPassword = true) {
        if (checkPassword && user.password) {
            askForPassword(user, (user) => {
                editProfile(user, false);
            })
            return;
        }
        setEditMode(false);
        alertDialog({
            style: { minWidth: "30%" },
            message: (<div className="add-user-dialog">
                <span>{window.viewmore.i18nData.update_user_account}</span>
                <InputText ref={usernameRef} label={window.viewmore.i18nData.username} scheme={Scheme.LIGHT} defaultValue={user.username} fill />
                <Dropdown ref={colorSchemeRef} label={window.viewmore.i18nData.color_scheme} scheme={Scheme.LIGHT} options={colorDropdownOptions} matchTargetSize fill
                    selectedOptionIndex={colorDropdownOptions.findIndex(x => x.value === user.color_scheme)} />
                <InputText ref={profileUrlRef} label={window.viewmore.i18nData.profile_picture_url} defaultValue={user.profile_piture} scheme={Scheme.LIGHT} fill />
                <PasswordInput ref={passwordRef} label={window.viewmore.i18nData.password} scheme={Scheme.LIGHT} defaultValue={user.password} fill />
                <span ref={addErrorRef} style={{ color: "red" }}></span>
            </div>),
            alignFooter: Alignment.CENTER,
            confirmLabel: window.viewmore.i18nData.delete_user_account,
            cancelLabel: window.viewmore.i18nData.done,
            confirmScheme: Scheme.DANGER,
            cancelScheme: Scheme.SECONDARY,
            onConfirm: () => {
                alertDialog({
                    message: (<p>
                        Are you sure you want to delete this account <b>{user.username}</b>. <br />
                        Your watch and movie data will be deleted.
                    </p>),
                    icon: "fa fa-trash-alt",
                    confirmLabel: window.viewmore.i18nData.remove_email,
                    cancelLabel: window.viewmore.i18nData.cancel,
                    confirmScheme: Scheme.DANGER,
                    onConfirm: () => {
                        setUsers(Database.deleteUser(user, AssetLoader.getAsset("plus_add")));
                    },
                });
            },
            onCancel: () => {
                user.username = usernameRef.current.value();
                user.password = passwordRef.current.value();
                user.color_scheme = colorSchemeRef.current.value();
                user.profile_piture = profileUrlRef.current.value();
                setUsers(Database.updateUser(user, AssetLoader.getAsset("plus_add")));
            }
        });
    }

    function removeUserAccount() {
        setEditMode(!editMode);
    }
}

export default SelectUser;