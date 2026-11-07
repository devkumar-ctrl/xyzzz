# Dumka Academy Desk

A working sports-academy desk for **coaches, players, and scouts**. Track attendance, record matches, and decide who is ready for a trial — all backed by MongoDB.

- **Live demo:** _pending Vercel deployment_
- **Repository:** `vibe-coding-challenge-2-0-okk`

## What it does

| Role | What they can do |
| --- | --- |
| **Coach** | Add players, open sessions, mark attendance, lock sessions, record match scores, view the readiness board, and load sample data. |
| **Player** | See only their own attendance, match history, and trial readiness. |
| **Scout** | See only the players who are ready for a trial. |

Every role is redirected to its own area. A player cannot open coach or scout pages, a scout cannot open coach or player pages, and signed-out visitors are sent to `/login`.

## Readiness rule

- Only **closed sessions** count toward attendance.
- Attendance % = sessions present ÷ closed sessions that include the player.
- **Ready for trial** = at least **75%** attendance **and** at least **2 recorded matches**.

The sample data is designed to show the edge cases:

| Player | Attendance | Matches | Result |
| --- | --- | --- | --- |
| Aarav Kumar | 75% (3/4) | 2 | Ready for trial |
| Bhavna Singh | 50% (2/4) | 2 | Not ready — attendance below 75% |
| Chirag Mahto | 75% (3/4) | 1 | Not ready — needs 2 matches |

## Match sheet rule

Only players marked **present in a session on the same date and sport** appear on the match sheet. The server checks this again on submit and refuses an absent player, even if a crafted request includes them. A match score therefore cannot exist for someone who was absent that day.

## Demo accounts

The coach and scout accounts are created automatically the first time `/login` is opened.

| Role | Username | Password |
| --- | --- | --- |
| Coach | `coach` | `coach123` |
| Scout | `scout` | `scout123` |
| Player | `aarav.kumar` | `player123` |
| Player | `bhavna.singh` | `player123` |
| Player | `chirag.mahto` | `player123` |

The three player accounts appear after clicking **Load sample academy** on the coach dashboard. Players added by the coach get a generated `firstname.lastname` username and the default password `player123`; the coach sees the credentials after adding them.

## Tech stack

- Next.js 16 (App Router, Server Actions, dynamic cookie-backed pages)
- React 19
- MongoDB (official driver) with unique indexes
- Tailwind CSS 4
- lucide-react
- HMAC-SHA256 signed, httpOnly session cookies and scrypt password hashing

## Local setup

```bash
npm install
cp .env.example .env.local
# edit .env.local with your MongoDB Atlas URI and a random AUTH_SECRET
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login).

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string. |
| `MONGODB_DB` | No | Database name. Defaults to `dumka_academy`. |
| `AUTH_SECRET` | Yes in production | Secret used to sign session cookies. Use a long random value. |

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Never commit `.env.local`. Only `.env.example` belongs in the repository.

## Scripts

```bash
npm run dev    # development server
npm run lint   # ESLint
npm run build  # production build
npm start      # production server
```

## Deploying to Vercel

1. Push this repository as `vibe-coding-challenge-2-0-okk`.
2. Import it into Vercel.
3. Add `MONGODB_URI`, `MONGODB_DB`, and `AUTH_SECRET` in the Vercel project settings.
4. In MongoDB Atlas, allow the deployment to connect. For a challenge demo, `0.0.0.0/0` is the simplest network-access rule; restrict it for real deployments.
5. Deploy and update the **Live demo** link at the top of this README.

## Acceptance checks

- [x] Absent players are excluded from that day's match sheet and refused by the server.
- [x] Readiness percentages are computed from closed sessions; 75% + 2 matches is marked ready.
- [x] Scout sees only ready players; a player sees only their own record.
- [x] Data persists across reloads and logins.
- [x] Each role is blocked from the other roles' pages.
- [x] Empty states, form validation, and a one-click sample-data path are included.

## Notes

- The sample-data button only loads into an empty academy, so it cannot duplicate players.
- Change the demo passwords and `AUTH_SECRET` before using real academy data.
- Session cookies are httpOnly, SameSite=Lax, signed with HMAC-SHA256, and expire after 7 days.
