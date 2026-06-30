export const API = {
  AUTH: {
    REGISTER: "/api/v1/auth/register",
    LOGIN: "/api/v1/auth/login",
  },
  EVENTS: {
    BASE: "/api/v1/events",
    BY_ID: (id: string) => `/api/v1/events/${id}`,
  },
  REGISTRATIONS: {
    BASE: "/api/v1/registrations",
    MY: "/api/v1/registrations/my",
    BY_ID: (id: string) => `/api/v1/registrations/${id}`,
  },
  ADMIN_USERS: {
    BASE: "/api/v1/admin/users",
    BY_ID: (id: string) => `/api/v1/admin/users/${id}`,
  },
  LOGIN_HISTORY: {
    BASE: "/api/v1/admin/login-history",
    BY_USER: (id: string) => `/api/v1/admin/login-history/user/${id}`,
  },
};
