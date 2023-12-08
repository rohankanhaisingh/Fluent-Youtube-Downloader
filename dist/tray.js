"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSystemTray = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const app_1 = require("./app");
const constants_1 = require("./constants");
function initializeSystemTray(settings) {
    if (!settings.behavior.systemTray)
        return;
    const appIcon = new electron_1.Tray(path_1.default.join(constants_1.ROOT_PATH, "icon.ico"));
    const contextMenu = electron_1.Menu.buildFromTemplate([
        { label: "Fluent Youtube Downloader", type: 'normal' },
        { label: 'seperator', type: 'separator' },
        { label: 'Open DevTools', type: 'normal', role: 'toggleDevTools' },
        { label: 'Quit program', type: 'normal', role: 'quit' },
    ]);
    appIcon.on("click", function () {
        app_1.mainWindow.show();
    });
    appIcon.setTitle("Fluent Youtube Downloader");
    appIcon.setToolTip("Fluent Youtube Downloader");
    appIcon.setContextMenu(contextMenu);
}
exports.initializeSystemTray = initializeSystemTray;
//# sourceMappingURL=tray.js.map