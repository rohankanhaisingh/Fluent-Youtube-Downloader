/**
 * Server-sided socket.io handler
 */

import { Socket, Server } from "socket.io";
import { getHistory, readSettingsFile, updateSettingsFile } from "./appdata";
import { deleteFile, openFile } from "./utils";

// Can only assign one socket.
let connectedSocket: Socket | null = null;

export function sokkie(io: Server) {

	io.on("connection", function (socket: Socket) {

		connectedSocket = socket;

		// This must be a get request.
		socket.on("/appdata/settings", function () {

			const settingsFile = readSettingsFile();

			socket.emit("response-/appdata/settings", settingsFile);
		});

		// This must be a POST request.
		socket.on("/appdata/change-settings", function (postData) {

			const { key, value } = postData; 

			updateSettingsFile(key, value);
		});

		socket.on("/appdata/history", function () {

			const history = getHistory();

			socket.emit("response-/appdata/history", history);
		});

		socket.on("app/open-file", function (data) {

			openFile(data.physicalPath);
		});

		socket.on("app/delete-file", function (data) {

			deleteFile(data.physicalPath);
		});
	});
}

/**
 * Emits data to the connected client.
 * @param channel
 * @param data
 * @returns
 */
export function emit(channel: string, data: any) {

	if (connectedSocket === null) return;

	connectedSocket.emit(channel, data);
}