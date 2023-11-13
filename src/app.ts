import electron, { app, BrowserWindow } from "electron";

import { listen } from "./server";
import { SERVER_PORT } from "./constants";

export let mainWindow: BrowserWindow;

app.once("ready", function () {

	mainWindow = new BrowserWindow({
		width: 600,
		height: 750,
		title: "Youtube Converter",
		focusable: true,
		closable: true,
		movable: true,
		maximizable: true,
		fullscreenable: true,
		center: true,
		backgroundColor: "#ffffff",
		webPreferences: {
			contextIsolation: false,
			nodeIntegration: true,
			nodeIntegrationInSubFrames: true,
			nodeIntegrationInWorker: true,
			webgl: true
		}
	});

	listen();

	mainWindow.loadURL(`http://localhost:${SERVER_PORT}`);
});