import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is missing from environment')
} else {
    console.log('DATABASE_URL is found')
}

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
})

async function main() {
    const machines = [
        {
            brand: 'Speed Queen',
            modelNumber: 'LFN50RSP115TW01',
            capacityLbs: 21.5,
            waterPerCycleGal: 13.68,
            gForce: 440,
        },
        {
            brand: 'Speed Queen',
            modelNumber: 'Horizon Top Load',
            capacityLbs: null,
            waterPerCycleGal: 14.80,
            gForce: null,
        },
        {
            brand: 'Speed Queen',
            modelNumber: 'SWNNC2HP115TW01',
            capacityLbs: null,
            waterPerCycleGal: 24.90,
            gForce: 150,
        },
        {
            brand: 'Dexter',
            modelNumber: 'WCAD20KCS',
            capacityLbs: 20.0,
            waterPerCycleGal: 22.60,
            gForce: 200, // 100-200 range
        },
        {
            brand: 'Dexter',
            modelNumber: 'WCAD30KCS',
            capacityLbs: 30.0,
            waterPerCycleGal: 32.00,
            gForce: 200, // 100-200 range
        },
        {
            brand: 'Dexter',
            modelNumber: 'WCAD40KCS',
            capacityLbs: 40.0,
            waterPerCycleGal: 44.20,
            gForce: 200, // 100-200 range
        },
        {
            brand: 'Dexter',
            modelNumber: 'WCAD60KCS',
            capacityLbs: 60.0,
            waterPerCycleGal: 70.60,
            gForce: 200, // 100-200 range
        },
    ]

    console.log(`Start seeding ...`)
    for (const machine of machines) {
        const result = await prisma.machineDefinition.upsert({
            where: { modelNumber: machine.modelNumber },
            update: machine,
            create: machine,
        })
        console.log(`Upserted machine with model: ${result.modelNumber}`)
    }
    console.log(`Seeding finished.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
