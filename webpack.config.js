const path = require('path');
const fs = require("fs");

const constants = require("./dist/constants");

const { ENTRY_SCRIPT_FILES, SCRIPTS_PATH } = constants;
const entryPoints = {};

for (let file of ENTRY_SCRIPT_FILES) {

    if (file.endsWith(".ts")) {

        const fileName = file.split(".")[0];
        entryPoints[fileName] = path.join(SCRIPTS_PATH, file);
    }
}

for (let folder of ENTRY_SCRIPT_FILES) {

    if (!folder.includes(".")) {

        if (folder !== "dist") {

            const folderFiles = fs.readdirSync(path.join(SCRIPTS_PATH, folder));

            for (let file of folderFiles) {

                const fileName = file.split(".")[0];

                entryPoints[`${folder}.${fileName}`] = path.join(SCRIPTS_PATH, folder, file);
            }
        }
    }
}

module.exports = {
    mode: "production",
    watch: true,
    devtool: "eval",
    plugins: [],
    entry: entryPoints,
    output: {
        asyncChunks: true,
        path: path.resolve(SCRIPTS_PATH, "dist"),
        filename: '[name].dist.js',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: 'ts-loader',
            },
        ],
    },
};