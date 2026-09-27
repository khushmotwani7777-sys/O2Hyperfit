export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

export async function GET() {
  const headers = [
    "member_id",
    "name",
    "email",
    "mobile",
    "address",
    "date_of_birth",
    "gender",
    "height",
    "weight",
    "joining_date",
    "membership_plan",
    "trainer",
  ].join(",");

  const sampleRows = [
    "MEM-010,Kunal Verma,kunal.verma@example.com,9876543220,12 Elm Street Metro City,1995-04-12,MALE,178,75.5,2026-09-01,Standard Quarterly,Marcus Stone",
    "MEM-011,Deepika Joshi,deepika.j@example.com,9876543221,45 Marine Drive Metro City,1998-08-23,FEMALE,165,58.0,2026-09-15,Elite Annual,Sarah Jenkins",
    "MEM-012,Rohan Bhatia,rohan.b@example.com,9876543222,88 Park Avenue Metro City,1992-11-05,MALE,182,82.0,2026-09-20,Basic Monthly,",
  ].join("\n");

  const csvContent = `${headers}\n${sampleRows}\n`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="o2hyperfit_members_template.csv"',
    },
  });
}
