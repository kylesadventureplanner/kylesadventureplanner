(function () {
  var STORAGE_KEY = 'kapRecipesV2';
  var LEGACY_STORAGE_KEY = 'kapRecipesV1';
  var PANTRY_STORAGE_KEY = 'kapRecipesPantrySpicesV1';
  var MEASUREMENT_PREF_STORAGE_KEY = 'kapRecipesMeasurementPrefV1';
  var INGREDIENT_DB_STORAGE_KEY = 'kapRecipesIngredientsDbV1';
  var SUBSTITUTION_DB_STORAGE_KEY = 'kapRecipesSubstitutionsDbV1';
  var ROOT_ID = 'recipesRoot';
  var EXCEL_WORKBOOK_CANDIDATES = ['recipes.xlsx', 'recipes.xlsm', 'recipes'];
  var EXCEL_TABLE_NAME = 'recipes';
  var EXCEL_SUBSTITUTIONS_TABLE_NAME = 'substitutions';
  var EXCEL_INGREDIENTS_TABLE_NAME = 'ingredients';
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
  var CUISINE_IMPROVEMENT_HINTS = {
    mexican: [
      { item: 'Cumin', quantity: '1 tsp', reason: 'Adds depth commonly used in Mexican-style dishes.' },
      { item: 'Smoked paprika', quantity: '1/2 tsp', reason: 'Adds smoky warmth found in many regional recipes.' },
      { item: 'Oregano', quantity: '1/2 tsp', reason: 'Brings a classic herb note used in many Mexican sauces.' },
      { item: 'Lime juice', quantity: '1 tbsp', reason: 'Brightens and balances rich flavors.' }
    ],
    italian: [
      { item: 'Basil', quantity: '1 tbsp', reason: 'Adds a fresh herb finish common in Italian dishes.' },
      { item: 'Oregano', quantity: '1/2 tsp', reason: 'Adds a familiar savory herb layer.' },
      { item: 'Red pepper flakes', quantity: '1/4 tsp', reason: 'Adds optional gentle heat for balance.' },
      { item: 'Parmesan', quantity: '1/4 cup', reason: 'Adds savory umami and authenticity.' }
    ],
    indian: [
      { item: 'Cumin', quantity: '1 tsp', reason: 'Core spice in many Indian profiles.' },
      { item: 'Coriander', quantity: '1 tsp', reason: 'Adds citrusy earthiness common in curries.' },
      { item: 'Turmeric', quantity: '1/2 tsp', reason: 'Contributes color and classic flavor base.' },
      { item: 'Garam masala', quantity: '1/2 tsp', reason: 'Adds warm finishing spice depth.' }
    ],
    thai: [
      { item: 'Fish sauce', quantity: '1 tbsp', reason: 'Adds salty-umami backbone often used in Thai cooking.' },
      { item: 'Lime juice', quantity: '1 tbsp', reason: 'Adds acidity essential to Thai balance.' },
      { item: 'Brown sugar', quantity: '1 tsp', reason: 'Rounds spicy and sour elements.' },
      { item: 'Cilantro', quantity: '1 tbsp', reason: 'Adds fresh herb finish.' }
    ],
    japanese: [
      { item: 'Soy sauce', quantity: '1 tbsp', reason: 'Builds a classic savory base.' },
      { item: 'Rice vinegar', quantity: '1 tsp', reason: 'Adds balanced acidity.' },
      { item: 'Sesame oil', quantity: '1 tsp', reason: 'Adds nutty aroma for authenticity.' },
      { item: 'Mirin', quantity: '1 tbsp', reason: 'Adds subtle sweetness and gloss.' }
    ]
  };
  var RECIPE_KEYWORD_IMPROVEMENT_HINTS = [
    { keyword: 'taco', suggestions: [
      { item: 'Cumin', quantity: '1 tsp', reason: 'Common taco seasoning foundation.' },
      { item: 'Chili powder', quantity: '1 tsp', reason: 'Adds chili warmth and color.' },
      { item: 'Garlic powder', quantity: '1/2 tsp', reason: 'Boosts savory depth in quick taco blends.' }
    ] },
    { keyword: 'chili', suggestions: [
      { item: 'Cumin', quantity: '1 tsp', reason: 'Essential earthy chili profile.' },
      { item: 'Smoked paprika', quantity: '1 tsp', reason: 'Improves smoky depth.' },
      { item: 'Cocoa powder', quantity: '1/2 tsp', reason: 'Optional but common depth enhancer in chili.' }
    ] },
    { keyword: 'curry', suggestions: [
      { item: 'Cumin', quantity: '1 tsp', reason: 'Common aromatic base for curries.' },
      { item: 'Coriander', quantity: '1 tsp', reason: 'Balances warm spices with citrus notes.' },
      { item: 'Ginger', quantity: '1 tsp', reason: 'Adds brightness and warmth.' }
    ] },
    { keyword: 'pasta', suggestions: [
      { item: 'Basil', quantity: '1 tbsp', reason: 'Classic Italian herb lift for pasta.' },
      { item: 'Parmesan', quantity: '1/4 cup', reason: 'Adds umami and richer finish.' },
      { item: 'Red pepper flakes', quantity: '1/4 tsp', reason: 'Optional heat balance.' }
    ] },
    { keyword: 'stew', suggestions: [
      { item: 'Bay leaf', quantity: '1', reason: 'Traditional slow-cook aromatic.' },
      { item: 'Thyme', quantity: '1/2 tsp', reason: 'Adds savory body to long-cooked dishes.' }
    ] }
  ];
  var MEASUREMENT_CONVERSION = {
    mlPerCup: 236.588,
    mlPerTablespoon: 14.7868,
    mlPerTeaspoon: 4.92892,
    mlPerFluidOz: 29.5735,
    gPerOz: 28.3495,
    gPerLb: 453.592
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
  var COOK_METHOD_CONVERSION_PROFILES = {
    skillet_saute: { label: 'Skillet saute', factor: 0.7 },
    conventional_oven: { label: 'Conventional oven', factor: 1.0 },
    convection_oven: { label: 'Convection oven', factor: 0.85 },
    air_fry_oven: { label: 'Air fry oven', factor: 0.75 },
    indoor_grill: { label: 'Indoor grill', factor: 0.72 },
    flat_top_grill: { label: 'Flat top grill', factor: 0.68 },
    infrared_smoker_big_easy: { label: 'Infrared smoker (Char-Broil Big Easy)', factor: 1.2 }
  };
  var PROTEIN_CONVERSION_PRESETS = {
    none: {
      label: 'No protein profile',
      doneness: ['auto'],
      thicknessMultiplier: { thin: 1.0, standard: 1.0, thick: 1.0 },
      donenessMultiplier: { auto: 1.0 }
    },
    chicken_breast: {
      label: 'Chicken breast',
      doneness: ['auto', 'safe'],
      thicknessMultiplier: { thin: 0.84, standard: 1.0, thick: 1.22 },
      donenessMultiplier: { auto: 1.0, safe: 1.05 }
    },
    steak: {
      label: 'Steak',
      doneness: ['auto', 'rare', 'medium_rare', 'medium', 'medium_well', 'well_done'],
      thicknessMultiplier: { thin: 0.8, standard: 1.0, thick: 1.26 },
      donenessMultiplier: { auto: 1.0, rare: 0.82, medium_rare: 0.92, medium: 1.0, medium_well: 1.12, well_done: 1.22 }
    },
    pork_chop: {
      label: 'Pork chop',
      doneness: ['auto', 'safe'],
      thicknessMultiplier: { thin: 0.85, standard: 1.0, thick: 1.24 },
      donenessMultiplier: { auto: 1.0, safe: 1.08 }
    },
    salmon_fillet: {
      label: 'Salmon fillet',
      doneness: ['auto', 'medium', 'safe'],
      thicknessMultiplier: { thin: 0.82, standard: 1.0, thick: 1.2 },
      donenessMultiplier: { auto: 1.0, medium: 0.95, safe: 1.08 }
    },
    brisket: {
      label: 'Brisket (smoker)',
      doneness: ['auto', 'fork_tender'],
      thicknessMultiplier: { thin: 0.92, standard: 1.0, thick: 1.15 },
      donenessMultiplier: { auto: 1.0, fork_tender: 1.16 }
    }
  };
  var PROTEIN_THICKNESS_PRESETS = {
    thin: { label: 'Thin cut' },
    standard: { label: 'Standard cut' },
    thick: { label: 'Thick cut' }
  };
  var PROTEIN_DONENESS_PRESETS = {
    auto: { label: 'Auto' },
    rare: { label: 'Rare' },
    medium_rare: { label: 'Medium rare' },
    medium: { label: 'Medium' },
    medium_well: { label: 'Medium well' },
    well_done: { label: 'Well done' },
    safe: { label: 'USDA safe' },
    fork_tender: { label: 'Fork tender' }
  };
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
    recipeUrl: 'recipe_url',
    sourceUrl: 'source_url',
    sectionOverridesJson: 'section_overrides_json',
    preferredCookMethodProfile: 'preferred_cook_method_profile',
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
    EXCEL_COLUMNS.recipeUrl,
    EXCEL_COLUMNS.sourceUrl,
    EXCEL_COLUMNS.sectionOverridesJson,
    EXCEL_COLUMNS.preferredCookMethodProfile,
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
    editorPdfPreviewText: '',
    editorPdfSuggestedSections: [],
    editorPdfAutoAcceptWithStepRefs: true,
    editorSectionOverrides: [],
    editorTags: {
      proteins: [],
      cuisines: [],
      methods: []
    },
    pantrySpices: [],
    measurementSystem: 'us',
    showRecipeImprovements: false,
    recipeImprovementStatus: '',
    referenceDbStatus: '',
    referenceDbFilters: {
      substitutionsRelevantOnly: false,
      substitutionsQuery: '',
      ingredientType: 'all',
      ingredientQuery: ''
    },
    servingTarget: 0,
    substitutionsDbPairs: [],
    substitutionsDbMap: {},
    ingredientsDb: [],
    safeTempStrictMode: true,
    lastCookMethodConversion: null,
    detailsToastTimer: null,
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

  function normalizeIngredientName(value) {
    return normalizeToken(value);
  }

  function splitSubstituteCell(value) {
    return String(value || '')
      .split(/[;,\n|]/)
      .map(function (part) { return String(part || '').trim(); })
      .filter(Boolean);
  }

  function defaultSubstitutionPairs() {
    var pairs = [];
    Object.keys(INGREDIENT_SUBSTITUTIONS).forEach(function (original) {
      (INGREDIENT_SUBSTITUTIONS[original] || []).forEach(function (substitute) {
        pairs.push({ original: original, substitute: substitute });
      });
    });
    // Broad pantry and dietary-inclusive substitutions.
    [
      ['all purpose flour', 'Whole wheat flour'], ['all purpose flour', 'Gluten-free 1:1 flour'], ['all purpose flour', 'Almond flour'],
      ['bread flour', 'All purpose flour'], ['cake flour', 'All purpose flour + cornstarch'], ['cornstarch', 'Arrowroot powder'],
      ['cornstarch', 'Tapioca starch'], ['buttermilk', 'Milk + lemon juice'], ['buttermilk', 'Plain yogurt + water'],
      ['whole milk', '2% milk'], ['whole milk', 'Unsweetened oat milk'], ['whole milk', 'Unsweetened soy milk'],
      ['heavy cream', 'Evaporated milk'], ['half and half', 'Milk + butter'], ['sour cream', 'Plain Greek yogurt'],
      ['mayonnaise', 'Greek yogurt'], ['mayonnaise', 'Mashed avocado'], ['butter', 'Olive oil'], ['butter', 'Ghee'],
      ['vegetable oil', 'Canola oil'], ['vegetable oil', 'Avocado oil'], ['olive oil', 'Avocado oil'],
      ['sesame oil', 'Tahini + neutral oil'], ['white sugar', 'Brown sugar'], ['brown sugar', 'White sugar + molasses'],
      ['honey', 'Maple syrup'], ['maple syrup', 'Honey'], ['molasses', 'Brown sugar + water'],
      ['soy sauce', 'Tamari'], ['soy sauce', 'Coconut aminos'], ['tamari', 'Soy sauce'], ['fish sauce', 'Soy sauce + lime juice'],
      ['worcestershire sauce', 'Soy sauce + vinegar + sugar'], ['rice vinegar', 'Apple cider vinegar'], ['apple cider vinegar', 'White vinegar'],
      ['lemon juice', 'Lime juice'], ['lime juice', 'Lemon juice'], ['fresh garlic', 'Garlic powder'], ['garlic powder', 'Fresh garlic'],
      ['fresh onion', 'Onion powder'], ['onion powder', 'Fresh onion'], ['fresh basil', 'Dried basil'], ['fresh oregano', 'Dried oregano'],
      ['fresh thyme', 'Dried thyme'], ['fresh rosemary', 'Dried rosemary'], ['cilantro', 'Parsley'],
      ['parsley', 'Cilantro'], ['chili powder', 'Paprika + cumin + cayenne'], ['cumin', 'Ground coriander + chili powder'],
      ['smoked paprika', 'Paprika + cumin'], ['paprika', 'Smoked paprika'], ['cayenne pepper', 'Red pepper flakes'],
      ['red pepper flakes', 'Cayenne pepper'], ['black pepper', 'White pepper'], ['white pepper', 'Black pepper'],
      ['eggs', 'Flax eggs'], ['eggs', 'Chia eggs'], ['eggs', 'Silken tofu'], ['egg', 'Mashed banana'],
      ['breadcrumbs', 'Crushed crackers'], ['breadcrumbs', 'Rolled oats'], ['panko', 'Breadcrumbs'], ['rice', 'Quinoa'],
      ['rice', 'Cauliflower rice'], ['jasmine rice', 'Basmati rice'], ['basmati rice', 'Jasmine rice'], ['pasta', 'Zucchini noodles'],
      ['pasta', 'Chickpea pasta'], ['spaghetti', 'Linguine'], ['fettuccine', 'Tagliatelle'],
      ['corn tortillas', 'Flour tortillas'], ['flour tortillas', 'Corn tortillas'], ['tortilla chips', 'Pita chips'],
      ['ground chicken', 'Ground turkey'], ['ground turkey', 'Ground chicken'], ['ground pork', 'Ground turkey'],
      ['beef broth', 'Chicken broth'], ['chicken broth', 'Vegetable broth'], ['vegetable broth', 'Chicken broth'],
      ['coconut milk', 'Heavy cream'], ['coconut milk', 'Evaporated milk'], ['tomato paste', 'Tomato sauce reduced'],
      ['tomato sauce', 'Crushed tomatoes'], ['crushed tomatoes', 'Diced tomatoes'], ['diced tomatoes', 'Crushed tomatoes'],
      ['parmesan', 'Pecorino romano'], ['mozzarella', 'Provolone'], ['cheddar', 'Monterey jack'], ['cream cheese', 'Neufchatel'],
      ['yogurt', 'Sour cream'], ['plain yogurt', 'Greek yogurt'], ['greek yogurt', 'Sour cream'],
      ['kidney beans', 'Black beans'], ['black beans', 'Pinto beans'], ['pinto beans', 'Black beans'], ['chickpeas', 'Cannellini beans']
    ].forEach(function (row) {
      pairs.push({ original: row[0], substitute: row[1] });
    });
    return pairs;
  }

  function createIngredientType(name) {
    var token = normalizeIngredientName(name);
    if (/salt|pepper|paprika|cumin|oregano|thyme|basil|coriander|garlic powder|onion powder|seasoning|spice/.test(token)) return 'spice';
    if (/chicken|beef|pork|turkey|salmon|shrimp|tofu|beans|egg/.test(token)) return 'protein';
    if (/oil|vinegar|soy sauce|fish sauce|mustard|ketchup|mayo|mayonnaise/.test(token)) return 'sauce';
    if (/rice|pasta|flour|bread|tortilla|quinoa|oats/.test(token)) return 'grain';
    if (/tomato|onion|garlic|pepper|lettuce|spinach|carrot|potato|zucchini|lime|lemon|cilantro|parsley/.test(token)) return 'produce';
    return 'other';
  }

  function uniqueIngredientRows(rows) {
    var seen = new Set();
    var out = [];
    (Array.isArray(rows) ? rows : []).forEach(function (row) {
      var name = String(row && row.name || row && row.ingredientName || '').trim();
      var key = normalizeIngredientName(name);
      if (!name || !key || seen.has(key)) return;
      seen.add(key);
      out.push({ name: name, type: String(row && row.type || row && row.ingredientType || createIngredientType(name)).trim() || 'other' });
    });
    return out.sort(function (a, b) { return a.name.localeCompare(b.name); });
  }

  function normalizeSubstitutionPairRows(rows) {
    var seen = new Set();
    var out = [];
    (Array.isArray(rows) ? rows : []).forEach(function (row) {
      var original = String(row && row.original || row && row.originalIngredient || '').trim();
      var substitute = String(row && row.substitute || row && row.substituteIngredient || '').trim();
      var left = normalizeIngredientName(original);
      var right = normalizeIngredientName(substitute);
      var key = left + '::' + right;
      if (!left || !right || seen.has(key)) return;
      seen.add(key);
      out.push({ original: original, substitute: substitute });
    });
    return out;
  }

  function substitutionMapFromPairs(pairs) {
    var map = {};
    normalizeSubstitutionPairRows(pairs).forEach(function (pair) {
      var key = normalizeIngredientName(pair.original);
      map[key] = map[key] || [];
      if (map[key].indexOf(pair.substitute) < 0) map[key].push(pair.substitute);
    });
    return map;
  }

  function rebuildSubstitutionDatabase() {
    var basePairs = defaultSubstitutionPairs();
    var mergedPairs = normalizeSubstitutionPairRows(basePairs.concat(state.substitutionsDbPairs || []));
    state.substitutionsDbPairs = mergedPairs;
    state.substitutionsDbMap = substitutionMapFromPairs(mergedPairs);
  }

  function loadReferenceDatabasesFromCache() {
    try {
      var rawSubs = window.localStorage.getItem(SUBSTITUTION_DB_STORAGE_KEY);
      var parsedSubs = rawSubs ? JSON.parse(rawSubs) : [];
      state.substitutionsDbPairs = normalizeSubstitutionPairRows(parsedSubs);
    } catch (_error) {
      state.substitutionsDbPairs = [];
    }
    try {
      var rawIngredients = window.localStorage.getItem(INGREDIENT_DB_STORAGE_KEY);
      var parsedIngredients = rawIngredients ? JSON.parse(rawIngredients) : [];
      state.ingredientsDb = uniqueIngredientRows(parsedIngredients);
    } catch (_error) {
      state.ingredientsDb = [];
    }
    rebuildSubstitutionDatabase();
  }

  function saveReferenceDatabasesToCache() {
    try {
      window.localStorage.setItem(SUBSTITUTION_DB_STORAGE_KEY, JSON.stringify(state.substitutionsDbPairs || []));
      window.localStorage.setItem(INGREDIENT_DB_STORAGE_KEY, JSON.stringify(state.ingredientsDb || []));
    } catch (_error) {}
  }

  function substitutionPairKey(original, substitute) {
    return normalizeIngredientName(original) + '::' + normalizeIngredientName(substitute);
  }

  function sortSubstitutionPairs(pairs) {
    return (Array.isArray(pairs) ? pairs.slice() : []).sort(function (a, b) {
      var left = String(a.original || '').localeCompare(String(b.original || ''));
      if (left !== 0) return left;
      return String(a.substitute || '').localeCompare(String(b.substitute || ''));
    });
  }

  function saveReferenceDatabasesAndRefresh() {
    saveReferenceDatabasesToCache();
    updateSuggestionLists();
    if (state.activeRecipeId) renderDetails(state.activeRecipeId);
  }

  function addSubstitutionPairToDatabase(original, substitute) {
    var originalName = String(original || '').trim();
    var substituteName = String(substitute || '').trim();
    if (!originalName || !substituteName) return false;
    var key = substitutionPairKey(originalName, substituteName);
    var exists = (state.substitutionsDbPairs || []).some(function (row) {
      return substitutionPairKey(row.original, row.substitute) === key;
    });
    if (exists) return false;
    state.substitutionsDbPairs.push({ original: originalName, substitute: substituteName });
    state.substitutionsDbPairs = sortSubstitutionPairs(normalizeSubstitutionPairRows(state.substitutionsDbPairs));
    rebuildSubstitutionDatabase();
    return true;
  }

  function updateSubstitutionPairInDatabase(previousKey, nextOriginal, nextSubstitute) {
    var originalName = String(nextOriginal || '').trim();
    var substituteName = String(nextSubstitute || '').trim();
    if (!originalName || !substituteName) return false;
    var changed = false;
    state.substitutionsDbPairs = (state.substitutionsDbPairs || []).filter(function (row) {
      var key = substitutionPairKey(row.original, row.substitute);
      if (key !== previousKey) return true;
      changed = true;
      return false;
    });
    if (!changed) return false;
    addSubstitutionPairToDatabase(originalName, substituteName);
    state.substitutionsDbPairs = sortSubstitutionPairs(normalizeSubstitutionPairRows(state.substitutionsDbPairs));
    rebuildSubstitutionDatabase();
    return true;
  }

  function removeSubstitutionPairFromDatabase(pairKey) {
    var before = (state.substitutionsDbPairs || []).length;
    state.substitutionsDbPairs = (state.substitutionsDbPairs || []).filter(function (row) {
      return substitutionPairKey(row.original, row.substitute) !== pairKey;
    });
    var removed = before !== state.substitutionsDbPairs.length;
    if (removed) {
      state.substitutionsDbPairs = sortSubstitutionPairs(normalizeSubstitutionPairRows(state.substitutionsDbPairs));
      rebuildSubstitutionDatabase();
    }
    return removed;
  }

  function ingredientRowKey(name) {
    return normalizeIngredientName(name);
  }

  function addIngredientToDatabase(name, type) {
    var ingredientName = String(name || '').trim();
    var ingredientType = String(type || '').trim() || createIngredientType(ingredientName);
    if (!ingredientName) return false;
    var key = ingredientRowKey(ingredientName);
    var exists = (state.ingredientsDb || []).some(function (row) { return ingredientRowKey(row.name) === key; });
    if (exists) return false;
    state.ingredientsDb.push({ name: ingredientName, type: ingredientType });
    state.ingredientsDb = uniqueIngredientRows(state.ingredientsDb);
    return true;
  }

  function updateIngredientInDatabase(previousKey, nextName, nextType) {
    var ingredientName = String(nextName || '').trim();
    var ingredientType = String(nextType || '').trim() || createIngredientType(ingredientName);
    if (!ingredientName) return false;
    var changed = false;
    state.ingredientsDb = (state.ingredientsDb || []).filter(function (row) {
      var key = ingredientRowKey(row.name);
      if (key !== previousKey) return true;
      changed = true;
      return false;
    });
    if (!changed) return false;
    addIngredientToDatabase(ingredientName, ingredientType);
    state.ingredientsDb = uniqueIngredientRows(state.ingredientsDb);
    return true;
  }

  function removeIngredientFromDatabase(keyToRemove) {
    var before = (state.ingredientsDb || []).length;
    state.ingredientsDb = (state.ingredientsDb || []).filter(function (row) {
      return ingredientRowKey(row.name) !== keyToRemove;
    });
    return before !== state.ingredientsDb.length;
  }

  function isAdvancedMode() {
    try {
      if (typeof window.getAppMode === 'function') return window.getAppMode() === 'advanced';
    } catch (_error) {}
    return document.documentElement.getAttribute('data-app-mode') === 'advanced';
  }

  function formatNumber(value, maxDecimals) {
    var fixed = Number(value || 0).toFixed(maxDecimals);
    return fixed.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  }

  function parseQuantityNumber(text) {
    var raw = String(text || '').trim();
    if (!raw) return NaN;
    var mixed = raw.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (mixed) {
      var whole = Number(mixed[1]);
      var num = Number(mixed[2]);
      var den = Number(mixed[3]);
      if (den) return whole + (num / den);
    }
    var fraction = raw.match(/^(\d+)\/(\d+)$/);
    if (fraction) {
      var numerator = Number(fraction[1]);
      var denominator = Number(fraction[2]);
      if (denominator) return numerator / denominator;
    }
    return Number(raw);
  }

  function normalizeUnitToken(unitRaw) {
    var token = String(unitRaw || '').trim().toLowerCase().replace(/\./g, '');
    if (!token) return '';
    if (token === 'cups' || token === 'cup') return 'cup';
    if (token === 'tbsp' || token === 'tablespoon' || token === 'tablespoons') return 'tbsp';
    if (token === 'tsp' || token === 'teaspoon' || token === 'teaspoons') return 'tsp';
    if (token === 'oz' || token === 'ounce' || token === 'ounces') return 'oz';
    if (token === 'lb' || token === 'lbs' || token === 'pound' || token === 'pounds') return 'lb';
    if (token === 'g' || token === 'gram' || token === 'grams') return 'g';
    if (token === 'kg' || token === 'kilogram' || token === 'kilograms') return 'kg';
    if (token === 'ml' || token === 'milliliter' || token === 'milliliters') return 'ml';
    if (token === 'l' || token === 'liter' || token === 'liters') return 'l';
    return token;
  }

  function parseQuantityParts(quantityRaw) {
    var raw = String(quantityRaw || '').trim();
    if (!raw) return null;
    var match = raw.match(/^(\d+(?:\.\d+)?(?:\s+\d+\/\d+)?|\d+\/\d+)\s*([a-zA-Z.]+)?\s*(.*)$/);
    if (!match) return null;
    var amount = parseQuantityNumber(match[1]);
    if (!Number.isFinite(amount)) return null;
    return {
      amount: amount,
      unit: normalizeUnitToken(match[2] || ''),
      tail: String(match[3] || '').trim()
    };
  }

  function buildQuantityText(amount, unit, tail) {
    var valuePart = formatNumber(amount, 2);
    var unitPart = unit ? (' ' + unit) : '';
    var tailPart = tail ? (' ' + tail) : '';
    return (valuePart + unitPart + tailPart).trim();
  }

  function convertQuantityForDisplay(quantityRaw, targetSystem) {
    var parsed = parseQuantityParts(quantityRaw);
    if (!parsed || !parsed.unit) return String(quantityRaw || '').trim();

    var amount = parsed.amount;
    var unit = parsed.unit;
    var tail = parsed.tail;
    var c = MEASUREMENT_CONVERSION;

    if (targetSystem === 'us') {
      if (unit === 'ml' || unit === 'l') {
        var mlValue = unit === 'l' ? amount * 1000 : amount;
        if (mlValue >= c.mlPerCup) return buildQuantityText(mlValue / c.mlPerCup, 'cup', tail);
        if (mlValue >= c.mlPerTablespoon) return buildQuantityText(mlValue / c.mlPerTablespoon, 'tbsp', tail);
        return buildQuantityText(mlValue / c.mlPerTeaspoon, 'tsp', tail);
      }
      if (unit === 'g' || unit === 'kg') {
        var gramsValue = unit === 'kg' ? amount * 1000 : amount;
        if (gramsValue >= c.gPerLb) return buildQuantityText(gramsValue / c.gPerLb, 'lb', tail);
        return buildQuantityText(gramsValue / c.gPerOz, 'oz', tail);
      }
      return String(quantityRaw || '').trim();
    }

    if (targetSystem === 'metric') {
      if (unit === 'cup' || unit === 'tbsp' || unit === 'tsp') {
        var ml = unit === 'cup'
          ? amount * c.mlPerCup
          : (unit === 'tbsp' ? amount * c.mlPerTablespoon : amount * c.mlPerTeaspoon);
        if (ml >= 1000) return buildQuantityText(ml / 1000, 'l', tail);
        return buildQuantityText(ml, 'ml', tail);
      }
      if (unit === 'oz' || unit === 'lb') {
        var grams = unit === 'lb' ? amount * c.gPerLb : amount * c.gPerOz;
        if (grams >= 1000) return buildQuantityText(grams / 1000, 'kg', tail);
        return buildQuantityText(grams, 'g', tail);
      }
      return String(quantityRaw || '').trim();
    }

    return String(quantityRaw || '').trim();
  }

  function normalizeIngredientsToUs(ingredients) {
    return (Array.isArray(ingredients) ? ingredients : []).map(function (row) {
      return {
        quantity: convertQuantityForDisplay(row && row.quantity, 'us'),
        item: String(row && row.item || '').trim(),
        category: String(row && row.category || '').trim()
      };
    });
  }

  function scaleQuantityText(quantityRaw, factor) {
    var parsed = parseQuantityParts(quantityRaw);
    if (!parsed || !parsed.unit || !Number.isFinite(factor) || factor <= 0) return String(quantityRaw || '').trim();
    return buildQuantityText(parsed.amount * factor, parsed.unit, parsed.tail);
  }

  function normalizeServingsValue(value) {
    var numeric = Number(value || 0);
    return Number.isFinite(numeric) && numeric > 0 ? Math.round(numeric) : 0;
  }

  function absoluteUrl(rawUrl, baseUrl) {
    try {
      return new URL(String(rawUrl || '').trim(), baseUrl).toString();
    } catch (_error) {
      return '';
    }
  }

  function collectPhotoUrlsFromJsonLd(doc, baseUrl) {
    var urls = [];
    Array.from(doc.querySelectorAll('script[type="application/ld+json"]')).forEach(function (node) {
      var text = String(node.textContent || '').trim();
      if (!text) return;
      var parsed;
      try {
        parsed = JSON.parse(text);
      } catch (_error) {
        return;
      }
      var entries = Array.isArray(parsed) ? parsed : [parsed];
      entries.forEach(function walk(entry) {
        if (!entry || typeof entry !== 'object') return;
        var typeValue = Array.isArray(entry['@type']) ? entry['@type'].join(' ') : String(entry['@type'] || '');
        if (/recipe/i.test(typeValue)) {
          var imageValue = entry.image;
          if (typeof imageValue === 'string') {
            var url = absoluteUrl(imageValue, baseUrl);
            if (url) urls.push(url);
          }
          if (Array.isArray(imageValue)) {
            imageValue.forEach(function (raw) {
              if (typeof raw === 'string') {
                var nestedUrl = absoluteUrl(raw, baseUrl);
                if (nestedUrl) urls.push(nestedUrl);
              } else if (raw && typeof raw.url === 'string') {
                var rawUrl = absoluteUrl(raw.url, baseUrl);
                if (rawUrl) urls.push(rawUrl);
              }
            });
          }
          if (imageValue && typeof imageValue === 'object' && typeof imageValue.url === 'string') {
            var objectUrl = absoluteUrl(imageValue.url, baseUrl);
            if (objectUrl) urls.push(objectUrl);
          }
        }
        Object.keys(entry).forEach(function (key) {
          var child = entry[key];
          if (child && typeof child === 'object') {
            if (Array.isArray(child)) child.forEach(walk);
            else walk(child);
          }
        });
      });
    });
    return urls;
  }

  function setPhotoImportDiagnostics(message, isError) {
    var root = getRoot();
    if (!root) return;
    var host = root.querySelector('#recipesPhotoImportDiagnostics');
    if (!host) return;
    host.textContent = String(message || '');
    host.classList.toggle('is-error', Boolean(isError));
  }

  function extractPhotoUrlsFromRecipeHtml(htmlText, sourceUrl) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(String(htmlText || ''), 'text/html');
    var urls = [];
    var ogUrls = [];
    var jsonLdUrls = [];
    var fallbackImgUrls = [];
    ['meta[property="og:image"]', 'meta[name="twitter:image"]', 'link[rel="image_src"]'].forEach(function (selector) {
      var node = doc.querySelector(selector);
      if (!node) return;
      var content = node.getAttribute('content') || node.getAttribute('href') || '';
      var url = absoluteUrl(content, sourceUrl);
      if (url) {
        urls.push(url);
        ogUrls.push(url);
      }
    });
    collectPhotoUrlsFromJsonLd(doc, sourceUrl).forEach(function (url) {
      urls.push(url);
      jsonLdUrls.push(url);
    });
    Array.from(doc.querySelectorAll('img[src]')).slice(0, 12).forEach(function (img) {
      var url = absoluteUrl(img.getAttribute('src') || '', sourceUrl);
      if (url) {
        urls.push(url);
        fallbackImgUrls.push(url);
      }
    });
    return {
      urls: uniqueStrings(urls),
      diagnostics: {
        ogCount: uniqueStrings(ogUrls).length,
        jsonLdCount: uniqueStrings(jsonLdUrls).length,
        fallbackImgCount: uniqueStrings(fallbackImgUrls).length
      }
    };
  }

  async function fetchRecipePhotoUrlsFromSourceUrl(sourceUrl) {
    var url = String(sourceUrl || '').trim();
    if (!url) throw new Error('Enter a valid source URL first.');
    var response = await fetch(url, { method: 'GET' });
    if (!response.ok) throw new Error('Unable to read recipe URL right now (' + response.status + ').');
    var html = await response.text();
    return extractPhotoUrlsFromRecipeHtml(html, url);
  }

  async function importPhotosFromSourceUrlIntoEditor(sourceUrl) {
    var result = await fetchRecipePhotoUrlsFromSourceUrl(sourceUrl);
    var urls = result && Array.isArray(result.urls) ? result.urls : [];
    if (!urls.length) throw new Error('No recipe photos detected from source URL.');
    var before = (state.editorPhotos || []).length;
    state.editorPhotos = uniqueStrings((state.editorPhotos || []).concat(urls));
    var after = (state.editorPhotos || []).length;
    renderEditorPhotos();
    return {
      foundCount: urls.length,
      addedCount: Math.max(0, after - before),
      diagnostics: result && result.diagnostics ? result.diagnostics : { ogCount: 0, jsonLdCount: 0, fallbackImgCount: 0 }
    };
  }

  function loadMeasurementPreference() {
    try {
      var raw = window.localStorage.getItem(MEASUREMENT_PREF_STORAGE_KEY);
      state.measurementSystem = raw === 'metric' ? 'metric' : 'us';
    } catch (_error) {
      state.measurementSystem = 'us';
    }
  }

  function saveMeasurementPreference() {
    try {
      window.localStorage.setItem(MEASUREMENT_PREF_STORAGE_KEY, state.measurementSystem === 'metric' ? 'metric' : 'us');
    } catch (_error) {}
  }

  function recipeHasIngredient(recipe, ingredientName) {
    var target = normalizeToken(ingredientName);
    if (!target) return false;
    return (recipe.ingredients || []).some(function (row) {
      var current = normalizeToken(row && row.item);
      if (!current) return false;
      return current === target || current.indexOf(target) >= 0 || target.indexOf(current) >= 0;
    });
  }

  function getIngredientImprovementSuggestions(recipe) {
    if (!recipe) return [];
    var candidates = [];
    var seen = new Set();
    var cuisineKeys = (recipe.cuisines || []).map(normalizeToken);
    var recipeSearch = normalizeToken((recipe.title || '') + ' ' + (recipe.description || ''));

    cuisineKeys.forEach(function (key) {
      (CUISINE_IMPROVEMENT_HINTS[key] || []).forEach(function (entry) {
        candidates.push(entry);
      });
    });

    RECIPE_KEYWORD_IMPROVEMENT_HINTS.forEach(function (group) {
      if (recipeSearch.indexOf(normalizeToken(group.keyword)) < 0) return;
      (group.suggestions || []).forEach(function (entry) {
        candidates.push(entry);
      });
    });

    return candidates.filter(function (entry) {
      var item = String(entry && entry.item || '').trim();
      var key = normalizeToken(item);
      if (!item || !key || seen.has(key) || recipeHasIngredient(recipe, item)) return false;
      seen.add(key);
      return true;
    }).slice(0, 10);
  }

  function applyIngredientImprovementSuggestion(itemName, quantity) {
    var recipe = getRecipeById(state.activeRecipeId);
    if (!recipe) return;
    if (recipeHasIngredient(recipe, itemName)) {
      state.recipeImprovementStatus = itemName + ' is already in this recipe.';
      renderDetails(recipe.id);
      return;
    }
    recipe.ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    recipe.ingredients.push({ quantity: String(quantity || '').trim(), item: String(itemName || '').trim(), category: 'recommended' });
    recipe.updatedAt = Date.now();
    state.showRecipeImprovements = true;
    state.recipeImprovementStatus = 'Added ' + itemName + ' to ingredients.';
    saveRecipes();
    updateSuggestionLists();
    renderCards();
    renderDetails(recipe.id);
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
    if (state.substitutionsDbMap[token]) return state.substitutionsDbMap[token].slice();
    var keys = Object.keys(state.substitutionsDbMap || {});
    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      if (token.indexOf(key) >= 0 || key.indexOf(token) >= 0) {
        return (state.substitutionsDbMap[key] || []).slice();
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

  function cookMethodConversionOptions() {
    return Object.keys(COOK_METHOD_CONVERSION_PROFILES).map(function (key) {
      return { key: key, label: COOK_METHOD_CONVERSION_PROFILES[key].label };
    });
  }

  function proteinConversionPresetOptions() {
    return Object.keys(PROTEIN_CONVERSION_PRESETS).map(function (key) {
      return { key: key, label: PROTEIN_CONVERSION_PRESETS[key].label };
    });
  }

  function proteinThicknessPresetOptions() {
    return Object.keys(PROTEIN_THICKNESS_PRESETS).map(function (key) {
      return { key: key, label: PROTEIN_THICKNESS_PRESETS[key].label };
    });
  }

  function proteinDonenessPresetOptions() {
    return Object.keys(PROTEIN_DONENESS_PRESETS).map(function (key) {
      return { key: key, label: PROTEIN_DONENESS_PRESETS[key].label };
    });
  }

  function normalizeMethodProfileKey(raw) {
    return String(raw || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }

  function inferMethodProfileKeyFromText(rawMethodText) {
    var token = normalizeMethodProfileKey(rawMethodText);
    if (!token) return '';
    if (COOK_METHOD_CONVERSION_PROFILES[token]) return token;
    if (/flat_top|griddle/.test(token)) return 'flat_top_grill';
    if (/smok|big_easy/.test(token)) return 'infrared_smoker_big_easy';
    if (/indoor_grill/.test(token)) return 'indoor_grill';
    if (/grill/.test(token)) return 'flat_top_grill';
    if (/air_fry/.test(token)) return 'air_fry_oven';
    if (/convection/.test(token)) return 'convection_oven';
    if (/oven|bake/.test(token)) return 'conventional_oven';
    if (/skillet|saute|stove|pan/.test(token)) return 'skillet_saute';
    return '';
  }

  function inferPreferredCookMethodProfile(recipe) {
    var explicit = inferMethodProfileKeyFromText(recipe && recipe.preferredCookMethodProfile);
    if (explicit) return explicit;
    var methods = Array.isArray(recipe && recipe.methods) ? recipe.methods : [];
    for (var i = 0; i < methods.length; i += 1) {
      var inferred = inferMethodProfileKeyFromText(methods[i]);
      if (inferred) return inferred;
    }
    return 'conventional_oven';
  }

  function parseMinuteRange(rawValue) {
    var value = String(rawValue || '').trim().toLowerCase().replace(/minutes?|mins?|min/g, '').trim();
    if (!value) return null;
    var range = value.match(/^(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)$/);
    if (range) {
      var min = Number(range[1]);
      var max = Number(range[2]);
      if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max <= 0) return null;
      return { min: Math.min(min, max), max: Math.max(min, max) };
    }
    var single = Number(value);
    if (!Number.isFinite(single) || single <= 0) return null;
    return { min: single, max: single };
  }

  function formatMinuteRange(range) {
    if (!range) return '';
    var min = Math.max(1, Math.round(range.min));
    var max = Math.max(1, Math.round(range.max));
    if (min === max) return String(min) + ' min';
    return String(min) + '-' + String(max) + ' min';
  }

  function renderCookMethodConversion(baseMinutesText, fromMethodKey, toMethodKey, proteinPresetKey, thicknessKey, donenessKey) {
    var parsedRange = parseMinuteRange(baseMinutesText);
    if (!parsedRange) return { ok: false, message: 'Enter minutes in a format like 12 or 12-15.' };
    var fromMeta = COOK_METHOD_CONVERSION_PROFILES[fromMethodKey];
    var toMeta = COOK_METHOD_CONVERSION_PROFILES[toMethodKey];
    if (!fromMeta || !toMeta) return { ok: false, message: 'Select both source and target methods.' };

    var proteinKey = PROTEIN_CONVERSION_PRESETS[proteinPresetKey] ? proteinPresetKey : 'none';
    var proteinPreset = PROTEIN_CONVERSION_PRESETS[proteinKey];
    var appliedThickness = PROTEIN_THICKNESS_PRESETS[thicknessKey] ? thicknessKey : 'standard';
    var allowedDoneness = proteinPreset.doneness || ['auto'];
    var appliedDoneness = allowedDoneness.indexOf(donenessKey) >= 0 ? donenessKey : 'auto';
    var thicknessMultiplier = Number(proteinPreset.thicknessMultiplier[appliedThickness] || 1);
    var donenessMultiplier = Number(proteinPreset.donenessMultiplier[appliedDoneness] || 1);
    var ratio = (toMeta.factor / fromMeta.factor) * thicknessMultiplier * donenessMultiplier;

    var converted = {
      min: parsedRange.min * ratio,
      max: parsedRange.max * ratio
    };
    var methodDistance = Math.abs(Number(fromMeta.factor || 1) - Number(toMeta.factor || 1));
    var hasKnownProfile = proteinKey !== 'none';
    var confidence = 'low';
    if (methodDistance <= 0.2 && hasKnownProfile) confidence = 'high';
    else if (methodDistance <= 0.35 || hasKnownProfile) confidence = 'medium';
    var confidenceLabel = confidence.charAt(0).toUpperCase() + confidence.slice(1);
    var message = formatMinuteRange(parsedRange) + ' on ' + fromMeta.label + ' is about ' + formatMinuteRange(converted) + ' on ' + toMeta.label + '.';
    var profileText = proteinKey === 'none'
      ? 'No protein profile selected.'
      : (proteinPreset.label + ' | ' + PROTEIN_THICKNESS_PRESETS[appliedThickness].label + ' | ' + PROTEIN_DONENESS_PRESETS[appliedDoneness].label + '.');

    return {
      ok: true,
      confidence: confidence,
      confidenceLabel: confidenceLabel,
      message: message,
      html: '<span class="recipes-confidence-badge recipes-confidence-' + confidence + '">' + confidenceLabel + ' confidence</span> ' + safeText(message) + ' <span class="recipes-help-text-inline">' + safeText(profileText) + '</span>',
      noteText: '[Cook conversion | ' + confidenceLabel + '] ' + message + ' Profile: ' + profileText
    };
  }

  function syncCookMethodDonenessPresetOptions() {
    var root = getRoot();
    if (!root) return;
    var proteinPresetSelect = root.querySelector('#recipesCookMethodProteinPreset');
    var donenessPresetSelect = root.querySelector('#recipesCookMethodDonenessPreset');
    if (!proteinPresetSelect || !donenessPresetSelect) return;

    var proteinPresetKey = PROTEIN_CONVERSION_PRESETS[proteinPresetSelect.value] ? proteinPresetSelect.value : 'none';
    var allowedDoneness = (PROTEIN_CONVERSION_PRESETS[proteinPresetKey] && PROTEIN_CONVERSION_PRESETS[proteinPresetKey].doneness) || ['auto'];
    var options = Array.from(donenessPresetSelect.options || []);
    var firstAllowed = '';
    options.forEach(function (option) {
      var isAllowed = allowedDoneness.indexOf(option.value) >= 0;
      option.hidden = !isAllowed;
      option.disabled = !isAllowed;
      if (isAllowed && !firstAllowed) firstAllowed = option.value;
    });

    if (allowedDoneness.indexOf(donenessPresetSelect.value) < 0) {
      donenessPresetSelect.value = allowedDoneness.indexOf('auto') >= 0 ? 'auto' : (firstAllowed || 'auto');
    }
  }

  function showDetailsToast(message) {
    var root = getRoot();
    if (!root) return;
    var toast = root.querySelector('#recipesDetailsToast');
    if (!toast) return;

    if (state.detailsToastTimer) {
      clearTimeout(state.detailsToastTimer);
      state.detailsToastTimer = null;
    }

    toast.textContent = String(message || '').trim() || 'Saved.';
    toast.hidden = false;
    toast.classList.add('is-visible');
    state.detailsToastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
      toast.hidden = true;
      state.detailsToastTimer = null;
    }, 1800);
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
    var normalizedSectionOverrides = Array.isArray(recipe.sectionOverrides) ? recipe.sectionOverrides : [];

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
      servings: Number(recipe.servings || 0) > 0 ? Number(recipe.servings) : 4,
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
      sectionOverrides: normalizedSectionOverrides.map(function (row) {
        return {
          id: String((row && row.id) || uid('section')),
          title: String((row && row.title) || '').trim(),
          stepRefs: String((row && row.stepRefs) || '').trim(),
          ingredientKeywords: String((row && row.ingredientKeywords) || '').trim()
        };
      }).filter(function (row) { return row.title; }),
      sourceUrl: String(recipe.sourceUrl || '').trim(),
      preferredCookMethodProfile: inferMethodProfileKeyFromText(recipe.preferredCookMethodProfile),
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

  function inferSectionTitleFromStep(stepText, index) {
    var token = normalizeToken(stepText);
    if (/marinat|brine|rub|season/.test(token)) return 'Marinate / Season';
    if (/prep|prepare|chop|slice|dice|mix|combine/.test(token)) return 'Prepare';
    if (/sauce|glaze|dressing/.test(token)) return 'Prepare Sauce';
    if (/cook|bake|grill|smoke|sear|fry|roast|broil|boil|simmer|air fry/.test(token)) return 'Cook';
    if (/rest|cool/.test(token)) return 'Rest';
    if (/serve|plate|garnish/.test(token)) return 'Serve';
    return index === 0 ? 'Prepare' : 'Cook';
  }

  function extractDurationFromSectionSteps(steps) {
    var joined = (Array.isArray(steps) ? steps : []).map(function (s) { return s.text; }).join(' ');
    var match = joined.match(/(\d+\s*(?:-|to)\s*\d+\s*(?:min|minutes|hr|hours)|\d+\s*(?:min|minutes|hr|hours))/i);
    return match ? match[1] : '';
  }

  function buildSectionedRecipeView(recipe, servingsScaleFactor) {
    var steps = Array.isArray(recipe.steps) ? recipe.steps : [];
    var sections = [];
    var manualOverrides = Array.isArray(recipe.sectionOverrides) ? recipe.sectionOverrides.filter(function (row) {
      return String(row && row.title || '').trim();
    }) : [];

    if (manualOverrides.length) {
      sections = manualOverrides.map(function (row, index) {
        var indexes = parseStepRefTokens(row.stepRefs || '');
        var stepItems = steps.map(function (stepText, stepIndex) {
          return { text: String(stepText || '').trim(), number: stepIndex + 1 };
        }).filter(function (step) {
          return indexes.size ? indexes.has(step.number) : true;
        });
        return {
          id: 'recipes-section-manual-' + index,
          title: String(row.title || '').trim(),
          steps: stepItems,
          ingredients: [],
          keywordTokens: String(row.ingredientKeywords || '').split(',').map(normalizeToken).filter(Boolean)
        };
      }).filter(function (row) { return row.steps.length || row.keywordTokens.length; });
    }

    if (!sections.length) {
      steps.forEach(function (stepText, index) {
        var title = inferSectionTitleFromStep(stepText, index);
        var section = sections.length ? sections[sections.length - 1] : null;
        if (!section || section.title !== title) {
          section = { id: 'recipes-section-' + index, title: title, steps: [], ingredients: [], keywordTokens: [] };
          sections.push(section);
        }
        section.steps.push({ text: String(stepText || '').trim(), number: index + 1 });
      });
    }
    if (!sections.length) {
      sections.push({ id: 'recipes-section-0', title: 'Steps', steps: [], ingredients: [], keywordTokens: [] });
    }

    var sectionCorpora = sections.map(function (section) {
      return normalizeToken(section.title + ' ' + section.steps.map(function (step) { return step.text; }).join(' ') + ' ' + (section.keywordTokens || []).join(' '));
    });

    (recipe.ingredients || []).forEach(function (row) {
      var ingredientName = String(row && row.item || '').trim();
      var token = normalizeToken(ingredientName);
      var bestIndex = 0;
      var bestScore = -1;
      sectionCorpora.forEach(function (corpus, sectionIndex) {
        var score = 0;
        if (token && corpus.indexOf(token) >= 0) score += 3;
        var primaryWord = token.split(' ')[0] || '';
        if (primaryWord && corpus.indexOf(primaryWord) >= 0) score += 1;
        if (score > bestScore) {
          bestScore = score;
          bestIndex = sectionIndex;
        }
      });
      var scaledQuantity = scaleQuantityText(String(row && row.quantity || '').trim(), servingsScaleFactor);
      var displayQuantity = convertQuantityForDisplay(scaledQuantity, state.measurementSystem);
      sections[bestIndex].ingredients.push({
        item: ingredientName,
        quantity: displayQuantity || String(row && row.quantity || '').trim(),
        category: String(row && row.category || '').trim()
      });
    });

    return sections;
  }

  function openIngredientSubstitutionModal(ingredientName) {
    var root = getRoot();
    if (!root) return;
    var modal = root.querySelector('#recipesIngredientSubModal');
    var title = root.querySelector('#recipesIngredientSubModalTitle');
    var body = root.querySelector('#recipesIngredientSubModalBody');
    if (!modal || !title || !body) return;
    var suggestions = resolveIngredientSubstitutions(ingredientName);
    title.textContent = ingredientName || 'Ingredient substitutions';
    body.innerHTML = suggestions.length
      ? ('<ul>' + suggestions.map(function (row) { return '<li>' + safeText(row) + '</li>'; }).join('') + '</ul>')
      : '<div class="recipes-help-text">No substitutions saved yet for this ingredient.</div>';
    modal.hidden = false;
  }

  function closeIngredientSubstitutionModal() {
    var root = getRoot();
    if (!root) return;
    var modal = root.querySelector('#recipesIngredientSubModal');
    if (modal) modal.hidden = true;
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

    if (state.activeRecipeId !== recipe.id) {
      state.showRecipeImprovements = false;
      state.recipeImprovementStatus = '';
      state.servingTarget = Number(recipe.servings || 0) > 0 ? Number(recipe.servings) : 4;
    }
    state.activeRecipeId = recipe.id;
    title.textContent = recipe.title;

    var baseServings = normalizeServingsValue(recipe.servings) || 4;
    var targetServings = normalizeServingsValue(state.servingTarget) || baseServings;
    var servingsScaleFactor = targetServings / baseServings;

    var sectionedRecipe = buildSectionedRecipeView(recipe, servingsScaleFactor);
    var sectionCardsHtml = sectionedRecipe.map(function (section, sectionIndex) {
      var leftIngredientsHtml = section.ingredients.length
        ? section.ingredients.map(function (row) {
          return '<button type="button" class="recipes-section-ingredient-item" data-section-ingredient="' + safeText(row.item) + '">'
            + '<span class="recipes-section-ingredient-dot"></span>'
            + '<span class="recipes-section-ingredient-text"><strong>' + safeText(row.quantity || '-') + '</strong> ' + safeText(row.item || '') + '</span>'
            + '</button>';
        }).join('')
        : '<div class="recipes-help-text">No ingredients mapped to this section.</div>';
      var rightStepsHtml = section.steps.length
        ? section.steps.map(function (step, stepIndex) {
          return '<div class="recipes-section-step-row"><span class="recipes-section-step-index">' + safeText(stepIndex + 1) + '</span><div>' + safeText(step.text || '') + '</div></div>';
        }).join('')
        : '<div class="recipes-help-text">No steps in this section yet.</div>';
      return '<section class="recipes-section-card" id="' + safeText(section.id) + '">'
        + '<div class="recipes-editor-subheader"><h3>' + safeText(section.title) + '</h3></div>'
        + '<div class="recipes-section-grid">'
          + '<div class="recipes-section-left">' + leftIngredientsHtml + '</div>'
          + '<div class="recipes-section-right">' + rightStepsHtml + '</div>'
        + '</div>'
        + '</section>';
    }).join('');
    var flowHtml = '<div class="recipes-flow-diagram">'
      + sectionedRecipe.map(function (section, index) {
        var duration = extractDurationFromSectionSteps(section.steps);
        return '<button type="button" class="recipes-flow-node" data-flow-target="' + safeText(section.id) + '">'
          + '<span>' + safeText(section.title) + '</span>'
          + (duration ? ('<small>' + safeText(duration) + '</small>') : '')
          + '</button>'
          + (index < sectionedRecipe.length - 1 ? '<span class="recipes-flow-link"></span>' : '');
      }).join('')
      + '</div>';
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
    var cookMethodConverterOptions = cookMethodConversionOptions();
    var proteinPresetOptions = proteinConversionPresetOptions();
    var thicknessPresetOptions = proteinThicknessPresetOptions();
    var donenessPresetOptions = proteinDonenessPresetOptions();
    var preferredCookMethodProfile = inferPreferredCookMethodProfile(recipe);
    var isEntree = normalizeCourseCategory(recipe.courseCategory) === 'entree';
    var sidePairings = isEntree ? getPairingRecommendations(recipe, 'side_dish') : [];
    var dessertPairings = isEntree ? getPairingRecommendations(recipe, 'dessert') : [];
    var similarRecipes = getSimilarRecipes(recipe);
    var variationSuggestions = getRecipeVariationSuggestions(recipe);
    var existingVariations = Array.isArray(recipe.variations) ? recipe.variations : [];
    var measurementIsMetric = state.measurementSystem === 'metric';
    var isAdvanced = isAdvancedMode();
    var improvementSuggestions = isAdvanced && state.showRecipeImprovements ? getIngredientImprovementSuggestions(recipe) : [];
    var improvementListHtml = improvementSuggestions.length
      ? improvementSuggestions.map(function (entry) {
        return '<div class="recipes-variation-card">'
          + '<div><strong>' + safeText((entry.quantity ? (entry.quantity + ' ') : '') + entry.item) + '</strong></div>'
          + '<div class="recipes-help-text">' + safeText(entry.reason || 'Suggested to improve flavor balance.') + '</div>'
          + '<button type="button" class="pill-button" data-improvement-action="approve" data-improvement-item="' + safeText(entry.item) + '" data-improvement-qty="' + safeText(entry.quantity || '') + '">Approve and add</button>'
          + '</div>';
      }).join('')
      : '<div class="recipes-help-text">No obvious missing spices/ingredients detected right now.</div>';
    var improvementStatusText = state.recipeImprovementStatus
      ? state.recipeImprovementStatus
      : (state.showRecipeImprovements
        ? 'Review each suggestion and approve one-by-one.'
        : 'Click "Recommend additions" to compare this recipe to common versions.');
    var recipeIngredientKeys = new Set((recipe.ingredients || []).map(function (row) { return normalizeIngredientName(row.item); }).filter(Boolean));
    var substitutionsForRecipe = sortSubstitutionPairs((state.substitutionsDbPairs || []).filter(function (row) {
      return recipeIngredientKeys.has(normalizeIngredientName(row.original));
    }));
    var substitutionQuery = normalizeToken(state.referenceDbFilters.substitutionsQuery || '');
    var ingredientQuery = normalizeToken(state.referenceDbFilters.ingredientQuery || '');
    var filteredSubstitutionRows = sortSubstitutionPairs((state.referenceDbFilters.substitutionsRelevantOnly ? substitutionsForRecipe : (state.substitutionsDbPairs || [])).filter(function (row) {
      if (!substitutionQuery) return true;
      var corpus = normalizeToken((row.original || '') + ' ' + (row.substitute || ''));
      return corpus.indexOf(substitutionQuery) >= 0;
    }));
    var filteredIngredientRows = uniqueIngredientRows((state.ingredientsDb || []).filter(function (row) {
      var typeFilter = String(state.referenceDbFilters.ingredientType || 'all');
      if (typeFilter !== 'all' && normalizeToken(row.type) !== normalizeToken(typeFilter)) return false;
      if (!ingredientQuery) return true;
      return normalizeToken((row.name || '') + ' ' + (row.type || '')).indexOf(ingredientQuery) >= 0;
    }));
    var substitutionRows = filteredSubstitutionRows.slice(0, 120);
    var ingredientRows = filteredIngredientRows.slice(0, 120);
    var substitutionsForRecipeHtml = substitutionsForRecipe.length
      ? substitutionsForRecipe.map(function (row) {
        var key = substitutionPairKey(row.original, row.substitute);
        return '<div class="recipes-ref-row" data-sub-pair-key="' + safeText(key) + '">'
          + '<input type="text" data-sub-field="original" value="' + safeText(row.original) + '">'
          + '<input type="text" data-sub-field="substitute" value="' + safeText(row.substitute) + '">'
          + '<button type="button" class="pill-button" data-sub-action="save" data-sub-pair-key="' + safeText(key) + '">Save</button>'
          + '<button type="button" class="pill-button" data-sub-action="delete" data-sub-pair-key="' + safeText(key) + '">Delete</button>'
          + '</div>';
      }).join('')
      : '<div class="recipes-help-text">No substitution rows currently linked to this recipe.</div>';
    var substitutionRowsHtml = substitutionRows.length
      ? substitutionRows.map(function (row) {
        var key = substitutionPairKey(row.original, row.substitute);
        return '<div class="recipes-ref-row" data-sub-pair-key="' + safeText(key) + '">'
          + '<input type="text" data-sub-field="original" value="' + safeText(row.original) + '">'
          + '<input type="text" data-sub-field="substitute" value="' + safeText(row.substitute) + '">'
          + '<button type="button" class="pill-button" data-sub-action="save" data-sub-pair-key="' + safeText(key) + '">Save</button>'
          + '<button type="button" class="pill-button" data-sub-action="delete" data-sub-pair-key="' + safeText(key) + '">Delete</button>'
          + '</div>';
      }).join('')
      : '<div class="recipes-help-text">No substitutions in database yet.</div>';
    var ingredientRowsHtml = ingredientRows.length
      ? ingredientRows.map(function (row) {
        var key = ingredientRowKey(row.name);
        return '<div class="recipes-ref-row" data-ingredient-row-key="' + safeText(key) + '">'
          + '<input type="text" data-ingredient-field="name" value="' + safeText(row.name) + '">'
          + '<input type="text" data-ingredient-field="type" value="' + safeText(row.type) + '">'
          + '<button type="button" class="pill-button" data-ingredient-action="save" data-ingredient-row-key="' + safeText(key) + '">Save</button>'
          + '<button type="button" class="pill-button" data-ingredient-action="delete" data-ingredient-row-key="' + safeText(key) + '">Delete</button>'
          + '</div>';
      }).join('')
      : '<div class="recipes-help-text">No ingredients in database yet.</div>';

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
      '<p><strong>Source URL:</strong> ' + (recipe.sourceUrl ? ('<a href="' + safeText(recipe.sourceUrl) + '" target="_blank" rel="noopener noreferrer">' + safeText(recipe.sourceUrl) + '</a>') : 'Not set') + '</p>' +
      '<p><strong>Prep:</strong> ' + safeText(recipe.prepMinutes || '-') + ' min | <strong>Cook:</strong> ' + safeText(recipe.cookMinutes || '-') + ' min</p>' +
      '<section class="recipes-substitutions">' +
        '<div class="recipes-editor-subheader"><h3>Servings</h3></div>' +
        '<div class="recipes-inline-input-row">' +
          '<label>Base servings<input id="recipesServingsBase" type="number" min="1" step="1" value="' + safeText(baseServings) + '" disabled></label>' +
          '<label>Target servings<input id="recipesServingsTarget" type="number" min="1" step="1" value="' + safeText(targetServings) + '"></label>' +
          '<button type="button" class="pill-button" id="recipesApplyServingsBtn">Adjust quantities</button>' +
          '<button type="button" class="pill-button" id="recipesSaveScaledServingsBtn">Save scaled quantities</button>' +
        '</div>' +
        '<div class="recipes-help-text">Ingredient quantities shown below are scaled by ' + safeText(formatNumber(servingsScaleFactor, 2)) + 'x.</div>' +
      '</section>' +
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
          '<button type="button" class="pill-button" id="recipesShowAllSubsBtn">Show substitutions for all ingredients</button>' +
        '</div>' +
        '<div id="recipesSubstitutionsResult" class="recipes-help-text">Select an ingredient and click "Find substitutions".</div>' +
        '<div id="recipesSubstitutionsMatrix" class="recipes-variation-list"></div>' +
      '</section>' +
      '<section class="recipes-substitutions">' +
        '<div class="recipes-editor-subheader"><h3>Reference database manager</h3></div>' +
        '<div class="recipes-help-text">Edit substitutions and ingredient types in-app, then push both tables to Excel in one click.</div>' +
        '<div class="recipes-inline-input-row" style="margin-bottom:6px;">' +
          '<button type="button" class="pill-button" id="recipesPushReferenceDbBtn">Push substitutions + ingredients DB to Excel</button>' +
          '<button type="button" class="pill-button" id="recipesScanIngredientsDbBtn">Scan all recipes and add missing ingredients</button>' +
        '</div>' +
        '<div class="recipes-inline-input-row" style="margin-bottom:6px;">' +
          '<label><input type="checkbox" id="recipesSubsRelevantOnlyToggle" ' + (state.referenceDbFilters.substitutionsRelevantOnly ? 'checked' : '') + '> Only substitutions relevant to this recipe</label>' +
          '<label>Substitutions search<input id="recipesSubsSearchInput" type="search" placeholder="Filter substitutions" value="' + safeText(state.referenceDbFilters.substitutionsQuery || '') + '"></label>' +
        '</div>' +
        '<div class="recipes-inline-input-row" style="margin-bottom:6px;">' +
          '<label>Ingredient type filter<select id="recipesIngredientTypeFilter"><option value="all"' + (state.referenceDbFilters.ingredientType === 'all' ? ' selected' : '') + '>All</option><option value="spice"' + (state.referenceDbFilters.ingredientType === 'spice' ? ' selected' : '') + '>Spice</option><option value="protein"' + (state.referenceDbFilters.ingredientType === 'protein' ? ' selected' : '') + '>Protein</option><option value="sauce"' + (state.referenceDbFilters.ingredientType === 'sauce' ? ' selected' : '') + '>Sauce</option><option value="grain"' + (state.referenceDbFilters.ingredientType === 'grain' ? ' selected' : '') + '>Grain</option><option value="produce"' + (state.referenceDbFilters.ingredientType === 'produce' ? ' selected' : '') + '>Produce</option><option value="other"' + (state.referenceDbFilters.ingredientType === 'other' ? ' selected' : '') + '>Other</option></select></label>' +
          '<label>Ingredients search<input id="recipesIngredientsSearchInput" type="search" placeholder="Filter ingredients DB" value="' + safeText(state.referenceDbFilters.ingredientQuery || '') + '"></label>' +
        '</div>' +
        '<div id="recipesReferenceDbStatus" class="recipes-help-text">' + safeText(state.referenceDbStatus || 'No pending reference database actions.') + '</div>' +
        '<div class="recipes-editor-subheader"><h3>Add substitution row</h3></div>' +
        '<div class="recipes-ref-row">'
          + '<input type="text" id="recipesSubsAddOriginal" placeholder="Original ingredient">'
          + '<input type="text" id="recipesSubsAddSubstitute" placeholder="Substitute ingredient">'
          + '<button type="button" class="pill-button" id="recipesSubsAddBtn">Add substitution</button>'
          + '</div>' +
        '<div class="recipes-editor-subheader"><h3>Substitutions matching this recipe (' + substitutionsForRecipe.length + ')</h3></div>' +
        '<div class="recipes-ref-list">' + substitutionsForRecipeHtml + '</div>' +
        '<div class="recipes-editor-subheader"><h3>All substitutions (showing up to 120 of ' + filteredSubstitutionRows.length + ' filtered rows)</h3></div>' +
        '<div class="recipes-ref-list">' + substitutionRowsHtml + '</div>' +
        '<div class="recipes-editor-subheader"><h3>Add ingredient row</h3></div>' +
        '<div class="recipes-ref-row">'
          + '<input type="text" id="recipesIngredientsDbAddName" placeholder="Ingredient name">'
          + '<input type="text" id="recipesIngredientsDbAddType" placeholder="Ingredient type (e.g., spice, protein)">'
          + '<button type="button" class="pill-button" id="recipesIngredientsDbAddBtn">Add ingredient</button>'
          + '</div>' +
        '<div class="recipes-editor-subheader"><h3>Ingredients DB (showing up to 120 of ' + filteredIngredientRows.length + ' filtered rows)</h3></div>' +
        '<div class="recipes-ref-list">' + ingredientRowsHtml + '</div>' +
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
      '<section class="recipes-substitutions">' +
        '<div class="recipes-editor-subheader"><h3>Cook method time converter</h3></div>' +
        '<div class="recipes-inline-input-row">' +
          '<label>Preferred method profile<select id="recipesPreferredCookMethodSelect">'
            + cookMethodConverterOptions.map(function (item) { return '<option value="' + safeText(item.key) + '"' + (item.key === preferredCookMethodProfile ? ' selected' : '') + '>' + safeText(item.label) + '</option>'; }).join('')
          + '</select></label>' +
          '<button type="button" class="pill-button" id="recipesSavePreferredCookMethodBtn">Save preferred profile</button>' +
        '</div>' +
        '<div class="recipes-inline-input-row">' +
          '<label>Base time<input id="recipesCookMethodBaseTime" type="text" placeholder="12 or 12-15"></label>' +
          '<button type="button" class="pill-button" id="recipesUseRecipeCookTimeBtn">Use recipe cook time</button>' +
          '<label>From method<select id="recipesCookMethodFromSelect">'
            + cookMethodConverterOptions.map(function (item) { return '<option value="' + safeText(item.key) + '"' + (item.key === preferredCookMethodProfile ? ' selected' : '') + '>' + safeText(item.label) + '</option>'; }).join('')
          + '</select></label>' +
          '<label>To method<select id="recipesCookMethodToSelect">'
            + cookMethodConverterOptions.map(function (item, index) { return '<option value="' + safeText(item.key) + '"' + (item.key === 'air_fry_oven' ? ' selected' : '') + '>' + safeText(item.label) + '</option>'; }).join('')
          + '</select></label>' +
          '<label>Protein<select id="recipesCookMethodProteinPreset">'
            + proteinPresetOptions.map(function (item) { return '<option value="' + safeText(item.key) + '">' + safeText(item.label) + '</option>'; }).join('')
          + '</select></label>' +
          '<label>Thickness<select id="recipesCookMethodThicknessPreset">'
            + thicknessPresetOptions.map(function (item) { return '<option value="' + safeText(item.key) + '"' + (item.key === 'standard' ? ' selected' : '') + '>' + safeText(item.label) + '</option>'; }).join('')
          + '</select></label>' +
          '<label>Doneness<select id="recipesCookMethodDonenessPreset">'
            + donenessPresetOptions.map(function (item) { return '<option value="' + safeText(item.key) + '">' + safeText(item.label) + '</option>'; }).join('')
          + '</select></label>' +
          '<button type="button" class="pill-button" id="recipesConvertCookMethodBtn">Convert time</button>' +
          '<button type="button" class="pill-button" id="recipesSaveCookConversionNoteBtn">Save conversion as recipe note</button>' +
        '</div>' +
        '<div id="recipesCookMethodConvertResult" class="recipes-help-text">Enter a base time and click "Convert time".</div>' +
      '</section>' +
      '<section class="recipes-substitutions">' +
        '<div class="recipes-editor-subheader"><h3>Ingredient measurement view</h3></div>' +
        '<label class="recipes-safe-temp-mode-toggle"><input type="checkbox" id="recipesMeasurementToggle" ' + (measurementIsMetric ? 'checked' : '') + '> Show metric values (toggle off for US standard values)</label>' +
      '</section>' +
      (isAdvanced
        ? ('<section class="recipes-recommendations">' +
            '<div class="recipes-editor-subheader"><h3>Recipe improvement suggestions</h3></div>' +
            '<div class="recipes-inline-input-row"><button type="button" class="pill-button" id="recipesRecommendImprovementsBtn">Recommend additions</button></div>' +
            '<div id="recipesImprovementStatus" class="recipes-help-text">' + safeText(improvementStatusText) + '</div>' +
            (state.showRecipeImprovements ? ('<div id="recipesImprovementList" class="recipes-variation-list">' + improvementListHtml + '</div>') : '') +
          '</section>')
        : '') +
      '<div class="recipes-editor-subheader"><h3>Recipe sections</h3></div>' +
      '<div class="recipes-help-text">Ingredients are shown on the left and related steps on the right. Click an ingredient to view substitutions.</div>' +
      '<div class="recipes-inline-input-row" style="margin-bottom:6px;"><button type="button" class="pill-button" id="recipesExportSectionedGroceryBtn">Export grocery list by section (Prepare/Cook/Sauce)</button></div>' +
      '<div class="recipes-section-list">' + sectionCardsHtml + '</div>' +
      '<div class="recipes-editor-subheader"><h3>Section flow</h3></div>' +
      flowHtml +
      '<div id="recipesIngredientSubModal" class="recipes-sub-modal" hidden>' +
        '<div class="recipes-sub-modal-card">' +
          '<div class="recipes-editor-subheader"><h3 id="recipesIngredientSubModalTitle">Ingredient substitutions</h3><button type="button" class="pill-button" id="recipesIngredientSubModalClose">Close</button></div>' +
          '<div id="recipesIngredientSubModalBody" class="recipes-help-text"></div>' +
        '</div>' +
      '</div>' +
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
      '<div class="recipes-editor-subheader"><h3>Notes</h3><button type="button" class="pill-button" id="recipesAddNoteBtn">+ Note</button></div>' +
      '<div id="recipesDetailsToast" class="recipes-detail-toast" hidden></div>' +
      '<div id="recipesNotesList">' + noteRows + '</div>' +
      '<div class="recipes-inline-input-row" style="margin-top:8px;"><button type="button" class="pill-button" id="recipesEditActiveBtn">Edit recipe</button></div>';

    details.hidden = false;
    syncCommonCookTimeControls();
    syncCookMethodDonenessPresetOptions();
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

  function showAllIngredientSubstitutionsForActiveRecipe() {
    var root = getRoot();
    if (!root) return;
    var recipe = getRecipeById(state.activeRecipeId);
    if (!recipe) return;
    var output = root.querySelector('#recipesSubstitutionsMatrix');
    if (!output) return;
    var ingredients = ingredientNamesFromRecipe(recipe);
    if (!ingredients.length) {
      output.innerHTML = '<div class="recipes-help-text">No ingredients to scan for substitutions yet.</div>';
      return;
    }
    output.innerHTML = ingredients.map(function (name) {
      var suggestions = resolveIngredientSubstitutions(name);
      return '<div class="recipes-variation-card">'
        + '<strong>' + safeText(name) + '</strong>'
        + '<div class="recipes-help-text">'
        + safeText(suggestions.length ? suggestions.join(', ') : 'No substitutions in database yet.')
        + '</div>'
        + '</div>';
    }).join('');
  }

  function collectAllRecipeIngredientRows() {
    var rows = [];
    state.recipes.forEach(function (recipe) {
      (recipe.ingredients || []).forEach(function (row) {
        var name = String(row && row.item || '').trim();
        if (!name) return;
        rows.push({ name: name, type: createIngredientType(name) });
      });
    });
    return uniqueIngredientRows(rows);
  }

  function mergeIngredientsDatabase(newRows) {
    state.ingredientsDb = uniqueIngredientRows((state.ingredientsDb || []).concat(newRows || []));
    saveReferenceDatabasesToCache();
  }

  async function scanRecipesIntoIngredientsDatabase() {
    var allRows = collectAllRecipeIngredientRows();
    var existingKeys = new Set((state.ingredientsDb || []).map(function (row) { return normalizeIngredientName(row.name); }));
    var missingRows = allRows.filter(function (row) { return !existingKeys.has(normalizeIngredientName(row.name)); });
    if (!missingRows.length) return { addedCount: 0, wroteExcel: false };

    mergeIngredientsDatabase(missingRows);

    var wroteExcel;
    try {
      await writeIngredientsToExcel();
      wroteExcel = true;
    } catch (_error) {
      wroteExcel = false;
    }
    return { addedCount: missingRows.length, wroteExcel: wroteExcel };
  }

  function setServingTargetForActiveRecipe(nextServings) {
    var recipe = getRecipeById(state.activeRecipeId);
    if (!recipe) return false;
    var base = normalizeServingsValue(recipe.servings) || 4;
    var target = normalizeServingsValue(nextServings) || base;
    state.servingTarget = target;
    renderDetails(recipe.id);
    return true;
  }

  function saveScaledIngredientsForActiveRecipe(nextServings) {
    var recipe = getRecipeById(state.activeRecipeId);
    if (!recipe) return false;
    var base = normalizeServingsValue(recipe.servings) || 4;
    var target = normalizeServingsValue(nextServings) || base;
    var factor = target / base;
    recipe.ingredients = (recipe.ingredients || []).map(function (row) {
      return {
        quantity: scaleQuantityText(row && row.quantity, factor),
        item: String(row && row.item || '').trim(),
        category: String(row && row.category || '').trim()
      };
    });
    recipe.servings = target;
    recipe.updatedAt = Date.now();
    state.servingTarget = target;
    saveRecipes();
    renderCards();
    renderDetails(recipe.id);
    return true;
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

  function showCookMethodConversionForSelection() {
    var root = getRoot();
    if (!root) return;
    var baseInput = root.querySelector('#recipesCookMethodBaseTime');
    var fromSelect = root.querySelector('#recipesCookMethodFromSelect');
    var toSelect = root.querySelector('#recipesCookMethodToSelect');
    var proteinPresetSelect = root.querySelector('#recipesCookMethodProteinPreset');
    var thicknessPresetSelect = root.querySelector('#recipesCookMethodThicknessPreset');
    var donenessPresetSelect = root.querySelector('#recipesCookMethodDonenessPreset');
    var output = root.querySelector('#recipesCookMethodConvertResult');
    if (!baseInput || !fromSelect || !toSelect || !proteinPresetSelect || !thicknessPresetSelect || !donenessPresetSelect || !output) return;
    syncCookMethodDonenessPresetOptions();
    var conversion = renderCookMethodConversion(
      baseInput.value,
      fromSelect.value,
      toSelect.value,
      proteinPresetSelect.value,
      thicknessPresetSelect.value,
      donenessPresetSelect.value
    );
    state.lastCookMethodConversion = conversion && conversion.ok ? conversion : null;
    output.innerHTML = conversion && conversion.ok ? conversion.html : safeText(conversion ? conversion.message : 'Unable to convert time.');
  }

  function saveCookMethodConversionAsRecipeNote() {
    var recipe = getRecipeById(state.activeRecipeId);
    if (!recipe) return;
    var root = getRoot();
    if (!root) return;
    var output = root.querySelector('#recipesCookMethodConvertResult');
    if (!state.lastCookMethodConversion || !state.lastCookMethodConversion.ok) {
      if (output) output.textContent = 'Run a conversion first, then save it as a note.';
      return;
    }
    recipe.notes = Array.isArray(recipe.notes) ? recipe.notes : [];
    recipe.notes.push({ id: uid('note'), text: state.lastCookMethodConversion.noteText });
    recipe.updatedAt = Date.now();
    saveRecipes();
    renderDetails(recipe.id);
    showDetailsToast('Last saved conversion note added.');
  }

  function savePreferredCookMethodForActiveRecipe(preferredMethodKey) {
    var recipe = getRecipeById(state.activeRecipeId);
    if (!recipe) return;
    var normalizedKey = COOK_METHOD_CONVERSION_PROFILES[preferredMethodKey] ? preferredMethodKey : inferPreferredCookMethodProfile(recipe);
    recipe.preferredCookMethodProfile = normalizedKey;
    recipe.updatedAt = Date.now();
    saveRecipes();
    renderCards();
    renderDetails(recipe.id);
  }

  function exportSectionedGroceryListForActiveRecipe() {
    var recipe = getRecipeById(state.activeRecipeId);
    if (!recipe) return;
    var baseServings = normalizeServingsValue(recipe.servings) || 4;
    var targetServings = normalizeServingsValue(state.servingTarget) || baseServings;
    var sections = buildSectionedRecipeView(recipe, targetServings / baseServings);
    var lines = ['Recipe: ' + recipe.title, 'Servings: ' + targetServings, ''];
    sections.forEach(function (section) {
      if (!section.ingredients.length) return;
      lines.push(section.title + ':');
      section.ingredients.forEach(function (row) {
        var line = '- ' + (row.quantity ? (String(row.quantity).trim() + ' ') : '') + String(row.item || '').trim();
        lines.push(line.trim());
      });
      lines.push('');
    });
    var content = lines.join('\n').trim() + '\n';
    var blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    var slug = String(recipe.title || 'recipe').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    link.href = url;
    link.download = (slug || 'recipe') + '-grocery-by-section.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function preloadCookMethodBaseTimeFromActiveRecipe() {
    var root = getRoot();
    if (!root) return;
    var recipe = getRecipeById(state.activeRecipeId);
    var baseInput = root.querySelector('#recipesCookMethodBaseTime');
    var output = root.querySelector('#recipesCookMethodConvertResult');
    if (!baseInput || !output) return;
    var cookMinutes = recipe ? Number(recipe.cookMinutes || 0) : 0;
    if (!Number.isFinite(cookMinutes) || cookMinutes <= 0) {
      output.textContent = 'This recipe does not have a saved cook time yet. Set cook minutes first, then try again.';
      return;
    }
    baseInput.value = String(Math.round(cookMinutes));
    showCookMethodConversionForSelection();
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
      servings: 4,
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
      servings: 4,
      proteins: inferFromOptions(text, PROTEIN_OPTIONS),
      cuisines: inferFromOptions(text, CUISINE_OPTIONS),
      methods: inferFromOptions(text, METHOD_OPTIONS),
      prepMinutes: parseTimeFromText(text, 'prep'),
      cookMinutes: parseTimeFromText(text, 'cook'),
      ingredients: ingredients.length ? ingredients : [{ quantity: '', item: '' }],
      steps: steps.length ? steps : ['']
    });
  }

  async function ensurePdfJsLoaded() {
    if (window.pdfjsLib && typeof window.pdfjsLib.getDocument === 'function') return window.pdfjsLib;
    var module = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/pdf.min.mjs');
    var pdfjsLib = module && module.default ? module.default : module;
    if (!pdfjsLib || typeof pdfjsLib.getDocument !== 'function') {
      throw new Error('PDF parser library failed to load.');
    }
    if (pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/pdf.worker.min.mjs';
    }
    window.pdfjsLib = pdfjsLib;
    return pdfjsLib;
  }

  function normalizePdfLine(line) {
    return String(line || '')
      .replace(/\s+/g, ' ')
      .replace(/(\d)\s*\/\s*(\d)/g, '$1/$2')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .replace(/\s+([,.;:!?])/g, '$1')
      .trim();
  }

  function composePdfRowText(chunks) {
    return (chunks || []).map(function (chunk) {
      return normalizePdfLine(chunk && chunk.text || '');
    }).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  }

  function buildPdfRowsFromItems(items, splitX) {
    var byY = {};
    (items || []).forEach(function (item) {
      var transform = item && item.transform ? item.transform : null;
      var x = transform ? Number(transform[4]) : 0;
      var y = transform ? Number(transform[5]) : 0;
      var bucket = Math.round(y / 2) * 2;
      byY[bucket] = byY[bucket] || [];
      byY[bucket].push({
        x: x,
        y: y,
        h: Number(item && item.height || 0),
        text: String(item && item.str || '').trim()
      });
    });

    return Object.keys(byY).map(function (key) {
      var chunks = byY[key].slice().sort(function (a, b) { return a.x - b.x; });
      var left = chunks.filter(function (chunk) { return chunk.x < splitX; });
      var right = chunks.filter(function (chunk) { return chunk.x >= splitX; });
      var maxHeight = chunks.reduce(function (acc, chunk) { return Math.max(acc, Number(chunk.h || 0)); }, 0);
      return {
        y: Number(key),
        maxHeight: maxHeight,
        left: composePdfRowText(left),
        right: composePdfRowText(right),
        full: composePdfRowText(chunks)
      };
    }).sort(function (a, b) { return b.y - a.y; }).filter(function (row) {
      return row.left || row.right || row.full;
    });
  }

  function splitInlineStepText(line) {
    var text = normalizePdfLine(line);
    if (!text) return [];
    var starts = [];
    var regex = /\d{1,2}[).]?\s+[A-Za-z]/g;
    var match;
    while ((match = regex.exec(text))) {
      var index = match.index;
      if (index === 0 || /[.;:!?]\s*$/.test(text.slice(0, index))) starts.push(index);
    }
    if (starts.length <= 1) return [text];
    starts.push(text.length);
    return starts.slice(0, -1).map(function (start, idx) {
      return normalizePdfLine(text.slice(start, starts[idx + 1]));
    }).filter(Boolean);
  }

  function parsePdfStepsFromLines(lines) {
    var steps = [];
    var current = '';
    var pendingNumber = '';
    (lines || []).forEach(function (line) {
      splitInlineStepText(line).forEach(function (pieceRaw) {
        var piece = normalizePdfLine(pieceRaw);
        if (!piece) return;
        if (/^\d{1,2}$/.test(piece)) {
          pendingNumber = piece;
          return;
        }
        var numbered = piece.match(/^\d{1,2}[).]?\s+(.+)$/);
        if (numbered) {
          if (current) steps.push(current);
          current = normalizePdfLine(numbered[1]);
          pendingNumber = '';
          return;
        }
        if (pendingNumber) {
          if (current) steps.push(current);
          current = piece;
          pendingNumber = '';
          return;
        }
        current = current ? normalizePdfLine(current + ' ' + piece) : piece;
      });
    });
    if (current) steps.push(current);
    return steps.filter(Boolean);
  }

  function pickPdfTitleFromRows(rows, fallbackTitle) {
    var topRows = (rows || []).slice(0, 24).filter(function (row) {
      if (!row || !row.full) return false;
      if (/^\d+$/.test(row.full)) return false;
      if (detectPdfSectionHeading(row.full)) return false;
      return row.full.length >= 4;
    });
    if (!topRows.length) return String(fallbackTitle || 'Imported Recipe PDF').trim();
    topRows.sort(function (a, b) {
      if ((b.maxHeight || 0) !== (a.maxHeight || 0)) return (b.maxHeight || 0) - (a.maxHeight || 0);
      return (String(a.full || '').length - String(b.full || '').length);
    });
    return String(topRows[0].full || fallbackTitle || 'Imported Recipe PDF').trim();
  }

  function parseRecipeFromPdfRows(rows, fallbackTitle) {
    if (!rows || !rows.length) return null;
    var title = pickPdfTitleFromRows(rows, fallbackTitle);
    var sectionAnchors = [];
    rows.forEach(function (row, index) {
      var heading = detectPdfSectionHeading(row.left || '');
      if (!heading) return;
      sectionAnchors.push({ index: index, title: heading });
    });
    if (!sectionAnchors.length) return null;

    var sections = sectionAnchors.map(function (anchor, idx) {
      var endIndex = idx + 1 < sectionAnchors.length ? sectionAnchors[idx + 1].index : rows.length;
      var windowRows = rows.slice(anchor.index + 1, endIndex);
      var ingredients = [];
      var leftLines = windowRows.map(function (row) { return normalizePdfLine(row.left || ''); }).filter(Boolean);
      leftLines.forEach(function (line) {
        if (detectPdfSectionHeading(line)) return;
        var ingredient = parseIngredientLine(line);
        if (!ingredient) return;
        var previous = ingredients.length ? ingredients[ingredients.length - 1] : null;
        var continuesPrev = previous && !/^\d/.test(line) && ingredient.quantity === '';
        if (continuesPrev) {
          previous.item = normalizePdfLine(previous.item + ' ' + ingredient.item);
        } else {
          ingredients.push(ingredient);
        }
      });

      var rightLines = windowRows.map(function (row) { return normalizePdfLine(row.right || ''); }).filter(Boolean);
      var steps = parsePdfStepsFromLines(rightLines);
      if (!steps.length) {
        var fallbackStepLines = windowRows.map(function (row) { return normalizePdfLine(row.full || ''); }).filter(function (line) {
          return /^\d{1,2}[).]?\s+/.test(line);
        });
        steps = parsePdfStepsFromLines(fallbackStepLines);
      }

      return {
        title: anchor.title,
        ingredients: ingredients,
        steps: steps
      };
    }).filter(function (section) {
      return section.ingredients.length || section.steps.length;
    });

    if (!sections.length) return null;

    var flatIngredients = [];
    var flatSteps = [];
    var sectionOverrides = [];
    sections.forEach(function (section) {
      var start = flatSteps.length + 1;
      (section.steps || []).forEach(function (step) { flatSteps.push(step); });
      var end = flatSteps.length;
      (section.ingredients || []).forEach(function (row) { flatIngredients.push(row); });
      sectionOverrides.push({
        id: uid('section'),
        title: section.title,
        stepRefs: section.steps.length ? (start + '-' + end) : '',
        ingredientKeywords: section.ingredients.map(function (row) { return row.item; }).slice(0, 5).join(', ')
      });
    });

    var aggregateText = rows.map(function (row) { return row.full; }).join(' ');
    var model = normalizeRecipe({
      title: title,
      description: 'Imported from PDF. Review and save.',
      servings: 4,
      proteins: inferFromOptions(aggregateText, PROTEIN_OPTIONS),
      cuisines: inferFromOptions(aggregateText, CUISINE_OPTIONS),
      methods: inferFromOptions(aggregateText, METHOD_OPTIONS),
      prepMinutes: parseTimeFromText(aggregateText, 'prep'),
      cookMinutes: parseTimeFromText(aggregateText, 'cook'),
      ingredients: flatIngredients.length ? flatIngredients : [{ quantity: '', item: '' }],
      steps: flatSteps.length ? flatSteps : [''],
      sectionOverrides: sectionOverrides
    });
    var sectionPreviewLines = sectionOverrides.map(function (section, idx) {
      return (idx + 1) + '. ' + section.title + ' | steps: ' + (section.stepRefs || 'all') + ' | ingredient keywords: ' + (section.ingredientKeywords || 'none');
    }).join('\n');
    var previewText = [
      'Detected title: ' + title,
      '---',
      'Detected section boundaries:',
      sectionPreviewLines,
      '---',
      'Column-aware extracted PDF text (first 220 rows):',
      rows.slice(0, 220).map(function (row) {
        return [row.left || '', row.right ? (' || ' + row.right) : ''].join('');
      }).join('\n')
    ].join('\n');
    return {
      model: model,
      previewText: previewText,
      diagnostics: {
        parseMode: 'column_aware',
        sectionCount: sections.length,
        totalLineCount: rows.length,
        leftLineCount: rows.filter(function (row) { return Boolean(String(row.left || '').trim()); }).length,
        rightLineCount: rows.filter(function (row) { return Boolean(String(row.right || '').trim()); }).length,
        usedFallback: false
      },
      suggestedSections: sectionOverrides.map(function (section) {
        return {
          id: section.id,
          title: section.title,
          stepRefs: section.stepRefs,
          ingredientKeywords: section.ingredientKeywords,
          accepted: true
        };
      })
    };
  }

  function parseIngredientLine(line) {
    var cleaned = normalizePdfLine(line);
    if (!cleaned) return null;
    var quantityMatch = cleaned.match(/^([\d./]+(?:\s+[\d./]+)?\s*(?:cups?|cup|tbsp|tablespoons?|tsp|teaspoons?|oz|ounces?|lb|lbs|pounds?|g|kg|ml|l|cloves?|cans?|can|head|sprigs?|bunch|pinch|dash|drizzle)?)\s+(.+)$/i);
    if (quantityMatch) {
      return { quantity: quantityMatch[1].trim(), item: quantityMatch[2].trim() };
    }
    return { quantity: '', item: cleaned };
  }

  function detectPdfSectionHeading(line) {
    var cleaned = normalizePdfLine(line);
    if (!cleaned) return '';
    var numbered = cleaned.match(/^(\d+)\s+([A-Za-z].+)$/);
    if (numbered && !/^(\d+)\s+(cups?|tbsp|tsp|oz|lb|lbs|g|kg|ml|l)\b/i.test(cleaned)) {
      return numbered[2].trim();
    }
    var plain = cleaned.match(/^(prepare|cook|make|assemble|serve|rest|marinate|sauce|toppings?)\b[:\-]?\s*(.*)$/i);
    if (plain) {
      var tail = String(plain[2] || '').trim();
      return (plain[1] + (tail ? (' ' + tail) : '')).replace(/\s+/g, ' ').trim();
    }
    var token = normalizeToken(cleaned);
    if (/\bprepare\b|\bcook\b|\bserve\b|\bmarinate\b|\bsauce\b|\btoppings?\b/.test(token) && cleaned.length <= 60) {
      return cleaned;
    }
    return '';
  }

  function parseRecipeFromPdfText(rawText, fallbackTitle) {
    var lines = String(rawText || '').split(/\r?\n/).map(normalizePdfLine).filter(Boolean);
    if (!lines.length) throw new Error('Unable to extract text from PDF.');

    var title = lines.find(function (line) {
      var token = normalizeToken(line);
      if (!token) return false;
      if (/kchavez s cookbook|cookbook/.test(token)) return false;
      if (/^\d+$/.test(line)) return false;
      return true;
    }) || String(fallbackTitle || 'Imported Recipe PDF').trim();

    var sections = [];
    var current = null;
    lines.forEach(function (line) {
      var detectedHeading = detectPdfSectionHeading(line);
      if (detectedHeading) {
        current = { title: detectedHeading, ingredients: [], steps: [] };
        sections.push(current);
        return;
      }
      if (!current) return;
      var stepMatch = line.match(/^(\d+)\s+(.+)$/);
      if (stepMatch) {
        current.steps.push(stepMatch[2].trim());
        return;
      }
      if (!current.steps.length) {
        var ingredient = parseIngredientLine(line);
        if (!ingredient) return;
        var previousIngredient = current.ingredients.length ? current.ingredients[current.ingredients.length - 1] : null;
        var looksLikeContinuation = previousIngredient && !parseIngredientLine(previousIngredient.item).quantity && !/^\d/.test(line);
        if (looksLikeContinuation && ingredient.quantity === '') {
          previousIngredient.item = (previousIngredient.item + ' ' + ingredient.item).trim();
        } else {
          current.ingredients.push(ingredient);
        }
      } else {
        var lastStepIndex = current.steps.length - 1;
        current.steps[lastStepIndex] = (current.steps[lastStepIndex] + ' ' + line).trim();
      }
    });

    var flatIngredients = [];
    var flatSteps = [];
    var sectionOverrides = [];
    sections.forEach(function (section) {
      var start = flatSteps.length + 1;
      (section.steps || []).forEach(function (step) { flatSteps.push(step); });
      var end = flatSteps.length;
      (section.ingredients || []).forEach(function (row) { flatIngredients.push(row); });
      if (section.steps.length || section.ingredients.length) {
        sectionOverrides.push({
          id: uid('section'),
          title: section.title,
          stepRefs: section.steps.length ? (start + '-' + end) : '',
          ingredientKeywords: section.ingredients.map(function (row) { return row.item; }).slice(0, 5).join(', ')
        });
      }
    });

    var aggregateText = lines.join(' ');
    var model = normalizeRecipe({
      title: title,
      description: 'Imported from PDF. Review and save.',
      servings: 4,
      proteins: inferFromOptions(aggregateText, PROTEIN_OPTIONS),
      cuisines: inferFromOptions(aggregateText, CUISINE_OPTIONS),
      methods: inferFromOptions(aggregateText, METHOD_OPTIONS),
      prepMinutes: parseTimeFromText(aggregateText, 'prep'),
      cookMinutes: parseTimeFromText(aggregateText, 'cook'),
      ingredients: flatIngredients.length ? flatIngredients : [{ quantity: '', item: '' }],
      steps: flatSteps.length ? flatSteps : [''],
      sectionOverrides: sectionOverrides
    });
    var sectionPreviewLines = sectionOverrides.length
      ? sectionOverrides.map(function (section, index) {
        return (index + 1) + '. ' + section.title + ' | steps: ' + (section.stepRefs || 'all') + ' | ingredient keywords: ' + (section.ingredientKeywords || 'none');
      }).join('\n')
      : 'No section headers were detected. Auto-inference will be used.';
    var previewText = [
      'Detected title: ' + title,
      '---',
      'Detected section boundaries:',
      sectionPreviewLines,
      '---',
      'Raw extracted PDF text (first 220 lines):',
      lines.slice(0, 220).join('\n')
    ].join('\n');
    return {
      model: model,
      previewText: previewText,
      diagnostics: {
        parseMode: 'legacy_text',
        sectionCount: sectionOverrides.length,
        totalLineCount: lines.length,
        leftLineCount: 0,
        rightLineCount: 0,
        usedFallback: true
      },
      suggestedSections: sectionOverrides.map(function (section) {
        return {
          id: section.id,
          title: section.title,
          stepRefs: section.stepRefs,
          ingredientKeywords: section.ingredientKeywords,
          accepted: true
        };
      })
    };
  }

  async function parseRecipeFromPdfFile(file) {
    if (!file) throw new Error('Select a PDF file first.');
    var pdfjsLib = await ensurePdfJsLoaded();
    var bytes = await file.arrayBuffer();
    var doc = await pdfjsLib.getDocument({ data: bytes }).promise;
    var structuredRows = [];
    var texts = [];
    for (var pageNum = 1; pageNum <= doc.numPages; pageNum += 1) {
      var page = await doc.getPage(pageNum);
      var content = await page.getTextContent();
      var viewport = page.getViewport({ scale: 1 });
      var splitX = Number(viewport && viewport.width ? viewport.width / 2 : 320);
      var pageRows = buildPdfRowsFromItems(content.items || [], splitX);
      pageRows.forEach(function (row) {
        structuredRows.push({
          left: row.left,
          right: row.right,
          full: row.full,
          maxHeight: row.maxHeight,
          pageNum: pageNum
        });
      });
      var lineMap = {};
      (content.items || []).forEach(function (item) {
        var transform = item && item.transform ? item.transform : null;
        var y = transform ? Math.round(transform[5]) : 0;
        lineMap[y] = lineMap[y] || [];
        lineMap[y].push(String(item.str || '').trim());
      });
      var pageLines = Object.keys(lineMap).map(function (key) { return Number(key); }).sort(function (a, b) { return b - a; }).map(function (key) {
        return lineMap[key].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
      }).filter(Boolean);
      texts.push(pageLines.join('\n'));
    }
    var fallbackTitle = String(file.name || '').replace(/\.pdf$/i, '');
    var structured = parseRecipeFromPdfRows(structuredRows, fallbackTitle);
    if (structured) return structured;
    var legacy = parseRecipeFromPdfText(texts.join('\n'), fallbackTitle);
    legacy.diagnostics = Object.assign({}, legacy.diagnostics || {}, {
      parseMode: 'legacy_text',
      usedFallback: true,
      fallbackReason: 'column_parse_inconclusive',
      structuredRowCount: structuredRows.length
    });
    return legacy;
  }

  function renderEditorPdfPreview() {
    var root = getRoot();
    if (!root) return;
    var section = root.querySelector('#recipesPdfPreviewSection');
    var host = root.querySelector('#recipesPdfPreviewText');
    var suggestionsHost = root.querySelector('#recipesPdfSuggestionsList');
    var applyBtn = root.querySelector('#recipesApplySuggestedSectionsBtn');
    var autoAcceptToggle = root.querySelector('#recipesPdfAutoAcceptStepRangesToggle');
    if (!section || !host || !suggestionsHost || !applyBtn || !autoAcceptToggle) return;
    var text = String(state.editorPdfPreviewText || '').trim();
    var suggestions = Array.isArray(state.editorPdfSuggestedSections) ? state.editorPdfSuggestedSections : [];
    section.hidden = !text && !suggestions.length;
    autoAcceptToggle.checked = state.editorPdfAutoAcceptWithStepRefs !== false;
    host.textContent = text;
    suggestionsHost.innerHTML = suggestions.length
      ? suggestions.map(function (row, index) {
        return '<div class="recipes-ref-row recipes-pdf-suggestion-row" data-pdf-suggestion-index="' + index + '">'
          + '<label><input type="checkbox" data-pdf-suggestion-toggle="' + index + '" ' + (row.accepted !== false ? 'checked' : '') + '> Use</label>'
          + '<input type="text" data-pdf-suggestion-title="' + index + '" value="' + safeText(row.title || '') + '">'
          + '<input type="text" data-pdf-suggestion-steps="' + index + '" value="' + safeText(row.stepRefs || '') + '">'
          + '<input type="text" data-pdf-suggestion-keywords="' + index + '" value="' + safeText(row.ingredientKeywords || '') + '">'
          + '<button type="button" class="pill-button" data-pdf-suggestion-action="accept" data-pdf-suggestion-index="' + index + '">Accept</button>'
          + '<button type="button" class="pill-button" data-pdf-suggestion-action="reject" data-pdf-suggestion-index="' + index + '">Reject</button>'
          + '</div>';
      }).join('')
      : '<div class="recipes-help-text">No section title suggestions were extracted from this PDF.</div>';
    applyBtn.disabled = !suggestions.some(function (row) {
      if (row.accepted === false || !String(row.title || '').trim()) return false;
      if (state.editorPdfAutoAcceptWithStepRefs !== false && !hasValidStepRefs(row.stepRefs)) return false;
      return true;
    });
  }

  function applyAcceptedPdfSectionSuggestions() {
    var selected = (state.editorPdfSuggestedSections || []).filter(function (row) {
      if (row.accepted === false || !String(row.title || '').trim()) return false;
      if (state.editorPdfAutoAcceptWithStepRefs !== false && !hasValidStepRefs(row.stepRefs)) return false;
      return true;
    }).map(function (row) {
      return {
        id: uid('section'),
        title: String(row.title || '').trim(),
        stepRefs: String(row.stepRefs || '').trim(),
        ingredientKeywords: String(row.ingredientKeywords || '').trim()
      };
    });
    state.editorSectionOverrides = selected;
    var root = getRoot();
    if (!root) return selected.length;
    var sectionList = root.querySelector('#recipesSectionOverridesList');
    if (sectionList) {
      sectionList.innerHTML = selected.map(sectionOverrideRowHtml).join('');
    }
    return selected.length;
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
    var ingredientNames = uniqueSorted(
      state.recipes.flatMap(function (row) { return (row.ingredients || []).map(function (i) { return i.item; }); })
        .concat((state.ingredientsDb || []).map(function (entry) { return entry.name; }))
        .concat(['Olive oil', 'Garlic', 'Onion', 'Salt', 'Black pepper', 'Butter', 'Lemon juice'])
    );
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
      '<div class="recipes-ingredient-conversion-preview" aria-live="polite"></div>' +
      '<button type="button" class="pill-button" data-row-action="remove">Remove</button>' +
    '</div>';
  }

  function stepRowHtml(text) {
    return '<div class="recipes-line-editor" data-editor-row="step">' +
      '<input type="text" class="recipes-step-text" list="recipesStepSuggestions" placeholder="Describe this step" value="' + safeText(text || '') + '">' +
      '<button type="button" class="pill-button" data-row-action="remove">Remove</button>' +
    '</div>';
  }

  function sectionOverrideRowHtml(row) {
    row = row || { id: uid('section'), title: '', stepRefs: '', ingredientKeywords: '' };
    return '<div class="recipes-line-editor recipes-section-override-row" data-editor-row="section-override" data-section-override-id="' + safeText(row.id) + '">' +
      '<input type="text" class="recipes-section-override-title" placeholder="Section title (for example Prepare Meat)" value="' + safeText(row.title || '') + '">' +
      '<input type="text" class="recipes-section-override-steps" placeholder="Step numbers/range (for example 1-3,5)" value="' + safeText(row.stepRefs || '') + '">' +
      '<input type="text" class="recipes-section-override-ingredients" placeholder="Ingredient keywords (comma separated)" value="' + safeText(row.ingredientKeywords || '') + '">' +
      '<button type="button" class="pill-button" data-row-action="remove">Remove</button>' +
    '</div>';
  }

  function parseStepRefTokens(stepRefs) {
    var indexes = new Set();
    String(stepRefs || '').split(',').map(function (part) { return part.trim(); }).filter(Boolean).forEach(function (part) {
      var range = part.match(/^(\d+)\s*-\s*(\d+)$/);
      if (range) {
        var start = Number(range[1]);
        var end = Number(range[2]);
        if (!Number.isFinite(start) || !Number.isFinite(end)) return;
        var min = Math.min(start, end);
        var max = Math.max(start, end);
        for (var index = min; index <= max; index += 1) indexes.add(index);
        return;
      }
      var single = Number(part);
      if (Number.isFinite(single) && single > 0) indexes.add(single);
    });
    return indexes;
  }

  function hasValidStepRefs(stepRefs) {
    return parseStepRefTokens(stepRefs).size > 0;
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

  function updateIngredientConversionPreviews() {
    var root = getRoot();
    if (!root) return;
    var rows = Array.from(root.querySelectorAll('[data-editor-row="ingredient"]'));
    rows.forEach(function (row) {
      var qtyInput = row.querySelector('.recipes-ingredient-qty');
      var hint = row.querySelector('.recipes-ingredient-conversion-preview');
      if (!hint) return;
      var qty = String(qtyInput ? qtyInput.value : '').trim();
      if (!qty) {
        hint.textContent = '';
        return;
      }
      var normalizedUs = convertQuantityForDisplay(qty, 'us');
      var unchanged = normalizeToken(qty) === normalizeToken(normalizedUs);
      if (unchanged) {
        hint.textContent = '';
        return;
      }
      hint.textContent = state.editingRecipeId
        ? ('US equivalent: ' + normalizedUs)
        : ('Will save as US: ' + normalizedUs);
    });
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

  function openEditor(recipe, options) {
    options = options || {};
    var root = getRoot();
    if (!root) return;
    var overlay = root.querySelector('#recipesEditorOverlay');
    var title = root.querySelector('#recipesEditorTitle');
    var form = root.querySelector('#recipesEditorForm');
    if (!overlay || !title || !form) return;

    var model = normalizeRecipe(recipe || { title: '', description: '', ingredients: [{ quantity: '', item: '' }], steps: [''], photos: [], notes: [] });
    state.editorPdfPreviewText = String(options.pdfPreviewText || '').trim();
    state.editorPdfSuggestedSections = Array.isArray(options.pdfSuggestedSections) ? options.pdfSuggestedSections.map(function (row) {
      return {
        id: String((row && row.id) || uid('section')),
        title: String((row && row.title) || '').trim(),
        stepRefs: String((row && row.stepRefs) || '').trim(),
        ingredientKeywords: String((row && row.ingredientKeywords) || '').trim(),
        accepted: row && row.accepted !== false
      };
    }) : [];
    if (typeof options.pdfAutoAcceptWithStepRefs === 'boolean') {
      state.editorPdfAutoAcceptWithStepRefs = options.pdfAutoAcceptWithStepRefs;
    }
    state.editingRecipeId = recipe && recipe.id ? recipe.id : '';
    state.editorPhotos = model.photos.slice();
    state.editorSectionOverrides = (model.sectionOverrides || []).slice();

    title.textContent = state.editingRecipeId ? 'Edit recipe' : 'Add recipe';
    form.elements.title.value = model.title;
    form.elements.description.value = model.description;
    if (form.elements.sourceUrl) form.elements.sourceUrl.value = model.sourceUrl || '';
    if (form.elements.servings) form.elements.servings.value = model.servings || 4;
    form.elements.prepMinutes.value = model.prepMinutes === '' ? '' : String(model.prepMinutes);
    form.elements.cookMinutes.value = model.cookMinutes === '' ? '' : String(model.cookMinutes);
    form.elements.courseCategory.value = normalizeCourseCategory(model.courseCategory);
    form.elements.healthiness.value = normalizeHealthiness(model.healthiness);

    var ingredientsList = root.querySelector('#recipesIngredientsList');
    var stepsList = root.querySelector('#recipesStepsList');
    var sectionsList = root.querySelector('#recipesSectionOverridesList');
    if (ingredientsList) ingredientsList.innerHTML = (model.ingredients.length ? model.ingredients : [{ quantity: '', item: '' }]).map(ingredientRowHtml).join('');
    if (stepsList) stepsList.innerHTML = (model.steps.length ? model.steps : ['']).map(stepRowHtml).join('');
    if (sectionsList) sectionsList.innerHTML = (state.editorSectionOverrides || []).map(sectionOverrideRowHtml).join('');

    setEditorTags(model);
    renderEditorPhotos();
    renderEditorPdfPreview();
    setPhotoImportDiagnostics('', false);
    updateIngredientConversionPreviews();
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
    state.editorPdfPreviewText = '';
    state.editorPdfSuggestedSections = [];
    state.editorPdfAutoAcceptWithStepRefs = true;
    state.editorSectionOverrides = [];
    overwriteArray(state.editorTags.proteins, []);
    overwriteArray(state.editorTags.cuisines, []);
    overwriteArray(state.editorTags.methods, []);
    setPhotoImportDiagnostics('', false);
    renderEditorPdfPreview();
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

  function mapExcelRowToSubstitutionPairs(rowObj) {
    var original = String(rowObj.original_ingredient || rowObj.originalingredient || '').trim();
    var substitutes = splitSubstituteCell(rowObj.substitute_ingredient || rowObj.substituteingredient || '');
    return substitutes.map(function (substitute) {
      return { original: original, substitute: substitute };
    }).filter(function (row) { return row.original && row.substitute; });
  }

  function mapExcelRowToIngredient(rowObj) {
    var name = String(rowObj.ingredient_name || rowObj.ingredientname || '').trim();
    var type = String(rowObj.ingredient_type || rowObj.ingredienttype || '').trim() || createIngredientType(name);
    if (!name) return null;
    return { name: name, type: type };
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
      servings: Number(rowObj.servings || 0) || 4,
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
      sectionOverrides: (function () {
        try { return JSON.parse(rowObj[EXCEL_COLUMNS.sectionOverridesJson] || '[]'); } catch (_e) { return []; }
      })(),
      sourceUrl: rowObj[EXCEL_COLUMNS.recipeUrl] || rowObj[EXCEL_COLUMNS.sourceUrl] || '',
      preferredCookMethodProfile: rowObj[EXCEL_COLUMNS.preferredCookMethodProfile] || '',
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

  async function readSubstitutionsFromExcel() {
    var path = await resolveExcelWorkbookPath();
    var encodedPath = encodeGraphPath(path);
    var tableRef = encodeURIComponent(EXCEL_SUBSTITUTIONS_TABLE_NAME);
    var columnsResp = await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + tableRef + '/columns?$select=name,index');
    var rowsResp = await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + tableRef + '/rows?$top=5000');
    var columns = (columnsResp.value || []).slice().sort(function (a, b) { return Number(a.index || 0) - Number(b.index || 0); });
    var normalizedNameByIndex = columns.map(function (col) { return String(col.name || '').trim().toLowerCase(); });
    return (rowsResp.value || []).flatMap(function (row) {
      var values = (row.values && row.values[0]) ? row.values[0] : [];
      var mapped = {};
      normalizedNameByIndex.forEach(function (name, index) { mapped[name] = values[index]; });
      return mapExcelRowToSubstitutionPairs(mapped);
    });
  }

  async function readIngredientsFromExcel() {
    var path = await resolveExcelWorkbookPath();
    var encodedPath = encodeGraphPath(path);
    var tableRef = encodeURIComponent(EXCEL_INGREDIENTS_TABLE_NAME);
    var columnsResp = await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + tableRef + '/columns?$select=name,index');
    var rowsResp = await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + tableRef + '/rows?$top=5000');
    var columns = (columnsResp.value || []).slice().sort(function (a, b) { return Number(a.index || 0) - Number(b.index || 0); });
    var normalizedNameByIndex = columns.map(function (col) { return String(col.name || '').trim().toLowerCase(); });
    return uniqueIngredientRows((rowsResp.value || []).map(function (row) {
      var values = (row.values && row.values[0]) ? row.values[0] : [];
      var mapped = {};
      normalizedNameByIndex.forEach(function (name, index) { mapped[name] = values[index]; });
      return mapExcelRowToIngredient(mapped);
    }).filter(Boolean));
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
    byName[EXCEL_COLUMNS.sectionOverridesJson] = JSON.stringify(model.sectionOverrides || []);
    byName[EXCEL_COLUMNS.recipeUrl] = model.sourceUrl || '';
    byName[EXCEL_COLUMNS.sourceUrl] = model.sourceUrl || '';
    byName[EXCEL_COLUMNS.preferredCookMethodProfile] = model.preferredCookMethodProfile || '';
    byName.servings = model.servings || 4;
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

  async function writeIngredientsToExcel() {
    var path = await resolveExcelWorkbookPath();
    var encodedPath = encodeGraphPath(path);
    var tableRef = encodeURIComponent(EXCEL_INGREDIENTS_TABLE_NAME);
    var columnsResp = await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + tableRef + '/columns?$select=name,index');
    var columns = (columnsResp.value || []).slice().sort(function (a, b) { return Number(a.index || 0) - Number(b.index || 0); });
    var normalizedColumns = columns.map(function (c) { return String(c.name || '').trim().toLowerCase(); });
    await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + tableRef + '/rows/clear', { method: 'POST' });

    var values = uniqueIngredientRows(state.ingredientsDb || []).map(function (row) {
      var byName = {
        ingredient_name: row.name,
        ingredient_type: row.type
      };
      return normalizedColumns.map(function (name) { return byName.hasOwnProperty(name) ? byName[name] : ''; });
    });
    if (!values.length) return;
    await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + tableRef + '/rows/add', {
      method: 'POST',
      body: JSON.stringify({ values: values })
    });
  }

  async function writeSubstitutionsToExcel() {
    var path = await resolveExcelWorkbookPath();
    var encodedPath = encodeGraphPath(path);
    var tableRef = encodeURIComponent(EXCEL_SUBSTITUTIONS_TABLE_NAME);
    var columnsResp = await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + tableRef + '/columns?$select=name,index');
    var columns = (columnsResp.value || []).slice().sort(function (a, b) { return Number(a.index || 0) - Number(b.index || 0); });
    var normalizedColumns = columns.map(function (c) { return String(c.name || '').trim().toLowerCase(); });
    await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + tableRef + '/rows/clear', { method: 'POST' });

    var values = sortSubstitutionPairs(normalizeSubstitutionPairRows(state.substitutionsDbPairs || [])).map(function (row) {
      var byName = {
        original_ingredient: row.original,
        substitute_ingredient: row.substitute
      };
      return normalizedColumns.map(function (name) { return byName.hasOwnProperty(name) ? byName[name] : ''; });
    });
    if (!values.length) return;
    await graphFetchJson('https://graph.microsoft.com/v1.0/me/drive/root:/' + encodedPath + ':/workbook/tables/' + tableRef + '/rows/add', {
      method: 'POST',
      body: JSON.stringify({ values: values })
    });
  }

  async function pushReferenceDatabasesToExcel() {
    var wroteSubstitutions = false;
    var wroteIngredients = false;
    var errors = [];
    try {
      await writeSubstitutionsToExcel();
      wroteSubstitutions = true;
    } catch (error) {
      errors.push('Substitutions: ' + (error && error.message ? error.message : 'write failed'));
    }
    try {
      await writeIngredientsToExcel();
      wroteIngredients = true;
    } catch (error) {
      errors.push('Ingredients: ' + (error && error.message ? error.message : 'write failed'));
    }
    return {
      wroteSubstitutions: wroteSubstitutions,
      wroteIngredients: wroteIngredients,
      errors: errors
    };
  }

  async function syncReferenceTablesFromExcel() {
    var subsRead = false;
    var ingredientsRead = false;
    try {
      var pairs = await readSubstitutionsFromExcel();
      state.substitutionsDbPairs = normalizeSubstitutionPairRows(pairs);
      rebuildSubstitutionDatabase();
      subsRead = true;
    } catch (_error) {
      rebuildSubstitutionDatabase();
    }
    try {
      var ingredients = await readIngredientsFromExcel();
      state.ingredientsDb = uniqueIngredientRows(ingredients);
      ingredientsRead = true;
    } catch (_error) {
      state.ingredientsDb = uniqueIngredientRows(state.ingredientsDb || []);
    }
    saveReferenceDatabasesToCache();
    return { subsRead: subsRead, ingredientsRead: ingredientsRead };
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
      var refSyncResult = await syncReferenceTablesFromExcel();
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
      setExcelStatus(
        (options.autoSync ? 'Auto-sync complete. ' : '')
          + 'Loaded ' + excelRecipes.length + ' recipe(s) from Excel.'
          + ' Substitutions: ' + (refSyncResult.subsRead ? 'synced' : 'not available') + '.'
          + ' Ingredients DB: ' + (refSyncResult.ingredientsRead ? 'synced' : 'not available') + '.',
        false
      );
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
      try {
        await writeSubstitutionsToExcel();
      } catch (_error) {
        // Substitutions table may not always be available; recipes sync should still succeed.
      }
      try {
        await writeIngredientsToExcel();
      } catch (_error) {
        // Ingredients table may not always be available; recipes sync should still succeed.
      }
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
    var sectionOverrides = Array.from(root.querySelectorAll('[data-editor-row="section-override"]')).map(function (row) {
      return {
        id: row.getAttribute('data-section-override-id') || uid('section'),
        title: row.querySelector('.recipes-section-override-title') ? row.querySelector('.recipes-section-override-title').value : '',
        stepRefs: row.querySelector('.recipes-section-override-steps') ? row.querySelector('.recipes-section-override-steps').value : '',
        ingredientKeywords: row.querySelector('.recipes-section-override-ingredients') ? row.querySelector('.recipes-section-override-ingredients').value : ''
      };
    }).filter(function (row) { return String(row.title || '').trim(); });

    var missing = [];
    if (!String(form.elements.title.value || '').trim()) missing.push('Recipe name');
    if (!state.editorTags.methods.length) missing.push('At least one cooking method');
    if (!ingredients.length) missing.push('At least one ingredient');
    if (!steps.length) missing.push('At least one cook instruction step');
    if (missing.length) {
      setEditorStatus('Please complete: ' + missing.join(', ') + '.', true);
      return;
    }

    var normalizedIngredientRows = state.editingRecipeId ? ingredients : normalizeIngredientsToUs(ingredients);

    var model = normalizeRecipe({
      id: state.editingRecipeId || undefined,
      title: form.elements.title.value,
      description: form.elements.description.value,
      proteins: state.editorTags.proteins,
      cuisines: state.editorTags.cuisines,
      methods: state.editorTags.methods,
      courseCategory: normalizeCourseCategory(form.elements.courseCategory ? form.elements.courseCategory.value : ''),
      healthiness: normalizeHealthiness(form.elements.healthiness ? form.elements.healthiness.value : ''),
      servings: form.elements.servings ? form.elements.servings.value : 4,
      prepMinutes: form.elements.prepMinutes.value,
      cookMinutes: form.elements.cookMinutes.value,
      sourceUrl: form.elements.sourceUrl ? form.elements.sourceUrl.value : '',
      ingredients: normalizedIngredientRows,
      steps: steps,
      photos: state.editorPhotos,
      notes: state.editingRecipeId ? ((getRecipeById(state.editingRecipeId) || {}).notes || []) : [],
      sectionOverrides: sectionOverrides
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
            var parsedRecipe = deriveRecipeFromUrl(urlInput ? urlInput.value : '');
            openEditor(parsedRecipe);
            updateIntakeStatus('URL parsed. Attempting to import photos from source URL...', false);
            importPhotosFromSourceUrlIntoEditor(parsedRecipe.sourceUrl).then(function (result) {
              setEditorStatus('Imported ' + result.addedCount + ' new photo(s) from source URL (' + result.foundCount + ' found).', false);
              setPhotoImportDiagnostics('Photo import diagnostics: og:image=' + result.diagnostics.ogCount + ', JSON-LD=' + result.diagnostics.jsonLdCount + ', fallback <img>=' + result.diagnostics.fallbackImgCount + '.', false);
              updateIntakeStatus('URL parsed and photos imported.', false);
            }).catch(function (error) {
              setPhotoImportDiagnostics('Photo import diagnostics unavailable for this URL.', true);
              updateIntakeStatus('URL parsed. Photo auto-import unavailable: ' + (error && error.message ? error.message : 'no photos found'), true);
            });
          }
          if (action === 'parse-text') {
            var textInput = root.querySelector('#recipesPasteInput');
            openEditor(parseRecipeFromText(textInput ? textInput.value : ''));
            updateIntakeStatus('Text parsed. Review and save.', false);
          }
          if (action === 'parse-pdf') {
            var pdfInput = root.querySelector('#recipesPdfInput');
            var pdfFile = pdfInput && pdfInput.files && pdfInput.files[0] ? pdfInput.files[0] : null;
            updateIntakeStatus('Parsing PDF recipe...', false);
            parseRecipeFromPdfFile(pdfFile).then(function (result) {
              openEditor(result.model, { pdfPreviewText: result.previewText, pdfSuggestedSections: result.suggestedSections || [] });
              updateIntakeStatus('PDF parsed. Review sections, ingredients, and steps before saving.', false);
            }).catch(function (error) {
              updateIntakeStatus(error && error.message ? error.message : 'Unable to parse PDF recipe.', true);
            });
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
      var sectionIngredientBtn = target.closest('[data-section-ingredient]');
      if (sectionIngredientBtn) {
        openIngredientSubstitutionModal(sectionIngredientBtn.getAttribute('data-section-ingredient'));
        return;
      }
      var flowNode = target.closest('[data-flow-target]');
      if (flowNode) {
        var flowTargetId = flowNode.getAttribute('data-flow-target');
        var flowTargetNode = flowTargetId ? root.querySelector('#' + flowTargetId) : null;
        if (flowTargetNode && typeof flowTargetNode.scrollIntoView === 'function') {
          flowTargetNode.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }
      if (target.closest('#recipesIngredientSubModalClose')) { closeIngredientSubstitutionModal(); return; }
      if (target.id === 'recipesIngredientSubModal') { closeIngredientSubstitutionModal(); return; }
      if (target.closest('#recipesDetailsClose')) { var details = root.querySelector('#recipesDetails'); if (details) details.hidden = true; return; }
      if (target.closest('#recipesEditorCancel')) { closeEditor(); return; }
      if (target.closest('#recipesAddIngredientBtn')) {
        var ingredientsList = root.querySelector('#recipesIngredientsList');
        if (ingredientsList) ingredientsList.insertAdjacentHTML('beforeend', ingredientRowHtml({ quantity: '', item: '' }));
        updateIngredientConversionPreviews();
        return;
      }
      if (target.closest('#recipesAddSectionOverrideBtn')) {
        var sectionOverrideList = root.querySelector('#recipesSectionOverridesList');
        if (sectionOverrideList) sectionOverrideList.insertAdjacentHTML('beforeend', sectionOverrideRowHtml({ id: uid('section'), title: '', stepRefs: '', ingredientKeywords: '' }));
        return;
      }
      if (target.closest('#recipesApplySuggestedSectionsBtn')) {
        var appliedCount = applyAcceptedPdfSectionSuggestions();
        setEditorStatus(appliedCount
          ? ('Applied ' + appliedCount + ' suggested section title(s).')
          : 'No accepted suggested sections to apply.', !appliedCount);
        return;
      }
      var suggestionAction = target.closest('[data-pdf-suggestion-action][data-pdf-suggestion-index]');
      if (suggestionAction) {
        var suggestionActionType = suggestionAction.getAttribute('data-pdf-suggestion-action');
        var suggestionIndex = Number(suggestionAction.getAttribute('data-pdf-suggestion-index'));
        if (Number.isFinite(suggestionIndex) && suggestionIndex >= 0 && state.editorPdfSuggestedSections[suggestionIndex]) {
          state.editorPdfSuggestedSections[suggestionIndex].accepted = suggestionActionType === 'accept';
          renderEditorPdfPreview();
        }
        return;
      }
      if (target.closest('#recipesAddStepBtn')) { var stepsList = root.querySelector('#recipesStepsList'); if (stepsList) stepsList.insertAdjacentHTML('beforeend', stepRowHtml('')); return; }
      if (target.closest('[data-row-action="remove"]')) { var row = target.closest('[data-editor-row]'); if (row) row.remove(); return; }
      if (target.closest('#recipesEditActiveBtn')) { var activeRecipeForEdit = getRecipeById(state.activeRecipeId); if (activeRecipeForEdit) openEditor(activeRecipeForEdit); return; }
      if (target.closest('#recipesApplyServingsBtn')) {
        var servingsTargetInput = root.querySelector('#recipesServingsTarget');
        setServingTargetForActiveRecipe(servingsTargetInput ? servingsTargetInput.value : '');
        return;
      }
      if (target.closest('#recipesSaveScaledServingsBtn')) {
        var servingsSaveInput = root.querySelector('#recipesServingsTarget');
        if (saveScaledIngredientsForActiveRecipe(servingsSaveInput ? servingsSaveInput.value : '')) {
          state.referenceDbStatus = 'Saved scaled ingredients and updated servings.';
        }
        return;
      }
      if (target.closest('#recipesFindSubstitutionsBtn')) { showIngredientSubstitutionsForActiveRecipe(); return; }
      if (target.closest('#recipesShowAllSubsBtn')) { showAllIngredientSubstitutionsForActiveRecipe(); return; }
      if (target.closest('#recipesImportPhotosFromSourceBtn')) {
        var editorForm = root.querySelector('#recipesEditorForm');
        var sourceUrlValue = editorForm && editorForm.elements && editorForm.elements.sourceUrl ? editorForm.elements.sourceUrl.value : '';
        setEditorStatus('Importing photos from source URL...', false);
        importPhotosFromSourceUrlIntoEditor(sourceUrlValue).then(function (result) {
          setEditorStatus('Imported ' + result.addedCount + ' new photo(s) from source URL (' + result.foundCount + ' found).', false);
          setPhotoImportDiagnostics('Photo import diagnostics: og:image=' + result.diagnostics.ogCount + ', JSON-LD=' + result.diagnostics.jsonLdCount + ', fallback <img>=' + result.diagnostics.fallbackImgCount + '.', false);
        }).catch(function (error) {
          setPhotoImportDiagnostics('Photo import diagnostics unavailable for this URL.', true);
          setEditorStatus(error && error.message ? error.message : 'Unable to import photos from source URL.', true);
        });
        return;
      }
      if (target.closest('#recipesPushReferenceDbBtn')) {
        state.referenceDbStatus = 'Pushing substitutions and ingredients database to Excel...';
        renderDetails(state.activeRecipeId);
        pushReferenceDatabasesToExcel().then(function (result) {
          if (!result.errors.length) {
            state.referenceDbStatus = 'Reference database push complete (substitutions + ingredients).';
          } else {
            state.referenceDbStatus = 'Reference database push partially completed. ' + result.errors.join(' | ');
          }
          renderDetails(state.activeRecipeId);
        }).catch(function (error) {
          state.referenceDbStatus = error && error.message ? error.message : 'Unable to push reference databases to Excel.';
          renderDetails(state.activeRecipeId);
        });
        return;
      }
      if (target.closest('#recipesSubsAddBtn')) {
        var addOriginalInput = root.querySelector('#recipesSubsAddOriginal');
        var addSubInput = root.querySelector('#recipesSubsAddSubstitute');
        var added = addSubstitutionPairToDatabase(addOriginalInput ? addOriginalInput.value : '', addSubInput ? addSubInput.value : '');
        state.referenceDbStatus = added
          ? 'Added substitution row to database.'
          : 'Could not add substitution row (check for empty or duplicate values).';
        saveReferenceDatabasesAndRefresh();
        return;
      }
      if (target.closest('#recipesIngredientsDbAddBtn')) {
        var addIngredientName = root.querySelector('#recipesIngredientsDbAddName');
        var addIngredientType = root.querySelector('#recipesIngredientsDbAddType');
        var ingredientAdded = addIngredientToDatabase(addIngredientName ? addIngredientName.value : '', addIngredientType ? addIngredientType.value : '');
        state.referenceDbStatus = ingredientAdded
          ? 'Added ingredient row to database.'
          : 'Could not add ingredient row (check for empty or duplicate name).';
        saveReferenceDatabasesAndRefresh();
        return;
      }
      var substitutionAction = target.closest('[data-sub-action][data-sub-pair-key]');
      if (substitutionAction) {
        var substitutionKey = substitutionAction.getAttribute('data-sub-pair-key');
        var substitutionRow = root.querySelector('[data-sub-pair-key="' + substitutionKey + '"]');
        var subOriginalInput = substitutionRow ? substitutionRow.querySelector('[data-sub-field="original"]') : null;
        var subSubstituteInput = substitutionRow ? substitutionRow.querySelector('[data-sub-field="substitute"]') : null;
        var subAction = substitutionAction.getAttribute('data-sub-action');
        var substitutionChanged = false;
        if (subAction === 'save') {
          substitutionChanged = updateSubstitutionPairInDatabase(substitutionKey, subOriginalInput ? subOriginalInput.value : '', subSubstituteInput ? subSubstituteInput.value : '');
          state.referenceDbStatus = substitutionChanged ? 'Saved substitution row.' : 'Unable to save substitution row.';
        }
        if (subAction === 'delete') {
          substitutionChanged = removeSubstitutionPairFromDatabase(substitutionKey);
          state.referenceDbStatus = substitutionChanged ? 'Deleted substitution row.' : 'Unable to delete substitution row.';
        }
        if (substitutionChanged) {
          saveReferenceDatabasesAndRefresh();
        } else {
          renderDetails(state.activeRecipeId);
        }
        return;
      }
      var ingredientAction = target.closest('[data-ingredient-action][data-ingredient-row-key]');
      if (ingredientAction) {
        var ingredientKey = ingredientAction.getAttribute('data-ingredient-row-key');
        var ingredientRow = root.querySelector('[data-ingredient-row-key="' + ingredientKey + '"]');
        var ingredientNameInput = ingredientRow ? ingredientRow.querySelector('[data-ingredient-field="name"]') : null;
        var ingredientTypeInput = ingredientRow ? ingredientRow.querySelector('[data-ingredient-field="type"]') : null;
        var actionType = ingredientAction.getAttribute('data-ingredient-action');
        var ingredientChanged = false;
        if (actionType === 'save') {
          ingredientChanged = updateIngredientInDatabase(ingredientKey, ingredientNameInput ? ingredientNameInput.value : '', ingredientTypeInput ? ingredientTypeInput.value : '');
          state.referenceDbStatus = ingredientChanged ? 'Saved ingredient row.' : 'Unable to save ingredient row.';
        }
        if (actionType === 'delete') {
          ingredientChanged = removeIngredientFromDatabase(ingredientKey);
          state.referenceDbStatus = ingredientChanged ? 'Deleted ingredient row.' : 'Unable to delete ingredient row.';
        }
        if (ingredientChanged) {
          saveReferenceDatabasesAndRefresh();
        } else {
          renderDetails(state.activeRecipeId);
        }
        return;
      }
      if (target.closest('#recipesScanIngredientsDbBtn')) {
        state.referenceDbStatus = 'Scanning recipes and updating ingredients database...';
        renderDetails(state.activeRecipeId);
        scanRecipesIntoIngredientsDatabase().then(function (result) {
          state.referenceDbStatus = result.addedCount
            ? ('Added ' + result.addedCount + ' missing ingredient(s) to database' + (result.wroteExcel ? ' and synced to Excel.' : '.'))
            : 'No missing ingredients found. Ingredients database already covers current recipes.';
          saveReferenceDatabasesAndRefresh();
        }).catch(function (error) {
          state.referenceDbStatus = error && error.message ? error.message : 'Unable to scan ingredients database right now.';
          renderDetails(state.activeRecipeId);
        });
        return;
      }
      if (target.closest('#recipesFindSafeTempBtn')) { showSafeCookTemperatureForSelection(); return; }
      if (target.closest('#recipesFindCookTimeBtn')) { showCommonCookTimeForSelection(); return; }
      if (target.closest('#recipesUseRecipeCookTimeBtn')) { preloadCookMethodBaseTimeFromActiveRecipe(); return; }
      if (target.closest('#recipesConvertCookMethodBtn')) { showCookMethodConversionForSelection(); return; }
      if (target.closest('#recipesSaveCookConversionNoteBtn')) { saveCookMethodConversionAsRecipeNote(); return; }
      if (target.closest('#recipesSavePreferredCookMethodBtn')) {
        var preferredSelect = root.querySelector('#recipesPreferredCookMethodSelect');
        savePreferredCookMethodForActiveRecipe(preferredSelect ? preferredSelect.value : '');
        return;
      }
      if (target.closest('#recipesExportSectionedGroceryBtn')) { exportSectionedGroceryListForActiveRecipe(); return; }
      if (target.closest('#recipesRecommendImprovementsBtn')) {
        state.showRecipeImprovements = true;
        state.recipeImprovementStatus = '';
        renderDetails(state.activeRecipeId);
        return;
      }
      var approveImprovement = target.closest('[data-improvement-action="approve"][data-improvement-item]');
      if (approveImprovement) {
        applyIngredientImprovementSuggestion(
          approveImprovement.getAttribute('data-improvement-item'),
          approveImprovement.getAttribute('data-improvement-qty')
        );
        return;
      }
      var variationAccept = target.closest('[data-variation-action="accept"][data-variation-index]');
      if (variationAccept) {
        var indexRaw = Number(variationAccept.getAttribute('data-variation-index'));
        var activeRecipeForVariation = getRecipeById(state.activeRecipeId);
        var suggestions = getRecipeVariationSuggestions(activeRecipeForVariation);
        var suggestion = Number.isFinite(indexRaw) && indexRaw >= 0 ? suggestions[indexRaw] : null;
        if (activeRecipeForVariation && suggestion) {
          var titleInput = root.querySelector('[data-variation-title-index="' + indexRaw + '"]');
          var variationTextInput = root.querySelector('[data-variation-text-index="' + indexRaw + '"]');
          saveVariationForActiveRecipe({
            title: titleInput ? titleInput.value : suggestion.title,
            text: variationTextInput ? variationTextInput.value : suggestion.text,
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
      if (target.id === 'recipesMeasurementToggle') {
        state.measurementSystem = target.checked ? 'metric' : 'us';
        saveMeasurementPreference();
        renderDetails(state.activeRecipeId);
        return;
      }
      if (target.id === 'recipesSubsRelevantOnlyToggle') {
        state.referenceDbFilters.substitutionsRelevantOnly = target.checked === true;
        renderDetails(state.activeRecipeId);
        return;
      }
      if (target.id === 'recipesIngredientTypeFilter') {
        state.referenceDbFilters.ingredientType = String(target.value || 'all') || 'all';
        renderDetails(state.activeRecipeId);
        return;
      }
      if (target.id === 'recipesPdfAutoAcceptStepRangesToggle') {
        state.editorPdfAutoAcceptWithStepRefs = target.checked === true;
        renderEditorPdfPreview();
        return;
      }
      if (target.id === 'recipesCookTimeItemSelect') { syncCommonCookTimeControls(); return; }
      if (target.id === 'recipesCookTimeMethodSelect') { syncCommonCookTimeControls(); return; }
      if (target.id === 'recipesCookTimeDonenessSelect') { showCommonCookTimeForSelection(); }
      if (target.id === 'recipesCookMethodFromSelect') { showCookMethodConversionForSelection(); return; }
      if (target.id === 'recipesCookMethodToSelect') { showCookMethodConversionForSelection(); return; }
      if (target.id === 'recipesCookMethodProteinPreset') {
        syncCookMethodDonenessPresetOptions();
        showCookMethodConversionForSelection();
        return;
      }
      if (target.id === 'recipesCookMethodThicknessPreset') { showCookMethodConversionForSelection(); return; }
      if (target.id === 'recipesCookMethodDonenessPreset') { showCookMethodConversionForSelection(); return; }
    });

    root.addEventListener('input', function (event) {
      var target = event.target && event.target.nodeType === Node.ELEMENT_NODE ? event.target : null;
      if (!target) return;
      if (target.id === 'recipesFilterSearch') {
        state.filters.searchQuery = target.value;
        renderCards();
      }
      if (target.classList && target.classList.contains('recipes-ingredient-qty')) {
        updateIngredientConversionPreviews();
      }
      if (target.id === 'recipesSubsSearchInput') {
        state.referenceDbFilters.substitutionsQuery = target.value || '';
        renderDetails(state.activeRecipeId);
      }
      if (target.id === 'recipesIngredientsSearchInput') {
        state.referenceDbFilters.ingredientQuery = target.value || '';
        renderDetails(state.activeRecipeId);
      }
      if (target.id === 'recipesCookMethodBaseTime') {
        showCookMethodConversionForSelection();
      }
      var suggestionToggleIndex = target.getAttribute && target.getAttribute('data-pdf-suggestion-toggle');
      if (suggestionToggleIndex != null) {
        var toggleIndex = Number(suggestionToggleIndex);
        if (Number.isFinite(toggleIndex) && toggleIndex >= 0 && state.editorPdfSuggestedSections[toggleIndex]) {
          state.editorPdfSuggestedSections[toggleIndex].accepted = target.checked === true;
          renderEditorPdfPreview();
        }
      }
      var suggestionTitleIndex = target.getAttribute && target.getAttribute('data-pdf-suggestion-title');
      if (suggestionTitleIndex != null) {
        var titleIndex = Number(suggestionTitleIndex);
        if (Number.isFinite(titleIndex) && titleIndex >= 0 && state.editorPdfSuggestedSections[titleIndex]) {
          state.editorPdfSuggestedSections[titleIndex].title = target.value || '';
        }
      }
      var suggestionStepIndex = target.getAttribute && target.getAttribute('data-pdf-suggestion-steps');
      if (suggestionStepIndex != null) {
        var stepIndex = Number(suggestionStepIndex);
        if (Number.isFinite(stepIndex) && stepIndex >= 0 && state.editorPdfSuggestedSections[stepIndex]) {
          state.editorPdfSuggestedSections[stepIndex].stepRefs = target.value || '';
        }
      }
      var suggestionKeywordIndex = target.getAttribute && target.getAttribute('data-pdf-suggestion-keywords');
      if (suggestionKeywordIndex != null) {
        var keywordIndex = Number(suggestionKeywordIndex);
        if (Number.isFinite(keywordIndex) && keywordIndex >= 0 && state.editorPdfSuggestedSections[keywordIndex]) {
          state.editorPdfSuggestedSections[keywordIndex].ingredientKeywords = target.value || '';
        }
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
    loadReferenceDatabasesFromCache();
    loadMeasurementPreference();
    updateSuggestionLists();
    renderCards();
    renderPantryTracker('');
    bindEvents();

    if (!state.initialized) {
      state.initialized = true;
      setActiveIntakeTab('manual');
      document.addEventListener('kap:app-mode-changed', function () {
        updateRecipesSchemaBanner(state.excel.schemaColumnNames || []);
        if (state.activeRecipeId) renderDetails(state.activeRecipeId);
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
    parseRecipeFromPdfFile: parseRecipeFromPdfFile,
    syncFromExcel: syncFromExcel,
    syncToExcel: syncToExcel
  };
})();

