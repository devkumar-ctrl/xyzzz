import { MongoClient, type Db } from "mongodb";
import { MONGODB_DB, MONGODB_URI } from "./config";

const globalForMongo = globalThis as unknown as {
  mongoClientPromise?: Promise<MongoClient>;
};

export function hasMongoConfig(): boolean {
  return Boolean(MONGODB_URI);
}

export async function getDb(): Promise<Db> {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not configured. Add it to .env.local or to the API environment variables.",
    );
  }

  if (!globalForMongo.mongoClientPromise) {
    const client = new MongoClient(MONGODB_URI, {
      appName: "dumka-academy-api",
      serverSelectionTimeoutMS: 8000,
    });

    globalForMongo.mongoClientPromise = client.connect().catch((error) => {
      globalForMongo.mongoClientPromise = undefined;
      throw error;
    });
  }

  const client = await globalForMongo.mongoClientPromise;
  return client.db(MONGODB_DB);
}
