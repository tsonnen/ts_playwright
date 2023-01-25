import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

// Request context is reused by all tests in the file.
let apiContext;

test.beforeAll(async ({ playwright }) => {
	apiContext = await playwright.request.newContext({
		// All requests we send go to this API endpoint.
		baseURL: "https://petstore.swagger.io/v2/",
	});
});

test.afterAll(async ({}) => {
	// Dispose all responses.
	await apiContext.dispose();
});

test("Upload image", async () => {
	const file = path.resolve("data", "rick_astley.jpg");
	const image = fs.readFileSync(file);
	const data = {
		id: 12345,
		category: {
			id: 0,
			name: "string",
		},
		name: "doggie",
		photoUrls: ["string"],
		tags: [
			{
				id: 0,
				name: "string",
			},
		],
		status: "available",
	};

	expect(await (await apiContext.post("pet", { data: data })).json()).toEqual(
		data
	);

	expect(await (await apiContext.get(`pet/${data["id"]}`)).json()).toEqual(
		data
	);
	const update = await apiContext.post(`pet/${data["id"]}/uploadImage`, {
		headers: {
			Accept: "*/*",
			ContentType: "multipart/form-data",
		},
		multipart: {
			file: {
				name: file,
				mimeType: "image/jpg",
				buffer: image,
			},
		},
	});
	expect(update.status()).toBe(200);

	expect(
		await (await apiContext.delete(`pet/${data["id"]}`)).status()
	).toEqual(200);
	expect(await (await apiContext.get(`pet/${data["id"]}`)).status()).toEqual(
		404
	);
});

test("Update existing pet", async () => {
	const data = {
		id: 54321,
		category: {
			id: 0,
			name: "string",
		},
		name: "doggie",
		photoUrls: ["string"],
		tags: [
			{
				id: 0,
				name: "string",
			},
		],
		status: "available",
	};

	expect(
		await (await apiContext.post("pet", { data: data })).status()
	).toEqual(200);

	expect(await (await apiContext.get(`pet/${data["id"]}`)).json()).toEqual(
		data
	);

	data["status"] = "updated doggy";

	expect(
		await (await apiContext.put("pet", { data: data })).status()
	).toEqual(200);
	expect(await (await apiContext.get(`pet/${data["id"]}`)).json()).toEqual(
		data
	);
	expect(
		await (await apiContext.delete(`pet/${data["id"]}`)).status()
	).toEqual(200);
	expect(await (await apiContext.get(`pet/${data["id"]}`)).status()).toEqual(
		404
	);
});

test("Get by status", async () => {
	const data = {
		id: 67890,
		category: {
			id: 0,
			name: "string",
		},
		name: "doggie",
		photoUrls: ["string"],
		tags: [
			{
				id: 0,
				name: "string",
			},
		],
		status: "available",
	};

	expect(
		await (await apiContext.post("pet", { data: data })).status()
	).toEqual(200);

	let available_pets = await (
		await apiContext.get("pet/findByStatus?status=available")
	).json();

	expect(available_pets.find((pet) => pet["id"] == data["id"])).toBeTruthy();

	expect(
		await (await apiContext.get("pet/findByStatus?status=fake")).json()
	).toHaveLength(0);

	expect(
		await (await apiContext.delete(`pet/${data["id"]}`)).status()
	).toEqual(200);
});

test("Update existing pet with form data", async () => {
	const data = {
		id: 9876,
		category: {
			id: 0,
			name: "string",
		},
		name: "doggie",
		photoUrls: ["string"],
		tags: [
			{
				id: 0,
				name: "string",
			},
		],
		status: "available",
	};

	expect(
		await (await apiContext.post("pet", { data: data })).status()
	).toEqual(200);

	data["status"] = "sold";
	data["name"] = "doggy darko";

	expect(
		await (
			await apiContext.post(`pet/${data["id"]}`, {
				form: {
					status: data["status"],
					name: data["name"],
				},
			})
		).status()
	).toEqual(200);
	expect(await (await apiContext.get(`pet/${data["id"]}`)).json()).toEqual(
		data
	);
	expect(
		await (await apiContext.delete(`pet/${data["id"]}`)).status()
	).toEqual(200);
	expect(await (await apiContext.get(`pet/${data["id"]}`)).status()).toEqual(
		404
	);
});
