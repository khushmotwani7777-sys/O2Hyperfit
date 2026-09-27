export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { Role, SalaryType, EmploymentStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, [Role.ADMIN]);
  if (auth instanceof NextResponse) return auth;

  try {
    const staff = await prisma.staffSalary.findMany({
      include: {
        history: {
          orderBy: { effectiveDate: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: staff });
  } catch (error) {
    console.error("Fetch staff salaries error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch staff salary records" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, [Role.ADMIN]);
  if (auth instanceof NextResponse) return auth;

  const { user } = auth;

  try {
    const body = await req.json();
    const {
      employeeId,
      trainerId,
      name,
      role,
      salaryType,
      salaryAmount,
      paymentFrequency,
      joiningDate,
      employmentStatus,
      notes,
    } = body;

    if (!employeeId || !name || !role || salaryAmount === undefined) {
      return NextResponse.json(
        { success: false, error: "Employee ID, Name, Role, and Salary Amount are required." },
        { status: 400 }
      );
    }

    const existing = await prisma.staffSalary.findUnique({
      where: { employeeId },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A staff record with this Employee ID already exists." },
        { status: 409 }
      );
    }

    const parsedAmount = parseFloat(salaryAmount);
    const parsedType = (salaryType as SalaryType) || SalaryType.MONTHLY;

    const newStaff = await prisma.staffSalary.create({
      data: {
        employeeId,
        trainerId: trainerId || null,
        name,
        role,
        salaryType: parsedType,
        salaryAmount: parsedAmount,
        paymentFrequency: paymentFrequency || "Monthly on 1st",
        joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
        employmentStatus: (employmentStatus as EmploymentStatus) || EmploymentStatus.ACTIVE,
        notes: notes || null,
        history: {
          create: {
            salaryAmount: parsedAmount,
            salaryType: parsedType,
            effectiveDate: joiningDate ? new Date(joiningDate) : new Date(),
            notes: "Initial salary setup upon onboarding.",
            changedById: user.userId,
          },
        },
      },
      include: {
        history: true,
      },
    });

    return NextResponse.json({ success: true, data: newStaff }, { status: 201 });
  } catch (error) {
    console.error("Create staff salary error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create staff salary record" },
      { status: 500 }
    );
  }
}
