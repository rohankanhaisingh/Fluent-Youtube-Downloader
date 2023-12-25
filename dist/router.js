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
function requireLogin(req, res, next) {
    if (req.session && req.session.loggedIn)
        return next();
    console.log("Warning: (Unauthorized) - client got tried accessing the server, but got blocked.".yellow);
    return res.status(403).send("Not allowed");
}
exports.requireLogin = requireLogin;
function route(router) {
    router.get("/", function (req, res) {
        if (!("accessibility-type" in req.headers) || !("authentication-token" in req.headers)) {
            console.log("Warning: Client tried accessing page but got rejected because there is no authentication token specified.".yellow);
            return res.status(403).redirect("https://www.youtube.com/watch?v=eZe3zNR27bU&ab_channel=ClinicalGecko89");
        }
        if (req.headers["accessibility-type"] !== "Electron") {
            console.log("Warning: Client tried accessing page but got rejected because accessibility-type is not 'Electron'.".yellow);
            return res.status(403).send("Not allowed for non-Electron applications.");
        }
        if (req.headers["authentication-token"] !== server_1.reservedServerAuthToken) {
            console.log("Warning: Client tried accessing page but got rejected because of authority reasons and stuff you know.".yellow);
            return res.status(403).send("Bruh");
        }
        req.session.loggedIn = true;
        res.render("index", { applicationTheme: app_1.applicationTheme });
    });
    router.get("/test", requireLogin, function (req, res) {
        res.status(200).render("index.test.ejs");
    });
    router.get("/get-authtoken", requireLogin, function (req, res) {
        res.status(200).send(server_1.reservedServerAuthToken);
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
//# sourceMappingURL=router.js.map