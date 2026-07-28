/** Event coordinators register and log in with role "admin". Students use role "user". */
export function isEventCoordinator(role?: string | null): boolean {
  return role === "admin";
}

export function coordinatorRoleLabel(role?: string | null): string {
  return isEventCoordinator(role) ? "Event Coordinator" : "Student";
}
