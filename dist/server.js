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
exports.listen = exports.router = exports.server = void 0;
const express_1 = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const constants_1 = require("./constants");
const router_1 = require("./router");
exports.server = (0, express_1.default)();
exports.router = (0, express_1.Router)();
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
(0, router_1.route)(exports.router);
exports.server.use(body_parser_1.default.urlencoded({ extended: true }));
exports.server.use(body_parser_1.default.json());
exports.server.use((0, cors_1.default)());
exports.server.use("/", exports.router);
function listen() {
    exports.server.listen(constants_1.SERVER_PORT, function () {
        console.log(`Server is running on port ${constants_1.SERVER_PORT}`);
    });
}
exports.listen = listen;
