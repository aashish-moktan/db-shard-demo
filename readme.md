# db-shard-demo

A simple demo project that implements **database sharding in PostgreSQL** using a URL shortener as the use case.
<br />
This project shows how reads and writes can be distributed across multiple database shards for scalability.

---

## 📌 Features

- URL Shortener service (generate short URLs and resolve them back).
- PostgreSQL-based sharding implementation.
- Basic read/write routing:
  - **Writes** go to the correct shard based on a hashing strategy.
  - **Reads** query the appropriate shard.
- Simple demo setup to help understand database sharding concepts.

---

## 🗂️ Project Structure

````text
db-shard-demo/
├── docker-compose.yml # Define Postgres shard containers
├── Dockerfile # Build the Node.js app container
├── index.js # Express.js app for URL shortener
├── init.sql # SQL schema for shards
├── package.json # Node.js dependencies
├── package-lock.json
└── readme.md # Project documentation```
````

---

## ⚙️ How It Works

1. **Writes**: When a URL is shortened, a short code is generated.
   - The code is hashed → `hash % number_of_shards` determines the target shard.
   - The record is inserted into that shard.
2. **Reads**: When a short URL is accessed, the app hashes the code to find the right shard and fetch the original URL.
3. **Shards**: This demo uses 3 PostgreSQL instances (`db1`, `db2`, `db3`) as shards.
4. **pgAdmin**: Provides a UI to view/manage shards.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/db-shard-demo.git
cd db-shard-demo
```

### 2. Start containers

```bash
docker compose up -d --build
```

This starts:

- db1 -> localhost:5433
- db2 -> localhost:5434
- db3 -> localhost:5435
- pgAdmin -> localhost:5500
  - Login: admin@admin.com / admin
    Each database will be initialized automatically using `init.sql`.

### 3. Run the App

```bash
npm install
npm run start
npm run dev // development mode
```

Your app will be running at http://localhost:8081

## API Endpoints

### Shorten a URL

```bash
POST /

{
    "url": "http://localhost:8081?url=www.abc.com"
}
```

Response:

```bash
{
    urlId: "kdhjf",
    url: "http://localhost:8081?url=www.abc.com",
    server: "5433"
}
```

### Expand Short URL

```bash
GET /kdhjf
```

Response:

```bash
{
    urlId: "kdhjf",
    url: "http://localhost:8081?url=www.abc.com",
    server: "5433"
}
```

## 🧩 Sharding Strategy

Hash-based sharding on short codes:

```bash
shard_id = hash(short_code) % 3   // 3 shards
```

Example:

- abc123 -> shard1(db1)
- xyz789 -> shard1(db2)
- mno456 -> shard1(db3)

## 🛠️ Development Notes

- init.sql defines the same schema on each shard
- To inspect shards manually

```bash
psql -h localhost -p 5433 -U postgres -d my_db
psql -h localhost -p 5434 -U postgres -d my_db
psql -h localhost -p 5435 -U postgres -d my_db
```

- pgAdmin provides a GUI: http://localhost:5500

## 📝 License

This project is educational/demo purposes. Free to use and modify.
