/**
 * Client-sided socket.io handler
 */

import socket, { Socket } from "socket.io-client";

import { formatBytes } from "../utils";

const appLoader = document.querySelector(".app-loader") as HTMLDivElement;

declare global {
	interface Window {
		client: Socket | null;
	}
}

export function getClient(): Socket | null {

	if (typeof window.client === "undefined")
		return null;

	return window.client;
}

export async function getAuthToken(): Promise<string> {

	const request = await fetch("/get-authtoken", { method: "GET" });

	const responseText = await request.text();

	return responseText;
}

export async function connectSocket() {

	const authToken: string = await getAuthToken();

	const currentUrl = new URL(location.href);

	window.client = socket(currentUrl.origin, {
		auth: {
			token: authToken
		}
	});
}

export function get(channel: string): Promise<any> {

	const client = window.client;
	
	return new Promise(function (resolve, reject) {

		if (client === null)
			return reject(new Error("Failed to perform a GET request using Socket.IO since the socket has not been defined."));

		client.emit(channel);

		client.once("response-" + channel, function (data) {
			resolve(data);
		});
	});
}

export function post(channel: string, data: any) {

	const client = window.client;

	return new Promise(function (resolve, reject) {

		if (client === null)
			return reject(new Error("Failed to perform a GET request using Socket.IO since the socket has not been defined."));

		client.emit(channel, data);

		client.once("response-" + channel, function (data) {
			resolve(data);
		});
	});
}

export function listen() {

	const client = window.client;

	if (client === null || !client) return;

	client.on("app/yt-dlp/download-started", function (data) {

		if (appLoader.classList.contains("fadeout"))
			appLoader.classList.remove("fadeout");
	});

	client.on("app/yt-dlp/convert-complete", function (data) {

		const activeDownload = window.activeDownloads[data.requestId];

		if (typeof activeDownload === "undefined") return;

		activeDownload.setFinishState();

		if (typeof window.activeDownloads[data.requestId] !== "undefined")
			delete window.activeDownloads[data.requestId];
	});

	client.on("app/yt-dlp/download-video", function (event) {

		const activeDownload = window.activeDownloads[event.requestId];

		if (typeof activeDownload === "undefined") return;
	
		activeDownload.setProgress(event.percentage);
	});
}