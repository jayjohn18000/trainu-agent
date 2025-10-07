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
};
