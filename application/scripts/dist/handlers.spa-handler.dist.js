(()=>{"use strict";var __webpack_modules__={475:(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval('/* unused harmony exports setTitle, removeCurrentSpaStylesheets, removeCurrentSpaScripts, setStylesheets, setScripts, replaceChildren, swapPageContents, formatNewDocument, requestPage */\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\r\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\r\n    return new (P || (P = Promise))(function (resolve, reject) {\r\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\r\n        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }\r\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\r\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\r\n    });\r\n};\r\nconst renderContainer = document.querySelector(".content-swappable");\r\nfunction waitFor(ms) {\r\n    return __awaiter(this, void 0, void 0, function* () {\r\n        return new Promise(function (resolve) {\r\n            setTimeout(resolve, ms);\r\n        });\r\n    });\r\n}\r\nfunction setTitle(config) {\r\n    if (config === null)\r\n        return null;\r\n    const spaTitle = config.querySelector("spa-title");\r\n    const oldTitle = document.head.querySelector("title");\r\n    if (spaTitle === null || oldTitle === null)\r\n        return null;\r\n    const newTitle = document.createElement("title");\r\n    newTitle.textContent = spaTitle.innerText;\r\n    oldTitle.replaceWith(newTitle);\r\n    return newTitle;\r\n}\r\nfunction removeCurrentSpaStylesheets() {\r\n    const currentStylesheets = document.querySelectorAll("link");\r\n    for (let stylesheet of currentStylesheets) {\r\n        const spaAttribute = stylesheet.getAttribute("spa-element-type");\r\n        if (spaAttribute === "spa-stylesheet")\r\n            stylesheet.remove();\r\n    }\r\n}\r\nfunction removeCurrentSpaScripts() {\r\n    const currentScripts = document.querySelectorAll("script");\r\n    for (let stylesheet of currentScripts) {\r\n        const spaAttribute = stylesheet.getAttribute("spa-element-type");\r\n        if (spaAttribute === "spa-script")\r\n            stylesheet.remove();\r\n    }\r\n}\r\nfunction setStylesheets(config) {\r\n    if (config === null)\r\n        return;\r\n    const spaStylesheetList = config.querySelector("spa-stylesheets");\r\n    if (spaStylesheetList === null)\r\n        return;\r\n    removeCurrentSpaStylesheets();\r\n    const spaStylesheets = spaStylesheetList.querySelectorAll("spa-stylesheet");\r\n    for (let spaStylesheet of spaStylesheets) {\r\n        const attributeNames = spaStylesheet.getAttributeNames();\r\n        const stylesheetLink = document.createElement("link");\r\n        stylesheetLink.setAttribute("spa-element-type", "spa-stylesheet");\r\n        stylesheetLink.setAttribute("spa-element-id", crypto.randomUUID());\r\n        for (let attributeName of attributeNames) {\r\n            const spaStylesheetAttribute = spaStylesheet.getAttribute(attributeName);\r\n            if (spaStylesheetAttribute !== null)\r\n                stylesheetLink.setAttribute(attributeName, spaStylesheetAttribute);\r\n        }\r\n        document.head.appendChild(stylesheetLink);\r\n    }\r\n}\r\nfunction setScripts(config) {\r\n    if (config === null)\r\n        return;\r\n    const spaScriptsList = config.querySelector("spa-scripts");\r\n    if (spaScriptsList === null)\r\n        return;\r\n    removeCurrentSpaScripts();\r\n    const spaScripts = spaScriptsList.querySelectorAll("spa-script");\r\n    for (let spaScript of spaScripts) {\r\n        const attributeNames = spaScript.getAttributeNames();\r\n        const scriptElement = document.createElement("script");\r\n        scriptElement.setAttribute("spa-element-type", "spa-script");\r\n        scriptElement.setAttribute("spa-element-id", crypto.randomUUID());\r\n        for (let attributeName of attributeNames) {\r\n            const spaStylesheetAttribute = spaScript.getAttribute(attributeName);\r\n            if (spaStylesheetAttribute !== null)\r\n                scriptElement.setAttribute(attributeName, spaStylesheetAttribute);\r\n        }\r\n        document.body.appendChild(scriptElement);\r\n    }\r\n}\r\nfunction replaceChildren(contents) {\r\n    if (renderContainer === null || contents === null)\r\n        return;\r\n    renderContainer.replaceChildren(...contents.childNodes);\r\n}\r\nfunction swapPageContents(newDoc, response) {\r\n    return __awaiter(this, void 0, void 0, function* () {\r\n        if (renderContainer === null)\r\n            return;\r\n        renderContainer.classList.remove("fadein");\r\n        yield waitFor(100);\r\n        const documentBody = newDoc.body, documentConfig = documentBody.querySelector("spa-config"), documentContent = documentBody.querySelector("spa-dom-content");\r\n        setTitle(documentConfig);\r\n        setStylesheets(documentConfig);\r\n        setScripts(documentConfig);\r\n        replaceChildren(documentContent);\r\n        renderContainer.classList.add("fadein");\r\n        renderContainer.setAttribute("data-url", response.url);\r\n    });\r\n}\r\nfunction formatNewDocument(html) {\r\n    const parser = new DOMParser();\r\n    return parser.parseFromString(html, "text/html");\r\n}\r\nfunction requestPage(pageUrl) {\r\n    return __awaiter(this, void 0, void 0, function* () {\r\n        fetch(pageUrl, { method: "GET", headers: { "Content-Type": "text/html" } })\r\n            .then(function (response) {\r\n            response.text()\r\n                .then(function (responseText) {\r\n                const formattedDocument = formatNewDocument(responseText);\r\n                return swapPageContents(formattedDocument, response);\r\n            }).catch(function (err) {\r\n                console.log(err.message);\r\n            });\r\n        }).catch(function (err) {\r\n            console.log(err.message);\r\n        });\r\n    });\r\n}\r\n\n\n//# sourceURL=webpack://fluent-youtube-downloader/./application/scripts/handlers/spa-handler.ts?')}},__webpack_require__={d:(e,t)=>{for(var r in t)__webpack_require__.o(t,r)&&!__webpack_require__.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)},__webpack_exports__={};__webpack_modules__[475](0,__webpack_exports__,__webpack_require__)})();