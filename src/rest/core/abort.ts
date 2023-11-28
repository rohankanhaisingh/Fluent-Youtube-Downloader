import { FfmpegCommand } from "fluent-ffmpeg";
import { Readable } from "stream";
import fs from "fs";
import tasklist from "better-tasklist";

/**
* Aborts all readable streams by killing it's process.
* Will return a boolean to determine it's execution state.
* @param command
* @param convertStream
* @param destinationPath
* @returns
*/
export default async function execute(command: FfmpegCommand, convertStream: Readable, destinationPath: string) {

	try {

		// Try to kill the process from it's own.
		command.kill("SIGINT");

		const allRunningTasks = await tasklist.fetch(null);

		const ffmpegCommands = tasklist.filter(allRunningTasks, { imageName: "ffmpeg.exe" });

		for (let process of ffmpegCommands)
			await tasklist.killProcessByPID(process.pid, true);

		if (!convertStream.destroyed)
			convertStream.destroy();

		if (fs.existsSync(destinationPath))
			fs.unlinkSync(destinationPath);

		return true;
	} catch (err) {

		console.log(err);

		return false;
	}
}