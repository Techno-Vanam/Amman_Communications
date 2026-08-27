import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash('password123', 10);

  // 1. Create customers
  await prisma.customer.upsert({
    where: { email: 'customer@test.com' },
    update: { passwordHash, status: 'ACTIVE' },
    create: {
      email: 'customer@test.com',
      passwordHash,
      name: 'Test Customer',
      status: 'ACTIVE',
    },
  });

  await prisma.customer.upsert({
    where: { email: 'sarah.smith@example.com' },
    update: { passwordHash, status: 'ACTIVE' },
    create: {
      email: 'sarah.smith@example.com',
      passwordHash,
      name: 'Sarah Smith',
      status: 'ACTIVE',
    },
  });

  await prisma.customer.upsert({
    where: { email: 'john.doe@example.com' },
    update: { passwordHash, status: 'INACTIVE' },
    create: {
      email: 'john.doe@example.com',
      passwordHash,
      name: 'John Doe',
      status: 'INACTIVE',
    },
  });

  await prisma.customer.upsert({
    where: { email: 'acme.corp@business.com' },
    update: { passwordHash, status: 'ACTIVE' },
    create: {
      email: 'acme.corp@business.com',
      passwordHash,
      name: 'Acme Corporation',
      status: 'ACTIVE',
    },
  });
  console.log('Sample customers created');

  // 2. Create an admin
  await prisma.admin.upsert({
    where: { email: 'admin@test.com' },
    update: { passwordHash },
    create: {
      email: 'admin@test.com',
      passwordHash,
      name: 'Test Admin',
    },
  });
  console.log('Test admin created: admin@test.com / password123');

  // 3. Create a duplicate identity for testing the rejection
  await prisma.customer.upsert({
    where: { email: 'duplicate@test.com' },
    update: { passwordHash },
    create: {
      email: 'duplicate@test.com',
      passwordHash,
      name: 'Duplicate Customer',
    },
  });
  await prisma.admin.upsert({
    where: { email: 'duplicate@test.com' },
    update: { passwordHash },
    create: {
      email: 'duplicate@test.com',
      passwordHash,
      name: 'Duplicate Admin',
    },
  });
  console.log('Test duplicate identity created: duplicate@test.com');

  // 4. Create Services (using valid v4 UUIDs)
  const services = [
    {
      id: '11111111-0000-4000-8000-000000000001',
      name: 'Trade License Renewal & Documentation',
      description: 'Complete assistance for commercial and trade license renewals, document verification, and government submissions.',
      requiredDocuments: ['trade_license', 'passport_copy', 'lease_agreement'],
      governmentFee: 150.00,
      officeCharge: 50.00,
      estimatedProcessingTime: '3-5 Business Days',
      isActive: true,
    },
    {
      id: '11111111-0000-4000-8000-000000000002',
      name: 'Company Establishment & Office Registration',
      description: 'End-to-end registration of new company structures, tax identification setup, and office lease certification.',
      requiredDocuments: ['identity_card', 'business_plan', 'bank_reference'],
      governmentFee: 300.00,
      officeCharge: 100.00,
      estimatedProcessingTime: '7-10 Business Days',
      isActive: true,
    },
    {
      id: '11111111-0000-4000-8000-000000000003',
      name: 'Legal & Tax Clearance Advisory',
      description: 'Professional consultation regarding corporate taxation, legal compliance, and regulatory documentation.',
      requiredDocuments: ['tax_returns', 'audit_report'],
      governmentFee: 75.00,
      officeCharge: 75.00,
      estimatedProcessingTime: '1-2 Business Days',
      isActive: true,
    },
    // Also include legacy prefix IDs for existing references
    {
      id: 'srv-00000000-0000-0000-0000-000000000001',
      name: 'Trade License Renewal & Documentation',
      description: 'Complete assistance for commercial and trade license renewals, document verification, and government submissions.',
      requiredDocuments: ['trade_license', 'passport_copy', 'lease_agreement'],
      governmentFee: 150.00,
      officeCharge: 50.00,
      estimatedProcessingTime: '3-5 Business Days',
      isActive: true,
    },
    {
      id: 'srv-00000000-0000-0000-0000-000000000002',
      name: 'Company Establishment & Office Registration',
      description: 'End-to-end registration of new company structures, tax identification setup, and office lease certification.',
      requiredDocuments: ['identity_card', 'business_plan', 'bank_reference'],
      governmentFee: 300.00,
      officeCharge: 100.00,
      estimatedProcessingTime: '7-10 Business Days',
      isActive: true,
    },
    {
      id: 'srv-00000000-0000-0000-0000-000000000003',
      name: 'Legal & Tax Clearance Advisory',
      description: 'Professional consultation regarding corporate taxation, legal compliance, and regulatory documentation.',
      requiredDocuments: ['tax_returns', 'audit_report'],
      governmentFee: 75.00,
      officeCharge: 75.00,
      estimatedProcessingTime: '1-2 Business Days',
      isActive: true,
    },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: { ...s },
      create: { ...s },
    });
  }
  console.log('Default services created/updated');

  // 5. Create Offices
  const offices = [
    {
      id: '22222222-0000-4000-8000-000000000001',
      name: 'Amman Central Headquarters',
      address: 'King Hussein St. Building 45, Suite 301, Amman',
      isActive: true,
    },
    {
      id: '22222222-0000-4000-8000-000000000002',
      name: 'North Amman Branch',
      address: 'University Street, Plaza Center 2nd Floor, Amman',
      isActive: true,
    },
    {
      id: 'off-00000000-0000-0000-0000-000000000001',
      name: 'Amman Central Headquarters',
      address: 'King Hussein St. Building 45, Suite 301, Amman',
      isActive: true,
    },
    {
      id: 'off-00000000-0000-0000-0000-000000000002',
      name: 'North Amman Branch',
      address: 'University Street, Plaza Center 2nd Floor, Amman',
      isActive: true,
    },
  ];

  for (const o of offices) {
    await prisma.office.upsert({
      where: { id: o.id },
      update: { ...o },
      create: { ...o },
    });
  }
  console.log('Default offices created/updated');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
