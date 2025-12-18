import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();
const client = new MongoClient(process.env.MONGO_URI);
let dbConnection = null;
export const connectDB = async () => {
    if (dbConnection) return dbConnection;
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        dbConnection = client.db('oldacre-reminders');
        return dbConnection;
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};
export const closeDB = async () => {
    await client.close();
    console.log('🔒 MongoDB Connection Closed');
};