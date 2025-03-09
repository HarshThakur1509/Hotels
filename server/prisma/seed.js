const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const hotels = [
    {
        name: "Taj Mahal Palace",
        location: "Mumbai",
        price: 250,
    },
    {
        name: "Lake Palace",
        location: "Udaipur",
        price: 300,
    }
];

async function main() {
    console.log('Start seeding...');

    for (const hotel of hotels) {
        await prisma.hotel.create({
            data: hotel
        });
    }

    console.log('Seeding completed!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });