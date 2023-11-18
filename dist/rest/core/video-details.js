"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ytdl_core_1 = __importDefault(require("ytdl-core"));
function execute(videoUrl) {
    return new Promise(function (resolve, reject) {
        ytdl_core_1.default.getInfo(videoUrl)
            .then(function (details) {
            resolve(details);
        })
            .catch(function (err) {
            reject(err);
        });
    });
}
exports.default = execute;
