import { Trainer } from "@/types/trainer";

export const MOCK_TRAINERS: Trainer[] = [
  {
    id: "t1",
    name: "Alex Carter",
    slug: "alex-carter",
    city: "Chicago",
    state: "IL",
    avatarUrl: "https://i.pravatar.cc/150?img=1",
    specialties: ["Strength", "Mobility"],
    verified: true,
    bio: "Former collegiate athlete. Focus on sustainability + strength.",
    socials: { instagram: "https://instagram.com/alex", website: "#" }
  },
  {
    id: "t2",
    name: "Riley Nguyen",
    slug: "riley-nguyen",
    city: "Evanston",
    state: "IL",
    avatarUrl: "https://i.pravatar.cc/150?img=2",
    specialties: ["Weight Loss", "HIIT"],
    verified: true,
  }
];
