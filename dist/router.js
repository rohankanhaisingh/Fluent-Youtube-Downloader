"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.route = void 0;
function route(router) {
    router.get("/", function (req, res) {
        res.render("index");
    });
}
exports.route = route;
