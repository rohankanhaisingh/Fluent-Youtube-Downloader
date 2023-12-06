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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const appdata_1 = require("../../appdata");
const utils_1 = require("../../utils");
const video_details_1 = __importDefault(require("./video-details"));
const ffmpeg_stream_1 = require("./ffmpeg-stream");
const ytdlp_1 = require("./ytdlp");
function execute(url, qualityString, requestId) {
    return __awaiter(this, void 0, void 0, function* () {
        const settings = (0, appdata_1.readSettingsFile)();
        if (settings.status !== "ok")
            return {
                state: "failed",
                reason: "ApplicationSettings: Application failed reading settings."
            };
        const casting = settings;
        if (casting.path.downloadPath === null)
            return {
                state: "failed",
                reason: `NullReferenceError: Download path is set to null. Path: ${casting.path.downloadPath}. Configure the download path in the settings.`
            };
        if (!fs_1.default.existsSync(casting.path.downloadPath))
            return {
                state: "failed",
                reason: `FileSystemError: Given download path does not exist. Path: ${casting.path.downloadPath}`
            };
        if (!fs_1.default.lstatSync(casting.path.downloadPath).isDirectory())
            return {
                state: "failed",
                reason: `FileSystemError: Given download path is not a directory. Path: ${casting.path.downloadPath}`
            };
        const resolvedQuality = (0, utils_1.resolveVideoQuality)(qualityString);
        const videoDetails = (yield (0, video_details_1.default)(url)).videoDetails;
        const physicalFileDestinationPath = path_1.default.join(casting.path.downloadPath, videoDetails.title + ".mp4");
        if (fs_1.default.existsSync(physicalFileDestinationPath))
            return {
                reason: `FileSystemError: Reserved file path is already in use. Path: ${physicalFileDestinationPath}`,
                state: "failed"
            };
        const ytdlpInitializationState = (0, ytdlp_1.initializeYtdlp)();
        if (!ytdlpInitializationState)
            return {
                state: "failed",
                reason: "Could not initialize yt-dlp due to a unknown reason."
            };
        if (ytdlpInitializationState === "executable-not-found") {
            const isInstalled = yield (0, ytdlp_1.promptInstallation)();
            if (isInstalled instanceof Error)
                return {
                    state: "failed",
                    reason: isInstalled.message
                };
            if (!isInstalled)
                return {
                    state: "failed",
                    reason: "User denied the prompt"
                };
            return {
                state: "installation-succeed",
                reason: "Succesfully installed yt-dlp. You need to restart the application."
            };
        }
        if (ytdlpInitializationState === "execution-directory-not-found")
            return {
                state: "failed",
                reason: "Execution directory could not be found."
            };
        console.log("Info: Found yt-dlp executable.".gray);
        const convertStream = (0, ytdlp_1.createYtdlpStream)(url, qualityString, requestId);
        return new Promise(function (resolve, reject) {
            if (convertStream === null || convertStream.stdout === null)
                return reject("NullReferenceError: 'convertStream' has defined as null");
            (0, ytdlp_1.extractStreamOutput)(convertStream.stdout, function (event) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (event.isDone) {
                        if (event.fileDestinations)
                            yield (0, ffmpeg_stream_1.mergeMediaFilesSync)(event.fileDestinations[0], event.fileDestinations[1], physicalFileDestinationPath);
                        return resolve({ state: "ok" });
                    }
                });
            });
        });
    });
}
exports.default = execute;
//# sourceMappingURL=pipeline.js.map