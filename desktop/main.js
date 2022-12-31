const fs = require('fs');
const path = require("path");
const Store = require('electron-store');
const { app, BrowserView, BrowserWindow } = require('electron');
const { startExpressServer } = require('../server/app');

let server;
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
        loaderLocation = "desktop/loader.html"
        clientLocation = "build/index.html";
    }

    let activeView;
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
    //win.loadURL("https://soap2day.rs/watch-movie/watch-everybody-loves-chris-rock-full-76672.8045131");

    win.webContents.on('did-start-loading', (_) => {
        const currentURL = win.webContents.getURL();
        if (loadingView === win.getBrowserView()) return;
        if (currentURL.includes("file://") && !currentURL.endsWith("/watch")) {
            urlBeforePlayer = currentURL;
            return;
        };
        activeView = win.getBrowserView();
        //win.setBrowserView(loadingView);
        loadingView.setBounds({ x: 0, y: 0, width: win.getBounds().width, height: win.getBounds().height })
    });
    win.webContents.on('did-stop-loading', (_) => {
        const currentURL = win.webContents.getURL();
        if (currentURL === lastLoadedUrl) return;
        lastLoadedUrl = currentURL;
        if (currentURL.includes("file://")) {
            //if (win.getBrowserView() === loadingView) win.setBrowserView(activeView);
            return;
        };
        function removeWebsiteElements(count) {
            console.log("REMOVING PLAYER WEBISITE ELEMENTS", count);
            win.webContents.executeJavaScript(getMediaSourcePlayerScript(currentURL) + backButtonOnPlayerHtml(urlBeforePlayer)).then((result) => {
                console.log("RESULT FROM PLAYER TRIMMER", result);
                //win.setBrowserView(activeView);
            }).catch(err => {
                if (count <= 1) {
                    //win.setBrowserView(activeView);
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
    const baseUrl = url.substr(0, url.indexOf("/", 10));
    const ijscript = serverOptions.getPlayerInjectionScript(baseUrl);
    //console.log("TO LOAD SCRIPT", ijscript);
    return ijscript;
}

app.whenReady().then(() => {
    server = startExpressServer({ useAnotherPort: true, port: 7001 }, (options) => {
        serverOptions = { ...options };
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
    document.getElementsByTagName('body')[0].innerHTML += (\`<div style='position: fixed; bottom: 20px; left: 20px; z-index: 999; display: flex; flex-wrap: wrap;'>
        <button onclick='window.history.go(-3); return false;'
            style='cursor: pointer; border-radius: 6px; padding: 16px 20px 16px 20px; background: white;'>Back</button>
        <button onclick='window.location.reload(); return false;'
            style='cursor: pointer; border-radius: 6px; padding: 16px 20px 16px 20px; background: white;'>Reload</button>
        <button onclick='window.history.go(-10); return false;'
            style='cursor: pointer; border-radius: 6px; padding: 16px 20px 16px 20px; background: white;'>Home</button>
    </div>\`);
    'done';
    `;
    return html;
}
