import fs from "fs";
import cp from "child_process";

import { ConvertQuality } from "./typings";
import { emit } from "./socket";

export function getNestedValue(obj: any, propString: string) {

    const props = propString.split('.');

    let currentObj = obj;

    for (let i = 0; i < props.length; i++) {
        if (currentObj && currentObj.hasOwnProperty(props[i])) {
            currentObj = currentObj[props[i]];
        } else {
           
            return undefined;
        }
    }

    return currentObj;
}

export function setNestedValue(obj: any, propString: any, value: any) {

    const props = propString.split('.');
    let currentObj = obj;

    for (let i = 0; i < props.length - 1; i++) {
        if (currentObj && currentObj.hasOwnProperty(props[i])) {
            currentObj = currentObj[props[i]];
        } else {
            
            return;
        }
    }
    
    const lastProp = props[props.length - 1];

    if (currentObj && currentObj.hasOwnProperty(lastProp)) 
        currentObj[lastProp] = value;
}

export function resolveVideoQuality(givenQualityString: ConvertQuality) {
    switch (givenQualityString) {
        case "highest-audio":
            return "highestaudio";
        case "lowest-audio":
            return "lowestaudio";
        case "highest-video":
            return "highestvideo";
        case "lowest-video":
            return "lowestvideo";
        default:
            return givenQualityString;
    }
}

export function openFile(filePath: string) {

    const process = cp.exec(`"${filePath}"`);

    process.stdout?.on("data", function (chunk: Buffer) {

		console.log(chunk.toString());
    });

    process.stderr?.on("data", function (chunk: Buffer) {

	    console.log(chunk.toString());
    });
}

export function deleteFile(filePath: string) {

    if (!fs.existsSync(filePath))
        return emit("app/in-app-dialog", {
            title: "File not found",
            message: [
                "Could not delete file because Fluent Youtube Download could not find it.",
                `Looking for file: ${filePath}.`,
                `<code> ${new Error().stack} </code>`
            ],
            icon: "error"
        });

    fs.unlinkSync(filePath);

    return true;
}