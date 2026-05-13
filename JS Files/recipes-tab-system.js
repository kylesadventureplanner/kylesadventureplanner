(function () {
  var STORAGE_KEY = 'kapRecipesV2';
  var LEGACY_STORAGE_KEY = 'kapRecipesV1';
  var PANTRY_STORAGE_KEY = 'kapRecipesPantrySpicesV1';
  var ROOT_ID = 'recipesRoot';
  var EXCEL_WORKBOOK_CANDIDATES = ['recipes.xlsx', 'recipes.xlsm', 'recipes'];
  var EXCEL_TABLE_NAME = 'recipes';
  var AUTO_SYNC_COOLDOWN_MS = 45000;

  var METHOD_OPTIONS = ['Oven', 'Air Fryer', 'Skillet', 'Sous Vide', 'Instant Pot', 'Grill', 'Smoker', 'Slow Cooker', 'Stovetop', 'No Cook'];
  var PROTEIN_OPTIONS = ['Chicken', 'Beef', 'Pork', 'Seafood', 'Turkey', 'Tofu', 'Beans', 'Eggs', 'Vegetarian'];
  var CUISINE_OPTIONS = ['Mexican', 'Italian', 'Chinese', 'Japanese', 'Indian', 'Thai', 'Mediterranean', 'American', 'Korean'];
  var COURSE_CATEGORY_OPTIONS = ['appetizer', 'entree', 'side_dish', 'dessert'];
  var HEALTHINESS_OPTIONS = ['more_healthy', 'neutral', 'less_healthy'];
  var DEFAULT_PANTRY_SPICES = [
    'italian seasoning', 'onion powder', 'minced onion', 'garlic powder', 'minced garlic', 'parsley', 'oregano', 'rosemary', 'chives', 'cilantro', 'bay leaves', 'crushed red pepper', 'cayenne pepper', 'paprika', 'pepper', 'salt', 'seasoned salt', 'himalayan sea salt', 'tumeric', 'nutmeg', 'coriander', 'thyme', 'cloves', 'curry powder', 'chili powder', 'lemon pepper', 'burger seasoning', 'taco seasoning', 'fajita seasoning', 'ground cinnamon', 'cinnamon sticks', 'cinnamon sugar', 'cajun seasoning', 'creole seasoning', 'seafood boil seasoning packet', 'seafood boil seasoning liquid'
  ];
  var RECOMMENDED_EXTRA_SPICES = [
    'cumin', 'smoked paprika', 'mustard powder', 'ginger powder', 'allspice', 'cardamom', 'dill weed', 'sage', 'white pepper', 'old bay seasoning'
  ];
  var INGREDIENT_SUBSTITUTIONS = {
    'olive oil': ['Avocado oil', 'Canola oil', 'Melted butter'],
    'butter': ['Olive oil', 'Ghee', 'Coconut oil'],
    'ground beef': ['Ground turkey', 'Ground chicken', 'Lentils'],
    'ground turkey': ['Ground chicken', 'Lean ground beef', 'Crumbled tofu'],
    'chicken thighs': ['Chicken breast', 'Turkey thighs', 'Tofu'],
    'chicken breast': ['Chicken thighs', 'Turkey breast', 'Firm tofu'],
    'heavy cream': ['Half-and-half', 'Coconut milk', 'Greek yogurt'],
    'sour cream': ['Greek yogurt', 'Creme fraiche', 'Cottage cheese'],
    'milk': ['Oat milk', 'Almond milk', 'Soy milk'],
    'flour': ['Whole wheat flour', 'Almond flour', 'Gluten-free flour blend'],
    'corn tortillas': ['Flour tortillas', 'Lettuce wraps', 'Cabbage leaves'],
    'rice': ['Quinoa', 'Cauliflower rice', 'Farro'],
    'pasta': ['Whole wheat pasta', 'Chickpea pasta', 'Zucchini noodles'],
    'egg': ['Flax egg', 'Chia egg', 'Unsweetened applesauce'],
    'eggs': ['Flax eggs', 'Chia eggs', 'Silken tofu']
  };
  var SAFE_COOK_TEMPERATURES = {
    chicken: { label: 'Chicken', tempF: 165, tempC: 74, note: 'Cook to minimum internal temperature.' },
    'steak_rare': { label: 'Steak - Rare', tempF: 145, tempC: 63, note: 'USDA safe endpoint for intact beef cuts.', culinaryTempF: 125, culinaryTempC: 52, culinaryNote: 'Culinary target for rare doneness; rest before serving.' },
    'steak_medium_rare': { label: 'Steak - Medium Rare', tempF: 145, tempC: 63, note: 'USDA safe endpoint for intact beef cuts.', culinaryTempF: 130, culinaryTempC: 54, culinaryNote: 'Popular culinary target for tenderness and juiciness.' },
    'steak_medium': { label: 'Steak - Medium', tempF: 145, tempC: 63, note: 'USDA safe endpoint for intact beef cuts.', culinaryTempF: 140, culinaryTempC: 60, culinaryNote: 'Balanced doneness with slight pink center.' },
    'steak_medium_well': { label: 'Steak - Medium Well', tempF: 145, tempC: 63, note: 'USDA safe endpoint for intact beef cuts.', culinaryTempF: 150, culinaryTempC: 66, culinaryNote: 'Mostly brown center with less moisture.' },
    'steak_well_done': { label: 'Steak - Well Done', tempF: 160, tempC: 71, note: 'Fully cooked through.' },
    'ground_beef': { label: 'Ground Beef', tempF: 160, tempC: 71, note: 'Ground meats should reach full safe temp.' },
    'ground_turkey': { label: 'Ground Turkey', tempF: 165, tempC: 74, note: 'Cook thoroughly to safe internal temp.' },
    'pork_roast': { label: 'Pork Roast', tempF: 145, tempC: 63, note: 'Rest for at least 3 minutes after cooking.' },
    'beef_roast': { label: 'Beef Roast', tempF: 145, tempC: 63, note: 'Rest before slicing.' },
    'pork_ribs': { label: 'Pork Ribs', tempF: 195, tempC: 91, note: 'Higher finishing temp improves tenderness.' },
    'beef_ribs': { label: 'Beef Ribs', tempF: 200, tempC: 93, note: 'Low and slow to tender finish.' },
    salmon: { label: 'Salmon', tempF: 145, tempC: 63, note: 'Cook until opaque and flakes easily.' },
    catfish: { label: 'Catfish', tempF: 145, tempC: 63, note: 'Fish should be opaque and flaky.' },
    tilapia: { label: 'Tilapia', tempF: 145, tempC: 63, note: 'Fish should be opaque and flaky.' },
    'cod_fish': { label: 'Cod Fish', tempF: 145, tempC: 63, note: 'Fish should be opaque and flaky.' },
    lobster: { label: 'Lobster', tempF: 145, tempC: 63, note: 'Meat should be opaque and firm.' },
    'king_crab': { label: 'King Crab', tempF: 145, tempC: 63, note: 'Heat through to safe serving temp.' },
    'snow_crab': { label: 'Snow Crab', tempF: 145, tempC: 63, note: 'Heat through to safe serving temp.' },
    shrimp: { label: 'Shrimp', tempF: 145, tempC: 63, note: 'Cook until pink and opaque.' },
    'fried_egg': { label: 'Fried Egg', tempF: 160, tempC: 71, note: 'Cook until yolk and white are firm for strict safety.', culinaryTempF: 145, culinaryTempC: 63, culinaryNote: 'Culinary soft-yolk target; use pasteurized eggs if preferred.' },
    'poached_egg': { label: 'Poached Egg', tempF: 160, tempC: 71, note: 'Cook until white and yolk are firm for strict safety.', culinaryTempF: 145, culinaryTempC: 63, culinaryNote: 'Classic poached texture target.' },
    'over_medium_egg': { label: 'Over Medium Egg', tempF: 160, tempC: 71, note: 'Cook until yolk is thickened and white is set.', culinaryTempF: 150, culinaryTempC: 66, culinaryNote: 'Culinary target for jammy center.' },
    'over_easy_egg': { label: 'Over Easy Egg', tempF: 160, tempC: 71, note: 'For strict safety, cook until yolk and white are firm.', culinaryTempF: 145, culinaryTempC: 63, culinaryNote: 'Culinary target for runny yolk.' }
  };
  var COMMON_STEAK_DONENESS = ['rare', 'medium_rare', 'medium', 'medium_well', 'well_done'];
  var COMMON_COOK_TIMES = {
    baked_potato: {
      label: 'Baked Potato',
      methods: {
        air_fry: { time: '35-45 min', tempF: 400, note: 'Turn once halfway.' },
        conventional_bake: { time: '50-70 min', tempF: 425, note: 'Pierce skin before baking.' },
        grill: { time: '45-60 min', tempF: 400, note: 'Wrap in foil for softer skin.' }
      }
    },
    baked_red_potatoes: {
      label: 'Baked Red Potatoes',
      methods: {
        air_fry: { time: '18-24 min', tempF: 390, note: 'Halved or quartered pieces cook faster.' },
        conventional_bake: { time: '30-40 min', tempF: 425, note: 'Roast until fork-tender.' }
      }
    },
    corn_on_the_cob: {
      label: 'Corn on the Cob',
      methods: {
        grill: { time: '10-15 min', tempF: 400, note: 'Rotate every few minutes.' },
        boil: { time: '5-8 min', note: 'Boil just until bright yellow and tender.' }
      }
    },
    asparagus: {
      label: 'Asparagus',
      methods: {
        air_fry: { time: '7-10 min', tempF: 390, note: 'Shake basket once.' },
        conventional_bake: { time: '10-15 min', tempF: 425, note: 'Best for medium-thick spears.' },
        grill: { time: '6-10 min', tempF: 400, note: 'Use crosswise grill basket if needed.' }
      }
    },
    zucchini: {
      label: 'Zucchini',
      methods: {
        skillet: { time: '6-10 min', note: 'Saute over medium-high heat.' },
        grill: { time: '6-9 min', tempF: 400, note: 'Flip once after char marks appear.' },
        air_fry: { time: '8-12 min', tempF: 390, note: 'Toss pieces at midpoint.' },
        conventional_bake: { time: '12-18 min', tempF: 425, note: 'Roast until edges brown.' }
      }
    },
    onion: {
      label: 'Onion',
      methods: {
        skillet: { time: '8-15 min', note: 'Caramelizing takes longer on lower heat.' },
        grill: { time: '10-15 min', tempF: 400, note: 'Use thick slices or wedges.' }
      }
    },
    chicken_fajita: {
      label: 'Chicken Fajita',
      methods: {
        skillet: { time: '8-12 min', note: 'Thin strips cook quickly.' },
        grill: { time: '10-14 min', tempF: 425, note: 'Cook to 165F internal.' }
      }
    },
    steak_fajita: {
      label: 'Steak Fajita',
      methods: {
        skillet: { time: '6-10 min', note: 'Adjust by strip thickness and target doneness.' },
        grill: { time: '6-10 min', tempF: 450, note: 'High heat for quick sear.' }
      }
    },
    hamburger: {
      label: 'Hamburger',
      methods: {
        grill: { time: '8-12 min', tempF: 450, note: 'Cook to 160F internal for ground beef safety.' }
      }
    },
    ground_beef: {
      label: 'Ground Beef',
      methods: {
        skillet: { time: '7-12 min', note: 'Break up as it browns; cook to 160F.' }
      }
    },
    lasagna: {
      label: 'Lasagna',
      methods: {
        conventional_bake: { time: '45-60 min', tempF: 375, note: 'Covered first half, uncover to brown top.' },
        air_fry: { time: '25-35 min', tempF: 350, note: 'Use a pan that fits basket.' }
      }
    },
    sirloin_steak: {
      label: 'Sirloin Steak',
      methods: {
        skillet: { donenessTimes: { rare: '3-4 min/side', medium_rare: '4-5 min/side', medium: '5-6 min/side', medium_well: '6-7 min/side', well_done: '7-8 min/side' }, note: 'Times for ~1 inch thickness.' },
        grill: { donenessTimes: { rare: '3-4 min/side', medium_rare: '4-5 min/side', medium: '5-6 min/side', medium_well: '6-7 min/side', well_done: '7-8 min/side' }, tempF: 450, note: 'Times for ~1 inch thickness.' }
      }
    },
    ribeye_steak: {
      label: 'Ribeye Steak',
      methods: {
        skillet: { donenessTimes: { rare: '3-4 min/side', medium_rare: '4-5 min/side', medium: '5-6 min/side', medium_well: '6-7 min/side', well_done: '7-8 min/side' }, note: 'Render fat cap first when possible.' },
        grill: { donenessTimes: { rare: '3-4 min/side', medium_rare: '4-5 min/side', medium: '5-6 min/side', medium_well: '6-7 min/side', well_done: '7-8 min/side' }, tempF: 450, note: 'Render fat for best flavor.' }
      }
    },
    porterhouse_steak: {
      label: 'Porterhouse Steak',
      methods: {
        skillet: { donenessTimes: { rare: '4-5 min/side', medium_rare: '5-6 min/side', medium: '6-7 min/side', medium_well: '7-8 min/side', well_done: '8-9 min/side' }, note: 'Thicker cut; finish in oven if needed.' },
        grill: { donenessTimes: { rare: '4-5 min/side', medium_rare: '5-6 min/side', medium: '6-7 min/side', medium_well: '7-8 min/side', well_done: '8-9 min/side' }, tempF: 450, note: 'Thicker cut with two muscle zones.' }
      }
    },
    t_bone_steak: {
      label: 'T-Bone Steak',
      methods: {
        skillet: { donenessTimes: { rare: '4-5 min/side', medium_rare: '5-6 min/side', medium: '6-7 min/side', medium_well: '7-8 min/side', well_done: '8-9 min/side' }, note: 'Thicker cut; monitor both sides of bone.' },
        grill: { donenessTimes: { rare: '4-5 min/side', medium_rare: '5-6 min/side', medium: '6-7 min/side', medium_well: '7-8 min/side', well_done: '8-9 min/side' }, tempF: 450, note: 'Thicker cut; rotate to avoid flareups.' }
      }
    },
    skirt_steak: {
      label: 'Skirt Steak',
      methods: {
        skillet: { donenessTimes: { rare: '2-3 min/side', medium_rare: '3-4 min/side', medium: '4-5 min/side', medium_well: '5-6 min/side', well_done: '6-7 min/side' }, note: 'Thin cut; avoid overcooking.' },
        grill: { donenessTimes: { rare: '2-3 min/side', medium_rare: '3-4 min/side', medium: '4-5 min/side', medium_well: '5-6 min/side', well_done: '6-7 min/side' }, tempF: 500, note: 'High heat, quick sear.' }
      }
    },
    cubed_steak_stew_meat: {
      label: 'Cubed Steak / Stew Meat',
      methods: {
        skillet: { donenessTimes: { rare: '3-4 min/side', medium_rare: '4-5 min/side', medium: '5-6 min/side', medium_well: '6-7 min/side', well_done: '7-8 min/side' }, note: 'Tenderize and avoid overcrowding pan.' },
        grill: { donenessTimes: { rare: '3-4 min/side', medium_rare: '4-5 min/side', medium: '5-6 min/side', medium_well: '6-7 min/side', well_done: '7-8 min/side' }, tempF: 450, note: 'Use skewers or grill basket for cubes.' }
      }
    },
    beef_roast: {
      label: 'Beef Roast',
      methods: {
        skillet: { time: '15-25 min', note: 'For sliced/pan-roast portions; full roasts need oven time.' },
        grill: { time: '45-90 min', tempF: 350, note: 'Indirect heat for larger cuts.' }
      }
    },
    chicken_breast: {
      label: 'Chicken Breast',
      methods: {
        skillet: { time: '10-14 min', note: 'Cook to 165F internal.' },
        grill: { time: '10-14 min', tempF: 425, note: 'Close lid for even cooking.' },
        air_fryer: { time: '14-18 min', tempF: 375, note: 'Flip once at midpoint.' },
        instant_pot: { time: '8-12 min', note: 'High pressure, natural release 5 min.' },
        conventional_bake: { time: '20-30 min', tempF: 400, note: 'Depends on thickness.' },
        convection_bake: { time: '18-25 min', tempF: 375, note: 'Convection cooks faster than conventional.' }
      }
    },
    chicken_thighs_drumsticks: {
      label: 'Chicken Thighs / Drumsticks',
      methods: {
        skillet: { time: '20-30 min', note: 'Bone-in pieces take longer.' },
        grill: { time: '25-35 min', tempF: 400, note: 'Turn frequently to avoid charring.' },
        air_fryer: { time: '22-30 min', tempF: 380, note: 'Shake/turn at midpoint.' },
        instant_pot: { time: '12-18 min', note: 'High pressure; rest before opening.' },
        conventional_bake: { time: '35-45 min', tempF: 400, note: 'Cook to 175F for darker meat tenderness.' },
        convection_bake: { time: '30-40 min', tempF: 375, note: 'Cook to target internal temp.' }
      }
    },
    pork_ribs: {
      label: 'Pork Ribs',
      methods: {
        grill: { time: '90-150 min', tempF: 275, note: 'Low-and-slow indirect heat.' },
        air_fryer: { time: '35-50 min', tempF: 350, note: 'Cut racks to fit basket.' },
        instant_pot: { time: '25-35 min', note: 'Finish with broil or grill for bark.' },
        conventional_bake: { time: '2.5-3.5 hr', tempF: 300, note: 'Wrap to retain moisture.' },
        convection_bake: { time: '2-3 hr', tempF: 285, note: 'Check tenderness, not just time.' }
      }
    },
    beef_ribs: {
      label: 'Beef Ribs',
      methods: {
        grill: { time: '3-5 hr', tempF: 275, note: 'Low-and-slow for tenderness.' },
        air_fryer: { time: '45-70 min', tempF: 350, note: 'Best for smaller cuts.' },
        instant_pot: { time: '35-45 min', note: 'Finish with dry heat for crust.' },
        conventional_bake: { time: '3-4 hr', tempF: 300, note: 'Covered first, uncovered to finish.' },
        convection_bake: { time: '2.5-3.5 hr', tempF: 285, note: 'Monitor tenderness.' }
      }
    },
    salmon: {
      label: 'Salmon',
      methods: {
        grill: { time: '8-12 min', tempF: 400, note: 'Skin side down first.' },
        air_fryer: { time: '8-12 min', tempF: 390, note: 'Depends on fillet thickness.' },
        conventional_bake: { time: '12-18 min', tempF: 400, note: 'Cook until flakes.' },
        convection_bake: { time: '10-16 min', tempF: 375, note: 'Convection shortens cook time.' }
      }
    },
    catfish: {
      label: 'Catfish',
      methods: {
        grill: { time: '8-12 min', tempF: 400, note: 'Use oiled grate or fish basket.' },
        air_fryer: { time: '9-13 min', tempF: 390, note: 'Breaded fillets may need extra time.' },
        conventional_bake: { time: '15-20 min', tempF: 400, note: 'Bake until opaque.' },
        convection_bake: { time: '12-18 min', tempF: 375, note: 'Check center for doneness.' }
      }
    },
    cod_fish: {
      label: 'Cod Fish',
      methods: {
        grill: { time: '8-12 min', tempF: 400, note: 'Use foil/basket for delicate fillets.' },
        air_fryer: { time: '8-12 min', tempF: 390, note: 'Avoid overcrowding basket.' },
        conventional_bake: { time: '12-18 min', tempF: 400, note: 'Cook until flaky.' },
        convection_bake: { time: '10-16 min', tempF: 375, note: 'Check thickest section.' }
      }
    },
    tilapia_fish: {
      label: 'Tilapia Fish',
      methods: {
        grill: { time: '6-10 min', tempF: 400, note: 'Thin fillets cook quickly.' },
        air_fryer: { time: '7-11 min', tempF: 390, note: 'Flip once for even browning.' },
        conventional_bake: { time: '10-15 min', tempF: 400, note: 'Do not overcook.' },
        convection_bake: { time: '8-13 min', tempF: 375, note: 'Short cook due to airflow.' }
      }
    },
    scallops: {
      label: 'Scallops',
      methods: {
        skillet: { time: '4-6 min', note: 'Sear 2-3 min per side on high heat.' },
        air_fryer: { time: '6-9 min', tempF: 390, note: 'Pat dry before cooking.' }
      }
    }
  };

  var EXCEL_COLUMNS = {
    recipeName: 'recipe name',
    style: 'style',
    prepTime: 'prep time',
    cookTime: 'cook time',
    cookMethod: 'cook method',
    proteins: 'proteins',
    spices: 'spices',
    sauces: 'sauces',
    cannedItems: 'canned items',
    produce: 'produce',
    pasta: 'pasta',
    rice: 'rice',
    frozenItems: 'frozen items',
    preparationSteps: 'preparation steps',
    courseCategory: 'course_category',
    healthiness: 'healthiness',
    variationsJson: 'variations_json',
    // Recommended columns for full fidelity if user adds them.
    recipeId: 'recipe_id',
    description: 'description',
    photosJson: 'photo_urls_json',
    notesJson: 'notes_json',
    sourceUrl: 'source_url',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  };
  var REQUIRED_EXCEL_COLUMNS = [
    EXCEL_COLUMNS.recipeName,
    EXCEL_COLUMNS.style,
    EXCEL_COLUMNS.prepTime,
    EXCEL_COLUMNS.cookTime,
    EXCEL_COLUMNS.cookMethod,
    EXCEL_COLUMNS.proteins,
    EXCEL_COLUMNS.spices,
    EXCEL_COLUMNS.sauces,
    EXCEL_COLUMNS.cannedItems,
    EXCEL_COLUMNS.produce,
    EXCEL_COLUMNS.pasta,
    EXCEL_COLUMNS.rice,
    EXCEL_COLUMNS.frozenItems,
    EXCEL_COLUMNS.preparationSteps
  ];
  var RECOMMENDED_EXCEL_COLUMNS = [
    EXCEL_COLUMNS.recipeId,
    EXCEL_COLUMNS.description,
    EXCEL_COLUMNS.photosJson,
    EXCEL_COLUMNS.notesJson,
    EXCEL_COLUMNS.sourceUrl,
    EXCEL_COLUMNS.courseCategory,
    EXCEL_COLUMNS.healthiness,
    EXCEL_COLUMNS.variationsJson,
    EXCEL_COLUMNS.createdAt,
    EXCEL_COLUMNS.updatedAt
  ];

  var SEED_RECIPES = [
    {
      id: 'seed-sheet-pan-chicken',
      title: 'Sheet Pan Lemon Chicken',
      description: 'Quick weeknight dinner with vegetables.',
      proteins: ['Chicken'],
      cuisines: ['American'],
      methods: ['Oven'],
      prepMinutes: 15,
      cookMinutes: 30,
      ingredients: [
        { quantity: '1.5 lb', item: 'Chicken thighs' },
        { quantity: '2 tbsp', item: 'Olive oil' },
        { quantity: '1', item: 'Lemon' }
      ],
      steps: ['Preheat oven to 425F.', 'Toss chicken and vegetables with oil and seasoning.', 'Roast until chicken reaches 165F.'],
      photos: [],
      notes: []
    },
    {
      id: 'seed-skillet-tacos',
      title: 'Skillet Beef Tacos',
      description: 'Fast taco filling for busy nights.',
      proteins: ['Beef'],
      cuisines: ['Mexican'],
      methods: ['Skillet'],
      prepMinutes: 10,
      cookMinutes: 14,
      ingredients: [
        { quantity: '1 lb', item: 'Ground beef' },
        { quantity: '2 tbsp', item: 'Taco seasoning' },
        { quantity: '8', item: 'Corn tortillas' }
      ],
      steps: ['Brown beef in a skillet.', 'Add seasoning and water, then simmer.', 'Warm tortillas and serve with toppings.'],
      photos: [],
      notes: []
    }
  ];

  var state = {
    initialized: false,
    recipes: [],
    filters: {
      proteins: [],
      cuisines: [],
      methods: [],
      searchQuery: '',
      sortBy: 'updated_desc',
      prepMax: '',
      cookMax: '',
      courseCategory: '',
      healthiness: ''
    },
    activeRecipeId: '',
    editingRecipeId: '',
    editorPhotos: [],
    editorTags: {
      proteins: [],
      cuisines: [],
      methods: []
    },
    pantrySpices: [],
    safeTempStrictMode: true,
    excel: {
      workbookPath: '',
      lastSyncAt: 0,
      lastAutoSyncAt: 0,
      lastError: '',
      schemaColumnNames: []
    }
  };

  function safeText(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
    });
  }

  function uid(prefix) {
    return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }

  function asArray(value) {
    if (Array.isArray(value)) return value.map(function (item) { return String(item || '').trim(); }).filter(Boolean);
    if (typeof value === 'string') return value.split(/[;,]/).map(function (item) { return item.trim(); }).filter(Boolean);
    return [];
  }

  function normalizeCourseCategory(value) {
    var key = String(value || '').trim().toLowerCase().replace(/[^a-z]+/g, '_').replace(/^_+|_+$/g, '');
    if (key === 'side' || key === 'side_dishes' || key === 'sidedish') key = 'side_dish';
    if (key === 'desert') key = 'dessert';
    return COURSE_CATEGORY_OPTIONS.indexOf(key) >= 0 ? key : '';
  }

  function normalizeHealthiness(value) {
    var key = String(value || '').trim().toLowerCase().replace(/[^a-z]+/g, '_').replace(/^_+|_+$/g, '');
    if (key === 'healthy' || key === 'morehealth' || key === 'more') key = 'more_healthy';
    if (key === 'less' || key === 'unhealthy') key = 'less_healthy';
    return HEALTHINESS_OPTIONS.indexOf(key) >= 0 ? key : '';
  }

  function displayCourseCategory(value) {
    var key = normalizeCourseCategory(value);
    if (key === 'side_dish') return 'Side dish';
    if (key === 'appetizer') return 'Appetizer';
    if (key === 'entree') return 'Entree';
    if (key === 'dessert') return 'Dessert';
    return 'Not set';
  }

  function displayHealthiness(value) {
    var key = normalizeHealthiness(value);
    if (key === 'more_healthy') return 'More healthy';
    if (key === 'less_healthy') return 'Less healthy';
    if (key === 'neutral') return 'Neutral';
    return 'Not set';
  }

  function normalizeToken(value) {
    return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function normalizeSpiceName(value) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  function displaySpiceName(value) {
    var text = normalizeSpiceName(value);
    return text.replace(/\b\w/g, function (ch) { return ch.toUpperCase(); });
  }

  function uniqueStrings(values) {
    var seen = new Set();
    var out = [];
    (Array.isArray(values) ? values : []).forEach(function (value) {
      var text = String(value || '').trim();
      var key = text.toLowerCase();
      if (!text || seen.has(key)) return;
      seen.add(key);
      out.push(text);
    });
    return out;
  }

  function ingredientNamesFromRecipe(recipe) {
    return uniqueStrings((recipe && Array.isArray(recipe.ingredients) ? recipe.ingredients : []).map(function (row) {
      return String(row && row.item || '').trim();
    }).filter(Boolean));
  }

  function overlapCount(listA, listB) {
    var left = new Set((Array.isArray(listA) ? listA : []).map(function (v) { return String(v || '').toLowerCase(); }).filter(Boolean));
    var right = new Set((Array.isArray(listB) ? listB : []).map(function (v) { return String(v || '').toLowerCase(); }).filter(Boolean));
    var count = 0;
    left.forEach(function (value) {
      if (right.has(value)) count += 1;
    });
    return count;
  }

  function resolveIngredientSubstitutions(ingredientName) {
    var token = normalizeToken(ingredientName);
    if (!token) return [];
    if (INGREDIENT_SUBSTITUTIONS[token]) return INGREDIENT_SUBSTITUTIONS[token].slice();
    var keys = Object.keys(INGREDIENT_SUBSTITUTIONS);
    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      if (token.indexOf(key) >= 0 || key.indexOf(token) >= 0) {
        return INGREDIENT_SUBSTITUTIONS[key].slice();
      }
    }
    return [];
  }

  function getPairingRecommendations(entreeRecipe, courseCategory) {
    var entreeCuisines = entreeRecipe && entreeRecipe.cuisines || [];
    var entreeMethods = entreeRecipe && entreeRecipe.methods || [];
    var entreeHealth = normalizeHealthiness(entreeRecipe && entreeRecipe.healthiness);
    return state.recipes
      .filter(function (candidate) {
        return candidate && candidate.id !== entreeRecipe.id && normalizeCourseCategory(candidate.courseCategory) === courseCategory;
      })
      .map(function (candidate) {
        var cuisineOverlap = overlapCount(entreeCuisines, candidate.cuisines || []);
        var methodOverlap = overlapCount(entreeMethods, candidate.methods || []);
        var healthMatch = entreeHealth && entreeHealth === normalizeHealthiness(candidate.healthiness);
        var score = 0;
        score += cuisineOverlap * 3;
        score += methodOverlap * 2;
        if (healthMatch) score += 1;
        var reasons = [];
        if (cuisineOverlap > 0) reasons.push('shared cuisine');
        if (methodOverlap > 0) reasons.push('similar cooking method');
        if (healthMatch) reasons.push('similar healthiness');
        if (!reasons.length) reasons.push('complements this entree');
        return { recipe: candidate, score: score, reasonText: reasons.join(' + ') };
      })
      .sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return String((a.recipe && a.recipe.title) || '').localeCompare(String((b.recipe && b.recipe.title) || ''));
      })
      .slice(0, 3);
  }

  function safeCookKey(raw) {
    var key = String(raw || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    if (key === 'cod') key = 'cod_fish';
    if (key === 'steak') key = 'steak_medium_rare';
    return key;
  }

  function isSafeTempDualModeKey(key) {
    return String(key || '').indexOf('steak_') === 0 || /_egg$/.test(String(key || ''));
  }

  function safeCookOptions() {
    return Object.keys(SAFE_COOK_TEMPERATURES).map(function (key) {
      return { key: key, label: SAFE_COOK_TEMPERATURES[key].label };
    }).sort(function (a, b) {
      return a.label.localeCompare(b.label);
    });
  }

  function renderSafeCookTemperatureResult(rawKey) {
    var key = safeCookKey(rawKey);
    var item = SAFE_COOK_TEMPERATURES[key];
    if (!item) return 'No safe cook temperature reference saved for this item yet.';
    if (!state.safeTempStrictMode && item.culinaryTempF) {
      return item.label + ': ' + item.culinaryTempF + 'F (' + item.culinaryTempC + 'C). Culinary target. ' + String(item.culinaryNote || item.note || '').trim();
    }
    return item.label + ': ' + item.tempF + 'F (' + item.tempC + 'C). USDA-safe target. ' + String(item.note || '').trim();
  }

  function commonCookItemKey(raw) {
    return String(raw || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }

  function commonCookItemOptions() {
    return Object.keys(COMMON_COOK_TIMES).map(function (key) {
      return { key: key, label: COMMON_COOK_TIMES[key].label };
    }).sort(function (a, b) {
      return a.label.localeCompare(b.label);
    });
  }

  function commonCookMethodLabel(methodKey) {
    var labels = {
      conventional_bake: 'Normal Bake',
      convection_bake: 'Convection Bake',
      air_fry: 'Air Fry',
      air_fryer: 'Air Fry',
      stove_top: 'Stove Top',
      skillet: 'Stove Top',
      flat_top_grill: 'Flat Top Grill',
      grill: 'Grill',
      boil: 'Boil',
      instant_pot: 'Instant Pot'
    };
    return labels[String(methodKey || '').trim()] || String(methodKey || '').replace(/_/g, ' ');
  }

  function cookMethodsForItem(itemKey) {
    var item = COMMON_COOK_TIMES[itemKey];
    if (!item || !item.methods) return [];
    return Object.keys(item.methods).map(function (key) {
      return { key: key, label: commonCookMethodLabel(key) };
    }).sort(function (a, b) {
      return a.label.localeCompare(b.label);
    });
  }

  function cookItemNeedsDoneness(itemKey, methodKey) {
    var item = COMMON_COOK_TIMES[itemKey];
    var method = item && item.methods ? item.methods[methodKey] : null;
    return Boolean(method && method.donenessTimes);
  }

  function cookDonenessLabel(key) {
    if (key === 'medium_rare') return 'Medium Rare';
    if (key === 'medium_well') return 'Medium Well';
    if (key === 'well_done') return 'Well Done';
    return String(key || '').replace(/_/g, ' ').replace(/\b\w/g, function (ch) { return ch.toUpperCase(); });
  }

  function renderCommonCookTimeResult(itemKey, methodKey, donenessKey) {
    var item = COMMON_COOK_TIMES[itemKey];
    if (!item) return 'No cook-time reference saved for this item yet.';
    var method = item.methods ? item.methods[methodKey] : null;
    if (!method) return 'Select a cooking method to view a common time range.';
    var tempPart = method.tempF ? (' @ ' + method.tempF + 'F') : '';
    if (method.donenessTimes) {
      var doneness = COMMON_STEAK_DONENESS.indexOf(donenessKey) >= 0 ? donenessKey : 'medium_rare';
      var timeText = method.donenessTimes[doneness] || method.donenessTimes.medium || '';
      return item.label + ' (' + commonCookMethodLabel(methodKey) + ', ' + cookDonenessLabel(doneness) + '): ' + timeText + tempPart + '. ' + String(method.note || '').trim();
    }
    return item.label + ' (' + commonCookMethodLabel(methodKey) + '): ' + String(method.time || 'varies') + tempPart + '. ' + String(method.note || '').trim();
  }

  function getSimilarRecipes(recipe) {
    var sourceIngredients = ingredientNamesFromRecipe(recipe);
    return state.recipes
      .filter(function (candidate) {
        return candidate && candidate.id !== recipe.id;
      })
      .map(function (candidate) {
        var score = 0;
        score += overlapCount(recipe.cuisines || [], candidate.cuisines || []) * 3;
        score += overlapCount(recipe.proteins || [], candidate.proteins || []) * 3;
        score += overlapCount(recipe.methods || [], candidate.methods || []) * 2;
        score += overlapCount(sourceIngredients, ingredientNamesFromRecipe(candidate));
        if (normalizeCourseCategory(recipe.courseCategory) && normalizeCourseCategory(recipe.courseCategory) === normalizeCourseCategory(candidate.courseCategory)) score += 2;
        if (normalizeHealthiness(recipe.healthiness) && normalizeHealthiness(recipe.healthiness) === normalizeHealthiness(candidate.healthiness)) score += 1;
        return { recipe: candidate, score: score };
      })
      .filter(function (entry) { return entry.score > 0; })
      .sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return String((a.recipe && a.recipe.title) || '').localeCompare(String((b.recipe && b.recipe.title) || ''));
      })
      .slice(0, 5)
      .map(function (entry) { return entry.recipe; });
  }

  function getRecipeVariationSuggestions(recipe) {
    var suggestions = [];
    if (!recipe) return suggestions;
    suggestions.push({
      id: 'variation-' + recipe.id + '-faster',
      title: 'Faster Weeknight Version',
      text: 'Shorten prep by pre-cutting ingredients, use one pan, and streamline steps to target a faster weeknight cook.'
    });
    if ((recipe.methods || []).indexOf('Air Fryer') < 0) {
      suggestions.push({
        id: 'variation-' + recipe.id + '-air-fryer',
        title: 'Air Fryer Variation',
        text: 'Convert this recipe to an air-fryer method for a crisp finish and faster cook time with less oil.'
      });
    }
    if ((recipe.healthiness || '') !== 'more_healthy') {
      suggestions.push({
        id: 'variation-' + recipe.id + '-lighter',
        title: 'Lighter Variation',
        text: 'Create a lighter version by reducing added fats, increasing vegetables, and choosing lean proteins where possible.'
      });
    }
    if ((recipe.proteins || []).length) {
      suggestions.push({
        id: 'variation-' + recipe.id + '-protein-swap',
        title: 'Protein Swap Variation',
        text: 'Add a protein-swap option (for example turkey/chicken/tofu equivalent) with adjusted seasoning and cook time.'
      });
    }
    suggestions.push({
      id: 'variation-' + recipe.id + '-meal-prep',
      title: 'Meal Prep Variation',
      text: 'Adapt this recipe into a meal-prep format with batch portions, reheating notes, and storage guidance.'
    });
    return suggestions.slice(0, 4);
  }

  function saveVariationForActiveRecipe(variationInput) {
    var recipe = getRecipeById(state.activeRecipeId);
    if (!recipe) return;
    var title = String((variationInput && variationInput.title) || '').trim() || 'Recipe variation';
    var text = String((variationInput && variationInput.text) || '').trim();
    if (!text) return;
    recipe.variations = Array.isArray(recipe.variations) ? recipe.variations : [];
    recipe.variations.unshift({
      id: uid('variation'),
      title: title,
      text: text,
      sourceSuggestionId: String((variationInput && variationInput.sourceSuggestionId) || '').trim(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    recipe.updatedAt = Date.now();
    saveRecipes();
    renderCards();
    renderDetails(recipe.id);
  }

  function updateVariationForActiveRecipe(variationId, nextTitle, nextText) {
    var recipe = getRecipeById(state.activeRecipeId);
    if (!recipe) return;
    var text = String(nextText || '').trim();
    if (!text) return;
    recipe.variations = (recipe.variations || []).map(function (entry) {
      if (entry.id !== variationId) return entry;
      return Object.assign({}, entry, {
        title: String(nextTitle || '').trim() || 'Recipe variation',
        text: text,
        updatedAt: Date.now()
      });
    });
    recipe.updatedAt = Date.now();
    saveRecipes();
    renderCards();
    renderDetails(recipe.id);
  }

  function removeVariationForActiveRecipe(variationId) {
    var recipe = getRecipeById(state.activeRecipeId);
    if (!recipe) return;
    recipe.variations = (recipe.variations || []).filter(function (entry) { return entry.id !== variationId; });
    recipe.updatedAt = Date.now();
    saveRecipes();
    renderCards();
    renderDetails(recipe.id);
  }

  function getPantryRecommendationList() {
    return uniqueStrings(DEFAULT_PANTRY_SPICES.concat(RECOMMENDED_EXTRA_SPICES).map(normalizeSpiceName));
  }

  function renderPantryTracker(statusMessage) {
    var root = getRoot();
    if (!root) return;
    var pantryHost = root.querySelector('#recipesPantrySpiceList');
    var missingHost = root.querySelector('#recipesPantryMissingList');
    var statusHost = root.querySelector('#recipesPantrySpiceStatus');
    if (!pantryHost || !missingHost) return;
    var pantrySet = new Set((state.pantrySpices || []).map(normalizeSpiceName));
    var recommended = getPantryRecommendationList();
    var missing = recommended.filter(function (name) { return !pantrySet.has(name); });

    pantryHost.innerHTML = (state.pantrySpices || []).length
      ? state.pantrySpices.map(function (name) {
        return '<span class="recipes-chip-item">'
          + '<span>' + safeText(displaySpiceName(name)) + '</span>'
          + '<button type="button" data-pantry-action="remove" data-spice-name="' + safeText(name) + '">x</button>'
          + '</span>';
      }).join('')
      : '<div class="recipes-help-text">No spices tracked yet.</div>';

    missingHost.innerHTML = missing.length
      ? missing.map(function (name) {
        return '<button type="button" class="pill-button" data-pantry-action="add-recommended" data-spice-name="' + safeText(name) + '">' + safeText(displaySpiceName(name)) + '</button>';
      }).join('')
      : '<div class="recipes-help-text">Great job - pantry covers all common recommendations.</div>';

    if (statusHost) statusHost.textContent = statusMessage || '';
  }

  function addPantrySpice(name, statusMessage) {
    var normalized = normalizeSpiceName(name);
    if (!normalized) {
      renderPantryTracker('Enter a spice name first.');
      return;
    }
    if ((state.pantrySpices || []).indexOf(normalized) >= 0) {
      renderPantryTracker(displaySpiceName(normalized) + ' is already in your pantry list.');
      return;
    }
    state.pantrySpices.push(normalized);
    state.pantrySpices = uniqueStrings(state.pantrySpices.map(normalizeSpiceName));
    savePantrySpices();
    renderPantryTracker(statusMessage || ('Added ' + displaySpiceName(normalized) + '.'));
  }

  function removePantrySpice(name) {
    var normalized = normalizeSpiceName(name);
    state.pantrySpices = (state.pantrySpices || []).filter(function (row) { return normalizeSpiceName(row) !== normalized; });
    savePantrySpices();
    renderPantryTracker('Removed ' + displaySpiceName(normalized) + '.');
  }

  function normalizeRecipe(recipe) {
    recipe = recipe || {};
    var normalizedIngredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    var normalizedSteps = Array.isArray(recipe.steps) ? recipe.steps : [];
    var normalizedPhotos = Array.isArray(recipe.photos) ? recipe.photos : [];
    var normalizedNotes = Array.isArray(recipe.notes) ? recipe.notes : [];
    var normalizedVariations = Array.isArray(recipe.variations) ? recipe.variations : [];

    var proteins = asArray(recipe.proteins && recipe.proteins.length ? recipe.proteins : recipe.protein);
    var cuisines = asArray(recipe.cuisines && recipe.cuisines.length ? recipe.cuisines : recipe.cuisine);
    var methods = asArray(recipe.methods && recipe.methods.length ? recipe.methods : recipe.method);

    return {
      id: String(recipe.id || uid('recipe')),
      title: String(recipe.title || recipe.recipeName || 'Untitled recipe').trim(),
      description: String(recipe.description || '').trim(),
      proteins: proteins,
      cuisines: cuisines,
      methods: methods,
      courseCategory: normalizeCourseCategory(recipe.courseCategory || recipe.course_category),
      healthiness: normalizeHealthiness(recipe.healthiness || recipe.health_level),
      prepMinutes: recipe.prepMinutes === '' ? '' : Number(recipe.prepMinutes || 0),
      cookMinutes: recipe.cookMinutes === '' ? '' : Number(recipe.cookMinutes || 0),
      ingredients: normalizedIngredients.map(function (row) {
        return {
          quantity: String((row && row.quantity) || '').trim(),
          item: String((row && row.item) || '').trim(),
          category: String((row && row.category) || '').trim()
        };
      }).filter(function (row) { return row.quantity || row.item; }),
      steps: normalizedSteps.map(function (row) { return String(row || '').trim(); }).filter(Boolean),
      photos: normalizedPhotos.map(function (row) { return String(row || '').trim(); }).filter(Boolean),
      notes: normalizedNotes.map(function (row) {
        return {
          id: String((row && row.id) || uid('note')),
          text: String((row && row.text) || '').trim()
        };
      }).filter(function (row) { return row.text; }),
      variations: normalizedVariations.map(function (row) {
        return {
          id: String((row && row.id) || uid('variation')),
          title: String((row && row.title) || 'Recipe variation').trim(),
          text: String((row && row.text) || '').trim(),
          sourceSuggestionId: String((row && row.sourceSuggestionId) || '').trim(),
          createdAt: Number((row && row.createdAt) || Date.now()),
          updatedAt: Number((row && row.updatedAt) || Date.now())
        };
      }).filter(function (row) { return row.text; }),
      sourceUrl: String(recipe.sourceUrl || '').trim(),
      createdAt: Number(recipe.createdAt || Date.now()),
      updatedAt: Number(recipe.updatedAt || Date.now())
    };
  }

  function loadRecipes() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        var legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacyRaw) {
          var legacyParsed = JSON.parse(legacyRaw);
          state.recipes = (Array.isArray(legacyParsed) ? legacyParsed : []).map(normalizeRecipe);
          saveRecipes();
          return;
        }
        state.recipes = SEED_RECIPES.map(normalizeRecipe);
        saveRecipes();
        return;
      }
      var parsed = JSON.parse(raw);
      state.recipes = (Array.isArray(parsed) ? parsed : []).map(normalizeRecipe);
    } catch (_error) {
      state.recipes = SEED_RECIPES.map(normalizeRecipe);
      saveRecipes();
    }
  }

  function loadPantrySpices() {
    try {
      var raw = window.localStorage.getItem(PANTRY_STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : DEFAULT_PANTRY_SPICES.slice();
      state.pantrySpices = uniqueStrings((Array.isArray(parsed) ? parsed : DEFAULT_PANTRY_SPICES).map(normalizeSpiceName).filter(Boolean));
    } catch (_error) {
      state.pantrySpices = uniqueStrings(DEFAULT_PANTRY_SPICES.map(normalizeSpiceName));
    }
  }

  function saveRecipes() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.recipes));
  }

  function savePantrySpices() {
    window.localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(state.pantrySpices));
  }

  function getRoot() {
    return document.getElementById(ROOT_ID);
  }

  function intersects(recipeTags, activeTags) {
    if (!activeTags.length) return true;
    return activeTags.some(function (tag) { return recipeTags.indexOf(tag) >= 0; });
  }

  function normalizeSearchValue(value) {
    return String(value || '').trim().toLowerCase();
  }

  function toSortableMinutes(value) {
    var num = Number(value || 0);
    return Number.isFinite(num) && num > 0 ? num : Number.MAX_SAFE_INTEGER;
  }

  function getFilteredRecipes() {
    var filtered = state.recipes.filter(function (recipe) {
      if (!intersects(recipe.proteins || [], state.filters.proteins)) return false;
      if (!intersects(recipe.cuisines || [], state.filters.cuisines)) return false;
      if (!intersects(recipe.methods || [], state.filters.methods)) return false;
      if (state.filters.courseCategory && normalizeCourseCategory(recipe.courseCategory) !== state.filters.courseCategory) return false;
      if (state.filters.healthiness && normalizeHealthiness(recipe.healthiness) !== state.filters.healthiness) return false;
      if (state.filters.prepMax !== '' && Number(recipe.prepMinutes || 0) > Number(state.filters.prepMax)) return false;
      if (state.filters.cookMax !== '' && Number(recipe.cookMinutes || 0) > Number(state.filters.cookMax)) return false;

      var searchQuery = normalizeSearchValue(state.filters.searchQuery);
      if (!searchQuery) return true;

      var searchCorpus = [
        recipe.title,
        recipe.description,
        (recipe.proteins || []).join(' '),
        (recipe.cuisines || []).join(' '),
        (recipe.methods || []).join(' '),
        (recipe.ingredients || []).map(function (row) { return row.item; }).join(' '),
        (recipe.steps || []).join(' ')
      ].join(' ').toLowerCase();

      return searchCorpus.indexOf(searchQuery) >= 0;
    });

    var sortBy = String(state.filters.sortBy || 'updated_desc');
    return filtered.sort(function (a, b) {
      if (sortBy === 'title_asc') return String(a.title || '').localeCompare(String(b.title || ''));
      if (sortBy === 'prep_asc') return toSortableMinutes(a.prepMinutes) - toSortableMinutes(b.prepMinutes);
      if (sortBy === 'cook_asc') return toSortableMinutes(a.cookMinutes) - toSortableMinutes(b.cookMinutes);
      return Number(b.updatedAt || 0) - Number(a.updatedAt || 0);
    });
  }

  function setEditorStatus(message, isError) {
    var root = getRoot();
    if (!root) return;
    var status = root.querySelector('#recipesEditorStatus');
    if (!status) return;
    status.textContent = String(message || '');
    status.classList.toggle('is-error', Boolean(isError));
  }

  function uniqueSorted(values) {
    var set = new Set(values.filter(Boolean));
    return Array.from(set).sort(function (a, b) { return a.localeCompare(b); });
  }

  function renderChipList(containerId, values, namespace) {
    var root = getRoot();
    if (!root) return;
    var container = root.querySelector('#' + containerId);
    if (!container) return;
    container.innerHTML = values.map(function (value) {
      return '<span class="recipes-chip-item" data-chip-namespace="' + safeText(namespace) + '" data-chip-value="' + safeText(value) + '">' +
        '<span>' + safeText(value) + '</span>' +
        '<button type="button" aria-label="Remove ' + safeText(value) + '">x</button>' +
      '</span>';
    }).join('');
  }

  function renderCards() {
    var root = getRoot();
    if (!root) return;
    var cardsEl = root.querySelector('#recipesCards');
    var summaryEl = root.querySelector('#recipesCardsSummary');
    if (!cardsEl || !summaryEl) return;

    var filtered = getFilteredRecipes();
    summaryEl.textContent = 'Showing ' + filtered.length + ' of ' + state.recipes.length + ' recipes.';

    if (!filtered.length) {
      cardsEl.innerHTML = '<div class="recipes-empty">No recipes match the active filters.</div>';
      return;
    }

    cardsEl.innerHTML = filtered.map(function (recipe) {
      var meta = [recipe.prepMinutes ? ('Prep: ' + recipe.prepMinutes + 'm') : '', recipe.cookMinutes ? ('Cook: ' + recipe.cookMinutes + 'm') : ''].filter(Boolean).join(' · ');
      var photo = recipe.photos[0]
        ? '<img class="recipes-card-photo" alt="' + safeText(recipe.title) + '" src="' + safeText(recipe.photos[0]) + '">'
        : '<div class="recipes-card-photo"></div>';
      var chips = []
        .concat((recipe.proteins || []).map(function (value) { return '<span class="recipes-chip">' + safeText(value) + '</span>'; }))
        .concat((recipe.cuisines || []).map(function (value) { return '<span class="recipes-chip">' + safeText(value) + '</span>'; }))
        .concat((recipe.methods || []).map(function (value) { return '<span class="recipes-chip">' + safeText(value) + '</span>'; }))
        .join('');
      return '<article class="recipes-card" data-recipe-id="' + safeText(recipe.id) + '">' +
          photo +
          '<div class="recipes-card-body">' +
            '<h3 class="recipes-card-title">' + safeText(recipe.title) + '</h3>' +
            '<div class="recipes-chip-row">' + chips + '</div>' +
            '<div class="recipes-card-meta">' + safeText(meta || 'No time set') + '</div>' +
            '<div class="recipes-card-meta">' + safeText(displayCourseCategory(recipe.courseCategory) + ' · ' + displayHealthiness(recipe.healthiness)) + '</div>' +
          '</div>' +
        '</article>';
    }).join('');

    renderChipList('recipesFilterProteinChips', state.filters.proteins, 'filter:proteins');
    renderChipList('recipesFilterCuisineChips', state.filters.cuisines, 'filter:cuisines');
    renderChipList('recipesFilterMethodChips', state.filters.methods, 'filter:methods');
  }

  function getRecipeById(id) {
    return state.recipes.find(function (recipe) { return recipe.id === id; }) || null;
  }

  function renderDetails(recipeId) {
    var root = getRoot();
    if (!root) return;
    var details = root.querySelector('#recipesDetails');
    var title = root.querySelector('#recipesDetailsTitle');
    var body = root.querySelector('#recipesDetailsBody');
    if (!details || !title || !body) return;

    var recipe = getRecipeById(recipeId);
    if (!recipe) {
      details.hidden = true;
      return;
    }

    state.activeRecipeId = recipe.id;
    title.textContent = recipe.title;

    var ingredientItems = recipe.ingredients.map(function (row) {
      return '<li><strong>' + safeText(row.quantity || '-') + '</strong> ' + safeText(row.item || '') + (row.category ? (' <em>(' + safeText(row.category) + ')</em>') : '') + '</li>';
    }).join('');
    var stepItems = recipe.steps.map(function (step) { return '<li>' + safeText(step) + '</li>'; }).join('');
    var noteRows = recipe.notes.map(function (note) {
      return '<div class="recipes-note-row" data-note-id="' + safeText(note.id) + '">' +
        '<input type="text" value="' + safeText(note.text) + '">' +
        '<button type="button" class="pill-button" data-note-action="save">Save</button>' +
        '<button type="button" class="pill-button" data-note-action="remove">Delete</button>' +
      '</div>';
    }).join('');

    var photos = recipe.photos.map(function (url) {
      return '<img class="recipes-card-photo" style="height:160px;max-width:220px;border-radius:10px;margin-right:8px;" src="' + safeText(url) + '" alt="' + safeText(recipe.title) + '">';
    }).join('');
    var ingredientNames = ingredientNamesFromRecipe(recipe);
    var safeCookItems = safeCookOptions();
    var cookTimeItems = commonCookItemOptions();
    var isEntree = normalizeCourseCategory(recipe.courseCategory) === 'entree';
    var sidePairings = isEntree ? getPairingRecommendations(recipe, 'side_dish') : [];
    var dessertPairings = isEntree ? getPairingRecommendations(recipe, 'dessert') : [];
    var similarRecipes = getSimilarRecipes(recipe);
    var variationSuggestions = getRecipeVariationSuggestions(recipe);
    var existingVariations = Array.isArray(recipe.variations) ? recipe.variations : [];

    var sidePairingsHtml = sidePairings.length
      ? sidePairings.map(function (row) {
        return '<div class="recipes-pairing-item">'
          + '<button type="button" class="pill-button recipes-similar-btn" data-similar-recipe-id="' + safeText(row.recipe.id) + '">' + safeText(row.recipe.title) + '</button>'
          + '<div class="recipes-help-text">Why this pairing: ' + safeText(row.reasonText || 'complements this entree') + '</div>'
          + '</div>';
      }).join('')
      : '<div class="recipes-help-text">No side dish matches yet. Add side dish recipes to get suggestions.</div>';
    var dessertPairingsHtml = dessertPairings.length
      ? dessertPairings.map(function (row) {
        return '<div class="recipes-pairing-item">'
          + '<button type="button" class="pill-button recipes-similar-btn" data-similar-recipe-id="' + safeText(row.recipe.id) + '">' + safeText(row.recipe.title) + '</button>'
          + '<div class="recipes-help-text">Why this pairing: ' + safeText(row.reasonText || 'complements this entree') + '</div>'
          + '</div>';
      }).join('')
      : '<div class="recipes-help-text">No dessert matches yet. Add dessert recipes to get suggestions.</div>';
    var similarRecipesHtml = similarRecipes.length
      ? similarRecipes.map(function (row) {
        return '<button type="button" class="pill-button recipes-similar-btn" data-similar-recipe-id="' + safeText(row.id) + '">' + safeText(row.title) + '</button>';
      }).join('')
      : '<div class="recipes-help-text">No similar recipes found yet. Add more recipes to improve recommendations.</div>';
    var variationSuggestionsHtml = variationSuggestions.length
      ? variationSuggestions.map(function (entry, index) {
        return '<div class="recipes-variation-card">'
          + '<label>Variation title<input type="text" data-variation-title-index="' + index + '" value="' + safeText(entry.title) + '"></label>'
          + '<label>Variation details<textarea rows="2" data-variation-text-index="' + index + '">' + safeText(entry.text) + '</textarea></label>'
          + '<button type="button" class="pill-button" data-variation-action="accept" data-variation-index="' + index + '">Attach variation</button>'
          + '</div>';
      }).join('')
      : '<div class="recipes-help-text">No variation suggestions available yet.</div>';
    var existingVariationsHtml = existingVariations.length
      ? existingVariations.map(function (entry) {
        return '<div class="recipes-variation-card">'
          + '<label>Variation title<input type="text" data-saved-variation-title-id="' + safeText(entry.id) + '" value="' + safeText(entry.title || 'Recipe variation') + '"></label>'
          + '<label>Variation details<textarea rows="2" data-saved-variation-text-id="' + safeText(entry.id) + '">' + safeText(entry.text || '') + '</textarea></label>'
          + '<div class="recipes-inline-input-row">'
          + '<button type="button" class="pill-button" data-variation-action="update-saved" data-variation-id="' + safeText(entry.id) + '">Save changes</button>'
          + '<button type="button" class="pill-button" data-variation-action="delete-saved" data-variation-id="' + safeText(entry.id) + '">Delete</button>'
          + '</div>'
          + '</div>';
      }).join('')
      : '<div class="recipes-help-text">No saved variations yet.</div>';

    body.innerHTML = '<p>' + safeText(recipe.description || 'No description yet.') + '</p>' +
      '<p><strong>Proteins:</strong> ' + safeText((recipe.proteins || []).join(', ') || 'Not set') + ' | <strong>Cuisines:</strong> ' + safeText((recipe.cuisines || []).join(', ') || 'Not set') + ' | <strong>Methods:</strong> ' + safeText((recipe.methods || []).join(', ') || 'Not set') + '</p>' +
      '<p><strong>Course:</strong> ' + safeText(displayCourseCategory(recipe.courseCategory)) + ' | <strong>Healthiness:</strong> ' + safeText(displayHealthiness(recipe.healthiness)) + '</p>' +
      '<p><strong>Prep:</strong> ' + safeText(recipe.prepMinutes || '-') + ' min | <strong>Cook:</strong> ' + safeText(recipe.cookMinutes || '-') + ' min</p>' +
      (photos ? ('<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;">' + photos + '</div>') : '') +
      '<section class="recipes-recommendations">' +
        '<div class="recipes-editor-subheader"><h3>Pairings for this entree</h3></div>' +
        (isEntree
          ? ('<div class="recipes-pairings-block"><strong>Recommended side dishes</strong><div class="recipes-similar-list">' + sidePairingsHtml + '</div></div>' +
             '<div class="recipes-pairings-block"><strong>Recommended desserts</strong><div class="recipes-similar-list">' + dessertPairingsHtml + '</div></div>')
          : '<div class="recipes-help-text">Set this recipe as an entree to unlock side dish and dessert pairing recommendations.</div>') +
      '</section>' +
      '<section class="recipes-substitutions">' +
        '<div class="recipes-editor-subheader"><h3>Ingredient substitutions</h3></div>' +
        '<div class="recipes-inline-input-row">' +
          '<select id="recipesSubIngredientSelect">'
          + (ingredientNames.length
            ? ingredientNames.map(function (name) { return '<option value="' + safeText(name) + '">' + safeText(name) + '</option>'; }).join('')
            : '<option value="">No ingredients available</option>')
          + '</select>' +
          '<button type="button" class="pill-button" id="recipesFindSubstitutionsBtn">Find substitutions</button>' +
        '</div>' +
        '<div id="recipesSubstitutionsResult" class="recipes-help-text">Select an ingredient and click "Find substitutions".</div>' +
      '</section>' +
      '<section class="recipes-substitutions">' +
        '<div class="recipes-editor-subheader"><h3>Safe cook temperatures</h3></div>' +
        '<label class="recipes-safe-temp-mode-toggle"><input type="checkbox" id="recipesSafeTempStrictMode" ' + (state.safeTempStrictMode ? 'checked' : '') + '> Use strict USDA-safe mode (toggle off for culinary doneness targets on steak/eggs)</label>' +
        '<div class="recipes-inline-input-row">' +
          '<select id="recipesSafeCookItemSelect">'
          + safeCookItems.map(function (item) {
            return '<option value="' + safeText(item.key) + '">' + safeText(item.label) + '</option>';
          }).join('')
          + '</select>' +
          '<button type="button" class="pill-button" id="recipesFindSafeTempBtn">Show safe temp</button>' +
        '</div>' +
        '<div id="recipesSafeTempResult" class="recipes-help-text">Select a food item and click "Show safe temp".</div>' +
      '</section>' +
      '<section class="recipes-substitutions">' +
        '<div class="recipes-editor-subheader"><h3>Common cook times</h3></div>' +
        '<div class="recipes-inline-input-row">' +
          '<select id="recipesCookTimeItemSelect">'
          + cookTimeItems.map(function (item) { return '<option value="' + safeText(item.key) + '">' + safeText(item.label) + '</option>'; }).join('')
          + '</select>' +
          '<select id="recipesCookTimeMethodSelect"></select>' +
          '<select id="recipesCookTimeDonenessSelect" hidden>'
          + COMMON_STEAK_DONENESS.map(function (value) { return '<option value="' + safeText(value) + '">' + safeText(cookDonenessLabel(value)) + '</option>'; }).join('')
          + '</select>' +
          '<button type="button" class="pill-button" id="recipesFindCookTimeBtn">Show cook time</button>' +
        '</div>' +
        '<div id="recipesCookTimeResult" class="recipes-help-text">Select an item and method to view common cook-time guidance.</div>' +
      '</section>' +
      '<div class="recipes-editor-subheader"><h3>Ingredients</h3></div>' +
      '<ul>' + (ingredientItems || '<li>No ingredients yet.</li>') + '</ul>' +
      '<section class="recipes-recommendations">' +
        '<div class="recipes-editor-subheader"><h3>Similar recipes</h3></div>' +
        '<div class="recipes-similar-list">' + similarRecipesHtml + '</div>' +
      '</section>' +
      '<section class="recipes-recommendations">' +
        '<div class="recipes-editor-subheader"><h3>Suggested recipe variations</h3></div>' +
        '<div class="recipes-help-text">Edit any suggestion, then attach it as an optional variation on this recipe.</div>' +
        '<div class="recipes-variation-list">' + variationSuggestionsHtml + '</div>' +
      '</section>' +
      '<section class="recipes-recommendations">' +
        '<div class="recipes-editor-subheader"><h3>Saved variations</h3></div>' +
        '<div class="recipes-variation-list">' + existingVariationsHtml + '</div>' +
      '</section>' +
      '<div class="recipes-editor-subheader"><h3>Steps</h3></div>' +
      '<ol>' + (stepItems || '<li>No steps yet.</li>') + '</ol>' +
      '<div class="recipes-editor-subheader"><h3>Notes</h3><button type="button" class="pill-button" id="recipesAddNoteBtn">+ Note</button></div>' +
      '<div id="recipesNotesList">' + noteRows + '</div>' +
      '<div class="recipes-inline-input-row" style="margin-top:8px;"><button type="button" class="pill-button" id="recipesEditActiveBtn">Edit recipe</button></div>';

    details.hidden = false;
    syncCommonCookTimeControls();
  }

  function showIngredientSubstitutionsForActiveRecipe() {
    var root = getRoot();
    if (!root) return;
    var recipe = getRecipeById(state.activeRecipeId);
    if (!recipe) return;
    var select = root.querySelector('#recipesSubIngredientSelect');
    var output = root.querySelector('#recipesSubstitutionsResult');
    if (!select || !output) return;
    var ingredientName = String(select.value || '').trim();
    if (!ingredientName) {
      output.textContent = 'No ingredient selected.';
      return;
    }
    var suggestions = resolveIngredientSubstitutions(ingredientName);
    output.textContent = suggestions.length
      ? ('Potential substitutions for ' + ingredientName + ': ' + suggestions.join(', '))
      : ('No substitution suggestions saved yet for ' + ingredientName + '.');
  }

  function showSafeCookTemperatureForSelection() {
    var root = getRoot();
    if (!root) return;
    var select = root.querySelector('#recipesSafeCookItemSelect');
    var strictModeToggle = root.querySelector('#recipesSafeTempStrictMode');
    var output = root.querySelector('#recipesSafeTempResult');
    if (!select || !output) return;
    if (strictModeToggle) state.safeTempStrictMode = strictModeToggle.checked !== false;
    output.textContent = renderSafeCookTemperatureResult(select.value);
  }

  function syncCommonCookTimeControls() {
    var root = getRoot();
    if (!root) return;
    var itemSelect = root.querySelector('#recipesCookTimeItemSelect');
    var methodSelect = root.querySelector('#recipesCookTimeMethodSelect');
    var donenessSelect = root.querySelector('#recipesCookTimeDonenessSelect');
    if (!itemSelect || !methodSelect || !donenessSelect) return;

    var itemKey = commonCookItemKey(itemSelect.value);
    var methods = cookMethodsForItem(itemKey);
    var previousMethod = String(methodSelect.value || '').trim();
    methodSelect.innerHTML = methods.length
      ? methods.map(function (method) { return '<option value="' + safeText(method.key) + '">' + safeText(method.label) + '</option>'; }).join('')
      : '<option value="">No methods</option>';
    if (previousMethod && methods.some(function (method) { return method.key === previousMethod; })) {
      methodSelect.value = previousMethod;
    }

    var methodKey = methodSelect.value;
    var showDoneness = cookItemNeedsDoneness(itemKey, methodKey);
    donenessSelect.hidden = !showDoneness;
    if (showDoneness && COMMON_STEAK_DONENESS.indexOf(donenessSelect.value) < 0) {
      donenessSelect.value = 'medium_rare';
    }
  }

  function showCommonCookTimeForSelection() {
    var root = getRoot();
    if (!root) return;
    var itemSelect = root.querySelector('#recipesCookTimeItemSelect');
    var methodSelect = root.querySelector('#recipesCookTimeMethodSelect');
    var donenessSelect = root.querySelector('#recipesCookTimeDonenessSelect');
    var output = root.querySelector('#recipesCookTimeResult');
    if (!itemSelect || !methodSelect || !donenessSelect || !output) return;
    output.textContent = renderCommonCookTimeResult(
      commonCookItemKey(itemSelect.value),
      String(methodSelect.value || '').trim(),
      String(donenessSelect.value || '').trim()
    );
  }

  function parseTimeFromText(text, label) {
    var regex = new RegExp(label + '\\s*:?\\s*(\\d{1,3})\\s*(?:min|minutes|m)?', 'i');
    var match = String(text || '').match(regex);
    return match ? Number(match[1]) : '';
  }

  function inferFromOptions(text, options) {
    var lower = String(text || '').toLowerCase();
    return options.filter(function (item) { return lower.indexOf(item.toLowerCase()) >= 0; });
  }

  function deriveRecipeFromUrl(urlValue) {
    var url;
    try {
      url = new URL(urlValue);
    } catch (_error) {
      throw new Error('Please enter a valid URL.');
    }
    var slug = url.pathname.split('/').filter(Boolean).pop() || 'Imported Recipe';
    var title = slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, function (ch) { return ch.toUpperCase(); });
    return normalizeRecipe({
      title: title,
      description: 'Imported from URL. Please verify ingredients and steps.',
      sourceUrl: url.toString(),
      proteins: inferFromOptions(title, PROTEIN_OPTIONS),
      cuisines: inferFromOptions(title, CUISINE_OPTIONS),
      methods: inferFromOptions(title, METHOD_OPTIONS),
      ingredients: [],
      steps: []
    });
  }

  function parseRecipeFromText(rawText) {
    var text = String(rawText || '').trim();
    if (!text) throw new Error('Paste recipe text before parsing.');

    var lines = text.split(/\r?\n/).map(function (line) { return line.trim(); }).filter(Boolean);
    var ingredients = [];
    var steps = [];
    var inIngredients = false;
    var inSteps = false;

    lines.forEach(function (line, index) {
      var lower = line.toLowerCase();
      if (index === 0) return;
      if (lower.startsWith('ingredient')) { inIngredients = true; inSteps = false; return; }
      if (lower.startsWith('instruction') || lower.startsWith('direction') || lower.startsWith('step')) { inSteps = true; inIngredients = false; return; }
      if (inIngredients || /^[-*]/.test(line)) {
        var clean = line.replace(/^[-*]\s*/, '').replace(/^\d+[).]\s*/, '').trim();
        var qtyMatch = clean.match(/^([\d./]+\s*(?:cup|cups|tbsp|tsp|oz|lb|g|kg|ml|l|clove|cloves|slice|slices|can|cans)?)\s+(.+)$/i);
        if (qtyMatch) {
          ingredients.push({ quantity: qtyMatch[1].trim(), item: qtyMatch[2].trim() });
        } else {
          ingredients.push({ quantity: '', item: clean });
        }
        return;
      }
      if (inSteps || /^\d+[).]/.test(line)) {
        steps.push(line.replace(/^\d+[).]\s*/, '').trim());
      }
    });

    return normalizeRecipe({
      title: lines[0] || 'Imported Recipe',
      description: 'Imported from pasted text. Confirm details before saving.',
      proteins: inferFromOptions(text, PROTEIN_OPTIONS),
      cuisines: inferFromOptions(text, CUISINE_OPTIONS),
      methods: inferFromOptions(text, METHOD_OPTIONS),
      prepMinutes: parseTimeFromText(text, 'prep'),
      cookMinutes: parseTimeFromText(text, 'cook'),
      ingredients: ingredients.length ? ingredients : [{ quantity: '', item: '' }],
      steps: steps.length ? steps : ['']
    });
  }

  function fillDatalist(id, values) {
    var root = getRoot();
    if (!root) return;
    var node = root.querySelector('#' + id);
    if (!node) return;
    node.innerHTML = values.map(function (value) {
      return '<option value="' + safeText(value) + '"></option>';
    }).join('');
  }

  function updateSuggestionLists() {
    var proteins = uniqueSorted(PROTEIN_OPTIONS.concat(state.recipes.flatMap(function (row) { return row.proteins || []; })));
    var cuisines = uniqueSorted(CUISINE_OPTIONS.concat(state.recipes.flatMap(function (row) { return row.cuisines || []; })));
    var methods = uniqueSorted(METHOD_OPTIONS.concat(state.recipes.flatMap(function (row) { return row.methods || []; })));
    var ingredientNames = uniqueSorted(state.recipes.flatMap(function (row) { return (row.ingredients || []).map(function (i) { return i.item; }); }).concat(['Olive oil', 'Garlic', 'Onion', 'Salt', 'Black pepper', 'Butter', 'Lemon juice']));
    var stepSuggestions = uniqueSorted(state.recipes.flatMap(function (row) { return row.steps || []; }).concat(['Preheat oven to 400F.', 'Heat skillet over medium heat.', 'Season to taste and serve warm.', 'Cook until internal temperature reaches 165F.']));

    fillDatalist('recipesProteinList', proteins);
    fillDatalist('recipesCuisineList', cuisines);
    fillDatalist('recipesMethodList', methods);
    fillDatalist('recipesIngredientSuggestions', ingredientNames);
    fillDatalist('recipesStepSuggestions', stepSuggestions);
  }

  function ingredientRowHtml(row) {
    row = row || { quantity: '', item: '' };
    return '<div class="recipes-line-editor" data-editor-row="ingredient">' +
      '<input type="text" class="recipes-ingredient-qty" placeholder="Qty" value="' + safeText(row.quantity || '') + '">' +
      '<input type="text" class="recipes-ingredient-item" list="recipesIngredientSuggestions" placeholder="Ingredient" value="' + safeText(row.item || '') + '">' +
      '<button type="button" class="pill-button" data-row-action="remove">Remove</button>' +
    '</div>';
  }

  function stepRowHtml(text) {
    return '<div class="recipes-line-editor" data-editor-row="step">' +
      '<input type="text" class="recipes-step-text" list="recipesStepSuggestions" placeholder="Describe this step" value="' + safeText(text || '') + '">' +
      '<button type="button" class="pill-button" data-row-action="remove">Remove</button>' +
    '</div>';
  }

  function renderEditorPhotos() {
    var root = getRoot();
    if (!root) return;
    var photoPreview = root.querySelector('#recipesPhotoPreview');
    if (!photoPreview) return;
    photoPreview.innerHTML = state.editorPhotos.map(function (url, index) {
      return '<div class="recipes-photo-tile" data-photo-index="' + index + '"><img src="' + safeText(url) + '" alt="Recipe photo ' + (index + 1) + '"><button type="button" data-photo-action="remove">Remove</button></div>';
    }).join('');
  }

  function overwriteArray(targetArray, nextValues) {
    targetArray.length = 0;
    nextValues.forEach(function (value) {
      targetArray.push(value);
    });
  }

  function setEditorTags(recipe) {
    overwriteArray(state.editorTags.proteins, (recipe.proteins || []).slice());
    overwriteArray(state.editorTags.cuisines, (recipe.cuisines || []).slice());
    overwriteArray(state.editorTags.methods, (recipe.methods || []).slice());
    renderChipList('recipesEditorProteinChips', state.editorTags.proteins, 'editor:proteins');
    renderChipList('recipesEditorCuisineChips', state.editorTags.cuisines, 'editor:cuisines');
    renderChipList('recipesEditorMethodChips', state.editorTags.methods, 'editor:methods');
  }

  function openEditor(recipe) {
    var root = getRoot();
    if (!root) return;
    var overlay = root.querySelector('#recipesEditorOverlay');
    var title = root.querySelector('#recipesEditorTitle');
    var form = root.querySelector('#recipesEditorForm');
    if (!overlay || !title || !form) return;

    var model = normalizeRecipe(recipe || { title: '', description: '', ingredients: [{ quantity: '', item: '' }], steps: [''], photos: [], notes: [] });
    state.editingRecipeId = recipe && recipe.id ? recipe.id : '';
    state.editorPhotos = model.photos.slice();

    title.textContent = state.editingRecipeId ? 'Edit recipe' : 'Add recipe';
    form.elements.title.value = model.title;
    form.elements.description.value = model.description;
    form.elements.prepMinutes.value = model.prepMinutes === '' ? '' : String(model.prepMinutes);
    form.elements.cookMinutes.value = model.cookMinutes === '' ? '' : String(model.cookMinutes);
    form.elements.courseCategory.value = normalizeCourseCategory(model.courseCategory);
    form.elements.healthiness.value = normalizeHealthiness(model.healthiness);

    var ingredientsList = root.querySelector('#recipesIngredientsList');
    var stepsList = root.querySelector('#recipesStepsList');
    if (ingredientsList) ingredientsList.innerHTML = (model.ingredients.length ? model.ingredients : [{ quantity: '', item: '' }]).map(ingredientRowHtml).join('');
    if (stepsList) stepsList.innerHTML = (model.steps.length ? model.steps : ['']).map(stepRowHtml).join('');

    setEditorTags(model);
    renderEditorPhotos();
    setEditorStatus('', false);
    overlay.hidden = false;
  }

  function closeEditor() {
    var root = getRoot();
    if (!root) return;
    var overlay = root.querySelector('#recipesEditorOverlay');
    if (overlay) overlay.hidden = true;
    state.editingRecipeId = '';
    state.editorPhotos = [];
    overwriteArray(state.editorTags.proteins, []);
    overwriteArray(state.editorTags.cuisines, []);
    overwriteArray(state.editorTags.methods, []);
    setEditorStatus('', false);
  }

  function pushUniqueTag(targetArray, value) {
    var next = String(value || '').trim();
    if (!next) return false;
    if (targetArray.indexOf(next) >= 0) return false;
    targetArray.push(next);
    return true;
  }

  function removeTag(targetArray, value) {
    var index = targetArray.indexOf(value);
    if (index >= 0) targetArray.splice(index, 1);
  }

  function attachChipInput(inputId, targetArray, renderFn) {
    var root = getRoot();
    if (!root) return;
    var input = root.querySelector('#' + inputId);
    if (!input || input.dataset.bound === '1') return;
    input.dataset.bound = '1';

    function commitTag() {
      var value = String(input.value || '').trim();
      if (!value) return;
      if (pushUniqueTag(targetArray, value)) {
        renderFn();
      }
      input.value = '';
    }

    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ',') {
        event.preventDefault();
        commitTag();
      }
    });
    input.addEventListener('blur', commitTag);
  }

  function optimizeImageFile(file, maxDimension, jpegQuality) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('Unable to read image file.')); };
      reader.onload = function (e) {
        var image = new Image();
        image.onerror = function () { reject(new Error('Unable to decode image file.')); };
        image.onload = function () {
          var width = image.width;
          var height = image.height;
          var scale = Math.min(1, maxDimension / Math.max(width, height));
          var canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(width * scale));
          canvas.height = Math.max(1, Math.round(height * scale));
          var ctx = canvas.getContext('2d');
          if (!ctx) { reject(new Error('Unable to optimize image.')); return; }
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', jpegQuality));
        };
        image.src = String(e && e.target ? e.target.result : '');
      };
      reader.readAsDataURL(file);
    });
  }

  function exportRecipesJson() {
    var payload = {
      exportedAt: new Date().toISOString(),
      recipes: state.recipes
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'recipes-export-' + Date.now() + '.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function importRecipesJsonText(text) {
    var parsed = JSON.parse(String(text || '{}'));
    var incoming = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.recipes) ? parsed.recipes : []);
    if (!incoming.length) throw new Error('JSON file does not contain recipes.');
    state.recipes = incoming.map(normalizeRecipe);
    saveRecipes();
    updateSuggestionLists();
    renderCards();
  }

  function getGraphAccessToken() {
    return String(window.accessToken || '').trim();
  }

  function encodeGraphPath(path) {
    return String(path || '').split('/').map(function (part) { return encodeURIComponent(part); }).join('/');
  }

  async function graphFetchJson(url, options) {
    var token = getGraphAccessToken();
    if (!token) throw new Error('Please sign in to Microsoft first.');
    options = options || {};
    var headers = Object.assign({ Authorization: 'Bearer ' + token }, options.headers || {});
    if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
    var response = await fetch(url, Object.assign({}, options, { headers: headers }));
    if (!response.ok) {
      var bodyText = await response.text();
      throw new Error('Graph request failed (' + response.status + '): ' + bodyText.slice(0, 160));
    }
    if (response.status === 204) return {};
    return response.json();
  }

  async function resolveExcelWorkbookPath() {
    if (state.excel.workbookPath) return state.excel.workbookPath;

    for (var i = 0; i < EXCEL_WORKBOOK_CANDIDATES.length; i += 1) {
      var candidate = EXCEL_WORKBOOK_CANDIDATES[i];
      var candidatePath = encodeGraphPath(candidate);
      try {
        await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + candidatePath);
        state.excel.workbookPath = candidate;
        return state.excel.workbookPath;
      } catch (_error) {
        // Try next candidate.
      }
    }

    var search = await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root/search(q=\'recipes\')?$select=name,parentReference');
    var list = Array.isArray(search.value) ? search.value : [];
    var match = list.find(function (item) { return String(item.name || '').toLowerCase().indexOf('recipes') >= 0; });
    if (!match || !match.parentReference) throw new Error('Could not find workbook named recipes.');
    var parentPath = String(match.parentReference.path || '').replace('/drive/root:', '').replace(/^\/+/, '');
    state.excel.workbookPath = parentPath ? (parentPath + '/' + match.name) : match.name;
    return state.excel.workbookPath;
  }

  function splitCsvCell(value) {
    return String(value || '').split(/[;,\n]/).map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function mapExcelRowToRecipe(rowObj) {
    var title = rowObj[EXCEL_COLUMNS.recipeName] || 'Untitled recipe';
    var categories = [
      { key: EXCEL_COLUMNS.spices, category: 'spices' },
      { key: EXCEL_COLUMNS.sauces, category: 'sauces' },
      { key: EXCEL_COLUMNS.cannedItems, category: 'canned items' },
      { key: EXCEL_COLUMNS.produce, category: 'produce' },
      { key: EXCEL_COLUMNS.pasta, category: 'pasta' },
      { key: EXCEL_COLUMNS.rice, category: 'rice' },
      { key: EXCEL_COLUMNS.frozenItems, category: 'frozen items' }
    ];
    var ingredients = [];
    categories.forEach(function (meta) {
      splitCsvCell(rowObj[meta.key]).forEach(function (item) {
        ingredients.push({ quantity: '', item: item, category: meta.category });
      });
    });

    return normalizeRecipe({
      id: rowObj[EXCEL_COLUMNS.recipeId] || uid('recipe'),
      title: title,
      description: rowObj[EXCEL_COLUMNS.description] || '',
      proteins: splitCsvCell(rowObj[EXCEL_COLUMNS.proteins]),
      cuisines: splitCsvCell(rowObj[EXCEL_COLUMNS.style]),
      methods: splitCsvCell(rowObj[EXCEL_COLUMNS.cookMethod]),
      courseCategory: normalizeCourseCategory(rowObj[EXCEL_COLUMNS.courseCategory]),
      healthiness: normalizeHealthiness(rowObj[EXCEL_COLUMNS.healthiness]),
      prepMinutes: Number(rowObj[EXCEL_COLUMNS.prepTime] || 0) || '',
      cookMinutes: Number(rowObj[EXCEL_COLUMNS.cookTime] || 0) || '',
      ingredients: ingredients,
      steps: splitCsvCell(String(rowObj[EXCEL_COLUMNS.preparationSteps] || '').replace(/\r/g, '').split('\n').join(';')),
      photos: (function () {
        try { return JSON.parse(rowObj[EXCEL_COLUMNS.photosJson] || '[]'); } catch (_e) { return []; }
      })(),
      notes: (function () {
        try { return JSON.parse(rowObj[EXCEL_COLUMNS.notesJson] || '[]'); } catch (_e) { return []; }
      })(),
      variations: (function () {
        try { return JSON.parse(rowObj[EXCEL_COLUMNS.variationsJson] || '[]'); } catch (_e) { return []; }
      })(),
      sourceUrl: rowObj[EXCEL_COLUMNS.sourceUrl] || '',
      createdAt: Number(rowObj[EXCEL_COLUMNS.createdAt] || 0) || Date.now(),
      updatedAt: Number(rowObj[EXCEL_COLUMNS.updatedAt] || 0) || Date.now()
    });
  }

  async function readRecipesFromExcel() {
    var path = await resolveExcelWorkbookPath();
    var encodedPath = encodeGraphPath(path);
    var tableRef = encodeURIComponent(EXCEL_TABLE_NAME);
    var columnsResp = await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + tableRef + '/columns?$select=name,index');
    var rowsResp = await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + tableRef + '/rows?$top=5000');

    var columns = (columnsResp.value || []).slice().sort(function (a, b) { return Number(a.index || 0) - Number(b.index || 0); });
    var names = columns.map(function (col) { return String(col.name || '').trim(); });
    updateRecipesSchemaBanner(names);
    var normalizedNameByIndex = names.map(function (name) { return name.toLowerCase(); });

    return (rowsResp.value || []).map(function (row) {
      var values = (row.values && row.values[0]) ? row.values[0] : [];
      var mapped = {};
      normalizedNameByIndex.forEach(function (normalizedName, index) {
        mapped[normalizedName] = values[index];
      });
      return mapExcelRowToRecipe(mapped);
    });
  }

  function joinIngredientsByCategory(recipe, category) {
    return (recipe.ingredients || [])
      .filter(function (row) { return String(row.category || '').toLowerCase() === category; })
      .map(function (row) { return row.quantity ? (row.quantity + ' ' + row.item).trim() : row.item; })
      .filter(Boolean)
      .join('; ');
  }

  function mapRecipeToExcelRow(recipe, orderedNormalizedColumns) {
    var model = normalizeRecipe(recipe);
    var byName = {};
    byName[EXCEL_COLUMNS.recipeName] = model.title;
    byName[EXCEL_COLUMNS.style] = model.cuisines.join('; ');
    byName[EXCEL_COLUMNS.prepTime] = model.prepMinutes || '';
    byName[EXCEL_COLUMNS.cookTime] = model.cookMinutes || '';
    byName[EXCEL_COLUMNS.cookMethod] = model.methods.join('; ');
    byName[EXCEL_COLUMNS.courseCategory] = model.courseCategory || '';
    byName[EXCEL_COLUMNS.healthiness] = model.healthiness || '';
    byName[EXCEL_COLUMNS.proteins] = model.proteins.join('; ');
    byName[EXCEL_COLUMNS.spices] = joinIngredientsByCategory(model, 'spices');
    byName[EXCEL_COLUMNS.sauces] = joinIngredientsByCategory(model, 'sauces');
    byName[EXCEL_COLUMNS.cannedItems] = joinIngredientsByCategory(model, 'canned items');
    byName[EXCEL_COLUMNS.produce] = joinIngredientsByCategory(model, 'produce');
    byName[EXCEL_COLUMNS.pasta] = joinIngredientsByCategory(model, 'pasta');
    byName[EXCEL_COLUMNS.rice] = joinIngredientsByCategory(model, 'rice');
    byName[EXCEL_COLUMNS.frozenItems] = joinIngredientsByCategory(model, 'frozen items');
    byName[EXCEL_COLUMNS.preparationSteps] = model.steps.join('\n');
    byName[EXCEL_COLUMNS.recipeId] = model.id;
    byName[EXCEL_COLUMNS.description] = model.description;
    byName[EXCEL_COLUMNS.photosJson] = JSON.stringify(model.photos || []);
    byName[EXCEL_COLUMNS.notesJson] = JSON.stringify(model.notes || []);
    byName[EXCEL_COLUMNS.variationsJson] = JSON.stringify(model.variations || []);
    byName[EXCEL_COLUMNS.sourceUrl] = model.sourceUrl || '';
    byName[EXCEL_COLUMNS.createdAt] = model.createdAt || '';
    byName[EXCEL_COLUMNS.updatedAt] = model.updatedAt || '';

    return orderedNormalizedColumns.map(function (name) {
      return byName.hasOwnProperty(name) ? byName[name] : '';
    });
  }

  async function writeRecipesToExcel() {
    var path = await resolveExcelWorkbookPath();
    var encodedPath = encodeGraphPath(path);
    var tableRef = encodeURIComponent(EXCEL_TABLE_NAME);
    var columnsResp = await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + tableRef + '/columns?$select=name,index');
    var columns = (columnsResp.value || []).slice().sort(function (a, b) { return Number(a.index || 0) - Number(b.index || 0); });
    updateRecipesSchemaBanner(columns.map(function (c) { return String(c.name || '').trim(); }));
    var normalizedColumns = columns.map(function (c) { return String(c.name || '').trim().toLowerCase(); });

    await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + tableRef + '/rows/clear', { method: 'POST' });
    var values = state.recipes.map(function (recipe) { return mapRecipeToExcelRow(recipe, normalizedColumns); });
    if (!values.length) return;

    await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + tableRef + '/rows/add', {
      method: 'POST',
      body: JSON.stringify({ values: values })
    });
  }

  function setExcelStatus(message, isError) {
    var root = getRoot();
    if (!root) return;
    var status = root.querySelector('#recipesExcelStatus');
    if (!status) return;
    status.textContent = message || '';
    status.style.color = isError ? '#b91c1c' : '#0f766e';
  }

  async function syncFromExcel(options) {
    options = options || {};
    try {
      setExcelStatus(options.autoSync ? 'Auto-syncing from Excel...' : 'Syncing from Excel...', false);
      var excelRecipes = await readRecipesFromExcel();
      if (excelRecipes.length) {
        state.recipes = excelRecipes.map(normalizeRecipe);
        saveRecipes();
        updateSuggestionLists();
        renderCards();
      }
      state.excel.lastSyncAt = Date.now();
      if (options.autoSync) {
        state.excel.lastAutoSyncAt = Date.now();
      }
      setExcelStatus((options.autoSync ? 'Auto-sync complete. ' : '') + 'Loaded ' + excelRecipes.length + ' recipe(s) from Excel.', false);
    } catch (error) {
      state.excel.lastError = error && error.message ? error.message : 'Excel sync failed.';
      if (!options.silent) {
        setExcelStatus(state.excel.lastError, true);
      }
    }
  }

  async function syncToExcel() {
    try {
      setExcelStatus('Syncing to Excel...', false);
      await writeRecipesToExcel();
      setExcelStatus('Excel sync complete.', false);
    } catch (error) {
      setExcelStatus(error && error.message ? error.message : 'Excel write failed.', true);
    }
  }

  function updateIntakeStatus(message, isError) {
    var root = getRoot();
    if (!root) return;
    var status = root.querySelector('#recipesIntakeStatus');
    if (!status) return;
    status.textContent = message || '';
    status.style.color = isError ? '#b91c1c' : '#1d4ed8';
  }

  function setActiveIntakeTab(tabKey) {
    var root = getRoot();
    if (!root) return;
    root.querySelectorAll('[data-recipes-intake-tab]').forEach(function (button) {
      button.classList.toggle('active', button.getAttribute('data-recipes-intake-tab') === tabKey);
    });
    root.querySelectorAll('[data-recipes-intake-pane]').forEach(function (pane) {
      pane.hidden = pane.getAttribute('data-recipes-intake-pane') !== tabKey;
    });
  }

  function saveEditorForm(event) {
    event.preventDefault();
    var root = getRoot();
    if (!root) return;
    var form = root.querySelector('#recipesEditorForm');
    if (!form) return;

    var ingredients = Array.from(root.querySelectorAll('[data-editor-row="ingredient"]')).map(function (row) {
      return {
        quantity: row.querySelector('.recipes-ingredient-qty') ? row.querySelector('.recipes-ingredient-qty').value : '',
        item: row.querySelector('.recipes-ingredient-item') ? row.querySelector('.recipes-ingredient-item').value : ''
      };
    }).filter(function (row) { return String(row.quantity || '').trim() || String(row.item || '').trim(); });

    var steps = Array.from(root.querySelectorAll('[data-editor-row="step"] .recipes-step-text')).map(function (input) {
      return String(input.value || '').trim();
    }).filter(Boolean);

    var missing = [];
    if (!String(form.elements.title.value || '').trim()) missing.push('Recipe name');
    if (!state.editorTags.methods.length) missing.push('At least one cooking method');
    if (!ingredients.length) missing.push('At least one ingredient');
    if (!steps.length) missing.push('At least one cook instruction step');
    if (missing.length) {
      setEditorStatus('Please complete: ' + missing.join(', ') + '.', true);
      return;
    }

    var model = normalizeRecipe({
      id: state.editingRecipeId || undefined,
      title: form.elements.title.value,
      description: form.elements.description.value,
      proteins: state.editorTags.proteins,
      cuisines: state.editorTags.cuisines,
      methods: state.editorTags.methods,
      courseCategory: normalizeCourseCategory(form.elements.courseCategory ? form.elements.courseCategory.value : ''),
      healthiness: normalizeHealthiness(form.elements.healthiness ? form.elements.healthiness.value : ''),
      prepMinutes: form.elements.prepMinutes.value,
      cookMinutes: form.elements.cookMinutes.value,
      ingredients: ingredients,
      steps: steps,
      photos: state.editorPhotos,
      notes: state.editingRecipeId ? ((getRecipeById(state.editingRecipeId) || {}).notes || []) : []
    });

    if (state.editingRecipeId) {
      state.recipes = state.recipes.map(function (recipe) {
        if (recipe.id !== state.editingRecipeId) return recipe;
        model.createdAt = recipe.createdAt || model.createdAt;
        model.updatedAt = Date.now();
        return model;
      });
    } else {
      model.createdAt = Date.now();
      model.updatedAt = Date.now();
      state.recipes.unshift(model);
    }

    saveRecipes();
    updateSuggestionLists();
    renderCards();
    setEditorStatus('Recipe saved.', false);
    closeEditor();
    renderDetails(model.id);
  }

  function shouldAutoSyncOnTabOpen() {
    if (!getGraphAccessToken()) return false;
    return Date.now() - Number(state.excel.lastAutoSyncAt || 0) > AUTO_SYNC_COOLDOWN_MS;
  }

  function autoSyncOnTabOpen() {
    if (!shouldAutoSyncOnTabOpen()) return;
    syncFromExcel({ silent: false, autoSync: true });
  }

  function addNoteToActiveRecipe() {
    var recipe = getRecipeById(state.activeRecipeId);
    if (!recipe) return;
    recipe.notes.push({ id: uid('note'), text: 'New note' });
    recipe.updatedAt = Date.now();
    saveRecipes();
    renderDetails(recipe.id);
  }

  function removeRecipeNote(noteId) {
    var recipe = getRecipeById(state.activeRecipeId);
    if (!recipe) return;
    recipe.notes = recipe.notes.filter(function (note) { return note.id !== noteId; });
    recipe.updatedAt = Date.now();
    saveRecipes();
    renderDetails(recipe.id);
  }

  function saveRecipeNote(noteId, text) {
    var recipe = getRecipeById(state.activeRecipeId);
    if (!recipe) return;
    recipe.notes = recipe.notes.map(function (note) {
      if (note.id !== noteId) return note;
      return { id: note.id, text: String(text || '').trim() || 'New note' };
    });
    recipe.updatedAt = Date.now();
    saveRecipes();
    renderDetails(recipe.id);
  }

  function updateRecipesSchemaBanner(columnNames) {
    var root = getRoot();
    if (!root) return;
    var host = root.querySelector('#recipesSchemaBanner');
    if (!host) return;
    var helper = window.ExcelSchemaCheckHelper;
    if (!helper || typeof helper.evaluateSchema !== 'function') return;

    var result = helper.evaluateSchema(columnNames || [], REQUIRED_EXCEL_COLUMNS, RECOMMENDED_EXCEL_COLUMNS);
    state.excel.schemaColumnNames = Array.isArray(columnNames) ? columnNames.slice() : [];

    if (typeof helper.reportSchemaStatus === 'function') {
      helper.reportSchemaStatus('recipes', {
        feature: 'Recipes',
        table: EXCEL_TABLE_NAME,
        missingRequired: result.missingRequired,
        missingRecommended: result.missingRecommended,
        tone: result.missingRequired.length ? 'error' : (result.missingRecommended.length ? 'warning' : 'success'),
        checkedAt: Date.now()
      });
    }

    if (!result.missingRequired.length && !result.missingRecommended.length) {
      helper.clearInline(host);
      return;
    }

    var missingParts = [];
    if (result.missingRequired.length) {
      missingParts.push('Required: ' + result.missingRequired.join(', '));
    }
    if (result.missingRecommended.length) {
      missingParts.push('Recommended: ' + result.missingRecommended.join(', '));
    }

    helper.renderInline(host, {
      title: 'Recipes Excel schema check',
      message: result.missingRequired.length
        ? 'Your recipes table is missing required columns. Some sync actions may fail until schema is fixed.'
        : 'Your recipes table is missing recommended columns. Core sync works, but some recipe details may not persist.',
      details: missingParts.join(' | '),
      tone: result.missingRequired.length ? 'error' : 'warning'
    });
  }

  function bindEvents() {
    var root = getRoot();
    if (!root || root.dataset.recipesEventsBound === '1') return;
    root.dataset.recipesEventsBound = '1';

    attachChipInput('recipesFilterProteinInput', state.filters.proteins, renderCards);
    attachChipInput('recipesFilterCuisineInput', state.filters.cuisines, renderCards);
    attachChipInput('recipesFilterMethodInput', state.filters.methods, renderCards);
    attachChipInput('recipesEditorProteinInput', state.editorTags.proteins, function () { renderChipList('recipesEditorProteinChips', state.editorTags.proteins, 'editor:proteins'); });
    attachChipInput('recipesEditorCuisineInput', state.editorTags.cuisines, function () { renderChipList('recipesEditorCuisineChips', state.editorTags.cuisines, 'editor:cuisines'); });
    attachChipInput('recipesEditorMethodInput', state.editorTags.methods, function () { renderChipList('recipesEditorMethodChips', state.editorTags.methods, 'editor:methods'); });

    root.addEventListener('click', function (event) {
      var target = event.target && event.target.nodeType === Node.ELEMENT_NODE ? event.target : null;
      if (!target) return;

      if (target.closest('#recipesAddBtn')) {
        var panel = root.querySelector('#recipesIntakePanel');
        if (panel) panel.hidden = !panel.hidden;
        updateIntakeStatus('', false);
        return;
      }

      if (target.closest('#recipesExportBtn')) { exportRecipesJson(); return; }
      if (target.closest('#recipesImportBtn')) {
        var fileInput = root.querySelector('#recipesImportFileInput');
        if (fileInput) fileInput.click();
        return;
      }
      if (target.closest('#recipesAddPantrySpiceBtn')) {
        var pantryInput = root.querySelector('#recipesPantrySpiceInput');
        addPantrySpice(pantryInput ? pantryInput.value : '');
        if (pantryInput) pantryInput.value = '';
        return;
      }
      var pantryActionBtn = target.closest('[data-pantry-action][data-spice-name]');
      if (pantryActionBtn) {
        var pantryAction = pantryActionBtn.getAttribute('data-pantry-action');
        var spiceName = pantryActionBtn.getAttribute('data-spice-name');
        if (pantryAction === 'remove') removePantrySpice(spiceName);
        if (pantryAction === 'add-recommended') addPantrySpice(spiceName, 'Added recommended spice: ' + displaySpiceName(spiceName) + '.');
        return;
      }

      var intakeTab = target.closest('[data-recipes-intake-tab]');
      if (intakeTab) {
        setActiveIntakeTab(intakeTab.getAttribute('data-recipes-intake-tab'));
        return;
      }

      var intakeAction = target.closest('[data-recipes-intake-action]');
      if (intakeAction) {
        var action = intakeAction.getAttribute('data-recipes-intake-action');
        try {
          if (action === 'start-manual') { openEditor(); updateIntakeStatus('Started a blank recipe.', false); }
          if (action === 'parse-url') {
            var urlInput = root.querySelector('#recipesUrlInput');
            openEditor(deriveRecipeFromUrl(urlInput ? urlInput.value : ''));
            updateIntakeStatus('URL parsed. Please review and save.', false);
          }
          if (action === 'parse-text') {
            var textInput = root.querySelector('#recipesPasteInput');
            openEditor(parseRecipeFromText(textInput ? textInput.value : ''));
            updateIntakeStatus('Text parsed. Review and save.', false);
          }
        } catch (error) {
          updateIntakeStatus(error && error.message ? error.message : 'Unable to parse recipe.', true);
        }
        return;
      }

      var chip = target.closest('.recipes-chip-item[data-chip-namespace][data-chip-value]');
      if (chip && target.tagName === 'BUTTON') {
        var ns = chip.getAttribute('data-chip-namespace');
        var value = chip.getAttribute('data-chip-value');
        if (ns === 'filter:proteins') removeTag(state.filters.proteins, value);
        if (ns === 'filter:cuisines') removeTag(state.filters.cuisines, value);
        if (ns === 'filter:methods') removeTag(state.filters.methods, value);
        if (ns === 'editor:proteins') removeTag(state.editorTags.proteins, value);
        if (ns === 'editor:cuisines') removeTag(state.editorTags.cuisines, value);
        if (ns === 'editor:methods') removeTag(state.editorTags.methods, value);
        renderCards();
        renderChipList('recipesEditorProteinChips', state.editorTags.proteins, 'editor:proteins');
        renderChipList('recipesEditorCuisineChips', state.editorTags.cuisines, 'editor:cuisines');
        renderChipList('recipesEditorMethodChips', state.editorTags.methods, 'editor:methods');
        return;
      }

      var card = target.closest('.recipes-card[data-recipe-id]');
      if (card) { renderDetails(card.getAttribute('data-recipe-id')); return; }
      if (target.closest('#recipesDetailsClose')) { var details = root.querySelector('#recipesDetails'); if (details) details.hidden = true; return; }
      if (target.closest('#recipesEditorCancel')) { closeEditor(); return; }
      if (target.closest('#recipesAddIngredientBtn')) { var ingredientsList = root.querySelector('#recipesIngredientsList'); if (ingredientsList) ingredientsList.insertAdjacentHTML('beforeend', ingredientRowHtml({ quantity: '', item: '' })); return; }
      if (target.closest('#recipesAddStepBtn')) { var stepsList = root.querySelector('#recipesStepsList'); if (stepsList) stepsList.insertAdjacentHTML('beforeend', stepRowHtml('')); return; }
      if (target.closest('[data-row-action="remove"]')) { var row = target.closest('[data-editor-row]'); if (row) row.remove(); return; }
      if (target.closest('#recipesEditActiveBtn')) { var activeRecipe = getRecipeById(state.activeRecipeId); if (activeRecipe) openEditor(activeRecipe); return; }
      if (target.closest('#recipesFindSubstitutionsBtn')) { showIngredientSubstitutionsForActiveRecipe(); return; }
      if (target.closest('#recipesFindSafeTempBtn')) { showSafeCookTemperatureForSelection(); return; }
      if (target.closest('#recipesFindCookTimeBtn')) { showCommonCookTimeForSelection(); return; }
      var variationAccept = target.closest('[data-variation-action="accept"][data-variation-index]');
      if (variationAccept) {
        var indexRaw = Number(variationAccept.getAttribute('data-variation-index'));
        var activeRecipe = getRecipeById(state.activeRecipeId);
        var suggestions = getRecipeVariationSuggestions(activeRecipe);
        var suggestion = Number.isFinite(indexRaw) && indexRaw >= 0 ? suggestions[indexRaw] : null;
        if (activeRecipe && suggestion) {
          var titleInput = root.querySelector('[data-variation-title-index="' + indexRaw + '"]');
          var textInput = root.querySelector('[data-variation-text-index="' + indexRaw + '"]');
          saveVariationForActiveRecipe({
            title: titleInput ? titleInput.value : suggestion.title,
            text: textInput ? textInput.value : suggestion.text,
            sourceSuggestionId: suggestion.id
          });
        }
        return;
      }
      var variationUpdate = target.closest('[data-variation-action="update-saved"][data-variation-id]');
      if (variationUpdate) {
        var updateVariationId = variationUpdate.getAttribute('data-variation-id');
        var updateTitleInput = root.querySelector('[data-saved-variation-title-id="' + updateVariationId + '"]');
        var updateTextInput = root.querySelector('[data-saved-variation-text-id="' + updateVariationId + '"]');
        updateVariationForActiveRecipe(updateVariationId, updateTitleInput ? updateTitleInput.value : '', updateTextInput ? updateTextInput.value : '');
        return;
      }
      var variationDelete = target.closest('[data-variation-action="delete-saved"][data-variation-id]');
      if (variationDelete) {
        removeVariationForActiveRecipe(variationDelete.getAttribute('data-variation-id'));
        return;
      }
      var similarBtn = target.closest('[data-similar-recipe-id]');
      if (similarBtn) { renderDetails(similarBtn.getAttribute('data-similar-recipe-id')); return; }
      if (target.closest('#recipesAddNoteBtn')) { addNoteToActiveRecipe(); return; }
      if (target.closest('[data-note-action="remove"]')) { var noteRowRemove = target.closest('[data-note-id]'); if (noteRowRemove) removeRecipeNote(noteRowRemove.getAttribute('data-note-id')); return; }
      if (target.closest('[data-note-action="save"]')) {
        var noteRowSave = target.closest('[data-note-id]');
        if (noteRowSave) {
          var input = noteRowSave.querySelector('input');
          saveRecipeNote(noteRowSave.getAttribute('data-note-id'), input ? input.value : '');
        }
        return;
      }
      if (target.closest('#recipesAddPhotoUrlBtn')) {
        var urlNode = root.querySelector('#recipesPhotoUrlInput');
        var valueUrl = String(urlNode ? urlNode.value : '').trim();
        if (!valueUrl) return;
        state.editorPhotos.push(valueUrl);
        if (urlNode) urlNode.value = '';
        renderEditorPhotos();
        return;
      }
      if (target.matches('[data-photo-action="remove"]')) {
        var tile = target.closest('[data-photo-index]');
        if (!tile) return;
        var index = Number(tile.getAttribute('data-photo-index'));
        if (index >= 0) {
          state.editorPhotos.splice(index, 1);
          renderEditorPhotos();
        }
      }
    });

    root.addEventListener('change', function (event) {
      var target = event.target && event.target.nodeType === Node.ELEMENT_NODE ? event.target : null;
      if (!target) return;

      if (target.id === 'recipesImportFileInput') {
        var file = target.files && target.files[0] ? target.files[0] : null;
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (e) {
          try {
            importRecipesJsonText(String(e && e.target ? e.target.result : ''));
            setExcelStatus('Imported recipes JSON.', false);
          } catch (error) {
            setExcelStatus(error && error.message ? error.message : 'Import failed.', true);
          }
        };
        reader.readAsText(file, 'utf-8');
        target.value = '';
        return;
      }

      if (target.id === 'recipesPhotoFileInput') {
        var files = target.files ? Array.from(target.files) : [];
        if (!files.length) return;
        Promise.all(files.map(function (file) { return optimizeImageFile(file, 1600, 0.82); }))
          .then(function (optimizedUrls) {
            state.editorPhotos = state.editorPhotos.concat(optimizedUrls.filter(Boolean));
            renderEditorPhotos();
          })
          .catch(function (error) {
            setExcelStatus(error && error.message ? error.message : 'Photo optimization failed.', true);
          });
        target.value = '';
        return;
      }

      if (target.id === 'recipesFilterPrep') { state.filters.prepMax = target.value; renderCards(); return; }
      if (target.id === 'recipesFilterCook') { state.filters.cookMax = target.value; renderCards(); }
      if (target.id === 'recipesFilterSearch') { state.filters.searchQuery = target.value; renderCards(); return; }
      if (target.id === 'recipesFilterSort') { state.filters.sortBy = target.value || 'updated_desc'; renderCards(); return; }
      if (target.id === 'recipesFilterCourseCategory') { state.filters.courseCategory = normalizeCourseCategory(target.value); renderCards(); return; }
      if (target.id === 'recipesFilterHealthiness') { state.filters.healthiness = normalizeHealthiness(target.value); renderCards(); }
      if (target.id === 'recipesSafeTempStrictMode') { state.safeTempStrictMode = target.checked !== false; showSafeCookTemperatureForSelection(); return; }
      if (target.id === 'recipesCookTimeItemSelect') { syncCommonCookTimeControls(); return; }
      if (target.id === 'recipesCookTimeMethodSelect') { syncCommonCookTimeControls(); return; }
      if (target.id === 'recipesCookTimeDonenessSelect') { showCommonCookTimeForSelection(); }
    });

    root.addEventListener('input', function (event) {
      var target = event.target && event.target.nodeType === Node.ELEMENT_NODE ? event.target : null;
      if (!target) return;
      if (target.id === 'recipesFilterSearch') {
        state.filters.searchQuery = target.value;
        renderCards();
      }
    });

    var form = root.querySelector('#recipesEditorForm');
    if (form) form.addEventListener('submit', saveEditorForm);

    var resetBtn = root.querySelector('#recipesFilterReset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        state.filters = { proteins: [], cuisines: [], methods: [], searchQuery: '', sortBy: 'updated_desc', prepMax: '', cookMax: '', courseCategory: '', healthiness: '' };
        ['recipesFilterPrep', 'recipesFilterCook', 'recipesFilterSearch', 'recipesFilterSort', 'recipesFilterCourseCategory', 'recipesFilterHealthiness', 'recipesFilterProteinInput', 'recipesFilterCuisineInput', 'recipesFilterMethodInput'].forEach(function (id) {
          var field = root.querySelector('#' + id);
          if (field) field.value = '';
        });
        var sortField = root.querySelector('#recipesFilterSort');
        if (sortField) sortField.value = 'updated_desc';
        renderCards();
      });
    }
  }

  function init() {
    var root = getRoot();
    if (!root) return;

    loadRecipes();
    loadPantrySpices();
    updateSuggestionLists();
    renderCards();
    renderPantryTracker('');
    bindEvents();

    if (!state.initialized) {
      state.initialized = true;
      setActiveIntakeTab('manual');
      document.addEventListener('kap:app-mode-changed', function () {
        updateRecipesSchemaBanner(state.excel.schemaColumnNames || []);
      });
      window.addEventListener('app:tab-switched', function (event) {
        var tabId = event && event.detail ? event.detail.tabId : '';
        if (tabId !== 'recipes') return;
        autoSyncOnTabOpen();
      });
      if (getGraphAccessToken()) {
        syncFromExcel({ silent: true, autoSync: true });
      }
      console.log('✅ Recipes tab initialized');
    }
  }

  window.RecipesTabSystem = {
    init: init,
    syncFromExcel: syncFromExcel,
    syncToExcel: syncToExcel
  };
})();

