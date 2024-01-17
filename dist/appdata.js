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
exports.restoreSettings = exports.createHistoryItem = exports.clearHistory = exports.getHistory = exports.getCacheDirectory = exports.updateSettingsFile = exports.readSettingsFile = exports.checkPathVariables = exports.initializeAppData = exports.checkFolderStructure = exports.createFolderStructure = exports.errorLogs = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const electron_1 = __importStar(require("electron"));
const constants_1 = require("./constants");
const app_1 = require("./app");
const utils_1 = require("./utils");
exports.errorLogs = [];
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
            if (!fs_1.default.existsSync(itemPath)) {
                try {
                    fs_1.default.writeFileSync(itemPath, contents);
                }
                catch (err) {
                    exports.errorLogs.push(err);
                }
            }
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
        (0, utils_1.logError)("Could not initialize appdata since variable APPDATA_PATH is set to null.", "appdata.ts");
        return electron_1.app.exit();
    }
    ;
    const physicalPath = path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME);
    if (!fs_1.default.existsSync(physicalPath)) {
        (0, utils_1.logWarning)(`'${physicalPath}' does not exist, but will be created.`, "appdata.ts");
        createFolderStructure(constants_1.APPDATA_DIRECTORY_STRUCTURE, path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME));
    }
    const missingFiles = checkFolderStructure(constants_1.APPDATA_DIRECTORY_STRUCTURE, path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME));
    if (missingFiles === null) {
        const errorStack = new TypeError("Failed to check folder structure since the given path might not exist.");
        electron_1.default.dialog.showMessageBoxSync(app_1.mainWindow, {
            title: "Fluent Youtube Converter - NullReferenceError",
            message: `Received 'null' as return value while calling 'checkFolderStructure()'.`,
            detail: errorStack.stack,
            type: "error"
        });
        (0, utils_1.logError)("Could not check for missing files due to an unknown reason. Variable 'missingFiles' received null.", "appdata.ts");
        return electron_1.app.exit();
    }
    if (missingFiles.length > 0)
        createFolderStructure(constants_1.APPDATA_DIRECTORY_STRUCTURE, path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME));
    (0, utils_1.logWarning)(`Initialized appdata with ${exports.errorLogs.length} error(s).`, "appdata.ts");
    return true;
}
exports.initializeAppData = initializeAppData;
function checkPathVariables() {
    if (!constants_1.APPDATA_PATH)
        return {
            reason: "Cannot read the application settings file since the 'AppData' folder does not exist.",
            error: new Error("Cannot initialize the application since the 'AppData' folder does not exist."),
            status: "failed",
        };
    if (!fs_1.default.existsSync(path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME)))
        return {
            reason: `Cannot read the application's settings file since the '${constants_1.APPDATA_DIRECTORY_NAME}' folder does not exist.`,
            error: new Error(`Cannot read the application's settings file since the '${constants_1.APPDATA_DIRECTORY_NAME}' folder does not exist.`),
            status: "failed",
        };
    if (!fs_1.default.existsSync(path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME, "Application")))
        return {
            reason: `Cannot read the application settings file since the 'Application' folder in ${constants_1.APPDATA_DIRECTORY_NAME} does not exist.`,
            error: new Error(`Cannot read the application settings file since the 'Application' folder in ${constants_1.APPDATA_DIRECTORY_NAME} does not exist.`),
            status: "failed",
        };
    if (!fs_1.default.existsSync(path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME, "Application", "Settings.json")))
        return {
            reason: `Cannot read the application's settings file since the settings file (Settings.json) does not exist in ${constants_1.APPDATA_DIRECTORY_NAME}/Application`,
            error: new Error(`Cannot read the application's settings file since the settings file (Settings.json) does not exist in ${constants_1.APPDATA_DIRECTORY_NAME}/Application`),
            status: "failed",
        };
    (0, utils_1.logInfo)("Local path variables has been set up correctly!", "appdata.ts");
    return {
        status: "ok",
        error: new Error(),
        reason: ""
    };
}
exports.checkPathVariables = checkPathVariables;
function readSettingsFile() {
    if (!constants_1.APPDATA_PATH)
        return {
            status: "failed",
            reason: "Cannot read the application settings file since the 'AppData' folder does not exist.",
            error: new Error("Cannot initialize the application since the 'AppData' folder does not exist.")
        };
    if (!fs_1.default.existsSync(path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME)))
        return {
            status: "failed",
            reason: `Cannot read the application's settings file since the '${constants_1.APPDATA_DIRECTORY_NAME}' folder does not exist.`,
            error: new Error(`Cannot read the application's settings file since the '${constants_1.APPDATA_DIRECTORY_NAME}' folder does not exist.`)
        };
    if (!fs_1.default.existsSync(path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME, "Application")))
        return {
            status: "failed",
            reason: `Cannot read the application settings file since the 'Application' folder in ${constants_1.APPDATA_DIRECTORY_NAME} does not exist.`,
            error: new Error(`Cannot read the application settings file since the 'Application' folder in ${constants_1.APPDATA_DIRECTORY_NAME} does not exist.`)
        };
    if (!fs_1.default.existsSync(path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME, "Application", "Settings.json")))
        return {
            status: "failed",
            reason: `Cannot read the application's settings file since the settings file (Settings.json) does not exist in ${constants_1.APPDATA_DIRECTORY_NAME}/Application`,
            error: new Error(`Cannot read the application's settings file since the settings file (Settings.json) does not exist in ${constants_1.APPDATA_DIRECTORY_NAME}/Application`)
        };
    const fileContent = fs_1.default.readFileSync(path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME, "Application", "Settings.json"), "utf-8");
    const parsedFileContent = JSON.parse(fileContent);
    return Object.assign(Object.assign({}, parsedFileContent), { status: "ok" });
}
exports.readSettingsFile = readSettingsFile;
function updateSettingsFile(key, value) {
    const pathStatus = checkPathVariables();
    if (pathStatus.status !== "ok" || !constants_1.APPDATA_PATH)
        return (0, utils_1.logError)(pathStatus.reason, "appdata.ts");
    const currentSettings = readSettingsFile();
    (0, utils_1.setNestedValue)(currentSettings, key, value);
    const newFileContent = JSON.stringify(currentSettings, null, "");
    (0, utils_1.logInfo)(`Info: Made changes into ${path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME, "Application", "Settings.json")}.`, "appdata.ts");
    fs_1.default.writeFileSync(path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME, "Application", "Settings.json"), newFileContent, "utf-8");
}
exports.updateSettingsFile = updateSettingsFile;
function getCacheDirectory() {
    if (!constants_1.APPDATA_PATH)
        return null;
    if (!fs_1.default.existsSync(path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME)))
        return null;
    if (!fs_1.default.existsSync(path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME, "Cache")))
        return null;
    return path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME, "Cache");
}
exports.getCacheDirectory = getCacheDirectory;
function getHistory() {
    if (!constants_1.APPDATA_PATH)
        return [];
    if (!fs_1.default.existsSync(path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME)))
        return [];
    if (!fs_1.default.existsSync(path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME, "Application")))
        return [];
    if (!fs_1.default.existsSync(path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME, "Application", "History.json")))
        return [];
    const file = fs_1.default.readFileSync(path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME, "Application", "History.json"), "utf-8");
    const data = JSON.parse(file);
    return data;
}
exports.getHistory = getHistory;
function clearHistory() {
    if (!constants_1.APPDATA_PATH)
        return [];
    if (!fs_1.default.existsSync(path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME)))
        return [];
    if (!fs_1.default.existsSync(path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME, "Application")))
        return [];
    if (!fs_1.default.existsSync(path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME, "Application", "History.json")))
        return [];
    fs_1.default.writeFileSync(path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME, "Application", "History.json"), "[]", "utf-8");
    return true;
}
exports.clearHistory = clearHistory;
function createHistoryItem(data) {
    if (!constants_1.APPDATA_PATH)
        return null;
    if (!fs_1.default.existsSync(path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME)))
        return null;
    if (!fs_1.default.existsSync(path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME, "Application")))
        return null;
    if (!fs_1.default.existsSync(path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME, "Application", "History.json")))
        return null;
    const filePath = path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME, "Application", "History.json");
    const fileContent = fs_1.default.readFileSync(filePath, "utf-8");
    const fileData = JSON.parse(fileContent);
    fileData.push(data);
    fs_1.default.writeFileSync(filePath, JSON.stringify(fileData), "utf-8");
    return filePath;
}
exports.createHistoryItem = createHistoryItem;
function restoreSettings() {
    const checkedPathVariables = checkPathVariables();
    if (checkedPathVariables.status === "failed" || constants_1.APPDATA_PATH === undefined)
        return (0, utils_1.logError)("Could not restore the settings because the check for path variables has failed.", "appdata.ts");
    const settingsPath = path_1.default.join(constants_1.APPDATA_PATH, constants_1.APPDATA_DIRECTORY_NAME, "Application", "Settings.json");
    try {
        fs_1.default.unlinkSync(settingsPath);
        (0, utils_1.logInfo)(`Succesfully deleted ${settingsPath}.`, "appdata.ts");
    }
    catch (err) {
        (0, utils_1.logError)(`Failed deleting file ${settingsPath}. Error: ${err.message}`, "appdata.ts");
    }
}
exports.restoreSettings = restoreSettings;
//# sourceMappingURL=appdata.js.map