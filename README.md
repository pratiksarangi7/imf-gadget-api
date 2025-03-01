# IMF Gadget API

A robust RESTful API for managing a gadget inventory with advanced features like self-destruct sequences, JWT-based authentication, and automated cleanup. This project demonstrates the use of Node.js, Express, TypeScript, PostgreSQL with Prisma ORM, and cron jobs for scheduled tasks.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
  - [Gadget Inventory](#gadget-inventory)
  - [Self-Destruct Sequence](#self-destruct-sequence)
  - [Authentication](#authentication)
- [Cron Job for Self-Destruct TTL](#cron-job-for-self-destruct-ttl)
- [Testing](#testing)
- [Deployment](#deployment)
- [License](#license)

## Overview

The **Gadget Inventory API** provides endpoints to manage a collection of gadgets, each uniquely identified by a codename. Users can add, update, and decommission gadgets, and trigger a mission-critical self-destruct sequence that requires a two-step verification process. This API is secured with JWT authentication and includes features to filter gadgets by status.

## Features

### Gadget Management

- **GET /gadgets:** Retrieve all gadgets with a dynamic "mission success probability" (e.g., "The Nightingale - 87% success probability").
- **POST /gadgets:** Add a new gadget with a unique, randomly generated codename.
- **PATCH /gadgets/:id :** Update gadget information.
- **DELETE /gadgets/:id :** Mark a gadget as "Decommissioned" and record a timestamp instead of deleting it permanently.

### Self-Destruct Sequence

- **POST /gadgets/:id/self-destruct:** Initiate a self-destruct sequence by generating a random confirmation code. The code is hashed and stored in a dedicated table.
- **POST /gadgets/:id/self-destruct-verify:** Verify the confirmation code. Upon a correct match, the gadget is marked as "Destroyed" (or deleted) and the record is removed.
- **TTL Implementation:** If the self-destruct verification is not completed within 10 minutes, a scheduled cron job automatically cleans up the pending self-destruct record.

### Authentication & Authorization

- Secure endpoints with JWT.
- User registration and login functionality for robust access control.

### Additional Features

- Filtering gadgets by status using query parameters.
- Cron job-based cleanup to automatically remove expired self-destruct records.

## Tech Stack

- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (jsonwebtoken)
- **Scheduling:** node-cron
- **Additional Libraries:** bcrypt for hashing, dotenv for environment variable management

## Installation

### Clone the Repository:

```bash
git clone https://github.com/yourusername/gadget-inventory-api.git
cd gadget-inventory-api
```

### Install Dependencies:

```bash
npm install
```

### Set Up TypeScript:

The project is already configured with a `tsconfig.json`. Ensure you have TypeScript installed:

```bash
npm install -D typescript ts-node @types/node
```

## Environment Variables

Create a `.env` file in the root directory with the following keys:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>
JWT_SECRET=your_jwt_secret_here
PORT=3000
```

Adjust the values to suit your local or production environment.

## Database Setup

### Initialize Prisma:

If you haven’t already, initialize Prisma:

```bash
npx prisma init
```

### Migrate the Database:

Run the migrations to set up your schema (including the `Gadget` and `SelfDestruct` models):

```bash
npx prisma migrate dev --name init
```

### Generate Prisma Client:

```bash
npx prisma generate
```

## Running the Application

### Development

Run the application using `ts-node`:

```bash
npx ts-node src/index.ts
```

Or use `nodemon` for automatic restarts:

```bash
npx nodemon --exec ts-node src/index.ts
```

### Production

Compile TypeScript:

```bash
npx tsc
```

Start the Compiled Code:

```bash
node dist/index.js
```

## API Endpoints

### Gadget Inventory

- **GET /gadgets**: Retrieves a list of all gadgets with an added random "mission success probability".
  - **Query Parameter:**
    - `status` (optional): Filter gadgets by status (Available, Deployed, Destroyed, Decommissioned).
- **POST /gadgets**: Adds a new gadget with a unique, randomly generated codename.
- **PATCH /gadgets/:id**: Updates an existing gadget’s information.
- **DELETE /gadgets/:id**: Marks the gadget as "Decommissioned" and records a decommissioned timestamp.

### Self-Destruct Sequence

- **POST /gadgets/:id/self-destruct**: Initiates the self-destruct sequence for a specific gadget by generating a random confirmation code (e.g., "KVWZC3"). The confirmation code is hashed and stored in a dedicated table.
- **POST /gadgets/:id/self-destruct-verify**: Accepts a confirmation code to verify the self-destruct sequence. If validated, the gadget is marked as "Destroyed" (or deleted) and the corresponding self-destruct record is removed.

### Authentication

- **POST /auth/register**: Registers a new user.
- **POST /auth/login**: Logs in an existing user and returns a JWT token for subsequent requests.

## Cron Job for Self-Destruct TTL

A cron job is configured (using [node-cron](https://www.npmjs.com/package/node-cron)) to run every minute. It checks the `SelfDestruct` table and deletes any records that have been pending for more than 10 minutes, ensuring expired self-destruct sequences are automatically cleaned up.
