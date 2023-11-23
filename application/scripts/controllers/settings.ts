import { renderToggles, renderInputFields } from "../handlers/dom-generator";

type ApplicationWindowTheme = "fluent-light-purple";
type ApplicationSettingsStatus = "failed" | "ok";

 interface Resolution {
	readonly width: number;
	readonly height: number;
}

interface ReadSettingsFail {
	readonly reason: string;
	readonly error: Error;
	readonly status: ApplicationSettingsStatus;
}

interface ApplicationWindowSettings {
	readonly resolution: Resolution;
	readonly theme: ApplicationWindowTheme;
}

interface ApplicationPathSettings {
	readonly appDataPath: string | null;
	readonly downloadPath: string | null;
	readonly ffmpegPath: string | null;
}

interface ApplicationServerSettings {
	readonly port: number;
}

interface ApplicationSettings {
	readonly window: ApplicationWindowSettings;
	readonly path: ApplicationPathSettings;
	readonly server: ApplicationServerSettings;
	readonly status: ApplicationSettingsStatus;
}

function visualizeSavedSettings(data: ApplicationSettings): number {

	const settingItems: NodeListOf<HTMLDivElement> = document.querySelectorAll(".application-setting");

	console.log(settingItems);

	return 0;
}

function handleSettingsResponse(response: Response) {

	response.json()
		.then(visualizeSavedSettings)
		.catch(function (err: Error) {

			console.log(err.message);
		});

	return 0;
}

function handleSettingsError(err: Error): number {

	console.log(err.message);

	return 0;
}

function load(): number {

	renderToggles();
	renderInputFields();

	// Receive the settings file.
	fetch("/appdata/settings", { method: "GET" })
		.then(handleSettingsResponse)
		.catch(handleSettingsError);

	return 0;
}
load();