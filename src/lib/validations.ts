import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const memberCreateSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Valid phone number required"),
  address: z.string().optional(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).default("OTHER"),
  height: z.coerce.number().positive().optional().nullable(),
  weight: z.coerce.number().positive().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),
  assignedTrainerId: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).default("ACTIVE"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

export const memberUpdateSchema = memberCreateSchema.partial();

export const trainerCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Valid phone number required"),
  specialization: z.string().min(2, "Specialization is required"),
  experienceYears: z.coerce.number().min(0, "Experience cannot be negative").default(0),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

export const membershipPlanSchema = z.object({
  name: z.string().min(2, "Plan name is required"),
  durationMonths: z.coerce.number().int().min(1, "Duration must be at least 1 month"),
  price: z.coerce.number().min(0, "Price must be positive"),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const assignMembershipSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  planId: z.string().min(1, "Plan is required"),
  startDate: z.string().or(z.date()).optional(),
  autoRenew: z.boolean().default(false),
  notes: z.string().optional(),
});

export const paymentCreateSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  membershipId: z.string().optional().nullable(),
  amount: z.coerce.number().positive("Amount must be positive"),
  paymentMethod: z.enum(["CASH", "UPI", "CARD", "BANK_TRANSFER"]),
  transactionRef: z.string().optional().nullable(),
  status: z.enum(["COMPLETED", "PENDING", "FAILED", "REFUNDED"]).default("COMPLETED"),
  paymentDate: z.string().optional(),
  notes: z.string().optional().nullable(),
});

export const attendanceCheckInSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  status: z.enum(["PRESENT", "LATE", "EXCUSED"]).default("PRESENT"),
  notes: z.string().optional().nullable(),
});

export const exerciseSchema = z.object({
  name: z.string().min(2, "Exercise name is required"),
  category: z.string().min(2, "Category is required"),
  muscleGroup: z.string().min(2, "Muscle group is required"),
  equipment: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  instructions: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
});

export const workoutPlanSchema = z.object({
  planName: z.string().min(2, "Plan name is required"),
  memberId: z.string().min(1, "Member is required"),
  trainerId: z.string().optional().nullable(),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  exercises: z.array(
    z.object({
      exerciseId: z.string().min(1, "Exercise is required"),
      dayOfWeek: z.string().min(1, "Day is required"),
      sets: z.coerce.number().int().min(1).default(3),
      reps: z.coerce.number().int().min(1).default(10),
      weightKg: z.coerce.number().min(0).optional().nullable(),
      restSeconds: z.coerce.number().int().min(0).default(60),
      trainerNotes: z.string().optional().nullable(),
      order: z.coerce.number().int().default(1),
    })
  ).optional(),
});

export const progressRecordSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  date: z.string().optional(),
  weightKg: z.coerce.number().positive("Weight must be positive"),
  bodyFatPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
  chestCm: z.coerce.number().positive().optional().nullable(),
  waistCm: z.coerce.number().positive().optional().nullable(),
  armsCm: z.coerce.number().positive().optional().nullable(),
  thighsCm: z.coerce.number().positive().optional().nullable(),
  notes: z.string().optional().nullable(),
});
