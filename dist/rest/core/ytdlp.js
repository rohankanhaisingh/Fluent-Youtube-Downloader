"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializationProcess = exports.downloadYtdlp = exports.checkForInstallation = void 0;
const electron_1 = __importDefault(require("electron"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("../../constants");
const typings_1 = require("../../typings");
function checkForInstallation() {
    const executionPath = electron_1.default.app.getPath("exe");
    if (!fs_1.default.existsSync(executionPath))
        return {
            state: "failed",
            message: `The path '${executionPath}' does not exist.`,
            reason: "execution-directory-not-found"
        };
    const physicalFileLocation = path_1.default.join(executionPath, constants_1.YTDLP_EXECUTABLE_FILENAME);
    if (!fs_1.default.existsSync(physicalFileLocation))
        return {
            state: "failed",
            message: `The exectable '${constants_1.YTDLP_EXECUTABLE_FILENAME}' in '${executionPath}' has not been found`,
            reason: "executable-not-found"
        };
    return { state: "ok" };
}
exports.checkForInstallation = checkForInstallation;
function downloadYtdlp() {
}
exports.downloadYtdlp = downloadYtdlp;
function initializationProcess() {
    const installationCheck = checkForInstallation();
    const { dialog } = electron_1.default;
    if (installationCheck.state === "ok")
        return true;
    if (!installationCheck.reason || !installationCheck.message)
        return false;
    switch (installationCheck.reason) {
        case "executable-not-found":
            const pressedButton = dialog.showMessageBoxSync({
                title: "yt-dlp executable not found",
                message: installationCheck.message,
                type: "question",
                detail: `Fluent Youtube Download needs access to a yt-dlp executable to convert YouTube video's into any media format. Would you like to download the latest release from Github? (https://github.com/yt-dlp/yt-dlp).\n
				If you press 'no,' ytdl-core will be used instead, which is already installed with Fluent YouTube Downloader. Note that ytdl-core is slower than yt-dlp.`,
                buttons: ["Yes", "No"]
            });
            if (pressedButton === typings_1.YTDLPInstallationPromptButton.Yes) {
            }
            else {
                return true;
            }
            break;
    }
    return true;
}
exports.initializationProcess = initializationProcess;
