import { renderToggles, renderInputFields } from "../handlers/dom-generator";
import { get, getClient, post } from "../handlers/socket";

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

interface ApplicationBehaviorSettings {
	readonly autoStart: boolean;
	readonly systemTray: boolean;
	readonly startOptions: string | null;
}

interface ApplicationSettings {
	readonly window: ApplicationWindowSettings;
	readonly path: ApplicationPathSettings;
	readonly server: ApplicationServerSettings;
	readonly status: ApplicationSettingsStatus;
	readonly behavior: ApplicationBehaviorSettings;
}

function postSettingChangeData(key: string, value: string | boolean | null) {

	post("/appdata/change-settings", {
		key, value,
		from: location.href,
		userAgent: navigator.userAgent
	});
}

function handleDomInputs() {

	const settingsDomElements: NodeListOf<HTMLDivElement> = document.querySelectorAll(".application-setting");

	const downloadPathField = document.getElementById("path.downloadPath");

	settingsDomElements.forEach(function (domElement: HTMLDivElement) {

		if (domElement.classList.contains("styled-toggle")) {

			domElement.addEventListener("active", function (event: Event) {

				const activeState: null | string = domElement.getAttribute("active");
				const settingName: null | string = domElement.getAttribute("id");

				if (activeState === null || settingName === null) return;

				postSettingChangeData(settingName, activeState === "true" ? true : false);
			});
		}

		if (domElement.classList.contains("styled-input-field")) {

			const input: HTMLInputElement | null = domElement.querySelector("input");

			if (input !== null) input.addEventListener("change", function () {

				const settingName: null | string = domElement.getAttribute("id");

				if (settingName === null) return;

				postSettingChangeData(settingName, input.value === "" ? null : input.value);
			});
		}
	});

	downloadPathField?.addEventListener("click", function () {

		get("/appdata/select-download-path").then(function (data: string | null) {

			if (data === null) return;

			const inputField: HTMLInputElement | null = downloadPathField.querySelector("input");

			if (inputField === null) return;

			inputField.value = data;

			postSettingChangeData("path.downloadPath", data);
		});
	});
}

/**
 * Function that visualizes the changes made by the 
 * user based on the Settings.json file.
 * @param data
 * @returns
 */
function visualizeSavedSettings(data: ApplicationSettings): number {

	// Every input item with '.application-setting' as class will be stored.
	const settingItems: NodeListOf<HTMLDivElement> = document.querySelectorAll(".application-setting");

	settingItems.forEach(function (item: HTMLDivElement) {

		// Id of the element should has a string structure 
		// such as 'obj1.obj2.key' or anything like that.
		const itemId: string | null = item.getAttribute("id");

		if (itemId === null) return;

		// Split the keys into seperate words.
		const idKeys = itemId.split(".");

		// Current object must start from the given 'data' paramter
		// or else this entire loop will break lmfao.
		// Do not change unless you know a better way to fix this.
		let currentObject: any = data;

		for (let i = 0; i < idKeys.length; i++) {

			if (currentObject && currentObject.hasOwnProperty(idKeys[i])) 
				currentObject = currentObject[idKeys[i]];
		}

		if (currentObject === undefined) return;

		if (item.classList.contains("styled-input-field")) {

			const itemInputField: HTMLInputElement | null = item.querySelector("input");

			if (itemInputField !== null && !itemInputField.disabled)
				itemInputField.value = currentObject === null ? "" : currentObject;
		}

		if (item.classList.contains("styled-toggle")) 
			item.setAttribute("active", currentObject ? "true" : "false");
	});

	return 0;
}

async function load(): Promise<number> {

	// Custom DOM elements must be rendered before
	// the rest of the code will run.
	renderToggles();
	renderInputFields();

	const request: ApplicationSettings = await get("/appdata/settings");

	visualizeSavedSettings(request);

	handleDomInputs();

	return 0;
}
load();