export type UserRole = "client" | "trainer" | "gym_admin" | "admin";
export type PaymentsProvider = "stripe" | "whop" | "hybrid";

export const PAYMENTS_PROVIDER: PaymentsProvider = "hybrid";

export const APP_NAME = "TrainU";
export const DEFAULT_ROLE: UserRole = "client";
