import path from "path";

import { Router, Request, Response } from "express";
import { dialog, Notification } from "electron";

import { readSettingsFile } from "./appdata";
import { EXTENSION_CONNECTION_INTERVAL, ROOT_PATH } from "./constants";
import { ApplicationSettings, ConversionPipeline, ConvertQuality, ExtensionConnection, ExtensionConversionPostBody } from "./typings";

import details from "./rest/core/video-details";
import pipeline from "./rest/core/pipeline";
import { read } from "fs";
import { emit } from "./socket";
import { mainWindow } from "./app";

export let extensionIsConnected: boolean = false;

export function authenticateExtensionConnection(body: ExtensionConnection) {

	// First step is to check if the protocol matches the chrome extension protocol.
	if (body.protocol !== "chrome-extension:")
		return new Error("The protocol does not matches the standard chrome extension protocol.");

	// Now the program needs to be sure that the request should take less than
	// EXTENSION_CONNECTION_INTERVAL amount of milliseconds.
	const now: number = Date.now(),
		difference = now - body.timestamp;

	if (difference >= EXTENSION_CONNECTION_INTERVAL)
		return new Error(`The delay between the request and the response is more than ${EXTENSION_CONNECTION_INTERVAL}.`);

	// Now make sure that the password matches.
	const appdata = readSettingsFile();

	if (appdata.status === "failed")
		return new Error("Cannot authenticate because the program failed reading the settings file.");

	const casting = appdata as ApplicationSettings,
		extensionPassword = casting.server.extensionPassword === "" ? null : casting.server.extensionPassword;

	if (extensionPassword !== body.serverPassword)
		return new Error(`Failed authenticating because the given password '${body.serverPassword}' does not match with the actual extension server password.`);

	// The authentication should be successful done.
	extensionIsConnected = true;

	return true;
}

export function convertVideoFromYoutube(body: ExtensionConversionPostBody) {

	// Basically the same authentication pipeline as shown above.
	if (body.protocol !== "chrome-extension:") 
		return new Error("The protocol does not matches the standard chrome extension protocol.");
		
	const now: number = Date.now(),
		difference = now - body.timestamp;

	if (difference >= EXTENSION_CONNECTION_INTERVAL)
		return new Error(`The delay between the request and the response is more than ${EXTENSION_CONNECTION_INTERVAL}.`);

	pipeline(body.videoUrl, body.videoQuality, body.requestId).then(function (response: ConversionPipeline) {

		if (response.state === "ok") {

			new Notification({
				title: "Fluent Youtube Downloader",
				subtitle: "Fluent Youtube Downloader",
				icon: path.join(ROOT_PATH, "icon.ico"),
				body: "Video has succesfully been converted.",
			}).show();

			emit("app/yt-dlp/convert-complete", { requestId: body.requestId });
		}

		if (response.state === "failed") {

			new Notification({
				title: "Fluent Youtube Downloader",
				subtitle: "An error occurred.",
				icon: path.join(ROOT_PATH, "icon.ico"),
				body: "Fluent Youtube Download could not download this video. See the application window for more details.",
			}).show();

			emit("app/in-app-dialog", {
				title: "An error occurred",
				message: response.reason,
				icon: "error"
			});
		}
	});
}

export function handleRequestsFromExtension(req: Request, res: Response) {

	const requestBody = req.body;

	switch (req.url) {
		case "/connect":

			const authenticationResponse: Error | boolean = authenticateExtensionConnection(requestBody as ExtensionConnection);

			return authenticationResponse instanceof Error
				? res.status(500).send((authenticationResponse as Error).message)
				: res.status(200).send("Extension authenticated.");
		case "/convert":

			const downloadResponse = convertVideoFromYoutube(requestBody as ExtensionConversionPostBody);

			break;
	}
}