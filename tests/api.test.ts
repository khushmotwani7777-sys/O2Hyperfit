import { describe, it, expect, beforeAll } from "vitest";
import prisma from "@/lib/prisma";
import { hashPassword, comparePassword, signToken, verifyToken } from "@/lib/auth";
import { getStorageService } from "@/lib/storage";
import { Role, Gender, MemberStatus, PaymentMethod, PaymentStatus, AttendanceStatus } from "@prisma/client";

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
        },
      });

      expect(assessment.id).toBeDefined();
      expect(assessment.pdfFileName).toBe("test_inbody_scan.pdf");
      expect(assessment.memberId).toBe(testMemberId);

      // Cleanup storage
      const deleted = await storage.deleteFile(uploadResult.path);
      expect(deleted).toBe(true);
    });
  });
});
