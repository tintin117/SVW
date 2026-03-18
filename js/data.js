/* ═══════════════════════════════════════════
   WILD LIVES — Species Data
═══════════════════════════════════════════ */

window.SPECIES = [
  {
    id: 'turtle',
    name: 'Green Sea Turtle',
    scientificName: 'Chelonia mydas',
    status: 'EN',
    statusLabel: 'Endangered',
    statusClass: 'badge-EN',
    population: '~85,000 nesting females',
    habitat: 'Tropical & subtropical oceans worldwide',
    threat: 'Plastic pollution, beachfront lighting, and fishing nets kill tens of thousands each year. Hatchlings mistake artificial lights for moonlight and crawl toward roads instead of the sea.',
    facts: [
      'Sea turtles have navigated Earth\'s oceans for over 100 million years — they outlived the dinosaurs.',
      'Only 1 in 1,000 hatchlings survives to adulthood.',
      'They return to the exact beach where they were born, guided by Earth\'s magnetic field.'
    ],
    conservationMessage: 'Turning off beachfront lights during nesting season costs nothing and saves thousands of hatchlings. Refusing single-use plastic bags is a choice sea turtles cannot make for themselves.',
    gameKey: 'turtle',
    factImages: 0,
    accentColor: '#2a9d8f',
    svgArt: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="58" rx="28" ry="22" fill="#3aaa8f"/>
      <line x1="50" y1="36" x2="50" y2="80" stroke="#1d7a68" stroke-width="1.5" opacity="0.7"/>
      <ellipse cx="50" cy="58" rx="14" ry="11" fill="none" stroke="#1d7a68" stroke-width="1.5" opacity="0.7"/>
      <ellipse cx="50" cy="58" rx="22" ry="17" fill="none" stroke="#1d7a68" stroke-width="1.5" opacity="0.7"/>
      <circle cx="50" cy="30" r="10" fill="#3aaa8f"/>
      <circle cx="46.5" cy="28" r="2" fill="#1a1a1a"/>
      <circle cx="47.2" cy="27.3" r="0.7" fill="rgba(255,255,255,0.6)"/>
      <ellipse cx="25" cy="48" rx="9" ry="5" fill="#2d8a78" transform="rotate(-20 25 48)"/>
      <ellipse cx="75" cy="48" rx="9" ry="5" fill="#2d8a78" transform="rotate(20 75 48)"/>
      <ellipse cx="28" cy="68" rx="8" ry="4.5" fill="#2d8a78" transform="rotate(15 28 68)"/>
      <ellipse cx="72" cy="68" rx="8" ry="4.5" fill="#2d8a78" transform="rotate(-15 72 68)"/>
      <ellipse cx="50" cy="82" rx="4" ry="6" fill="#2d8a78"/>
    </svg>`
  },
  {
    id: 'elephant',
    name: 'African Forest Elephant',
    scientificName: 'Loxodonta cyclotis',
    status: 'CR',
    statusLabel: 'Critically Endangered',
    statusClass: 'badge-CR',
    population: '~100,000',
    habitat: 'Rainforests of Central & West Africa',
    threat: 'Ivory poaching has decimated 62% of the population in just one decade. Wire snares set for bushmeat kill elephants indiscriminately — one snare can disable an entire family.',
    facts: [
      'Forest elephants take 5–7 years between calves, making population recovery agonisingly slow.',
      'They are the "gardeners of the forest" — eating and dispersing seeds for over 96 plant species.',
      'Forest elephants are genetically distinct from savannah elephants, only recognised as a separate species in 2000.'
    ],
    conservationMessage: 'Anti-poaching patrols and snare removal programmes save entire herds. Supporting certified sustainable palm oil and timber also protects the forests elephants call home.',
    gameKey: 'elephant',
    factImages: 0,
    accentColor: '#6b8e6b',
    svgArt: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="55" cy="60" rx="26" ry="18" fill="#7a9a7a"/>
      <circle cx="26" cy="50" r="18" fill="#7a9a7a"/>
      <ellipse cx="18" cy="42" rx="12" ry="16" fill="#8aaa8a" opacity="0.7"/>
      <path d="M14,58 Q8,68 10,76 Q12,80 14,78 Q16,72 14,66 Q16,60 20,56" fill="none" stroke="#7a9a7a" stroke-width="5" stroke-linecap="round"/>
      <circle cx="20" cy="47" r="2.5" fill="#2a2a2a"/>
      <circle cx="19.5" cy="46.5" r="1" fill="rgba(255,255,255,0.5)"/>
      <path d="M14,60 Q9,62 8,65" stroke="#e8ddb8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <rect x="34" y="72" width="9" height="18" rx="3" fill="#6a8a6a"/>
      <rect x="46" y="74" width="9" height="16" rx="3" fill="#6a8a6a"/>
      <rect x="58" y="72" width="9" height="18" rx="3" fill="#6a8a6a"/>
      <rect x="22" y="66" width="8" height="16" rx="3" fill="#6a8a6a"/>
      <path d="M80,56 Q88,58 87,64" stroke="#7a9a7a" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'orangutan',
    name: 'Bornean Orangutan',
    scientificName: 'Pongo pygmaeus',
    status: 'CR',
    statusLabel: 'Critically Endangered',
    statusClass: 'badge-CR',
    population: '~104,700',
    habitat: 'Rainforests of Borneo',
    threat: 'Palm oil and timber deforestation destroys their home at a rate of 125,000 hectares per year. One orangutan needs 6 km² of intact forest to survive.',
    facts: [
      'Orangutans share 97% of their DNA with humans, and use tools such as branches as umbrellas.',
      'Infants stay with their mothers for 7–9 years — the longest childhood of any non-human animal.',
      'Their call, the "long call," can be heard up to 2 km away to communicate with other orangutans.'
    ],
    conservationMessage: 'Check products for certified sustainable palm oil (RSPO label). Borneo has lost 50% of its forest in 60 years — certified supply chains can reverse this trend.',
    gameKey: 'orangutan',
    factImages: 0,
    accentColor: '#c07830',
    svgArt: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="65" rx="18" ry="16" fill="#c07830"/>
      <circle cx="50" cy="40" r="18" fill="#c07830"/>
      <ellipse cx="50" cy="46" rx="13" ry="10" fill="#d4923c" opacity="0.6"/>
      <circle cx="44" cy="37" r="3" fill="#1a0a00"/>
      <circle cx="43.4" cy="36.4" r="1" fill="rgba(255,255,255,0.5)"/>
      <circle cx="56" cy="37" r="3" fill="#1a0a00"/>
      <circle cx="55.4" cy="36.4" r="1" fill="rgba(255,255,255,0.5)"/>
      <path d="M43,46 Q50,51 57,46" stroke="#8a4810" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="38" cy="36" rx="6" ry="8" fill="#c07830" opacity="0.6"/>
      <ellipse cx="62" cy="36" rx="6" ry="8" fill="#c07830" opacity="0.6"/>
      <path d="M32,65 Q14,60 8,70" stroke="#c07830" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M68,65 Q86,60 92,70" stroke="#c07830" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M38,80 Q36,88 34,90" stroke="#c07830" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M62,80 Q64,88 66,90" stroke="#c07830" stroke-width="5" fill="none" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'snow_leopard',
    name: 'Snow Leopard',
    scientificName: 'Panthera uncia',
    status: 'VU',
    statusLabel: 'Vulnerable',
    statusClass: 'badge-VU',
    population: '4,000–6,500',
    habitat: 'Central Asian mountain ranges, 3,000–5,400 m altitude',
    threat: 'Climate change is pushing their prey upward and out of viable range. Herders kill them in retaliation for livestock losses — education programmes are slowly changing this.',
    facts: [
      'Snow leopards are called "ghosts of the mountains" — they are almost never seen by humans.',
      'Their enormous, fur-padded paws act as natural snowshoes and they use their thick tail as a blanket.',
      'Unlike other big cats, snow leopards cannot roar — they make a unique chuffing sound called a "prusten."'
    ],
    conservationMessage: 'Community-based livestock insurance schemes remove the financial incentive to kill snow leopards. Nature tourism provides an alternative livelihood for herders across the mountain ranges.',
    gameKey: 'snow_leopard',
    factImages: 0,
    accentColor: '#8899aa',
    svgArt: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="54" cy="62" rx="28" ry="16" fill="#ccd4d8"/>
      <circle cx="24" cy="50" r="14" fill="#ccd4d8"/>
      <polygon points="18,36 13,24 22,32" fill="#ccd4d8" stroke="#8899aa" stroke-width="1"/>
      <polygon points="28,34 31,22 36,31" fill="#ccd4d8" stroke="#8899aa" stroke-width="1"/>
      <polygon points="19,36 15,28 21,32" fill="#ffd0d0" opacity="0.5"/>
      <ellipse cx="16" cy="53" rx="7" ry="5" fill="#dde4e8"/>
      <circle cx="21" cy="48" r="3" fill="#3a2a1a"/>
      <circle cx="20.5" cy="47.5" r="1" fill="rgba(255,255,255,0.6)"/>
      <ellipse cx="12" cy="52" rx="2" ry="1.5" fill="#c89090"/>
      <path d="M82,60 Q94,50 96,40 Q98,52 90,62 Q88,70 85,76" stroke="#b8c0c4" stroke-width="7" fill="none" stroke-linecap="round"/>
      <circle cx="50" cy="54" r="4" fill="#8899aa" opacity="0.55"/>
      <circle cx="62" cy="56" r="3.5" fill="#8899aa" opacity="0.55"/>
      <circle cx="56" cy="65" r="3.5" fill="#8899aa" opacity="0.55"/>
      <circle cx="68" cy="62" r="3" fill="#8899aa" opacity="0.55"/>
      <circle cx="40" cy="58" r="3" fill="#8899aa" opacity="0.55"/>
      <rect x="32" y="72" width="8" height="16" rx="3" fill="#b8c0c4"/>
      <rect x="44" y="74" width="8" height="14" rx="3" fill="#b8c0c4"/>
      <rect x="60" y="72" width="8" height="16" rx="3" fill="#b8c0c4"/>
      <rect x="72" y="74" width="8" height="14" rx="3" fill="#b8c0c4"/>
    </svg>`
  },
  {
    id: 'whale',
    name: 'Blue Whale',
    scientificName: 'Balaenoptera musculus',
    status: 'EN',
    statusLabel: 'Endangered',
    statusClass: 'badge-EN',
    population: '10,000–25,000',
    habitat: 'All oceans worldwide',
    threat: 'Ship strikes are the leading cause of adult blue whale deaths. Ocean noise from shipping has cut their communication range by 90% since 1950, isolating individuals across vast ocean distances.',
    facts: [
      'The blue whale is the largest animal ever known to have lived — up to 33 m long and 200 tonnes.',
      'Their heartbeat can be heard from 3 km away and their calls reach 188 decibels — louder than a jet engine.',
      'Despite being the largest animal, they eat almost exclusively krill — consuming up to 40 million of them a day.'
    ],
    conservationMessage: 'Slower ship speeds and adjusted shipping lanes dramatically reduce strike risk. The International Whaling Commission\'s 1986 moratorium saved blue whales from extinction — continued protection is keeping them here.',
    gameKey: 'whale',
    factImages: 0,
    accentColor: '#2060a0',
    svgArt: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M8,50 Q12,36 30,38 Q50,36 72,40 Q88,42 92,50 Q88,60 72,62 Q50,66 28,62 Q12,62 8,50 Z" fill="#2c78c8"/>
      <path d="M8,50 Q12,44 30,44 Q50,42 72,44 Q88,46 92,50" fill="#3890e0" opacity="0.4"/>
      <path d="M88,44 Q96,38 98,32 Q96,38 100,36 Q97,42 98,48" stroke="#2060a0" stroke-width="5" fill="none" stroke-linecap="round"/>
      <ellipse cx="26" cy="48" rx="6" ry="10" fill="#1a60b0" transform="rotate(-20 26 48)"/>
      <path d="M8,50 Q4,45 2,40 Q4,46 2,52 Q4,58 8,50" fill="#2060a0"/>
      <circle cx="30" cy="46" r="3" fill="#0a1a2a"/>
      <circle cx="29.5" cy="45.5" r="1" fill="rgba(255,255,255,0.5)"/>
    </svg>`
  },
  {
    id: 'pangolin',
    name: 'Sunda Pangolin',
    scientificName: 'Manis javanica',
    status: 'CR',
    statusLabel: 'Critically Endangered',
    statusClass: 'badge-CR',
    population: 'Unknown — likely < 10,000',
    habitat: 'Forests of Southeast Asia',
    threat: 'Pangolins are the world\'s most trafficked mammal. Over one million have been taken from the wild in the past decade for scales used in traditional medicine and meat considered a delicacy.',
    facts: [
      'Their only defence is curling into a ball — which tragically makes them easy for poachers to simply pick up.',
      'A pangolin\'s sticky tongue can be longer than its entire body and can eat 70 million insects per year.',
      'They have no teeth — they swallow small stones to grind up food in their muscular stomach.'
    ],
    conservationMessage: 'Pangolin scales have no proven medicinal value. Raising awareness about this in consumer countries reduces demand. Reporting wildlife trafficking tips to authorities saves lives.',
    gameKey: 'pangolin',
    factImages: 2,
    avatar: 'asset/pangolin/pangolin.png',
    accentColor: '#8a6840',
    svgArt: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="38" fill="#a8845c"/>
      <path d="M50,50 L88,50 A38,38 0 0,1 86,62" fill="#8a6840" stroke="#6b5030" stroke-width="0.8"/>
      <path d="M50,50 L86,62 A38,38 0 0,1 78,76" fill="#a8845c" stroke="#6b5030" stroke-width="0.8"/>
      <path d="M50,50 L78,76 A38,38 0 0,1 64,86" fill="#8a6840" stroke="#6b5030" stroke-width="0.8"/>
      <path d="M50,50 L64,86 A38,38 0 0,1 50,88" fill="#a8845c" stroke="#6b5030" stroke-width="0.8"/>
      <path d="M50,50 L50,88 A38,38 0 0,1 36,86" fill="#8a6840" stroke="#6b5030" stroke-width="0.8"/>
      <path d="M50,50 L36,86 A38,38 0 0,1 22,76" fill="#a8845c" stroke="#6b5030" stroke-width="0.8"/>
      <path d="M50,50 L22,76 A38,38 0 0,1 14,62" fill="#8a6840" stroke="#6b5030" stroke-width="0.8"/>
      <path d="M50,50 L14,62 A38,38 0 0,1 12,50" fill="#a8845c" stroke="#6b5030" stroke-width="0.8"/>
      <path d="M50,50 L12,50 A38,38 0 0,1 14,38" fill="#8a6840" stroke="#6b5030" stroke-width="0.8"/>
      <path d="M50,50 L14,38 A38,38 0 0,1 22,24" fill="#a8845c" stroke="#6b5030" stroke-width="0.8"/>
      <path d="M50,50 L22,24 A38,38 0 0,1 36,14" fill="#8a6840" stroke="#6b5030" stroke-width="0.8"/>
      <path d="M50,50 L36,14 A38,38 0 0,1 50,12" fill="#a8845c" stroke="#6b5030" stroke-width="0.8"/>
      <path d="M50,50 L50,12 A38,38 0 0,1 64,14" fill="#8a6840" stroke="#6b5030" stroke-width="0.8"/>
      <path d="M50,50 L64,14 A38,38 0 0,1 78,24" fill="#a8845c" stroke="#6b5030" stroke-width="0.8"/>
      <path d="M50,50 L78,24 A38,38 0 0,1 86,38" fill="#8a6840" stroke="#6b5030" stroke-width="0.8"/>
      <path d="M50,50 L86,38 A38,38 0 0,1 88,50" fill="#a8845c" stroke="#6b5030" stroke-width="0.8"/>
      <circle cx="64" cy="42" r="4.5" fill="#2a1800"/>
      <circle cx="65" cy="41" r="1.8" fill="rgba(255,255,255,0.4)"/>
    </svg>`
  },
  {
    id: 'rhino',
    name: 'Black Rhinoceros',
    scientificName: 'Diceros bicornis',
    status: 'CR',
    statusLabel: 'Critically Endangered',
    statusClass: 'badge-CR',
    population: '~6,195',
    habitat: 'Sub-Saharan Africa',
    threat: 'Horn poaching nearly caused total extinction. In 1970 there were 65,000 black rhinos. By 1993, poaching had reduced the population to just 2,300.',
    facts: [
      'Rhino horn is made of keratin — the same material as your fingernails. It has no proven medicinal value.',
      'Black rhinos are browsers, not grazers — they use their hooked lip to strip leaves from trees and shrubs.',
      'Rangers have brought the population from 2,300 back to over 6,000 — proof that conservation works.'
    ],
    conservationMessage: 'Decades of dedicated ranger work have tripled the black rhino population from its historic low. Community-based conservation means local people benefit from living rhinos — making them worth more alive than dead.',
    gameKey: 'rhino',
    factImages: 0,
    accentColor: '#7a6858',
    svgArt: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="52" cy="60" rx="30" ry="20" fill="#8a7a68"/>
      <ellipse cx="22" cy="55" rx="18" ry="16" fill="#8a7a68"/>
      <path d="M10,52 Q6,46 8,43" stroke="#c8b898" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M12,55 Q7,50 9,46" stroke="#a09078" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="30" cy="48" rx="5" ry="7" fill="#9a8a78" transform="rotate(-10 30 48)"/>
      <circle cx="17" cy="53" r="2.5" fill="#2a2010"/>
      <circle cx="16.5" cy="52.5" r="0.9" fill="rgba(255,255,255,0.5)"/>
      <rect x="34" y="74" width="11" height="18" rx="4" fill="#7a6a58"/>
      <rect x="48" y="76" width="11" height="16" rx="4" fill="#7a6a58"/>
      <rect x="62" y="74" width="10" height="18" rx="4" fill="#7a6a58"/>
      <rect x="22" y="68" width="9" height="14" rx="4" fill="#7a6a58"/>
      <path d="M82,56 Q88,52 86,58 Q84,63 82,64" stroke="#8a7a68" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'axolotl',
    name: 'Axolotl',
    scientificName: 'Ambystoma mexicanum',
    status: 'CR',
    statusLabel: 'Critically Endangered',
    statusClass: 'badge-CR',
    population: 'Possibly < 1,000 in the wild',
    habitat: 'Lake Xochimilco, Mexico City',
    threat: 'Urban expansion, water pollution, and invasive fish have nearly wiped out the last wild axolotl population. They now survive in a single, heavily degraded lake canal system.',
    facts: [
      'Axolotls can regenerate lost limbs, eyes, parts of their hearts and brains — faster than any other vertebrate.',
      'Unlike most amphibians, they remain in their larval form their entire lives — a trait called neoteny.',
      'They are only found in one lake system in the entire world, making them the world\'s most geographically restricted salamander.'
    ],
    conservationMessage: 'Captive breeding programmes and lake restoration projects are racing against time. Filtering and cleaning the canals of Xochimilco is essential for any wild population to survive. Axolotls have survived 10,000 years in that one lake — they deserve more time.',
    gameKey: 'axolotl',
    factImages: 0,
    accentColor: '#c05080',
    svgArt: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M78,60 Q94,56 96,62 Q94,68 78,62" fill="#e890b0"/>
      <ellipse cx="48" cy="64" rx="28" ry="16" fill="#f4a8c0"/>
      <circle cx="34" cy="52" r="17" fill="#f4a8c0"/>
      <ellipse cx="34" cy="58" rx="12" ry="8" fill="#f8c0d0" opacity="0.5"/>
      <path d="M46,44 Q54,33 52,26" stroke="#d06888" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M50,42 Q60,34 60,26" stroke="#d06888" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M54,44 Q64,36 66,28" stroke="#d06888" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M22,44 Q14,33 16,26" stroke="#d06888" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M18,42 Q8,34 8,26" stroke="#d06888" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M14,44 Q4,36 2,28" stroke="#d06888" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="29" cy="49" r="3.5" fill="#2a1010"/>
      <circle cx="28.4" cy="48.4" r="1.2" fill="rgba(255,255,255,0.7)"/>
      <path d="M26,60 Q34,65 42,60" stroke="#d06070" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M26,72 Q22,80 18,84" stroke="#f4a8c0" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M50,76 Q52,83 50,88" stroke="#f4a8c0" stroke-width="5" fill="none" stroke-linecap="round"/>
    </svg>`
  }
];
