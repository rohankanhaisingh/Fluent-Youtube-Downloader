export function renderToggles() {

	const toggleElements: NodeListOf<HTMLDivElement> = document.querySelectorAll("toggle");

	for (let toggleElement of toggleElements) {

		const toggleClassNames: string | null = toggleElement.getAttribute("class");
		const toggleForAttribute: string | null = toggleElement.getAttribute("for");
		const toggleIdAttribute: string | null = toggleElement.getAttribute("id");

		const newToggle = document.createElement("div");
		newToggle.className = "styled-toggle " + crypto.randomUUID();

		const newToggleContainer = document.createElement("div");
		newToggleContainer.className = "container";
		newToggle.appendChild(newToggleContainer);

		const newToggleThumb = document.createElement("div");
		newToggleThumb.className = "styled-toggle__thumb";
		newToggleContainer.appendChild(newToggleThumb);

		newToggle.setAttribute("active", "false");

		function dispatchOnActiveEvent(element: HTMLElement, attributeName: string, newValue: string) {

			const event = new CustomEvent("active", {
				bubbles: true,
				detail: {
					attributeName,
					newValue
				}
			});

			element.dispatchEvent(event);
		}

		function changeToggleLabel() {

			if (toggleForAttribute === null) return;

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
		
		newToggle.addEventListener("click", function () {

			const activeAttribute: string | null = newToggle.getAttribute("active");

			if (activeAttribute === null)
				return newToggle.setAttribute("active", "true");

			if (activeAttribute === "false") {
				newToggle.setAttribute("active", "true");
			} else {
				newToggle.setAttribute("active", "false");
			}

			changeToggleLabel();
		});

		const observer = new MutationObserver(function (mutations: MutationRecord[]) {

			mutations.forEach(function (mutation: MutationRecord) {

				if (mutation.attributeName === "active") {

					const attributeValue: string | null = newToggle.getAttribute("active");

					if (attributeValue === null) return;

					switch (attributeValue) {
						case "true":

							if (!newToggle.classList.contains("active"))
								newToggle.classList.add("active");
							break;
						case "false":

							if (newToggle.classList.contains("active"))
								newToggle.classList.remove("active");

							break;
					}

					dispatchOnActiveEvent(newToggle, "active", attributeValue);

					changeToggleLabel();
				}
			});
		});

		observer.observe(newToggle, { attributes: true });

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

export function renderSelects() {

	const selectElements: NodeListOf<HTMLElement> = document.querySelectorAll("option-select");

	selectElements.forEach(function (selectElement: HTMLElement) {

		// Get the options of the select element.
		const elementOptions: NodeListOf<HTMLOptionElement> = selectElement.querySelectorAll("option");

		// Filter active options.
		const activeOption: HTMLOptionElement[] = Array.from(elementOptions).filter(element => element.getAttribute("active") === "true");

		const selectAttributes: string[] = selectElement.getAttributeNames();

		const rootElement = document.createElement("div");

		selectAttributes.forEach(function (attribute: string) {

			const attributeValue: string | null = selectElement.getAttribute(attribute);

			if (attributeValue === null) return;

			rootElement.setAttribute(attribute, attributeValue);
		});

		rootElement.classList.add("styled-select");
		rootElement.setAttribute("value", activeOption.length > 0 ? activeOption[0].innerText : "");

		// Current value.
		const currentValue = document.createElement("div");
		currentValue.className = "current-value";

		const currentValueText = document.createElement("div");
		currentValueText.className = "text";
		currentValueText.innerText = activeOption.length > 0 ? activeOption[0].innerText : "No value given";

		const currentValueIcon = document.createElement("div");
		currentValueIcon.className = "icon";
		currentValueIcon.innerHTML = '<img src="/static/media/icons/windows-icon-down.png" alt="Open options" />';

		currentValue.appendChild(currentValueText);
		currentValue.appendChild(currentValueIcon);

		currentValue.addEventListener("click", function () {

			if (!rootElement.classList.contains("in-dropdown"))
				rootElement.classList.add("in-dropdown");
		});

		// Dropdown
		const dropdown = document.createElement("div");
		dropdown.className = "dropdown";

		elementOptions.forEach(function (element: HTMLOptionElement) {

			const optionElement = document.createElement("div");
			optionElement.className = "option";

			if (element.getAttribute("active") === "true")
				optionElement.classList.add("active");

			optionElement.innerText = element.innerText;

			optionElement.addEventListener("click", function () {

				dropdown.querySelectorAll(".option").forEach(em => em.classList.remove("active"));

				currentValueText.innerText = optionElement.innerText;
				rootElement.setAttribute("value", optionElement.innerText);

				optionElement.classList.add("active");
				rootElement.classList.remove("in-dropdown");
			});

			dropdown.appendChild(optionElement);
		});

		rootElement.appendChild(currentValue);
		rootElement.appendChild(dropdown);

		selectElement.replaceWith(rootElement);
	});
}