const groups = [
  {
    category: 'Hauteur des sommets', unit: 'm', prompt: 'Quel sommet est le plus haut ?', minGap: 0.03,
    items: [['Everest',8849],['K2',8611],['Kangchenjunga',8586],['Lhotse',8516],['Makalu',8485],['Cho Oyu',8188],['Dhaulagiri I',8167],['Manaslu',8163],['Nanga Parbat',8126],['Annapurna I',8091],['Aconcagua',6961],['Denali',6190],['Kilimandjaro',5895],['Mont Elbrouz',5642],['Mont Kenya',5199],['Puncak Jaya',4884],['Mont Blanc',4806],['Cervin',4478],['Mont Fuji',3776],['Mont Kosciuszko',2228]]
  },
  {
    category: 'Longueur des fleuves', unit: 'km', prompt: 'Quel fleuve est le plus long ?', minGap: 0.08,
    items: [['Nil',6650],['Amazone',6400],['Yangtsé',6300],['Mississippi-Missouri',6275],['Ienisseï',5539],['Fleuve Jaune',5464],['Ob-Irtych',5410],['Paraná',4880],['Congo',4700],['Amour',4444],['Léna',4400],['Mékong',4350],['Mackenzie',4241],['Niger',4184],['Murray-Darling',3672],['Volga',3530],['Danube',2850],['Gange',2525],['Rhin',1233],['Loire',1006]]
  },
  {
    category: 'Superficie des pays', unit: 'km²', prompt: 'Quel pays est le plus grand ?', minGap: 0.06,
    items: [['Russie',17098242],['Canada',9984670],['Chine',9596961],['États-Unis',9525067],['Brésil',8515767],['Australie',7692024],['Inde',3287263],['Argentine',2780400],['Kazakhstan',2724900],['Algérie',2381741],['RDC',2344858],['Arabie saoudite',2149690],['Mexique',1964375],['Indonésie',1904569],['Soudan',1886068],['Libye',1759540],['Iran',1648195],['Mongolie',1564116],['Pérou',1285216],['Tchad',1284000]]
  },
  {
    category: 'Superficie des îles', unit: 'km²', prompt: 'Quelle île est la plus grande ?', minGap: 0.07,
    items: [['Groenland',2166086],['Nouvelle-Guinée',785753],['Bornéo',748168],['Madagascar',587041],['Île de Baffin',507451],['Sumatra',473481],['Honshu',225800],['Victoria',217291],['Grande-Bretagne',209331],['Ellesmere',196236],['Sulawesi',180681],['Île du Sud (NZ)',145836],['Java',138794],['Île du Nord (NZ)',111583],['Luzon',109965],['Islande',103000],['Mindanao',97530],['Irlande',84421],['Hokkaido',83424],['Hispaniola',76192]]
  },
  {
    category: 'Point de fusion des métaux', unit: '°C', prompt: 'Quel métal fond à la température la plus élevée ?', minGap: 0.1,
    items: [['Mercure',-38.83],['Étain',231.93],['Plomb',327.46],['Zinc',419.53],['Aluminium',660.32],['Argent',961.78],['Or',1064.18],['Cuivre',1084.62],['Nickel',1455],['Fer',1538],['Titane',1668],['Platine',1768.3],['Tungstène',3422]]
  },
  {
    category: 'Vitesse maximale approximative', unit: 'km/h', prompt: 'Lequel peut aller le plus vite ?', minGap: 0.18,
    items: [['Guépard',100],['Cheval',88],['Lion',80],['Lévrier',72],['Lièvre',72],['Kangourou',71],['Autruche',70],['Girafe',60],['Loup',60],['Rhinocéros',50],['Ours brun',48],['Chat domestique',48],['Humain en sprint',45],['Éléphant',40],['Hippopotame',30]]
  },
  {
    category: 'Durée de gestation moyenne', unit: 'jours', prompt: 'Lequel a la gestation la plus longue ?', minGap: 0.15,
    items: [['Éléphant',660],['Girafe',450],['Cheval',340],['Vache',283],['Humain',280],['Gorille',257],['Mouton',152],['Chèvre',150],['Cochon',114],['Lion',110],['Tigre',105],['Chat',65],['Chien',63],['Lapin',31],['Souris',20]]
  },
  {
    category: 'Profondeur maximale', unit: 'm', prompt: 'Lequel atteint la plus grande profondeur ?', minGap: 0.12,
    items: [['Océan Pacifique',10984],['Océan Atlantique',8376],['Mer des Caraïbes',7686],['Océan Indien',7258],['Mer Méditerranée',5267],['Mer Rouge',3040],['Mer Noire',2212],['Lac Baïkal',1642],['Lac Tanganyika',1470],['Mer Caspienne',1025],['Lac Supérieur',406],['Lac Léman',310]]
  },
  {
    category: 'Année de première sortie', unit: '', prompt: 'Lequel est sorti le plus récemment ?', minYearGap: 3,
    items: [['Premier iPhone',2007],['Premier iPad',2010],['Nintendo Switch',2017],['PlayStation',1994],['PlayStation 2',2000],['Xbox',2001],['Game Boy',1989],['NES',1983],['World Wide Web public',1991],['YouTube',2005],['Wikipedia',2001],['Android',2008],['Windows 95',1995],['Macintosh',1984],['CD audio',1982],['DVD',1996]]
  }
]

function isClearEnough(group, a, b) {
  const gap = Math.abs(a - b)
  if (group.minYearGap) return gap >= group.minYearGap
  const scale = Math.max(Math.abs(a), Math.abs(b), 1)
  return gap / scale >= group.minGap
}

const perGroup = groups.map(group => {
  const result = []
  for (let i = 0; i < group.items.length; i++) {
    for (let j = i + 1; j < group.items.length; j++) {
      const [leftLabel, leftValue] = group.items[i]
      const [rightLabel, rightValue] = group.items[j]
      if (leftValue === rightValue || !isClearEnough(group, leftValue, rightValue)) continue
      result.push({
        category: group.category,
        prompt: group.prompt,
        left: { label: leftLabel, value: leftValue },
        right: { label: rightLabel, value: rightValue },
        answer: leftValue > rightValue ? 'left' : 'right',
        unit: group.unit
      })
    }
  }
  return result
})

const balanced = []
for (let round = 0; balanced.length < 240; round++) {
  let added = false
  for (const pool of perGroup) {
    if (pool[round]) {
      balanced.push(pool[round])
      added = true
      if (balanced.length === 240) break
    }
  }
  if (!added) break
}

export const questions = balanced.map((question, index) => ({
  id: `q${String(index + 1).padStart(3, '0')}`,
  ...question
}))

export default questions
