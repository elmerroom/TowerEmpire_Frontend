export const personalProfileRanks = [
  {
    'Новичок I': 50,
    'Новичок II': 110,
    'Новичок III': 170,
    'Новичок IV': 230,
    'Новичок V': 300,
    'Ученик I': 440,
  },
];

// упорядоченный массив по возрастанию XP.
export const rankLevels = [
  // Новичок (границы: 0, 50, 110, 170, 230, 300)
  { rank: 'Новичок', subRank: 'I', xp: 0 },
  { rank: 'Новичок', subRank: 'II', xp: 50 },
  { rank: 'Новичок', subRank: 'III', xp: 110 },
  { rank: 'Новичок', subRank: 'IV', xp: 170 },
  { rank: 'Новичок', subRank: 'V', xp: 230 },
  { rank: 'Ученик', subRank: 'I', xp: 300 }, // Переход на следующее звание

  // Ученик (границы: 300, 440, 580, 720, 860, 1000)
  { rank: 'Ученик', subRank: 'I', xp: 300 },
  { rank: 'Ученик', subRank: 'II', xp: 440 },
  { rank: 'Ученик', subRank: 'III', xp: 580 },
  { rank: 'Ученик', subRank: 'IV', xp: 720 },
  { rank: 'Ученик', subRank: 'V', xp: 860 },
  { rank: 'Начинающий', subRank: 'I', xp: 1000 },

  { rank: 'Начинающий', subRank: 'I', xp: 1000 },
  { rank: 'Начинающий', subRank: 'II', xp: 1200 },
  { rank: 'Начинающий', subRank: 'III', xp: 1400 },
  { rank: 'Начинающий', subRank: 'IV', xp: 1600 },
  { rank: 'Начинающий', subRank: 'V', xp: 1800 },
  { rank: 'Подмастерье', subRank: 'I', xp: 2000 },

  { rank: 'Подмастерье', subRank: 'I', xp: 2000 },
  { rank: 'Подмастерье', subRank: 'II', xp: 2400 },
  { rank: 'Подмастерье', subRank: 'III', xp: 2800 },
  { rank: 'Подмастерье', subRank: 'IV', xp: 3200 },
  { rank: 'Подмастерье', subRank: 'V', xp: 3600 },
  { rank: 'Маг', subRank: 'I', xp: 4000 },

  { rank: 'Маг', subRank: 'I', xp: 4000 },
  { rank: 'Маг', subRank: 'II', xp: 4400 },
  { rank: 'Маг', subRank: 'III', xp: 4800 },
  { rank: 'Маг', subRank: 'IV', xp: 5200 },
  { rank: 'Маг', subRank: 'V', xp: 5600 },
  { rank: 'Магистр', subRank: 'I', xp: 6000 },

  { rank: 'Магистр', subRank: 'I', xp: 6000 },
  { rank: 'Магистр', subRank: 'II', xp: 6200 },
  { rank: 'Магистр', subRank: 'III', xp: 6400 },
  { rank: 'Магистр', subRank: 'IV', xp: 6600 },
  { rank: 'Магистр', subRank: 'V', xp: 6800 },
  { rank: 'Ученый', subRank: 'I', xp: 7000 },

  { rank: 'Ученый', subRank: 'I', xp: 7000 },
  { rank: 'Ученый', subRank: 'II', xp: 7300 },
  { rank: 'Ученый', subRank: 'III', xp: 7600 },
  { rank: 'Ученый', subRank: 'IV', xp: 7900 },
  { rank: 'Ученый', subRank: 'V', xp: 8200 },
  { rank: 'Архимаг', subRank: 'I', xp: 8500 },

  { rank: 'Архимаг', subRank: 'I', xp: 8500 },
  { rank: 'Архимаг', subRank: 'II', xp: 8800 },
  { rank: 'Архимаг', subRank: 'III', xp: 9100 },
  { rank: 'Архимаг', subRank: 'IV', xp: 9400 },
  { rank: 'Архимаг', subRank: 'V', xp: 9700 },
  { rank: 'Магистр магии', subRank: 'I', xp: 10000 },

  { rank: 'Магистр магии', subRank: 'I', xp: 10000 },
  { rank: 'Магистр магии', subRank: 'II', xp: 11000 },
  { rank: 'Магистр магии', subRank: 'III', xp: 12000 },
  { rank: 'Магистр магии', subRank: 'IV', xp: 13000 },
  { rank: 'Магистр магии', subRank: 'V', xp: 14000 },
  { rank: 'Магистрат', subRank: 'I', xp: 15000 },

  { rank: 'Магистрат', subRank: 'I', xp: 15000 },
  { rank: 'Магистрат', subRank: 'II', xp: 16000 },
  { rank: 'Магистрат', subRank: 'III', xp: 17000 },
  { rank: 'Магистрат', subRank: 'IV', xp: 18000 },
  { rank: 'Магистрат', subRank: 'V', xp: 19000 },
  { rank: 'Магистрат', subRank: 'V', xp: 20000 },
];
