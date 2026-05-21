import { Role } from "@prisma/client";

export function canUpdateAssignedLoadAsDriver(input: {
  role: Role;
  currentUserId: string;
  assignedDriverUserId?: string | null;
}): boolean {
  if (input.role !== Role.DRIVER) return true;
  return Boolean(input.assignedDriverUserId && input.assignedDriverUserId === input.currentUserId);
}
