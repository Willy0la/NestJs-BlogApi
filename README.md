# Project 3: Blog Platform Backend API

A robust REST API for a blogging platform built with **NestJS**, **MongoDB**, **JWT Authentication**, and **Cloudinary**.

## Features & Requirements Matched

This project fully implements the requirements for "Project 3":

-   **Framework**: NestJS (Modular Architecture)
-   **Database**: MongoDB (Mongoose Schemas)
-   **Authentication**: JWT (Stateless, Protected Routes)
-   **File Storage**: Cloudinary (Image Uploads)

### Feature Checklist

| Category | Feature | Status |
| :--- | :--- | :--- |
| **Auth** | User Registration & Login | Implemented |
| **Auth** | JWT Protected Routes | Implemented |
| **Blog** | Create, Read, Update, Delete Blogs | Implemented |
| **Blog** | Ownership Rules (Edit/Delete own only) | Implemented |
| **Comments** | Add Comments to Blogs | Implemented |
| **Comments** | Ownership Rules (Author edit/delete) | Implemented |
| **Comments** | **Public Read Access** (Added) | Implemented |
| **Likes** | Like/Unlike (Unique user check) | Implemented |
| **Uploads** | Cloudinary Image Integration | Implemented |

---

## Project Setup

### 1. Prerequisites

-   Node.js (v16+)
-   MongoDB (Local or Atlas URI)
-   Cloudinary Account (Cloud Name, API Key, API Secret)

### 2. Installation

```bash
$ npm install
```

### 3. Configuration

Create a `.env.development.local` file in the root directory:

```env

```

### 4. Running the App

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production build
$ npm run build
$ npm run start:prod
```

---

## Architecture

The project follows a modular **NestJS** architecture:

-   `src/app.module.ts`: Root module wiring everything together.
-   `src/user-auth`: Handles Signup, Signin, and JWT Strategy.
-   `src/blog`: CRUD for Blog Posts, Storage logic, and Like toggling.
    -   *Enforces ownership*: Users can only edit/delete their own blogs.
-   `src/comments`: Commenting logic linked to Blogs and Users.
    -   *Enforces ownership*: Only comment authors can edit/delete.
    -   *Enforces restriction*: Blog owners cannot delete others' comments.
-   `src/cloudinary`: Shared service for file uploads.

---

## API Endpoints

A complete list of endpoints is available in **[endpoints.txt](./endpoints.txt)**.

**Quick Summary:**

-   **Auth**: `POST /auth/signup`, `POST /auth/signin`
-   **Blogs**: `GET /blogs` (Public), `POST /blogs` (Protected), `PATCH/DELETE /blogs/:id` (Owner only)
-   **Comments**: `GET /comments/:blogId` (Public), `POST /comments/:blogId` (Protected)
-   **Likes**: `PATCH /blogs/:id/like` (Protected)

---

## Testing

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e
```
