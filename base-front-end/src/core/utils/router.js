const screens = {};

export function registerScreen(name, renderFn) {
  screens[name] = renderFn;
}

export function navigate(name) {
  const view = screens[name]?.();
  document.getElementById('app').innerHTML = view || '<h1>404</h1>';
  window.history.pushState({}, '', name);
}

window.onpopstate = () => {
  navigate(location.pathname.slice(1));
};

