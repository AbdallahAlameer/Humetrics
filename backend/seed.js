import 'dotenv/config';
import { connect, getDb, getClient } from './src/db.js';
import { getMainDf, getIbmDf } from './src/services/dataService.js';
import { seedUsers } from './src/auth.js';

async function seed() {
    console.log('Connecting to MongoDB...');
    try {
        await connect();
        const db = getDb();

        console.log('Clearing existing collections...');
        await db.collection('employees').deleteMany({});
        await db.collection('ibm_attrition').deleteMany({});
        await db.collection('users').deleteMany({});

        console.log('Seeding users...');
        await seedUsers();

        console.log('Loading datasets into memory...');
        const employees = await getMainDf();
        const ibm = await getIbmDf();

        console.log(`Inserting ${employees.length} records into 'employees' collection...`);
        const empResult = await db.collection('employees').insertMany(employees);
        console.log(`${empResult.insertedCount} 'employees' inserted.`);

        console.log(`Inserting ${ibm.length} records into 'ibm_attrition' collection...`);
        const ibmResult = await db.collection('ibm_attrition').insertMany(ibm);
        console.log(`${ibmResult.insertedCount} 'ibm_attrition' inserted.`);

        console.log('Database seeded successfully.');
    } catch (err) {
        console.error('Failed to seed database:', err);
    } finally {
        const client = getClient();
        if (client) {
            await client.close();
        }
        process.exit();
    }
}

seed();
