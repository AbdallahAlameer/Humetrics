// MongoDB connection singleton
import { MongoClient } from 'mongodb';
import 'dotenv/config';

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME || 'hr_analytics';

let client = null;
let db = null;

export async function connect() {
    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
        db = client.db(dbName);
    }
    return db;
}

export function getDb() {
    if (!db) throw new Error('Database not connected. Call connect() first.');
    return db;
}

export function getClient() {
    return client;
}
