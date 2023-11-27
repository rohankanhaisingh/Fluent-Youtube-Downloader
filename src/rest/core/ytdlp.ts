import electron from "electron";
import fs from "fs";
import path from "path";

import { YTDLP_EXECUTABLE_FILENAME } from "../../constants";
import { YTDLPInitializationResponse, YTDLPInstallationPromptButton } from "../../typings";

export function checkForInstallation(): YTDLPInitializationResponse {

	const executionPath: string = electron.app.getPath("exe");

	// Check if the execution path exists.
	if (!fs.existsSync(executionPath)) return {
		state: "failed",
		message: `The path '${executionPath}' does not exist.`,
		reason: "execution-directory-not-found"
	}

	const physicalFileLocation: string = path.join(executionPath, YTDLP_EXECUTABLE_FILENAME);

	if (!fs.existsSync(physicalFileLocation)) return {
		state: "failed",
		message: `The exectable '${YTDLP_EXECUTABLE_FILENAME}' in '${executionPath}' has not been found`,
		reason: "executable-not-found"
	}

	return { state: "ok" }
}

export function downloadYtdlp() {


}

export function initializationProcess(): boolean {

	const installationCheck: YTDLPInitializationResponse = checkForInstallation();

	const { dialog } = electron;

	// If the installation check succeed.
	if (installationCheck.state === "ok") return true;

	// If there is no valid reason or a detailed messate of why the initialization failed.
	if (!installationCheck.reason || !installationCheck.message) return false;

	switch (installationCheck.reason) {
		case "executable-not-found":

			const pressedButton: YTDLPInstallationPromptButton = dialog.showMessageBoxSync({
				title: "yt-dlp executable not found",
				message: installationCheck.message,
				type: "question",
				detail: `Fluent Youtube Download needs access to a yt-dlp executable to convert YouTube video's into any media format. Would you like to download the latest release from Github? (https://github.com/yt-dlp/yt-dlp).\n
				If you press 'no,' ytdl-core will be used instead, which is already installed with Fluent YouTube Downloader. Note that ytdl-core is slower than yt-dlp.`,
				buttons: ["Yes", "No"]
			});

			if (pressedButton === YTDLPInstallationPromptButton.Yes) {

			} else {

				return true;
			}
			break;
	}

	return true;
}