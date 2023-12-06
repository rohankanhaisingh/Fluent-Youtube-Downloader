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
exports.mergeMediaFilesSync = exports.probeFfmpeg = void 0;
const fs_1 = __importDefault(require("fs"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const ffmpeg_1 = __importDefault(require("@ffmpeg-installer/ffmpeg"));
const path_1 = __importDefault(require("path"));
const electron_1 = __importDefault(require("electron"));
const constants_1 = require("../../constants");
const abort_1 = __importDefault(require("./abort"));
fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_1.default.path);
fluent_ffmpeg_1.default.setFfprobePath(ffmpeg_1.default.path);
function probeFfmpeg(filePath) {
    return new Promise(function (resolve, reject) {
        fluent_ffmpeg_1.default.ffprobe(filePath, function (err, data) {
            console.log(`Error: ${err.message}`.red);
            if (err)
                return reject(err.message);
            return resolve(data);
        });
    });
}
exports.probeFfmpeg = probeFfmpeg;
function mergeMediaFilesSync(mediaFile1, mediaFile2, filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const executionPath = electron_1.default.app.getPath("exe");
        const directoryName = path_1.default.dirname(executionPath);
        if (!fs_1.default.existsSync(directoryName)) {
            console.log("Directory name does not exist.");
            return null;
        }
        console.log(`Info: Mergin media files into ${filePath}`);
        if (!fs_1.default.existsSync(mediaFile1) || !fs_1.default.existsSync(mediaFile2))
            return null;
        console.log("Started merge command.");
        const command = (0, fluent_ffmpeg_1.default)()
            .input(mediaFile2)
            .input(mediaFile1)
            .outputOptions('-c:v libx264')
            .outputOptions('-c:a aac')
            .save(filePath);
        return new Promise(function (resolve, reject) {
            command.on("end", function () {
                resolve(filePath);
            });
            command.on("error", function (err) {
                console.log(`Error: ${err.message}`.red);
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
        console.log("Directory name does not exist.");
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
                console.log("Reached max file size");
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