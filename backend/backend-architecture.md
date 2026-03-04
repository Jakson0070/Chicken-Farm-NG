# Backend Architecture: Users and Roles Management

## Overview

This document outlines the backend architecture for implementing a role-based user management system in the Chicken Farm NG Laravel application. The system supports two roles: **admin** and **user**.

---

## Architecture Plan

### 1. Database Design

#### 1.1 Roles Table
A dedicated `roles` table to store available roles in the system.

| Column    | Type         | Description           |
|-----------|--------------|-----------------------|
| id        | BIGINT (PK)  | Primary key           |
| name      | VARCHAR(50)  | Role name (admin/user)|
| created_at| TIMESTAMP    | Creation timestamp    |
| updated_at| TIMESTAMP    | Update timestamp      |

#### 1.2 Users Table (Modified)
Add `role_id` foreign key to the existing users table.

| Column         | Type         | Description                |
|----------------|--------------|----------------------------|
| id             | BIGINT (PK)  | Primary key                |
| name           | VARCHAR(255) | User's full name           |
| email          | VARCHAR(255) | Unique email address       |
| email_verified_at | TIMESTAMP | Email verification timestamp|
| password       | VARCHAR(255) | Hashed password            |
| role_id        | BIGINT (FK)  | Foreign key to roles table |
| remember_token | VARCHAR(100) | Remember me token          |
| created_at     | TIMESTAMP    | Creation timestamp         |
| updated_at     | TIMESTAMP    | Update timestamp           |

---

### 2. File Structure

```
app/
├── Enums/
│   └── Role.php                    # Role enum (admin, user)
├── Models/
│   ├── User.php                    # Updated User model
│   └── Role.php                    # Role model
├── Http/
│   ├── Controllers/
│   │   ├── Auth/
│   │   │   ├── RegisterController.php
│   │   │   └── LoginController.php
│   │   └── Admin/
│   │       └── UserController.php  # Admin user management
│   ├── Middleware/
│   │   └── RoleMiddleware.php      # Role-based access control
│   └── Requests/
│       ├── Auth/
│       │   ├── RegisterRequest.php
│       │   └── LoginRequest.php
│       └── Admin/
│           └── UpdateUserRequest.php
└── Resources/
    └── UserResource.php            # API resource for user responses

database/
├── migrations/
│   ├── 2024_01_01_000003_create_roles_table.php
│   └── 2024_01_01_000004_add_role_id_to_users_table.php
├── seeders/
│   ├── RoleSeeder.php              # Seed default roles
│   └── AdminUserSeeder.php         # Seed initial admin user
└── factories/
    ├── RoleFactory.php
    └── UserFactory.php (updated)

routes/
└── api.php (updated)
```

---

### 3. Implementation Phases

#### Phase 1: Database Layer
1. Create `roles` table migration
2. Create migration to add `role_id` to users table
3. Define foreign key relationship

#### Phase 2: Models & Relationships
1. Create `Role` model with proper fillable and relationships
2. Update `User` model with role relationship and helper methods
3. Create `Role` enum for type-safe role references

#### Phase 3: Authentication
1. Create `RegisterController` - handles user registration (default: user role)
2. Create `LoginController` - handles login/logout with Sanctum tokens
3. Create Form Requests for validation

#### Phase 4: Authorization
1. Create `RoleMiddleware` - restricts access based on user role
2. Register middleware in bootstrap/app.php

#### Phase 5: Admin User Management
1. Create `UserController` for admin to manage users
2. Implement promote/demote user role functionality
3. Implement list/get/update/delete user operations

#### Phase 6: Seeders
1. Create `RoleSeeder` - seeds 'admin' and 'user' roles
2. Create `AdminUserSeeder` - seeds initial admin account
3. Update `DatabaseSeeder` to call role and admin seeders

#### Phase 7: Routes
1. Define public auth routes (register, login, logout)
2. Define protected admin routes (user management)
3. Apply appropriate middleware to routes

---

### 4. API Endpoints

#### Authentication (Public)
| Method | Endpoint          | Description                    |
|--------|-------------------|--------------------------------|
| POST   | /api/auth/register | Register new user (as 'user') |
| POST   | /api/auth/login    | Login and get Sanctum token   |
| POST   | /api/auth/logout   | Logout (revoke token)         |
| GET    | /api/auth/me       | Get current authenticated user|

#### User Management (Admin Only)
| Method   | Endpoint             | Description                  |
|----------|----------------------|------------------------------|
| GET      | /api/admin/users     | List all users               |
| GET      | /api/admin/users/{id}| Get specific user            |
| PUT      | /api/admin/users/{id}| Update user details          |
| PATCH    | /api/admin/users/{id}/role | Change user role     |
| DELETE   | /api/admin/users/{id}| Delete user                  |

---

### 5. Role Enum Definition

```php
enum Role: string
{
    case ADMIN = 'admin';
    case USER = 'user';
}
```

---

### 6. Middleware Logic

The `RoleMiddleware` will:
- Check if user is authenticated
- Verify user has the required role
- Return 403 Forbidden if role doesn't match
- Support multiple roles (e.g., `role:admin,user`)

---

### 7. Security Considerations

1. **Password Hashing**: Use Laravel's bcrypt (default 12 rounds)
2. **API Tokens**: Use Laravel Sanctum for token-based auth
3. **Role Protection**: Admin routes protected by `role:admin` middleware
4. **Mass Assignment**: Properly define `$fillable` on models
5. **Validation**: Use Form Requests for input validation

---

### 8. Execution Order

1. ✅ Create this architecture document
2. ✅ Create migrations (roles table, add role_id to users)
3. ✅ Create Role model and Role enum
4. ✅ Update User model with role relationship
5. ✅ Create seeders (RoleSeeder, AdminUserSeeder)
6. ✅ Create Auth controllers (Register, Login)
7. ✅ Create Form Requests for validation (inline in controllers)
8. ✅ Create RoleMiddleware
9. ✅ Create Admin UserController
10. ✅ Create UserResource for API responses
11. ✅ Update routes/api.php
12. ✅ Update DatabaseSeeder
13. ✅ Run migrations and seeders
14. ✅ Test all endpoints

---

### 9. Default Admin Credentials (Seeded)

```
Email: admin@chickenfarm.ng
Password: password123
Role: admin
```

> ⚠️ **Important**: Change the default admin password after first login in production!

---

### 10. User Registration Flow

```
1. User submits registration request (name, email, password)
2. System validates input
3. System creates user with default 'user' role
4. System returns success response with user data
5. User can login to receive Sanctum token
```

### 11. Admin Promotion Flow

```
1. Admin logs in and gets Sanctum token
2. Admin sends PATCH request to /api/admin/users/{id}/role
3. System verifies admin role via middleware
4. System updates user's role_id to admin role
5. System returns updated user data
```

---

## Next Steps

Proceed with implementation following the execution order above.
