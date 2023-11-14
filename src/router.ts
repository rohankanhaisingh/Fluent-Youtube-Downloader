import { Request, Response, Router } from "express";

import fs from "fs";
import ejs from "ejs";
import path from "path";

import { VIEWS_PATH } from "./constants";
import { handleControlEvents } from "./app";

export function route(router: Router) {

	router.get("/", function (req: Request, res: Response) {

		res.render("index");
	});

	router.use("/tabs/", async function (req: Request, res: Response) {

		const requestedTabName: string = req.url.replace("/", ""),
			requestedFileName: string = requestedTabName + ".ejs";

		if (!fs.existsSync(path.join(VIEWS_PATH, "tabs", requestedFileName)))
			return res.status(404).send("Request page not found.");

		const renderResponse = await ejs.renderFile(path.join(VIEWS_PATH, "tabs", requestedFileName));

		res.status(200).send(renderResponse);
	});

	router.use("/window/", function (req: Request, res: Response) {

		const requestedWindowFunction = req.url.replace("/", "");

		switch (requestedWindowFunction) {
			case "control-event": handleControlEvents(req); break;
		}

	});
}