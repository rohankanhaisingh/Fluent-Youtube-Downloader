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
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const ffmpeg_1 = __importDefault(require("@ffmpeg-installer/ffmpeg"));
const constants_1 = require("../../constants");
const abort_1 = __importDefault(require("./abort"));
fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_1.default.path);
function execute(convertStream, destinationPath, events) {
    const command = (0, fluent_ffmpeg_1.default)()
        .input(convertStream)
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
