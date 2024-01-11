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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restartApplication = exports.handleControlEvents = exports.applicationTheme = exports.mainWindow = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
const colors_1 = __importDefault(require("colors"));
const server_1 = require("./server");
const constants_1 = require("./constants");
const appdata_1 = require("./appdata");
const auto_launch_1 = require("./auto-launch");
const tray_1 = require("./tray");
const utils_1 = require("./utils");
colors_1.default.enable();
(0, utils_1.logInfo)("Attempting to prepare Fluent Youtube Downloader...", "app.ts");
const initializationState = (0, appdata_1.initializeAppData)();
electron_1.app.once("ready", function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (!initializationState) {
            (0, utils_1.logError)("Error: Could not initialize the application it's data due to an uknown reason.", "app.ts");
            return electron_1.app.exit();
        }
        const applicationSettings = (0, appdata_1.readSettingsFile)();
        if (applicationSettings.status === "failed") {
            (0, utils_1.logError)(applicationSettings.reason, "app.ts");
            return electron_1.app.exit();
        }
        const settingsCasting = applicationSettings;
        exports.applicationTheme = settingsCasting.window.display.theme;
        exports.mainWindow = new electron_1.BrowserWindow({
            width: settingsCasting.window.resolution.width > 1400 ? settingsCasting.window.resolution.width : 1400,
            height: settingsCasting.window.resolution.height > 800 ? settingsCasting.window.resolution.height : 800,
            title: "Fluent Youtube Converter",
            focusable: true,
            closable: true,
            movable: true,
            show: false,
            maximizable: true,
            fullscreenable: true,
            center: true,
            backgroundColor: "transparent",
            titleBarStyle: "hidden",
            titleBarOverlay: {
                color: "transparent",
            },
            icon: path_1.default.join(constants_1.ROOT_PATH, "application", "res", "media", "app-icons", "icon.png"),
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true,
                nodeIntegrationInSubFrames: true,
                nodeIntegrationInWorker: true,
                webgl: true,
                devTools: true,
            }
        });
        if (electron_is_dev_1.default) {
            (0, utils_1.logInfo)("Development enviroment has been detected. Electron will now open DevTools.", "app.ts");
            exports.mainWindow.webContents.openDevTools();
        }
        else {
            exports.mainWindow.setMenu(null);
            (0, tray_1.initializeSystemTray)(settingsCasting);
            (0, auto_launch_1.initializeAutoLaunch)(settingsCasting);
        }
        const listenState = yield (0, server_1.listen)();
        if (!listenState) {
            (0, utils_1.logError)("Could not start local web-server due to an unknown reason.", "app.ts");
            return electron_1.app.exit();
        }
        exports.mainWindow.loadURL(`http://localhost:${listenState}`, {
            extraHeaders: `Accessibility-Type: Electron\nAuthentication-Token: ${server_1.reservedServerAuthToken}`
        });
        exports.mainWindow.webContents.on("dom-ready", function () {
            exports.mainWindow.show();
        });
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
function restartApplication() {
    electron_1.app.relaunch();
    electron_1.app.exit();
}
exports.restartApplication = restartApplication;
//# sourceMappingURL=app.js.map