import request from "supertest";
import app from "../../src/app";
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase,
} from "../helpers/db";
import { testUserPayload } from "../helpers/fixtures";

async function registerAndLogin(agent: ReturnType<typeof request>) {
  await agent.post("/api/v1/auth/register").send(testUserPayload);

  const loginResponse = await agent.post("/api/v1/auth/login").send({
    email: testUserPayload.email,
    password: testUserPayload.password,
  });

  return {
    token: loginResponse.body.data.token as string,
    agent,
  };
}

describe("Security API (integration)", () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  it("returns active sessions for the authenticated user", async () => {
    const agent = request(app);
    const { token } = await registerAndLogin(agent);

    const response = await agent
      .get("/api/v1/auth/security/sessions")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.sessions.length).toBeGreaterThan(0);
    expect(response.body.data.sessions[0].isCurrent).toBe(true);
  });

  it("updates login alert settings", async () => {
    const agent = request(app);
    const { token } = await registerAndLogin(agent);

    const response = await agent
      .put("/api/v1/auth/security/settings")
      .set("Authorization", `Bearer ${token}`)
      .send({ loginAlertsEnabled: false });

    expect(response.status).toBe(200);
    expect(response.body.data.loginAlertsEnabled).toBe(false);
  });

  it("returns login history entries after sign-in", async () => {
    const agent = request(app);
    const { token } = await registerAndLogin(agent);

    const response = await agent
      .get("/api/v1/auth/security/login-history")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0].deviceLabel).toBeTruthy();
  });

  it("invalidates tokens after logout-all", async () => {
    const agent = request(app);
    const { token } = await registerAndLogin(agent);

    const logoutAllResponse = await agent
      .post("/api/v1/auth/security/logout-all")
      .set("Authorization", `Bearer ${token}`);

    expect(logoutAllResponse.status).toBe(200);

    const whoamiResponse = await agent
      .get("/api/v1/auth/whoami")
      .set("Authorization", `Bearer ${token}`);

    expect(whoamiResponse.status).toBe(401);
  });
});
