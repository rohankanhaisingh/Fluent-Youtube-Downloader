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
exports.listen = exports.reservedServerAuthToken = exports.router = exports.server = void 0;
const express_1 = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const portscanner_1 = __importDefault(require("portscanner"));
const electron_1 = __importDefault(require("electron"));
const express_session_1 = __importDefault(require("express-session"));
const uuid_1 = require("uuid");
const constants_1 = require("./constants");
const router_1 = require("./router");
const app_1 = require("./app");
const appdata_1 = require("./appdata");
const entry_1 = require("./rest/entry");
exports.server = (0, express_1.default)();
exports.router = (0, express_1.Router)();
exports.reservedServerAuthToken = (0, uuid_1.v4)();
exports.server.set("view engine", "ejs");
exports.server.set("views", constants_1.VIEWS_PATH);
exports.server.use("/static/icons/", express_1.default.static(path_1.default.join(constants_1.APPLICATION_PATH, "res", "icons")));
exports.server.use("/static/fonts/", express_1.default.static(path_1.default.join(constants_1.APPLICATION_PATH, "res", "fonts")));
exports.server.use("/static/media/", express_1.default.static(path_1.default.join(constants_1.APPLICATION_PATH, "res", "media")));
exports.server.use("/static/data", express_1.default.static(path_1.default.join(constants_1.APPLICATION_PATH, "res", "data")));
exports.server.use("/static/cache/", express_1.default.static(path_1.default.join(constants_1.APPLICATION_PATH, "res", "cache")));
exports.server.use("/static/scripts/", express_1.default.static(path_1.default.join(constants_1.APPLICATION_PATH, "scripts", "dist")));
exports.server.use("/static/sourcemap/", express_1.default.static(path_1.default.join(constants_1.APPLICATION_PATH, "scripts")));
exports.server.use("/static/styles/", express_1.default.static(path_1.default.join(constants_1.APPLICATION_PATH, "styles", "dist")));
(0, entry_1.rest)(exports.router);
(0, router_1.route)(exports.router);
exports.server.use(body_parser_1.default.urlencoded({ extended: true }));
exports.server.use(body_parser_1.default.json());
exports.server.use((0, express_session_1.default)({
    secret: exports.reservedServerAuthToken,
    resave: true,
    saveUninitialized: true
}));
exports.server.use((0, cors_1.default)());
exports.server.use(function (req, res, next) {
    const ipHeader = req.headers[`x-forwarded-for`], clientHostname = req.hostname;
    if (clientHostname !== "localhost")
        return res.status(403).json("Not allowed");
    next();
});
exports.server.use("/", exports.router);
function listen() {
    return __awaiter(this, void 0, void 0, function* () {
        const applicationSettings = (0, appdata_1.readSettingsFile)();
        const allocatedServerPort = applicationSettings.server.port || constants_1.SERVER_PORT;
        const portStatus = yield portscanner_1.default.checkPortStatus(allocatedServerPort);
        if (portStatus !== "open") {
            exports.server.listen(allocatedServerPort);
            return allocatedServerPort;
        }
        const errorTrace = new Error(`Failed to start local webserver since port ${allocatedServerPort} is already in use.`);
        yield electron_1.default.dialog.showMessageBox(app_1.mainWindow, {
            type: "error",
            message: errorTrace.message,
            detail: errorTrace.stack,
            title: "Fluent Youtube Downloader - Runtime error",
            buttons: ["Close"]
        });
        return false;
    });
}
exports.listen = listen;
