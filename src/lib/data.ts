// Dummy data for TrainU app

export const trainers = [
  {
    id: "t1",
    slug: "sarah-chen",
    name: "Sarah Chen",
    title: "Strength & Conditioning Coach",
    location: "San Francisco, CA",
    specialties: ["Strength Training", "Olympic Lifting", "Nutrition"],
    bio: "10+ years coaching elite athletes and everyday fitness enthusiasts. Certified in Olympic weightlifting and sports nutrition.",
    verified: true,
    rating: 4.9,
    clients: 24,
    sessions: 840,
    image: "/placeholder.svg",
  },
  {
    id: "t2",
    slug: "marcus-rodriguez",
    name: "Marcus Rodriguez",
    title: "CrossFit & HIIT Specialist",
    location: "Austin, TX",
    specialties: ["CrossFit", "HIIT", "Mobility"],
    bio: "Former competitive CrossFit athlete turned coach. Passionate about helping clients reach their peak performance.",
    verified: true,
    rating: 4.8,
    clients: 18,
    sessions: 620,
    image: "/placeholder.svg",
  },
  {
    id: "t3",
    slug: "emily-williams",
    name: "Emily Williams",
    title: "Yoga & Mindfulness Coach",
    location: "Los Angeles, CA",
    specialties: ["Yoga", "Meditation", "Flexibility"],
    bio: "500-hour certified yoga instructor specializing in vinyasa flow and restorative practices.",
    verified: true,
    rating: 5.0,
    clients: 32,
    sessions: 1100,
    image: "/placeholder.svg",
  },
  {
    id: "t4",
    slug: "david-kim",
    name: "David Kim",
    title: "Sports Performance Coach",
    location: "Seattle, WA",
    specialties: ["Athletic Performance", "Speed Training", "Recovery"],
    bio: "Former D1 track athlete with a passion for sports science and performance optimization.",
    verified: false,
    rating: 4.7,
    clients: 15,
    sessions: 380,
    image: "/placeholder.svg",
  },
  {
    id: "t5",
    slug: "lisa-anderson",
    name: "Lisa Anderson",
    title: "Weight Loss & Wellness Coach",
    location: "Denver, CO",
    specialties: ["Weight Loss", "Lifestyle Coaching", "Meal Planning"],
    bio: "Holistic approach to sustainable weight loss through balanced nutrition and mindful movement.",
    verified: true,
    rating: 4.9,
    clients: 28,
    sessions: 950,
    image: "/placeholder.svg",
  },
  {
    id: "t6",
    slug: "james-taylor",
    name: "James Taylor",
    title: "Bodybuilding & Hypertrophy Coach",
    location: "Miami, FL",
    specialties: ["Bodybuilding", "Muscle Building", "Contest Prep"],
    bio: "IFBB Pro bodybuilder and coach with 15 years of competitive experience.",
    verified: true,
    rating: 4.8,
    clients: 20,
    sessions: 720,
    image: "/placeholder.svg",
  },
  {
    id: "t7",
    slug: "anna-martinez",
    name: "Anna Martinez",
    title: "Pilates & Core Specialist",
    location: "Boston, MA",
    specialties: ["Pilates", "Core Training", "Posture"],
    bio: "Certified Pilates instructor focused on core strength, flexibility, and injury prevention.",
    verified: false,
    rating: 4.6,
    clients: 22,
    sessions: 580,
    image: "/placeholder.svg",
  },
  {
    id: "t8",
    slug: "chris-thompson",
    name: "Chris Thompson",
    title: "Functional Fitness Coach",
    location: "Portland, OR",
    specialties: ["Functional Training", "Injury Prevention", "Mobility"],
    bio: "Movement specialist helping clients build practical strength for everyday life.",
    verified: true,
    rating: 4.9,
    clients: 26,
    sessions: 890,
    image: "/placeholder.svg",
  },
];

export const clients = [
  {
    id: "c1",
    name: "Alex Johnson",
    trainer: "Sarah Chen",
    progress: 78,
    goals: 3,
    nextSession: "Tomorrow at 10:00 AM",
  },
  {
    id: "c2",
    name: "Jamie Smith",
    trainer: "Marcus Rodriguez",
    progress: 62,
    goals: 2,
    nextSession: "Friday at 2:00 PM",
  },
];

// Generate 90 days of metrics data
export const generateMetricsData = (days = 90) => {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      activeClients: Math.floor(20 + Math.random() * 10),
      sessionsPerWeek: Math.floor(35 + Math.random() * 15),
      retention: Math.floor(85 + Math.random() * 10),
      avgProgress: Math.floor(70 + Math.random() * 20),
      socialReach: Math.floor(1000 + Math.random() * 500),
      adClicks: Math.floor(50 + Math.random() * 30),
      missedSessions: Math.floor(2 + Math.random() * 4),
      showRate: Math.floor(88 + Math.random() * 10),
      rebookRate: Math.floor(75 + Math.random() * 15),
      goalProgress: Math.floor(65 + Math.random() * 25),
      entriesPerWeek: Math.floor(4 + Math.random() * 3),
    });
  }
  
  return data;
};

export const events = [
  {
    id: "e1",
    title: "Morning Bootcamp Challenge",
    date: "2025-10-15",
    time: "6:00 AM",
    location: "Central Park Training Area",
    attending: 24,
    image: "/placeholder.svg",
  },
  {
    id: "e2",
    title: "Yoga & Meditation Session",
    date: "2025-10-18",
    time: "7:00 PM",
    location: "Sunset Beach Studio",
    attending: 18,
    image: "/placeholder.svg",
  },
  {
    id: "e3",
    title: "CrossFit Competition",
    date: "2025-10-22",
    time: "9:00 AM",
    location: "Downtown Athletic Center",
    attending: 45,
    image: "/placeholder.svg",
  },
];

export const communityMembers = [
  { id: "m1", name: "Alex Rivera", gym: "PowerHouse Fitness", location: "San Francisco" },
  { id: "m2", name: "Jordan Lee", gym: "Fit Zone", location: "Austin" },
  { id: "m3", name: "Taylor Morgan", gym: "CrossFit Central", location: "Los Angeles" },
  { id: "m4", name: "Casey Brooks", gym: "Iron Temple", location: "Seattle" },
  { id: "m5", name: "Sam Peterson", gym: "Movement Studio", location: "Denver" },
  { id: "m6", name: "Riley Carter", gym: "Elite Performance", location: "Miami" },
];

export const conversations = [
  {
    id: "conv1",
    name: "Sarah Chen",
    lastMessage: "Great session today! Let's focus on form next time.",
    timestamp: "2h ago",
    unread: false,
  },
  {
    id: "conv2",
    name: "Marcus Rodriguez",
    lastMessage: "Can we reschedule Friday's session?",
    timestamp: "5h ago",
    unread: true,
  },
  {
    id: "conv3",
    name: "Emily Williams",
    lastMessage: "Thanks for the nutrition tips!",
    timestamp: "1d ago",
    unread: false,
  },
];

export const trainerKPIs = {
  activeClients: 24,
  sessionsThisWeek: 42,
  retention: 92,
  avgProgress: 78,
  earnings: 8400,
};

export const clientKPIs = {
  progress: 78,
  openGoals: 3,
  entriesThisWeek: 5,
  nextSession: "Tomorrow at 10:00 AM",
};
