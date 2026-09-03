# FRAGREA — Haute Parfumerie & Luxury Fragrance House

> *"Distinct compositions, created with depth, character and presence."*

Fragrea is a modern luxury haute parfumerie e-commerce platform built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and Prisma ORM.

---

## Brand Architecture & Customer Journey

1. **Editorial Homepage (`/`)**:
   - Full-screen cinematic hero with warm amber illumination.
   - The Signature Collection (9 extrait de parfum masterworks loaded dynamically from database).
   - The House of Fragrea heritage & Grasse cold-maceration philosophy.
   - Interactive 4-category Fragrance Discovery explorer.
   - Editorial fragrance feature (ABRAR).
   - Reassurance standard (Reliable Delivery, Simple Returns, Safe & Secure Payment, Order Tracking).
   - Refined navigation with official FRAGREA geometric insignia and PERFUMES signature.
2. **Fragrance Catalogue (`/shop`)**:
   - Complete extraits collection with real-time olfactory family filters and stock status.
3. **Core Anthologies (`/collections`)**:
   - The Nocturne Series, Private Reserve, and L'Or d'Orient.
4. **Patron Experience (`/account`, `/cart`, `/checkout`, `/orders`)**:
   - Slide-in shopping bag drawer.
   - Streamlined 4-step checkout.
   - Dedicated order confirmation and 5-step visual tracking timeline.
5. **Private Maison Admin (`/admin`)**:
   - Protected order management, inventory control, and customer analytics.

---

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components & Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database & ORM**: [Prisma](https://www.prisma.io/) with SQLite
- **Icons**: [Lucide React](https://lucide.dev/)
- **Typography**: Cormorant Garamond (editorial luxury serif) & Montserrat (modern geometric sans)

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Seed
```bash
npx prisma generate
npm run seed
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to explore the Fragrea experience.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## License

All rights reserved &copy; Fragrea Perfumes.
