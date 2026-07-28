import request from "supertest";
import app from "../../src/app";
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase,
} from "../helpers/db";
import { testUserPayload } from "../helpers/fixtures";

describe("Auth API (integration)", () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  it("registers a new user", async () => {
    const response = await request(app).post("/api/v1/auth/register").send(testUserPayload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(testUserPayload.email);
    expect(response.body.data.password).toBeUndefined();
  });

  it("rejects duplicate registration", async () => {
    await request(app).post("/api/v1/auth/register").send(testUserPayload);

    const response = await request(app).post("/api/v1/auth/register").send(testUserPayload);

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  it("logs in with valid credentials and returns a token", async () => {
    await request(app).post("/api/v1/auth/register").send(testUserPayload);

    const response = await request(app).post("/api/v1/auth/login").send({
      email: testUserPayload.email,
      password: testUserPayload.password,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeTruthy();
    expect(response.body.data.user.email).toBe(testUserPayload.email);
  });

  it("rejects invalid login credentials", async () => {
    await request(app).post("/api/v1/auth/register").send(testUserPayload);

    const response = await request(app).post("/api/v1/auth/login").send({
      email: testUserPayload.email,
      password: "wrong-password",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("returns the authenticated user from whoami", async () => {
    await request(app).post("/api/v1/auth/register").send(testUserPayload);

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: testUserPayload.email,
      password: testUserPayload.password,
    });

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .get("/api/v1/auth/whoami")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe(testUserPayload.email);
  });

  it("requires current password when changing password", async () => {
    await request(app).post("/api/v1/auth/register").send(testUserPayload);

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: testUserPayload.email,
      password: testUserPayload.password,
    });

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .put("/api/v1/auth/update")
      .set("Authorization", `Bearer ${token}`)
      .send({ password: "newpassword123" });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/current password/i);
  });
});
