import { describe, it, expect, beforeAll } from "vitest";
import prisma from "@/lib/prisma";
import { hashPassword, comparePassword, signToken, verifyToken } from "@/lib/auth";
import { getStorageService } from "@/lib/storage";
import { Role, Gender, MemberStatus, PaymentMethod, PaymentStatus, AttendanceStatus, PlanStatus, SalaryType, EmploymentStatus } from "@prisma/client";

describe("O2Hyperfit Core Business Logic & Integration Tests", () => {
  let testMemberId: string;
  let testPlanId: string;
  let testMembershipId: string;

  beforeAll(async () => {
    // Ensure we have a plan for testing
    const plan = await prisma.membershipPlan.findFirst({
      where: { name: "Standard Quarterly" },
    });
    if (plan) {
      testPlanId = plan.id;
    }
  });

  // 1. Authorization & Security Tests
  describe("Authentication & RBAC Security", () => {
    it("should correctly hash and verify user passwords", async () => {
      const password = "SecurePassword@123";
      const hash = await hashPassword(password);
      expect(hash).not.toBe(password);

      const isValid = await comparePassword(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await comparePassword("WrongPassword", hash);
      expect(isInvalid).toBe(false);
    });

    it("should issue and verify valid JWT tokens with roles", async () => {
      const payload = {
        userId: "test-user-id",
        email: "testadmin@o2hyperfit.com",
        name: "Test Admin",
        role: Role.ADMIN,
      };

      const token = await signToken(payload);
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(20);

      const decoded = await verifyToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.email).toBe(payload.email);
      expect(decoded?.role).toBe(Role.ADMIN);
    });

    it("should reject corrupted or invalid JWT tokens", async () => {
      const invalidToken = "invalid.token.structure";
      const decoded = await verifyToken(invalidToken);
      expect(decoded).toBeNull();
    });
  });

  // 2. Member Creation & Retrieval Tests
  describe("Member Management", () => {
    it("should create a new member with generated memberId and personal fields", async () => {
      const randomSuffix = Math.floor(Math.random() * 10000);
      const testEmail = `test.member.${randomSuffix}@example.com`;

      const member = await prisma.member.create({
        data: {
          memberId: `MEM-TEST-${randomSuffix}`,
          fullName: `Test Runner ${randomSuffix}`,
          email: testEmail,
          phone: "+91 99999 88888",
          gender: Gender.MALE,
          height: 180,
          weight: 75,
          emergencyContact: "Emergency Contact - 9999900000",
          status: MemberStatus.ACTIVE,
        },
      });

      expect(member).toBeDefined();
      expect(member.id).toBeDefined();
      expect(member.email).toBe(testEmail);
      expect(member.status).toBe(MemberStatus.ACTIVE);

      testMemberId = member.id;
    });

    it("should retrieve member profile by ID with all relations", async () => {
      const member = await prisma.member.findUnique({
        where: { id: testMemberId },
        include: {
          memberships: true,
          payments: true,
          attendance: true,
          progressRecords: true,
        },
      });

      expect(member).not.toBeNull();
      expect(member?.id).toBe(testMemberId);
      expect(Array.isArray(member?.memberships)).toBe(true);
    });
  });

  // 3. Membership Assignment & Expiry Calculation
  describe("Membership Management", () => {
    it("should assign a plan to a member and calculate correct end date", async () => {
      const startDate = new Date();
      const plan = await prisma.membershipPlan.findUnique({
        where: { id: testPlanId },
      });
      expect(plan).not.toBeNull();

      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + (plan?.durationMonths || 3));

      const membership = await prisma.membership.create({
        data: {
          memberId: testMemberId,
          planId: testPlanId,
          startDate,
          endDate,
          status: "ACTIVE",
          notes: "Integration test membership",
        },
        include: {
          plan: true,
        },
      });

      expect(membership.id).toBeDefined();
      expect(membership.planId).toBe(testPlanId);
      expect(membership.endDate.getTime()).toBeGreaterThan(membership.startDate.getTime());

      testMembershipId = membership.id;
    });
  });

  // 4. Payment Management
  describe("Payment Management", () => {
    it("should record a payment and link it to member and membership", async () => {
      const payment = await prisma.payment.create({
        data: {
          paymentId: `PAY-TEST-${Date.now()}`,
          memberId: testMemberId,
          membershipId: testMembershipId,
          amount: 4999,
          paymentMethod: PaymentMethod.UPI,
          transactionRef: "UPI_TEST_REF_12345",
          status: PaymentStatus.COMPLETED,
          notes: "Automated test payment",
        },
        include: {
          member: true,
          membership: true,
        },
      });

      expect(payment.id).toBeDefined();
      expect(payment.amount).toBe(4999);
      expect(payment.paymentMethod).toBe(PaymentMethod.UPI);
      expect(payment.status).toBe(PaymentStatus.COMPLETED);
      expect(payment.member.id).toBe(testMemberId);
    });
  });

  // 5. Attendance Check-In & Check-Out
  describe("Attendance Module", () => {
    it("should check-in a member and later record check-out time", async () => {
      const checkInTime = new Date();
      const attendance = await prisma.attendance.create({
        data: {
          memberId: testMemberId,
          date: checkInTime,
          checkInTime,
          status: AttendanceStatus.PRESENT,
          notes: "Leg day check-in",
        },
      });

      expect(attendance.id).toBeDefined();
      expect(attendance.checkOutTime).toBeNull();

      const checkOutTime = new Date(Date.now() + 3600 * 1000);
      const updated = await prisma.attendance.update({
        where: { id: attendance.id },
        data: { checkOutTime },
      });

      expect(updated.checkOutTime).not.toBeNull();
      expect(updated.checkOutTime?.getTime()).toBeGreaterThan(updated.checkInTime.getTime());
    });
  });

  // 6. Body Assessment & Storage Abstraction Tests
  describe("Body Assessment & Storage Abstraction", () => {
    it("should upload and retrieve file via storage service abstraction", async () => {
      const storage = getStorageService();
      expect(storage).toBeDefined();

      const dummyPdfContent = Buffer.from("%PDF-1.4 Test Assessment Report Buffer");
      const uploadResult = await storage.uploadFile(
        dummyPdfContent,
        "test_inbody_scan.pdf",
        "application/pdf",
        "assessments"
      );

      expect(uploadResult).toBeDefined();
      expect(uploadResult.path).toContain("assessments");
      expect(uploadResult.url).toContain("/api/assessments/download");

      // Verify retrieval
      const retrieved = await storage.getFileBuffer(uploadResult.path);
      expect(retrieved.toString()).toBe(dummyPdfContent.toString());

      // Create database record
      const assessment = await prisma.bodyAssessment.create({
        data: {
          memberId: testMemberId,
          assessmentDate: new Date(),
          pdfFileName: "test_inbody_scan.pdf",
          pdfPath: uploadResult.path,
          pdfUrl: uploadResult.url,
          notes: "Test assessment report metadata",
          weightKg: 78.5,
          bmi: 24.2,
          bodyFatPercentage: 16.5,
          muscleMassKg: 37.2,
        },
      });

      expect(assessment.id).toBeDefined();
      expect(assessment.pdfFileName).toBe("test_inbody_scan.pdf");
      expect(assessment.memberId).toBe(testMemberId);
      expect(assessment.weightKg).toBe(78.5);
      expect(assessment.bmi).toBe(24.2);
      expect(assessment.bodyFatPercentage).toBe(16.5);
      expect(assessment.muscleMassKg).toBe(37.2);
      expect(assessment.boneMassKg).toBeNull(); // Missing metric is null, not fabricated

      // Cleanup
      await prisma.bodyAssessment.delete({ where: { id: assessment.id } });
      const deleted = await storage.deleteFile(uploadResult.path);
      expect(deleted).toBe(true);
    });

    it("should parse verifiable metrics from machine PDF text without hallucinating", async () => {
      const { parseAssessmentPdf } = await import("@/lib/pdfParser");

      const machineTextPdf = Buffer.from(
        "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n" +
          "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n" +
          "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n" +
          "4 0 obj\n<< /Length 200 >>\nstream\n" +
          "InBody 570 Report\nWeight: 82.4 kg\nBMI: 25.1\nPercent Body Fat: 17.8%\nSkeletal Muscle Mass: 38.6 kg\nVisceral Fat Level: 6\nBMR: 1780 kcal\n" +
          "endstream\nendobj\ntrailer\n<< /Size 5 /Root 1 0 R >>\n%%EOF"
      );

      const result = await parseAssessmentPdf(machineTextPdf);
      expect(result.weightKg).toBe(82.4);
      expect(result.bmi).toBe(25.1);
      expect(result.bodyFatPercentage).toBe(17.8);
      expect(result.muscleMassKg).toBe(38.6);
      expect(result.visceralFat).toBe(6);
      expect(result.bmrKcal).toBe(1780);
      // Unmentioned metrics MUST be null
      expect(result.bodyWaterPercentage).toBeNull();
      expect(result.boneMassKg).toBeNull();
      expect(result.bodyAge).toBeNull();
    });

    it("should enforce member data isolation on body assessments", async () => {
      // Member A
      const memberA = await prisma.member.findFirst({ where: { email: "member@o2hyperfit.com" } });
      expect(memberA).not.toBeNull();

      // Member B
      const memberB = await prisma.member.findFirst({ where: { email: "priya@example.com" } });
      expect(memberB).not.toBeNull();

      // Member A assessments query
      const assessmentsA = await prisma.bodyAssessment.findMany({
        where: { memberId: memberA!.id },
      });

      // Member B assessments query
      const assessmentsB = await prisma.bodyAssessment.findMany({
        where: { memberId: memberB!.id },
      });

      // Verify strict isolation
      const idsA = new Set(assessmentsA.map((a) => a.id));
      for (const b of assessmentsB) {
        expect(idsA.has(b.id)).toBe(false);
      }
    });
  });

  // 7. Member Password Security & First-Login Flow
  describe("Password Security & Mandatory First Login", () => {
    it("should create a member with temporary mobile password and mustChangePassword=true", async () => {
      const randomSuffix = Math.floor(Math.random() * 10000);
      const testEmail = `sec.member.${randomSuffix}@example.com`;
      const mobile = "9876543210";
      const hashedPassword = await hashPassword(mobile);

      const user = await prisma.user.create({
        data: {
          email: testEmail,
          passwordHash: hashedPassword,
          name: `Security Member ${randomSuffix}`,
          phone: mobile,
          role: Role.MEMBER,
          mustChangePassword: true,
        },
      });

      expect(user.mustChangePassword).toBe(true);
      const isMobileMatch = await comparePassword(mobile, user.passwordHash);
      expect(isMobileMatch).toBe(true);

      // Verify token includes mustChangePassword
      const token = await signToken({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      });
      const decoded = await verifyToken(token);
      expect(decoded?.mustChangePassword).toBe(true);

      // Simulate First-Time Password Change
      const newPassword = "StrongNewPassword@2026";
      const newHash = await hashPassword(newPassword);
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newHash,
          mustChangePassword: false,
        },
      });

      expect(updatedUser.mustChangePassword).toBe(false);
      const isNewPasswordValid = await comparePassword(newPassword, updatedUser.passwordHash);
      expect(isNewPasswordValid).toBe(true);

      // Clean up
      await prisma.user.delete({ where: { id: user.id } });
    });

    it("should allow admin to reset member password to mobile and restore mustChangePassword flag", async () => {
      const randomSuffix = Math.floor(Math.random() * 10000);
      const testEmail = `reset.member.${randomSuffix}@example.com`;
      const mobile = "9876500000";

      const user = await prisma.user.create({
        data: {
          email: testEmail,
          passwordHash: await hashPassword("CustomPassword@999"),
          name: `Reset Member ${randomSuffix}`,
          phone: mobile,
          role: Role.MEMBER,
          mustChangePassword: false,
        },
      });

      expect(user.mustChangePassword).toBe(false);

      // Admin triggers reset
      const resetHash = await hashPassword(mobile);
      const resetUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: resetHash,
          mustChangePassword: true,
        },
      });

      expect(resetUser.mustChangePassword).toBe(true);
      expect(await comparePassword(mobile, resetUser.passwordHash)).toBe(true);

      // Clean up
      await prisma.user.delete({ where: { id: user.id } });
    });
  });

  // 8. Admin Settings
  describe("Admin Gym Settings", () => {
    it("should fetch or upsert gym configuration settings", async () => {
      const settings = await prisma.gymSettings.upsert({
        where: { id: "default" },
        update: {
          gymName: "O2 HyperFit - Elite",
          tagline: "MORE SWEAT MORE GLORY",
        },
        create: {
          id: "default",
          gymName: "O2 HyperFit - Elite",
          tagline: "MORE SWEAT MORE GLORY",
        },
      });

      expect(settings).toBeDefined();
      expect(settings.gymName).toBe("O2 HyperFit - Elite");
      expect(settings.tagline).toBe("MORE SWEAT MORE GLORY");
      expect(settings.logoUrl).toBeDefined();
    });
  });

  // 9. Membership Plan Management & Archiving
  describe("Membership Plan Catalog & Archiving", () => {
    let createdPlanId: string;

    it("should create a new plan with features array and custom pricing", async () => {
      const plan = await prisma.membershipPlan.create({
        data: {
          name: "Annual VIP Elite",
          durationMonths: 12,
          price: 18000,
          description: "All access VIP plan with steam and trainer access",
          features: ["Full gym access", "Steam & sauna", "Personal locker", "1 Free InBody Scan/mo"].join(", "),
          status: PlanStatus.ACTIVE,
        },
      });

      expect(plan.id).toBeDefined();
      expect(plan.name).toBe("Annual VIP Elite");
      expect(plan.price).toBe(18000);
      expect(plan.features).toContain("Steam & sauna");
      expect(plan.status).toBe(PlanStatus.ACTIVE);

      createdPlanId = plan.id;
    });

    it("should safely soft-archive a membership plan instead of deleting it", async () => {
      const archived = await prisma.membershipPlan.update({
        where: { id: createdPlanId },
        data: { status: PlanStatus.ARCHIVED },
      });

      expect(archived.status).toBe(PlanStatus.ARCHIVED);

      // Verify active plans query filters out ARCHIVED
      const activePlans = await prisma.membershipPlan.findMany({
        where: { status: PlanStatus.ACTIVE },
      });
      expect(activePlans.some((p) => p.id === createdPlanId)).toBe(false);

      // Cleanup test plan
      await prisma.membershipPlan.delete({ where: { id: createdPlanId } });
    });
  });

  // 10. Staff & Trainer Salary Register
  describe("Staff Salary Management & Audit Trail", () => {
    let testStaffId: string;

    it("should register staff salary and record audit history upon increment", async () => {
      const employeeId = `EMP-TEST-${Date.now()}`;
      const staff = await prisma.staffSalary.create({
        data: {
          employeeId,
          name: "Coach Vikram Singh",
          role: "Head Trainer",
          salaryType: SalaryType.MONTHLY,
          salaryAmount: 45000,
          paymentFrequency: "Monthly on 1st",
          employmentStatus: EmploymentStatus.ACTIVE,
          notes: "Initial appointment package",
        },
      });

      expect(staff.id).toBeDefined();
      expect(staff.salaryAmount).toBe(45000);
      expect(staff.salaryType).toBe(SalaryType.MONTHLY);
      testStaffId = staff.id;

      // Create salary increment and record in SalaryHistory
      const newSalary = 50000;
      await prisma.staffSalary.update({
        where: { id: testStaffId },
        data: { salaryAmount: newSalary },
      });

      const historyRecord = await prisma.salaryHistory.create({
        data: {
          staffSalaryId: testStaffId,
          effectiveDate: new Date(),
          salaryAmount: newSalary,
          salaryType: SalaryType.MONTHLY,
          notes: "Annual appraisal promotion",
        },
      });

      expect(historyRecord.id).toBeDefined();
      expect(historyRecord.salaryAmount).toBe(50000);

      const historyList = await prisma.salaryHistory.findMany({
        where: { staffSalaryId: testStaffId },
      });
      expect(historyList.length).toBeGreaterThanOrEqual(1);

      // Cleanup
      await prisma.staffSalary.delete({ where: { id: testStaffId } });
    });
  });

  // 11. Home Page CMS & Revision Tracking
  describe("Visual CMS & Revision Management", () => {
    it("should save and retrieve published homepage configuration and store revisions", async () => {
      const homePage = await prisma.homePage.upsert({
        where: { id: "default" },
        update: {
          isPublished: true,
          sections: {
            hero: { enabled: true, headline: "MORE SWEAT MORE GLORY", order: 1 },
            plans: { enabled: true, title: "Our Memberships", order: 2 },
          },
        },
        create: {
          id: "default",
          isPublished: true,
          sections: {
            hero: { enabled: true, headline: "MORE SWEAT MORE GLORY", order: 1 },
            plans: { enabled: true, title: "Our Memberships", order: 2 },
          },
        },
      });

      expect(homePage.id).toBe("default");
      expect(homePage.isPublished).toBe(true);

      // Record snapshot revision
      const revision = await prisma.homePageRevision.create({
        data: {
          versionId: `v-${Date.now()}`,
          publishedBy: "Admin",
          changeSummary: "Updated hero headline",
          data: homePage.sections as any,
        },
      });

      expect(revision.id).toBeDefined();
      expect(revision.publishedBy).toBe("Admin");

      // Cleanup revision
      await prisma.homePageRevision.delete({ where: { id: revision.id } });
    });
  });
});

