"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOTENV_FILE = exports.SERVER_PORT = exports.ENTRY_SCRIPT_FILES = exports.SCRIPTS_PATH = exports.VIEWS_PATH = exports.APPLICATION_PATH = exports.ROOT_PATH = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
exports.ROOT_PATH = path_1.default.join(__dirname, "../");
exports.APPLICATION_PATH = path_1.default.join(exports.ROOT_PATH, "application");
exports.VIEWS_PATH = path_1.default.join(exports.APPLICATION_PATH, "views");
exports.SCRIPTS_PATH = path_1.default.join(exports.APPLICATION_PATH, "scripts");
exports.ENTRY_SCRIPT_FILES = fs_1.default.readdirSync(exports.SCRIPTS_PATH, "utf-8");
exports.SERVER_PORT = 8000;
exports.DOTENV_FILE = path_1.default.join(exports.ROOT_PATH, ".env");
