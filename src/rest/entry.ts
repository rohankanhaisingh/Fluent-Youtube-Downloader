import { Router, Request, Response } from "express";
import { dialog, Notification } from "electron";
import path from "path";

import details from "./core/video-details";
import pipeline from "./core/pipeline";

import { mainWindow, restartApplication } from "../app";
import { requireLogin } from "../router";
import { ROOT_PATH } from "../constants";
import { emit } from "../socket";
import { logError, logInfo } from "../utils";

export function rest(router: Router) {

	router.post("/rest/video-details", requireLogin, function (req: Request, res: Response) {

		const { url } = req.body;

		details(url).then(function (response) {

			res.status(200).json(response);
		}).catch(function (err: Error) {

			logError(err.message, "entry.ts");

			emit("app/in-app-dialog", {
				title: "An error occurred",
				message: err.message,
				icon: "error"
			});

			res.status(500).json({ message: err.message, stack: err.stack, name: err.name });
		})
	});

	router.post("/rest/download", requireLogin, function (req: Request, res: Response) {

		const { url, requestId, quality, extension } = req.body;

		pipeline(url, quality, extension, requestId).then(function (response) {

			if (response.state === "ok") {

				new Notification({
					title: "Fluent Youtube Downloader",
					subtitle: "Fluent Youtube Downloader",
					icon: path.join(ROOT_PATH, "icon.ico"),
					body: "Video has succesfully been converted.",
				}).show();

				emit("app/yt-dlp/convert-complete", { requestId });
				return res.status(200).send("Download completed");
			}

			if (response.state === "installation-succeed") {

				new Notification({
					title: "Fluent Youtube Downloader",
					subtitle: "Fluent Youtube Downloader",
					icon: path.join(ROOT_PATH, "icon.ico"),
					body: "yt-dlp has been succesfully downloaded. Fluent Youtube Downloader will now restart.",
				}).show();

				return restartApplication();
			}

			emit("app/in-app-dialog", {
				title: "An error occurred",
				message: response.reason,
				icon: "error"
			});

			res.status(500).send(response.reason);

		}).catch(function (err: Error) {

			dialog.showMessageBox(mainWindow, {
				title: "FFPMEG pipeline error",
				type: "error",
				message: err.message,
				detail: err.stack
			})

			res.status(500).send(err.message);
		});
	});
}