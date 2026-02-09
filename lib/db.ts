import { MongoClient, ServerApiVersion } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;

export const mongoDbName = process.env.MONGODB_DB_NAME?.trim() || 'artify';

// MongoDB connection options for better performance
const clientOptions = {
  maxPoolSize: 10, // Maximum connections in pool
  minPoolSize: 2, // Keep at least 2 connections open
  maxIdleTimeMS: 60000, // Close idle connections after 60s
  serverSelectionTimeoutMS: 5000, // Fail fast if can't connect
  socketTimeoutMS: 45000, // Socket timeout
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
}

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient> | undefined;

// Lazily create the connection only when requested, to avoid DB calls during build.
export default async function getMongoClient(): Promise<MongoClient> {
  if (client && clientPromise) return clientPromise;

  if (process.env.NODE_ENV === 'development') {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
      _mongoClient?: MongoClient;
    };
    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, clientOptions);
      globalWithMongo._mongoClient = client;
      globalWithMongo._mongoClientPromise = client.connect();
    }
    client = globalWithMongo._mongoClient as MongoClient;
    clientPromise = globalWithMongo._mongoClientPromise as Promise<MongoClient>;
    return clientPromise;
  }

  // Production: no globals, but reuse connection
  if (!client) {
    client = new MongoClient(uri, clientOptions);
    clientPromise = client.connect();
  }
  return clientPromise as Promise<MongoClient>;
}

export async function getMongoDatabase() {
  const mongo = await getMongoClient();
  return mongo.db(mongoDbName);
}
