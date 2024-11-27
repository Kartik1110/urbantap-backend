# Urbantap.io

Urbantap.io is a platform for brokers and developers to connect and collaborate on real estate projects.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm (v6 or higher)
- Docker

## Installation

1. Clone the repository
```bash
git clone https://github.com/username/project-name.git
cd project-name
```

2. Install dependencies
```bash
npm install
```

## Database Setup

This project uses PostgreSQL as its database. You can quickly set up a development database using Docker:

1. Create a Docker volume for data persistence:
```bash
docker volume create dev
```

2. Start the PostgreSQL container:
```bash
docker run -d \
  --name postgres-dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=urbantap \
  -v dev:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:latest
```

## Environment Variables

Create a `.env` file in the root directory and copy the .env.example file.

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```
