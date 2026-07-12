<p align="center">

# 🚀 AssetFlow

### Smart Asset Lifecycle Management Platform

Track • Allocate • Maintain • Audit • Analyze

Built for the Odoo Hackathon 2026

</p>

---

<p align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-blue?style=for-the-badge&logo=docker)
![Odoo](https://img.shields.io/badge/Odoo-purple?style=for-the-badge&logo=odoo)

</p>

---

## 📖 Overview

AssetFlow is an enterprise-grade Asset Management Platform that enables organizations to manage the complete lifecycle of physical assets—from procurement to retirement.

The platform provides:

- 📦 Asset Inventory
- 👥 Employee Allocation
- 📅 Shared Resource Booking
- 🔧 Maintenance Workflow
- 🔁 Asset Transfers
- 📊 Analytics Dashboard
- 📑 Audit Logs
- 🔔 Smart Notifications

Designed with scalability, automation, and transparency in mind.

---

# 🎥 Demo

> Demo Video

Coming Soon

---

# ✨ Features

## 👨‍💼 Super Admin

- Organization Management
- Department Management
- Employee Management
- Asset Categories
- Analytics Dashboard
- System Audit Logs

---

## 🏢 Department Head

- Approve Asset Requests
- View Department Assets
- Track Employees
- Department Reports

---

## 📦 Asset Manager

- Register Assets
- Asset Allocation
- Asset Transfers
- Asset Retirement
- QR Code Generation
- Maintenance Approval

---

## 👤 Employee

- View Assigned Assets
- Raise Maintenance Request
- Book Shared Assets
- View Booking Calendar
- Transfer Request

---

# 📸 Screenshots

## Dashboard

![Dashboard](screenshots/dashboard.png)

---

## Asset Inventory

![Inventory](screenshots/assets.png)

---

## Booking Calendar

![Calendar](screenshots/calendar.png)

---

## Analytics

![Analytics](screenshots/analytics.png)

---

# 🏗️ System Architecture

```text

                    Users

 │
 ▼

Next.js Frontend

 │ REST API

 ▼

FastAPI Backend

 │

 ├── PostgreSQL

 ├── Redis

 ├── File Storage

 └── Notification Service

```

---

# 🔄 Workflow

```text
Register Asset

↓

Available

↓

Allocate

↓

Employee Uses Asset

↓

Maintenance Request

↓

Approval

↓

Repair

↓

Available

↓

Transfer

↓

Retirement

```

---

# ⚙️ Tech Stack

## Frontend

- Next.js 16
- React 19
- TypeScript
- TailwindCSS
- shadcn/ui
- Framer Motion
- React Hook Form
- TanStack Query
- Zustand

---

## Backend

- FastAPI
- SQLAlchemy
- Alembic
- Pydantic
- JWT Authentication
- Redis

---

## Database

- PostgreSQL

---

## DevOps

- Docker
- Docker Compose
- GitHub Actions

---

## Design

- Figma
- Lucide Icons

---

# 📁 Folder Structure

```text

assetflow/

├── frontend/

├── backend/

├── docs/

├── screenshots/

├── docker/

├── README.md

└── docker-compose.yml

```

---

# 🛠️ Installation

```bash
git clone https://github.com/your-team/assetflow.git

cd assetflow

docker compose up

```

Frontend

```
http://localhost:3000
```

Backend

```
http://localhost:8000
```

API Docs

```
http://localhost:8000/docs
```

---

# 🔑 Environment Variables

Frontend

```
NEXT_PUBLIC_API_URL=
```

Backend

```
DATABASE_URL=

JWT_SECRET=

REDIS_URL=
```

---

# 📊 Core Modules

- Authentication
- Asset Inventory
- Department Management
- Employee Management
- Booking System
- Maintenance
- Reports
- Notifications
- Audit Logs

---

# 📈 Analytics

Dashboard includes

- Total Assets
- Active Assets
- Assets Under Maintenance
- Asset Utilization
- Department-wise Distribution
- Monthly Maintenance Cost
- Booking Trends

---

# 🔐 Security

- JWT Authentication
- RBAC (Role Based Access Control)
- Audit Logs
- Secure API Validation
- Password Hashing
- Protected Routes

---

# 🚀 Future Scope

- AI-powered Predictive Maintenance
- RFID Integration
- Barcode Scanner
- Mobile Application
- Email Notifications
- QR Asset Tracking
- ERP Integration
- Asset Depreciation Calculator

---

# 🏆 Hackathon

Built for

**Odoo Hackathon 2026**

Problem Statement

**AssetFlow – Smart Asset Lifecycle Management Platform**

---

# ❤️ Built With

- ❤️ Next.js
- ⚡ FastAPI
- 🐘 PostgreSQL
- 🐳 Docker
- 🎨 TailwindCSS
- ✨ shadcn/ui

---

# 📜 License

MIT License
