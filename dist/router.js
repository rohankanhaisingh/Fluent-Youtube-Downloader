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
exports.route = void 0;
const fs_1 = __importDefault(require("fs"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("./constants");
const app_1 = require("./app");
function route(router) {
    router.get("/", function (req, res) {
        res.render("index");
    });
    router.use("/tabs/", function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestedTabName = req.url.replace("/", ""), requestedFileName = requestedTabName + ".ejs";
            if (!fs_1.default.existsSync(path_1.default.join(constants_1.VIEWS_PATH, "tabs", requestedFileName)))
                return res.status(404).send("Request page not found.");
            const renderResponse = yield ejs_1.default.renderFile(path_1.default.join(constants_1.VIEWS_PATH, "tabs", requestedFileName));
            res.status(200).send(renderResponse);
        });
    });
    router.use("/window/", function (req, res) {
        const requestedWindowFunction = req.url.replace("/", "");
        switch (requestedWindowFunction) {
            case "control-event":
                (0, app_1.handleControlEvents)(req);
                break;
        }
    });
}
exports.route = route;
