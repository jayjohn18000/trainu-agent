export type UserRole = "owner" | "client" | "trainer" | "gym_admin";
export type PaymentsProvider = "stripe" | "whop" | "hybrid";

export const PAYMENTS_PROVIDER: PaymentsProvider = "hybrid";

export const APP_NAME = "TrainU";
export const DEFAULT_ROLE: UserRole = "client";
