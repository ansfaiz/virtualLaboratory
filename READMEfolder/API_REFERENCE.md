# Virtual Laboratory API Reference

Base URL: `http://localhost:8080`

## Authentication Rules

Current access behavior is based on `SecurityConfig`:

- `OPTIONS /**` -> permitted
- `/api/users/**` -> permitted without authentication
- `POST /api/auth/**` -> permitted without authentication
- `/error` -> permitted
- All other routes -> require `Authorization: Bearer <jwt-token>`

Notes:

- `GET /api/auth/me` requires authentication.
- `POST /api/auth/logout` is currently permitted even without a token, but if a token is sent it should be in the `Authorization` header.
- User management endpoints are currently public because `/api/users/**` is fully permitted.
- Role values are case-sensitive. Valid values in the current backend are `ADMIN`, `STUDENT`, `TEACHER`, `Deen`, `Coordinator`.

## Auth API

### `POST /api/auth/login`

- Access: `Permit All`
- Description: Authenticate a user with email and password and return JWT token with user details.
- Request body:

```json
{
  "email": "user@example.com",
  "password": "pass@1234"
}
```

### `POST /api/auth/logout`

- Access: `Permit All`
- Description: Blacklist the provided JWT token if `Authorization: Bearer <token>` is sent.
- Request body: none

### `GET /api/auth/me`

- Access: `Auth Required`
- Description: Return the currently authenticated user profile.
- Request body: none

## Users API

### `POST /api/users`

- Access: `Permit All`
- Description: Create a new user. Also creates related student or teacher records when applicable.
- Request body:

```json
{
  "name": "Tarzen Teacher",
  "email": "tarzen.teacher@example.com",
  "password": "pass@1234",
  "role": "TEACHER",
  "batchId": 1
}
```

- Notes:
  - `batchId` is optional.
  - `batchId` is relevant for student users.

### `GET /api/users`

- Access: `Permit All`
- Description: Get paginated users.
- Query params:
  - `role` optional
  - `batchId` optional
  - Spring pageable params such as `page`, `size`, `sort`

### `GET /api/users/{id}`

- Access: `Permit All`
- Description: Get one user by id.

### `PUT /api/users/{id}`

- Access: `Permit All`
- Description: Update user fields.
- Request body:

```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "STUDENT",
  "batchId": 2
}
```

### `DELETE /api/users/{id}`

- Access: `Permit All`
- Description: Delete a user and linked student or teacher record if present.

### `PUT /api/users/{id}/password`

- Access: `Permit All`
- Description: Reset the password for a user.
- Request body:

```json
{
  "newPassword": "newStrongPassword"
}
```

## Batch API

### `GET /api/batches`

- Access: `Auth Required`
- Description: Get all batches.

### `POST /api/batches`

- Access: `Auth Required`
- Description: Create a new batch.
- Request body:

```json
{
  "name": "CSE 2026",
  "year": 2026,
  "startDate": "2026-01-10"
}
```

### `GET /api/batches/{id}`

- Access: `Auth Required`
- Description: Get one batch by id.

### `PUT /api/batches/{id}`

- Access: `Auth Required`
- Description: Update a batch.
- Request body:

```json
{
  "name": "CSE 2026 Updated",
  "year": 2027
}
```

### `DELETE /api/batches/{id}`

- Access: `Auth Required`
- Description: Delete a batch.

## Section API

### `GET /api/sections`

- Access: `Auth Required`
- Description: Get paginated sections.
- Query params:
  - `batchId` optional
  - `teacherId` optional
  - pageable params supported

### `POST /api/sections`

- Access: `Auth Required`
- Description: Create a section and assign it to a batch and teacher.
- Request body:

```json
{
  "name": "Section A",
  "batchId": 1,
  "teacherId": 5
}
```

### `GET /api/sections/{id}`

- Access: `Auth Required`
- Description: Get section details by id.

### `PUT /api/sections/{id}`

- Access: `Auth Required`
- Description: Update section name or teacher.
- Request body:

```json
{
  "name": "Section B",
  "teacherId": 6
}
```

### `DELETE /api/sections/{id}`

- Access: `Auth Required`
- Description: Delete a section.

### `GET /api/sections/{id}/students`

- Access: `Auth Required`
- Description: Get all students enrolled in a section.

### `POST /api/sections/{id}/students/{studentId}`

- Access: `Auth Required`
- Description: Enroll a student into a section.

### `DELETE /api/sections/{id}/students/{studentId}`

- Access: `Auth Required`
- Description: Remove a student from a section.

## Assignment API

### `GET /api/assignments`

- Access: `Auth Required`
- Description: Get paginated assignments.
- Query params:
  - `status` optional
  - `sectionId` optional
  - pageable params supported

### `POST /api/assignments`

- Access: `Auth Required`
- Description: Create an assignment and attach it to one or more sections.
- Request body:

```json
{
  "title": "Loops Practice",
  "description": "Solve the loop problems",
  "starterCode": "public class Main {}",
  "languageId": 1,
  "sectionIds": [1, 2],
  "dueDate": "2026-03-25T23:59:00",
  "maxScore": 100
}
```

### `GET /api/assignments/{id}`

- Access: `Auth Required`
- Description: Get one assignment by id.

### `PUT /api/assignments/{id}`

- Access: `Auth Required`
- Description: Update assignment fields.
- Request body:

```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "starterCode": "public class Main {}",
  "dueDate": "2026-03-30T23:59:00",
  "maxScore": 120
}
```

### `DELETE /api/assignments/{id}`

- Access: `Auth Required`
- Description: Delete an assignment.

### `PUT /api/assignments/{id}/publish`

- Access: `Auth Required`
- Description: Mark an assignment as published.

### `GET /api/assignments/student`

- Access: `Auth Required`
- Description: Get assignments for the currently authenticated student, including status.

### `POST /api/assignments/{id}/sections/{sectionId}`

- Access: `Auth Required`
- Description: Assign an existing assignment to a section.

### `DELETE /api/assignments/{id}/sections/{sectionId}`

- Access: `Auth Required`
- Description: Unassign an assignment from a section.

### `GET /api/assignments/{id}/submissions`

- Access: `Auth Required`
- Description: Get all submissions for a given assignment.

## Submission API

### `GET /api/submissions`

- Access: `Auth Required`
- Description: Get paginated submissions.
- Query params:
  - `assignmentId` optional
  - `status` optional
  - `sectionId` optional
  - pageable params supported

### `POST /api/submissions`

- Access: `Auth Required`
- Description: Create a submission for an assignment.
- Request body:

```json
{
  "assignmentId": 1,
  "code": "print('hello')",
  "languageId": 1
}
```

### `POST /api/submissions/run`

- Access: `Auth Required`
- Description: Run code without grading and return execution output.
- Request body:

```json
{
  "code": "print('hello')",
  "languageId": 1,
  "stdin": ""
}
```

### `GET /api/submissions/{id}`

- Access: `Auth Required`
- Description: Get one submission by id.

### `PUT /api/submissions/{id}/grade`

- Access: `Auth Required`
- Description: Grade a submission.
- Request body:

```json
{
  "score": 95,
  "feedback": "Good work"
}
```

### `GET /api/submissions/my`

- Access: `Auth Required`
- Description: Get submissions for the currently authenticated user.

## Language API

### `GET /api/languages`

- Access: `Auth Required`
- Description: Get all programming languages.

### `POST /api/languages`

- Access: `Auth Required`
- Description: Create a programming language entry.
- Request body:

```json
{
  "name": "Java",
  "version": "17",
  "extension": ".java",
  "active": true,
  "icon": "java.svg"
}
```

### `GET /api/languages/{id}`

- Access: `Auth Required`
- Description: Get one language by id.

### `PUT /api/languages/{id}`

- Access: `Auth Required`
- Description: Update language fields.
- Request body:

```json
{
  "version": "21",
  "active": true,
  "icon": "java-new.svg"
}
```

### `DELETE /api/languages/{id}`

- Access: `Auth Required`
- Description: Delete a language.

## Analytics API

### `GET /api/analytics/admin`

- Access: `Auth Required`
- Description: Get admin dashboard analytics.

### `GET /api/analytics/teacher`

- Access: `Auth Required`
- Description: Get teacher analytics.
- Query params:
  - `sectionId` optional

### `GET /api/analytics/student`

- Access: `Auth Required`
- Description: Get student analytics for the current user.

### `GET /api/analytics/sections/{sectionId}`

- Access: `Auth Required`
- Description: Get analytics for a specific section.

## Response and Validation Notes

- Validation errors return `400 Bad Request`.
- Missing entities usually return `404 Not Found` when the thrown message contains `not found`.
- Authentication failures generally return `401` or `403` depending on where the request is rejected.
- Common pageable query params:

```text
page=0
size=20
sort=id,desc
```
