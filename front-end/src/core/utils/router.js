import logger from "@utils/logger.js";


const app = document.getElementById('app');
if (!app) throw new Error("No app loaded");


const screens = {};
const fallback = (`
<main style="background: #111111; height: 100dvh; display: flex; align-items: center; justify-content: center; text-align: center;">
    <h1 style="font-size: 3rem; margin: 0;">404</h1>
</main>
`);


/**
 *
 * @param name
 * @param {function(): [function(): void, string] | function(): string} renderFn
 */
export function registerScreen(name, renderFn) {
    screens[name] = renderFn;
}

function runComponent(component) {
    let func, view;

    try {
        let result = component();

        if (Array.isArray(result)) {
            [func, view] = result;
        } else {
            view = result;
            func = null;
        }
    } catch (e) {
        logger.error(`Rendering ${name} throw an error: ${e}`);
    }

    return [func, view];
}

export function navigate(name) {
    const component = screens[name];
    const screenName = component? name : 404;
    const [func, view] = runComponent(component || screens[404] || fallback);

    app.innerHTML = view;
    window.history.pushState({}, '', screenName);

    try {
        func?.();
    } catch (e) {
        logger.error(`After render func ${name} throw an error: ${e}`);
    }
}

window.onpopstate = () => navigate(location.pathname.slice(1));
window.navigate = navigate;
