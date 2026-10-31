export interface ImpactMilestone {
  liters: number;
  title: string;
  description: string;
  icon: string;
  badgeColor: string;
}

export const IMPACT_MILESTONES: ImpactMilestone[] = [
  {
    liters: 5,
    title: 'Daily Water for a Child',
    description: '5 Liters provides enough clean drinking and cooking water for a child for an entire day.',
    icon: '🚰',
    badgeColor: '#2E9DF7',
  },
  {
    liters: 10,
    title: 'BioSand Filter Activated',
    description: '10 Liters purified: Community biosand filters remove 99% of harmful bacteria without electricity.',
    icon: '🧪',
    badgeColor: '#8BD1CB',
  },
  {
    liters: 15,
    title: 'Classroom Water Station',
    description: '15 Liters keeps students hydrated and in school, preventing waterborne illness absenteeism.',
    icon: '🏫',
    badgeColor: '#4FCB53',
  },
  {
    liters: 20,
    title: 'Full 20L Jerry Can!',
    description: 'A full 20-Liter yellow jerry can (~40 lbs) supplies a household with safe water for days.',
    icon: '🟡',
    badgeColor: '#FFC907',
  },
  {
    liters: 25,
    title: 'Piped Tap Stand Milestone',
    description: '25+ Liters supports sustainable solar-powered piped water systems delivering water directly to villages.',
    icon: '🌍',
    badgeColor: '#FF902A',
  },
];
