const MongoClient = require("mongodb").MongoClient;
const express = require("express");
const { ftruncate } = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "/../projekt")));

const uri =
  "mongodb+srv://tomekczyz001:PSKFTfk8sYUWYBva@cluster0.b98di.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/";
const dbName = "userAuthDB";
const collections = "users";
const port = 3000;

async function ConnectToDb() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Połączenie otwarte");
    const db = client.db(dbName);
    return db;
  } catch (err) {
    console.error(err);
  }
}

app.listen(port, () => console.log(`Serwer działa na porcie ${port}`));
