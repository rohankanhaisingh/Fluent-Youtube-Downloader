import { FluentSelect, FluentToggle, initializeFluentDesignSystem } from "./handlers/fluent-renderer";

window.addEventListener("load", function () {

	initializeFluentDesignSystem();

	const select: FluentSelect | null = document.querySelector("#mySelect");

	select?.setOptionValue("option_3");
});