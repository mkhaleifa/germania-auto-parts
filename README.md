# Germania Auto Parts

Premium German Domestic Market (GDM) auto parts platform for Mercedes-Benz, BMW, Porsche, Volkswagen, and Audi.

A production-style full-stack e-commerce application built with Next.js, TypeScript, PostgreSQL, Prisma, Docker, and GitHub Actions.

## 🚗 Overview

Germania Auto Parts is a full-stack e-commerce platform designed for selling premium German automotive parts worldwide.

The application includes a customer storefront, vehicle-based browsing, authentication, shopping cart, wishlist, checkout, user accounts, and an admin dashboard for managing products and orders.

## ✨ Features

* 🛒 Product browsing and shopping cart
* 🔎 Product search and autocomplete
* 🚘 Vehicle-based product browsing
* ❤️ Wishlist functionality
* 👤 User authentication
* 🔐 Google and credentials authentication
* 📦 Order management
* 💳 Checkout integration
* 🖼️ Cloud-based product image uploads
* 👨‍💼 Admin dashboard
* 📊 Product and order management
* 📱 Responsive design
* 🌙 Light/dark theme support
* 🛡️ API rate limiting
* 🐳 Dockerized production deployment
* ⚙️ GitHub Actions CI/CD pipeline

## 🛠️ Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Zustand

### Backend

* Next.js API Routes
* Prisma ORM
* PostgreSQL
* NextAuth

### Infrastructure & DevOps

* Docker
* Docker Hub
* GitHub Actions
* Neon PostgreSQL

### External Services

* Cloudinary
* Stripe
* Resend
* Upstash Redis

## 🏗️ Architecture

```text
                    ┌─────────────────┐
                    │     GitHub      │
                    │   Source Code   │
                    └────────┬────────┘
                             │
                             │ git push
                             ▼
                    ┌─────────────────┐
                    │ GitHub Actions  │
                    │                 │
                    │ npm ci          │
                    │ Prisma Generate │
                    │ Lint            │
                    │ Next.js Build   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Docker Build    │
                    │ Production Image│
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Docker Hub    │
                    │ Container Image │
                    └─────────────────┘
```

## 🐳 Docker

The application uses a multi-stage Docker build.

The Docker image contains the production-ready Next.js application and runs using the Next.js standalone output.

Build the image locally:

```bash
docker build -t germania-auto-parts .
```

Run the production container:

```bash
docker run --name germania-auto-parts \
  -p 3000:3000 \
  --env-file .env \
  germania-auto-parts
```

## ⚙️ CI/CD

The project uses GitHub Actions to automate the application build pipeline.

Every push to the `main` branch triggers the workflow:

```text
Git Push
   ↓
GitHub Actions
   ↓
Install Dependencies
   ↓
Generate Prisma Client
   ↓
Run Lint
   ↓
Build Next.js Application
   ↓
Build Docker Image
   ↓
Login to Docker Hub
   ↓
Push Docker Image
```

Docker Hub credentials are stored securely using GitHub Actions Secrets.

This allows the project to automatically validate and package new changes into a production-ready Docker image.

## 🗄️ Database

The application uses PostgreSQL with Prisma ORM.

Main entities include:

* Users
* Accounts
* Sessions
* Addresses
* Categories
* Products
* Vehicles
* Orders
* Wishlist

The Prisma Client is generated during both local builds and the CI pipeline.

## 🔐 Environment Variables

Create a `.env` file and configure the required environment variables for:

```text
DATABASE_URL
AUTH_SECRET
AUTH_GOOGLE_ID
AUTH_GOOGLE_SECRET
NEXT_PUBLIC_SITE_URL
CLOUDINARY_*
STRIPE_*
RESEND_*
UPSTASH_*
```

Do not commit environment files or secret credentials to GitHub.

## 🚀 Running Locally

Clone the repository:

```bash
git clone https://github.com/mkhaleifa/germania-auto-parts.git
cd germania-auto-parts
```

Install dependencies:

```bash
npm ci
```

Generate Prisma Client:

```bash
npx prisma generate
```

Start the development server:

```bash
npm run dev
```

For a production build:

```bash
npm run build
npm start
```

## 📦 Docker Image

The production Docker image is published to Docker Hub:

`mokhalifa12/germania-auto-parts`

The image can be pulled with:

```bash
docker pull mokhalifa12/germania-auto-parts:latest
```

## 📌 Project Status

The application is currently running as a production-style Dockerized Next.js application with an automated GitHub Actions pipeline.

The current pipeline builds and publishes the Docker image to Docker Hub.

### Next Infrastructure Step

The next planned step is deploying the Docker image to AWS using services such as Amazon ECR and ECS/Fargate.

## 🎯 What This Project Demonstrates

This project demonstrates practical experience with:

* Full-stack Next.js development
* TypeScript
* REST/API development
* Authentication and authorization
* Database design with PostgreSQL and Prisma
* Third-party API integrations
* Docker containerization
* Production builds
* GitHub Actions
* Continuous Integration
* Automated Docker image publishing
* Environment and secret management

## 📄 License

This project is for educational and portfolio purposes.
