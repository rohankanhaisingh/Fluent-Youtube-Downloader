"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disableAutoLaunch = exports.enableAutoLaunch = exports.initializeAutoLaunch = exports.autoLaunch = void 0;
const auto_launch_1 = __importDefault(require("auto-launch"));
const electron_1 = require("electron");
exports.autoLaunch = null;
function initializeAutoLaunch(settings) {
    exports.autoLaunch = new auto_launch_1.default({
        path: electron_1.app.getPath("exe"),
        name: "Fleunt Youtube Downloader"
    });
    if (settings.behavior.autoStart) {
        exports.autoLaunch.enable();
    }
    else {
        exports.autoLaunch.disable();
    }
}
exports.initializeAutoLaunch = initializeAutoLaunch;
function enableAutoLaunch() {
    if (exports.autoLaunch === null)
        return;
    exports.autoLaunch.isEnabled().then(function (isEnabled) {
        if (!isEnabled)
            exports.autoLaunch === null || exports.autoLaunch === void 0 ? void 0 : exports.autoLaunch.enable();
    });
}
exports.enableAutoLaunch = enableAutoLaunch;
function disableAutoLaunch() {
    if (exports.autoLaunch === null)
        return;
    exports.autoLaunch.isEnabled().then(function (isEnabled) {
        if (isEnabled)
            exports.autoLaunch === null || exports.autoLaunch === void 0 ? void 0 : exports.autoLaunch.disable();
    });
}
exports.disableAutoLaunch = disableAutoLaunch;
