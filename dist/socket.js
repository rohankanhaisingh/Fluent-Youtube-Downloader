"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sokkie = void 0;
const appdata_1 = require("./appdata");
function sokkie(io) {
    io.on("connection", function (socket) {
        socket.on("/appdata/settings", function () {
            const settingsFile = (0, appdata_1.readSettingsFile)();
            socket.emit("response-/appdata/settings", settingsFile);
        });
        socket.on("/appdata/change-settings", function (postData) {
            const { key, value } = postData;
            (0, appdata_1.updateSettingsFile)(key, value);
        });
    });
}
exports.sokkie = sokkie;
