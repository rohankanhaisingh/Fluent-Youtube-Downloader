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
const fs_1 = __importDefault(require("fs"));
const better_tasklist_1 = __importDefault(require("better-tasklist"));
function execute(command, convertStream, destinationPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            command.kill("SIGINT");
            const allRunningTasks = yield better_tasklist_1.default.fetch(null);
            const ffmpegCommands = better_tasklist_1.default.filter(allRunningTasks, { imageName: "ffmpeg.exe" });
            for (let process of ffmpegCommands)
                yield better_tasklist_1.default.killProcessByPID(process.pid, true);
            if (!convertStream.destroyed)
                convertStream.destroy();
            if (fs_1.default.existsSync(destinationPath))
                fs_1.default.unlinkSync(destinationPath);
            return true;
        }
        catch (err) {
            console.log(err);
            return false;
        }
    });
}
exports.default = execute;
