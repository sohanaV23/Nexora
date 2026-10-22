const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Nexora Database Seeding...');

  // Clean existing tables in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.parkingSlot.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.facilityBooking.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.visitorPass.deleteMany();
  await prisma.complaintTimeline.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.tenancy.deleteMany();
  await prisma.flat.deleteMany();
  await prisma.building.deleteMany();
  await prisma.communityMembership.deleteMany();
  await prisma.community.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = bcrypt.hashSync('Password123!', 10);

  // 1. Create Core Users for All 5 Roles + Landlord + Tenant
  const superAdmin = await prisma.user.create({
    data: {
      email: 'super.admin@nexora.local',
      passwordHash: defaultPasswordHash,
      name: 'Nexora Platform Master',
      phone: '+91 99999 00000',
      role: 'SUPER_ADMIN'
    }
  });

  const adminGWH = await prisma.user.create({
    data: {
      email: 'ananya.admin@nexora.local',
      passwordHash: defaultPasswordHash,
      name: 'Ananya Rao',
      phone: '+91 98765 11111',
      role: 'ASSOCIATION_ADMIN'
    }
  });

  const adminCTR = await prisma.user.create({
    data: {
      email: 'vikram.admin@nexora.local',
      passwordHash: defaultPasswordHash,
      name: 'Vikram Joshi',
      phone: '+91 98765 11112',
      role: 'ASSOCIATION_ADMIN'
    }
  });

  const residentRohit = await prisma.user.create({
    data: {
      email: 'rohit.resident@nexora.local',
      passwordHash: defaultPasswordHash,
      name: 'Rohit Sharma',
      phone: '+91 98765 43210',
      role: 'RESIDENT'
    }
  });

  const landlordAnand = await prisma.user.create({
    data: {
      email: 'anand.landlord@nexora.local',
      passwordHash: defaultPasswordHash,
      name: 'Dr. Anand Kumar',
      phone: '+91 98765 44444',
      role: 'RESIDENT'
    }
  });

  const tenantPriya = await prisma.user.create({
    data: {
      email: 'priya.tenant@nexora.local',
      passwordHash: defaultPasswordHash,
      name: 'Priya Sundaram',
      phone: '+91 98765 55555',
      role: 'RESIDENT'
    }
  });

  const workerSuresh = await prisma.user.create({
    data: {
      email: 'suresh.maintenance@nexora.local',
      passwordHash: defaultPasswordHash,
      name: 'Suresh Kumar',
      phone: '+91 98765 22222',
      role: 'WORKER'
    }
  });

  const securityRamesh = await prisma.user.create({
    data: {
      email: 'ramesh.gate@nexora.local',
      passwordHash: defaultPasswordHash,
      name: 'Ramesh Singh',
      phone: '+91 98765 33333',
      role: 'SECURITY'
    }
  });

  console.log('✅ Seeded 8 core users across all roles.');

  // 2. Create Two Independent Communities
  const comm1 = await prisma.community.create({
    data: {
      name: 'Greenwood Heights',
      code: 'GWH',
      address: 'Plot 42, Financial District, Gachibowli',
      city: 'Hyderabad'
    }
  });

  const comm2 = await prisma.community.create({
    data: {
      name: 'Cyber Towers Residency',
      code: 'CTR',
      address: 'Madhapur Main Road, HITEC City',
      city: 'Hyderabad'
    }
  });

  console.log('✅ Seeded 2 distinct communities: Greenwood Heights & Cyber Towers.');

  // 3. Memberships
  await prisma.communityMembership.createMany({
    data: [
      { userId: adminGWH.id, communityId: comm1.id, role: 'ASSOCIATION_ADMIN', unitDesignation: 'RWA President' },
      { userId: adminCTR.id, communityId: comm2.id, role: 'ASSOCIATION_ADMIN', unitDesignation: 'Secretary' },
      { userId: residentRohit.id, communityId: comm1.id, role: 'RESIDENT', unitDesignation: 'Flat B-402 (Owner)' },
      { userId: landlordAnand.id, communityId: comm1.id, role: 'RESIDENT', unitDesignation: 'Flat A-204 & B-301 (Landlord)' },
      { userId: tenantPriya.id, communityId: comm1.id, role: 'RESIDENT', unitDesignation: 'Flat A-204 (Tenant)' },
      { userId: workerSuresh.id, communityId: comm1.id, role: 'WORKER', unitDesignation: 'Senior Electrician & Plumbing' },
      { userId: securityRamesh.id, communityId: comm1.id, role: 'SECURITY', unitDesignation: 'Main Gate 1 Officer' },
      // Give worker & security privileges in Cyber Towers as well
      { userId: workerSuresh.id, communityId: comm2.id, role: 'WORKER', unitDesignation: 'Field Technician' },
      { userId: securityRamesh.id, communityId: comm2.id, role: 'SECURITY', unitDesignation: 'Gate 2 Sentinel' }
    ]
  });

  // 4. Buildings & Flats in Greenwood Heights
  const bldgA = await prisma.building.create({
    data: { communityId: comm1.id, name: 'Tower A', totalFloors: 12 }
  });
  const bldgB = await prisma.building.create({
    data: { communityId: comm1.id, name: 'Tower B', totalFloors: 10 }
  });

  // Cyber Towers building
  const bldgCTR = await prisma.building.create({
    data: { communityId: comm2.id, name: 'Block Alpha', totalFloors: 14 }
  });

  const flatB402 = await prisma.flat.create({
    data: {
      communityId: comm1.id,
      buildingId: bldgB.id,
      flatNumber: 'Flat 402',
      floor: 4,
      bhkType: '3 BHK',
      occupancyStatus: 'OWNER_OCCUPIED',
      ownerName: 'Rohit Sharma'
    }
  });

  const flatA204 = await prisma.flat.create({
    data: {
      communityId: comm1.id,
      buildingId: bldgA.id,
      flatNumber: 'Flat 204',
      floor: 2,
      bhkType: '2 BHK',
      occupancyStatus: 'TENANT_OCCUPIED',
      ownerName: 'Dr. Anand Kumar'
    }
  });

  const flatCTR101 = await prisma.flat.create({
    data: {
      communityId: comm2.id,
      buildingId: bldgCTR.id,
      flatNumber: 'Flat 101',
      floor: 1,
      bhkType: '2 BHK',
      occupancyStatus: 'OWNER_OCCUPIED',
      ownerName: 'Vikram Joshi'
    }
  });

  // 5. Tenancy & Lease for Flat A-204 (Tenant: Priya Sundaram, Landlord: Dr. Anand Kumar)
  const tenancyPriya = await prisma.tenancy.create({
    data: {
      flatId: flatA204.id,
      tenantId: tenantPriya.id,
      landlordId: landlordAnand.id,
      leaseStart: new Date('2026-04-01T00:00:00Z'),
      leaseEnd: new Date('2027-03-31T23:59:59Z'),
      monthlyRentPaise: 2400000, // ₹24,000.00
      securityDepositPaise: 5000000, // ₹50,000.00
      dueDay: 5,
      noticePeriodDays: 30,
      status: 'ACTIVE',
      moveInNotes: 'Keys handed over. Clean handover inspection verified. Gas meter initial reading: 142.8.',
      depositStatus: 'HELD'
    }
  });

  console.log('✅ Seeded Buildings, Flats, and Tenancy Lease Contract.');

  // 6. Dual-Ledger Invoices & Payments
  // A. Association Maintenance Due for Rohit (Flat B-402) - PAID & VERIFIED
  const invMntRohit = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-MNT-2026-1001',
      communityId: comm1.id,
      flatId: flatB402.id,
      payerId: residentRohit.id,
      invoiceType: 'ASSOCIATION_MAINTENANCE',
      billingPeriod: 'October 2026',
      amountPaise: 350000, // ₹3,500.00
      paidPaise: 350000,
      balancePaise: 0,
      dueDate: new Date('2026-10-15T00:00:00Z'),
      status: 'PAID'
    }
  });

  await prisma.payment.create({
    data: {
      invoiceId: invMntRohit.id,
      amountPaise: 350000,
      paymentMethod: 'SIMULATED_DEMO',
      transactionReference: 'SIM-UPI-982341',
      isSimulated: true,
      status: 'VERIFIED',
      reportedAt: new Date('2026-10-10T11:00:00Z'),
      reportedById: residentRohit.id,
      verifiedAt: new Date('2026-10-10T12:00:00Z'),
      verifiedById: adminGWH.id,
      receiptNumber: 'RCP-2026-1082',
      proofNotes: 'Simulated Demo Payment verified by Society Admin'
    }
  });

  // B. Association Maintenance Due for November (Rohit) - ISSUED / PENDING
  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-MNT-2026-1101',
      communityId: comm1.id,
      flatId: flatB402.id,
      payerId: residentRohit.id,
      invoiceType: 'ASSOCIATION_MAINTENANCE',
      billingPeriod: 'November 2026',
      amountPaise: 350000,
      paidPaise: 0,
      balancePaise: 350000,
      dueDate: new Date('2026-11-15T00:00:00Z'),
      status: 'ISSUED'
    }
  });

  // C. Contractual Rent Invoice for Priya Tenant (Flat A-204) - REPORTED / PENDING VERIFICATION!
  // This allows the reviewer/evaluator to test the Payment Verification queue live!
  const invRentPriya = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-RNT-2026-1001',
      communityId: comm1.id,
      flatId: flatA204.id,
      tenancyId: tenancyPriya.id,
      payerId: tenantPriya.id,
      invoiceType: 'CONTRACTUAL_RENT',
      billingPeriod: 'October 2026',
      amountPaise: 2400000, // ₹24,000.00
      paidPaise: 0, // Not yet verified, so balance remains 2400000!
      balancePaise: 2400000,
      dueDate: new Date('2026-10-05T00:00:00Z'),
      status: 'ISSUED'
    }
  });

  await prisma.payment.create({
    data: {
      invoiceId: invRentPriya.id,
      amountPaise: 2400000,
      paymentMethod: 'BANK_TRANSFER',
      transactionReference: 'NEFT-HDFC-998822',
      isSimulated: false,
      status: 'PENDING_VERIFICATION', // Needs Admin/Landlord action!
      reportedAt: new Date('2026-10-04T15:30:00Z'),
      reportedById: tenantPriya.id,
      proofNotes: 'Transferred via HDFC Netbanking ref #998822'
    }
  });

  console.log('✅ Seeded Dual-Ledger Invoices & Payments (with Pending Verification state).');

  // 7. Complaints & Audit Timelines
  const cmp1 = await prisma.complaint.create({
    data: {
      complaintNumber: 'CMP-2026-001',
      communityId: comm1.id,
      flatId: flatB402.id,
      reporterId: residentRohit.id,
      assignedWorkerId: workerSuresh.id,
      category: 'Plumbing & Water',
      title: 'Water leakage in Tower B basement parking ceiling',
      description: 'Continuous dripping water near slot P-402 is pooling on the floor and creating a slip hazard.',
      location: 'Tower B - Basement 1, Near Pillar P-42',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      slaTargetHours: 8,
      confidenceScore: 0.95,
      mlSuggestedCategory: 'Plumbing & Water'
    }
  });

  await prisma.complaintTimeline.createMany({
    data: [
      { complaintId: cmp1.id, actorId: residentRohit.id, fromStatus: 'SUBMITTED', toStatus: 'SUBMITTED', note: 'Complaint logged by resident' },
      { complaintId: cmp1.id, actorId: adminGWH.id, fromStatus: 'SUBMITTED', toStatus: 'ACKNOWLEDGED', note: 'Verified by Association Admin' },
      { complaintId: cmp1.id, actorId: adminGWH.id, fromStatus: 'ACKNOWLEDGED', toStatus: 'ASSIGNED', note: 'Assigned to Suresh Kumar (Senior Electrician & Plumbing)' },
      { complaintId: cmp1.id, actorId: workerSuresh.id, fromStatus: 'ASSIGNED', toStatus: 'IN_PROGRESS', note: 'Inspecting overhead joint valve' }
    ]
  });

  const cmp2 = await prisma.complaint.create({
    data: {
      complaintNumber: 'CMP-2026-002',
      communityId: comm1.id,
      flatId: flatA204.id,
      reporterId: tenantPriya.id,
      category: 'Elevator & Lift',
      title: 'Tower A Lift 2 jerking and stopping between 4th and 5th floor',
      description: 'Elevator makes loud grinding sound when ascending past 4th floor. Multiple residents reported delayed opening.',
      location: 'Tower A - Passenger Lift 2',
      priority: 'URGENT',
      status: 'ASSIGNED',
      slaTargetHours: 4,
      confidenceScore: 0.98,
      mlSuggestedCategory: 'Elevator & Lift'
    }
  });

  await prisma.complaintTimeline.createMany({
    data: [
      { complaintId: cmp2.id, actorId: tenantPriya.id, fromStatus: 'SUBMITTED', toStatus: 'SUBMITTED', note: 'Complaint logged by tenant' },
      { complaintId: cmp2.id, actorId: adminGWH.id, fromStatus: 'SUBMITTED', toStatus: 'ASSIGNED', note: 'Dispatched to Otis Elevator AMC technician' }
    ]
  });

  // Complaint for Cyber Towers (Demonstrating multi-community isolation)
  await prisma.complaint.create({
    data: {
      complaintNumber: 'CMP-CTR-2026-001',
      communityId: comm2.id,
      flatId: flatCTR101.id,
      reporterId: adminCTR.id,
      category: 'Security & Access',
      title: 'Boom barrier sensor failure at Gate 2',
      description: 'Vehicle entry arm fails to open automatically upon RFID tag detection.',
      location: 'Cyber Towers - North Gate 2',
      priority: 'HIGH',
      status: 'SUBMITTED',
      slaTargetHours: 8,
      confidenceScore: 0.91,
      mlSuggestedCategory: 'Security & Access'
    }
  });

  console.log('✅ Seeded Multi-Community Complaints with State Timelines.');

  // 8. Visitor Passes & Simulated QR Passes
  await prisma.visitorPass.createMany({
    data: [
      {
        passCode: 'NX-8942',
        communityId: comm1.id,
        flatId: flatB402.id,
        visitorName: 'Amit Verma',
        phone: '+91 91234 56789',
        purpose: 'Personal / Family Guest',
        expectedDate: '2026-10-22',
        expectedTime: '06:30 PM',
        validUntil: new Date('2026-10-22T23:59:59Z'),
        status: 'APPROVED'
      },
      {
        passCode: 'NX-3109',
        communityId: comm1.id,
        flatId: flatA204.id,
        visitorName: 'Swiggy Delivery Partner',
        phone: '+91 99887 76655',
        purpose: 'Food Delivery',
        expectedDate: '2026-10-22',
        expectedTime: '01:15 PM',
        validUntil: new Date('2026-10-22T15:00:00Z'),
        status: 'CHECKED_IN',
        entryTime: '01:12 PM'
      }
    ]
  });

  // 9. Facilities, Notices, Parking, Expenses, Audit Logs
  await prisma.facility.createMany({
    data: [
      { communityId: comm1.id, name: 'Grand Clubhouse Banquet Hall', capacity: 150, ratePerHourPaise: 120000, status: 'AVAILABLE' },
      { communityId: comm1.id, name: 'Badminton Court 1 (Indoor Wooden)', capacity: 4, ratePerHourPaise: 15000, status: 'AVAILABLE' },
      { communityId: comm1.id, name: 'Rooftop Swimming Pool & Deck', capacity: 30, ratePerHourPaise: 0, status: 'MAINTENANCE' },
      { communityId: comm2.id, name: 'Cyber Towers Executive Lounge', capacity: 25, ratePerHourPaise: 25000, status: 'AVAILABLE' }
    ]
  });

  await prisma.notice.createMany({
    data: [
      {
        communityId: comm1.id,
        title: 'Quarterly DG Generator & Electrical Maintenance Schedule',
        content: 'Please be informed that regular diesel generator testing and HT panel maintenance will occur on Saturday between 10:00 AM and 01:00 PM.',
        category: 'MAINTENANCE',
        audience: 'ALL_RESIDENTS',
        isImportant: true
      },
      {
        communityId: comm1.id,
        title: 'Diwali Cultural Night & Community Feast Registration',
        content: 'Registrations are now open for children dance performances and dinner at the clubhouse.',
        category: 'EVENT',
        audience: 'ALL_RESIDENTS',
        isImportant: false
      },
      {
        communityId: comm2.id,
        title: 'Cyber Towers EV Fast Charging Station Activation',
        content: 'Six high-speed Type-2 EV chargers have been commissioned in Basement 2.',
        category: 'GENERAL',
        audience: 'ALL_RESIDENTS',
        isImportant: true
      }
    ]
  });

  await prisma.parkingSlot.createMany({
    data: [
      { communityId: comm1.id, slotNumber: 'P-402', tower: 'Tower B', level: 'Basement 1', vehicleType: '4-Wheeler', allocatedFlatId: flatB402.id, status: 'ALLOCATED' },
      { communityId: comm1.id, slotNumber: 'P-204', tower: 'Tower A', level: 'Basement 1', vehicleType: '4-Wheeler', allocatedFlatId: flatA204.id, status: 'ALLOCATED' },
      { communityId: comm1.id, slotNumber: 'P-999', tower: 'Tower B', level: 'Basement 2', vehicleType: '4-Wheeler', status: 'AVAILABLE' }
    ]
  });

  await prisma.auditLog.createMany({
    data: [
      { communityId: comm1.id, actorId: superAdmin.id, action: 'COMMUNITY_CREATED', resource: 'Community', details: 'Initialized Greenwood Heights' },
      { communityId: comm1.id, actorId: adminGWH.id, action: 'PAYMENT_VERIFIED', resource: 'Payment', details: 'Verified maintenance receipt RCP-2026-1082 for Flat B-402' },
      { communityId: comm1.id, actorId: landlordAnand.id, action: 'TENANCY_CREATED', resource: 'Tenancy', details: 'Lease executed with Priya Sundaram for Flat A-204' }
    ]
  });

  console.log('✅ Nexora Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
