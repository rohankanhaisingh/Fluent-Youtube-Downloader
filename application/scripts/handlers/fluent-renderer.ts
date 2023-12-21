const loadedStyleSheets: { [K: string]: CSSStyleSheet } = {};

export type OnAttributeChangeCallback = (oldValue: string | null, newValue: string | null, record: MutationRecord) => void;

export class OktaiDeBoktai extends HTMLElement{
	constructor() {
		super();

		const shadowRoot = this.attachShadow({ mode: "open" });
		shadowRoot.innerHTML = "<span>Click me</span>";

		shadowRoot.querySelector("span")?.addEventListener("click", function (e) {
			console.log(e);
		});
	}

	static initialize(): void {
		return customElements.define("oktai-de-boktai", OktaiDeBoktai);
	}
}

export class FluentButton extends HTMLElement {
	constructor() {
		super();

		const shadowRoot = this.attachShadow({ mode: "open" });

		const buttonElement = document.createElement("button");
		buttonElement.setAttribute("part", "control");
		buttonElement.innerHTML = "<span part='content'><slot></slot></span>";

		shadowRoot.appendChild(buttonElement);
		
		FluentButton.getCss().then(css => FluentButton.setCss(shadowRoot, css));
	}

	static setCss(shadowRoot: ShadowRoot, css: string) {

		const styleSheet = new CSSStyleSheet();
		styleSheet.replaceSync(css);

		shadowRoot.adoptedStyleSheets.push(styleSheet);
	}

	static getCss(): Promise<string> {

		return new Promise(function (resolve, reject) {
			return fetch("/static/styles/web-components/_fluent-button.css", { method: "GET" })
				.then(function (responseObject) {
					responseObject.text()
						.then(function (cssText: string) {
							resolve(cssText);
						})
						.catch(function (_err: Error) {
							reject(_err);
						});
				})
				.catch(function (err: Error) {
					reject(err);
				});
		});
	}

	static initialize() {
		customElements.define("fluent-button", FluentButton);
	}
}

export class FluentSelect extends HTMLElement {
	constructor() {
		super();

		const shadowRoot = this.attachShadow({ mode: "open" });

		FluentSelect.constructElement(shadowRoot);
		FluentSelect.setEventListeners(shadowRoot, this);
		FluentSelect.getCss().then(css => FluentSelect.setCss(shadowRoot, css));

		const fluentOptionElements: NodeListOf<HTMLElement> = this.querySelectorAll("fluent-option"),
			firstOptionElement: HTMLElement = fluentOptionElements[0];

		const currentValueElement: HTMLDivElement | null = shadowRoot.querySelector("[part=current-value]");

		if (currentValueElement !== null) {

			firstOptionElement.setAttribute("active", "");

			const currentValue: string | null = firstOptionElement.getAttribute("value");

			if (currentValue !== null) {

				(currentValueElement.querySelector("span") as HTMLSpanElement).innerText = firstOptionElement.innerText;
				this.setAttribute("value", currentValue);
			}
		}
	
	}

	static setEventListeners(shadowRoot: ShadowRoot, mainElement: FluentSelect) {

		const currentValueElement: HTMLDivElement | null = shadowRoot.querySelector("[part=current-value]"),
			dropdownElement: HTMLDivElement | null = shadowRoot.querySelector("[part=dropdown]");

		if (currentValueElement === null || dropdownElement === null) return;

		currentValueElement.addEventListener("click", function () {
			if (!mainElement.classList.contains("in-dropdown"))
				mainElement.classList.add("in-dropdown");
		});

		const slotElement: HTMLSlotElement | null = dropdownElement.querySelector("slot");

		if (slotElement === null) return;

		const slottedItems: Element[] = slotElement.assignedElements();

		slottedItems.forEach(function (node: Element) {

			node.addEventListener("click", function () {

				slottedItems.forEach(_node => _node.removeAttribute("active"));

				node.setAttribute("active", "");

				const nodeValue: string | null = node.getAttribute("value");

				(currentValueElement.querySelector("span") as HTMLSpanElement)
					.innerText = node.innerHTML;

				mainElement.setAttribute("value", nodeValue !== null ? nodeValue : "");

				if (mainElement.classList.contains("in-dropdown"))
					mainElement.classList.remove("in-dropdown");
			});
		});
	}

	static constructElement(shadowRoot: ShadowRoot) {
		const controlElement = document.createElement("div");
		controlElement.setAttribute("part", "control");

		const currentValueElement = document.createElement("div");
		currentValueElement.setAttribute("part", "current-value");
		currentValueElement.innerHTML = "<span></span><img src='/static/media/icons/windows-icon-down.png' alt='Dropdown'/>";

		const dropdownElement = document.createElement("div");
		dropdownElement.setAttribute("part", "dropdown");
		dropdownElement.innerHTML = "<slot></slot>";

		controlElement.appendChild(currentValueElement);
		controlElement.appendChild(dropdownElement);
		shadowRoot.appendChild(controlElement);
	}

	static setCss(shadowRoot: ShadowRoot, css: string) {

		const styleSheet = new CSSStyleSheet();
		styleSheet.replaceSync(css);

		shadowRoot.adoptedStyleSheets.push(styleSheet);
	}

	static getCss(): Promise<string> {
		return new Promise(function (resolve, reject) {
			fetch("/static/styles/web-components/_fluent-select.css", { method: "GET" })
				.then(function (response) {
					response.text()
						.then(function (css: string) {
							resolve(css);
						})
						.catch(function (_err: Error) {
							reject(_err);
						});
				})
				.catch(function (err: Error) {
					reject(err);
				});
			return null;
		});
	}

	static initialize() {
		customElements.define("fluent-select", FluentSelect);
	}
}

export class FluentInput extends HTMLElement {

	private attributeChangeEvents: { [K: string]: OnAttributeChangeCallback } = {}; 
	private mutationObserver = new MutationObserver(mutations => this.handleObserverMutation(mutations));

	constructor() {
		super();

		const shadowRoot = this.attachShadow({ mode: "open" });

		this.mutationObserver.observe(this, { attributeFilter: ["value"] });

		FluentInput.constructElement(shadowRoot);
		FluentInput.getCss().then(css => FluentInput.setCss(shadowRoot, css));
		FluentInput.setEventListeners(shadowRoot, this);
		FluentInput.setAttributes(shadowRoot, this);
	}

	private handleObserverMutation(mutationRecord: MutationRecord[]) {

		const self: FluentInput = this;

		mutationRecord.forEach(function (record: MutationRecord) {

			if (record.attributeName === null) return;

			const oldValue: string | null = record.oldValue,
				newValue: string | null = self.getAttribute(record.attributeName);

			if (typeof self.attributeChangeEvents[record.attributeName] === "function")
				self.attributeChangeEvents[record.attributeName](oldValue, newValue, record);
		});
	}

	public setValue(value: string) {

		const shadowRoot: ShadowRoot | null = this.shadowRoot;

		if (shadowRoot === null) return;

		const inputField: HTMLInputElement | null = shadowRoot.querySelector("[part=input]");

		if (inputField === null) return;

		inputField.setAttribute("value", value);
		this.setAttribute("value", value);
	}

	public onAttributeChange(attributeName: string, cb: OnAttributeChangeCallback): FluentInput {

		this.attributeChangeEvents[attributeName] = cb;

		return this;
	}

	static constructElement(shadowRoot: ShadowRoot) {
		const controlElement = document.createElement("div");
		controlElement.setAttribute("part", "control");

		const contentElement = document.createElement("span");
		contentElement.setAttribute("part", "content");

		const inputElement = document.createElement("input");
		inputElement.setAttribute("part", "input");

		contentElement.appendChild(inputElement);
		controlElement.appendChild(contentElement);
		shadowRoot.appendChild(controlElement);
	}

	static setAttributes(shadowRoot: ShadowRoot, mainElement: FluentInput) {

		const inputField: HTMLInputElement | null = shadowRoot.querySelector("[part=input]");

		if (inputField === null) return;

		const reservedAttributes = ["id", "class"];

		const allAttributes: string[] = mainElement.getAttributeNames();

		allAttributes.forEach(function (attributeName: string) {

			if (reservedAttributes.includes(attributeName)) return;

			const attributeValue: string | null = mainElement.getAttribute(attributeName);

			if (attributeValue === null) return;

			inputField.setAttribute(attributeName, attributeValue);
		});
	}

	static setEventListeners(shadowRoot: ShadowRoot, mainElement: FluentInput) {

		const inputElement: HTMLInputElement | null = shadowRoot.querySelector("[part=input]");

		if (inputElement === null) return;

		inputElement.addEventListener("focus", function () {

			if (!mainElement.classList.contains("focused"))
				mainElement.classList.add("focused");
		});

		inputElement.addEventListener("blur", function () {

			if (mainElement.classList.contains("focused"))
				mainElement.classList.remove("focused");
		});

		inputElement.addEventListener("input", function () {

			mainElement.setAttribute("value", inputElement.value);
		});
	}

	static setCss(shadowRoot: ShadowRoot, css: string) {

		const styleSheet = new CSSStyleSheet();
		styleSheet.replaceSync(css);

		shadowRoot.adoptedStyleSheets.push(styleSheet);
	}

	static getCss(): Promise<string> {
		return new Promise(function (resolve, reject) {
			fetch("/static/styles/web-components/_fluent-input.css", { method: "GET" })
				.then(function (response) {
					response.text()
						.then(function (css: string) {
							resolve(css);
						})
						.catch(function (_err: Error) {
							reject(_err);
						});
				})
				.catch(function (err: Error) {
					reject(err);
				});
			return null;
		});
	}

	static initialize() {
		customElements.define("fluent-input", FluentInput);
	}
}

export class FluentToggle extends HTMLElement {
	constructor() {
		super();

		const shadowRoot = this.attachShadow({ mode: "open" });

		FluentToggle.constructElement(shadowRoot);
		FluentToggle.setEventListeners(shadowRoot, this);
		FluentToggle.getCss().then(css => FluentToggle.setCss(shadowRoot, css));
	}

	// Public methods
	public setActive() {

		if (!this.classList.contains("active"))
			this.classList.add("active");

		FluentToggle.setActiveAttribute(this);
		FluentToggle.changeLabelOnClick(this);
		FluentToggle.dispatchCustomEvent(this, "true");
	}

	public setInactive() {

		if (this.classList.contains("active"))
			this.classList.remove("active");

		FluentToggle.setActiveAttribute(this);
		FluentToggle.changeLabelOnClick(this);
		FluentToggle.dispatchCustomEvent(this, "false");

	}

	static dispatchCustomEvent(mainElement: FluentToggle, attributeValue: string) {

		const event = new CustomEvent("active", {
			bubbles: true,
			detail: { attributeValue}
		});

		mainElement.dispatchEvent(event);
	}

	static changeLabelOnClick(mainElement: FluentToggle) {

		const hasActiveClass: boolean = mainElement.classList.contains("active");

		const forAttribute: string | null = mainElement.getAttribute("for");

		if (forAttribute === null) return;

		const targetElement: HTMLElement | null = document.querySelector(forAttribute);

		if (targetElement === null) return;

		const activeValueAttribute: string | null = mainElement.getAttribute("active-value"),
			inActiveValueAttribute: string | null = mainElement.getAttribute("inactive-value");

		if (activeValueAttribute === null || inActiveValueAttribute === null) return;

		const triggerValue: string = hasActiveClass ? activeValueAttribute : inActiveValueAttribute;

		targetElement.innerText = triggerValue;
	}

	static setActiveAttribute(mainElement: FluentToggle) {

		const hasActiveClass: boolean = mainElement.classList.contains("active");

		if (hasActiveClass)
			return mainElement.setAttribute("active", "true");

		mainElement.setAttribute("active", "false");
	}

	static setEventListeners(shadowRoot: ShadowRoot, mainElement: FluentToggle) {

		mainElement.addEventListener("click", function () {

			if (!mainElement.classList.contains("active")) {

				mainElement.classList.add("active");
				FluentToggle.dispatchCustomEvent(mainElement, "true");
			} else {

				mainElement.classList.remove("active");
				FluentToggle.dispatchCustomEvent(mainElement, "false");
			}

			FluentToggle.setActiveAttribute(mainElement);
			FluentToggle.changeLabelOnClick(mainElement);
		});
	}

	static constructElement(shadowRoot: ShadowRoot) {
		const controlElement = document.createElement("div");
		controlElement.setAttribute("part", "control");

		const thumbElement = document.createElement("div");
		thumbElement.setAttribute("part", "thumb");

		controlElement.appendChild(thumbElement);
		shadowRoot.appendChild(controlElement);
	}

	static setCss(shadowRoot: ShadowRoot, css: string) {

		const styleSheet = new CSSStyleSheet();
		styleSheet.replaceSync(css);

		shadowRoot.adoptedStyleSheets.push(styleSheet);
	}

	static getCss(): Promise<string> {
		return new Promise(function (resolve, reject) {
			fetch("/static/styles/web-components/_fluent-toggle.css", { method: "GET" })
				.then(function (response) {
					response.text()
						.then(function (css: string) {
							resolve(css);
						})
						.catch(function (_err: Error) {
							reject(_err);
						});
				})
				.catch(function (err: Error) {
					reject(err);
				});
			return null;
		});
	}

	static initialize() {
		customElements.define("fluent-toggle", FluentToggle);
	}
}

export class FluentSpinner extends HTMLElement{

	constructor() {
		super();

		const shadowRoot = this.attachShadow({ mode: "open" });

		FluentSpinner.constructElement(shadowRoot, this);
		FluentSpinner.getCss().then(css => FluentSpinner.setCss(shadowRoot, css));
	}

	static constructElement(shadowRoot: ShadowRoot, mainElement: FluentSpinner) {

		/*
		  <svg class="spinner" style="margin: 40px auto;">
                        <circle>
                            <animateTransform attributeName="transform" type="rotate" values="-90;810" keyTimes="0;1" dur="2s" repeatCount="indefinite"></animateTransform>
                            <animate attributeName="stroke-dashoffset" values="0%;0%;-157.080%" calcMode="spline" keySplines="0.61, 1, 0.88, 1; 0.12, 0, 0.39, 0" keyTimes="0;0.5;1" dur="2s" repeatCount="indefinite"></animate>
                            <animate attributeName="stroke-dasharray" values="0% 314.159%;157.080% 157.080%;0% 314.159%" calcMode="spline" keySplines="0.61, 1, 0.88, 1; 0.12, 0, 0.39, 0" keyTimes="0;0.5;1" dur="2s" repeatCount="indefinite"></animate>
                        </circle>
                    </svg>
		*/


		const controlElement = document.createElement("div");
		controlElement.setAttribute("part", "control");

		const spinnerElement = document.createElement("svg");
		spinnerElement.setAttribute("part", "spinner");

		spinnerElement.innerHTML = `
			<circle>
				<animateTransform attributeName="transform" type="rotate" values="-90;810" keyTimes="0;1" dur="2s" repeatCount="indefinite"></animateTransform>
				<animate attributeName="stroke-dashoffset" values="0%;0%;-157.080%" calcMode="spline" keySplines="0.61, 1, 0.88, 1; 0.12, 0, 0.39, 0" keyTimes="0;0.5;1" dur="2s" repeatCount="indefinite"></animate>
				<animate attributeName="stroke-dasharray" values="0% 314.159%;157.080% 157.080%;0% 314.159%" calcMode="spline" keySplines="0.61, 1, 0.88, 1; 0.12, 0, 0.39, 0" keyTimes="0;0.5;1" dur="2s" repeatCount="indefinite"></animate>
			</circle>
		`;

		controlElement.appendChild(spinnerElement);
		shadowRoot.appendChild(controlElement);
	}

	static setCss(shadowRoot: ShadowRoot, css: string) {

		const styleSheet = new CSSStyleSheet();
		styleSheet.replaceSync(css);

		shadowRoot.adoptedStyleSheets.push(styleSheet);
	}

	static getCss(): Promise<string> {
		return new Promise(function (resolve, reject) {
			fetch("/static/styles/web-components/_fluent-spinner.css", { method: "GET" })
				.then(function (response) {
					response.text()
						.then(function (css: string) {
							resolve(css);
						})
						.catch(function (_err: Error) {
							reject(_err);
						});
				})
				.catch(function (err: Error) {
					reject(err);
				});
			return null;
		});
	}

	static initialize() {
		customElements.define("fluent-spinner", FluentSpinner);
	}
}

export function initializeFluentDesignSystem() {

	FluentButton.initialize();
	FluentSelect.initialize();
	FluentInput.initialize();
	FluentToggle.initialize();
	FluentSpinner.initialize();
	OktaiDeBoktai.initialize();
}