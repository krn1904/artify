import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;

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
  client = new MongoClient(uri);
      globalWithMongo._mongoClient = client;
      globalWithMongo._mongoClientPromise = client.connect();
    }
    client = globalWithMongo._mongoClient as MongoClient;
    clientPromise = globalWithMongo._mongoClientPromise as Promise<MongoClient>;
    return clientPromise;
  }

  // Production: no globals
  client = new MongoClient(uri);
  clientPromise = client.connect();
  return clientPromise;
}