# Hotel Booking

## Requirements

- Docker
- Node.js

## Run Locally

Clone the project

```bash
  git clone https://github.com/harshthakur1509/Hotels
```

Go to the project directory

```bash
  cd Hotels
```

Setup Backend

```
cd server
```

Run Docker

```bash
  docker compose up --build -d
```

setup Prisma

```
npx prisma migrate dev --name init

node prisma/seed.js
```

Run Backend

```
npm run dev
```

Setup Frontend

```
cd client
```

Run Frontend

```
npm run dev
```
