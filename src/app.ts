import { app, BrowserWindow } from "electron";
import { application, Request } from "express";
import path from "path";
import electronIsDev from "electron-is-dev";
import colors from "colors";

import { listen, reservedServerAuthToken } from "./server";
import { ROOT_PATH, SERVER_PORT } from "./constants";
import { ApplicationSettings, ReadSettingsFail, RequestedControlEvent } from "./typings";
import { initializeAppData, readSettingsFile } from "./appdata";
import { initializeAutoLaunch } from "./auto-launch";
import { initializeSystemTray } from "./tray";

export let mainWindow: BrowserWindow;
export let darkMode: boolean;


colors.enable();
console.log("Info: Starting application...".gray);

// Initializes the application data.
const initializationState = initializeAppData();

app.once("ready", async function () {

	// The program will close if the application's data has 
	// failed initializing.
	if (!initializationState) {
		console.log(`Error: Could not initialize the application it's data due to an uknown reason.`.red);
		return app.exit();
	}

	const applicationSettings: ApplicationSettings | ReadSettingsFail = readSettingsFile();

	// The application will close whenever the settings 
	// file failed reading.
	if (applicationSettings.status === "failed") {
		console.log(`Error: ${(applicationSettings as ReadSettingsFail).reason}`.red);
		return app.exit();
	}

	// Cast the variable cuz bruh idfk.
	const settingsCasting = applicationSettings as ApplicationSettings;

	darkMode = settingsCasting.window.display.darkMode;

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
		backgroundColor: settingsCasting.window.display.darkMode ? "#3d3e51" : "#f7f5fc",
		titleBarStyle: "hidden",
		titleBarOverlay: {
			color: settingsCasting.window.display.darkMode ? "#3d3e51" : "#f7f5fc",
			symbolColor: settingsCasting.window.display.darkMode ? "#fff" : "#000",
		},
		icon: path.join(ROOT_PATH, "application", "res", "media", "app-icons", "icon.png"),
		webPreferences: {
			contextIsolation: false,
			nodeIntegration: true,
			nodeIntegrationInSubFrames: true,
			nodeIntegrationInWorker: true,
			webgl: true,
			devTools: true,
		}
	});

	if (electronIsDev) {

		console.log(`Info: Development environment detected! Will now open DevTools by default.`.gray);
		mainWindow.webContents.openDevTools();
	} else {

		mainWindow.setMenu(null);

		initializeSystemTray(settingsCasting);
		initializeAutoLaunch(settingsCasting);
	}

	const listenState: boolean | number = await listen();

	if (!listenState) {

		console.log("Error: Could not start local web-server due to an unknown reason.".red);
		return app.exit();
	}

	mainWindow.loadURL(`http://localhost:${listenState}`, {
		extraHeaders: `Accessibility-Type: Electron\nAuthentication-Token: ${reservedServerAuthToken}`
	});

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

export function restartApplication() {

	app.relaunch();
	app.exit();
}