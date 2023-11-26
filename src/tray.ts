import { app, Tray, Menu } from "electron";
import path from "path";

import { mainWindow } from "./app";
import { ROOT_PATH } from "./constants";
import { ApplicationSettings } from "./typings";

export function initializeSystemTray(settings: ApplicationSettings) {

	if (!settings.behavior.systemTray) return;

	const appIcon = new Tray(path.join(ROOT_PATH, "icon.ico"));

	const contextMenu = Menu.buildFromTemplate([
		{ label: "Fluent Youtube Downloader", type: 'normal' },
		{ label: 'seperator', type: 'separator' },
		{ label: 'Open DevTools', type: 'normal', role: 'toggleDevTools' },
		{ label: 'Quit program', type: 'normal', role: 'quit' },
	]);

	appIcon.on("click", function () {

		mainWindow.show();
	});

	appIcon.setTitle("Fluent Youtube Downloader");
	appIcon.setToolTip("Fluent Youtube Downloader");
	appIcon.setContextMenu(contextMenu);
}