import { Router, Request, Response } from "express";
import { dialog } from "electron";

import details from "./core/video-details";
import { mainWindow } from "../app";

export function rest(router: Router) {

	router.post("/rest/video-details", function (req: Request, res: Response) {

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
}