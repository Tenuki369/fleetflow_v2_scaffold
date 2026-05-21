import { LoadStatus } from "@prisma/client";
import { z } from "zod";

export const loadWriteSchema = z.object({
  referenceNumber: z.string().min(1).max(64),
  customerId: z.string().cuid().optional(),
  driverId: z.string().cuid().optional(),
  truckId: z.string().cuid().optional(),
  origin: z.string().min(1),
  destination: z.string().min(1),
  pickupAt: z.coerce.date(),
  deliverBy: z.coerce.date(),
  rateCents: z.number().int().nonnegative(),
  miles: z.number().int().nonnegative().optional(),
  notes: z.string().max(2000).optional(),
});

export type LoadWriteInput = z.infer<typeof loadWriteSchema>;

export function deriveLoadStatusForWrite(
  currentStatus: LoadStatus | null,
  driverId?: string,
): LoadStatus {
  if (currentStatus && currentStatus !== LoadStatus.AVAILABLE && currentStatus !== LoadStatus.ASSIGNED) {
    return currentStatus;
  }

  return driverId ? LoadStatus.ASSIGNED : LoadStatus.AVAILABLE;
}
