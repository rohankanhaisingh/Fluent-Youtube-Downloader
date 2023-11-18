import ytdl, { videoInfo } from "ytdl-core";

/**
* Asynchronously fetches a video from Youtube and returns an object
* containing specified details of the video. 
* 
* Will reject an Error instance if the YTDL failed fetching the 
* requested video.
* @param url URL of the video.
* @returns {Promise<videoInfo>}
*/
export default function execute(videoUrl: string): Promise<videoInfo> {

	return new Promise(function (resolve, reject) {

		ytdl.getInfo(videoUrl)
			.then(function (details: videoInfo) {
				resolve(details);
			})
			.catch(function (err: Error) {
				reject(err);
			});
	});
}