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
exports.mergeMediaFilesSync = exports.moveMediaFile = exports.checkMediaParts = exports.probeFfmpeg = void 0;
const fs_1 = __importDefault(require("fs"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const ffmpeg_1 = __importDefault(require("@ffmpeg-installer/ffmpeg"));
const path_1 = __importDefault(require("path"));
const electron_1 = __importDefault(require("electron"));
const constants_1 = require("../../constants");
const abort_1 = __importDefault(require("./abort"));
const appdata_1 = require("../../appdata");
const app_1 = require("../../app");
const utils_1 = require("../../utils");
fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_1.default.path);
fluent_ffmpeg_1.default.setFfprobePath(ffmpeg_1.default.path);
function probeFfmpeg(filePath) {
    return new Promise(function (resolve, reject) {
        fluent_ffmpeg_1.default.ffprobe(filePath, function (err, data) {
            if (err)
                return reject(err.message);
            return resolve(data);
        });
    });
}
exports.probeFfmpeg = probeFfmpeg;
function checkMediaParts(fileName) {
    const cacheDirectory = (0, appdata_1.getCacheDirectory)();
    if (cacheDirectory === null)
        return [];
    const files = fs_1.default.readdirSync(cacheDirectory);
    const matchedFiles = [];
    for (let file of files)
        if (file.startsWith(fileName))
            matchedFiles.push(path_1.default.join(cacheDirectory, file));
    return matchedFiles;
}
exports.checkMediaParts = checkMediaParts;
function moveMediaFile(mediaPartPath, fileOutputPath) {
    if (!fs_1.default.existsSync(mediaPartPath))
        return new Error("Could not move media part since given media part does not exist. Path: " + mediaPartPath);
    if (fs_1.default.existsSync(fileOutputPath))
        return new Error("Could not move media part since the given output path is already in use. Path: " + fileOutputPath);
    (0, utils_1.logInfo)(`Attempting to copy ${mediaPartPath} into ${fileOutputPath}.`, "ffmpeg-stream.ts");
    try {
        const mediaPartFileData = fs_1.default.readFileSync(mediaPartPath);
        fs_1.default.writeFileSync(fileOutputPath, mediaPartFileData);
        return true;
    }
    catch (err) {
        (0, utils_1.logError)(err.message, "ffmpeg-stream");
        return err;
    }
}
exports.moveMediaFile = moveMediaFile;
function mergeMediaFilesSync(fileId, fileOutputPath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(function (resolve, reject) {
            const mediaParts = checkMediaParts(fileId);
            if (mediaParts.length === 1) {
                const moveState = moveMediaFile(mediaParts[0], fileOutputPath);
                if (moveState)
                    return resolve(fileOutputPath);
                return reject(moveState);
            }
            if (mediaParts.length !== 2) {
                (0, utils_1.logError)("Failed to merge media files. No files has been found.", "ffmpeg-stream.ts");
                return reject(new Error("Could not find media files to merge."));
            }
            (0, utils_1.logInfo)(`Attempting to merge media files together...`, "ffmpeg-stream.ts");
            (0, utils_1.logWarning)(`The processing of merging media files can take a while.`, "ffmpeg-stream.ts");
            const command = (0, fluent_ffmpeg_1.default)()
                .input(mediaParts[0])
                .input(mediaParts[1])
                .outputOptions('-c:v copy')
                .outputOptions('-c:a aac')
                .addOption("-speed", "8")
                .save(fileOutputPath);
            command.on("end", function () {
                (0, utils_1.logInfo)(`Succesfully merged media files into ${fileOutputPath}.`, "ffmpeg-stream.ts");
                resolve(fileOutputPath);
            });
            command.on("progress", function (progress) {
            });
            command.on("error", function (err) {
                electron_1.default.dialog.showMessageBox(app_1.mainWindow, {
                    title: "FFMPEG error",
                    message: err.message + "\nRestarting the application could solve the problem.",
                    detail: err.stack
                });
                (0, utils_1.logError)(`ffmpeg.exe failed with reason: ${err.message}.`, "ffmpeg-stream.ts");
                reject(err.message);
            });
        });
    });
}
exports.mergeMediaFilesSync = mergeMediaFilesSync;
function execute(convertStream, destinationPath, events) {
    const executionPath = electron_1.default.app.getPath("exe");
    const directoryName = path_1.default.dirname(executionPath);
    if (!fs_1.default.existsSync(directoryName)) {
        (0, utils_1.logError)(`The directory of where the local executable should be located at, does not exist. ${directoryName}.`, "ffmpeg-stream.ts");
        return null;
    }
    const command = (0, fluent_ffmpeg_1.default)(convertStream)
        .addOption("-preset", "ultrafast")
        .save(destinationPath);
    let hasStoppedProcess = false;
    command.on("error", function (err) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, abort_1.default)(command, convertStream, destinationPath);
            if (events.onError)
                events.onError(err, true);
        });
    });
    command.on("progress", function (progress) {
        return __awaiter(this, void 0, void 0, function* () {
            const downloadedBytes = progress.targetSize / 1000;
            if (downloadedBytes >= constants_1.MAX_FILE_SIZE) {
                if (hasStoppedProcess)
                    return;
                hasStoppedProcess = true;
                yield (0, abort_1.default)(command, convertStream, destinationPath);
                (0, utils_1.logError)("File has reached maximum file size.", "ffmpeg-stream.ts");
            }
            if (events.onProgress)
                events.onProgress(progress);
        });
    });
    command.on("end", function () {
        if (events.onEnd)
            events.onEnd();
    });
    command.run();
    return command;
}
exports.default = execute;
//# sourceMappingURL=ffmpeg-stream.js.map