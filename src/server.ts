import express, { Express, Router } from "express";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";
import portscanner from "portscanner";
import electron from "electron";

import { APPLICATION_PATH, SERVER_PORT, VIEWS_PATH } from "./constants";
import { route } from "./router";
import { mainWindow } from "./app";
import { readSettingsFile } from "./appdata";
import { ApplicationSettings } from "./typings";
import { rest } from "./rest/entry";

export const server: Express = express();
export const router: Router = Router();

server.set("view engine", "ejs");
server.set("views", VIEWS_PATH);

server.use("/static/icons/", express.static(path.join(APPLICATION_PATH, "res", "icons")));
server.use("/static/fonts/", express.static(path.join(APPLICATION_PATH, "res", "fonts")));
server.use("/static/media/", express.static(path.join(APPLICATION_PATH, "res", "media")));
server.use("/static/data", express.static(path.join(APPLICATION_PATH, "res", "data")))
server.use("/static/cache/", express.static(path.join(APPLICATION_PATH, "res", "cache")));
server.use("/static/scripts/", express.static(path.join(APPLICATION_PATH, "scripts", "dist")));
server.use("/static/sourcemap/", express.static(path.join(APPLICATION_PATH, "scripts")));
server.use("/static/styles/", express.static(path.join(APPLICATION_PATH, "styles", "dist")));

rest(router);
route(router);

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(cors());
server.use("/", router);

/**
 * Starts listening the web server server. This function returns either a boolean 
 * representing the state of the execution, or a number representing the port of the server.
 * @returns
 */
export async function listen(): Promise<boolean | number> {

	const applicationSettings = readSettingsFile() as ApplicationSettings;
	const allocatedServerPort = applicationSettings.server.port || SERVER_PORT;

	// Check if the allocated server is already in use.
	const portStatus = await portscanner.checkPortStatus(allocatedServerPort);

	if (portStatus !== "open") {

		server.listen(allocatedServerPort);
		return allocatedServerPort;
	}

	const errorTrace = new Error(`Failed to start local webserver since port ${allocatedServerPort} is already in use.`);

	await electron.dialog.showMessageBox(mainWindow, {
		type: "error",
		message: errorTrace.message,
		detail: errorTrace.stack,
		title: "Fluent Youtube Downloader - Runtime error",
		buttons: ["Close"]
	});

	return false;
}