import React from "react";
import { Database, viewMeConsole } from "../utils";
import { Scheme } from "@ronuse/norseu/core/variables";
import { alertDialog } from "@ronuse/norseu/core/overlay";
import { Dropdown, InputText } from "@ronuse/norseu/core/form";
import { Link } from "react-router-dom";

function SelectUser() {

    const addErrorRef = React.useRef();
    const usernameRef = React.useRef();
    const profileUrlRef = React.useRef();
    const colorSchemeRef = React.useRef();
    const [users, setUsers] = React.useState(Database.getUsers());
    const colorDropdownOptions = [
        { label: "Red", value: "#a82828" },
        { label: "Blue", value: "#316aa3" },
        { label: "Green", value: "#31a34e" },
        { label: "Yellow", value: "#c2ae2f" },
        { label: "Purple", value: "#c22fb1" },
    ];

    React.useEffect(() => {
        // backgroundImage: `url()`
    }, []);

    return (<div className="select-user">
        <Link to="/" className="app-name" style={{ fontSize: 50 }}>VM</Link>
        <div className="users-panel">
            <span style={{ fontSize: 40 }}>Who's watching</span>
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
                    return <div key={user.id} className="user-item" onClick={(e) => navigateToUserViewBoard(user)}>
                        {buildSingleProfilePicture(user.profile_piture, style)}
                        <span>{user.username}</span>
                    </div>
                })}
            </div>
            <button className="skeleton-button" style={{ marginTop: 30 }}>Manage Profiles</button>
        </div>
    </div>);

    function navigateToUserViewBoard(user) {
        if (user.id != 0) {
            viewMeConsole.log("USER", user)
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

    function buildSingleProfilePicture(profile_piture, style) {
        return (<div className="default" style={style}>
            <div className={`eyes ${profile_piture ? "invisible" : ""}`}><div></div><div></div></div>
            <div className={`mouth ${profile_piture ? "invisible" : ""}`}></div>
        </div>);
    }
}

export default SelectUser;