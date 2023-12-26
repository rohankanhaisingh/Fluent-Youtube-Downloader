/**
 * Server-sided socket.io handler
 */

import { Socket, Server } from "socket.io";
import { dialog } from "electron";

import { clearHistory, getHistory, readSettingsFile, updateSettingsFile } from "./appdata";
import { deleteFile, openFile } from "./utils";
import { mainWindow } from "./app";
import { SocketIOEvents } from "./typings";

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
		socket.on("/appdata/change-settings", function (data: SocketIOEvents.ChangeSettings) {

			const { settings } = data; 

			for (let item of settings)
				updateSettingsFile(item.key, item.value);

			/*updateSettingsFile(key, value);*/
		});

		socket.on("/appdata/history", function () {

			const history = getHistory();

			socket.emit("response-/appdata/history", history);
		});

		socket.on("/appdata/clear-history", function () {

			clearHistory();
		});


		socket.on("/appdata/select-download-path", function () {

			dialog.showOpenDialog(mainWindow, {
				properties: ["openDirectory"]
			}).then(function (returnValue) {
				socket.emit("response-/appdata/select-download-path", returnValue.filePaths[0]);
			});
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