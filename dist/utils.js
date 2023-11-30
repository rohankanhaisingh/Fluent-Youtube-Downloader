"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveVideoQuality = exports.setNestedValue = exports.getNestedValue = void 0;
function getNestedValue(obj, propString) {
    const props = propString.split('.');
    let currentObj = obj;
    for (let i = 0; i < props.length; i++) {
        if (currentObj && currentObj.hasOwnProperty(props[i])) {
            currentObj = currentObj[props[i]];
        }
        else {
            return undefined;
        }
    }
    return currentObj;
}
exports.getNestedValue = getNestedValue;
function setNestedValue(obj, propString, value) {
    const props = propString.split('.');
    let currentObj = obj;
    for (let i = 0; i < props.length - 1; i++) {
        if (currentObj && currentObj.hasOwnProperty(props[i])) {
            currentObj = currentObj[props[i]];
        }
        else {
            return;
        }
    }
    const lastProp = props[props.length - 1];
    if (currentObj && currentObj.hasOwnProperty(lastProp))
        currentObj[lastProp] = value;
}
exports.setNestedValue = setNestedValue;
function resolveVideoQuality(givenQualityString) {
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
exports.resolveVideoQuality = resolveVideoQuality;
//# sourceMappingURL=utils.js.map