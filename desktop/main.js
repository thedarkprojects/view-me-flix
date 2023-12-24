const fs = require('fs');
const path = require("path");
const Store = require('electron-store');
const { app, BrowserView, BrowserWindow } = require('electron');
const { startExpressServer } = require('../server/app');

let server;
let buildFolder = path.join(process.resourcesPath, "build");
const createWindow = (url) => {
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true,
        icon: __dirname + '/viewme.png',
    });

    let loaderLocation = "loader.html";
    let clientLocation = path.resolve("build/index.html");
    if (!fs.existsSync(clientLocation)) {
        clientLocation = path.join(process.resourcesPath, "build/index.html");
        loaderLocation = "desktop/loader.html"
    }
    if (!fs.existsSync(buildFolder)) {
        buildFolder = path.resolve("build/");
    }

    let activeView;
    let isLoadingView = false;
    let lastLoadedUrl = clientLocation;
    let urlBeforePlayer = clientLocation;
    const loadingView = new BrowserView()
    loadingView.setAutoResize({
        width: true,
        height: true,
        horizontal: true,
        vertical: false
    });
    loadingView.webContents.loadFile(loaderLocation);
    win.loadFile(clientLocation, { query: { "middlewareurl": url } });
    //win.loadURL("https://w5.123animes.mobi/anime/gintama/episode/018");

    function onLoadingStartEvent(i, url) {
        //console.log(">>>>>>>", i, url)
        const currentURL = url || win.webContents.getURL();
        if (loadingView === win.getBrowserView() || isLoadingView) return;
        if (currentURL === lastLoadedUrl) return;
        if (currentURL.includes("file://")) {
            urlBeforePlayer = currentURL;
            return;
        };
        lastLoadedUrl = currentURL;
        activeView = win.getBrowserView();
        win.setBrowserView(loadingView);
        isLoadingView = true;
        //console.log("ON START LOAD", i, currentURL, lastLoadedUrl);
        loadingView.setBounds({ x: 0, y: 0, width: win.getBounds().width, height: win.getBounds().height })
    }

    //win.webContents.on('dom-ready', onLoadingStartEvent);
    win.webContents.on('will-navigate', (_, url) => onLoadingStartEvent(1, url));
    //win.webContents.on('did-start-load', () => onLoadingStartEvent(2));
    //win.webContents.on('did-start-navigation', (e, url) => onLoadingStartEvent(3, url));
    //win.webContents.on('did-navigate-in-page', () => onLoadingStartEvent(4));
    win.webContents.on('did-finish-load', (e) => {
        const currentURL = win.webContents.getURL();
        //console.log("CALLING TON", e);
        if (!isLoadingView) return;
        isLoadingView = false;
        if (currentURL.includes("file://")) {
            if (win.getBrowserView() === loadingView) win.setBrowserView(activeView);
            return;
        };
        //console.log("ON STOP LOAD", currentURL);
        function removeWebsiteElements(count) {
            console.log("REMOVING PLAYER WEBISITE ELEMENTS", count);
            win.webContents.executeJavaScript(getMediaSourcePlayerScript(currentURL) + backButtonOnPlayerHtml(urlBeforePlayer)).then((result) => {
                console.log("RESULT FROM PLAYER TRIMMER", result);
                win.setBrowserView(activeView);
                lastLoadedUrl = currentURL;
            }).catch(err => {
                if (count <= 1) {
                    win.setBrowserView(activeView);
                    removeWebsiteElements(count + 1);
                    return;
                }
                console.error(`Retry ${count} times`, err);
            });
        }
        removeWebsiteElements(0);
    });
    win.webContents.setWindowOpenHandler((event) => {
        console.log("BLOCKING POP UP TO WEBSITE", event);
        return { action: "deny" };
    });
    win.on('close', function () {
        win = null;
    });
}

let serverOptions = {};
const getMediaSourcePlayerScript = (url) => {
    let baseUrl = url.substr(0, url.indexOf("/", 10));
    const ijscript = serverOptions.getPlayerInjectionScript(baseUrl);
    //console.log("TO LOAD SCRIPT", ijscript);
    return ijscript;
}

app.whenReady().then(() => {
    server = startExpressServer({ useAnotherPort: true, port: 7001, clientLocation: buildFolder }, (options) => {
        serverOptions = { ...options };
        serverOptions.vmServeConsole.log(">>>>>>>", __dirname, buildFolder, path.join(process.resourcesPath, "build"));
        console.log(`view more middleware running on port ${options.port}`);
        createWindow(options.url);
    });
})

app.on('window-all-closed', function () {
    console.log(`Stopping server to completely end process`);
    if (server) server.close();
    app.exit(0);
    if (process.platform !== 'darwin') {
        app.quit()
    }
    app.quit();
});

const backButtonOnPlayerHtml = (url) => {
    let html = `
    document.body.style.background = "black";
    let divElem = document.createElement('div');
    divElem.style.cssText = 'position: fixed; bottom: 20px; left: 20px; z-index: 999; display: flex; flex-wrap: wrap;';

    let backButton = document.createElement('button'); backButton.innerHTML = 'Back';
    backButton.onclick = function () { window.history.go(-1); return false; }
    backButton.style.cssText = "cursor: pointer; border-radius: 6px; padding: 16px 25px 16px 25px; background: white; color: black;";

    let reloadButton = document.createElement('button'); reloadButton.innerHTML = 'Reload';
    reloadButton.onclick = function () { window.location.reload(); return false; }
    reloadButton.style.cssText = "cursor: pointer; border-radius: 6px; padding: 16px 25px 16px 25px; background: white; color: black;";

    let homeButton = document.createElement('button'); homeButton.innerHTML = 'Home';
    homeButton.onclick = function () { window.history.go(-10); return false; }
    homeButton.style.cssText = "cursor: pointer; border-radius: 6px; padding: 16px 25px 16px 25px; background: white; color: black;";

    divElem.appendChild(backButton);
    divElem.appendChild(reloadButton);
    divElem.appendChild(homeButton);
    document.body.appendChild(divElem);
    'done';
    `;
    return html;
}
