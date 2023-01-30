import { InputText, TextArea } from "@ronuse/norseu/core/form";
import { alertDialog, loadingDialog } from "@ronuse/norseu/core/overlay";
import { Alignment, Scheme } from "@ronuse/norseu/core/variables";
import React from "react";
import { useNavigate } from "react-router-dom";
import Database from "../utils/Database";

function Splash() {

    let adiag = null;
    const navigate = useNavigate();
    const splashSpan = React.useRef();
    const keyInputRef = React.useRef(null);

    React.useEffect(() => {
        setTimeout(() => splashSpan.current.classList.add("splash-animation") /*||  playButton.current.click()*/, 1500);
        if (Database.isLicensed()) {
            setTimeout(() => navigate("/select-user"), 4000);
            return;
        }
        requestAndValidateLicence();
    });

    return (<div className="splash">
        <span ref={splashSpan}>VM</span>
        {/**<button style={{ display: "none" }} ref={playButton} onClick={() => new Audio(netflix_intro_sound).play()}>Hello</button>**/}
    </div>);

    function requestAndValidateLicence(errMessage) {
        if (adiag) return;
        adiag = alertDialog({
            icon: null,
            alignFooter: Alignment.CENTER,
            confirmScheme: Scheme.PRIMARY,
            message: (<div style={{ width: "100%" }}>
                <span>Enter Licence Key</span><br />
                {errMessage ? <React.Fragment>
                    <span style={{ color: "red", fontSize: 12 }}>{errMessage}</span><br /></React.Fragment> : null}<br />
                <TextArea ref={keyInputRef} inputStyle={{ color: "white" }} fill />
            </div>),
            confirmLabel: "Continue",
            onConfirm: () => {
                const licenceKey = keyInputRef.current.value();
                adiag.hide(); adiag = null;
                loadingDialog({}, {
                    loadingIcon: "fas fa-spinner fa-pulse",
                    onLoading: (_, dialog) => {
                        if (!licenceKey) {
                            dialog.hide();
                            requestAndValidateLicence("licence key should not be empty");
                            return;
                        }
                        const valid = Database.storeLicenceKey(licenceKey);
                        if (!valid) {
                            dialog.hide();
                            requestAndValidateLicence("Invalid licence key or not new");
                            return;
                        }
                        dialog.hide();
                        navigate("/select-user");
                    }
                });
            }
        });
    }
}

export default Splash;