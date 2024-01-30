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
const socket_1 = require("../../socket");
const ytdlp_1 = require("./ytdlp");
function checkSettingsProperties(settings) {
    if (settings.path.downloadPath === null)
        return {
            state: "failed",
            reason: `NullReferenceError: Download path is set to null. Path: ${settings.path.downloadPath}. Configure the download path in the settings.`
        };
    if (!fs_1.default.existsSync(settings.path.downloadPath))
        return {
            state: "failed",
            reason: `FileSystemError: Given download path does not exist. Path: ${settings.path.downloadPath}`
        };
    if (!fs_1.default.lstatSync(settings.path.downloadPath).isDirectory())
        return {
            state: "failed",
            reason: `FileSystemError: Given download path is not a directory. Path: ${settings.path.downloadPath}`
        };
    return settings.path.downloadPath;
}
function resolveVideoInfo(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const videoDetails = (yield (0, video_details_1.default)(url)).videoDetails;
        let videoTitle = videoDetails.title;
        const specialCharacters = /["\\:*?<>|]/;
        for (let character of videoTitle) {
            if (specialCharacters.test(character))
                videoTitle = videoTitle.replace(character, " ");
        }
        return {
            videoTitle,
            videoThumbnail: videoDetails.thumbnails[0].url
        };
    });
}
function preInitializeYtdlp() {
    return __awaiter(this, void 0, void 0, function* () {
        const ytdlpInitializationState = (0, ytdlp_1.initializeYtdlp)();
        if (!ytdlpInitializationState) {
            (0, utils_1.logError)(`Failed initializing yt-dlp due to an unknown reason.`, "pipeline.ts");
            return { state: "failed", reason: "Could not initialize yt-dlp due to a unknown reason." };
        }
        if (ytdlpInitializationState === "executable-not-found") {
            const isInstalled = yield (0, ytdlp_1.promptInstallation)();
            if (isInstalled instanceof Error) {
                (0, utils_1.logError)(`Failed installing yt-dlp.exe. Reason: ${isInstalled.message}.`, "pipeline.ts");
                return { state: "failed", reason: isInstalled.message };
            }
            if (!isInstalled)
                return {
                    state: "failed",
                    reason: "Fluent YouTube Downloader may not work if the dependency has not been installed. You can either install it within this application or manually install the dependency from GitHub."
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
        return {
            state: "ok"
        };
    });
}
function execute(url, qualityString, extension, requestId) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, utils_1.logInfo)(`Starting conversion pipeline using the following arguments: url: ${url}, qualityString: ${qualityString}, requestId: ${requestId}, extension: ${extension}`, "pipeline.ts");
        const settings = (0, appdata_1.readSettingsFile)();
        if (settings.status !== "ok")
            return {
                state: "failed",
                reason: "ApplicationSettings: Application failed reading settings."
            };
        const settingsCheck = checkSettingsProperties(settings);
        if (typeof settingsCheck !== "string")
            return settingsCheck;
        const videoInfo = yield resolveVideoInfo(url);
        let physicalFileDestinationPath = path_1.default.join(settingsCheck, videoInfo.videoTitle + "." + extension);
        if (fs_1.default.existsSync(physicalFileDestinationPath))
            return {
                reason: `FileSystemError: Reserved file path is already in use. Path: ${physicalFileDestinationPath}`,
                state: "failed"
            };
        const preInitializedYtdlp = yield preInitializeYtdlp();
        if (preInitializedYtdlp.state !== "ok")
            return preInitializedYtdlp;
        (0, utils_1.logInfo)(`Found yt-dlp executable in application's root file.`, "pipeline.ts");
        const convertStream = (0, ytdlp_1.createYtdlpStream)(url, qualityString, extension, requestId);
        return new Promise(function (resolve, reject) {
            var _a;
            if (convertStream === null || convertStream.stdout === null)
                return reject(new Error("NullReferenceError: 'convertStream' has defined as null"));
            (_a = convertStream.stderr) === null || _a === void 0 ? void 0 : _a.on("data", function (chunk) {
                const errorText = chunk.toString();
                (0, utils_1.logError)(errorText, "pipeline.ts");
                reject(new Error(errorText));
            });
            (0, ytdlp_1.extractStreamOutput)(convertStream.stdout, function (event) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (event.isDone) {
                        if (event.fileDestinations && extension === "mp4") {
                            (0, socket_1.emit)("app/yt-dlp/download-video", { percentage: "Merging media files together. This can take a little bit.", requestId });
                            const mergeState = yield (0, ffmpeg_stream_1.mergeMediaFilesSync)(requestId, physicalFileDestinationPath);
                            if (mergeState === null)
                                return reject(new Error("NullReferenceError: Something went wrong during the process of merging media files."));
                        }
                        else {
                            const cacheFile = (0, ytdlp_1.getCompleteCacheFile)(requestId);
                            if (cacheFile === null)
                                return reject(new Error("NullReferenceError: Could not change media file into something else because the cache file could not be found."));
                            (0, socket_1.emit)("app/yt-dlp/download-video", { percentage: "Post processing media files. This can take a while.", requestId });
                            try {
                                yield (0, ffmpeg_stream_1.changeFileExtension)(cacheFile, extension, physicalFileDestinationPath);
                            }
                            catch (err) {
                                return reject(new Error(err.message));
                            }
                        }
                        (0, utils_1.logInfo)(`Succesfully downloaded ${url}.`, "pipeline.ts");
                        (0, appdata_1.createHistoryItem)({
                            fileLocation: physicalFileDestinationPath,
                            fileName: path_1.default.basename(physicalFileDestinationPath),
                            requestId: requestId,
                            timestamp: Date.now(),
                            fileSize: null,
                            videoUrl: url,
                            thumbnailUrl: videoInfo.videoThumbnail
                        });
                        return resolve({ state: "ok" });
                    }
                    (0, socket_1.emit)("app/yt-dlp/download-video", { percentage: event.percentage + "%", requestId });
                });
            });
        });
    });
}
exports.default = execute;
//# sourceMappingURL=pipeline.js.map