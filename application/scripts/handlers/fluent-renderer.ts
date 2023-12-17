export class FluentButton extends HTMLElement {
	constructor() {
		super();

		this.attachShadow({ mode: "open" });

		const shadowRoot = this.shadowRoot;

		if (shadowRoot === null) return;

		shadowRoot.innerHTML = FluentButton.constructElement();

		FluentButton.getCss().then(function (text: string) {
			shadowRoot.innerHTML += `<style>${text}</style>`;
		});
	}

	static constructElement() {
		return `
			<button part="control">
				<span part="content">
					<slot></slot>
				</span>
			</button>
		`;
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