import { AttendeeRegistration, PaymentStatus, RegistrationType } from '../types';
import { OFFICIAL_MYTHICAL_GROUPS } from './mythicalGroups';

// Filipino first and last names for generating authentic student identities
const FIRST_NAMES = [
  'Christian Dave', 'Alyssa Mae', 'Jian Carlo', 'Kaye Andrea', 'Marc Joshua',
  'Patricia Gail', 'Angelo Miguel', 'Bianca Nicole', 'Rafael Dominic', 'Kimberly Joy',
  'Gabriel Sebastian', 'Dennis Ray', 'Maria Cristina', 'John Paul', 'Joshua Miguel',
  'Bea Patricia', 'Mark Nathaniel', 'Samantha Nicole', 'Ethan Miguel', 'Chloe Danielle',
  'Justin Kyle', 'Danielle Louise', 'Kevin Vance', 'Princess Jasmine', 'Hannah Marie',
  'Paolo Enrico', 'Stephanie Joy', 'Katrina Anne', 'Carlo Miguel', 'Janelle Faye',
  'Rommel John', 'Danica Rose', 'Cedric Paul', 'Rachelle Ann', 'Jericho Luke',
  'Kenneth Brian', 'Angelica Mae', 'Leandro Jose', 'Trisha Nicole', 'Adrian Neil',
  'Renz Michael', 'Maricar Lyn', 'Francis Dominic', 'Jasmine Claire', 'Alden Christopher',
  'Claire Denise', 'Vince Andrew', 'Krizza Joy', 'Kurt Matthew', 'Eunice Mae',
  'Geraldine', 'Marlon Jude', 'Arabelle Rose', 'Jomari Karl', 'Ezekiel Sean',
  'Nathaniel Troy', 'Charisse Jane', 'Bryan Matthew', 'Rowena Grace', 'Lorenzo Gabriel'
];

const LAST_NAMES = [
  'Perez', 'Santos', 'Reyes', 'Villanueva', 'Dizon', 'Ramos', 'Cruz', 'Flores',
  'Bautista', 'Aguilar', 'Castro', 'Mendoza', 'Torres', 'Alcantara', 'Dimaculangan',
  'Navarro', 'Garcia', 'Dela Cruz', 'Del Rosario', 'Mercado', 'Soriano', 'Salazar',
  'Valenzuela', 'Morales', 'Tolentino', 'Castillo', 'Espiritu', 'Aquino', 'Santiago',
  'Manalo', 'San Jose', 'Bernardo', 'Gutierrez', 'Ocampo', 'David', 'De Leon',
  'Corpuz', 'Vergara', 'Cabrera', 'Sarmiento', 'Magat', 'Pascual', 'Miranda',
  'Hernandez', 'Fajardo', 'Robles', 'Ignacio', 'Rivera', 'Montemayor', 'Buan'
];

// Linear congruential pseudorandom generator for deterministic seeded generation
function makeRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function generateLargeAttendeeDataset(totalCount: number = 550): AttendeeRegistration[] {
  const rng = makeRandom(429184);
  const attendees: AttendeeRegistration[] = [];
  const usedStudentIds = new Set<string>();

  const groupNames = OFFICIAL_MYTHICAL_GROUPS.map((g) => g.name);

  // Program and section configurations
  const programs = [
    {
      course: 'BS Information Technology',
      prefix: 'BSIT',
      weight: 0.55,
      sections: {
        '1st Year': ['BSIT-1A', 'BSIT-1B', 'BSIT-1C', 'BSIT-1D'],
        '2nd Year': ['BSIT-2A', 'BSIT-2B', 'BSIT-2C'],
        '3rd Year': ['BSIT-3A', 'BSIT-3B', 'BSIT-3C'],
        '4th Year': ['BSIT-4A', 'BSIT-4B'],
      },
    },
    {
      course: 'BS Computer Science',
      prefix: 'BSCS',
      weight: 0.30,
      sections: {
        '1st Year': ['BSCS-1A', 'BSCS-1B'],
        '2nd Year': ['BSCS-2A', 'BSCS-2B'],
        '3rd Year': ['BSCS-3A'],
        '4th Year': ['BSCS-4A'],
      },
    },
    {
      course: 'BS Information Systems',
      prefix: 'BSIS',
      weight: 0.15,
      sections: {
        '1st Year': ['BSIS-1A', 'BSIS-1B'],
        '2nd Year': ['BSIS-2A'],
        '3rd Year': ['BSIS-3A'],
        '4th Year': ['BSIS-4A'],
      },
    },
  ];

  const yearLevels: ('1st Year' | '2nd Year' | '3rd Year' | '4th Year')[] = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
  ];

  // Specific initial highlighted seeds for consistency with previous test data
  const pinnedSeeds: Partial<AttendeeRegistration>[] = [
    {
      studentId: '84920184',
      fullName: 'Christian Dave Perez',
      course: 'BS Information Technology',
      section: 'BSIT-3A',
      yearLevel: '3rd Year',
      groupAssignment: 'Kapre',
      registrationType: 'EARLY BIRD',
      amount: 350,
      expectedAmount: 350,
      actualAmount: 350,
      paymentStatus: 'PAID',
      datePaid: '2026-09-01',
      status: 'CONFIRMED',
      registeredAt: '2026-09-01T09:14:00Z',
    },
    {
      studentId: '51930281',
      fullName: 'Alyssa Mae Santos',
      course: 'BS Computer Science',
      section: 'BSCS-2A',
      yearLevel: '2nd Year',
      groupAssignment: 'Sigbin',
      registrationType: 'EARLY BIRD',
      amount: 350,
      expectedAmount: 350,
      actualAmount: 350,
      paymentStatus: 'PAID',
      datePaid: '2026-09-01',
      status: 'CHECKED_IN',
      registeredAt: '2026-09-01T10:22:00Z',
    },
    {
      studentId: '74029184',
      fullName: 'Jian Carlo Reyes',
      course: 'BS Information Technology',
      section: 'BSIT-1A',
      yearLevel: '1st Year',
      groupAssignment: 'Aswang',
      registrationType: 'REGULAR',
      amount: 450,
      expectedAmount: 450,
      actualAmount: 450,
      paymentStatus: 'PAID',
      datePaid: '2026-09-02',
      status: 'CONFIRMED',
      registeredAt: '2026-09-02T11:05:00Z',
    },
    {
      studentId: '39104829',
      fullName: 'Kaye Andrea Villanueva',
      course: 'BS Information Technology',
      section: 'BSIT-4A',
      yearLevel: '4th Year',
      groupAssignment: 'Tikbalang',
      registrationType: 'REGULAR',
      amount: 450,
      expectedAmount: 450,
      actualAmount: 450,
      paymentStatus: 'PAID',
      datePaid: '2026-09-02',
      status: 'CONFIRMED',
      registeredAt: '2026-09-02T14:30:00Z',
    },
    {
      studentId: '60294817',
      fullName: 'Marc Joshua Dizon',
      course: 'BS Computer Science',
      section: 'BSCS-1A',
      yearLevel: '1st Year',
      groupAssignment: 'Chanak',
      registrationType: 'EARLY BIRD',
      amount: 350,
      expectedAmount: 350,
      actualAmount: 350,
      paymentStatus: 'PAID',
      datePaid: '2026-09-03',
      status: 'CONFIRMED',
      registeredAt: '2026-09-03T08:45:00Z',
    },
    {
      studentId: '48201948',
      fullName: 'Patricia Gail Ramos',
      course: 'BS Information Systems',
      section: 'BSIS-2A',
      yearLevel: '2nd Year',
      groupAssignment: 'Shokoy',
      registrationType: 'REGULAR',
      amount: 450,
      expectedAmount: 450,
      actualAmount: 0,
      paymentStatus: 'UNPAID',
      datePaid: 'UNPAID',
      status: 'PENDING',
      registeredAt: '2026-09-03T16:10:00Z',
    },
    {
      studentId: '91827364',
      fullName: 'Angelo Miguel Cruz',
      course: 'BS Information Technology',
      section: 'BSIT-3A',
      yearLevel: '3rd Year',
      groupAssignment: 'Manananggal',
      registrationType: 'EARLY BIRD',
      amount: 350,
      expectedAmount: 350,
      actualAmount: 350,
      paymentStatus: 'PAID',
      datePaid: '2026-09-04',
      status: 'CONFIRMED',
      registeredAt: '2026-09-04T12:00:00Z',
    },
    {
      studentId: '72940182',
      fullName: 'Bianca Nicole Flores',
      course: 'BS Computer Science',
      section: 'BSCS-1A',
      yearLevel: '1st Year',
      groupAssignment: 'Duwende',
      registrationType: 'EARLY BIRD',
      amount: 350,
      expectedAmount: 350,
      actualAmount: 350,
      paymentStatus: 'PAID',
      datePaid: '2026-09-05',
      status: 'CONFIRMED',
      registeredAt: '2026-09-05T09:15:00Z',
    },
    {
      studentId: '58291047',
      fullName: 'Rafael Dominic Bautista',
      course: 'BS Information Technology',
      section: 'BSIT-4A',
      yearLevel: '4th Year',
      groupAssignment: 'Mangkukulam',
      registrationType: 'REGULAR',
      amount: 450,
      expectedAmount: 450,
      actualAmount: 450,
      paymentStatus: 'PAID',
      datePaid: '2026-09-05',
      status: 'CHECKED_IN',
      registeredAt: '2026-09-05T15:40:00Z',
    },
    {
      studentId: '30194820',
      fullName: 'Kimberly Joy Aguilar',
      course: 'BS Information Systems',
      section: 'BSIS-2A',
      yearLevel: '2nd Year',
      groupAssignment: 'Sirena',
      registrationType: 'EARLY BIRD',
      amount: 350,
      expectedAmount: 350,
      actualAmount: 0,
      paymentStatus: 'PENDING',
      datePaid: 'PENDING VERIFICATION',
      status: 'PENDING',
      registeredAt: '2026-09-06T11:20:00Z',
    },
    {
      studentId: '85920194',
      fullName: 'Gabriel Sebastian Castro',
      course: 'BS Computer Science',
      section: 'BSCS-3A',
      yearLevel: '3rd Year',
      groupAssignment: 'Diwata',
      registrationType: 'REGULAR',
      amount: 450,
      expectedAmount: 450,
      actualAmount: 450,
      paymentStatus: 'PAID',
      datePaid: '2026-09-07',
      status: 'CONFIRMED',
      registeredAt: '2026-09-07T09:30:00Z',
    },
    {
      studentId: '63820194',
      fullName: 'Dennis Ray Mendoza',
      course: 'BS Information Technology',
      section: 'BSIT-1A',
      yearLevel: '1st Year',
      groupAssignment: 'Otlum',
      registrationType: 'EARLY BIRD',
      amount: 350,
      expectedAmount: 350,
      actualAmount: 350,
      paymentStatus: 'PAID',
      datePaid: '2026-09-07',
      status: 'CONFIRMED',
      registeredAt: '2026-09-07T14:15:00Z',
    },
  ];

  // Insert pinned seeds first
  pinnedSeeds.forEach((seed, index) => {
    const id = `reg-seed-${String(index + 1).padStart(3, '0')}`;
    usedStudentIds.add(seed.studentId!);
    attendees.push({
      id,
      studentId: seed.studentId!,
      fullName: seed.fullName!,
      course: seed.course!,
      section: seed.section!,
      yearLevel: seed.yearLevel as '1st Year' | '2nd Year' | '3rd Year' | '4th Year',
      registrationType: seed.registrationType as RegistrationType,
      amount: seed.amount!,
      expectedAmount: seed.expectedAmount!,
      actualAmount: seed.actualAmount!,
      paymentStatus: seed.paymentStatus as PaymentStatus,
      datePaid: seed.datePaid!,
      groupAssignment: seed.groupAssignment!,
      registeredAt: seed.registeredAt!,
      status: seed.status as 'CONFIRMED' | 'CHECKED_IN' | 'PENDING',
    });
  });

  // Balanced group pointer
  let groupIndex = 0;

  // Generate remaining attendees
  while (attendees.length < totalCount) {
    const i = attendees.length;

    // Generate unique 8-digit student ID
    let studentId = '';
    do {
      const num = Math.floor(10000000 + rng() * 89999999);
      studentId = String(num);
    } while (usedStudentIds.has(studentId));
    usedStudentIds.add(studentId);

    // Pick name
    const firstName = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
    const fullName = `${firstName} ${lastName}`;

    // Pick course by weight
    const pRoll = rng();
    const program =
      pRoll < 0.55
        ? programs[0]
        : pRoll < 0.85
        ? programs[1]
        : programs[2];

    // Pick year level
    const yRoll = rng();
    const yearLevel =
      yRoll < 0.35
        ? '1st Year'
        : yRoll < 0.65
        ? '2nd Year'
        : yRoll < 0.85
        ? '3rd Year'
        : '4th Year';

    // Pick section
    const sectionOptions = program.sections[yearLevel];
    const section = sectionOptions[Math.floor(rng() * sectionOptions.length)];

    // Registration Type: 60% Early Bird, 40% Regular
    const isEarlyBird = rng() < 0.60;
    const registrationType: RegistrationType = isEarlyBird ? 'EARLY BIRD' : 'REGULAR';
    const expectedAmount = isEarlyBird ? 350 : 450;

    // Payment Status: 78% Paid, 15% Unpaid, 7% Pending
    const payRoll = rng();
    let paymentStatus: PaymentStatus = 'PAID';
    let actualAmount = expectedAmount;
    let datePaid = '';
    let status: 'CONFIRMED' | 'CHECKED_IN' | 'PENDING' = 'CONFIRMED';

    // Calculate dates between Aug 20 and Sept 08 2026
    const dayOffset = Math.floor(rng() * 20);
    const day = String(20 + (dayOffset % 11)).padStart(2, '0');
    const month = dayOffset < 11 ? '08' : '09';
    const hour = String(Math.floor(8 + rng() * 10)).padStart(2, '0');
    const minute = String(Math.floor(rng() * 60)).padStart(2, '0');
    const registeredAt = `2026-${month}-${day}T${hour}:${minute}:00Z`;

    if (payRoll < 0.78) {
      paymentStatus = 'PAID';
      actualAmount = expectedAmount;
      datePaid = `2026-${month}-${day}`;
      status = rng() < 0.18 ? 'CHECKED_IN' : 'CONFIRMED';
    } else if (payRoll < 0.93) {
      paymentStatus = 'UNPAID';
      actualAmount = 0;
      datePaid = 'UNPAID';
      status = 'PENDING';
    } else {
      paymentStatus = 'PENDING';
      actualAmount = 0;
      datePaid = 'PENDING VERIFICATION';
      status = 'PENDING';
    }

    // Allocate Mythical Creature Group in round-robin fashion for balanced rosters
    const groupAssignment = groupNames[groupIndex % groupNames.length];
    groupIndex++;

    attendees.push({
      id: `reg-${String(i + 1).padStart(4, '0')}`,
      studentId,
      fullName,
      section,
      yearLevel,
      course: program.course,
      registrationType,
      amount: actualAmount,
      expectedAmount,
      actualAmount,
      paymentStatus,
      datePaid,
      groupAssignment,
      registeredAt,
      status,
    });
  }

  return attendees;
}
