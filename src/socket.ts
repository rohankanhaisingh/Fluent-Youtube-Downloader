/**
 * Server-sided socket.io handler
 */

import { Socket, Server } from "socket.io";
import { readSettingsFile, updateSettingsFile } from "./appdata";

export function sokkie(io: Server) {

	io.on("connection", function (socket: Socket) {

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
	});
}