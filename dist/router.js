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
exports.route = exports.requireLogin = void 0;
const fs_1 = __importDefault(require("fs"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("./constants");
const app_1 = require("./app");
const server_1 = require("./server");
const appdata_1 = require("./appdata");
function requireLogin(req, res, next) {
    if (req.session && req.session.loggedIn)
        return next();
    res.status(403).send("Not allowed");
}
exports.requireLogin = requireLogin;
function route(router) {
    (0, appdata_1.route)(router);
    router.get("/", function (req, res) {
        if (!("accessibility-type" in req.headers) || !("authentication-token" in req.headers))
            return res.status(403).send("Not allowed.");
        if (req.headers["accessibility-type"] !== "Electron")
            return res.status(403).send("Not allowed for non-Electron applications.");
        if (req.headers["authentication-token"] !== server_1.reservedServerAuthToken)
            return res.status(403).send("Bruh");
        req.session.loggedIn = true;
        res.render("index");
    });
    router.use("/tabs/", requireLogin, function (req, res) {
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
