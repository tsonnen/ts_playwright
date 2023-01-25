import { test, expect, Page } from "@playwright/test";

const base_url = "https://www.saucedemo.com/";

async function log_in(page: Page) {
	await page.goto("https://www.saucedemo.com/");
	await page.locator('[data-test="username"]').fill("standard_user");
	await page.locator('[data-test="password"]').fill("secret_sauce");
	await page.locator('[data-test="password"]').press("Enter");
}

test.beforeEach(async ({ page }) => {
	await page.goto(base_url);

	await log_in(page);

	await expect(page.url()).toContain("inventory.html");
});

test("Should be able to log out", async ({ page }) => {
	await page.getByRole("button", { name: "Open Menu" }).click();
	await page.getByRole("link", { name: "Logout" }).click();

	await expect(page.url()).not.toContain("inventory.html");
});

test("Should be able to open item description and add to cart", async ({
	page,
}) => {
	await page.locator("#item_4_img_link").click();

	await expect(page.url()).toContain("inventory-item.html?id=4");

	await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

	await expect(page.locator(".shopping_cart_badge")).toHaveText("1");

	await page.locator(".shopping_cart_link").click();

	await expect(page.url()).toContain("cart.html");

	await expect(page.locator(".cart_item")).toHaveCount(1);

	await expect(page.locator(".cart_quantity")).toHaveText("1");

	await expect(
		page.locator(".cart_item_label").locator(".inventory_item_name")
	).toHaveText("Sauce Labs Backpack");
});

test("Should be able to add to cart", async ({ page }) => {
	await page
		.locator('[data-test="add-to-cart-sauce-labs-bike-light"]')
		.click();

	await expect(page.locator(".shopping_cart_badge")).toHaveText("1");

	await page.locator(".shopping_cart_link").click();

	await expect(page.url()).toContain("cart.html");

	await expect(page.locator(".cart_item")).toHaveCount(1);

	await expect(page.locator(".cart_quantity")).toHaveText("1");

	await expect(
		page.locator(".cart_item_label").locator(".inventory_item_name")
	).toHaveText("Sauce Labs Bike Light");
});

test("Should be able to remove from cart", async ({ page }) => {
	await page
		.locator('[data-test="add-to-cart-sauce-labs-bike-light"]')
		.click();

	await page.locator('[data-test="remove-sauce-labs-bike-light"]').click();

	await expect(page.locator(".shopping_cart_badge")).not.toBeVisible();

	await page.locator(".shopping_cart_link").click();

	await expect(page.url()).toContain("cart.html");

	await expect(page.locator(".cart_item")).toHaveCount(0);
});

test("Should be able to checkout", async ({ page }) => {
	await page
		.locator('[data-test="add-to-cart-sauce-labs-bike-light"]')
		.click();

	await expect(page.locator(".shopping_cart_badge")).toHaveText("1");

	await page.locator(".shopping_cart_link").click();

	await page.locator('[data-test="checkout"]').click();

	await expect(page.url()).toContain("checkout-step-one.html");
	await page.locator('[data-test="firstName"]').fill("John");
	await page.locator('[data-test="lastName"]').fill("Doe");
	await page.locator('[data-test="postalCode"]').fill("12345");
	await page.locator('[data-test="continue"]').click();

	await expect(page.url()).toContain("checkout-step-two.html");
	await page.locator('[data-test="finish"]').click();

	// Would like to assert API call made correctly, but not seeing anything
	await expect(page.url()).toContain("checkout-complete.html");
});
