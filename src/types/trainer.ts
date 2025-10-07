export type Trainer = {
  id: string;
  name: string;
  slug: string;
  city?: string;
  state?: string;
  avatarUrl?: string;
  specialties?: string[];
  verified?: boolean;
  bio?: string;
  socials?: { instagram?: string; website?: string };
  // Enhanced profile data
  stats?: {
    totalClients?: number;
    yearsExperience?: number;
    sessionsCompleted?: number;
    responseTime?: string; // e.g., "Within 1 hour"
  };
  certifications?: Array<{
    name: string;
    issuer: string;
    year: number;
  }>;
  availability?: {
    daysAvailable?: string[];
    timeRanges?: string[];
  };
  videoIntroUrl?: string;
  transformations?: Array<{
    beforeImg: string;
    afterImg: string;
    clientName: string;
    description: string;
  }>;
  rating?: number;
  reviewCount?: number;
};
