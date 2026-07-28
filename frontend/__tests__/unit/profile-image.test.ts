import { resolveProfileImageUrl } from "@/lib/profile-image";

describe("resolveProfileImageUrl", () => {
  it("returns null for empty values", () => {
    expect(resolveProfileImageUrl()).toBeNull();
    expect(resolveProfileImageUrl(null)).toBeNull();
    expect(resolveProfileImageUrl("")).toBeNull();
  });

  it("returns data and blob urls unchanged", () => {
    expect(resolveProfileImageUrl("data:image/png;base64,abc")).toBe("data:image/png;base64,abc");
    expect(resolveProfileImageUrl("blob:http://localhost/123")).toBe("blob:http://localhost/123");
  });

  it("returns absolute http urls unchanged", () => {
    expect(resolveProfileImageUrl("https://cdn.example.com/avatar.jpg")).toBe(
      "https://cdn.example.com/avatar.jpg"
    );
  });

  it("prefixes backend url for uploaded profile images", () => {
    expect(resolveProfileImageUrl("/uploads/photo.jpg")).toBe(
      "http://localhost:8089/uploads/photo.jpg"
    );
  });

  it("normalizes upload paths without a leading slash", () => {
    expect(resolveProfileImageUrl("uploads/photo.jpg")).toBe(
      "http://localhost:8089/uploads/photo.jpg"
    );
  });
});
