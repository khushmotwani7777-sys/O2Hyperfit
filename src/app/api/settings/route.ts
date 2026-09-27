export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    let settings = await prisma.gymSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.gymSettings.create({
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
          defaultPaymentMethod: "UPI",
          attendanceMode: "MANUAL",
          notificationEmail: true,
          notificationSms: false,
          passwordMinLength: 6,
          sessionTimeoutDays: 7,
          forcePasswordChange: true,
        },
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Fetch settings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req, [Role.ADMIN]);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    const updated = await prisma.gymSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        ...body,
      },
      update: {
        ...body,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Gym settings updated successfully",
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
