import { app, BrowserWindow } from "electron";
import { Request } from "express";
import path from "path";
import electronIsDev from "electron-is-dev";

import { listen } from "./server";
import { ROOT_PATH, SERVER_PORT } from "./constants";
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
		width: settingsCasting.window.resolution.width > 1400 ? settingsCasting.window.resolution.width : 1400,
		height: settingsCasting.window.resolution.height > 800 ? settingsCasting.window.resolution.height : 800,
		title: "Fluent Youtube Converter",
		focusable: true,
		closable: true,
		movable: true,
		show: false,
		maximizable: true,
		fullscreenable: true,
		center: true,
		backgroundColor: "#f7f5fc",
		//autoHideMenuBar: true,
		titleBarStyle: "default",
		titleBarOverlay: {
			color: "#f7f5fc",
			symbolColor:"#000",
		},
		icon: path.join(ROOT_PATH, "application", "res", "media", "app-icons", "icon.png"),
		webPreferences: {
			contextIsolation: false,
			nodeIntegration: true,
			nodeIntegrationInSubFrames: true,
			nodeIntegrationInWorker: true,
			webgl: true
		}
	});

	mainWindow.setMenu(null);

	if (electronIsDev)
		mainWindow.webContents.openDevTools();

	const listenState: boolean | number = await listen();

	if (!listenState) return app.exit();

	mainWindow.loadURL(`http://localhost:${listenState}`);

	mainWindow.webContents.on("dom-ready", function () {

		mainWindow.show();
	});
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