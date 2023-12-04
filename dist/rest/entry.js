"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rest = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const video_details_1 = __importDefault(require("./core/video-details"));
const pipeline_1 = __importDefault(require("./core/pipeline"));
const app_1 = require("../app");
const router_1 = require("../router");
const constants_1 = require("../constants");
const socket_1 = require("../socket");
function rest(router) {
    router.post("/rest/video-details", router_1.requireLogin, function (req, res) {
        const { url } = req.body;
        (0, video_details_1.default)(url).then(function (response) {
            res.status(200).json(response);
        }).catch(function (err) {
            electron_1.dialog.showMessageBox(app_1.mainWindow, {
                title: "Error",
                type: "error",
                message: err.message,
                detail: err.stack,
            });
            res.status(500).json({ message: err.message, stack: err.stack, name: err.name });
        });
    });
    router.post("/rest/download", router_1.requireLogin, function (req, res) {
        const { url, requestId, quality } = req.body;
        (0, pipeline_1.default)(url, quality, requestId).then(function (response) {
            if (response.state == "ok") {
                new electron_1.Notification({
                    title: "Fluent Youtube Downloader",
                    subtitle: "Fluent Youtube Downloader",
                    icon: path_1.default.join(constants_1.ROOT_PATH, "icon.ico"),
                    body: "Video has succesfully been converted.",
                }).show();
                (0, socket_1.emit)("app/yt-dlp/convert-complete", { requestId });
                return res.status(200).send("Download completed");
            }
            if (response.state === "installation-succeed") {
                new electron_1.Notification({
                    title: "Fluent Youtube Downloader",
                    subtitle: "Fluent Youtube Downloader",
                    icon: path_1.default.join(constants_1.ROOT_PATH, "icon.ico"),
                    body: "yt-dlp has been succesfully downloaded. Fluent Youtube Downloader will now restart.",
                }).show();
                return (0, app_1.restartApplication)();
            }
            electron_1.dialog.showMessageBox(app_1.mainWindow, {
                title: "Conversion error",
                type: "error",
                message: "Something went wrong while converting a video.",
                detail: response.reason,
            });
            res.status(500).send(response.reason);
        }).catch(function (err) {
            res.status(500).send(err.message);
        });
    });
}
exports.rest = rest;
//# sourceMappingURL=entry.js.map