"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emit = exports.sokkie = void 0;
const electron_1 = require("electron");
const appdata_1 = require("./appdata");
const utils_1 = require("./utils");
const app_1 = require("./app");
let connectedSocket = null;
function sokkie(io) {
    io.on("connection", function (socket) {
        connectedSocket = socket;
        socket.on("/appdata/settings", function () {
            const settingsFile = (0, appdata_1.readSettingsFile)();
            socket.emit("response-/appdata/settings", settingsFile);
        });
        socket.on("/appdata/change-settings", function (postData) {
            const { key, value } = postData;
            (0, appdata_1.updateSettingsFile)(key, value);
        });
        socket.on("/appdata/history", function () {
            const history = (0, appdata_1.getHistory)();
            socket.emit("response-/appdata/history", history);
        });
        socket.on("/appdata/select-download-path", function () {
            electron_1.dialog.showOpenDialog(app_1.mainWindow, {
                properties: ["openDirectory"]
            }).then(function (returnValue) {
                socket.emit("response-/appdata/select-download-path", returnValue.filePaths[0]);
            });
        });
        socket.on("app/open-file", function (data) {
            (0, utils_1.openFile)(data.physicalPath);
        });
        socket.on("app/delete-file", function (data) {
            (0, utils_1.deleteFile)(data.physicalPath);
        });
    });
}
exports.sokkie = sokkie;
function emit(channel, data) {
    if (connectedSocket === null)
        return;
    connectedSocket.emit(channel, data);
}
exports.emit = emit;
//# sourceMappingURL=socket.js.map