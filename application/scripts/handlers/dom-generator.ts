export function renderToggles() {

	const toggleElements: NodeListOf<HTMLDivElement> = document.querySelectorAll("toggle");

	for (let toggleElement of toggleElements) {

		const toggleClassNames: string | null = toggleElement.getAttribute("class");
		const toggleForAttribute: string | null = toggleElement.getAttribute("for");
		const toggleIdAttribute: string | null = toggleElement.getAttribute("id");

		const newToggle = document.createElement("div");
		newToggle.className = "styled-toggle";

		const newToggleContainer = document.createElement("div");
		newToggleContainer.className = "container";
		newToggle.appendChild(newToggleContainer);

		const newToggleThumb = document.createElement("div");
		newToggleThumb.className = "styled-toggle__thumb";
		newToggleContainer.appendChild(newToggleThumb);

		newToggle.setAttribute("active", "false");

		newToggle.addEventListener("click", function () {

			const activeAttribute: string | null = newToggle.getAttribute("active");

			if (activeAttribute === null)
				return newToggle.setAttribute("active", "true");

			if (activeAttribute === "false") {
				newToggle.setAttribute("active", "true");
			} else {
				newToggle.setAttribute("active", "false");
			}


			if (toggleForAttribute) {

				const toggleActiveTextAttribute: string | null = toggleElement.getAttribute("active-text");
				const toggleInActiveTextAttribute: string | null = toggleElement.getAttribute("inactive-text");

				if (toggleActiveTextAttribute !== null && toggleInActiveTextAttribute !== null) {

					const toggleForElement: HTMLElement | null = document.querySelector(toggleForAttribute);
					const currentActiveState: string | null = newToggle.getAttribute("active");

					if (currentActiveState && toggleForElement) {

						toggleForElement.innerText = (currentActiveState === "true") ? toggleActiveTextAttribute : toggleInActiveTextAttribute;
					}
				}
			}

		});

		newToggle.addEventListener("click", function () {

			if (newToggle.classList.contains("active")) {

				newToggle.classList.remove("active");
			} else {

				newToggle.classList.add("active");
			}
		});

		if (toggleClassNames)
			newToggle.classList.add(toggleClassNames);

		if (toggleIdAttribute)
			newToggle.id = toggleIdAttribute;

		toggleElement.replaceWith(newToggle);
	}
}

export function renderInputFields() {

	const inputFieldElements: NodeListOf<HTMLElement> = document.querySelectorAll("input-field");

	for (let inputField of inputFieldElements) {

		const inputFieldClassNames: string | null = inputField.getAttribute("class");
		const inputFieldType: string | null = inputField.getAttribute("type");
		const inputFieldSpellcheck: string | null = inputField.getAttribute("spellcheck");
		const inputFieldAutoComplete: string | null = inputField.getAttribute("autocomplete");
		const inputFieldValue: string | null = inputField.getAttribute("value");
		const inputDisabled: string | null = inputField.getAttribute("disabled");
		const inputId: string | null = inputField.getAttribute("id");

		const root = document.createElement("div");
		root.className = "styled-input-field " + crypto.randomUUID();

		if (inputFieldClassNames) {

			inputFieldClassNames.split(" ").forEach(function (className: string) {

				root.classList.add(className);
			});
		}

		root.setAttribute("type", inputFieldType !== null ? inputFieldType : "text");
		root.setAttribute("value", "");
		root.setAttribute("is-focused", "false");
		root.setAttribute("is-disabled", inputDisabled !== null ? "true" : "false");
		root.setAttribute("id", inputId !== null ? inputId : "");

		const rootInput: HTMLInputElement = document.createElement("input");
		rootInput.className = "styled-input-field__input";

		rootInput.type = (inputFieldType !== null) ? inputFieldType : "text";
		rootInput.spellcheck = (inputFieldSpellcheck !== null) ? inputFieldSpellcheck as unknown as boolean: true;
		rootInput.autocomplete = (inputFieldAutoComplete !== null) ? inputFieldAutoComplete : "on";
		rootInput.value = (inputFieldValue !== null) ? inputFieldValue: "";
		rootInput.disabled = (inputDisabled !== null) ? true: false;

		rootInput.addEventListener("focus", function () {

			if (!root.classList.contains("focused"))
				root.classList.add("focused");

			root.setAttribute("is-focused", "true");
		});

		rootInput.addEventListener("blur", function () {

			if (root.classList.contains("focused"))
				root.classList.remove("focused");

			root.setAttribute("is-focused", "false");
		});

		rootInput.addEventListener("input", function () {

			const inputValue = rootInput.value;

			root.setAttribute("value", inputValue);
		});

		root.appendChild(rootInput);
		inputField.replaceWith(root);
	}
}