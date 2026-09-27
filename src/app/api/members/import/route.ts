export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, hashPassword } from "@/lib/auth";
import { Role, Gender, MemberStatus, MembershipStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, [Role.ADMIN]);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "validate";
    const body = await req.json();

    const rawRows: any[] = Array.isArray(body.rows) ? body.rows : [];

    if (rawRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "No records found in CSV payload." },
        { status: 400 }
      );
    }

    // Pre-fetch existing records for duplicate check
    const [existingMembers, existingUsers, activePlans, activeTrainers] = await Promise.all([
      prisma.member.findMany({
        select: { memberId: true, email: true, phone: true },
      }),
      prisma.user.findMany({
        select: { email: true, phone: true },
      }),
      prisma.membershipPlan.findMany({
        where: { status: "ACTIVE" },
      }),
      prisma.trainer.findMany({
        where: { status: "ACTIVE" },
      }),
    ]);

    const existingEmails = new Set<string>();
    const existingPhones = new Set<string>();
    const existingMemberIds = new Set<string>();

    existingMembers.forEach((m) => {
      if (m.email) existingEmails.add(m.email.toLowerCase().trim());
      if (m.phone) existingPhones.add(m.phone.replace(/[^0-9]/g, "").slice(-10));
      if (m.memberId) existingMemberIds.add(m.memberId.toUpperCase().trim());
    });

    existingUsers.forEach((u) => {
      if (u.email) existingEmails.add(u.email.toLowerCase().trim());
      if (u.phone) existingPhones.add(u.phone.replace(/[^0-9]/g, "").slice(-10));
    });

    // In-file duplicate trackers
    const seenEmailsInFile = new Set<string>();
    const seenPhonesInFile = new Set<string>();
    const seenMemberIdsInFile = new Set<string>();

    const validatedRows: any[] = [];
    let validCount = 0;
    let invalidCount = 0;

    for (let index = 0; index < rawRows.length; index++) {
      const row = rawRows[index];
      const rowNumber = index + 1;
      const errors: string[] = [];

      // 1. Name validation
      const name = (row.name || "").trim();
      if (!name) {
        errors.push("Missing name");
      }

      // 2. Email validation
      const email = (row.email || "").toLowerCase().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) {
        errors.push("Missing email");
      } else if (!emailRegex.test(email)) {
        errors.push("Invalid email format");
      } else if (seenEmailsInFile.has(email)) {
        errors.push(`Duplicate email in file: ${email}`);
      } else if (existingEmails.has(email)) {
        errors.push(`Email already registered in system: ${email}`);
      } else {
        seenEmailsInFile.add(email);
      }

      // 3. Mobile validation
      const rawMobile = (row.mobile || "").toString().trim();
      const cleanMobile = rawMobile.replace(/[^0-9]/g, "");
      const tenDigit = cleanMobile.slice(-10);

      if (!rawMobile) {
        errors.push("Missing mobile number");
      } else if (cleanMobile.length < 10) {
        errors.push(`Invalid mobile number: must contain at least 10 digits`);
      } else if (seenPhonesInFile.has(tenDigit)) {
        errors.push(`Duplicate mobile number in file: ${rawMobile}`);
      } else if (existingPhones.has(tenDigit)) {
        errors.push(`Mobile number already registered in system: ${rawMobile}`);
      } else {
        seenPhonesInFile.add(tenDigit);
      }

      // 4. Member ID validation (optional or unique)
      let memberId = (row.member_id || "").toString().trim().toUpperCase();
      if (memberId) {
        if (seenMemberIdsInFile.has(memberId)) {
          errors.push(`Duplicate Member ID in file: ${memberId}`);
        } else if (existingMemberIds.has(memberId)) {
          errors.push(`Member ID already in use: ${memberId}`);
        } else {
          seenMemberIdsInFile.add(memberId);
        }
      }

      // 5. Gender validation
      let gender: Gender = Gender.OTHER;
      const rawGender = (row.gender || "").toString().toUpperCase().trim();
      if (rawGender === "MALE" || rawGender === "M") gender = Gender.MALE;
      else if (rawGender === "FEMALE" || rawGender === "F") gender = Gender.FEMALE;

      // 6. Dates
      let dob: Date | null = null;
      if (row.date_of_birth) {
        const d = new Date(row.date_of_birth);
        if (isNaN(d.getTime())) {
          errors.push(`Invalid date of birth format: ${row.date_of_birth}`);
        } else {
          dob = d;
        }
      }

      let joiningDate = new Date();
      if (row.joining_date) {
        const jd = new Date(row.joining_date);
        if (isNaN(jd.getTime())) {
          errors.push(`Invalid joining date format: ${row.joining_date}`);
        } else {
          joiningDate = jd;
        }
      }

      // 7. Height & Weight
      const height = row.height ? parseFloat(row.height) : null;
      const weight = row.weight ? parseFloat(row.weight) : null;

      // 8. Membership Plan validation (optional)
      let planObj: any = null;
      const rawPlan = (row.membership_plan || "").toString().trim();
      if (rawPlan) {
        planObj = activePlans.find(
          (p) =>
            p.name.toLowerCase() === rawPlan.toLowerCase() ||
            p.id.toLowerCase() === rawPlan.toLowerCase()
        );
        if (!planObj) {
          errors.push(`Membership plan not found: "${rawPlan}"`);
        }
      }

      // 9. Trainer validation (optional)
      let trainerObj: any = null;
      const rawTrainer = (row.trainer || "").toString().trim();
      if (rawTrainer) {
        trainerObj = activeTrainers.find(
          (t) =>
            t.name.toLowerCase().includes(rawTrainer.toLowerCase()) ||
            t.trainerId.toLowerCase() === rawTrainer.toLowerCase() ||
            t.id === rawTrainer
        );
        if (!trainerObj) {
          errors.push(`Trainer not found: "${rawTrainer}"`);
        }
      }

      const isValid = errors.length === 0;
      if (isValid) validCount++;
      else invalidCount++;

      validatedRows.push({
        rowNumber,
        memberId: memberId || null,
        name,
        email,
        mobile: rawMobile,
        cleanMobile,
        address: (row.address || "").trim() || null,
        dateOfBirth: dob ? dob.toISOString().split("T")[0] : null,
        gender,
        height: isNaN(height as any) ? null : height,
        weight: isNaN(weight as any) ? null : weight,
        joiningDate: joiningDate.toISOString().split("T")[0],
        membershipPlan: planObj ? planObj.name : rawPlan || null,
        planId: planObj ? planObj.id : null,
        planDurationMonths: planObj ? planObj.durationMonths : null,
        trainer: trainerObj ? trainerObj.name : rawTrainer || null,
        trainerId: trainerObj ? trainerObj.id : null,
        isValid,
        errors,
      });
    }

    // IF VALIDATION MODE: Return summary and preview rows
    if (mode === "validate") {
      return NextResponse.json({
        success: true,
        summary: {
          totalRows: rawRows.length,
          validRows: validCount,
          invalidRows: invalidCount,
        },
        rows: validatedRows,
      });
    }

    // IF COMMIT MODE: Import valid rows in transaction
    if (mode === "commit") {
      const recordsToImport = validatedRows.filter((r) => r.isValid);

      if (recordsToImport.length === 0) {
        return NextResponse.json(
          { success: false, error: "No valid records available to import." },
          { status: 400 }
        );
      }

      let importedCount = 0;
      const currentCount = await prisma.member.count();

      // Transactionally import valid records
      await prisma.$transaction(async (tx) => {
        for (let i = 0; i < recordsToImport.length; i++) {
          const r = recordsToImport[i];

          // Auto-generate memberId if not provided
          const assignedMemberId =
            r.memberId || `MEM-${String(currentCount + i + 1).padStart(3, "0")}`;

          // Temporary initial password is member's mobile number, securely hashed
          const initialPassword = r.cleanMobile.slice(-10) || r.mobile;
          const passwordHash = await hashPassword(initialPassword);

          // 1. Create User account with mustChangePassword = true
          const user = await tx.user.create({
            data: {
              email: r.email,
              passwordHash,
              name: r.name,
              phone: r.mobile,
              role: Role.MEMBER,
              mustChangePassword: true,
            },
          });

          // 2. Create Member Profile
          const member = await tx.member.create({
            data: {
              userId: user.id,
              memberId: assignedMemberId,
              fullName: r.name,
              email: r.email,
              phone: r.mobile,
              address: r.address,
              dateOfBirth: r.dateOfBirth ? new Date(r.dateOfBirth) : null,
              gender: r.gender,
              height: r.height,
              weight: r.weight,
              joiningDate: new Date(r.joiningDate),
              assignedTrainerId: r.trainerId,
              status: MemberStatus.ACTIVE,
            },
          });

          // 3. Attach Membership if plan was specified
          if (r.planId && r.planDurationMonths) {
            const startDate = new Date(r.joiningDate);
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + r.planDurationMonths);

            const isExpired = endDate < new Date();

            await tx.membership.create({
              data: {
                memberId: member.id,
                planId: r.planId,
                startDate,
                endDate,
                status: isExpired ? MembershipStatus.EXPIRED : MembershipStatus.ACTIVE,
                notes: "Imported via Bulk CSV Member Onboarding",
              },
            });
          }

          importedCount++;
        }
      });

      return NextResponse.json({
        success: true,
        importedCount,
        message: `Successfully imported ${importedCount} member accounts with initial mobile passwords.`,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid import mode" }, { status: 400 });
  } catch (error: any) {
    console.error("CSV import error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process CSV import" },
      { status: 500 }
    );
  }
}
