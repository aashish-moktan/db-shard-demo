const { Client } = require("pg");
const app = require("express")();
const HashRing = require("hashring");
const crypto = require("crypto");

// Initialize consistent hashing ring and add shards (database instances)
const hr = new HashRing();
hr.add("5433");
hr.add("5434");
hr.add("5435");

// configure the clients
const clients = {
  5433: new Client({
    host: "localhost",
    user: "postgres",
    database: "my_db",
    password: "postgres",
    port: 5433,
  }),
  5434: new Client({
    host: "localhost",
    user: "postgres",
    database: "my_db",
    password: "postgres",
    port: 5434,
  }),
  5435: new Client({
    host: "localhost",
    user: "postgres",
    database: "my_db",
    password: "postgres",
    port: 5435,
  }),
};

async function connectClients() {
  for (const port in clients) {
    await clients[port].connect();
    console.log(`Connected to database on port ${port}`);
  }
}
connectClients();

// write data
app.post("/data", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send("Missing url parameter");
  }

  // hash url
  const hash = crypto.createHash("sha256").update(url).digest("base64");
  const urlId = hash.substring(0, 5);

  // Determine the shard using consistent hashing
  const shardPort = hr.get(urlId);
  await clients[shardPort].query(
    "INSERT INTO urls(original_url, short_code) VALUES($1, $2)",
    [url, urlId]
  );

  return res.json({ urlId, url, server: shardPort });
});

// read data
app.get("/:urlId", async (req, res) => {
  const urlId = req.params.urlId;

  // Determine the shard using consistent hashing
  const shardPort = hr.get(urlId);
  const result = await clients[shardPort].query(
    "SELECT * from urls WHERE short_code = $1",
    [urlId]
  );

  if (!result && result.rowLength === 0) {
    return res.status(404).send("URL not found");
  }

  return res.json({
    urlId,
    url: result.rows[0].original_url,
    server: shardPort,
  });
});

app.listen(8081, () => {
  console.log("Server is running on port 8081");
});
