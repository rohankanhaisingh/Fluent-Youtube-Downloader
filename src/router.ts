import { NextFunction, Request, Response, Router } from "express";

import fs from "fs";
import ejs from "ejs";
import path from "path";

import { VIEWS_PATH } from "./constants";
import { handleControlEvents } from "./app";
import { reservedServerAuthToken } from "./server";

declare module 'express-session' {
	interface SessionData {
		loggedIn?: boolean;
	}
}

export function requireLogin(req: Request, res: Response, next: NextFunction) {

	if (req.session && req.session.loggedIn) return next();

	res.status(403).send("Not allowed");
}

export function route(router: Router) {

	router.get("/", function (req: Request, res: Response) {

		if (!("accessibility-type" in req.headers) || !("authentication-token" in req.headers))
			return res.status(403).send("Not allowed.");

		if (req.headers["accessibility-type"] !== "Electron")
			return res.status(403).send("Not allowed for non-Electron applications.");

		if (req.headers["authentication-token"] !== reservedServerAuthToken)
			return res.status(403).send("Bruh");

		req.session.loggedIn = true;

		res.render("index");
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