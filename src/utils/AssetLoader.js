
import green1 from "../assets/images/green1.jpg";
import green2 from "../assets/images/green2.jpg";
import plus_add from "../assets/images/plus_add.png";

export const AssetLoader = {

    // assets
    getAsset(asset) {
        if (asset === "green1") return green1;
        if (asset === "green2") return green2;
        if (asset === "plus_add") return plus_add;
        return plus_add;
    },

};