export const API = {
  AUTH: {
    REGISTER: "/api/v1/auth/register",
    LOGIN: "/api/v1/auth/login",
    VERIFY: "/api/v1/auth/verify",
    SECURITY: {
      LOGIN_HISTORY: "/api/v1/auth/security/login-history",
      SESSIONS: "/api/v1/auth/security/sessions",
      REVOKE_SESSION: (sessionId: string) => `/api/v1/auth/security/sessions/${sessionId}`,
      LOGOUT_ALL: "/api/v1/auth/security/logout-all",
      VERIFY_PASSWORD: "/api/v1/auth/security/verify-password",
      SETTINGS: "/api/v1/auth/security/settings",
    },
  },
  EVENTS: {
    BASE: "/api/v1/events",
    BY_ID: (id: string) => `/api/v1/events/${id}`,
  },
  REGISTRATIONS: {
    BASE: "/api/v1/registrations",
    MY: "/api/v1/registrations/my",
    BY_ID: (id: string) => `/api/v1/registrations/${id}`,
    BY_EVENT: (eventId: string) => `/api/v1/registrations/event/${eventId}`,
  },
  ADMIN_USERS: {
    BASE: "/api/v1/admin/users",
    BY_ID: (id: string) => `/api/v1/admin/users/${id}`,
    VERIFICATIONS: "/api/v1/admin/users/verifications/pending",
    REVIEW_VERIFICATION: (id: string) => `/api/v1/admin/users/verifications/${id}/review`,
  },
  LOGIN_HISTORY: {
    BASE: "/api/v1/admin/login-history",
    BY_USER: (id: string) => `/api/v1/admin/login-history/user/${id}`,
  },
};
