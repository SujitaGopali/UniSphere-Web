import { coordinatorRoleLabel, isEventCoordinator } from "@/lib/roles";

describe("roles", () => {
  it("identifies event coordinators", () => {
    expect(isEventCoordinator("admin")).toBe(true);
    expect(isEventCoordinator("user")).toBe(false);
    expect(isEventCoordinator(null)).toBe(false);
  });

  it("returns readable role labels", () => {
    expect(coordinatorRoleLabel("admin")).toBe("Event Coordinator");
    expect(coordinatorRoleLabel("user")).toBe("Student");
  });
});
