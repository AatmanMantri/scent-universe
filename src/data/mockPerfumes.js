export const mockPerfumes = [
  {
    id: "kanzan-221b",
    name: "221B",
    brand: "House of Kanzan",
    gender: "Unisex",
    topNotes: ["Bergamot", "Lavender", "Pink Pepper"],
    middleNotes: ["Geranium", "Saffron", "Tobacco"],
    baseNotes: ["Patchouli", "Leather", "Oud"],
    description: "Wearing this is like stepping into a dim study of old books and unsolved riddles — warm spices, dry woods, and smoky thoughts. Quiet, deep, and full of mystery.",
    mood: ["Mysterious", "Intellectual", "Smoky"],
    coordinates: [1.2, 0.8, -0.5],
    color: "#4A4036"
  },
  {
    id: "fraganote-persian-oud",
    name: "Persian Oud",
    brand: "Fraganote",
    gender: "Unisex",
    topNotes: ["Saffron", "Raspberry", "Pear"],
    middleNotes: ["Bulgarian Rose", "Orange Blossom"],
    baseNotes: ["Agarwood", "Amber", "Patchouli"],
    description: "Persian Oud borrows its key profile from agarwood, raspberry, and juicy pear. The sensuality of the Bulgarian rose merges with the freshness of orange blossom.",
    mood: ["Royal", "Sophisticated", "Mature"],
    coordinates: [1.5, 0.6, -0.2],
    color: "#6B2D5C"
  },
  {
    id: "kanzan-cafe-neroli",
    name: "Café Neroli",
    brand: "House of Kanzan",
    gender: "Unisex",
    topNotes: ["Neroli", "Lemon", "Coffee"],
    middleNotes: ["Jasmine", "Orange Blossom"],
    baseNotes: ["Vanilla", "Musk"],
    description: "A bright morning at a Parisian café. Crisp citrus meets the dark warmth of roasted coffee.",
    mood: ["Bright", "Warm", "Invigorating"],
    coordinates: [-1.0, 1.2, 0.3],
    color: "#D4A373"
  },
  {
    id: "fraganote-baked-vanilla",
    name: "Baked Vanilla",
    brand: "Fraganote",
    gender: "Women",
    topNotes: ["Vanilla Orchid", "Sugar"],
    middleNotes: ["Tonka Bean", "Caramel"],
    baseNotes: ["Vanilla Absolute", "Musk"],
    description: "Warm, sweet, and comforting like a fresh bakery.",
    mood: ["Sweet", "Cozy", "Gourmand"],
    coordinates: [-1.2, -1.0, 0.8],
    color: "#F3E5AB"
  },
  {
    id: "kanzan-tahiti-waves",
    name: "Tahiti Waves",
    brand: "House of Kanzan",
    gender: "Unisex",
    topNotes: ["Sea Salt", "Coconut", "Bergamot"],
    middleNotes: ["Tiare Flower", "Ylang-Ylang"],
    baseNotes: ["Sandalwood", "Ambergris"],
    description: "Sun-drenched skin and crashing ocean waves.",
    mood: ["Fresh", "Tropical", "Aquatic"],
    coordinates: [-0.8, 1.5, 1.0],
    color: "#48CAE4"
  },
  {
    id: "secret-alchemist-woods",
    name: "Deep Woods",
    brand: "Secret Alchemist",
    gender: "Men",
    topNotes: ["Pine", "Juniper"],
    middleNotes: ["Cedarwood", "Vetiver"],
    baseNotes: ["Oakmoss", "Patchouli"],
    description: "An enchanted forest after the rain.",
    mood: ["Earthy", "Woody", "Grounding"],
    coordinates: [1.8, -0.5, -1.0],
    color: "#2C5F2D"
  },
  {
    id: "arabian-aroma-rose",
    name: "Desert Rose",
    brand: "Arabian Aroma",
    gender: "Women",
    topNotes: ["Taif Rose", "Pink Pepper"],
    middleNotes: ["Damask Rose", "Oud"],
    baseNotes: ["Amber", "Sandalwood"],
    description: "A blooming rose in the vast desert sand.",
    mood: ["Romantic", "Rich", "Floral"],
    coordinates: [1.4, 0.2, 0.5],
    color: "#990011"
  }
];

// Combine all notes for a perfume to create a simple bag-of-words for vector math
export const getPerfumeFeatures = (perfume) => {
  return [...perfume.topNotes, ...perfume.middleNotes, ...perfume.baseNotes].map(n => n.toLowerCase());
};
