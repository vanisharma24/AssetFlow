import { db } from './db'
import { hashPassword } from './utils/auth'

async function main() {
  console.log('Starting seeding database...')

  // 1. Clean existing records in correct order of dependency
  await db.activityLog.deleteMany({})
  await db.notification.deleteMany({})
  await db.auditFinding.deleteMany({})
  await db.auditAssignment.deleteMany({})
  await db.auditCycle.deleteMany({})
  await db.maintenanceReq.deleteMany({})
  await db.transferRequest.deleteMany({})
  await db.booking.deleteMany({})
  await db.allocation.deleteMany({})
  await db.asset.deleteMany({})
  await db.assetCategory.deleteMany({})
  await db.user.deleteMany({})
  await db.department.deleteMany({})

  console.log('Cleaned old records.')

  // 2. Create Departments
  const itDept = await db.department.create({
    data: { name: 'IT dept', status: 'Active' }
  })
  const opsDept = await db.department.create({
    data: { name: 'Operations', status: 'Active' }
  })
  const hrDept = await db.department.create({
    data: { name: 'HR', status: 'Active' }
  })

  // 3. Create Users
  const passHash = await hashPassword('password123')

  const priya = await db.user.create({
    data: {
      name: 'Priya shah',
      email: 'priya@example.com',
      passwordHash: passHash,
      departmentId: itDept.id,
      role: 'Employee',
      status: 'Active'
    }
  })

  const arushi = await db.user.create({
    data: {
      name: 'Arushi',
      email: 'arushi@gmail.com',
      passwordHash: passHash,
      departmentId: itDept.id,
      role: 'Admin',
      status: 'Active'
    }
  })

  const pallavi = await db.user.create({
    data: {
      name: 'pallavi',
      email: 'pallavi@gmail.com',
      passwordHash: passHash,
      departmentId: hrDept.id,
      role: 'Employee',
      status: 'Active'
    }
  })

  const postman = await db.user.create({
    data: {
      name: 'Postman User',
      email: 'postman@example.com',
      passwordHash: passHash,
      role: 'Employee',
      status: 'Active'
    }
  })

  const testUser = await db.user.create({
    data: {
      name: 'Test User',
      email: 'test2@example.com',
      passwordHash: passHash,
      role: 'Employee',
      status: 'Active'
    }
  })

  console.log('Seeded users.')

  // 4. Create Categories
  const laptopsCat = await db.assetCategory.create({
    data: { name: 'Laptops' }
  })
  const roomsCat = await db.assetCategory.create({
    data: { name: 'Meeting Rooms' }
  })
  const projectorsCat = await db.assetCategory.create({
    data: { name: 'Projectors' }
  })
  const furnitureCat = await db.assetCategory.create({
    data: { name: 'Furniture' }
  })

  // 5. Create Assets
  // Available assets total: 128
  // Out of 128 available assets, 4 will be Bookable
  // We'll create:
  // - 124 available, non-bookable Laptops and Furniture
  // - 4 available, bookable assets:
  //    - Room B2 (Meeting Room)
  //    - Projector AF-0062 (Projector)
  //    - Meeting Room A (Meeting Room)
  //    - Projector AF-0077 (Projector)

  const availableAssetsData = []

  // Add Room B2 (AF-0010)
  availableAssetsData.push({
    assetTag: 'AF-0010',
    name: 'Room B2',
    categoryId: roomsCat.id,
    serialNumber: 'RM-B2-BLDG-1',
    acquisitionDate: new Date('2025-01-10'),
    acquisitionCost: 15000,
    condition: 'Excellent',
    location: 'Building A, 2nd Floor',
    isBookable: true,
    status: 'Available' as const
  })

  // Add Projector AF-0062
  availableAssetsData.push({
    assetTag: 'AF-0062',
    name: 'Projector AF-0062',
    categoryId: projectorsCat.id,
    serialNumber: 'PR-J62-SONY',
    acquisitionDate: new Date('2025-03-15'),
    acquisitionCost: 1200,
    condition: 'Good',
    location: 'Conference Room 3',
    isBookable: true,
    status: 'Available' as const
  })

  // Add 2 more bookable available assets
  availableAssetsData.push({
    assetTag: 'AF-0077',
    name: 'Projector AF-0077',
    categoryId: projectorsCat.id,
    serialNumber: 'PR-J77-EPSON',
    acquisitionDate: new Date('2025-05-12'),
    acquisitionCost: 1100,
    condition: 'Good',
    location: 'Conference Room 4',
    isBookable: true,
    status: 'Available' as const
  })

  availableAssetsData.push({
    assetTag: 'AF-0005',
    name: 'Meeting Room A',
    categoryId: roomsCat.id,
    serialNumber: 'RM-A-BLDG-1',
    acquisitionDate: new Date('2025-01-05'),
    acquisitionCost: 12000,
    condition: 'Excellent',
    location: 'Building A, 1st Floor',
    isBookable: true,
    status: 'Available' as const
  })

  // Add 124 available, non-bookable assets
  for (let i = 1; i <= 124; i++) {
    const isLaptop = i % 2 === 0
    availableAssetsData.push({
      assetTag: `AF-A${String(i).padStart(4, '0')}`,
      name: isLaptop ? `Laptop Latitude L${i}` : `Office Desk D${i}`,
      categoryId: isLaptop ? laptopsCat.id : furnitureCat.id,
      serialNumber: `SN-AV-${i * 999}`,
      acquisitionDate: new Date(Date.now() - i * 24 * 3600 * 1000),
      acquisitionCost: isLaptop ? 1200 : 350,
      condition: i % 10 === 0 ? 'Fair' : 'Good',
      location: i % 3 === 0 ? 'HQ, Room 101' : i % 3 === 1 ? 'HQ, Room 102' : 'HQ, Room 103',
      isBookable: false,
      status: 'Available' as const
    })
  }

  // Create available assets in database
  for (const data of availableAssetsData) {
    await db.asset.create({ data })
  }

  console.log('Seeded available assets:', availableAssetsData.length)

  // Allocated assets: 76
  // One of them is Laptop AF-0114 (allocated to Priya Shah)
  // Let's create:
  // - 1 special laptop Laptop AF-0114
  // - 75 general allocated assets

  const allocatedAssetsData = []

  // Add Laptop AF-0114
  const specialLaptop = await db.asset.create({
    data: {
      assetTag: 'AF-0114',
      name: 'Laptop AF-0114',
      categoryId: laptopsCat.id,
      serialNumber: 'SN-LAP-P114',
      acquisitionDate: new Date('2025-02-20'),
      acquisitionCost: 1400,
      condition: 'Good',
      location: 'HQ, IT Room',
      isBookable: false,
      status: 'Allocated'
    }
  })

  // Allocation for Laptop AF-0114 to Priya Shah
  await db.allocation.create({
    data: {
      assetId: specialLaptop.id,
      holderType: 'Employee',
      holderId: priya.id,
      employeeId: priya.id,
      allocatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      expectedReturnDate: new Date(Date.now() + 25 * 24 * 3600 * 1000),
      status: 'Active'
    }
  })

  // Create 75 more allocated assets
  // 3 will be Overdue allocations
  // 12 will be Upcoming returns (expectedReturnDate in next 7 days)
  // 60 will be other active allocations
  const usersList = [priya, arushi, pallavi, postman, testUser]
  const deptsList = [itDept, opsDept, hrDept]

  for (let i = 1; i <= 75; i++) {
    const isLaptop = i % 2 === 0
    const asset = await db.asset.create({
      data: {
        assetTag: `AF-L${String(i).padStart(4, '0')}`,
        name: isLaptop ? `Employee Laptop E${i}` : `Ergonomic Chair C${i}`,
        categoryId: isLaptop ? laptopsCat.id : furnitureCat.id,
        serialNumber: `SN-ALLOC-${i * 777}`,
        acquisitionDate: new Date(Date.now() - (i + 10) * 24 * 3600 * 1000),
        acquisitionCost: isLaptop ? 1500 : 250,
        condition: 'Good',
        location: 'HQ, Main Office',
        isBookable: false,
        status: 'Allocated'
      }
    })

    const isDeptAllocation = i % 10 === 0
    const holderUser = usersList[i % usersList.length]
    const holderDept = deptsList[i % deptsList.length]

    let expectedReturnDate: Date
    let status: 'Active' | 'Returned' | 'Overdue' = 'Active'

    if (i <= 3) {
      // Overdue returns
      expectedReturnDate = new Date(Date.now() - i * 2 * 24 * 3600 * 1000) // in the past
    } else if (i <= 15) {
      // Upcoming returns
      expectedReturnDate = new Date(Date.now() + (i - 3) * 12 * 3600 * 1000) // in the next few days
    } else {
      // Future allocations
      expectedReturnDate = new Date(Date.now() + i * 3 * 24 * 3600 * 1000) // far future
    }

    await db.allocation.create({
      data: {
        assetId: asset.id,
        holderType: isDeptAllocation ? 'Department' : 'Employee',
        holderId: isDeptAllocation ? holderDept.id : holderUser.id,
        employeeId: isDeptAllocation ? null : holderUser.id,
        departmentId: isDeptAllocation ? holderDept.id : null,
        allocatedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000),
        expectedReturnDate,
        status: 'Active'
      }
    })
  }

  console.log('Seeded allocated assets and allocations: 76')

  // 6. Create Bookings (Total active bookings = 9)
  // Let's find the Room B2 to use it in one of the bookings
  const roomB2Asset = await db.asset.findUnique({ where: { assetTag: 'AF-0010' } })
  const meetingRoomAAsset = await db.asset.findUnique({ where: { assetTag: 'AF-0005' } })
  const proj0077Asset = await db.asset.findUnique({ where: { assetTag: 'AF-0077' } })

  if (roomB2Asset) {
    // Room B2 booking today from 2:00 PM to 3:00 PM
    const today = new Date()
    const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0, 0)
    const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0, 0)

    await db.booking.create({
      data: {
        assetId: roomB2Asset.id,
        bookedBy: priya.id,
        startTime,
        endTime,
        status: 'Upcoming'
      }
    })
  }

  // Create 8 more bookings
  const bookableAssets = [meetingRoomAAsset, proj0077Asset].filter(Boolean) as any[]
  for (let i = 1; i <= 8; i++) {
    const asset = bookableAssets[i % bookableAssets.length]
    const bookedUser = usersList[i % usersList.length]
    const today = new Date()
    const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i, 10, 0, 0)
    const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i, 11, 30, 0)

    await db.booking.create({
      data: {
        assetId: asset.id,
        bookedBy: bookedUser.id,
        startTime,
        endTime,
        status: 'Upcoming'
      }
    })
  }

  console.log('Seeded 9 active bookings.')

  // 7. Create Transfers (Total pending transfers = 3)
  // We'll create 3 transfer requests with status 'Requested'
  // We need allocated assets to request transfers on.
  const allocatedAssets = await db.asset.findMany({
    where: { status: 'Allocated' },
    take: 3
  })

  for (let i = 0; i < allocatedAssets.length; i++) {
    const asset = allocatedAssets[i]
    const activeAlloc = await db.allocation.findFirst({
      where: { assetId: asset.id, status: 'Active' }
    })

    if (activeAlloc) {
      const fromId = activeAlloc.holderId
      const toUser = usersList[(i + 1) % usersList.length]

      await db.transferRequest.create({
        data: {
          assetId: asset.id,
          fromHolderId: fromId,
          toHolderId: toUser.id,
          requestedBy: toUser.id,
          status: 'Requested'
        }
      })
    }
  }

  console.log('Seeded 3 pending transfers.')

  // 8. Create Maintenance Request (Projector AF-0062 - maintenance resolved)
  const projectorAsset = await db.asset.findUnique({ where: { assetTag: 'AF-0062' } })
  if (projectorAsset) {
    await db.maintenanceReq.create({
      data: {
        assetId: projectorAsset.id,
        raisedBy: arushi.id,
        issueDescription: 'Projector lamp flickers intermittently.',
        priority: 'Medium',
        status: 'Resolved'
      }
    })
  }

  // Also seed 2 pending maintenances to verify dashboard count "pendingMaintenance" (we need 0 in mockup? Wait, the mockup does not have a "pending maintenance" card directly, but let's check. The mockup has: Available 128, Allocated 76, Available 4, Active Bookings 9, Pending Transfers 3, Upcoming returns 12. Oh! It does not show "pending maintenance" count on the cards, but we can seed it anyway).
  if (projectorAsset) {
    await db.maintenanceReq.create({
      data: {
        assetId: projectorAsset.id,
        raisedBy: pallavi.id,
        issueDescription: 'Lens needs cleaning.',
        priority: 'Low',
        status: 'Pending'
      }
    })
  }

  console.log('Seeded maintenance request.')

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
