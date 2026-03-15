

# TyPingOn - Master Your Typing Speed 

**TyPingOn** is a modern, high-performance web application built to help users elevate their typing speed and accuracy. Create your own typing snippets, practice daily, and track your progress in real-time.

**Live Preview:** [https://typingon.vercel.app/](https://typingon.vercel.app/) 

(Seamlessly rendered on the client-side for an instant typing experience.)

## Tech Stack

This project is built using a robust modern stack to ensure high performance and scalability:

* **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide Icons.
* **Backend:** NestJS, TypeScript.
* **Database & ORM:** PostgreSQL, Prisma.
* **Authentication:** Custom JWT flow with Email OTP Verification.

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites
* Node.js (v18 or later)
* PostgreSQL Database running locally or via a cloud provider.

### 1. Frontend Setup
Navigate to the frontend directory, install dependencies, and start the development server:
```bash
cd front-end
npm install
npm run dev

```

The frontend will be available at `http://localhost:3000`.

### 2. Backend Setup

Navigate to the backend directory, configure your environment, and start the API server:

```bash
cd back-end
npm install
# Create a .env file and add your DATABASE_URL
npx prisma generate
npm run start:dev

```

The backend API will run on `http://localhost:3001`.

## Demo

<p align="center">
  <img src="https://github.com/user-attachments/assets/dca80409-9aae-4aad-8ba3-62d139ffa0cd" alt="demo app"/>

</p>
<p align="center">
<img src="https://drive.google.com/uc?export=view&id=1ShgtkiIfCZLffALtKwbQXmolA-H2etMl" alt="Powered by Espa" width=200px />
</p>

---



