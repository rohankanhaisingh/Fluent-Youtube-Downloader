"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAR_FILE_NAME = exports.MAX_FILE_SIZE = exports.YTDLP_EXECUTABLE_FILENAME = exports.APPDATA_DIRECTORY_STRUCTURE = exports.APPDATA_DIRECTORY_NAME = exports.APPDATA_PATH = exports.DOTENV_FILE = exports.SERVER_PORT = exports.ENTRY_SCRIPT_FILES = exports.SCRIPTS_PATH = exports.VIEWS_PATH = exports.APPLICATION_PATH = exports.ROOT_PATH = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
exports.ROOT_PATH = path_1.default.join(__dirname, "../");
exports.APPLICATION_PATH = path_1.default.join(exports.ROOT_PATH, "application");
exports.VIEWS_PATH = path_1.default.join(exports.APPLICATION_PATH, "views");
exports.SCRIPTS_PATH = path_1.default.join(exports.APPLICATION_PATH, "scripts");
exports.ENTRY_SCRIPT_FILES = fs_1.default.readdirSync(exports.SCRIPTS_PATH, "utf-8");
exports.SERVER_PORT = 8000;
exports.DOTENV_FILE = path_1.default.join(exports.ROOT_PATH, ".env");
exports.APPDATA_PATH = process.env.APPDATA;
exports.APPDATA_DIRECTORY_NAME = "fluent-youtube-downloader";
exports.APPDATA_DIRECTORY_STRUCTURE = {
    "blob_storage": {},
    "Cache": {
        "Cache_Data": {
            "f0933i": "<entry> index.ejs"
        }
    },
    "Code Cache": {
        "js": {},
        "wasm": {}
    },
    "DawnCache": {},
    "GPUCache": {},
    "Local Storage": {
        "levldb": {}
    },
    "Network": {},
    "Session Storage": {},
    "Application": {
        "Settings.json": JSON.stringify({
            "behavior": {
                "autoStart": false,
                "systemTray": false,
                "startOptions": null
            },
            "window": {
                "resolution": {
                    "width": 600,
                    "height": 750
                },
                "display": {
                    "theme": "fluent-light-purple",
                    "darkMode": false,
                }
            },
            "path": {
                "appDataPath": null,
                "downloadPath": null,
                "ffmpegPath": null
            },
            "server": {
                "port": 8000
            }
        }),
        "History.json": "[]"
    }
};
exports.YTDLP_EXECUTABLE_FILENAME = "yt-dlp.exe";
exports.MAX_FILE_SIZE = 210;
exports.TAR_FILE_NAME = "yt-dlp.tar.gz";
