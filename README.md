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


