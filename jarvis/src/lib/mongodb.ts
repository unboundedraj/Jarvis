import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI in environment variables.");
}

const globalForMongo = globalThis as unknown as {
  mongoClientPromise?: Promise<MongoClient>;
};

const client = new MongoClient(uri);
const mongoClientPromise =
  globalForMongo.mongoClientPromise ?? client.connect();

globalForMongo.mongoClientPromise = mongoClientPromise;

export async function getMongoDb() {
  const connectedClient = await mongoClientPromise;
  return connectedClient.db("jarvis");
}
