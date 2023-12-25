import { FluentButton, FluentComponentType, FluentInput, FluentSelect, FluentToggle, isFluentComponent } from "../handlers/fluent-renderer";
import { get, getClient, post } from "../handlers/socket";

type ApplicationWindowTheme = "windows_fluent_dark" | "windows_fluent_light";
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

interface DOMSettingItem {
	key: string;
	value: string | null | boolean;
}

function saveSettings() {

	const settingElements: NodeListOf<FluentToggle | FluentButton | FluentInput | FluentSelect> = document.querySelectorAll(".application-setting");

	const savedSettings: DOMSettingItem[] = [];

	for (let setting of settingElements) {

		const componentType: FluentComponentType | boolean = isFluentComponent(setting);

		if (componentType) {

			const settingId: string = setting.id;
			
			switch (componentType) {
				case "FluentToggle":

					const isActive: string | null = setting.getAttribute("active");

					if (isActive !== null) {

						savedSettings.push({ key: settingId, value: isActive === "true" ? true : false});
					} else {

						// Will set false as default if no 'active' attribute has been found.
						savedSettings.push({ key: settingId, value: false });
					}
					break;
				default:

					savedSettings.push({ key: settingId, value: setting.getAttribute("value") });
					break;
			}
		}
	};

	console.log(savedSettings);

	post("/appdata/change-settings", {
		settings: savedSettings,
		from: location.href,
		userAgent: navigator.userAgent
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
	const settingItems: NodeListOf<HTMLDivElement | FluentInput> = document.querySelectorAll(".application-setting");

	settingItems.forEach(function (item: HTMLDivElement | FluentInput) {

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

		if (item.classList.contains("fluent-input")) 
			(item as FluentInput).setValue(currentObject === null ? "" : currentObject);

		if (item.classList.contains("styled-toggle")) 
			item.setAttribute("active", currentObject ? "true" : "false");
	});

	return 0;
}

async function loadSettings() {

	const data: ApplicationSettings = await get("/appdata/settings");

	const settingElements: NodeListOf<FluentToggle | FluentButton | FluentInput | FluentSelect> = document.querySelectorAll(".application-setting");

	settingElements.forEach(function (item: FluentInput | FluentSelect | FluentToggle) {

		const componentType: FluentComponentType | boolean = isFluentComponent(item);

		if (!componentType) return;

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

		for (let i = 0; i < idKeys.length; i++) 
			if (currentObject && currentObject.hasOwnProperty(idKeys[i]))
				currentObject = currentObject[idKeys[i]];
		
		if (currentObject === undefined) return;

		switch (componentType) {
			case "FluentInput":
				return (item as FluentInput).setValue(currentObject === null ? "" : currentObject);
			case "FluentToggle":
				return (currentObject ? (item as FluentToggle).setActive() : (item as FluentToggle).setInactive());
				break;
				
		}

		//if (componentType === "FluentInput")
		//	(item as FluentInput).setValue(currentObject === null ? "" : currentObject);

		//if (item.classList.contains("fluent-input"))
		//	(item as FluentInput).setValue(currentObject === null ? "" : currentObject);

		//if (item.classList.contains("styled-toggle"))
		//	item.setAttribute("active", currentObject ? "true" : "false");
	});
}

function handleSaveButton() {

	const button: FluentButton | null = document.querySelector("#save-settings");

	if (button === null) return;

	button.addEventListener("click", function () {

		saveSettings();
	});
}

async function load(): Promise<number> {

	loadSettings();
	handleSaveButton();

	return 0;
}
load();