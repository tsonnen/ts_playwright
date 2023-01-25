import { Page } from "@playwright/test";

class LogInPage {
	page: Page;
	constructor(page: Page) {
		this.page = page;
	}
}
