"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainWindow = void 0;
const electron_1 = require("electron");
const server_1 = require("./server");
const constants_1 = require("./constants");
electron_1.app.once("ready", function () {
    exports.mainWindow = new electron_1.BrowserWindow({
        width: 600,
        height: 750,
        title: "Youtube Converter",
        focusable: true,
        closable: true,
        movable: true,
        maximizable: true,
        fullscreenable: true,
        center: true,
        backgroundColor: "#ffffff",
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            nodeIntegrationInSubFrames: true,
            nodeIntegrationInWorker: true,
            webgl: true
        }
    });
    (0, server_1.listen)();
    exports.mainWindow.loadURL(`http://localhost:${constants_1.SERVER_PORT}`);
});
