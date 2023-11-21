"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rest = void 0;
const electron_1 = require("electron");
const video_details_1 = __importDefault(require("./core/video-details"));
const app_1 = require("../app");
function rest(router) {
    router.post("/rest/video-details", function (req, res) {
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
}
exports.rest = rest;
