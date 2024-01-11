"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRequestsFromExtension = exports.convertVideoFromYoutube = exports.authenticateExtensionConnection = exports.extensionIsConnected = void 0;
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const appdata_1 = require("./appdata");
const constants_1 = require("./constants");
const pipeline_1 = __importDefault(require("./rest/core/pipeline"));
const socket_1 = require("./socket");
exports.extensionIsConnected = false;
function authenticateExtensionConnection(body) {
    if (body.protocol !== "chrome-extension:")
        return new Error("The protocol does not matches the standard chrome extension protocol.");
    const now = Date.now(), difference = now - body.timestamp;
    if (difference >= constants_1.EXTENSION_CONNECTION_INTERVAL)
        return new Error(`The delay between the request and the response is more than ${constants_1.EXTENSION_CONNECTION_INTERVAL}.`);
    const appdata = (0, appdata_1.readSettingsFile)();
    if (appdata.status === "failed")
        return new Error("Cannot authenticate because the program failed reading the settings file.");
    const casting = appdata, extensionPassword = casting.server.extensionPassword === "" ? null : casting.server.extensionPassword;
    if (extensionPassword !== body.serverPassword)
        return new Error(`Failed authenticating because the given password '${body.serverPassword}' does not match with the actual extension server password.`);
    exports.extensionIsConnected = true;
    return true;
}
exports.authenticateExtensionConnection = authenticateExtensionConnection;
function convertVideoFromYoutube(body) {
    if (body.protocol !== "chrome-extension:")
        return new Error("The protocol does not matches the standard chrome extension protocol.");
    const now = Date.now(), difference = now - body.timestamp;
    if (difference >= constants_1.EXTENSION_CONNECTION_INTERVAL)
        return new Error(`The delay between the request and the response is more than ${constants_1.EXTENSION_CONNECTION_INTERVAL}.`);
    (0, pipeline_1.default)(body.videoUrl, body.videoQuality, body.requestId).then(function (response) {
        if (response.state === "ok") {
            new electron_1.Notification({
                title: "Fluent Youtube Downloader",
                subtitle: "Fluent Youtube Downloader",
                icon: path_1.default.join(constants_1.ROOT_PATH, "icon.ico"),
                body: "Video has succesfully been converted.",
            }).show();
            (0, socket_1.emit)("app/yt-dlp/convert-complete", { requestId: body.requestId });
        }
        if (response.state === "failed") {
            new electron_1.Notification({
                title: "Fluent Youtube Downloader",
                subtitle: "An error occurred.",
                icon: path_1.default.join(constants_1.ROOT_PATH, "icon.ico"),
                body: "Fluent Youtube Download could not download this video. See the application window for more details.",
            }).show();
            (0, socket_1.emit)("app/in-app-dialog", {
                title: "An error occurred",
                message: response.reason,
                icon: "error"
            });
        }
    });
}
exports.convertVideoFromYoutube = convertVideoFromYoutube;
function handleRequestsFromExtension(req, res) {
    const requestBody = req.body;
    switch (req.url) {
        case "/connect":
            const authenticationResponse = authenticateExtensionConnection(requestBody);
            return authenticationResponse instanceof Error
                ? res.status(500).send(authenticationResponse.message)
                : res.status(200).send("Extension authenticated.");
        case "/convert":
            const downloadResponse = convertVideoFromYoutube(requestBody);
            break;
    }
}
exports.handleRequestsFromExtension = handleRequestsFromExtension;
//# sourceMappingURL=extension.js.map