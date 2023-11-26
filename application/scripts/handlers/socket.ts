import socket, { Socket } from "socket.io-client";

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