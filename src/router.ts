import { NextFunction, Request, Response, Router } from "express";

import fs from "fs";
import ejs from "ejs";
import path from "path";

import { VIEWS_PATH } from "./constants";
import { applicationTheme, handleControlEvents } from "./app";
import { reservedServerAuthToken } from "./server";

declare module 'express-session' {
	interface SessionData {
		loggedIn?: boolean;
	}
}

export function requireLogin(req: Request, res: Response, next: NextFunction) {

	if (req.session && req.session.loggedIn) return next();

	console.log("Warning: (Unauthorized) - client got tried accessing the server, but got blocked.".yellow);
	return res.status(403).send("Not allowed");
}

export function route(router: Router) {

	router.get("/", function (req: Request, res: Response) {

		if (!("accessibility-type" in req.headers) || !("authentication-token" in req.headers)) {

			console.log("Warning: Client tried accessing page but got rejected because there is no authentication token specified.".yellow);
			return res.status(403).redirect("https://www.youtube.com/watch?v=eZe3zNR27bU&ab_channel=ClinicalGecko89");
		}

		if (req.headers["accessibility-type"] !== "Electron") {
			console.log("Warning: Client tried accessing page but got rejected because accessibility-type is not 'Electron'.".yellow);
			return res.status(403).send("Not allowed for non-Electron applications.");
		}

		if (req.headers["authentication-token"] !== reservedServerAuthToken) {
			console.log("Warning: Client tried accessing page but got rejected because of authority reasons and stuff you know.".yellow);
			return res.status(403).send("Bruh");
		}

		req.session.loggedIn = true;

		res.render("index", { applicationTheme });
	});

	router.get("/test", requireLogin, function (req: Request, res: Response) {

		res.status(200).render("index.test.ejs");
	});

	router.get("/get-authtoken", requireLogin, function (req: Request, res: Response) {

		res.status(200).send(reservedServerAuthToken);
	});

	router.use("/tabs/", requireLogin, async function (req: Request, res: Response) {

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