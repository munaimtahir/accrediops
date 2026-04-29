# 05_RBAC_AND_USER_MANAGEMENT.md

## Roles and Permissions
The system enforces Role-Based Access Control (RBAC) via the `User.role` field and custom backend permission classes.

### Core Roles
-   **ADMIN:** Full system access, User CRUD, Master data management.
-   **LEAD:** Framework management, Project management, Classification review.
-   **OWNER / REVIEWER / APPROVER:** Restricted to project-level operational tasks.

## User Management UI
A new dashboard for managing system users was added at `/admin/users`.

### Features
-   **List Users:** Searchable table of all system users.
-   **Create User:** Admin can add new users with initial roles and passwords.
-   **Update User:** Edit user profiles and change roles.
-   **Reset Password:** Admin-controlled password reset modal.
-   **Activate/Deactivate:** Toggle user access state.

## Backend APIs
-   `GET /api/admin/users/`: List users.
-   `POST /api/admin/users/`: Create user.
-   `PATCH /api/admin/users/<id>/`: Update user profile/role.
-   `POST /api/admin/users/<id>/password/`: Reset user password.
