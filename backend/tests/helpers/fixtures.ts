export const testUserPayload = {
  firstName: "Test",
  lastName: "User",
  email: "test.user@college.edu",
  username: "testuser01",
  studentId: "STU-TEST-001",
  password: "password123",
  role: "user" as const,
  college: "Test College",
};

export const testAdminPayload = {
  firstName: "Test",
  lastName: "Admin",
  email: "test.admin@college.edu",
  username: "testadmin01",
  studentId: "STU-TEST-002",
  password: "password123",
  role: "admin" as const,
  college: "Test College",
};
