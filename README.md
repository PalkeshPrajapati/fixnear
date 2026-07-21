# FixNear — Local Service Provider Directory

> A modern local service directory application connecting users with trusted service providers (electricians, plumbers, carpenters, painters, and more).

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
| **React** | React 19 + React Compiler (`babel-plugin-react-compiler`) |

---

## 2. Folder Structure

```
fixnear/
├── prisma/
│   ├── schema.prisma               # Database models and relations
│   └── migrations/                 # Database migration history
├── scripts/                        # Utility scripts (e.g. planned ingest.ts for RAG)
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (Navbar + main + Footer)
│   │   ├── page.tsx                # Landing page "/"
│   │   ├── globals.css             # Design tokens + shared CSS utility classes
│   │   ├── auth/
│   │   │   ├── layout.tsx          # Auth layout (redirects if authenticated)
│   │   │   ├── sign-in/page.tsx    # Sign-in page
│   │   │   └── sign-up/page.tsx    # Sign-up page
│   │   ├── dashboard/
│   │   │   ├── page.tsx            # Protected dashboard (server component)
│   │   │   └── actions.ts          # becomeProvider server action
│   │   ├── providers/
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Provider detail page
│   │   │       └── actions.ts      # submitReview server action
│   │   ├── services/
│   │   │   └── [category]/
│   │   │       └── page.tsx        # Providers list by category
│   │   └── api/
│   │       └── auth/
│   │           └── [...all]/route.ts # Better Auth catch-all route handler
│   ├── components/
│   │   ├── Navbar.tsx              # Auth-aware sticky navbar ("use client")
│   │   ├── Footer.tsx              # Static footer component
│   │   ├── CategoryCard.tsx        # Category display card
│   │   ├── CategorySearch.tsx      # Live search + filtered categories ("use client")
│   │   ├── dashboard/
│   │   │   └── BecomeProviderForm.tsx # Provider registration form ("use client")
│   │   ├── providers/
│   │   │   └── ReviewForm.tsx      # Star rating + review submission ("use client")
│   │   └── ui/
│   │       └── Button.tsx          # Reusable button component
│   ├── lib/
│   │   ├── auth.ts                 # Better Auth server instance
│   │   ├── auth-client.ts          # Better Auth React client
│   │   ├── prisma.ts               # Prisma singleton instance
│   │   └── session.ts              # Server-side getSession helper
│   └── generated/
│       └── prisma/                 # Generated Prisma client
```

---

## 3. Database Schema Overview

The application utilizes PostgreSQL managed by Prisma ORM. Key models include:

- **User**: System user account (role: `USER | PROVIDER | ADMIN`).
- **Session / Account / Verification**: Auth management tables managed by Better Auth.
- **Provider**: Profile details for service providers (1:1 with User, linked to multiple Categories).
- **Category**: Service categories (e.g. Electrician, Plumber, Painter).
- **Review**: Star ratings (1–5) and feedback comments given by Users to Providers.

### Key Relationships
- `User` ↔ `Provider`: 1:1 relationship created when a user registers as a provider.
- `Provider` ↔ `Category`: Many-to-many relationship.
- `User` → `Review` & `Provider` → `Review`: 1:Many relationships.

---

## 4. Environment Setup

Create a `.env` file in the root directory:

```env
DATABASE_URL=             # Neon PostgreSQL connection string
RESEND_API_KEY=           # Resend API key for sending verification emails
NEXT_PUBLIC_APP_URL=      # e.g. http://localhost:3000
BETTER_AUTH_SECRET=       # Secret key for Better Auth session signing
```

---

## 5. Development Workflow

### Installation & Client Generation

```bash
npm install
npx prisma generate
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Architecture & Implementation Highlights

1. **Authentication & Session Handling**:
   - Server components access session state via `@/lib/session` helper (`getSession()`).
   - Email verification is required (`requireEmailVerification: true`).
   - Sign-in state dynamically toggles Navbar actions (`authClient.useSession()`).

2. **Data Fetching & Server Actions**:
   - Server components fetch data directly from Prisma.
   - Mutations (e.g. `becomeProvider`, `submitReview`) utilize React 19 `useActionState` and Server Actions with `revalidatePath()`.

3. **Styling & Design System**:
   - Custom design system defined using CSS variables in `src/app/globals.css`.
   - Responsive layouts powered by Tailwind CSS v4.

---

<!-- ## 7. Upcoming Roadmap

- **Admin Panel**: Manage categories, verify service providers, and manage platform reviews.
- **Provider Profile Management**: Allow providers to update bio, phone, location, and service categories.
- **Booking & Inquiry Workflow**: Direct contact and appointment scheduling feature.
- **RAG Chatbot Assistant**: Vector search integration using `pgvector` on Neon DB and Gemini API via Vercel AI SDK for intelligent service recommendation. -->
