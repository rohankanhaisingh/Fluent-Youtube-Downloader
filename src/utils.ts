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