"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.route = exports.readSettingsFile = exports.initializeAppData = exports.checkFolderStructure = exports.createFolderStructure = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const electron_1 = __importStar(require("electron"));
const constants_1 = require("./constants");
const app_1 = require("./app");
const router_1 = require("./router");
function createFolderStructure(structureMap, currentPath) {
    if (!fs_1.default.existsSync(currentPath))
        fs_1.default.mkdirSync(currentPath);
    Object.entries(structureMap).forEach(([item, contents]) => {
        const itemPath = path_1.default.join(currentPath, item);
        if (typeof contents === 'object' && Object.keys(contents).length > 0) {
            if (!fs_1.default.existsSync(itemPath))
                fs_1.default.mkdirSync(itemPath);
            createFolderStructure(contents, itemPath);
        }
        else {
            if (!fs_1.default.existsSync(itemPath))
                fs_1.default.writeFileSync(itemPath, JSON.stringify(contents));
        }
    });
}
exports.createFolderStructure = createFolderStructure;
function checkFolderStructure(structureMap, currentPath) {
    if (!fs_1.default.existsSync(currentPath))
        return null;
    const missingPhysicalFilePaths = [];
    function loopThroughFiles(structureMap, currentPath) {
        const items = fs_1.default.readdirSync(currentPath);
        for (const [item, content] of Object.entries(structureMap)) {
            const itemPath = path_1.default.join(currentPath, item);
            if (items.includes(item)) {
                if (typeof content === 'object' && Object.keys(content).length > 0) {
                    loopThroughFiles(content, itemPath);
                }
                else {
                    if (!fs_1.default.existsSync(itemPath))
                        missingPhysicalFilePaths.push(itemPath);
                }
            }
            else {
                missingPhysicalFilePaths.push(itemPath);
            }
        }
    }
    loopThroughFiles(structureMap, currentPath);
    const missingFileNames = [];
    for (let physicalPath of missingPhysicalFilePaths)
        missingFileNames.push(path_1.default.basename(physicalPath));
    return missingFileNames;
}
exports.checkFolderStructure = checkFolderStructure;
function initializeAppData() {
    if (!constants_1.APPDATA_PATH) {
        electron_1.default.dialog.showMessageBoxSync(app_1.mainWindow, {
            title: "Fluent Youtube Converter - Application Data",
            message: `Cannot initialize the application since the 'AppData' folder does not exist.`,
            type: "error"
        });
        return electron_1.app.exit();
    }
    ;
    const physicalPath = path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME);
    if (!fs_1.default.existsSync(physicalPath))
        createFolderStructure(constants_1.APPDATA_DIRECTORY_STRUCTURE, path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME));
    const missingFiles = checkFolderStructure(constants_1.APPDATA_DIRECTORY_STRUCTURE, path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME));
    if (missingFiles === null) {
        const errorStack = new TypeError("Failed to check folder structure since the given path might not exist.");
        electron_1.default.dialog.showMessageBoxSync(app_1.mainWindow, {
            title: "Fluent Youtube Converter - NullReferenceError",
            message: `Received 'null' as return value while calling 'checkFolderStructure()'.`,
            detail: errorStack.stack,
            type: "error"
        });
        return electron_1.app.exit();
    }
    if (missingFiles.length > 0)
        createFolderStructure(constants_1.APPDATA_DIRECTORY_STRUCTURE, path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME));
    return true;
}
exports.initializeAppData = initializeAppData;
function readSettingsFile() {
    if (!constants_1.APPDATA_PATH)
        return {
            reason: "Cannot read the application settings file since the 'AppData' folder does not exist.",
            error: new Error("Cannot initialize the application since the 'AppData' folder does not exist.")
        };
    if (!fs_1.default.existsSync(path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME)))
        return {
            reason: `Cannot read the application's settings file since the '${constants_1.APPDATA_DIRECTORY_NAME}' folder does not exist.`,
            error: new Error(`Cannot read the application's settings file since the '${constants_1.APPDATA_DIRECTORY_NAME}' folder does not exist.`)
        };
    if (!fs_1.default.existsSync(path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME, "Application")))
        return {
            reason: `Cannot read the application settings file since the 'Application' folder in ${constants_1.APPDATA_DIRECTORY_NAME} does not exist.`,
            error: new Error(`Cannot read the application settings file since the 'Application' folder in ${constants_1.APPDATA_DIRECTORY_NAME} does not exist.`)
        };
    if (!fs_1.default.existsSync(path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME, "Application", "Settings.json")))
        return {
            reason: `Cannot read the application's settings file since the settings file (Settings.json) does not exist in ${constants_1.APPDATA_DIRECTORY_NAME}/Application`,
            error: new Error(`Cannot read the application's settings file since the settings file (Settings.json) does not exist in ${constants_1.APPDATA_DIRECTORY_NAME}/Application`)
        };
    const fileContent = fs_1.default.readFileSync(path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME, "Application", "Settings.json"), "utf-8");
    const parsedFileContent = JSON.parse(fileContent);
    return JSON.parse(parsedFileContent);
}
exports.readSettingsFile = readSettingsFile;
function route(router) {
    router.get("/appdata/settings", router_1.requireLogin, function (req, res) {
        const settingsFile = readSettingsFile();
        res.status(200).json(settingsFile);
    });
}
exports.route = route;
