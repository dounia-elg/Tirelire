# Tirelire

Lightweight tontine / KYC backend (Node + Express + MongoDB). This repo contains: auth, groups, contributions, KYC upload (encrypted), a pluggable face-compare adapter, admin KYC review, and tests.

## Quick start

1. Install dependencies (Node 18+ recommended):

```powershell
npm ci
```

2. Environment variables (create a `.env` with these as needed):

- `MONGO_URI` - MongoDB connection string (default: `mongodb://127.0.0.1:27017/tirelire`)
- `JWT_SECRET` - JWT secret
- `FILE_ENCRYPTION_KEY` - Key used to encrypt uploaded ID images (optional; falls back to `JWT_SECRET`)
- `STRIPE_SECRET_KEY` - (optional) for real Stripe payments
- `FACE_MODELS_PATH` - path where face-api.js models will be stored (default `./models/face`)

3. (Optional) Provision face-api.js models for real face comparisons:

```powershell
npm run download-models
# Optionally set FACE_MODELS_PATH and/or FACE_MODELS_DOWNLOAD_BASE if you need custom locations
```

To use real face matching, install native deps:

```powershell
npm install @tensorflow/tfjs-node canvas
```

Note: the project includes a permissive fallback adapter so tests and development work without these heavy binaries. For production-grade verification, install the native dependencies and download model files.

4. Run server:

```powershell
npm start
```

5. Run tests (Jest):

```powershell
npm test
```

## KYC endpoints

- `POST /api/kyc/upload` (authenticated) — multipart form: `idImage` (file), `idNumber` (field). ID image is encrypted at rest.
- `POST /api/kyc/verify-face` (authenticated) — accept optional `selfie` file to perform automated comparison against stored ID image. If no selfie provided, legacy path marks face verified (keeps tests stable).
- `POST /api/kyc/review/:userId` (admin) — approve or reject KYC submissions with optional note.
- `GET /api/kyc/pending` (admin) — list pending KYC submissions.
- `GET /api/kyc/history/:userId` — returns KYC audit history for a user (owner or admin).

KYC submissions append events to `user.kycHistory` for auditability.

## Face model provisioning

The included script `src/scripts/download-face-models.js` downloads weights from a public repo into `./models/face` by default. This is optional — the face-compare adapter will fall back if models or native libs are missing.

## CI and coverage

- A GitHub Actions workflow is provided at `.github/workflows/ci.yml` that runs `npm test` on push/pull requests.
- Jest is configured to collect coverage and enforce `80%` thresholds. CI will fail if coverage is below these settings.

![Codecov](https://img.shields.io/badge/coverage-codecov-blue)

To upload coverage reports to Codecov, add the repository secret `CODECOV_TOKEN` (if required) and the CI will publish coverage automatically. The workflow uses `codecov/codecov-action`.

## Production considerations

- Encrypted ID images are stored locally by default (in `uploads/ids`). For production, move these to secure object storage (S3/GCS) and use server-side KMS to manage keys.
- Replace the permissive face-compare fallback with a managed verification provider (AWS Rekognition, Azure Face API) if regulatory-grade verification is required.
- Add audit log retention policies and export features for compliance.

## Next recommended steps

- Add a small admin UI or API consumer to review pending KYC submissions and view `kycHistory`.
- Add Codecov or similar to CI to surface coverage trends and badge.
- Harden file storage for production and add key rotation.

If you'd like, I can implement any of the above next (CI coverage upload, admin UI endpoints, or S3-backed encrypted storage).
# Tirelire — Group Savings API

Tirelire is an API for managing group savings (rotating savings). It includes user registration, group creation, payment processing (Stripe), KYC (basic flow), notification/reminders, and admin features.

This README covers how to run the project locally, run with Docker, test endpoints with Postman, and notes about KYC/face-verification.

## Quick start (local)

1. Copy environment variables

- Create a `.env` file in the project root with the required variables (example below):

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/tirelire
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_test_...
```

2. Install dependencies

```bash
npm install
```

3. Start the app

```bash
npm start
```

Your API will be available at `http://localhost:5000`.

## Docker (recommended for easy setup)

1. Build and start with Docker Compose

```bash
docker compose up --build
```

This will run the Node app and a MongoDB container. The app will be available at `http://localhost:5000`.

## API Endpoints (high level)

- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login and get JWT
- `POST /api/groups` — Create a group (authenticated)
- `GET /api/groups` — List groups (authenticated, admin)
- `POST /api/contributions` — Create payment (Stripe) (authenticated)
- `GET /api/contributions/history` — Fetch user's payment history (authenticated)
- `GET /api/notifications` — Fetch user's notifications (authenticated)
- `PATCH /api/notifications/:id/read` — Mark notification as read (authenticated)
- `POST /api/kyc/upload` — Upload ID number (authenticated)
- `GET /api/kyc/status` — Get KYC status (authenticated)
- `POST /api/kyc/verify-face` — Verify face (placeholder endpoint)


## Testing with Postman

- Use the `Register` endpoint, then `Login` to get a JWT token.
- Include header `Authorization: Bearer <TOKEN>` for protected routes.
- Example: Create payment
  - POST `/api/contributions` with JSON body `{ "amount": 100, "currency": "mad" }`.
  - Response includes `clientSecret` and `paymentId`.

## KYC & Face Verification

Current status:
- The API accepts `idNumber` at `/api/kyc/upload` and stores it on the user.
- `verify-face` endpoint currently marks the user as verified but does not perform real face matching.

Planned automatic verification (future):
- Use `face-api.js` or a cloud LLM/vision API to compare the ID card image with a selfie.
- Due to environment/build limitations on the developer machine (Node version, native build tools), `face-api.js` wasn't installed here. The code is prepared to integrate it later.

## Notes & TODOs

- Add secure storage/encryption for uploaded ID images.
- Implement real face verification using `face-api.js` or a secure cloud service.
- Add tests and coverage.

---


