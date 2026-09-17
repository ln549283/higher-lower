const groups = [
  {
    category: 'Sommets', unit: 'm', prompt: 'Quel sommet est le plus haut ?', minGap: 0.035,
    items: [['Everest',8849],['K2',8611],['Kangchenjunga',8586],['Lhotse',8516],['Makalu',8485],['Cho Oyu',8188],['Dhaulagiri I',8167],['Manaslu',8163],['Nanga Parbat',8126],['Annapurna I',8091],['Gasherbrum I',8080],['Broad Peak',8051],['Gasherbrum II',8035],['Shishapangma',8027],['Aconcagua',6961],['Denali',6190],['Kilimandjaro',5895],['Mont Elbrouz',5642],['Mont Kenya',5199],['Puncak Jaya',4884],['Mont Blanc',4806],['Cervin',4478],['Mont Fuji',3776],['Mont Kosciuszko',2228]]
  },
  {
    category: 'Fleuves', unit: 'km', prompt: 'Quel fleuve est le plus long ?', minGap: 0.1,
    items: [['Nil',6650],['Amazone',6400],['Yangtsé',6300],['Mississippi-Missouri',6275],['Ienisseï',5539],['Fleuve Jaune',5464],['Ob-Irtych',5410],['Paraná',4880],['Congo',4700],['Amour',4444],['Léna',4400],['Mékong',4350],['Mackenzie',4241],['Niger',4184],['Murray-Darling',3672],['Volga',3530],['Indus',3180],['Danube',2850],['Gange',2525],['Colorado',2330],['Rhin',1233],['Loire',1006],['Seine',775],['Tamise',346]]
  },
  {
    category: 'Pays', unit: 'km²', prompt: 'Quel pays est le plus grand ?', minGap: 0.08,
    items: [['Russie',17098242],['Canada',9984670],['Chine',9596961],['États-Unis',9525067],['Brésil',8515767],['Australie',7692024],['Inde',3287263],['Argentine',2780400],['Kazakhstan',2724900],['Algérie',2381741],['RDC',2344858],['Arabie saoudite',2149690],['Mexique',1964375],['Indonésie',1904569],['Soudan',1886068],['Libye',1759540],['Iran',1648195],['Mongolie',1564116],['Pérou',1285216],['Tchad',1284000],['Niger',1267000],['Angola',1246700],['Mali',1240192],['Afrique du Sud',1221037],['Colombie',1141748],['Éthiopie',1104300],['Bolivie',1098581],['Mauritanie',1030700],['Égypte',1002450],['Tanzanie',947303]]
  },
  {
    category: 'Îles', unit: 'km²', prompt: 'Quelle île est la plus grande ?', minGap: 0.1,
    items: [['Groenland',2166086],['Nouvelle-Guinée',785753],['Bornéo',748168],['Madagascar',587041],['Île de Baffin',507451],['Sumatra',473481],['Honshu',225800],['Victoria',217291],['Grande-Bretagne',209331],['Ellesmere',196236],['Sulawesi',180681],['Île du Sud (NZ)',145836],['Java',138794],['Île du Nord (NZ)',111583],['Luzon',109965],['Islande',103000],['Mindanao',97530],['Irlande',84421],['Hokkaido',83424],['Hispaniola',76192],['Sakhaline',72492],['Sri Lanka',65610],['Tasmanie',64519]]
  },
  {
    category: 'Planètes', unit: 'km', prompt: 'Quelle planète a le plus grand diamètre ?', minGap: 0.08,
    items: [['Mercure',4879],['Vénus',12104],['Terre',12742],['Mars',6779],['Jupiter',139820],['Saturne',116460],['Uranus',50724],['Neptune',49244]]
  },
  {
    category: 'Distance au Soleil', unit: 'millions km', prompt: 'Quelle planète est la plus éloignée du Soleil ?', minGap: 0.08,
    items: [['Mercure',57.9],['Vénus',108.2],['Terre',149.6],['Mars',227.9],['Jupiter',778.5],['Saturne',1434],['Uranus',2871],['Neptune',4495]]
  },
  {
    category: 'Orbites', unit: 'jours terrestres', prompt: 'Quelle planète met le plus de temps à faire le tour du Soleil ?', minGap: 0.1,
    items: [['Mercure',88],['Vénus',225],['Terre',365.25],['Mars',687],['Jupiter',4333],['Saturne',10759],['Uranus',30687],['Neptune',60190]]
  },
  {
    category: 'Métaux', unit: '°C', prompt: 'Quel métal fond à la température la plus élevée ?', minGap: 0.11,
    items: [['Mercure',-38.83],['Étain',231.93],['Plomb',327.46],['Zinc',419.53],['Aluminium',660.32],['Argent',961.78],['Or',1064.18],['Cuivre',1084.62],['Nickel',1455],['Fer',1538],['Titane',1668],['Platine',1768.3],['Tungstène',3422]]
  },
  {
    category: 'Éléments chimiques', unit: 'numéro atomique', prompt: 'Quel élément a le numéro atomique le plus élevé ?', minGap: 0.14,
    items: [['Hydrogène',1],['Hélium',2],['Carbone',6],['Azote',7],['Oxygène',8],['Néon',10],['Sodium',11],['Magnésium',12],['Aluminium',13],['Silicium',14],['Phosphore',15],['Soufre',16],['Chlore',17],['Argon',18],['Potassium',19],['Calcium',20],['Fer',26],['Cuivre',29],['Zinc',30],['Argent',47],['Étain',50],['Iode',53],['Or',79],['Mercure',80],['Plomb',82],['Uranium',92]]
  },
  {
    category: 'Gestation', unit: 'jours', prompt: 'Quel animal a la gestation la plus longue ?', minGap: 0.18,
    items: [['Éléphant',660],['Girafe',450],['Cheval',340],['Vache',283],['Humain',280],['Gorille',257],['Mouton',152],['Chèvre',150],['Cochon',114],['Lion',110],['Tigre',105],['Chat',65],['Chien',63],['Lapin',31],['Souris',20]]
  },
  {
    category: 'Profondeurs', unit: 'm', prompt: 'Lequel atteint la plus grande profondeur ?', minGap: 0.13,
    items: [['Océan Pacifique',10984],['Océan Atlantique',8376],['Mer des Caraïbes',7686],['Océan Indien',7258],['Mer Méditerranée',5267],['Mer Rouge',3040],['Mer Noire',2212],['Lac Baïkal',1642],['Lac Tanganyika',1470],['Mer Caspienne',1025],['Lac Supérieur',406],['Lac Léman',310]]
  },
  {
    category: 'Lacs', unit: 'km²', prompt: 'Quel lac a la plus grande superficie ?', minGap: 0.12,
    items: [['Mer Caspienne',371000],['Lac Supérieur',82100],['Lac Victoria',68870],['Lac Huron',59600],['Lac Michigan',58000],['Lac Tanganyika',32900],['Lac Baïkal',31500],['Grand lac de l’Ours',31153],['Lac Malawi',29600],['Grand lac des Esclaves',27200],['Lac Érié',25700],['Lac Winnipeg',24514],['Lac Ontario',18960],['Lac Ladoga',17700],['Lac Balkhach',16400],['Lac Vostok',12500],['Lac Titicaca',8372]]
  },
  {
    category: 'Cascades', unit: 'm', prompt: 'Quelle cascade est la plus haute ?', minGap: 0.12,
    items: [['Salto Ángel',979],['Tugela',948],['Tres Hermanas',914],['Oloʻupena',900],['Yumbilla',896],['Vinnufossen',860],['Balåifossen',850],['Puʻukaʻoku',840],['James Bruce',840],['Browne Falls',836],['Ramnefjellsfossen',818],['Waihilau',792],['Colonial Creek',788],['Mongefossen',773]]
  },
  {
    category: 'Monuments', unit: 'm', prompt: 'Quel monument est le plus haut ?', minGap: 0.12,
    items: [['Burj Khalifa',828],['Tokyo Skytree',634],['Tour de Shanghai',632],['Canton Tower',604],['CN Tower',553.3],['One World Trade Center',541.3],['Tour Ostankino',540.1],['Taipei 101',508],['Petronas Towers',451.9],['Empire State Building',443.2],['Tour Eiffel',330],['The Shard',309.6],['Chrysler Building',318.9],['Tour Montparnasse',210],['Space Needle',184],['Arc de Triomphe',50]]
  },
  {
    category: 'Consoles', unit: 'année', prompt: 'Laquelle est sortie le plus récemment ?', minYearGap: 4,
    items: [['Atari 2600',1977],['NES',1983],['Game Boy',1989],['Super Nintendo',1990],['PlayStation',1994],['Nintendo 64',1996],['Dreamcast',1998],['PlayStation 2',2000],['Game Boy Advance',2001],['Xbox',2001],['Nintendo DS',2004],['PSP',2004],['Xbox 360',2005],['PlayStation 3',2006],['Wii',2006],['Nintendo 3DS',2011],['Wii U',2012],['PlayStation 4',2013],['Xbox One',2013],['Nintendo Switch',2017],['PlayStation 5',2020],['Xbox Series X/S',2020]]
  },
  {
    category: 'Tech', unit: 'année', prompt: 'Lequel est apparu le plus récemment ?', minYearGap: 4,
    items: [['Transistor',1947],['Circuit intégré',1958],['Souris informatique',1964],['ARPANET',1969],['Microprocesseur Intel 4004',1971],['Ethernet',1973],['Apple II',1977],['IBM PC',1981],['CD audio',1982],['Macintosh',1984],['World Wide Web',1989],['Linux',1991],['Windows 95',1995],['DVD',1996],['Wi‑Fi 802.11',1997],['Wikipedia',2001],['YouTube',2005],['Premier iPhone',2007],['Android',2008],['Premier iPad',2010]]
  },
  {
    category: 'Langages', unit: 'année', prompt: 'Quel langage est apparu le plus récemment ?', minYearGap: 4,
    items: [['Fortran',1957],['Lisp',1958],['COBOL',1959],['BASIC',1964],['Pascal',1970],['C',1972],['SQL',1974],['C++',1985],['Python',1991],['Visual Basic',1991],['Lua',1993],['Java',1995],['JavaScript',1995],['PHP',1995],['C#',2000],['Scala',2004],['Go',2009],['Rust',2010],['Kotlin',2011],['Swift',2014]]
  },
  {
    category: 'Livres', unit: 'année', prompt: 'Quel livre a été publié le plus récemment ?', minYearGap: 8,
    items: [['Don Quichotte',1605],['Robinson Crusoé',1719],['Les Voyages de Gulliver',1726],['Orgueil et Préjugés',1813],['Frankenstein',1818],['Le Comte de Monte-Cristo',1844],['Les Misérables',1862],['Alice au pays des merveilles',1865],['Vingt mille lieues sous les mers',1870],['L’Île au trésor',1883],['Le Portrait de Dorian Gray',1890],['Dracula',1897],['Le Petit Prince',1943],['1984',1949],['Le Seigneur des anneaux',1954],['Dune',1965],['Cent ans de solitude',1967],['Harry Potter à l’école des sorciers',1997]]
  },
  {
    category: 'Films', unit: 'min', prompt: 'Quel film dure le plus longtemps ?', minGap: 0.13,
    items: [['Le Parrain',175],['Le Parrain 2',202],['Titanic',195],['Avatar',162],['Avatar : La Voie de l’eau',192],['Interstellar',169],['Inception',148],['Gladiator',155],['Jurassic Park',127],['Matrix',136],['Forrest Gump',142],['Pulp Fiction',154],['Les Dents de la mer',124],['Retour vers le futur',116],['Alien',117],['Terminator 2',137],['Le Roi Lion',88],['Toy Story',81],['Shrek',90],['Le Voyage de Chihiro',125],['Parasite',132]]
  },
  {
    category: 'Sports', unit: 'm', prompt: 'Quelle distance officielle est la plus longue ?', minGap: 0.2,
    items: [['100 m',100],['200 m',200],['400 m',400],['800 m',800],['1 500 m',1500],['5 000 m',5000],['10 000 m',10000],['Semi-marathon',21097.5],['Marathon',42195]]
  },
  {
    category: 'Unités', unit: 'octets', prompt: 'Quelle unité représente le plus de données ?', minGap: 0.5,
    items: [['Kilooctet',1e3],['Mégaoctet',1e6],['Gigaoctet',1e9],['Téraoctet',1e12],['Pétaoctet',1e15],['Exaoctet',1e18],['Zettaoctet',1e21],['Yottaoctet',1e24]]
  }
]

function isClearEnough(group, a, b) {
  const gap = Math.abs(a - b)
  if (group.minYearGap) return gap >= group.minYearGap
  const scale = Math.max(Math.abs(a), Math.abs(b), 1)
  return gap / scale >= group.minGap
}

const questions = []
let id = 1

for (const group of groups) {
  for (let i = 0; i < group.items.length; i++) {
    for (let j = i + 1; j < group.items.length; j++) {
      const [leftLabel, leftValue] = group.items[i]
      const [rightLabel, rightValue] = group.items[j]
      if (leftValue === rightValue || !isClearEnough(group, leftValue, rightValue)) continue

      questions.push({
        id: `q${String(id++).padStart(4, '0')}`,
        category: group.category,
        prompt: group.prompt,
        left: { label: leftLabel, value: leftValue },
        right: { label: rightLabel, value: rightValue },
        answer: leftValue > rightValue ? 'left' : 'right',
        unit: group.unit
      })
    }
  }
}

export { groups, questions }
export default questions
