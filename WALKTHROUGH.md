# Walkthrough - UniSphere Project (Sprint 2 & Sprint 3 Complete)

I have completed the implementation of all Sprint 2 (College Event Management) and Sprint 3 (Profile Update, Password Changes, Multer Integration, Frontend Authentication Context, and Routing Proxy) requirements. Both apps compile successfully with zero TypeScript errors.

---

## 🛠️ Environment Variables for Local Development

### 1. Backend API (`backend/.env`)
Create a `.env` file inside the `backend` folder:
```env
PORT=8089
MONGODB_URL=mongodb://localhost:27017/unisphere-db
SECRET_KEY=yoursecretjwtkeyhere
```

### 2. Frontend Next.js (`frontend/.env.local`)
Create a `.env.local` file inside the `frontend` folder:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8089
```

---

## 📂 Sprint 3 Codebase Additions & Modifications

### 1. Backend API (Express + TypeScript)
- **Profile Image Mongoose Schema**: Extended [user.model.ts](file:///c:/Users/ROG/STRIX/OneDrive/Desktop/unisphere_web/backend/src/models/user.model.ts) with a `profileImage` field.
- **Repository Profile Update**: Extended [user.repository.ts](file:///c:/Users/ROG/STRIX/OneDrive/Desktop/unisphere_web/backend/src/repositories/user.repository.ts) with `update` (using Mongoose `findByIdAndUpdate`).
- **Multer Upload Middleware**: Added [upload.middleware.ts](file:///c:/Users/ROG/STRIX/OneDrive/Desktop/unisphere_web/backend/src/middlewares/upload.middleware.ts) supporting image mimetypes validation and a 5MB size limit. Serves static files from the `uploads/` directory.
- **User Update Service Logic**: Extended [user.service.ts](file:///c:/Users/ROG/STRIX/OneDrive/Desktop/unisphere_web/backend/src/services/user.service.ts) to encrypt passwords if supplied and check for duplicate username/studentId before updating.
- **Endpoints Controller mapping**: Extended [user.controller.ts](file:///c:/Users/ROG/STRIX/OneDrive/Desktop/unisphere_web/backend/src/controllers/user.controller.ts) with:
  - `whoami`: returns authenticated user details (excluding password).
  - `updateProfile`: parses multipart uploads and updates user details.
- **Authentication Routes**: Registered endpoints in [user.route.ts](file:///c:/Users/ROG/STRIX/OneDrive/Desktop/unisphere_web/backend/src/routes/user.route.ts):
  - `GET /api/v1/auth/whoami` (guarded by `authorizedMiddleware`)
  - `PUT /api/v1/auth/update` (processed by `uploadMiddleware.single("profileImage")` and `authorizedMiddleware`)
- **Static Assets Serving**: Configured Express static file serving in [app.ts](file:///c:/Users/ROG/STRIX/OneDrive/Desktop/unisphere_web/backend/src/app.ts) at `/uploads` path mapping to `process.cwd()/uploads`.

---

### 2. Frontend Web (Next.js App Router)
- **Next.js API proxy handler**: Created [route.ts](file:///c:/Users/ROG/STRIX/OneDrive/Desktop/unisphere_web/frontend/app/api/[...path]/route.ts). Client calls to `/api/v1/...` go through this proxy which injects the HTTP-only JWT `Authorization: Bearer <TOKEN>` header before making the backend call.
- **Authentication State Provider**: Added [AuthContext.tsx](file:///c:/Users/ROG/STRIX/OneDrive/Desktop/unisphere_web/frontend/lib/context/AuthContext.tsx) to manage global login state and synchronize details when profile updates succeed.
- **Root Context Wrapper**: Modified [layout.tsx](file:///c:/Users/ROG/STRIX/OneDrive/Desktop/unisphere_web/frontend/app/layout.tsx) to wrap root elements in the `<AuthProvider>`.
- **Navigation Layouts Sync**: Modified [Navbar.tsx](file:///c:/Users/ROG/STRIX/OneDrive/Desktop/unisphere_web/frontend/app/_components/Navbar.tsx) to be a client component consuming `useAuth()` so changes to the name reflect instantly across pages.
- **Next.js Router Guards**: Added [middleware.ts](file:///c:/Users/ROG/STRIX/OneDrive/Desktop/unisphere_web/frontend/middleware.ts) protecting `/dashboard` and `/profile` routes, redirecting unauthenticated users to `/login`.
- **Dashboard Profile UI**: Added [page.tsx](file:///c:/Users/ROG/STRIX/OneDrive/Desktop/unisphere_web/frontend/app/dashboard/profile/page.tsx) rendering:
  - Personal Information form: prefilled fields, chooses local avatar file, renders upload preview.
  - Security Details form: edits password securely.

---

## ✅ Verification & Build Results

Both applications compile and build with zero errors.

### 1. Backend Compilation
Command: `npx tsc --noEmit` inside `/backend`
```text
(Success: Finished with Exit Code 0)
```

### 2. Frontend Compilation
Command: `npx tsc --noEmit` inside `/frontend`
```text
(Success: Finished with Exit Code 0)
```
