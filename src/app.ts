import electron, { app, BrowserWindow } from "electron";
import { Request } from "express";

import { listen } from "./server";
import { SERVER_PORT } from "./constants";
import { ApplicationSettings, ReadSettingsFail, RequestedControlEvent } from "./typings";
import { initializeAppData, readSettingsFile } from "./appdata";
import { settings } from "cluster";

export let mainWindow: BrowserWindow;

// Initializes the application data.
const initializationState = initializeAppData();

app.once("ready", async function () {

	if (!initializationState) return app.exit();

	const applicationSettings: ApplicationSettings | ReadSettingsFail = readSettingsFile();

	if (applicationSettings.status === "failed") return app.exit();

	const settingsCasting = applicationSettings as ApplicationSettings;

	mainWindow = new BrowserWindow({
		width: settingsCasting.window.resolution.width,
		height: settingsCasting.window.resolution.height,
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

	const listenState: boolean | number = await listen();

	if (!listenState) return app.exit();

	mainWindow.show();
	mainWindow.loadURL(`http://localhost:${listenState}`);
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