import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .max(200)
  .optional()
  .transform((value) => (value ? value : null));

export const customerCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  contact: optionalText,
  email: z.string().trim().email().optional().or(z.literal("")).transform((value) => (value ? value : null)),
  phone: optionalText,
  address: optionalText,
});

export const driverCreateSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().optional().or(z.literal("")).transform((value) => (value ? value : null)),
  phone: optionalText,
  licenseNumber: optionalText,
  truckId: z.string().cuid().optional().or(z.literal("")).transform((value) => (value ? value : null)),
});

export const truckCreateSchema = z.object({
  unitNumber: z.string().trim().min(1).max(50),
  vin: optionalText,
  plate: optionalText,
  make: optionalText,
  model: optionalText,
  year: z.coerce.number().int().min(1990).max(2100).optional().or(z.literal("")).transform((value) => {
    if (value === "") return null;
    return value ?? null;
  }),
});
