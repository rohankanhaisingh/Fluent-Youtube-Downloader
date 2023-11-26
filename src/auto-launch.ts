import al from "auto-launch";
import { app } from "electron";

import { ApplicationSettings } from "./typings";

export let autoLaunch: al | null = null;

export function initializeAutoLaunch(settings: ApplicationSettings) {

	autoLaunch = new al({
		path: app.getPath("exe"),
		name: "Fleunt Youtube Downloader"
	});

	if (settings.behavior.autoStart) {
		autoLaunch.enable();
	} else {
		autoLaunch.disable();
	}
}

export function enableAutoLaunch() {

	if (autoLaunch === null) return;

	autoLaunch.isEnabled().then(function (isEnabled: boolean) {

		if (!isEnabled)
			autoLaunch?.enable();
	});
}

export function disableAutoLaunch() {

	if (autoLaunch === null) return;

	autoLaunch.isEnabled().then(function (isEnabled: boolean) {

		if (isEnabled)
			autoLaunch?.disable();
	});
}