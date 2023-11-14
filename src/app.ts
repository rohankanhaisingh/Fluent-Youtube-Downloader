import electron, { app, BrowserWindow } from "electron";
import { Request } from "express";

import { listen } from "./server";
import { SERVER_PORT } from "./constants";
import { RequestedControlEvent } from "./typings";

export let mainWindow: BrowserWindow;

app.once("ready", async function () {

	mainWindow = new BrowserWindow({
		width: 600,
		height: 750,
		title: "Fluent Youtube Converter",
		focusable: true,
		closable: true,
		movable: true,
		show: false,
		maximizable: true,
		fullscreenable: true,
		center: true,
		backgroundColor: "#ffffff",
		autoHideMenuBar: true,
		titleBarStyle: "hidden",
		webPreferences: {
			contextIsolation: false,
			nodeIntegration: true,
			nodeIntegrationInSubFrames: true,
			nodeIntegrationInWorker: true,
			webgl: true
		}
	});

	const listenState: boolean = await listen();

	if (!listenState) return app.exit();

	mainWindow.show();
	mainWindow.loadURL(`http://localhost:${SERVER_PORT}`);
});

export function handleControlEvents(req: Request) {

	const action: RequestedControlEvent = req.body.action;

	switch (action) {
		case "close":

			mainWindow.close();
			app.exit();
			break;
		case "maximize":

			if (mainWindow.isMaximized()) {
				mainWindow.unmaximize();
			} else {
				mainWindow.maximize();
			}
			break;
		case "minimize":

			mainWindow.minimize();
			break;
	}
}