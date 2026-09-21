import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ===========================
  // Create Admin User
  // ===========================
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: await bcrypt.hash('admin123', 12),
      role: 'admin_space',
      spaceOwner: {
        create: {
          namaCoworking: 'Ur-Space Coworking',
          namaPemilik: 'Admin Space',
          telp: '08123456789',
          alamat: 'Jl. Teknologi No. 1, Malang, Jawa Timur',
          deskripsi: 'Coworking space modern dengan fasilitas lengkap untuk para profesional, freelancer, dan startup.',
        },
      },
    },
    include: { spaceOwner: true },
  });
  console.log('✅ Admin user created:', adminUser.username);

  // ===========================
  // Create Sample Member
  // ===========================
  const memberUser = await prisma.user.upsert({
    where: { username: 'member1' },
    update: {},
    create: {
      username: 'member1',
      password: await bcrypt.hash('member123', 12),
      role: 'member',
      member: {
        create: {
          namaMember: 'Budi Santoso',
          instansi: 'Freelancer',
          alamat: 'Jl. Melati No. 5, Malang',
          telp: '08987654321',
        },
      },
    },
  });
  console.log('✅ Sample member created:', memberUser.username);

  // ===========================
  // Create Spaces
  // ===========================
  const spaceOwner = adminUser.spaceOwner!;
  
  const spaces = await Promise.all([
    prisma.space.upsert({
      where: { id: 'space-desk-1' },
      update: {},
      create: {
        id: 'space-desk-1',
        namaSpace: 'Personal Desk A',
        hargaPerJam: 15000,
        tipe: 'desk',
        kapasitas: 1,
        deskripsi: 'Meja kerja personal yang nyaman dengan pencahayaan alami dan kursi ergonomis.',
        fasilitas: JSON.stringify(['WiFi Kecepatan Tinggi', 'Colokan Listrik', 'Kursi Ergonomis', 'Loker Pribadi']),
        ownerId: spaceOwner.id,
      },
    }),
    prisma.space.upsert({
      where: { id: 'space-desk-2' },
      update: {},
      create: {
        id: 'space-desk-2',
        namaSpace: 'Personal Desk B',
        hargaPerJam: 15000,
        tipe: 'desk',
        kapasitas: 1,
        deskripsi: 'Workstation modern di area terbuka yang cocok untuk kerja fokus harian.',
        fasilitas: JSON.stringify(['WiFi Kecepatan Tinggi', 'Colokan Listrik', 'Kursi Ergonomis']),
        ownerId: spaceOwner.id,
      },
    }),
    prisma.space.upsert({
      where: { id: 'space-meeting-1' },
      update: {},
      create: {
        id: 'space-meeting-1',
        namaSpace: 'Meeting Room Alpha',
        hargaPerJam: 75000,
        tipe: 'meeting_room',
        kapasitas: 8,
        deskripsi: 'Ruang meeting profesional dengan kapasitas 8 orang, dilengkapi proyektor dan whiteboard.',
        fasilitas: JSON.stringify(['Proyektor 4K', 'Whiteboard', 'AC', 'WiFi', 'Colokan Listrik', 'Air Minum']),
        ownerId: spaceOwner.id,
      },
    }),
    prisma.space.upsert({
      where: { id: 'space-private-1' },
      update: {},
      create: {
        id: 'space-private-1',
        namaSpace: 'Private Office Suite',
        hargaPerJam: 120000,
        tipe: 'private_office',
        kapasitas: 4,
        deskripsi: 'Ruangan private eksklusif untuk tim kecil dengan privasi penuh dan fasilitas premium.',
        fasilitas: JSON.stringify(['WiFi Dedicated', '4 Meja & Kursi Ergonomis', 'AC', 'Loker Tim', 'Proyektor', 'Papan Tulis', 'Air Minum']),
        ownerId: spaceOwner.id,
      },
    }),
  ]);
  console.log(`✅ ${spaces.length} spaces created`);

  // ===========================
  // Create Discount Codes
  // ===========================
  const discounts = await Promise.all([
    prisma.diskon.upsert({
      where: { kodeDiskon: 'NEWMEMBER' },
      update: {},
      create: {
        namaDiskon: 'Diskon Member Baru',
        kodeDiskon: 'NEWMEMBER',
        persentaseDiskon: 20,
        tanggalAwal: new Date('2024-01-01'),
        tanggalAkhir: new Date('2025-12-31'),
      },
    }),
    prisma.diskon.upsert({
      where: { kodeDiskon: 'WEEKEND10' },
      update: {},
      create: {
        namaDiskon: 'Promo Weekend',
        kodeDiskon: 'WEEKEND10',
        persentaseDiskon: 10,
        tanggalAwal: new Date('2024-01-01'),
        tanggalAkhir: new Date('2025-12-31'),
      },
    }),
  ]);
  console.log(`✅ ${discounts.length} discounts created`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
