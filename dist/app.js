"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleControlEvents = exports.mainWindow = void 0;
const electron_1 = require("electron");
const server_1 = require("./server");
const constants_1 = require("./constants");
electron_1.app.once("ready", function () {
    return __awaiter(this, void 0, void 0, function* () {
        exports.mainWindow = new electron_1.BrowserWindow({
            width: 600,
            height: 750,
            title: "Fluent Youtube Converter",
            focusable: true,
            closable: true,
            movable: true,
            show: false,
            maximizable: true,
            fullscreenable: true,
            center: true,
            backgroundColor: "#ffffff",
            autoHideMenuBar: true,
            titleBarStyle: "hidden",
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true,
                nodeIntegrationInSubFrames: true,
                nodeIntegrationInWorker: true,
                webgl: true
            }
        });
        const listenState = yield (0, server_1.listen)();
        if (!listenState)
            return electron_1.app.exit();
        exports.mainWindow.show();
        exports.mainWindow.loadURL(`http://localhost:${constants_1.SERVER_PORT}`);
    });
});
function handleControlEvents(req) {
    const action = req.body.action;
    switch (action) {
        case "close":
            exports.mainWindow.close();
            electron_1.app.exit();
            break;
        case "maximize":
            if (exports.mainWindow.isMaximized()) {
                exports.mainWindow.unmaximize();
            }
            else {
                exports.mainWindow.maximize();
            }
            break;
        case "minimize":
            exports.mainWindow.minimize();
            break;
    }
}
exports.handleControlEvents = handleControlEvents;
