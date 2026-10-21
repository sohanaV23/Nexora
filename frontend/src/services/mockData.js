export const INITIAL_COMPLAINTS = [
  {
    id: 'CMP-2026-001',
    communityId: 'comm-1',
    title: 'Water leakage in Tower B basement parking ceiling',
    description: 'Continuous dripping water near slot P-42 is pooling on the floor and creating a slip hazard. Needs immediate inspection of overhead plumbing pipes.',
    category: 'Plumbing & Water',
    location: 'Tower B - Basement 1, Near Pillar P-42',
    priority: 'High',
    status: 'In Progress',
    reportedBy: 'Rohit Sharma (B-402)',
    assignedTo: 'Suresh Kumar',
    createdAt: '2026-10-21T09:30:00Z',
    updatedAt: '2026-10-21T11:45:00Z',
    slaTargetHours: 8,
    isOverdue: false,
    confidenceScore: 0.94,
    timeline: [
      { status: 'Submitted', timestamp: '2026-10-21 09:30 AM', note: 'Complaint logged by resident' },
      { status: 'Acknowledged', timestamp: '2026-10-21 10:00 AM', note: 'Verified by Society Admin' },
      { status: 'Assigned', timestamp: '2026-10-21 10:15 AM', note: 'Assigned to Suresh Kumar (Senior Electrician & Plumbing)' },
      { status: 'In Progress', timestamp: '2026-10-21 11:45 AM', note: 'Worker on site inspecting joint valve' }
    ]
  },
  {
    id: 'CMP-2026-002',
    communityId: 'comm-1',
    title: 'Tower A Lift 2 jerking and stopping between 4th and 5th floor',
    description: 'Elevator makes loud grinding sound when ascending past 4th floor. Multiple residents reported discomfort and delayed door opening.',
    category: 'Elevator & Lift',
    location: 'Tower A - Passenger Lift 2',
    priority: 'Urgent',
    status: 'Assigned',
    reportedBy: 'Kavita Reddy (A-501)',
    assignedTo: 'Otis Certified Technician',
    createdAt: '2026-10-21T14:10:00Z',
    updatedAt: '2026-10-21T14:25:00Z',
    slaTargetHours: 4,
    isOverdue: false,
    confidenceScore: 0.97,
    timeline: [
      { status: 'Submitted', timestamp: '2026-10-21 02:10 PM', note: 'Complaint logged by resident' },
      { status: 'Acknowledged', timestamp: '2026-10-21 02:15 PM', note: 'Marked Urgent by Admin' },
      { status: 'Assigned', timestamp: '2026-10-21 02:25 PM', note: 'Service ticket dispatched to AMC vendor' }
    ]
  },
  {
    id: 'CMP-2026-003',
    communityId: 'comm-1',
    title: 'Corridor light flickering outside Flat 401 & 402',
    description: 'LED tube light fixture in the hallway has been blinking rapidly for 2 days. Dim lighting is causing inconvenience.',
    category: 'Electrical',
    location: 'Tower B - 4th Floor Corridor',
    priority: 'Low',
    status: 'Resolved',
    reportedBy: 'Rohit Sharma (B-402)',
    assignedTo: 'Suresh Kumar',
    createdAt: '2026-10-19T10:00:00Z',
    updatedAt: '2026-10-20T16:00:00Z',
    slaTargetHours: 24,
    isOverdue: false,
    confidenceScore: 0.92,
    timeline: [
      { status: 'Submitted', timestamp: '2026-10-19 10:00 AM', note: 'Complaint created' },
      { status: 'Assigned', timestamp: '2026-10-19 11:30 AM', note: 'Assigned to Suresh Kumar' },
      { status: 'In Progress', timestamp: '2026-10-20 02:00 PM', note: 'Replaced ballast and 18W LED fixture' },
      { status: 'Resolved', timestamp: '2026-10-20 04:00 PM', note: 'Lighting tested and functional' }
    ]
  },
  {
    id: 'CMP-2026-004',
    communityId: 'comm-1',
    title: 'Garbage chute blockage on 7th floor',
    description: 'Debris stuck inside the disposal door prevents chute from closing securely. Foul odor spreading into common corridor.',
    category: 'Cleaning & Waste',
    location: 'Tower A - 7th Floor Utility Area',
    priority: 'High',
    status: 'Overdue',
    reportedBy: 'Venkatesh Iyer (A-704)',
    assignedTo: 'Sanitation Team',
    createdAt: '2026-10-18T08:00:00Z',
    updatedAt: '2026-10-19T09:00:00Z',
    slaTargetHours: 12,
    isOverdue: true,
    confidenceScore: 0.89,
    timeline: [
      { status: 'Submitted', timestamp: '2026-10-18 08:00 AM', note: 'Logged by resident' },
      { status: 'Assigned', timestamp: '2026-10-18 09:30 AM', note: 'Assigned to Sanitation Team' },
      { status: 'Overdue', timestamp: '2026-10-18 08:00 PM', note: 'SLA target exceeded. Escalated to Association President' }
    ]
  }
];

export const INITIAL_NOTICES = [
  {
    id: 'NOT-01',
    communityId: 'comm-1',
    title: 'Quarterly DG Generator & Electrical Maintenance Schedule',
    content: 'Please be informed that regular diesel generator testing and HT panel maintenance will occur on Saturday, Oct 25 between 10:00 AM and 01:00 PM. Brief power switchovers may occur.',
    category: 'Maintenance',
    audience: 'All Residents',
    publishedAt: '2026-10-20',
    expiresAt: '2026-10-26',
    isImportant: true
  },
  {
    id: 'NOT-02',
    communityId: 'comm-1',
    title: 'Diwali Cultural Night & Community Feast Registration',
    content: 'Registrations are now open for children dance performances and clubhouse dinner. Please submit food preferences before Oct 28.',
    category: 'Event',
    audience: 'All Residents',
    publishedAt: '2026-10-18',
    expiresAt: '2026-10-29',
    isImportant: false
  }
];

export const INITIAL_VISITORS = [
  {
    id: 'VIS-001',
    passCode: 'NX-8942',
    visitorName: 'Amit Verma',
    phone: '+91 91234 56789',
    visitingFlat: 'Tower B - Flat 402 (Rohit Sharma)',
    purpose: 'Personal / Family Guest',
    expectedDate: '2026-10-22',
    expectedTime: '06:30 PM',
    status: 'Approved',
    entryTime: null,
    exitTime: null
  },
  {
    id: 'VIS-002',
    passCode: 'NX-3109',
    visitorName: 'Swiggy Delivery Partner',
    phone: '+91 99887 76655',
    visitingFlat: 'Tower A - Flat 204 (Sunita Sen)',
    purpose: 'Food Delivery',
    expectedDate: '2026-10-22',
    expectedTime: '01:15 PM',
    status: 'Checked In',
    entryTime: '01:12 PM',
    exitTime: null
  }
];

export const INITIAL_DUES = [
  {
    id: 'DUE-OCT-26',
    month: 'October 2026',
    flat: 'Tower B - 402',
    resident: 'Rohit Sharma',
    amount: 3500,
    dueDate: '2026-10-15',
    status: 'Paid',
    paidOn: '2026-10-10',
    receiptNumber: 'RCP-2026-1082'
  },
  {
    id: 'DUE-NOV-26',
    month: 'November 2026',
    flat: 'Tower B - 402',
    resident: 'Rohit Sharma',
    amount: 3500,
    dueDate: '2026-11-15',
    status: 'Pending',
    paidOn: null,
    receiptNumber: null
  }
];

export const INITIAL_FACILITIES = [
  { id: 'fac-1', name: 'Grand Clubhouse Banquet Hall', capacity: 150, ratePerHour: 1200, status: 'Available' },
  { id: 'fac-2', name: 'Badminton Court 1 (Indoor Wooden)', capacity: 4, ratePerHour: 150, status: 'Available' },
  { id: 'fac-3', name: 'Rooftop Swimming Pool & Deck', capacity: 30, ratePerHour: 0, status: 'Under Maintenance' },
  { id: 'fac-4', name: 'Conference & Co-working Lounge', capacity: 20, ratePerHour: 300, status: 'Available' }
];

export const INITIAL_PARKING_SLOTS = [
  { slotNumber: 'P-101', tower: 'Tower A', level: 'Basement 1', vehicleType: '4-Wheeler', allocatedTo: 'Flat A-101', status: 'Allocated' },
  { slotNumber: 'P-102', tower: 'Tower A', level: 'Basement 1', vehicleType: '4-Wheeler', allocatedTo: 'Flat A-102', status: 'Allocated' },
  { slotNumber: 'P-402', tower: 'Tower B', level: 'Basement 1', vehicleType: '4-Wheeler', allocatedTo: 'Flat B-402 (Rohit Sharma)', status: 'Allocated' },
  { slotNumber: 'P-403', tower: 'Tower B', level: 'Basement 1', vehicleType: '4-Wheeler', allocatedTo: null, status: 'Available' }
];
