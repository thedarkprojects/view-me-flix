import React from "react";
import { Link } from "react-router-dom";
import { useNavigate  } from "react-router-dom";
import { Database, viewMeConsole } from "../utils";
import { alertDialog } from "@ronuse/norseu/core/overlay";
import { Alignment, Scheme } from "@ronuse/norseu/core/variables";
import { Dropdown, InputText } from "@ronuse/norseu/core/form";

function SelectUser() {

    const navigate = useNavigate();
    const addErrorRef = React.useRef();
    const usernameRef = React.useRef();
    const profileUrlRef = React.useRef();
    const colorSchemeRef = React.useRef();
    const [editMode, setEditMode] = React.useState(false);
    const [users, setUsers] = React.useState(Database.getUsers());
    const colorDropdownOptions = [
        { label: "Red", value: "#a82828" },
        { label: "Blue", value: "#316aa3" },
        { label: "Green", value: "#31a34e" },
        { label: "Yellow", value: "#c2ae2f" },
        { label: "Purple", value: "#c22fb1" },
    ];

    return (<div className="select-user">
        <Link to="/" className="app-name" style={{ fontSize: 50 }}>VM</Link>
        <div className="users-panel">
            <span style={{ fontSize: 40 }}>Who's watching?</span>
            <div className="users-list">
                {users.map(user => {
                    let style = { borderColor: user.color_scheme, backgroundImage: `url('${user.profile_piture}')` };
                    if (!user.profile_piture) {
                        style = {
                            borderTopColor: `${user.color_scheme}`,
                            background: `linear-gradient(180deg, transparent 0, white 250%)`,
                            backgroundColor: `${user.color_scheme}`
                        }
                    }
                    if (user.id === 0) style.backgroundSize = "70%";
                    return <div key={user.id} className={`user-item  ${user.id == 0 && editMode ? "norseu-disabled" : ""}`} onClick={(e) => navigateToUserViewBoard(user)}>
                        {buildSingleProfilePicture(user, style)}
                        <span>{user.username}</span>
                    </div>
                })}
            </div>
            <button onClick={removeUserAccount} className="skeleton-button" style={{ marginTop: 30 }}>{!editMode ? "Manage Profiles" : "Done"}</button>
        </div>
    </div>);

    function buildSingleProfilePicture(user, style) {
        return (<div className={`default`} style={style}>
            <div className={`eyes ${user.profile_piture ? "invisible" : ""}`}><div></div><div></div></div>
            <div className={`mouth ${user.profile_piture ? "invisible" : ""}`}></div>
            {user.id > 0 && editMode ? <div onClick={() => editProfile(user)} className="edit-panel"><i className="fa fa-pen" style={{ margin: "auto" }}></i></div> : null}
        </div>);
    }

    function navigateToUserViewBoard(user) {
        if (editMode) return;
        if (user.id != 0) {
            navigate("/dashboard", { state: { user } });
            return
        }
        alertDialog({
            style: { minWidth: "30%" },
            message: (<div className="add-user-dialog">
                <span>Add new user</span>
                <InputText ref={usernameRef} placeholder="Username" scheme={Scheme.LIGHT} fill />
                <Dropdown ref={colorSchemeRef} placeholder="Color Scheme" scheme={Scheme.LIGHT} options={colorDropdownOptions} matchTargetSize fill selectedOptionIndex={2} />
                <InputText ref={profileUrlRef} placeholder="Profile picture Url (optional)" scheme={Scheme.LIGHT} fill />
                <span ref={addErrorRef} style={{ color: "red" }}></span>
            </div>),
            confirmLabel: "Add User",
            cancelLabel: "Cancel",
            confirmScheme: Scheme.SUCCESS,
            cancelScheme: Scheme.SECONDARY,
            scheme: Scheme.DANGER,
            alignFooter: Alignment.CENTER,
            onConfirm: () => {
                if (!usernameRef.current.value()) {
                    addErrorRef.current.innerText = "Error: username required";
                    return true;
                }
                const user = {
                    username: usernameRef.current.value(),
                    color_scheme: colorSchemeRef.current.value(),
                    profile_piture: profileUrlRef.current.value(),
                };
                setUsers(Database.addNewUser(user));
                return false;
            },
        });
    }

    function editProfile(user) {
        setEditMode(false);
        alertDialog({
            style: { minWidth: "30%" },
            message: (<div className="add-user-dialog">
                <span>Update User Account</span>
                <InputText ref={usernameRef} placeholder="Username" scheme={Scheme.LIGHT} defaultValue={user.username} fill />
                <Dropdown ref={colorSchemeRef} placeholder="Color Scheme" scheme={Scheme.LIGHT} options={colorDropdownOptions} matchTargetSize fill
                    selectedOptionIndex={colorDropdownOptions.findIndex(x => x.value === user.color_scheme)} />
                <InputText ref={profileUrlRef} placeholder="Profile picture Url (optional)" defaultValue={user.profile_piture} scheme={Scheme.LIGHT} fill />
                <span ref={addErrorRef} style={{ color: "red" }}></span>
            </div>),
            alignFooter: Alignment.CENTER,
            confirmLabel: "Delete User Account",
            cancelLabel: "Done",
            confirmScheme: Scheme.DANGER,
            cancelScheme: Scheme.SECONDARY,
            onConfirm: () => {
                alertDialog({
                    message: (<p>
                        Are you sure you want to delete this account <b>{user.username}</b>. <br />
                        Your watch and movie data will be deleted.
                    </p>),
                    icon: "fa fa-trash-alt",
                    confirmLabel: "Remove Email",
                    cancelLabel: "Cancel",
                    confirmScheme: Scheme.DANGER,
                    onConfirm: () => {
                        setUsers(Database.deleteUser(user));
                    },
                });
            },
            onCancel: () => {
                user.username = usernameRef.current.value();
                user.color_scheme = colorSchemeRef.current.value();
                user.profile_piture = profileUrlRef.current.value();
                setUsers(Database.updateUser(user));
            }
        });
    }

    function removeUserAccount() {
        setEditMode(!editMode);
    }
}

export default SelectUser;