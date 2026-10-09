import { PrismaClient, Role, MemberStatus, TrainerStatus, PlanStatus, MembershipStatus, PaymentMethod, PaymentStatus, AttendanceStatus, Gender, SalaryType, EmploymentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting O2Hyperfit database seeding...");

  // Clean existing data in reverse order of dependencies
  await prisma.salaryHistory.deleteMany();
  await prisma.staffSalary.deleteMany();
  await prisma.homePageRevision.deleteMany();
  await prisma.homePage.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.gymSettings.deleteMany();
  await prisma.bodyAssessment.deleteMany();
  await prisma.progressRecord.deleteMany();
  await prisma.workoutExercise.deleteMany();
  await prisma.workoutPlan.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.membershipPlan.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.member.deleteMany();
  await prisma.trainer.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cleared existing data.");

  // Password hashes
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const trainerPassword = await bcrypt.hash("Trainer@123", 10);
  const memberPassword = await bcrypt.hash("Member@123", 10);

  // 1. Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@o2hyperfit.com",
      passwordHash: adminPassword,
      role: Role.ADMIN,
      name: "Alex Vance",
      phone: "+91 98765 43210",
    },
  });

  // 2. Create Trainers & Users
  const trainerUser1 = await prisma.user.create({
    data: {
      email: "trainer@o2hyperfit.com",
      passwordHash: trainerPassword,
      role: Role.TRAINER,
      name: "Marcus Stone",
      phone: "+91 98765 12345",
    },
  });

  const trainer1 = await prisma.trainer.create({
    data: {
      userId: trainerUser1.id,
      trainerId: "TR-001",
      name: "Marcus Stone",
      email: "trainer@o2hyperfit.com",
      phone: "+91 98765 12345",
      specialization: "Strength & Hypertrophy Conditioning",
      experienceYears: 7,
      status: TrainerStatus.ACTIVE,
      joiningDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    },
  });

  const trainerUser2 = await prisma.user.create({
    data: {
      email: "sarah.trainer@o2hyperfit.com",
      passwordHash: trainerPassword,
      role: Role.TRAINER,
      name: "Sarah Jenkins",
      phone: "+91 98765 67890",
    },
  });

  const trainer2 = await prisma.trainer.create({
    data: {
      userId: trainerUser2.id,
      trainerId: "TR-002",
      name: "Sarah Jenkins",
      email: "sarah.trainer@o2hyperfit.com",
      phone: "+91 98765 67890",
      specialization: "Functional Fitness, Yoga & Weight Loss",
      experienceYears: 5,
      status: TrainerStatus.ACTIVE,
      joiningDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
    },
  });

  // 3. Create Membership Plans
  const planMonthly = await prisma.membershipPlan.create({
    data: {
      name: "Basic Monthly",
      durationMonths: 1,
      price: 1999,
      description: "Full access to gym floor, cardio zone, and locker facilities.",
      status: PlanStatus.ACTIVE,
    },
  });

  const planQuarterly = await prisma.membershipPlan.create({
    data: {
      name: "Standard Quarterly",
      durationMonths: 3,
      price: 4999,
      description: "Full gym access + 2 complimentary trainer consultations + locker room.",
      status: PlanStatus.ACTIVE,
    },
  });

  const planAnnual = await prisma.membershipPlan.create({
    data: {
      name: "Elite Annual",
      durationMonths: 12,
      price: 14999,
      description: "All-inclusive gym, sauna, custom diet plans, and priority trainer support.",
      status: PlanStatus.ACTIVE,
    },
  });

  const planVIP = await prisma.membershipPlan.create({
    data: {
      name: "VIP Personal Training (6 Mo)",
      durationMonths: 6,
      price: 19999,
      description: "Dedicated personal trainer 3x weekly, monthly BMI analysis, customized nutrition.",
      status: PlanStatus.ACTIVE,
    },
  });

  // 4. Create Members
  // Member 1 (Primary demo member)
  const memberUser1 = await prisma.user.create({
    data: {
      email: "member@o2hyperfit.com",
      passwordHash: memberPassword,
      role: Role.MEMBER,
      name: "Rohan Sharma",
      phone: "+91 98111 22334",
    },
  });

  const member1 = await prisma.member.create({
    data: {
      userId: memberUser1.id,
      memberId: "MEM-001",
      fullName: "Rohan Sharma",
      email: "member@o2hyperfit.com",
      phone: "+91 98111 22334",
      address: "Flat 402, Green Glen Heights, Bangalore",
      dateOfBirth: new Date("1996-05-14"),
      gender: Gender.MALE,
      height: 178,
      weight: 76.5,
      emergencyContact: "Anita Sharma (Mother) - +91 98111 22335",
      joiningDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      assignedTrainerId: trainer1.id,
      status: MemberStatus.ACTIVE,
    },
  });

  // Member 2 (Expiring soon)
  const memberUser2 = await prisma.user.create({
    data: {
      email: "priya@example.com",
      passwordHash: memberPassword,
      role: Role.MEMBER,
      name: "Priya Patel",
      phone: "+91 98222 33445",
    },
  });

  const member2 = await prisma.member.create({
    data: {
      userId: memberUser2.id,
      memberId: "MEM-002",
      fullName: "Priya Patel",
      email: "priya@example.com",
      phone: "+91 98222 33445",
      address: "12 Palm Avenue, Indiranagar, Bangalore",
      dateOfBirth: new Date("1998-11-20"),
      gender: Gender.FEMALE,
      height: 165,
      weight: 58.0,
      emergencyContact: "Raj Patel (Father) - +91 98222 33446",
      joiningDate: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000),
      assignedTrainerId: trainer2.id,
      status: MemberStatus.ACTIVE,
    },
  });

  // Member 3 (Expired)
  const memberUser3 = await prisma.user.create({
    data: {
      email: "david@example.com",
      passwordHash: memberPassword,
      role: Role.MEMBER,
      name: "David Miller",
      phone: "+91 98333 44556",
    },
  });

  const member3 = await prisma.member.create({
    data: {
      userId: memberUser3.id,
      memberId: "MEM-003",
      fullName: "David Miller",
      email: "david@example.com",
      phone: "+91 98333 44556",
      address: "74 Koramangala 4th Block, Bangalore",
      dateOfBirth: new Date("1992-03-10"),
      gender: Gender.MALE,
      height: 182,
      weight: 84.0,
      emergencyContact: "Elena Miller - +91 98333 44557",
      joiningDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      assignedTrainerId: trainer1.id,
      status: MemberStatus.INACTIVE,
    },
  });

  // Member 4
  const memberUser4 = await prisma.user.create({
    data: {
      email: "ananya@example.com",
      passwordHash: memberPassword,
      role: Role.MEMBER,
      name: "Ananya Roy",
      phone: "+91 98444 55667",
    },
  });

  const member4 = await prisma.member.create({
    data: {
      userId: memberUser4.id,
      memberId: "MEM-004",
      fullName: "Ananya Roy",
      email: "ananya@example.com",
      phone: "+91 98444 55667",
      address: "Whitefield Main Rd, Bangalore",
      dateOfBirth: new Date("2000-08-25"),
      gender: Gender.FEMALE,
      height: 160,
      weight: 52.5,
      emergencyContact: "Deepak Roy - +91 98444 55668",
      joiningDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      assignedTrainerId: trainer2.id,
      status: MemberStatus.ACTIVE,
    },
  });

  // 5. Create Memberships
  // Member 1: Active Standard Quarterly (Ends in 45 days)
  const m1 = await prisma.membership.create({
    data: {
      memberId: member1.id,
      planId: planQuarterly.id,
      startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: MembershipStatus.ACTIVE,
      autoRenew: true,
      notes: "Quarterly plan ongoing.",
    },
  });

  // Member 2: Expiring Soon (Ends in 4 days)
  const m2 = await prisma.membership.create({
    data: {
      memberId: member2.id,
      planId: planQuarterly.id,
      startDate: new Date(Date.now() - 86 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      status: MembershipStatus.EXPIRING_SOON,
      autoRenew: false,
      notes: "Contacted regarding renewal discount.",
    },
  });

  // Member 3: Expired (Ended 10 days ago)
  const m3 = await prisma.membership.create({
    data: {
      memberId: member3.id,
      planId: planMonthly.id,
      startDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: MembershipStatus.EXPIRED,
      autoRenew: false,
      notes: "Membership expired, follow-up scheduled.",
    },
  });

  // Member 4: Active Elite Annual (Ends in 330 days)
  const m4 = await prisma.membership.create({
    data: {
      memberId: member4.id,
      planId: planAnnual.id,
      startDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 330 * 24 * 60 * 60 * 1000),
      status: MembershipStatus.ACTIVE,
      autoRenew: true,
      notes: "Annual paid upfront with UPI.",
    },
  });

  // 6. Create Payments
  await prisma.payment.createMany({
    data: [
      {
        paymentId: "PAY-2024-001",
        memberId: member1.id,
        membershipId: m1.id,
        amount: 4999,
        paymentDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        paymentMethod: PaymentMethod.UPI,
        transactionRef: "UPI/428901827491/HDFC",
        status: PaymentStatus.COMPLETED,
        notes: "Full payment received for Standard Quarterly",
      },
      {
        paymentId: "PAY-2024-002",
        memberId: member2.id,
        membershipId: m2.id,
        amount: 4999,
        paymentDate: new Date(Date.now() - 86 * 24 * 60 * 60 * 1000),
        paymentMethod: PaymentMethod.CARD,
        transactionRef: "TXN_CC_98129038",
        status: PaymentStatus.COMPLETED,
        notes: "Credit card payment via POS machine",
      },
      {
        paymentId: "PAY-2024-003",
        memberId: member4.id,
        membershipId: m4.id,
        amount: 14999,
        paymentDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        paymentMethod: PaymentMethod.UPI,
        transactionRef: "UPI/398102938472/ICICI",
        status: PaymentStatus.COMPLETED,
        notes: "Annual membership full payment with promotional offer",
      },
      {
        paymentId: "PAY-2024-004",
        memberId: member1.id,
        membershipId: null,
        amount: 1200,
        paymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        paymentMethod: PaymentMethod.CASH,
        transactionRef: "REC-CASH-089",
        status: PaymentStatus.COMPLETED,
        notes: "Whey Protein & Gym Shaker Merchandise",
      },
    ],
  });

  // 7. Attendance Records
  const now = new Date();
  const todayMorning = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 30);
  const todayMorningOut = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0);
  const todayEvening = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 15);

  await prisma.attendance.createMany({
    data: [
      {
        memberId: member1.id,
        date: todayMorning,
        checkInTime: todayMorning,
        checkOutTime: todayMorningOut,
        status: AttendanceStatus.PRESENT,
        notes: "Chest & Triceps workout session",
      },
      {
        memberId: member2.id,
        date: todayEvening,
        checkInTime: todayEvening,
        checkOutTime: null, // Still working out
        status: AttendanceStatus.PRESENT,
        notes: "Cardio & Core class",
      },
      {
        memberId: member4.id,
        date: todayMorning,
        checkInTime: todayMorning,
        checkOutTime: todayMorningOut,
        status: AttendanceStatus.PRESENT,
        notes: "Functional leg day",
      },
      // Past days
      {
        memberId: member1.id,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        checkInTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        checkOutTime: new Date(Date.now() - 22.5 * 60 * 60 * 1000),
        status: AttendanceStatus.PRESENT,
      },
      {
        memberId: member1.id,
        date: new Date(Date.now() - 48 * 60 * 60 * 1000),
        checkInTime: new Date(Date.now() - 48 * 60 * 60 * 1000),
        checkOutTime: new Date(Date.now() - 46.5 * 60 * 60 * 1000),
        status: AttendanceStatus.PRESENT,
      },
    ],
  });

  // 8. Exercise Library
  const exercisesData = [
    {
      name: "Barbell Bench Press",
      category: "Strength",
      muscleGroup: "Chest",
      equipment: "Barbell",
      description: "Compound upper body movement focusing on pectoral strength.",
      instructions: "Lie back on bench, grip bar slightly wider than shoulder width. Lower bar to mid-chest, press upwards explosively.",
    },
    {
      name: "Incline Dumbbell Press",
      category: "Strength",
      muscleGroup: "Chest",
      equipment: "Dumbbell",
      description: "Emphasizes upper chest clavicular head.",
      instructions: "Set bench to 30-45 degrees, press dumbbells overhead keeping core tight.",
    },
    {
      name: "Barbell Squat",
      category: "Strength",
      muscleGroup: "Legs",
      equipment: "Barbell",
      description: "King of lower body compound lifts building quads and glutes.",
      instructions: "Rest bar on upper traps, descend until thighs parallel with floor, drive through heels.",
    },
    {
      name: "Romanian Deadlift",
      category: "Strength",
      muscleGroup: "Legs",
      equipment: "Barbell",
      description: "Hamstring and posterior chain builder.",
      instructions: "Hinge at the hips, keeping back neutral and slight knee bend.",
    },
    {
      name: "Lat Pulldown",
      category: "Strength",
      muscleGroup: "Back",
      equipment: "Cable Machine",
      description: "Builds back width and latissimus dorsi.",
      instructions: "Grip wide bar, pull down towards upper chest while squeezing shoulder blades.",
    },
    {
      name: "Seated Cable Row",
      category: "Strength",
      muscleGroup: "Back",
      equipment: "Cable Machine",
      description: "Focuses on mid-back thickness and rhomboids.",
      instructions: "Keep chest tall, pull handle towards abdomen, control the eccentric.",
    },
    {
      name: "Overhead Dumbbell Shoulder Press",
      category: "Strength",
      muscleGroup: "Shoulders",
      equipment: "Dumbbell",
      description: "Develops shoulder deltoids and triceps.",
      instructions: "Sit upright, press dumbbells vertically overhead without arching lower back.",
    },
    {
      name: "Dumbbell Bicep Curls",
      category: "Strength",
      muscleGroup: "Arms",
      equipment: "Dumbbell",
      description: "Isolation movement for biceps brachii.",
      instructions: "Curl dumbbells alternately or together with full range of motion.",
    },
    {
      name: "Cable Tricep Pushdown",
      category: "Strength",
      muscleGroup: "Arms",
      equipment: "Cable Machine",
      description: "Isolates the three tricep heads.",
      instructions: "Pin elbows at sides, push bar or rope down until full extension.",
    },
    {
      name: "Plank Hold",
      category: "Core",
      muscleGroup: "Core",
      equipment: "Bodyweight",
      description: "Isometric core stability exercise.",
      instructions: "Hold rigid plank posture on forearms and toes for prescribed seconds.",
    },
  ];

  const createdExercises: Record<string, string> = {};
  for (const ex of exercisesData) {
    const created = await prisma.exercise.create({ data: ex });
    createdExercises[ex.name] = created.id;
  }

  // 9. Workout Plan
  const plan = await prisma.workoutPlan.create({
    data: {
      planName: "4-Day Hypertrophy & Strength Split",
      memberId: member1.id,
      trainerId: trainer1.id,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: "ACTIVE",
      notes: "Focus on progressive overload and strict 90s rest periods.",
    },
  });

  await prisma.workoutExercise.createMany({
    data: [
      {
        workoutPlanId: plan.id,
        exerciseId: createdExercises["Barbell Bench Press"],
        dayOfWeek: "Monday (Push)",
        sets: 4,
        reps: 8,
        weightKg: 75,
        restSeconds: 90,
        trainerNotes: "Warm up with bar first. Target RPE 8.",
        order: 1,
      },
      {
        workoutPlanId: plan.id,
        exerciseId: createdExercises["Incline Dumbbell Press"],
        dayOfWeek: "Monday (Push)",
        sets: 3,
        reps: 10,
        weightKg: 24,
        restSeconds: 75,
        trainerNotes: "Squeeze chest at top of movement.",
        order: 2,
      },
      {
        workoutPlanId: plan.id,
        exerciseId: createdExercises["Cable Tricep Pushdown"],
        dayOfWeek: "Monday (Push)",
        sets: 3,
        reps: 12,
        weightKg: 25,
        restSeconds: 60,
        trainerNotes: "Lock elbows in place.",
        order: 3,
      },
      {
        workoutPlanId: plan.id,
        exerciseId: createdExercises["Lat Pulldown"],
        dayOfWeek: "Tuesday (Pull)",
        sets: 4,
        reps: 10,
        weightKg: 60,
        restSeconds: 90,
        trainerNotes: "Drive elbows down to hips.",
        order: 1,
      },
      {
        workoutPlanId: plan.id,
        exerciseId: createdExercises["Barbell Squat"],
        dayOfWeek: "Thursday (Legs)",
        sets: 4,
        reps: 6,
        weightKg: 95,
        restSeconds: 120,
        trainerNotes: "Focus on deep parallel depth.",
        order: 1,
      },
    ],
  });

  // 10. Progress Tracking Records
  await prisma.progressRecord.createMany({
    data: [
      {
        memberId: member1.id,
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        weightKg: 79.5,
        bodyFatPercentage: 19.8,
        chestCm: 102.0,
        waistCm: 86.0,
        armsCm: 34.5,
        thighsCm: 58.0,
        notes: "Baseline check-in at joining date.",
        recordedById: trainerUser1.id,
      },
      {
        memberId: member1.id,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        weightKg: 78.0,
        bodyFatPercentage: 18.2,
        chestCm: 103.5,
        waistCm: 84.0,
        armsCm: 35.5,
        thighsCm: 58.5,
        notes: "Waist reduced by 2cm, arms increased. Great diet compliance.",
        recordedById: trainerUser1.id,
      },
      {
        memberId: member1.id,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        weightKg: 76.5,
        bodyFatPercentage: 16.9,
        chestCm: 104.5,
        waistCm: 82.0,
        armsCm: 36.2,
        thighsCm: 59.0,
        notes: "Steady muscle gain and noticeable abdominal definition.",
        recordedById: trainerUser1.id,
      },
    ],
  });

  // 11. Body Assessment PDF Records
  // Create sample dummy PDF files in uploads/assessments
  const uploadDir = path.join(process.cwd(), "uploads", "assessments");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Create minimal valid PDF files for testing downloads
  const samplePdfContent = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << >> >>\nendobj\n4 0 obj\n<< /Length 55 >>\nstream\nBT /F1 18 Tf 50 700 Td (O2Hyperfit Body Composition Report) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000216 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n320\n%%EOF`;

  const pdfFile1 = "sample_bmi_rohan_sharma.pdf";
  const pdfFile2 = "sample_bmi_priya_patel.pdf";

  fs.writeFileSync(path.join(uploadDir, pdfFile1), samplePdfContent);
  fs.writeFileSync(path.join(uploadDir, pdfFile2), samplePdfContent);

  await prisma.bodyAssessment.create({
    data: {
      memberId: member1.id,
      assessmentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      pdfFileName: "InBody570_Report_Rohan_M1.pdf",
      pdfUrl: `/api/assessments/download?path=${encodeURIComponent("assessments/" + pdfFile1)}`,
      pdfPath: "assessments/" + pdfFile1,
      uploadedById: memberUser1.id,
      notes: "Baseline InBody 570 scan. Body fat 18.2%, Skeletal Muscle Mass 35.8kg.",
      weightKg: 79.5,
      bmi: 24.8,
      bodyFatPercentage: 18.2,
      muscleMassKg: 35.8,
      bodyWaterPercentage: 56.4,
      visceralFat: 6,
      boneMassKg: 3.2,
      bmrKcal: 1710,
      bodyAge: 27,
      skeletalMusclePercentage: 45.0,
      metrics: {
        weightKg: 79.5,
        bmi: 24.8,
        bodyFatPercentage: 18.2,
        muscleMassKg: 35.8,
        visceralFat: 6,
      },
    },
  });

  await prisma.bodyAssessment.create({
    data: {
      memberId: member1.id,
      assessmentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      pdfFileName: "InBody570_Report_Rohan_M2.pdf",
      pdfUrl: `/api/assessments/download?path=${encodeURIComponent("assessments/" + pdfFile1)}`,
      pdfPath: "assessments/" + pdfFile1,
      uploadedById: memberUser1.id,
      notes: "Follow-up scan after 4-week program. SMM increased by 0.7kg, visceral fat score dropped to 5.",
      weightKg: 78.0,
      bmi: 24.1,
      bodyFatPercentage: 16.9,
      muscleMassKg: 36.5,
      bodyWaterPercentage: 58.1,
      visceralFat: 5,
      boneMassKg: 3.3,
      bmrKcal: 1745,
      bodyAge: 26,
      skeletalMusclePercentage: 46.8,
      metrics: {
        weightKg: 78.0,
        bmi: 24.1,
        bodyFatPercentage: 16.9,
        muscleMassKg: 36.5,
        visceralFat: 5,
      },
    },
  });

  await prisma.bodyAssessment.create({
    data: {
      memberId: member2.id,
      assessmentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      pdfFileName: "Tanita_Report_Priya_P.pdf",
      pdfUrl: `/api/assessments/download?path=${encodeURIComponent("assessments/" + pdfFile2)}`,
      pdfPath: "assessments/" + pdfFile2,
      uploadedById: memberUser2.id,
      notes: "Quarterly Tanita MC-780 assessment. Excellent hydration and visceral fat rating.",
      weightKg: 58.5,
      bmi: 21.5,
      bodyFatPercentage: 21.0,
      muscleMassKg: 24.2,
      bodyWaterPercentage: 54.0,
      visceralFat: 3,
      boneMassKg: 2.4,
      bmrKcal: 1350,
      bodyAge: 24,
      skeletalMusclePercentage: 41.3,
      metrics: {
        weightKg: 58.5,
        bmi: 21.5,
        bodyFatPercentage: 21.0,
        muscleMassKg: 24.2,
        visceralFat: 3,
      },
    },
  });

  // 10. Seed Gym Settings
  await prisma.gymSettings.create({
    data: {
      id: "default",
      gymName: "O2 HyperFit",
      tagline: "MORE SWEAT MORE GLORY",
      logoUrl: "/logo.png",
      address: "42, Prime Fitness Boulevard, Metro City, India",
      phone: "+91 98765 43210",
      email: "contact@o2hyperfit.com",
      website: "https://o2hyperfit.com",
      openingTime: "06:00 AM",
      closingTime: "10:00 PM",
      weeklyHolidays: "Sunday",
      currency: "₹",
      defaultDurationMonths: 1,
      defaultPaymentMethod: PaymentMethod.UPI,
      attendanceMode: "MANUAL",
      notificationEmail: true,
      notificationSms: false,
      passwordMinLength: 6,
      sessionTimeoutDays: 7,
      forcePasswordChange: true,
    },
  });

  // 11. Seed Staff Salary & History
  const salary1 = await prisma.staffSalary.create({
    data: {
      employeeId: "EMP-001",
      trainerId: trainer1.id,
      name: "Marcus Stone",
      role: "Head Strength Coach",
      salaryType: SalaryType.MONTHLY,
      salaryAmount: 45000,
      paymentFrequency: "Monthly on 1st",
      joiningDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      employmentStatus: EmploymentStatus.ACTIVE,
      notes: "Senior coach leading athletic strength conditioning and client onboarding.",
    },
  });

  await prisma.salaryHistory.create({
    data: {
      staffSalaryId: salary1.id,
      effectiveDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      salaryAmount: 40000,
      salaryType: SalaryType.MONTHLY,
      notes: "Initial probation package upon joining.",
      changedById: adminUser.id,
    },
  });

  await prisma.salaryHistory.create({
    data: {
      staffSalaryId: salary1.id,
      effectiveDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      salaryAmount: 45000,
      salaryType: SalaryType.MONTHLY,
      notes: "Promotion to Head Strength Coach following quarterly review.",
      changedById: adminUser.id,
    },
  });

  const salary2 = await prisma.staffSalary.create({
    data: {
      employeeId: "EMP-002",
      trainerId: trainer2.id,
      name: "Sarah Jenkins",
      role: "Mobility & Nutrition Specialist",
      salaryType: SalaryType.MONTHLY,
      salaryAmount: 38000,
      paymentFrequency: "Monthly on 1st",
      joiningDate: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000),
      employmentStatus: EmploymentStatus.ACTIVE,
      notes: "Focuses on client nutrition protocols, mobility, and high-intensity interval training.",
    },
  });

  await prisma.salaryHistory.create({
    data: {
      staffSalaryId: salary2.id,
      effectiveDate: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000),
      salaryAmount: 38000,
      salaryType: SalaryType.MONTHLY,
      notes: "Standard package for certified nutritionist & functional coach.",
      changedById: adminUser.id,
    },
  });

  // 12. Seed Testimonials
  await prisma.testimonial.createMany({
    data: [
      {
        name: "Vikram Rathore",
        content: "O2 HyperFit completely shifted my mindset on training. The InBody scans coupled with Marcus's programming helped me drop 8% body fat in 4 months.",
        rating: 5,
        photoUrl: "",
        order: 1,
        isActive: true,
      },
      {
        name: "Ananya Deshmukh",
        content: "The dark athletic atmosphere, Olympic-grade barbells, and clean recovery zones make this the best gym I've trained at in over 6 years.",
        rating: 5,
        photoUrl: "",
        order: 2,
        isActive: true,
      },
      {
        name: "Rohan Mehra",
        content: "Real tracking, zero fluff. The workout builder and attendance console on the member portal keeps me disciplined every single day.",
        rating: 5,
        photoUrl: "",
        order: 3,
        isActive: true,
      },
    ],
  });

  // 13. Seed Default HomePage Configuration
  const defaultHomepageSections = {
    sectionOrder: ["hero", "stats", "features", "assessments", "memberships", "trainers", "testimonials", "about", "cta", "contact", "footer"],
    sectionVisibility: {
      hero: true,
      stats: true,
      features: true,
      assessments: true,
      memberships: true,
      trainers: true,
      testimonials: true,
      about: true,
      cta: true,
      contact: true,
      footer: true,
    },
    hero: {
      smallHeading: "MORE SWEAT MORE GLORY",
      mainHeading: "TRAIN. TRACK. TRANSFORM.",
      highlightedText: "REACH YOUR PEAK",
      description: "The elite athletic sanctuary engineered for real performance. Experience next-generation coaching, real-time biometric analytics, and high-intensity precision training.",
      primaryBtnText: "GET STARTED",
      primaryBtnAction: "/login",
      secondaryBtnText: "EXPLORE PLANS",
      secondaryBtnAction: "#memberships",
      bgImageUrl: "",
    },
    stats: {
      title: "PROVEN AT SCALE",
      items: [
        { id: "stat_members", label: "Active Members", value: "500+", isDynamic: true, visible: true },
        { id: "stat_trainers", label: "Certified Coaches", value: "15+", isDynamic: true, visible: true },
        { id: "stat_workouts", label: "Workouts Completed", value: "12,000+", isDynamic: true, visible: true },
        { id: "stat_plans", label: "Membership Tiers", value: "4", isDynamic: true, visible: true },
      ],
    },
    features: {
      title: "BUILT FOR PEAK ATHLETES",
      description: "Every tool you need to shatter plateaus and master your physical potential.",
      items: [
        { id: "feat_1", title: "Precision Member Management", description: "Seamless profile tracking, membership renewals, and real-time attendance.", icon: "Users", visible: true },
        { id: "feat_2", title: "Pro Coaching Console", description: "Certified trainers assigning personalized regimens and tracking day-to-day progress.", icon: "ShieldCheck", visible: true },
        { id: "feat_3", title: "Automated Billing & Invoices", description: "Instant digital receipts across UPI, Card, Cash, with automatic expiry alerts.", icon: "CreditCard", visible: true },
        { id: "feat_4", title: "Real-Time Check-In Hub", description: "Live floor headcount and attendance auditing for maximum safety and accountability.", icon: "CalendarCheck", visible: true },
        { id: "feat_5", title: "Custom Workout Builder", description: "Targeted muscle group exercise library with sets, reps, load, and rest timers.", icon: "Dumbbell", visible: true },
        { id: "feat_6", title: "Body Composition Analytics", description: "Machine PDF integration (InBody / Tanita) with historical metric visualization.", icon: "FileSpreadsheet", visible: true },
      ],
    },
    assessments: {
      title: "CLINICAL BODY COMPOSITION & BMI",
      description: "Direct integration with Tanita & InBody medical-grade analyzers for absolute transparency in body fat %, muscle mass, and metabolic rate.",
      visible: true,
    },
    memberships: {
      title: "MEMBERSHIP TIERS",
      description: "Transparent, performance-driven investment in your health. No hidden fees.",
      visible: true,
    },
    about: {
      heading: "ABOUT O2 HYPERFIT",
      description: "O2 HyperFit was founded on one unshakeable conviction: generic fitness produces generic results.",
      gymStory: "Our facility pairs Olympic-standard strength apparatus with cutting-edge biometrics, certified elite trainers, and an uncompromising dark athletic atmosphere designed to foster discipline and peak output.",
      imageUrl: "",
      visible: true,
    },
    trainers: {
      title: "MEET OUR ELITE COACHES",
      description: "Master trainers with proven track records in powerlifting, athletic conditioning, and clinical fat loss.",
      selectedTrainerIds: [],
      visible: true,
    },
    testimonials: {
      title: "ATHLETE TRANSFORMATIONS",
      description: "Real words from the dedicated members who put in the sweat every single day.",
      visible: true,
    },
    cta: {
      heading: "READY TO TRANSCEND YOUR LIMITS?",
      description: "Join the O2 HyperFit movement today. Step inside, crush your barriers, and experience the highest standard of fitness.",
      btnText: "START YOUR JOURNEY",
      btnAction: "/login",
      bgImageUrl: "",
      visible: true,
    },
    contact: {
      address: "42, Prime Fitness Boulevard, Metro City, India",
      phone: "+91 98765 43210",
      email: "contact@o2hyperfit.com",
      openingHours: "Mon-Sat: 06:00 AM - 10:00 PM | Sun: Closed",
      mapsUrl: "https://maps.google.com",
      instagramUrl: "https://instagram.com",
      facebookUrl: "https://facebook.com",
      whatsappUrl: "https://whatsapp.com",
      visible: true,
    },
    footer: {
      description: "O2 HyperFit is a premier strength, conditioning, and biometric fitness center engineered for peak athletic performance.",
      copyrightText: "© 2026 O2 HyperFit. All Rights Reserved. Built for champions.",
      visible: true,
    },
  };

  await prisma.homePage.create({
    data: {
      id: "default",
      isPublished: true,
      sections: defaultHomepageSections,
    },
  });

  await prisma.homePageRevision.create({
    data: {
      versionId: "REV-001",
      publishedBy: "Alex Vance (Admin)",
      changeSummary: "Initial official O2 HyperFit launch layout",
      data: defaultHomepageSections,
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log("-----------------------------------------");
  console.log("Demo Credentials:");
  console.log("Admin:   admin@o2hyperfit.com   / Admin@123");
  console.log("Trainer: trainer@o2hyperfit.com / Trainer@123");
  console.log("Member:  member@o2hyperfit.com  / Member@123");
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
