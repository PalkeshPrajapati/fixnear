# FixNear — Local Service Provider Directory

> A modern local service directory application connecting users with trusted service providers (electricians, plumbers, carpenters, painters, and more) with integrated booking management and an AI-powered assistant.

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.2.10 (App Router, React Server Components) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 (`@import "tailwindcss"` syntax, tokenized via `globals.css`) |
| **ORM** | Prisma 7 (generator: `"prisma-client"`, output: `src/generated/prisma`) |
| **Database** | PostgreSQL via Neon (serverless), driver: `@prisma/adapter-pg` (PrismaPg) |
| **Auth** | Better Auth v1 (email/password, mandatory email verification) |
| **Email** | Resend (verification emails) |
| **AI & Vector Search** | Google Generative AI (Gemini), Vercel AI SDK, pgvector (`documents` table) |
| **React** | React 19 + React Compiler (`babel-plugin-react-compiler`) |

---

## 2. Key Features

- **Service Directory & Live Search**: Browse categories (Electrician, Plumber, Painter, etc.) and search services in real-time.
- **Provider Profiles**: Verified status badges, star rating aggregates, service categories, contact details, bio, and customer reviews.
- **Booking System**:
  - **Request a Booking**: Logged-in users can schedule appointments directly on the provider's profile by selecting a preferred date and detailing the required service.
  - **Provider Approval / Denial**: Service providers receive incoming booking requests in their dashboard and can **Approve** or **Deny** them with immediate status updates.
  - **Booking Tracking**: Users can monitor all requested bookings and view their current status (`Pending`, `Approved`, `Denied`) in their personal dashboard.
- **Reviews & Ratings**: Customers can write reviews and submit 1–5 star ratings for service providers.
- **Provider Onboarding**: Users can register as service providers directly from the dashboard and configure categories, experience, and service locations.
- **AI Chat Assistant**: Integrated floating chat widget powered by Google Gemini and vector retrieval (RAG) for instant FAQs and local service assistance.

---

## 3. Folder Structure

```
fixnear/
├── prisma/
│   ├── schema.prisma                  # Database models and relations
│   └── migrations/                    # Database migration history
├── scripts/
│   └── ingest-static.ts               # Ingestion script for static FAQs into pgvector
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout (Navbar + main + Footer + ChatWidget)
│   │   ├── page.tsx                   # Landing page "/"
│   │   ├── globals.css                # Design tokens + shared CSS utility classes
│   │   ├── actions/
│   │   │   └── booking.ts             # createBooking & updateBookingStatus server actions
│   │   ├── auth/
│   │   │   ├── layout.tsx             # Auth layout (redirects if authenticated)
│   │   │   ├── sign-in/page.tsx       # Sign-in page
│   │   │   └── sign-up/page.tsx       # Sign-up page
│   │   ├── dashboard/
│   │   │   ├── page.tsx               # Protected dashboard (profile, bookings & reviews)
│   │   │   └── actions.ts             # becomeProvider server action
│   │   ├── providers/
│   │   │   └── [id]/
│   │   │       ├── page.tsx           # Provider detail page (profile, booking & reviews)
│   │   │       └── actions.ts         # submitReview server action
│   │   ├── services/
│   │   │   └── [category]/
│   │   │       └── page.tsx           # Providers list by category
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...all]/route.ts  # Better Auth catch-all route handler
│   │       └── chat/
│   │           └── route.ts           # AI chatbot endpoint with vector RAG retrieval
│   ├── components/
│   │   ├── Navbar.tsx                 # Auth-aware sticky navbar ("use client")
│   │   ├── Footer.tsx                 # Static footer component
│   │   ├── CategoryCard.tsx           # Category display card
│   │   ├── CategorySearch.tsx         # Live search + filtered categories ("use client")
│   │   ├── ChatWidget.tsx             # Floating Gemini AI chat widget ("use client")
│   │   ├── dashboard/
│   │   │   ├── BecomeProviderForm.tsx # Provider registration form ("use client")
│   │   │   └── BookingStatusButtons.tsx # Approve / Deny action buttons ("use client")
│   │   ├── providers/
│   │   │   ├── BookingForm.tsx        # Booking request form ("use client")
│   │   │   └── ReviewForm.tsx         # Star rating + review submission ("use client")
│   │   └── ui/
│   │       └── Button.tsx             # Reusable button component
│   ├── lib/
│   │   ├── auth.ts                    # Better Auth server instance
│   │   ├── auth-client.ts             # Better Auth React client
│   │   ├── prisma.ts                  # Prisma singleton instance
│   │   └── knowledge/                 # Static FAQs knowledge base
│   └── generated/
│       └── prisma/                    # Generated Prisma client
```

---

## 4. Database Schema Overview

The application utilizes PostgreSQL managed by Prisma ORM. Key models include:

- **User**: System user account (role: `USER | PROVIDER | ADMIN`).
- **Session / Account / Verification**: Auth management tables managed by Better Auth.
- **Provider**: Profile details for service providers (1:1 with User, linked to multiple Categories).
- **Category**: Service categories (e.g. Electrician, Plumber, Painter).
- **Booking**: Appointments requested by users for a provider with date, notes, and status (`PENDING | APPROVED | DENIED`).
- **Review**: Star ratings (1–5) and feedback comments given by Users to Providers.

### Key Relationships
- `User` ↔ `Provider`: 1:1 relationship created when a user registers as a provider.
- `Provider` ↔ `Category`: Many-to-many relationship.
- `User` → `Booking` & `Provider` → `Booking`: 1:Many relationships.
- `User` → `Review` & `Provider` → `Review`: 1:Many relationships.

---

## 5. Environment Setup

Create a `.env` file in the root directory:

```env
BETTER_AUTH_SECRET=       # Secret key for Better Auth session signing
BETTER_AUTH_URL=          # e.g. http://localhost:3000
DATABASE_URL=             # PostgreSQL connection string
NEXT_PUBLIC_APP_URL=      # e.g. http://localhost:3000
RESEND_API_KEY=           # Resend API key for verification emails
GEMINI_API_KEY=           # Google Gemini API key for AI chat and embeddings
```

---

## 6. Development Workflow

### Installation & Client Generation

```bash
npm install
npx prisma generate
```

### Database Sync

```bash
npx prisma db push
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 7. Architecture & Implementation Highlights

1. **Authentication & Session Handling**:
   - Server components access session state via Better Auth (`auth.api.getSession({ headers: await headers() })`).
   - Email verification is required (`requireEmailVerification: true`).
   - Sign-in state dynamically toggles Navbar actions (`authClient.useSession()`).

2. **Booking Workflow**:
   - **Submission**: Users schedule appointments using `createBooking`, which prevents self-booking, validates inputs, and records a `PENDING` booking.
   - **Provider Actions**: Providers approve or deny bookings via `updateBookingStatus`, protected by provider ownership checks and React 19 transitions for smooth UI updates.
   - **Dashboard Aggregates**: The dashboard provides separate sections for incoming provider requests and client bookings.

3. **Data Fetching & Server Actions**:
   - Server components fetch data directly using Prisma.
   - Mutations (e.g. `becomeProvider`, `submitReview`, `createBooking`, `updateBookingStatus`) utilize React 19 `useActionState` / `useTransition` and Server Actions with `revalidatePath()`.

4. **Styling & Design System**:
   - Custom design system defined using CSS tokens in `src/app/globals.css`.
   - Responsive layouts powered by Tailwind CSS v4.
