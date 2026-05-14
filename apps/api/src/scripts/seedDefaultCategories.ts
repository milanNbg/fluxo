import { prisma, disconnectPrisma } from '../lib/prisma.js';
import { DEFAULT_CATEGORIES } from '../lib/defaultCategories.js';

async function main(): Promise<void> {
  console.log('🌱 Seeding default categories for users without any...\n');

  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: { categories: true },
      },
    },
  });

  const usersWithoutCategories = users.filter((u) => u._count.categories === 0);

  if (usersWithoutCategories.length === 0) {
    console.log('✅ All users already have categories. Nothing to do.');
    return;
  }

  console.log(
    `Found ${usersWithoutCategories.length} user(s) without categories:`,
  );
  for (const user of usersWithoutCategories) {
    console.log(`  - ${user.email} (${user.id})`);
  }
  console.log();

  for (const user of usersWithoutCategories) {
    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((cat) => ({
        userId: user.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        isDefault: true,
      })),
    });
    console.log(`✅ Created ${DEFAULT_CATEGORIES.length} categories for ${user.email}`);
  }

  console.log(`\n🎉 Done! Seeded ${usersWithoutCategories.length} user(s).`);
}

main()
  .catch((err: unknown) => {
    console.error('❌ Error seeding categories:', err);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectPrisma();
  });