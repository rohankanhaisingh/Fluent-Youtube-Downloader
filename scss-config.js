const path = require("path");
const fs = require("fs");
const sass = require("sass");
const colors = require("colors");
const { globSync } = require("glob");

colors.enable();

const sourceDirectoryPath = path.join(__dirname, "application", "styles"),
	outputDirectoryPath = path.join(__dirname, "application", "styles", "dist"),
	fileNames = globSync("**/*.scss", { cwd: sourceDirectoryPath });

console.log(`Found ${fileNames.length.toString().green} files. Now watching those files to compile.`);

async function compile(filePath) {

	try {

		const scssOutput = await sass.compileAsync(filePath, {
			style: "compressed",
			sourceMap: true,
			verbose: false
		});

		return scssOutput.css;
	}
	catch (err) {

		console.log(`An ${"error".red} occurred while compiling in file '${filePath.underline}'`);
		return err.message;
	}
}

fileNames.forEach(async function (fileName) {

	const physicalFilePath = path.join(sourceDirectoryPath, fileName),
		physicalOutputFilePath = path.join(outputDirectoryPath, fileName.replace(".scss", ".css"));

	// Check if physical path exists.
	if (!fs.existsSync(physicalFilePath))
		return console.warn(`WARNING: File ${physicalFilePath} does not exist.`);

	// Pre compile scss
	const compilationResult = await compile(physicalFilePath);

	fs.writeFileSync(physicalOutputFilePath, compilationResult, { encoding: "utf-8" });

	// Watch files for changes.
	fs.watchFile(physicalFilePath, { interval: 100 }, async function (current, previous) {

		const start = Date.now();

		const watchedCompiledResult = await compile(physicalFilePath);

		fs.writeFileSync(physicalOutputFilePath, watchedCompiledResult, { encoding: "utf-8" });

		const end = Date.now();
		const difference = end - start;

		console.log(`Wrote ${(1).toString().green} file within ${(difference + "ms").yellow}.`);
	});
});