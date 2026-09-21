import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const basePrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const modelsWithMakerId = [
          'User', 'Member', 'SpaceOwner', 'Space', 'Diskon', 'Reservasi', 'DetailReservasi'
        ];

        if (modelsWithMakerId.includes(model)) {
          const makerId = process.env.MAKER_KEY || 'default-maker';
          
          const opsWithWhere = [
            'findUnique', 'findUniqueOrThrow', 'findFirst', 'findFirstOrThrow', 'findMany',
            'update', 'updateMany', 'upsert', 'delete', 'deleteMany', 'aggregate', 'groupBy', 'count'
          ];
          const opsWithData = ['create', 'createMany', 'update', 'updateMany', 'upsert'];

          const a = args as any;
          if (opsWithWhere.includes(operation)) {
            a.where = { ...a.where, makerId };
          }
          if (opsWithData.includes(operation)) {
            if (operation === 'create' || operation === 'update') {
              a.data = { ...a.data, makerId };
            } else if (operation === 'createMany') {
              if (Array.isArray(a.data)) {
                a.data = a.data.map((d: any) => ({ ...d, makerId }));
              } else {
                a.data = { ...a.data, makerId };
              }
            }
          }
        }
        return query(args);
      },
    },
  },
});

// @ts-ignore
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma;
