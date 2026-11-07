import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "dumka_academy";

const globalForMongo = globalThis as unknown as {
  mongoClientPromise?: Promise<MongoClient>;
};

export function hasMongoConfig(): boolean {
  return Boolean(uri);
}

export async function getDb(): Promise<Db> {
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not configured. Add it to .env.local or to the Vercel environment variables.",
    );
  }

  if (!globalForMongo.mongoClientPromise) {
    const client = new MongoClient(uri, {
      appName: "dumka-academy-desk",
      serverSelectionTimeoutMS: 8000,
    });

    globalForMongo.mongoClientPromise = client.connect().catch((error) => {
      globalForMongo.mongoClientPromise = undefined;
      throw error;
    });
  }

  const client = await globalForMongo.mongoClientPromise;
  return client.db(dbName);
}
