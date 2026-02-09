const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const email = 'ndrake55@gmail.com';
    // users provided email in screenshot was ndrake55@gmail.com, 
    // administrative email provided was neal@drakeearth.com. 
    // I will make BOTH admins to be safe.

    const emails = ['ndrake55@gmail.com', 'neal@drakeearth.com'];

    for (const e of emails) {
        try {
            const user = await prisma.user.update({
                where: { email: e },
                data: { role: 'ADMIN' },
            });
            console.log(`Updated ${e} to ADMIN`);
        } catch (error) {
            console.log(`Could not find or update user ${e}: ${error.code || error.message}`);
            // It might not exist yet if they haven't logged in.
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
