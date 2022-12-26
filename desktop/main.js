const fs = require('fs');
const path = require("path");
const Store = require('electron-store');
const { app, BrowserView, BrowserWindow } = require('electron');
const { startExpressServer } = require('../server/app');

let server;
const createWindow = (url) => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: __dirname + '/viewme.ico',
    });

    let loaderLocation = "loader.html";
    let clientLocation = path.resolve("build/index.html");
    if (!fs.existsSync(clientLocation)) {
        loaderLocation = "desktop/loader.html"
        clientLocation = "build/index.html";
    }

    let activeView;
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
        if (currentURL.includes("file://") && !currentURL.endsWith("/watch")) {
            urlBeforePlayer = currentURL;
            return;
        };
        activeView = win.getBrowserView();
        win.setBrowserView(loadingView);
        loadingView.setBounds({ x: 0, y: 0, width: win.getBounds().width, height: win.getBounds().height })
    });
    win.webContents.on('did-stop-loading', (_) => {
        const currentURL = win.webContents.getURL();
        if (currentURL.includes("file://")) {
            if (win.getBrowserView() === loadingView) win.setBrowserView(activeView);
            return;
        };
        function removeWebsiteElements(count) {
            console.log("REMOVING PLAYER WEBISITE ELEMENTS", count);
            win.webContents.executeJavaScript(soap2dayPlayerTrimmer).then((result) => {
                //console.log("HTML", result, activeView);
                win.webContents.executeJavaScript(backButtonOnPlayer(urlBeforePlayer)).catch(err => console.error("BACK.BUTTON", err));;
                win.setBrowserView(activeView);
            }).catch(err => {
                if (count < 1) {
                    win.setBrowserView(activeView);
                    removeWebsiteElements(count+1);
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
        console.log(`Stopping server to completely end process`);
        if (server) server.close();
        app.exit(0);
    });
}

app.whenReady().then(() => {
    server = startExpressServer({ useAnotherPort: true, port: 7001 }, (options) => {
        console.log(`view more middleware running on port ${options.port}`);
        createWindow(options.url);
    });
})

const soap2dayPlayerTrimmer = `
  const getSiblings = n => [...n.parentElement.children].filter(c=>c!=n)
  function removeElementExcept(survivor) {
    const parent = survivor.parentElement;
    if (survivor === document || !parent) return;
    const siblings = getSiblings(survivor);
    for (const sibling of siblings) {
      if (sibling.tagName === 'HEAD') continue;
      sibling.remove();
    }
    removeElementExcept(parent);
  }
  const playerElement = document.getElementsByClassName('watching_player-area')[0];
  removeElementExcept(playerElement);
  document.body.style.background = "black";
  document.documentElement.innerHTML;
`;

const backButtonOnPlayer = (url) => {
    return `document.documentElement.innerHTML += (\`<button onclick='window.history.go(-3); return false;' href='${url}'
        style='border-radius: 6px; padding: 16px 20px 16px 20px; background: white; position: fixed; top: 20px; left: 20px; z-index: 999;'>Go Back</button>\`)
    `;
}
