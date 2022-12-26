const fs = require('fs');
const path = require("path");
const Store = require('electron-store');
const { app, BrowserWindow } = require('electron');
const { startExpressServer } = require('../server/app');
let Database;
//const Database = require('../src/utils/Database');

function loadDatabaseScript(file) {
  const data = fs.readFileSync(file, 'utf8');
  console.log(">>>>>>>", data.replace("export default", "module.exports = "));

  if (!fs.existsSync("./build/")) fs.mkdirSync("./build/");
  fs.writeFileSync('./build/Database.js', data.replace("export default", "module.exports = "));
  Database = require('../build/Database');
}

const prepareDatabase = (options) => {
  const store = new Store();
  Database.setCacheImpl({
    setItem: (key, value) => {
      console.log("SETTING ITEM", key, value);
      store.set(key, value);
    },
    getItem: (key) => {
      console.log("GETTING ITEM", key, store.get(key));
      return store.get(key);
    },
    removeItem: (key) => {
      console.log("REMOVING ITEM", key);
      return store.delete(key);
    }
  });
  Database.setMiddlewareUrl(options.url);
}

const createWindow = (url) => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      icon: __dirname + '/viewme.ico',
    });
  
    let clientLocation = path.resolve("build/index.html");
    if (!fs.existsSync(clientLocation)) clientLocation = "build/index.html";
    win.loadFile(clientLocation, {query: { "middlewareurl": url }});
    win.webContents.setWindowOpenHandler((url) => {
      console.log("BLOCKING POP UP TO WEBSITE", url);
      return { action: "deny" };
    })
  }
  
  //loadDatabaseScript("src/utils/Database.js");
  app.whenReady().then(() => {
    startExpressServer({ useAnotherPort: true, port: 7001 }, (options) => {
      console.log(`view more middleware running on port ${options.port}`);
      //prepareDatabase(options);
      createWindow(options.url);
    });
  })
  