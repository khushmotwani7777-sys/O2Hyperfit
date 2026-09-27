import { beforeAll, afterAll } from "vitest";
import prisma from "../src/lib/prisma";

beforeAll(async () => {
  // Ensure DB connection is alive
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});
