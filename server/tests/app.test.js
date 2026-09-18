import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";

describe("API application", () => {
  it("returns service health information", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body).toHaveProperty("database");
  });

  it("returns structured JSON for unknown API routes", async () => {
    const response = await request(app).get("/api/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body.message).toContain("Route not found");
  });

  it("sets common HTTP security headers", async () => {
    const response = await request(app).get("/api/health");

    expect(response.headers).toHaveProperty("x-content-type-options", "nosniff");
    expect(response.headers).toHaveProperty("x-frame-options", "SAMEORIGIN");
    expect(response.headers).not.toHaveProperty("x-powered-by");
  });

  it("validates login input before querying the database", async () => {
    const response = await request(app).post("/api/users/login").send({ email: "guest@example.com" });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Email and password");
  });

  it("protects accommodation write routes", async () => {
    const response = await request(app).post("/api/accommodations").send({ title: "Test" });

    expect(response.status).toBe(401);
    expect(response.body.message).toContain("Authentication");
  });

  it("protects reservation routes", async () => {
    const response = await request(app).get("/api/reservations/user");

    expect(response.status).toBe(401);
  });

  it("rejects malformed bearer tokens", async () => {
    const response = await request(app)
      .get("/api/reservations/user")
      .set("Authorization", "Bearer definitely-not-a-jwt");

    expect(response.status).toBe(401);
    expect(response.body.message).toContain("Invalid");
  });
});
