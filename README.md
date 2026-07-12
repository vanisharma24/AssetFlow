<div align="center">

# 🗂️ AssetFlow

### Enterprise Asset Management & Resource Booking Platform

Track every asset. Book every resource. Automate every workflow.

<img src="docs/screenshots/image.png" width="900">


[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-API-green?logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org/)

</div>

---

## 📖 Overview

**AssetFlow** is a full-stack Enterprise Resource Planning (ERP) platform that centralizes
asset tracking, resource booking, maintenance workflows, and audit management into one
intelligent system. It replaces spreadsheets and manual approvals with structured,
conflict-free workflows — giving organizations complete visibility over every physical
asset from registration to retirement.

Built for the **Odoo Hiring Hackathon** with the same rigor as a real production ERP.

---

## ✨ Features

- **Asset Lifecycle Management** — Register, track, and retire assets with complete ownership history across 7 lifecycle states.
- **Smart Allocation & Transfers** — Assign assets to employees or departments through structured approval chains, with automatic duplicate-allocation prevention.
- **Resource Booking** — Reserve meeting rooms, vehicles, and shared equipment with conflict-free calendar scheduling.
- **Maintenance Workflows** — Raise, approve, assign, and resolve maintenance requests with full audit history.
- **Scheduled Audits** — Run audit cycles that surface discrepancies and keep inventory records clean.
- **Role-Based Access Control** — Separate permissions for Admin, Asset Manager, Department Head, and Employee.
- **Real-Time Dashboard** — Role-specific KPIs, pending approvals, upcoming bookings, and operational insights.
- **Notifications & Activity Logs** — Every significant action emits a notification and lands in an immutable activity trail.

---

## 🛠️ Built With

**Frontend**
- [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/) · [Recharts](https://recharts.org/) · [lucide-react](https://lucide.dev/)

**Backend**
- [Express](https://expressjs.com/) + TypeScript
- [Prisma ORM](https://www.prisma.io/) with the PostgreSQL adapter
- [PostgreSQL](https://www.postgresql.org/)
- JWT authentication with bcrypt password hashing

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Docker (for PostgreSQL) or a local PostgreSQL 16 instance

### 1. Clone the repository
```bash
git clone https://github.com/vanisharma24/Odoo-Hackathon.git
cd Odoo-Hackathon
```

### 2. Start PostgreSQL
```bash
docker run -d --name assetflow-pg \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=assetflow \
  -p 5432:5432 postgres:16
```

### 3. Configure environment
Create `.env.local` in the **project root**:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/assetflow?schema=public"
PORT=5000
```

### 4. Run the backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npx tsx src/seed.ts   # seeds demo data + accounts
npm run dev           # → http://localhost:5000
```

### 5. Run the frontend
```bash
cd frontend
npm install
npm run dev           # → http://localhost:3000
```

---

## 📁 Project Structure

```
Odoo-Hackathon/
├── frontend/          # Next.js 16 app (App Router)
│   ├── app/           # routes: landing, login, signup, dashboard, assets, bookings…
│   └── components/    # shared UI
├── backend/           # Express + Prisma API
│   ├── src/
│   │   ├── routes/    # auth, assets, allocations, bookings, maintenances…
│   │   ├── controllers/
│   │   └── seed.ts
│   └── prisma/schema.prisma
└── .env.local         # DATABASE_URL (not committed)
```

---

## 🗺️ Roadmap

- [ ] Email notifications for overdue returns and pending approvals
- [ ] Exportable PDF/CSV audit reports
- [ ] QR-code asset tagging and mobile scanning
- [ ] Multi-tenant / super-admin platform controls

---

## 🤝 Contributing

Contributions are welcome! To fix a bug or add a feature:

1. Fork the repo
2. Create a branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 👥 Team

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/vanisharma24">
        <img src="https://github.com/vanisharma24.png" width="100" alt="Vani Sharma"/><br/>
        <sub><b>Vani Sharma</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/arushii09">
        <img src="https://github.com/arushii09.png" width="100" alt="Arushi"/><br/>
        <sub><b>Arushi</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/wrotecode">
        <img src="https://github.com/wrotecode.png" width="100" alt="Pallavi"/><br/>
        <sub><b>Pallavi</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/deeptanshusingh2">
        <img src="https://github.com/deeptanshusingh2.png" width="100" alt="Deeptanshu Kumar"/><br/>
        <sub><b>Deeptanshu Kumar</b></sub>
      </a>
    </td>
  </tr>
</table>

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.

<div align="center">
Built with 💚 for the Odoo Hiring Hackathon · 2026
</div>
