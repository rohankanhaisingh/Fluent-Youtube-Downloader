"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logWarning = exports.logError = exports.logInfo = exports.formatCurrentTime = exports.deleteFile = exports.openFile = exports.resolveVideoQuality = exports.setNestedValue = exports.getNestedValue = void 0;
const fs_1 = __importDefault(require("fs"));
const child_process_1 = __importDefault(require("child_process"));
const socket_1 = require("./socket");
function getNestedValue(obj, propString) {
    const props = propString.split('.');
    let currentObj = obj;
    for (let i = 0; i < props.length; i++) {
        if (currentObj && currentObj.hasOwnProperty(props[i])) {
            currentObj = currentObj[props[i]];
        }
        else {
            return undefined;
        }
    }
    return currentObj;
}
exports.getNestedValue = getNestedValue;
function setNestedValue(obj, propString, value) {
    const props = propString.split('.');
    let currentObj = obj;
    for (let i = 0; i < props.length - 1; i++) {
        if (currentObj && currentObj.hasOwnProperty(props[i])) {
            currentObj = currentObj[props[i]];
        }
        else {
            return;
        }
    }
    const lastProp = props[props.length - 1];
    if (currentObj && currentObj.hasOwnProperty(lastProp))
        currentObj[lastProp] = value;
}
exports.setNestedValue = setNestedValue;
function resolveVideoQuality(givenQualityString) {
    switch (givenQualityString) {
        case "highest-audio":
            return "highestaudio";
        case "lowest-audio":
            return "lowestaudio";
        case "highest-video":
            return "highestvideo";
        case "lowest-video":
            return "lowestvideo";
        default:
            return givenQualityString;
    }
}
exports.resolveVideoQuality = resolveVideoQuality;
function openFile(filePath) {
    var _a, _b;
    const process = child_process_1.default.exec(`"${filePath}"`);
    (_a = process.stdout) === null || _a === void 0 ? void 0 : _a.on("data", function (chunk) {
        console.log(chunk.toString());
    });
    (_b = process.stderr) === null || _b === void 0 ? void 0 : _b.on("data", function (chunk) {
        console.log(chunk.toString());
    });
}
exports.openFile = openFile;
function deleteFile(filePath) {
    if (!fs_1.default.existsSync(filePath))
        return (0, socket_1.emit)("app/in-app-dialog", {
            title: "File not found",
            message: [
                "Could not delete file because Fluent Youtube Download could not find it.",
                `Looking for file: ${filePath}.`,
                `<code> ${new Error().stack} </code>`
            ],
            icon: "error"
        });
    fs_1.default.unlinkSync(filePath);
    return true;
}
exports.deleteFile = deleteFile;
function formatCurrentTime() {
    const now = new Date();
    const hours = now.getHours(), minutes = now.getMinutes(), seconds = now.getSeconds();
    return `${hours}:${minutes}:${seconds}`;
}
exports.formatCurrentTime = formatCurrentTime;
const logInfo = (message, from) => console.log(`(${formatCurrentTime()})`.bgWhite.black + ` (from: ${from}) `.gray + `[INFO]:`.green + " " + message.trim());
exports.logInfo = logInfo;
const logError = (message, from) => console.log(`(${formatCurrentTime()})`.bgWhite.black + ` (from: ${from}) `.gray + `[ERROR]:`.red + " " + message.trim());
exports.logError = logError;
const logWarning = (message, from) => console.log(`(${formatCurrentTime()})`.bgWhite.black + ` (from: ${from}) `.gray + `[WARNING]:`.yellow + " " + message.trim());
exports.logWarning = logWarning;
//# sourceMappingURL=utils.js.map