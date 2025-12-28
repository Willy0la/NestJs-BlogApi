# Codebase Explanation: Blog Platform API

This document provides a comprehensive overview of the `blog-api` project, explaining how the different modules work together to create a secure, scalable blogging platform.

---

##  High-Level Architecture

The application is built using **NestJS**, a modular framework for Node.js. It follows a "Module-Controller-Service" pattern:

1.  **Modules (`*.module.ts`)**: The building blocks that group related code (e.g., Auth, Blogs).
2.  **Controllers (`*.controller.ts`)**: Handle incoming HTTP requests (`GET`, `POST`) and return responses to the user.
3.  **Services (`*.service.ts`)**: Contain the business logic (database calls, complex calculations) to keep controllers clean.

### Core Technologies
-   **NestJS**: Main framework.
-   **MongoDB (Mongoose)**: Database for storing users, blogs, and comments.
-   **JWT (JSON Web Tokens)**: Used for secure, stateless authentication.
-   **Cloudinary**: External service for storing blog cover images.
-   **Redis (IORedis)**: In-memory store for caching blog posts to improve speed.

---

##  Key Modules

### 1. Root Module (`src/app.module.ts`)
The entry point. It loads the environment variables (via `ConfigModule`), connects to MongoDB (`MongooseModule`), and loads all feature modules (`UserAuthModule`, `BlogModule`, etc.), including the Global `RedisModule`.

### 2. User Auth Module (`src/user-auth`)
Handles user registration and login.
-   **`UserAuthService`**:
    -   Hashes passwords using `bcrypt` before saving to MongoDB.
    -   Generates JWT tokens upon successful login.
    -   Implements account locking after too many failed attempts.
-   **`JwtStrategy`**: Automatically extracts the token from the `Authorization: Bearer <token>` header and verifies it. If valid, it attaches the user to `req.user`.

### 3. Blog Module (`src/blog`)
Manages blog posts.
-   **Schema (`blog.schema.ts`)**: Defines a blog post (title, content, coverImage, author, likes).
-   **Service (`blog.service.ts`)**:
    -   **Creates Blog**: Uploads image to Cloudinary -> Saves to MongoDB -> **Invalidates Redis Cache**.
    -   **Finds All**: Checks **Redis Cache** first. If empty, fetches from DB and saves to Redis (Cache-Aside pattern).
    -   **Updates/Deletes**: Enforces ownership (only author can edit). Invalidates Redis Cache on change.
    -   **Likes**: Uses MongoDB operators `$addToSet` (add like) and `$pull` (remove like) to ensure a user can only like a post once.

### 4. Comments Module (`src/comments`)
Manages comments on blog posts.
-   **Schema**: Links a comment to an `Author` and a `Blog`.
-   **Rules Enforced**:
    -   Only the comment author can edit/delete their comment.
    -   Blog owners cannot delete comments by others (preserving free speech on the platform).

### 5. Redis Module (`src/redis`)
A global module we created to speed up the app.
-   **Provider**: Creates a single connection to Redis using `ioredis`.
-   **Usage**: Injected into `BlogService` to store/retrieve the list of blogs.

---

## 🔒 Security Features

1.  **Guards (`JwtAuthGuard`)**: applied to routes like `POST /blogs`. It ensures only logged-in users can access them.
2.  **Validation (DTOs)**: Data Transfer Objects (like `CreateBlogDto`) use decorators (e.g., `@IsString`, `@IsNotEmpty`) to reject bad data before it hits the logic.
3.  **Environment Variables**: Secrets like `CLOUDINARY_API_KEY` and `DB` connection strings are hidden in `.env` files and not hardcoded.

---

## 🚀 Performance Optimization (Redis)

We implemented **Caching** for the home page (`GET /blogs`).
-   **Problem**: Fetching all blogs from the database on every visit is slow.
-   **Solution**:
    1.  User asks for blogs.
    2.  App asks Redis: "Do you have `blogs_all`?"
    3.  **Hit**: Redis says "Yes", app returns it instantly (~5ms).
    4.  **Miss**: Redis says "No", app asks MongoDB (~50ms), sends to user, and saves copy to Redis.
-   **Staleness**: When anyone creates or edits a blog, we delete `blogs_all` from Redis so the next user forces a fresh fetch. This ensures data is always up-to-date.
