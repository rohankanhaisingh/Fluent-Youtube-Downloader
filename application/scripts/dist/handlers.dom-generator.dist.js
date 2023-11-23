(()=>{"use strict";var __webpack_modules__={878:(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval('/* unused harmony exports renderToggles, renderInputFields */\nfunction renderToggles() {\r\n    const toggleElements = document.querySelectorAll("toggle");\r\n    for (let toggleElement of toggleElements) {\r\n        const toggleClassNames = toggleElement.getAttribute("class");\r\n        const toggleForAttribute = toggleElement.getAttribute("for");\r\n        const toggleIdAttribute = toggleElement.getAttribute("id");\r\n        const newToggle = document.createElement("div");\r\n        newToggle.className = "styled-toggle";\r\n        const newToggleContainer = document.createElement("div");\r\n        newToggleContainer.className = "container";\r\n        newToggle.appendChild(newToggleContainer);\r\n        const newToggleThumb = document.createElement("div");\r\n        newToggleThumb.className = "styled-toggle__thumb";\r\n        newToggleContainer.appendChild(newToggleThumb);\r\n        newToggle.setAttribute("active", "false");\r\n        newToggle.addEventListener("click", function () {\r\n            const activeAttribute = newToggle.getAttribute("active");\r\n            if (activeAttribute === null)\r\n                return newToggle.setAttribute("active", "true");\r\n            if (activeAttribute === "false") {\r\n                newToggle.setAttribute("active", "true");\r\n            }\r\n            else {\r\n                newToggle.setAttribute("active", "false");\r\n            }\r\n            if (toggleForAttribute) {\r\n                const toggleActiveTextAttribute = toggleElement.getAttribute("active-text");\r\n                const toggleInActiveTextAttribute = toggleElement.getAttribute("inactive-text");\r\n                if (toggleActiveTextAttribute !== null && toggleInActiveTextAttribute !== null) {\r\n                    const toggleForElement = document.querySelector(toggleForAttribute);\r\n                    const currentActiveState = newToggle.getAttribute("active");\r\n                    if (currentActiveState && toggleForElement) {\r\n                        toggleForElement.innerText = (currentActiveState === "true") ? toggleActiveTextAttribute : toggleInActiveTextAttribute;\r\n                    }\r\n                }\r\n            }\r\n        });\r\n        newToggle.addEventListener("click", function () {\r\n            if (newToggle.classList.contains("active")) {\r\n                newToggle.classList.remove("active");\r\n            }\r\n            else {\r\n                newToggle.classList.add("active");\r\n            }\r\n        });\r\n        if (toggleClassNames)\r\n            newToggle.classList.add(toggleClassNames);\r\n        if (toggleIdAttribute)\r\n            newToggle.id = toggleIdAttribute;\r\n        toggleElement.replaceWith(newToggle);\r\n    }\r\n}\r\nfunction renderInputFields() {\r\n    const inputFieldElements = document.querySelectorAll("input-field");\r\n    for (let inputField of inputFieldElements) {\r\n        const inputFieldClassNames = inputField.getAttribute("class");\r\n        const inputFieldType = inputField.getAttribute("type");\r\n        const inputFieldSpellcheck = inputField.getAttribute("spellcheck");\r\n        const inputFieldAutoComplete = inputField.getAttribute("autocomplete");\r\n        const inputFieldValue = inputField.getAttribute("value");\r\n        const inputDisabled = inputField.getAttribute("disabled");\r\n        const inputId = inputField.getAttribute("id");\r\n        const root = document.createElement("div");\r\n        root.className = "styled-input-field " + crypto.randomUUID();\r\n        if (inputFieldClassNames) {\r\n            inputFieldClassNames.split(" ").forEach(function (className) {\r\n                root.classList.add(className);\r\n            });\r\n        }\r\n        root.setAttribute("type", inputFieldType !== null ? inputFieldType : "text");\r\n        root.setAttribute("value", "");\r\n        root.setAttribute("is-focused", "false");\r\n        root.setAttribute("is-disabled", inputDisabled !== null ? "true" : "false");\r\n        root.setAttribute("id", inputId !== null ? inputId : "");\r\n        const rootInput = document.createElement("input");\r\n        rootInput.className = "styled-input-field__input";\r\n        rootInput.type = (inputFieldType !== null) ? inputFieldType : "text";\r\n        rootInput.spellcheck = (inputFieldSpellcheck !== null) ? inputFieldSpellcheck : true;\r\n        rootInput.autocomplete = (inputFieldAutoComplete !== null) ? inputFieldAutoComplete : "on";\r\n        rootInput.value = (inputFieldValue !== null) ? inputFieldValue : "";\r\n        rootInput.disabled = (inputDisabled !== null) ? true : false;\r\n        rootInput.addEventListener("focus", function () {\r\n            if (!root.classList.contains("focused"))\r\n                root.classList.add("focused");\r\n            root.setAttribute("is-focused", "true");\r\n        });\r\n        rootInput.addEventListener("blur", function () {\r\n            if (root.classList.contains("focused"))\r\n                root.classList.remove("focused");\r\n            root.setAttribute("is-focused", "false");\r\n        });\r\n        rootInput.addEventListener("input", function () {\r\n            const inputValue = rootInput.value;\r\n            root.setAttribute("value", inputValue);\r\n        });\r\n        root.appendChild(rootInput);\r\n        inputField.replaceWith(root);\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack://fluent-youtube-downloader/./application/scripts/handlers/dom-generator.ts?')}},__webpack_require__={d:(e,t)=>{for(var n in t)__webpack_require__.o(t,n)&&!__webpack_require__.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)},__webpack_exports__={};__webpack_modules__[878](0,__webpack_exports__,__webpack_require__)})();