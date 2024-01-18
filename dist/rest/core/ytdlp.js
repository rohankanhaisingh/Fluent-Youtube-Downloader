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
exports.initializeYtdlp = exports.promptInstallation = exports.createYtdlpStream = exports.getCompleteCacheFile = exports.extractStreamOutput = exports.downloadYtdlp = exports.extractTarFile = exports.checkForInstallation = exports.parseVideoIdFromUrl = void 0;
const electron_1 = __importDefault(require("electron"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const tar_1 = __importDefault(require("tar"));
const axios_1 = __importDefault(require("axios"));
const child_process_1 = __importDefault(require("child_process"));
const constants_1 = require("../../constants");
const typings_1 = require("../../typings");
const socket_1 = require("../../socket");
const app_1 = require("../../app");
const appdata_1 = require("../../appdata");
const utils_1 = require("../../utils");
function parseVideoIdFromUrl(videoUrl) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = videoUrl.match(regExp);
    return (match && match[7].length == 11) ? match[7] : videoUrl;
}
exports.parseVideoIdFromUrl = parseVideoIdFromUrl;
function checkForInstallation() {
    const executionPath = electron_1.default.app.getPath("exe");
    const directoryName = path_1.default.dirname(executionPath);
    if (!fs_1.default.existsSync(directoryName))
        return {
            state: "failed",
            message: `The path '${executionPath}' does not exist.`,
            reason: "execution-directory-not-found"
        };
    const physicalFileLocation = path_1.default.join(directoryName, constants_1.YTDLP_EXECUTABLE_FILENAME);
    if (!fs_1.default.existsSync(physicalFileLocation))
        return {
            state: "failed",
            message: `The exectable '${constants_1.YTDLP_EXECUTABLE_FILENAME}' in '${executionPath}' has not been found`,
            reason: "executable-not-found"
        };
    return { state: "ok" };
}
exports.checkForInstallation = checkForInstallation;
function extractTarFile(directoryName, tarFileName) {
    const filePath = path_1.default.join(directoryName, tarFileName);
    if (!fs_1.default.existsSync(filePath))
        return false;
    tar_1.default.extract({
        cwd: directoryName,
        file: filePath,
        sync: true,
    });
    return true;
}
exports.extractTarFile = extractTarFile;
function downloadYtdlp() {
    return new Promise(function (resolve, reject) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = "https://github.com/yt-dlp/yt-dlp/releases/download/2023.11.16/yt-dlp.exe";
            const response = yield (0, axios_1.default)({ method: "GET", responseType: "stream", url });
            const fileSize = parseInt(response.headers["content-length"]);
            const executionPath = electron_1.default.app.getPath("exe");
            const directoryName = path_1.default.dirname(executionPath);
            if (!fs_1.default.existsSync(directoryName))
                reject(new Error(`Directory ${directoryName} does not exit.`));
            (0, socket_1.emit)("app/yt-dlp/download-started", { fileSize, directoryName });
            let downloadedSize = 0;
            response.data.on("data", function (chunk) {
                downloadedSize += chunk.length;
                const percentage = 100 / fileSize * downloadedSize;
                (0, socket_1.emit)("app/yt-dlp/download-progress", percentage);
                app_1.mainWindow.setProgressBar(1 / 100 * percentage);
            });
            const filePath = path_1.default.join(directoryName, constants_1.YTDLP_EXECUTABLE_FILENAME);
            const fileStream = fs_1.default.createWriteStream(filePath);
            response.data.pipe(fileStream);
            fileStream.on("finish", function () {
                resolve(true);
            });
            fileStream.on('error', function (err) {
                reject(err);
            });
        });
    });
}
exports.downloadYtdlp = downloadYtdlp;
function extractStreamOutput(stream, callback) {
    let completedDownload = 0;
    const fileDestinations = [];
    stream.on("data", function (chunk) {
        const chunkText = chunk.toString().toLowerCase();
        const words = chunkText.split(" ");
        const notEmptyWords = words.filter(word => word.length !== 0);
        (0, utils_1.logInfo)(chunkText, "downloading video");
        if (notEmptyWords[0].trim() !== "[download]")
            return;
        if (notEmptyWords[1].includes("destination")) {
            (0, utils_1.logInfo)(`File part destination reserved at: ${notEmptyWords[2].trim()}`, "ytdlp.ts");
            fileDestinations.push(notEmptyWords[2].trim());
        }
        if (!notEmptyWords[1].trim().includes("%") ||
            !notEmptyWords[3].trim().includes("ib") ||
            !notEmptyWords[5].trim().includes("ib/s"))
            return;
        const percentage = parseFloat(notEmptyWords[1].trim().replace("%", ""));
        const chunkSize = parseFloat(notEmptyWords[3].trim());
        const downloadSpeed = parseFloat(notEmptyWords[5].trim());
        if (percentage === 100)
            completedDownload += 1;
        callback({ isDone: false, percentage, downloadSpeed });
    });
    stream.on("end", function () {
        (0, utils_1.logInfo)(`Executable stream ended.`, "ytdlp.ts");
        return callback({ isDone: true, percentage: 100, downloadSpeed: -1, fileDestinations });
    });
}
exports.extractStreamOutput = extractStreamOutput;
function getCompleteCacheFile(fileId) {
    const cacheDirectory = (0, appdata_1.getCacheDirectory)();
    if (cacheDirectory === null)
        return null;
    const files = fs_1.default.readdirSync(cacheDirectory);
    const foundFiles = files.filter(fileName => fileName.startsWith(fileId));
    return path_1.default.join(cacheDirectory, foundFiles[0]);
}
exports.getCompleteCacheFile = getCompleteCacheFile;
function createYtdlpStream(videoUrl, videoQuality, extension, fileId) {
    var _a;
    const executionPath = electron_1.default.app.getPath("exe");
    const directoryName = path_1.default.dirname(executionPath);
    if (!fs_1.default.existsSync(directoryName)) {
        console.log("Directory name does not exist.");
        return null;
    }
    const physicalFilePath = path_1.default.join(directoryName, constants_1.YTDLP_EXECUTABLE_FILENAME);
    if (!fs_1.default.existsSync(physicalFilePath)) {
        (0, utils_1.logError)(`Cannot start executable since it does not exist at ${physicalFilePath}.`, "ytdlp.ts");
        return null;
    }
    const cacheDirectory = (0, appdata_1.getCacheDirectory)();
    if (cacheDirectory === null)
        return null;
    const parsedVideoId = parseVideoIdFromUrl(videoUrl), commandString = `${physicalFilePath} ${videoUrl} -f ${videoQuality} -o ${cacheDirectory}/${fileId}`;
    (0, utils_1.logInfo)(`Starting yt-dlp executable located in ${physicalFilePath}.`, "ytdlp.ts");
    (0, utils_1.logInfo)(commandString, "ytdlp.ts");
    const process = child_process_1.default.exec(commandString);
    (_a = process.stderr) === null || _a === void 0 ? void 0 : _a.on("data", function (chunk) {
        const text = chunk.toString();
        (0, utils_1.logError)(text, "ytdlp.ts");
    });
    return process;
}
exports.createYtdlpStream = createYtdlpStream;
function promptInstallation() {
    return __awaiter(this, void 0, void 0, function* () {
        const { dialog } = electron_1.default;
        const executionPath = electron_1.default.app.getPath("exe");
        const pressedButton = dialog.showMessageBoxSync({
            title: "yt-dlp executable not found",
            message: `The exectable '${constants_1.YTDLP_EXECUTABLE_FILENAME}' in '${executionPath}' has not been found`,
            type: "question",
            detail: `Fluent Youtube Download needs access to a yt-dlp executable to convert YouTube video's into any media format. Would you like to download the latest release from Github? (https://github.com/yt-dlp/yt-dlp).\nYoutube Fluent Downloader will restart after the installation.`,
            buttons: ["Yes", "No"]
        });
        if (pressedButton === typings_1.YTDLPInstallationPromptButton.Yes) {
            try {
                yield downloadYtdlp();
                return true;
            }
            catch (err) {
                return err;
            }
            ;
        }
        return false;
    });
}
exports.promptInstallation = promptInstallation;
function initializeYtdlp() {
    const installationCheck = checkForInstallation();
    if (installationCheck.state === "ok")
        return true;
    if (!installationCheck.reason || !installationCheck.message)
        return false;
    return installationCheck.reason;
}
exports.initializeYtdlp = initializeYtdlp;
//# sourceMappingURL=ytdlp.js.map