import { z } from "zod";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const randomDelay = () => sleep(300 + Math.random() * 400);

// ==================== SCHEMAS ====================

export const Trainer = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  email: z.string().email(),
  city: z.string(),
  state: z.string(),
  avatarUrl: z.string().optional(),
  specialties: z.array(z.string()),
  verified: z.boolean(),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  bio: z.string().optional(),
  socials: z
    .object({
      instagram: z.string().optional(),
      website: z.string().optional(),
    })
    .optional(),
  gymId: z.string(),
});
export type Trainer = z.infer<typeof Trainer>;

export const SessionType = z.object({
  id: z.string(),
  trainerId: z.string(),
  title: z.string(),
  duration: z.number(),
  price: z.number(),
  capacity: z.number(),
  mode: z.enum(["in_person", "virtual"]),
  description: z.string().optional(),
});
export type SessionType = z.infer<typeof SessionType>;

export const Gym = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  state: z.string(),
  address: z.string(),
  description: z.string().optional(),
});
export type Gym = z.infer<typeof Gym>;

export const Booking = z.object({
  id: z.string(),
  clientId: z.string(),
  trainerId: z.string(),
  sessionTypeId: z.string(),
  startAt: z.string(),
  endAt: z.string(),
  status: z.enum(["confirmed", "canceled", "rescheduled", "completed"]),
  virtualProvider: z.string().nullable(),
  virtualJoinUrl: z.string().nullable(),
});
export type Booking = z.infer<typeof Booking>;

// ==================== API METHODS ====================

export async function listTrainers(filters?: {
  city?: string;
  specialty?: string;
}): Promise<Trainer[]> {
  await randomDelay();
  const data = (await import("@/fixtures/trainers.json")).default;
  let results = data;
  
  if (filters?.city) {
    results = results.filter((t: any) =>
      t.city.toLowerCase().includes(filters.city!.toLowerCase())
    );
  }
  if (filters?.specialty) {
    results = results.filter((t: any) =>
      t.specialties.some((s: string) =>
        s.toLowerCase().includes(filters.specialty!.toLowerCase())
      )
    );
  }
  
  return results as Trainer[];
}

export async function getTrainerBySlug(slug: string): Promise<Trainer | null> {
  await randomDelay();
  const data = (await import("@/fixtures/trainers.json")).default;
  return (data.find((t: any) => t.slug === slug) as Trainer) || null;
}

export async function listSessionTypesByTrainer(
  trainerId: string
): Promise<SessionType[]> {
  await randomDelay();
  const data = (await import("@/fixtures/sessionTypes.json")).default;
  return data.filter((st: any) => st.trainerId === trainerId) as SessionType[];
}

export async function listGyms(): Promise<Gym[]> {
  await randomDelay();
  const data = (await import("@/fixtures/gyms.json")).default;
  return data as Gym[];
}

export async function getGymById(id: string): Promise<Gym | null> {
  await randomDelay();
  const data = (await import("@/fixtures/gyms.json")).default;
  return (data.find((g: any) => g.id === id) as Gym) || null;
}

// Mock booking creation
export async function createBooking(data: {
  sessionTypeId: string;
  startAt: string;
  endAt: string;
}): Promise<Booking> {
  await randomDelay();
  return {
    id: `booking-${Date.now()}`,
    clientId: "demo-user",
    trainerId: "t1", // mock
    sessionTypeId: data.sessionTypeId,
    startAt: data.startAt,
    endAt: data.endAt,
    status: "confirmed",
    virtualProvider: null,
    virtualJoinUrl: null,
  };
}
