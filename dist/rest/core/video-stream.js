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
const ytdl_core_1 = __importDefault(require("ytdl-core"));
function execute(videoUrl, resolvedVideoQuality) {
    return new Promise(function (resolve, reject) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stream = (0, ytdl_core_1.default)(videoUrl, { filter: "videoandaudio" });
                resolve(stream);
            }
            catch (err) {
                reject(err);
            }
        });
    });
}
exports.default = execute;
//# sourceMappingURL=video-stream.js.map