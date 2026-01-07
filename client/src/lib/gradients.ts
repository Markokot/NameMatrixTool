export const RACE_GRADIENTS = [
  {
    name: 'coral',
    background: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
    textColor: 'text-white',
    chipClass: 'chip-gradient-1'
  },
  {
    name: 'azure',
    background: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
    textColor: 'text-white',
    chipClass: 'chip-gradient-2'
  },
  {
    name: 'lagoon',
    background: 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)',
    textColor: 'text-gray-900',
    chipClass: 'chip-gradient-3'
  },
  {
    name: 'flamingo',
    background: 'linear-gradient(135deg, #FA709A 0%, #FEE140 100%)',
    textColor: 'text-white',
    chipClass: 'chip-gradient-4'
  },
  {
    name: 'royal',
    background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
    textColor: 'text-white',
    chipClass: 'chip-gradient-5'
  },
  {
    name: 'citrus',
    background: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)',
    textColor: 'text-white',
    chipClass: 'chip-gradient-6'
  },
  {
    name: 'sunset',
    background: 'linear-gradient(135deg, #F97316 0%, #FBBF24 100%)',
    textColor: 'text-white',
    chipClass: 'chip-gradient-1'
  },
  {
    name: 'ocean',
    background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
    textColor: 'text-white',
    chipClass: 'chip-gradient-2'
  }
];

export function getGradientForRace(index: number) {
  return RACE_GRADIENTS[index % RACE_GRADIENTS.length];
}

export function getChipGradientClass(index: number) {
  const chipClasses = [
    'chip-gradient-1',
    'chip-gradient-2', 
    'chip-gradient-3',
    'chip-gradient-4',
    'chip-gradient-5',
    'chip-gradient-6'
  ];
  return chipClasses[index % chipClasses.length];
}
