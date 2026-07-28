import {
  buildDeviceFingerprint,
  createSessionId,
  parseDeviceLabel,
} from "../../src/utils/device.util";

describe("device.util", () => {
  describe("parseDeviceLabel", () => {
    it("returns unknown device when user agent is missing", () => {
      expect(parseDeviceLabel()).toBe("Unknown device");
    });

    it("parses Chrome on Windows", () => {
      const ua =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";
      expect(parseDeviceLabel(ua)).toBe("Chrome on Windows");
    });

    it("parses Safari on iOS", () => {
      const ua =
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1";
      expect(parseDeviceLabel(ua)).toBe("Safari on iOS");
    });

    it("parses Firefox on Linux", () => {
      const ua = "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0";
      expect(parseDeviceLabel(ua)).toBe("Firefox on Linux");
    });
  });

  describe("buildDeviceFingerprint", () => {
    it("returns a stable hash for the same user agent", () => {
      const ua = "Mozilla/5.0 Test Agent";
      expect(buildDeviceFingerprint(ua)).toBe(buildDeviceFingerprint(ua));
    });

    it("returns different hashes for different user agents", () => {
      expect(buildDeviceFingerprint("agent-a")).not.toBe(buildDeviceFingerprint("agent-b"));
    });
  });

  describe("createSessionId", () => {
    it("returns a UUID string", () => {
      const sessionId = createSessionId();
      expect(sessionId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it("generates unique session ids", () => {
      expect(createSessionId()).not.toBe(createSessionId());
    });
  });
});
