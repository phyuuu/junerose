export type StaffRole = "admin" | "staff";

export type StaffAccess = {
  userId: string;
  email: string;
  displayName: string | null;
  role: StaffRole;
  isActive: boolean;
  createdAt: string;
  lastSignInAt: string | null;
};
