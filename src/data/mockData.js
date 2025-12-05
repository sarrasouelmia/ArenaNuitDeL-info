const mockTeams = [
  {
    id: 1,
    name: "Team Phoenix",
    members: ["Alice", "Bob", "Charlie", "Diana"],
    score: 1250,
    level: 3,
    status: "active",
    createdAt: "2024-12-05T10:00:00",
    lastUpdate: "2024-12-05T18:45:00",
    challenges: ["SFEIR", "UX", "Main"],
    badges: ["First Blood", "Code Master"],
    avatar: "P"
  },
  {
    id: 2,
    name: "Dev Ninjas",
    members: ["Eve", "Frank", "Grace"],
    score: 980,
    level: 2,
    status: "active",
    createdAt: "2024-12-05T10:15:00",
    lastUpdate: "2024-12-05T18:40:00",
    challenges: ["SFEIR", "UX"],
    badges: ["UX Wizard"],
    avatar: "D"
  },
  {
    id: 3,
    name: "Code Masters",
    members: ["Henry", "Ivy", "Jack", "Karen", "Leo"],
    score: 850,
    level: 2,
    status: "active",
    createdAt: "2024-12-05T10:30:00",
    lastUpdate: "2024-12-05T18:35:00",
    challenges: ["MIAGE", "Main"],
    badges: ["Bug Hunter"],
    avatar: "C"
  },
  {
    id: 4,
    name: "UI/UX Wizards",
    members: ["Mia", "Noah", "Olivia"],
    score: 720,
    level: 1,
    status: "active",
    createdAt: "2024-12-05T10:45:00",
    lastUpdate: "2024-12-05T18:30:00",
    challenges: ["UX", "Accessibility"],
    badges: [],
    avatar: "U"
  },
  {
    id: 5,
    name: "Backend Titans",
    members: ["Paul", "Quinn", "Rachel", "Sam"],
    score: 650,
    level: 1,
    status: "active",
    createdAt: "2024-12-05T11:00:00",
    lastUpdate: "2024-12-05T18:25:00",
    challenges: ["SFEIR", "MIAGE"],
    badges: ["Database Guru"],
    avatar: "B"
  }
];

const mockEvents = [
  {
    id: 1,
    type: 'score',
    team: 'Team Phoenix',
    points: 50,
    challenge: 'SFEIR',
    time: '18:45',
    user: 'Admin',
    details: 'Excellent travail sur l\'API'
  },
  {
    id: 2,
    type: 'badge',
    team: 'Dev Ninjas',
    badge: 'Code Propre',
    time: '18:40',
    user: 'Admin',
    details: 'Code bien structuré et documenté'
  },
  {
    id: 3,
    type: 'submission',
    team: 'Code Masters',
    challenge: 'Main',
    time: '18:35',
    user: 'System',
    details: 'Défi principal soumis'
  },
  {
    id: 4,
    type: 'team',
    team: 'UI/UX Wizards',
    action: 'created',
    time: '18:30',
    user: 'Admin',
    details: 'Nouvelle équipe créée'
  },
  {
    id: 5,
    type: 'score',
    team: 'Team Phoenix',
    points: 40,
    challenge: 'Main',
    time: '18:25',
    user: 'Jury',
    details: 'Soumission complète et fonctionnelle'
  },
  {
    id: 6,
    type: 'message',
    message: 'La soumission du défi UX ferme dans 15 minutes !',
    time: '18:20',
    user: 'Admin',
    details: 'Message global envoyé'
  },
  {
    id: 7,
    type: 'score',
    team: 'Dev Ninjas',
    points: 30,
    challenge: 'UX',
    time: '18:15',
    user: 'Jury',
    details: 'Design très ergonomique'
  },
  {
    id: 8,
    type: 'badge',
    team: 'Code Masters',
    badge: 'Multi-Challenge',
    time: '18:10',
    user: 'Admin',
    details: 'A terminé plusieurs défis'
  }
];

const mockData = {
  teams: mockTeams,
  events: mockEvents
};

export default mockData;