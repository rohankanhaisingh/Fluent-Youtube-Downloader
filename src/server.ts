import express, { Express, Router } from "express";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";
import portscanner from "portscanner";
import electron from "electron";
import http from "http";
import session from "express-session";
import socket, { Socket } from "socket.io";
import { v4 } from "uuid";

import { APPLICATION_PATH, SERVER_PORT, VIEWS_PATH } from "./constants";
import { route } from "./router";
import { mainWindow } from "./app";
import { readSettingsFile } from "./appdata";
import { ApplicationSettings } from "./typings";
import { rest } from "./rest/entry";
import { sokkie } from "./socket";

export const server: Express = express();
export const httpServer = http.createServer(server);
export const router: Router = Router();
export const io = new socket.Server(httpServer);

export const reservedServerAuthToken: string = v4();

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

server.use(session({
	secret: reservedServerAuthToken,
	resave: true,
	saveUninitialized: true
}));

server.use(cors());

server.use(function (req, res, next) {

	// This should be done better, anyone know how?
	const ipHeader: string[] | string | undefined = req.headers[`x-forwarded-for`],
		clientHostname: string = req.hostname;

	if (clientHostname !== "localhost") {
		console.log(`Warning: Client tried connecting to local web-server but is black-listed. Hostname: ${clientHostname}.`.yellow);
		return res.status(403).json("Not allowed");
	}

	next();
});

io.use(function (socket, next) {

	const token = socket.handshake.auth.token;

	if (token === reservedServerAuthToken)
		return next();

	console.log("Warning: Client tried making a web-socket connected but got rejected.".yellow);

	return next(new Error("Authentication Error"));
});

sokkie(io);
server.use("/", router);

/**
 * Starts listening the web server server. This function returns either a boolean 
 * representing the state of the execution, or a number representing the port of the server.
 * @returns
 */
export async function listen(): Promise<boolean | number> {

	const applicationSettings = readSettingsFile() as ApplicationSettings;
	const allocatedServerPort = parseInt(applicationSettings.server.port as unknown as string) || SERVER_PORT;

	// Check if the allocated server is already in use.
	const portStatus = await portscanner.checkPortStatus(allocatedServerPort);

	if (portStatus !== "open") {

		httpServer.listen(allocatedServerPort);
		console.log(`Info: Started listening on port ${allocatedServerPort}.`.gray);
		return allocatedServerPort;
	}

	const errorTrace = new Error(`Failed to start local webserver since port ${allocatedServerPort} is already in use.`);
	console.log(`Error: ${errorTrace.message}`.red);


	await electron.dialog.showMessageBox(mainWindow, {
		type: "error",
		message: errorTrace.message,
		detail: errorTrace.stack,
		title: "Fluent Youtube Downloader - Runtime error",
		buttons: ["Close"]
	});

	return false;
}