import { Router, Request, Response } from "express";
import { dialog } from "electron";

import details from "./core/video-details";
import pipeline from "./core/pipeline";

import { mainWindow, restartApplication } from "../app";
import { requireLogin } from "../router";

export function rest(router: Router) {

	router.post("/rest/video-details", requireLogin, function (req: Request, res: Response) {

		const { url } = req.body;

		details(url).then(function (response) {

			res.status(200).json(response);
		}).catch(function (err: Error) {

			dialog.showMessageBox(mainWindow, {
				title: "Error",
				type: "error",
				message: err.message,
				detail: err.stack,
			});

			res.status(500).json({ message: err.message, stack: err.stack, name: err.name });
		})
	});

	router.post("/rest/download", requireLogin, function (req: Request, res: Response) {

		const { url, requestId, quality } = req.body;

		pipeline(url, quality, requestId).then(function (response) {

			if (response.state == "ok")
				return res.status(200).send("hi");

			if (response.state === "installation-succeed")
				return restartApplication();

			dialog.showMessageBox(mainWindow, {
				title: "Conversion error",
				type: "error",
				message: "Something went wrong while converting a video.",
				detail: response.reason,
			});

			res.status(500).send(response.reason);

		}).catch(function (err: Error) {

			res.status(500).send(err.message);
		});
	});
}