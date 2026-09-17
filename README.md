# BookMyShow Replica

A full-stack web application that reproduces the core ticket-booking flow of the
BookMyShow cinema ticketing experience. A moviegoer logs in with a mobile number
and a one-time password (OTP), browses the currently showing movies, picks a
theatre, selects seats, pays with a dummy Card or UPI payment, and receives a
booking confirmation with their ticket details.

The product is self-contained: it ships with a seeded catalog of three movies and
three theatres, a hardcoded OTP, and a simulated payment gateway, so the entire
browse-to-booked journey can be demonstrated end to end without any external
service.

## Tech stack

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS, React Context
  for client state.
- **Backend**: Node.js + Express + TypeScript REST API.
- **Database**: SQLite via `better-sqlite3` (file-backed, embedded, pre-seeded on
  startup).

## The booking journey

1. **Login** — enter any 10-digit mobile number, then the OTP `1234`.
2. **Movies** — browse the seeded catalog (Paradise, Bloody Romeo, OG2), served
   from the backend database.
3. **Theatres** — pick a theatre (Sandhya 70mm, Sudharsham 70mm, Allu Cinemas).
4. **Seats** — click "Select Seats" to select the hardcoded set A1, A2, A3
   (Rs. 450).
5. **Payment** — choose Card or UPI, enter dummy details, and click Pay. A
   "Processing Payment..." state lasts exactly 2 seconds.
6. **Success** — "Congratulations!" with the booked movie, theatre, seats, and a
   booking confirmation ID persisted in the database.

## Demo credentials

- **Mobile number**: any 10-digit number (e.g. `9876543210`)
- **OTP**: `1234` (hardcoded)

## Running locally (development)

### Backend

```bash
cd backend
npm install
npm run dev        # starts on http://localhost:8000
```

The backend seeds the SQLite database (movies + theatres) automatically on
startup. Health check: `GET http://localhost:8000/api/health`.

### Frontend

```bash
cd frontend
npm install
npm run dev        # starts on http://localhost:3000
```

The Next.js dev server proxies `/api/*` to the backend at `http://localhost:8000`
(configured in `frontend/next.config.js`), so the browser client stays
same-origin.

Open `http://localhost:3000` and click "Book tickets".

## API reference

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Liveness probe |
| POST | `/api/auth/login` | Begin login with a mobile number |
| POST | `/api/auth/verify` | Verify the OTP, returns a session token (JWT) |
| GET | `/api/movies` | List the movie catalog |
| GET | `/api/theatres` | List all theatres |
| GET | `/api/movies/:id/theatres` | List theatres showing a movie |
| POST | `/api/bookings` | Create a booking (requires `Authorization: Bearer <token>`) |

## Running with Docker Compose

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

The frontend service proxies `/api` to the `backend` service over the compose
network.

## Tests

```bash
# Backend unit + API + integration tests (vitest + supertest, real SQLite)
cd backend && npm test

# Frontend component tests (vitest + testing-library)
cd frontend && npm test

# E2E tests (Playwright, starts both servers automatically)
cd frontend && npm run e2e
```

## Environment variables

Each tier has its own `.env.example`:

- `backend/.env.example` — `PORT`, `CORS_ORIGIN`, `JWT_SECRET`, `DATABASE_PATH`,
  `NODE_ENV`.
- `frontend/.env.example` — `NEXT_PUBLIC_API_URL` (leave empty for same-origin).

## License

Private and proprietary. All rights reserved.
