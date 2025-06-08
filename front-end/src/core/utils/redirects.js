import { verifyToken } from "@utils/apimanager.js";
import { navigate } from "@utils/router.js";


export function redirectIfNotLoggedIn() {
    verifyToken(localStorage.getItem("authToken")).then(valid => {
        if (!valid) navigate("login");
    });
}

export function redirectIfLoggedIn() {
    verifyToken(localStorage.getItem("authToken")).then(valid => {
        if (valid) navigate("menu");
    });
}