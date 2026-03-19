/* ═══════════════════════════════════════════
WILD LIVES — Species Data
═══════════════════════════════════════════ */

window.SPECIES = [
  {
    id: 'pangolin',
    name: 'Sunda Pangolin',
    scientificName: 'Manis javanica',
    status: 'CR',
    statusLabel: 'Critically Endangered',
    statusClass: 'badge-CR',
    habitat: 'Forests of Southeast Asia',
    threat: 'Pangolins are the world\'s most trafficked mammal. Over one million have been taken from the wild in the past decade.',
    avatar: 'asset/pangolin/pangolin.png',
    accentColor: '#8a6840',
    gameKey: 'pangolin',
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
    </svg>`,
    screens: [
      {
        id: 'select',
        label: 'Discover',
        heading: 'Meet the Sunda Pangolin',
        subheading: 'One of the most elusive and extraordinarily unique mammals on Earth, the Sunda Pangolin calls the forests of Southeast Asia home. Characterized by its armor of keratin scales, it is the only mammal fully covered in them.',
        instruction: "Tap 'Ecosystem' to learn about their vital role in our forests."
      },
      {
        id: 'species',
        label: 'Ecosystem',
        heading: "Nature's Pest Controllers",
        subheading: 'A single pangolin can consume up to 70 million insects a year. By regulating ant and termite populations, they protect vast tracts of forest from destruction and naturally aerate the soil as they dig.',
        instruction: "Their existence is vital, yet they face severe dangers. Tap 'Threats'."
      },
      {
        id: 'threats',
        label: 'Threats',
        heading: 'The Most Trafficked Mammal',
        subheading: 'Driven by illegal wildlife trade, the Sunda Pangolin is hunted relentlessly for its meat and scales. Habitat loss due to rapid deforestation further pushes this remarkable species toward the brink of extinction.',
        instruction: "What happens when pangolins disappear? Tap 'Consequence 1'."
      },
      {
        id: 'impact1',
        label: 'Impact 1',
        heading: 'Insect Population Explosion',
        subheading: 'Without pangolins acting as natural regulators, termite and ant populations surge uncontrollably. This immediate disruption alters the delicate balance of the forest floor ecosystem.',
        instruction: "The chain reaction continues. Tap 'Impact 2'."
      },
      {
        id: 'impact2',
        label: 'Impact 2',
        heading: 'Forest Degradation',
        subheading: "Overpopulated insects consume roots and timber at an alarming rate. Combined with the lack of soil aeration from pangolin foraging, the local flora begins to suffer, weakening the forest's health.",
        instruction: "This leads to severe outcomes. Tap 'Impact 3'."
      },
      {
        id: 'impact3',
        label: 'Impact 3',
        heading: 'Systemic Ecological Collapse',
        subheading: 'As the forest degrades, other animal species lose their habitats and food sources. The removal of a single keystone species like the pangolin can trigger an irreversible collapse of the entire local ecosystem.',
        instruction: "We can still change this narrative. Tap 'Human Role'."
      },
      {
        id: 'human',
        label: 'Human Role',
        heading: 'Our Responsibility & Action',
        subheading: 'We have the power to stop the illegal trade. By supporting conservation efforts, raising awareness, and protecting their natural habitats, we can ensure the Sunda Pangolin thrives for generations to come.',
        instruction: "Join Save Vietnam's Wildlife today. Your voice matters."
      }
    ]
  },
  { id: 'placeholder_1', name: 'Placeholder', scientificName: 'Coming Soon', status: 'TBD', statusLabel: 'Coming Soon', statusClass: '', accentColor: '#888', threat: 'Coming soon.', isPlaceholder: true },
  { id: 'placeholder_2', name: 'Placeholder', scientificName: 'Coming Soon', status: 'TBD', statusLabel: 'Coming Soon', statusClass: '', accentColor: '#888', threat: 'Coming soon.', isPlaceholder: true },
  { id: 'placeholder_3', name: 'Placeholder', scientificName: 'Coming Soon', status: 'TBD', statusLabel: 'Coming Soon', statusClass: '', accentColor: '#888', threat: 'Coming soon.', isPlaceholder: true },
  { id: 'placeholder_4', name: 'Placeholder', scientificName: 'Coming Soon', status: 'TBD', statusLabel: 'Coming Soon', statusClass: '', accentColor: '#888', threat: 'Coming soon.', isPlaceholder: true },
  { id: 'placeholder_5', name: 'Placeholder', scientificName: 'Coming Soon', status: 'TBD', statusLabel: 'Coming Soon', statusClass: '', accentColor: '#888', threat: 'Coming soon.', isPlaceholder: true },
  { id: 'placeholder_6', name: 'Placeholder', scientificName: 'Coming Soon', status: 'TBD', statusLabel: 'Coming Soon', statusClass: '', accentColor: '#888', threat: 'Coming soon.', isPlaceholder: true },
  { id: 'placeholder_7', name: 'Placeholder', scientificName: 'Coming Soon', status: 'TBD', statusLabel: 'Coming Soon', statusClass: '', accentColor: '#888', threat: 'Coming soon.', isPlaceholder: true }
];
