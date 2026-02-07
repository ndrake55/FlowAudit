
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding test data...')

    // 1. Create or Find Tenant
    const tenant = await prisma.tenant.upsert({
        where: { slug: 'demo-tenant' },
        update: {},
        create: {
            name: 'Demo Tenant',
            slug: 'demo-tenant',
        },
    })
    console.log('Tenant:', tenant.name)

    // 2. Create or Find Location
    // We don't have a unique slug for location, so we'll just findFirst or create
    let location = await prisma.location.findFirst({
        where: {
            tenantId: tenant.id,
            name: 'Downtown Laundry'
        }
    })

    if (!location) {
        location = await prisma.location.create({
            data: {
                tenantId: tenant.id,
                name: 'Downtown Laundry',
            }
        })
    }
    console.log('Location:', location.name)

    // 3. Get Definitions
    const defs = await prisma.machineDefinition.findMany()
    if (defs.length === 0) {
        throw new Error('No MachineDefinitions found. Run prisma db seed first.')
    }

    // 4. Create Machines
    // Check if machines exist
    const existingMachines = await prisma.machine.findMany({
        where: { locationId: location.id }
    })

    if (existingMachines.length === 0) {
        console.log('Creating machines...')
        // Create 5 machines of the first type
        for (let i = 0; i < 5; i++) {
            await prisma.machine.create({
                data: {
                    tenantId: tenant.id,
                    locationId: location.id,
                    machineDefinitionId: defs[0].id
                }
            })
        }
        // Create 3 machines of the second type (if available)
        if (defs.length > 1) {
            for (let i = 0; i < 3; i++) {
                await prisma.machine.create({
                    data: {
                        tenantId: tenant.id,
                        locationId: location.id,
                        machineDefinitionId: defs[1].id
                    }
                })
            }
        }
        console.log('Machines created.')
    } else {
        console.log('Machines already exist.')
    }
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
