const { MSICreator } = require("electron-wix-msi");
const path = require("path");

(async function () {
	// Step 1: Instantiate the MSICreator
	const msiCreator = new MSICreator({
		appDirectory: path.join(__dirname, "build", "win-unpacked"),
		description: 'Fluent Youtube Downloader',
		exe: 'Fluent Youtube Downloader',
		name: 'Fluent Youtube Downloader',
		manufacturer: 'Kitten Technologies',
		icon: path.join(__dirname, "icon.ico"),
		version: '0.4.2',
		outputDirectory: path.join(__dirname, "build")
	});
	
	const supportBinaries = await msiCreator.create();

	await msiCreator.compile();
})()