/**
 * Adventure Achievements System
 * Per-subtab achievement dashboards: Category Progression, Challenges, Badges,
 * Seasonal Quests, and Bingo – driven by per-subtab category tags.
 * Progress is persisted in localStorage; +/- buttons allow manual tracking.
 */
window.AdventureAchievements = (function () {
  'use strict';

  const STORE_KEY = 'adventureAchievementsV1';

  const SEASON_MAP = {
    spring: { label: 'Spring', icon: '🌸', months: [3,4,5] },
    summer: { label: 'Summer', icon: '☀️', months: [6,7,8] },
    fall:   { label: 'Fall',   icon: '🍂', months: [9,10,11] },
    winter: { label: 'Winter', icon: '❄️', months: [12,1,2] }
  };

  const RARITY_LABELS = { common: 'Common', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };
  const RARITY_COLORS = { common: '#6b7280', rare: '#2563eb', epic: '#7c3aed', legendary: '#d97706' };
  const MATCH_MODES = {
    strict: {
      label: 'Strict (Place ID + exact name)',
      help: 'Highest precision. Only Place ID and exact title matches are counted.'
    },
    balanced: {
      label: 'Balanced (Place ID + exact + fuzzy)',
      help: 'Default. Uses Place ID first, then exact/fuzzy title fallback.'
    },
    'name-only': {
      label: 'Name Only (exact + fuzzy)',
      help: 'Ignores Place IDs. Useful when source rows are missing Place IDs.'
    },
    manual: {
      label: 'Manual fallback',
      help: 'Turns off auto-sync and uses your manual +/- counters.'
    }
  };
  const CHALLENGE_TIER_TARGETS = [1, 3, 5, 10, 15];
  const BADGE_LEVEL_TARGETS = [1, 5, 10, 20, 25];
  const LEVEL_NAMES = ['Rookie', 'Novice', 'Semi-Pro', 'Pro', 'MVP'];

  function currentSeason() {
    const m = new Date().getMonth() + 1;
    if (m >= 3 && m <= 5) return 'spring';
    if (m >= 6 && m <= 8) return 'summer';
    if (m >= 9 && m <= 11) return 'fall';
    return 'winter';
  }

  // ─── CONFIGS ──────────────────────────────────────────────────────────────

  const CONFIGS = {

    outdoors: {
      label: 'Outdoors', icon: '🌲',
      categories: [
        { key: 'trailhead',    label: 'Trailheads',         icon: '🥾' },
        { key: 'waterfall',    label: 'Waterfalls',          icon: '💧' },
        { key: 'scenic',       label: 'Scenic Overlooks',    icon: '🏔️' },
        { key: 'campground',   label: 'Campgrounds',         icon: '⛺' },
        { key: 'state-park',   label: 'State Parks',         icon: '🌲' },
        { key: 'national-park',label: 'National Parks',      icon: '🏔️' },
        { key: 'beach',        label: 'Public Beaches',      icon: '🏖️' },
        { key: 'lake',         label: 'Lakes & Ponds',       icon: '🏞️' },
        { key: 'rec-area',     label: 'Recreation Areas',    icon: '🏕️' },
        { key: 'gardens',      label: 'Botanical Gardens',   icon: '🌺' },
      ],
      challenges: [
        { id: 'ch-trailhead',    icon:'🥾', title:'Trailhead Seeker',   tip:'Visit 3 trailheads.',                      goal: 3,  cat: 'trailhead' },
        { id: 'ch-waterfall',    icon:'💧', title:'Waterfall Hunter',    tip:'Discover 3 waterfalls.',                   goal: 3,  cat: 'waterfall' },
        { id: 'ch-scenic',       icon:'🏔️', title:'Overlook Explorer',  tip:'Find 3 scenic overlooks or viewpoints.',   goal: 3,  cat: 'scenic' },
        { id: 'ch-camp',         icon:'⛺', title:'Campfire Nights',     tip:'Camp at 2 campgrounds.',                   goal: 2,  cat: 'campground' },
        { id: 'ch-state-park',   icon:'🌲', title:'State Park Tour',     tip:'Visit 2 state parks.',                     goal: 2,  cat: 'state-park' },
        { id: 'ch-natl-park',    icon:'🏔️', title:'National Park Day',  tip:'Visit 1 national park.',                   goal: 1,  cat: 'national-park' },
        { id: 'ch-beach',        icon:'🏖️', title:'Shoreline Explorer',  tip:'Swim at 2 public beaches.',               goal: 2,  cat: 'beach' },
        { id: 'ch-lake',         icon:'🏞️', title:'Lake & Pond Loop',    tip:'Explore 3 lakes or ponds.',               goal: 3,  cat: 'lake' },
        { id: 'ch-gardens',      icon:'🌺', title:'Garden Stroll',        tip:'Visit 2 botanical gardens.',              goal: 2,  cat: 'gardens' },
        { id: 'ch-rec',          icon:'🏕️', title:'Recreation Champion', tip:'Complete 4 recreation or day-use areas.', goal: 4,  cat: 'rec-area' },
      ],
      badges: [
        { id:'b-trail-starter',  icon:'🥾', title:'Trail Starter',      rarity:'common',    goal:1,  metric:'trailhead',    description:'Visit your first trailhead.' },
        { id:'b-waterfall-3',    icon:'💧', title:'Waterfall Seeker',    rarity:'rare',      goal:3,  metric:'waterfall',    description:'Discover 3 waterfalls.' },
        { id:'b-park-ranger',    icon:'🌲', title:'Park Ranger',         rarity:'rare',      goal:5,  metric:'state-park',   description:'Visit 5 state or national parks.' },
        { id:'b-camp-explorer',  icon:'⛺', title:'Camp Explorer',       rarity:'rare',      goal:3,  metric:'campground',   description:'Camp at 3 campgrounds.' },
        { id:'b-lake-walker',    icon:'🏞️', title:'Lake Walker',         rarity:'epic',      goal:5,  metric:'lake',         description:'Visit 5 lakes or ponds.' },
        { id:'b-summit-chaser',  icon:'🏔️', title:'Summit Chaser',      rarity:'epic',      goal:5,  metric:'scenic',       description:'Visit 5 scenic overlooks.' },
        { id:'b-beach-goer',     icon:'🏖️', title:'Beach Goer',         rarity:'rare',      goal:3,  metric:'beach',        description:'Visit 3 public beaches.' },
        { id:'b-garden-lover',   icon:'🌺', title:'Garden Lover',        rarity:'rare',      goal:2,  metric:'gardens',      description:'Visit 2 botanical gardens.' },
        { id:'b-devotee',        icon:'🌟', title:'Outdoors Devotee',    rarity:'legendary', goal:15, metric:'total',        description:'Log 15 outdoor location visits.' },
        { id:'b-champion',       icon:'🏆', title:'Nature Champion',     rarity:'legendary', goal:6,  metric:'challenges',   description:'Complete 6 outdoor challenges.' },
      ],
      quests: [
        { id:'q-spring', season:'spring', title:'Spring Awakening',   steps:['Visit 3 parks or gardens','Find a waterfall','Hike a trail'] },
        { id:'q-summer', season:'summer', title:'Summer Expedition',  steps:['Swim at a public beach','Visit a recreation area','Camp overnight'] },
        { id:'q-fall',   season:'fall',   title:'Fall Foliage Tour',  steps:['Visit 3 scenic overlooks','Explore a state park','Find a lake or pond'] },
        { id:'q-winter', season:'winter', title:'Winter Wild Side',   steps:['Find a waterfall (brave the cold!)','Hike a trailhead','Visit a botanical garden'] },
      ],
      bingo: [
        { key:'trailhead',    label:'Trailhead',         icon:'🥾' },
        { key:'waterfall',    label:'Waterfall',         icon:'💧' },
        { key:'state-park',   label:'State Park',        icon:'🌲' },
        { key:'campground',   label:'Campground',        icon:'⛺' },
        { key:'scenic',       label:'Scenic Overlook',   icon:'🏔️' },
        { key:'lake',         label:'Lake or Pond',      icon:'🏞️' },
        { key:'beach',        label:'Public Beach',      icon:'🏖️' },
        { key:'national-park',label:'National Park',     icon:'🏔️' },
        { key:'gardens',      label:'Botanical Garden',  icon:'🌺' },
      ]
    },

    entertainment: {
      label: 'Entertainment', icon: '🎬',
      categories: [
        { key: 'movie-theater',   label: 'Movie Theaters',     icon: '🎬' },
        { key: 'escape-room',     label: 'Escape Rooms',        icon: '🔐' },
        { key: 'bowling',         label: 'Bowling Alleys',      icon: '🎳' },
        { key: 'museum',          label: 'Museums',             icon: '🏛️' },
        { key: 'art-gallery',     label: 'Art Galleries',       icon: '🖼️' },
        { key: 'amusement-park',  label: 'Amusement Parks',     icon: '🎡' },
        { key: 'arcade',          label: 'Arcades',             icon: '🕹️' },
        { key: 'theater-live',    label: 'Live Performances',   icon: '🎭' },
        { key: 'rock-climb',      label: 'Rock Climbing',       icon: '🧗' },
        { key: 'water-park',      label: 'Water Parks',         icon: '💦' },
        { key: 'ice-skate',       label: 'Ice & Roller Skate',  icon: '⛸️' },
        { key: 'historical',      label: 'Historical Sites',    icon: '🏛️' },
      ],
      challenges: [
        { id:'ch-movies',    icon:'🎬', title:'Movie Nights',         tip:'See movies at 2 theaters.',              goal:2, cat:'movie-theater' },
        { id:'ch-escape',    icon:'🔐', title:'Escape Artist',         tip:'Solve 2 escape rooms.',                  goal:2, cat:'escape-room' },
        { id:'ch-bowl',      icon:'🎳', title:'Bowling League',        tip:'Bowl at 2 different alleys.',            goal:2, cat:'bowling' },
        { id:'ch-museum',    icon:'🏛️', title:'Museum Hopper',        tip:'Visit 2 museums.',                       goal:2, cat:'museum' },
        { id:'ch-amusement', icon:'🎡', title:'Thrill Rides',          tip:'Visit an amusement park.',               goal:1, cat:'amusement-park' },
        { id:'ch-climb',     icon:'🧗', title:'Vertical Challenge',    tip:'Rock climb or try a ropes course.',      goal:1, cat:'rock-climb' },
        { id:'ch-live-show', icon:'🎭', title:'Night Out',              tip:'Attend 2 live performances.',            goal:2, cat:'theater-live' },
        { id:'ch-gallery',   icon:'🖼️', title:'Gallery Walk',          tip:'Browse 2 art galleries.',                goal:2, cat:'art-gallery' },
        { id:'ch-arcade',    icon:'🕹️', title:'Arcade Marathon',       tip:'Visit 3 arcades.',                       goal:3, cat:'arcade' },
        { id:'ch-waterpark', icon:'💦', title:'Water Park Day',         tip:'Visit a water park.',                    goal:1, cat:'water-park' },
      ],
      badges: [
        { id:'b-cinephile',    icon:'🎬', title:'Cinephile',          rarity:'common',    goal:2, metric:'movie-theater',  description:'Visit 2 movie theaters.' },
        { id:'b-escapologist', icon:'🔐', title:'Escapologist',       rarity:'rare',      goal:2, metric:'escape-room',    description:'Complete 2 escape rooms.' },
        { id:'b-pin-crusher',  icon:'🎳', title:'Pin Crusher',        rarity:'rare',      goal:3, metric:'bowling',        description:'Bowl at 3 alleys.' },
        { id:'b-culture-buff', icon:'🏛️', title:'Culture Buff',       rarity:'rare',      goal:3, metric:'museum',        description:'Visit 3 museums or galleries.' },
        { id:'b-thrill',       icon:'🎡', title:'Thrill Seeker',      rarity:'common',    goal:1, metric:'amusement-park', description:'Visit an amusement park.' },
        { id:'b-climber',      icon:'🧗', title:'Climber',             rarity:'rare',      goal:1, metric:'rock-climb',    description:'Rock climb or try a ropes course.' },
        { id:'b-showgoer',     icon:'🎭', title:'Showgoer',            rarity:'epic',      goal:2, metric:'theater-live',  description:'Attend 2 live performances.' },
        { id:'b-ice-glider',   icon:'⛸️', title:'Ice Glider',         rarity:'common',    goal:1, metric:'ice-skate',     description:'Ice skate or roller skate.' },
        { id:'b-arcade-champ', icon:'🕹️', title:'Arcade Champion',    rarity:'epic',      goal:3, metric:'arcade',        description:'Visit 3 arcades.' },
        { id:'b-ent-master',   icon:'🌟', title:'Entertainment Master',rarity:'legendary', goal:20,metric:'total',         description:'Visit 20 entertainment locations.' },
      ],
      quests: [
        { id:'q-spring', season:'spring', title:'Spring Fun',         steps:['Visit an apple orchard','Attend an outdoor performance','Try rock climbing'] },
        { id:'q-summer', season:'summer', title:'Summer Splash',      steps:['Hit a water park','Go roller skating','Visit an arcade'] },
        { id:'q-fall',   season:'fall',   title:'Fall Culture',        steps:['Visit a museum','See a symphony or orchestra','Watch a movie at a theater'] },
        { id:'q-winter', season:'winter', title:'Winter Entertainment',steps:['Ice skating trip','Solve an escape room','See a live theater performance'] },
      ],
      bingo: [
        { key:'movie-theater',  label:'Movie Theater',   icon:'🎬' },
        { key:'museum',         label:'Museum',          icon:'🏛️' },
        { key:'escape-room',    label:'Escape Room',     icon:'🔐' },
        { key:'bowling',        label:'Bowling Alley',   icon:'🎳' },
        { key:'amusement-park', label:'Amusement Park',  icon:'🎡' },
        { key:'rock-climb',     label:'Rock Climbing',   icon:'🧗' },
        { key:'theater-live',   label:'Live Theater',    icon:'🎭' },
        { key:'arcade',         label:'Arcade',          icon:'🕹️' },
        { key:'water-park',     label:'Water Park',      icon:'💦' },
      ]
    },

    'food-drink': {
      label: 'Food & Drink', icon: '🍽️',
      categories: [
        { key: 'coffee',      label: 'Coffee & Tea',         icon: '☕' },
        { key: 'pub',         label: 'Pubs & Bars',           icon: '🍺' },
        { key: 'bakery',      label: 'Bakeries',              icon: '🥐' },
        { key: 'pizza',       label: 'Pizza',                 icon: '🍕' },
        { key: 'sushi',       label: 'Sushi & Ramen',         icon: '🍣' },
        { key: 'asian',       label: 'Asian Cuisines',        icon: '🥢' },
        { key: 'bbq',         label: 'BBQ & American',        icon: '🔥' },
        { key: 'mexican',     label: 'Mexican & Latin',       icon: '🌮' },
        { key: 'breakfast',   label: 'Breakfast & Diners',    icon: '🍳' },
        { key: 'ice-cream',   label: 'Ice Cream & Desserts',  icon: '🍦' },
        { key: 'seafood',     label: 'Seafood & Steak',       icon: '🦞' },
        { key: 'european',    label: 'European Cuisines',     icon: '🥨' },
      ],
      challenges: [
        { id:'ch-coffee',    icon:'☕', title:'Coffee Circuit',      tip:'Try 5 different coffee shops.',              goal:5, cat:'coffee' },
        { id:'ch-pizza',     icon:'🍕', title:'Pizza Tour',           tip:'Find the best pizza at 2 pizzerias.',       goal:2, cat:'pizza' },
        { id:'ch-sushi',     icon:'🍣', title:'Sushi Quest',          tip:'Visit 3 sushi spots.',                      goal:3, cat:'sushi' },
        { id:'ch-bbq',       icon:'🔥', title:'BBQ Trail',            tip:'Hit 3 BBQ joints.',                         goal:3, cat:'bbq' },
        { id:'ch-mexican',   icon:'🌮', title:'Taco Explorer',        tip:'Visit 3 Mexican or Latin spots.',           goal:3, cat:'mexican' },
        { id:'ch-breakfast', icon:'🍳', title:'Morning Glory',        tip:'Visit 4 breakfast or diner spots.',         goal:4, cat:'breakfast' },
        { id:'ch-bakery',    icon:'🥐', title:'Bakery Trail',         tip:'Discover 3 bakeries.',                      goal:3, cat:'bakery' },
        { id:'ch-pub',       icon:'🍺', title:'Pub Night',            tip:'Visit 3 pubs.',                             goal:3, cat:'pub' },
        { id:'ch-ice-cream', icon:'🍦', title:'Ice Cream Tour',       tip:'Try 4 ice cream spots.',                    goal:4, cat:'ice-cream' },
        { id:'ch-global',    icon:'🌍', title:'Global Foodie',        tip:'Try 8 different cuisine types.',            goal:8, cat:null },
      ],
      badges: [
        { id:'b-caffeine',   icon:'☕', title:'Caffeine Addict',      rarity:'rare',      goal:5,  metric:'coffee',     description:'Visit 5 coffee shops.' },
        { id:'b-pizza',      icon:'🍕', title:'Pizza Lover',          rarity:'common',    goal:3,  metric:'pizza',      description:'Visit 3 pizza spots.' },
        { id:'b-sushi-chef', icon:'🍣', title:'Sushi Chef',           rarity:'rare',      goal:3,  metric:'sushi',      description:'Visit 3 sushi spots.' },
        { id:'b-bbq-master', icon:'🔥', title:'BBQ Master',           rarity:'rare',      goal:4,  metric:'bbq',        description:'Visit 4 BBQ spots.' },
        { id:'b-taco',       icon:'🌮', title:'Taco Enthusiast',      rarity:'common',    goal:3,  metric:'mexican',    description:'Visit 3 Mexican spots.' },
        { id:'b-breakfast',  icon:'🍳', title:'Breakfast Club',       rarity:'epic',      goal:5,  metric:'breakfast',  description:'Visit 5 breakfast/diner spots.' },
        { id:'b-pub',        icon:'🍺', title:'Pub Crawler',          rarity:'rare',      goal:4,  metric:'pub',        description:'Visit 4 pubs.' },
        { id:'b-sweet-tooth',icon:'🍦', title:'Sweet Tooth',          rarity:'rare',      goal:5,  metric:'ice-cream',  description:'Visit 5 dessert spots.' },
        { id:'b-world-food', icon:'🌍', title:'World Traveler',       rarity:'epic',      goal:8,  metric:'total',      description:'Try 8 different cuisine types.' },
        { id:'b-foodie',     icon:'🏆', title:'Foodie Champion',      rarity:'legendary', goal:30, metric:'total',      description:'Visit 30 food & drink locations.' },
      ],
      quests: [
        { id:'q-spring', season:'spring', title:'Spring Sips',        steps:['Discover 3 coffee or tea shops','Try a new bakery','Find a poke or Hawaiian spot'] },
        { id:'q-summer', season:'summer', title:'Summer Flavors',     steps:['Ice cream tour (3 spots)','Try a poke bowl','Visit 2 seafood spots'] },
        { id:'q-fall',   season:'fall',   title:'Fall Comfort Food',  steps:['2 BBQ joints','Find a cozy diner or breakfast spot','Try a German or Irish pub'] },
        { id:'q-winter', season:'winter', title:'Winter Warmth',      steps:['Hot ramen or hotpot visit','Irish pub night','Bakery for warm pastries'] },
      ],
      bingo: [
        { key:'coffee',    label:'Coffee Shop', icon:'☕' },
        { key:'sushi',     label:'Sushi',       icon:'🍣' },
        { key:'bbq',       label:'BBQ',         icon:'🔥' },
        { key:'pizza',     label:'Pizza',       icon:'🍕' },
        { key:'bakery',    label:'Bakery',      icon:'🥐' },
        { key:'pub',       label:'Pub',         icon:'🍺' },
        { key:'ice-cream', label:'Ice Cream',   icon:'🍦' },
        { key:'mexican',   label:'Mexican',     icon:'🌮' },
        { key:'breakfast', label:'Breakfast',   icon:'🍳' },
      ]
    },

    retail: {
      label: 'Retail', icon: '🛍️',
      categories: [
        { key: 'thrift',     label: 'Thrift & Consignment', icon: '👗' },
        { key: 'bargain',    label: 'Bargain Stores',        icon: '🛍️' },
        { key: 'grocery',    label: 'Grocery Stores',        icon: '🛒' },
        { key: 'specialty',  label: 'Specialty Markets',     icon: '🥡' },
        { key: 'home',       label: 'Home & Improvement',    icon: '🏠' },
        { key: 'antiques',   label: 'Antiques Malls',        icon: '🏺' },
        { key: 'art',        label: 'Local Art & Pottery',   icon: '🖼️' },
        { key: 'crafts',     label: 'Craft Malls',           icon: '🎨' },
        { key: 'pet',        label: 'Pet Stores',            icon: '🐾' },
        { key: 'mall',       label: 'Shopping Malls',        icon: '🏪' },
        { key: 'flea',       label: 'Flea Markets',          icon: '🏷️' },
        { key: 'bike-shop',  label: 'Bike Shops',            icon: '🚴' },
      ],
      challenges: [
        { id:'ch-thrift',   icon:'👗', title:'Thrift Hunter',       tip:'Score treasures at 3 thrift stores.',      goal:3, cat:'thrift' },
        { id:'ch-bargain',  icon:'🛍️', title:'Bargain Blitz',       tip:'Hit 3 bargain discount stores.',           goal:3, cat:'bargain' },
        { id:'ch-grocery',  icon:'🛒', title:'Grocery Tour',        tip:'Shop at 4 different grocery chains.',      goal:4, cat:'grocery' },
        { id:'ch-flea',     icon:'🏷️', title:'Flea Market Find',    tip:'Explore a flea market.',                   goal:1, cat:'flea' },
        { id:'ch-antiques', icon:'🏺', title:'Antique Explorer',    tip:'Browse 2 antiques malls.',                 goal:2, cat:'antiques' },
        { id:'ch-local-art',icon:'🖼️', title:'Art Patron',          tip:'Support local art or pottery studio.',     goal:1, cat:'art' },
        { id:'ch-crafts',   icon:'🎨', title:'Craft Lover',         tip:'Browse 2 craft malls.',                    goal:2, cat:'crafts' },
        { id:'ch-specialty',icon:'🥡', title:'World Market',        tip:'Shop at an Asian or Mexican market.',      goal:1, cat:'specialty' },
        { id:'ch-pet',      icon:'🐾', title:'Pet Lover',           tip:'Visit a pet store.',                       goal:1, cat:'pet' },
        { id:'ch-mall',     icon:'🏪', title:'Mall Day',            tip:'Spend a day at a shopping mall.',          goal:1, cat:'mall' },
      ],
      badges: [
        { id:'b-bargain-hunter', icon:'🛍️', title:'Bargain Hunter',    rarity:'common',    goal:3,  metric:'thrift',    description:'Visit 3 thrift or bargain stores.' },
        { id:'b-antique-coll',   icon:'🏺', title:'Antique Collector',  rarity:'rare',      goal:2,  metric:'antiques',  description:'Browse 2 antiques malls.' },
        { id:'b-art-patron',     icon:'🖼️', title:'Art Patron',         rarity:'rare',      goal:1,  metric:'art',       description:'Visit a local art shop or pottery studio.' },
        { id:'b-world-market',   icon:'🥡', title:'World Market',       rarity:'rare',      goal:1,  metric:'specialty', description:'Shop at an Asian or Mexican market.' },
        { id:'b-home-improver',  icon:'🏠', title:'Home Improver',      rarity:'common',    goal:2,  metric:'home',      description:'Visit 2 home improvement stores.' },
        { id:'b-animal-friend',  icon:'🐾', title:'Animal Friend',      rarity:'common',    goal:1,  metric:'pet',       description:'Visit a pet store.' },
        { id:'b-craft-lover',    icon:'🎨', title:'Craft Lover',        rarity:'rare',      goal:2,  metric:'crafts',    description:'Browse 2 craft malls.' },
        { id:'b-grocery-exp',    icon:'🛒', title:'Grocery Explorer',   rarity:'epic',      goal:5,  metric:'grocery',   description:'Visit 5 different grocery stores.' },
        { id:'b-market-maven',   icon:'🏷️', title:'Market Maven',       rarity:'rare',      goal:1,  metric:'flea',      description:'Explore a flea market.' },
        { id:'b-retail-royalty', icon:'🏆', title:'Retail Royalty',     rarity:'legendary', goal:15, metric:'total',     description:'Visit 15 retail locations.' },
      ],
      quests: [
        { id:'q-spring', season:'spring', title:'Spring Finds',     steps:['Flea market visit','Local art or pottery shop','Asian or specialty market'] },
        { id:'q-summer', season:'summer', title:'Summer Shopping',  steps:['2 specialty market visits','Bike shop stop','Shopping mall day'] },
        { id:'q-fall',   season:'fall',   title:'Fall Hunting',     steps:['Antiques mall browse','Craft mall visit','3 different grocery stores'] },
        { id:'q-winter', season:'winter', title:'Winter Deals',     steps:['3 thrift or bargain stores','HomeGoods or home store','Pet store visit'] },
      ],
      bingo: [
        { key:'thrift',    label:'Thrift Store',  icon:'👗' },
        { key:'flea',      label:'Flea Market',   icon:'🏷️' },
        { key:'specialty', label:'Asian Market',  icon:'🥡' },
        { key:'antiques',  label:'Antiques Mall', icon:'🏺' },
        { key:'art',       label:'Local Art',     icon:'🖼️' },
        { key:'crafts',    label:'Craft Mall',    icon:'🎨' },
        { key:'bargain',   label:'Bargain Store', icon:'🛍️' },
        { key:'pet',       label:'Pet Store',     icon:'🐾' },
        { key:'mall',      label:'Shopping Mall', icon:'🏪' },
      ]
    },

    'wildlife-animals': {
      label: 'Wildlife & Animals', icon: '🦌',
      categories: [
        { key: 'farm',      label: 'Farms',             icon: '🐄' },
        { key: 'petting',   label: 'Petting Zoos',      icon: '🐐' },
        { key: 'wildlife',  label: 'Wildlife Rehab',    icon: '🦅' },
        { key: 'rescue',    label: 'Animal Rescues',    icon: '🐾' },
        { key: 'cat-cafe',  label: 'Cat Cafes',         icon: '🐱' },
        { key: 'aquarium',  label: 'Aquariums',         icon: '🐠' },
        { key: 'zoo',       label: 'Zoos',              icon: '🦁' },
        { key: 'safari',    label: 'Drive-Thru Safari', icon: '🦒' },
        { key: 'sanctuary', label: 'Animal Sanctuaries',icon: '🦋' },
      ],
      challenges: [
        { id:'ch-zoo',      icon:'🦁', title:'Zoo Day',            tip:'Visit a zoo.',                              goal:1, cat:'zoo' },
        { id:'ch-safari',   icon:'🦒', title:'Safari Adventure',  tip:'Go on a drive-thru safari.',                goal:1, cat:'safari' },
        { id:'ch-aquarium', icon:'🐠', title:'Aquarium Dive',      tip:'Visit an aquarium.',                        goal:1, cat:'aquarium' },
        { id:'ch-rehab',    icon:'🦅', title:'Wildlife Support',   tip:'Support a wildlife rehab center.',          goal:1, cat:'wildlife' },
        { id:'ch-rescue',   icon:'🐾', title:'Animal Rescue',     tip:'Visit an animal rescue.',                   goal:1, cat:'rescue' },
        { id:'ch-sanctuary',icon:'🦋', title:'Sanctuary Visit',   tip:'Visit an animal sanctuary.',                goal:1, cat:'sanctuary' },
        { id:'ch-farm',     icon:'🐄', title:'Farm & Petting Zoo', tip:'Visit 2 farms or petting zoos.',            goal:2, cat:'farm' },
        { id:'ch-cat-cafe', icon:'🐱', title:'Cat Cafe Chill',    tip:'Enjoy a cat cafe.',                         goal:1, cat:'cat-cafe' },
      ],
      badges: [
        { id:'b-farm',      icon:'🐄', title:'Farm Friend',       rarity:'common',    goal:1, metric:'farm',      description:'Visit a farm.' },
        { id:'b-cat-lover', icon:'🐱', title:'Cat Lover',         rarity:'common',    goal:1, metric:'cat-cafe',  description:'Visit a cat cafe.' },
        { id:'b-sea-diver', icon:'🐠', title:'Deep Sea Diver',    rarity:'rare',      goal:1, metric:'aquarium',  description:'Visit an aquarium.' },
        { id:'b-safari',    icon:'🦁', title:'Safari Explorer',   rarity:'rare',      goal:1, metric:'zoo',       description:'Visit a zoo or drive-thru safari.' },
        { id:'b-advocate',  icon:'🐾', title:'Animal Advocate',   rarity:'epic',      goal:2, metric:'rescue',    description:'Support 2 rescues or rehab centers.' },
        { id:'b-sanctuary', icon:'🦋', title:'Sanctuary Seeker',  rarity:'rare',      goal:1, metric:'sanctuary', description:'Visit an animal sanctuary.' },
        { id:'b-petting',   icon:'🐐', title:'Petting Pro',       rarity:'epic',      goal:3, metric:'petting',   description:'Visit 3 petting zoos or farms.' },
        { id:'b-champion',  icon:'🏆', title:'Wildlife Champion', rarity:'legendary', goal:9, metric:'total_types',description:'Visit all 9 types of wildlife locations.' },
      ],
      quests: [
        { id:'q-spring', season:'spring', title:'Spring Animals',   steps:['Farm visit','Petting zoo','Wildlife rehab support'] },
        { id:'q-summer', season:'summer', title:'Summer Wild',      steps:['Aquarium visit','Drive-thru safari','Animal sanctuary'] },
        { id:'q-fall',   season:'fall',   title:'Fall Creatures',   steps:['Zoo trip','Animal rescue visit','Cat cafe'] },
        { id:'q-winter', season:'winter', title:'Winter Warmth',    steps:['Cat cafe visit','Indoor aquarium or zoo','Wildlife rehab support'] },
      ],
      bingo: [
        { key:'zoo',      label:'Zoo',              icon:'🦁' },
        { key:'aquarium', label:'Aquarium',         icon:'🐠' },
        { key:'farm',     label:'Farm',             icon:'🐄' },
        { key:'petting',  label:'Petting Zoo',      icon:'🐐' },
        { key:'cat-cafe', label:'Cat Cafe',         icon:'🐱' },
        { key:'wildlife', label:'Wildlife Rehab',   icon:'🦅' },
        { key:'rescue',   label:'Animal Rescue',    icon:'🐾' },
        { key:'safari',   label:'Drive-Thru Safari',icon:'🦒' },
        { key:'sanctuary',label:'Animal Sanctuary', icon:'🦋' },
      ]
    }
  };

  // ─── State helpers ─────────────────────────────────────────────────────────
  function loadState() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch { return {}; }
  }
  function saveState(s) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch {}
  }
  function getSubState(state, key) {
    if (!state[key]) state[key] = { categories: {}, challenges: {}, badges: {}, bingo: {}, quest: {} };
    return state[key];
  }
  function getSubSettings(state, key) {
    if (!state.__settings) state.__settings = {};
    if (!state.__settings[key]) state.__settings[key] = { mode: 'balanced' };
    if (!MATCH_MODES[state.__settings[key].mode]) state.__settings[key].mode = 'balanced';
    return state.__settings[key];
  }
  function getVal(obj, id) { return Number(obj?.[id] ?? 0); }

  // ─── Helpers ───────────────────────────────────────────────────────────────
  function pct(val, goal) { return Math.round(Math.min(100, (val / Math.max(1, goal)) * 100)); }
  function esc(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function norm(s) { return String(s ?? '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function looksLikePlaceId(value) { return /^ChI[A-Za-z0-9_-]{6,}$/.test(String(value || '').trim()); }
  function toHumanLabel(value) {
    return String(value || '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function challengeObjectiveLabel(challenge, target) {
    const plus = target >= 15 ? '+' : '';
    const focus = challenge.cat ? toHumanLabel(challenge.cat) : 'locations';
    return `Visit ${target}${plus} ${focus}`;
  }

  const CATEGORY_KEYWORDS = {
    outdoors: {
      trailhead: ['trailhead', 'hiking'],
      waterfall: ['waterfall'],
      scenic: ['scenic overlook', 'scenic viewpoint', 'scenic view', 'overlook'],
      campground: ['campground', 'camp site', 'camping'],
      'state-park': ['state park'],
      'national-park': ['national park'],
      beach: ['public beach', 'beach'],
      lake: ['lake', 'pond'],
      'rec-area': ['recreation area', 'day use area', 'picnic area'],
      gardens: ['botanical garden', 'botanical gardens']
    },
    entertainment: {
      'movie-theater': ['movie theater'],
      'escape-room': ['escape room'],
      bowling: ['bowling alley', 'bowling'],
      museum: ['museum'],
      'art-gallery': ['art gallery'],
      'amusement-park': ['amusement park'],
      arcade: ['arcade'],
      'theater-live': ['theater', 'symphony', 'orchestra'],
      'rock-climb': ['rock climbing', 'ropes course', 'zip lining', 'zip-lining'],
      'water-park': ['water park', 'swimming pool'],
      'ice-skate': ['ice skating', 'roller skating', 'ice skating rink', 'roller skating rink'],
      historical: ['historical site', 'railroad', 'rail carts']
    },
    'food-drink': {
      coffee: ['coffee shop', 'coffee', 'tea shop', 'cafe'],
      pub: ['pub', 'bar', 'irish'],
      bakery: ['bakery'],
      pizza: ['pizza'],
      sushi: ['sushi', 'ramen', 'japanese'],
      asian: ['chinese', 'thai', 'tai', 'korean', 'hibachi', 'hotpot', 'jamaican', 'hawaiian', 'poke'],
      bbq: ['bbq', 'wings', 'steakhouse'],
      mexican: ['mexican', 'tamales', 'burritos', 'cajun'],
      breakfast: ['breakfast', 'diner'],
      'ice-cream': ['ice cream', 'snow cone'],
      seafood: ['seafood'],
      european: ['german', 'italian']
    },
    retail: {
      thrift: ['thrift'],
      bargain: ['tjmaxx', 'homegoods', 'ross', 'marshalls', 'ollies', 'roses discount', 'sierra', 'grocery outlet'],
      grocery: ['aldi', 'publix', 'ingles', 'grocery'],
      specialty: ['asian market', 'mexican market'],
      home: ['lowes', 'homegoods', 'home improvement'],
      antiques: ['antiques mall', 'antiques'],
      art: ['local art', 'local pottery'],
      crafts: ['craft mall'],
      pet: ['pet store'],
      mall: ['shopping mall'],
      flea: ['flea market'],
      'bike-shop': ['bike shop']
    },
    'wildlife-animals': {
      farm: ['farm'],
      petting: ['petting zoo'],
      wildlife: ['wildlife rehab'],
      rescue: ['animal rescue', 'rescue'],
      'cat-cafe': ['cat cafe', 'cat café'],
      aquarium: ['aquarium'],
      zoo: ['zoo'],
      safari: ['drive thru safari', 'drive-thru safari', 'safari'],
      sanctuary: ['animal sanctuary', 'sanctuary']
    }
  };

  function collectExplorerItems(subtabKey) {
    const runtime = window.__visitedState;
    const exp = runtime?.subtabExplorer?.[subtabKey];
    if (!exp || !Array.isArray(exp.items)) return { loaded: false, items: [] };
    return { loaded: Boolean(exp.loaded), items: exp.items };
  }

  function collectVisitedSignals() {
    const visitMap = window.__visitedState?.latestVisitMap || {};
    const names = new Set();
    const placeIds = new Set();
    Object.values(visitMap).forEach((entry) => {
      const name = norm(entry?.name || '');
      if (name) names.add(name);
      const pid = String(entry?.placeId || '').trim();
      if (looksLikePlaceId(pid)) placeIds.add(pid);
    });

    Object.keys(visitMap).forEach((idKey) => {
      const token = String(idKey || '').split(':').slice(1).join(':').trim();
      if (!token) return;
      if (looksLikePlaceId(token)) {
        placeIds.add(token);
      } else {
        const n = norm(token);
        if (n) names.add(n);
      }
    });

    return { names, placeIds };
  }

  function classifyCategoryKeys(subtabKey, item) {
    const haystack = [
      item?.title,
      item?.name,
      item?.description,
      item?.sourceLabel,
      Array.isArray(item?.tags) ? item.tags.join(' ') : item?.tags
    ].map(norm).join(' ');
    const keywordMap = CATEGORY_KEYWORDS[subtabKey] || {};
    return Object.keys(keywordMap).filter((catKey) => {
      const keywords = keywordMap[catKey] || [];
      return keywords.some((kw) => haystack.includes(norm(kw)));
    });
  }

  function resolveExplorerItemMatch(item, visitedSignals, mode) {
    const itemPlaceId = String(item?.placeId || '').trim();
    if (mode !== 'name-only' && looksLikePlaceId(itemPlaceId) && visitedSignals.placeIds.has(itemPlaceId)) {
      return { matched: true, source: 'placeId' };
    }

    const title = norm(item?.title || item?.name || '');
    if (!title) return { matched: false, source: 'none' };
    if (visitedSignals.names.has(title)) return { matched: true, source: 'exact' };
    if (mode === 'strict') return { matched: false, source: 'none' };

    // Fuzzy fallback for small title variations.
    for (const seen of visitedSignals.names) {
      if (seen.length < 6 || title.length < 6) continue;
      if (seen.includes(title) || title.includes(seen)) return { matched: true, source: 'fuzzy' };
    }
    return { matched: false, source: 'none' };
  }

  function buildProgressModel(subtabKey, config, sub, settings) {
    const mode = settings?.mode || 'balanced';
    const isManual = mode === 'manual';
    const categoryTotals = {};
    const categoryVisited = {};
    config.categories.forEach((cat) => {
      categoryTotals[cat.key] = 0;
      categoryVisited[cat.key] = 0;
    });

    const explorer = collectExplorerItems(subtabKey);
    const visitedSignals = collectVisitedSignals();
    const matchStats = { placeId: 0, exact: 0, fuzzy: 0 };
    let categorizedRows = 0;

    if (isManual) {
      config.categories.forEach((cat) => {
        categoryVisited[cat.key] = getVal(sub.categories, cat.key);
      });
    } else if (explorer.loaded && explorer.items.length) {
      explorer.items.forEach((item) => {
        const matched = classifyCategoryKeys(subtabKey, item);
        if (!matched.length) return;
        categorizedRows += 1;
        const matchResult = resolveExplorerItemMatch(item, visitedSignals, mode);
        const visited = Boolean(matchResult && matchResult.matched);
        const source = String((matchResult && matchResult.source) || 'none');
        if (visited && Object.prototype.hasOwnProperty.call(matchStats, source)) {
          matchStats[source] += 1;
        }
        matched.forEach((catKey) => {
          if (!(catKey in categoryTotals)) return;
          categoryTotals[catKey] += 1;
          if (visited) categoryVisited[catKey] += 1;
        });
      });
    } else {
      // Fallback to persisted manual counts when explorer data has not loaded yet.
      config.categories.forEach((cat) => {
        categoryVisited[cat.key] = getVal(sub.categories, cat.key);
      });
    }

    const challengesById = {};
    config.challenges.forEach((challenge) => {
      let progress = 0;
      if (isManual) {
        progress = getVal(sub.challenges, challenge.id);
      } else if (challenge.cat) {
        progress = categoryVisited[challenge.cat] || 0;
      } else {
        progress = Object.values(categoryVisited).filter((count) => count > 0).length;
      }
      challengesById[challenge.id] = progress;
    });

    return {
      mode,
      modeLabel: MATCH_MODES[mode]?.label || MATCH_MODES.balanced.label,
      modeHelp: MATCH_MODES[mode]?.help || MATCH_MODES.balanced.help,
      autoMode: !isManual && explorer.loaded && explorer.items.length > 0,
      explorerLoaded: explorer.loaded,
      matchStats,
      matchBreakdownText: isManual
        ? 'Manual mode active - auto-match breakdown is disabled.'
        : `Matched by place ID: ${matchStats.placeId} | exact name: ${matchStats.exact} | fuzzy: ${matchStats.fuzzy} | catalog rows scanned: ${explorer.items.length} | categorized rows: ${categorizedRows}${explorer.loaded && explorer.items.length > 0 ? '' : ' (open explorer to sync counts)'}`,
      categoryTotals,
      categoryVisited,
      challengesById,
      totalVisited: Object.values(categoryVisited).reduce((sum, n) => sum + n, 0)
    };
  }

  // ─── Renderers ─────────────────────────────────────────────────────────────

  function renderSyncModeSection(key, progress) {
    const options = Object.keys(MATCH_MODES).map((modeKey) => {
      const mode = MATCH_MODES[modeKey];
      return `<option value="${modeKey}" ${progress.mode === modeKey ? 'selected' : ''}>${esc(mode.label)}</option>`;
    }).join('');

    return `
      <div class="card adventure-achv-section">
        <div class="card-header">
          <div>
            <div class="card-title">⚙️ Sync Mode</div>
            <div class="card-subtitle">Choose how matching works. You can switch to manual fallback anytime.</div>
          </div>
          <div class="adventure-achv-count-badge">${esc(progress.modeLabel)}</div>
        </div>
        <div style="display:grid;gap:8px;grid-template-columns:minmax(220px,380px) 1fr;align-items:center;">
          <select class="filter-select" data-achv-sync-mode data-achv-subtab="${key}" aria-label="Achievement sync mode for ${esc(key)}">${options}</select>
          <div class="adventure-achv-cat-total">
            ${esc(progress.modeHelp)}
            <div class="adventure-achv-sync-breakdown">${esc(progress.matchBreakdownText || '')}</div>
          </div>
        </div>
      </div>`;
  }

  function renderCategorySection(key, config, sub, progress) {
    const catHtml = config.categories.map(cat => {
      const visited = Number(progress.categoryVisited[cat.key] || 0);
      const total = progress.explorerLoaded ? Number(progress.categoryTotals[cat.key] || 0) : '?';
      const p = pct(visited, typeof total === 'number' ? total : visited + 10);
      return `
        <div class="adventure-achv-cat-card">
          <div class="adventure-achv-cat-icon">${esc(cat.icon)}</div>
          <div class="adventure-achv-cat-label">${esc(cat.label)}</div>
          <div class="adventure-achv-cat-count">${visited}<span class="adventure-achv-cat-total"> / ${total}</span></div>
          <div class="adventure-achv-cat-pct">${p}% complete</div>
          <div class="adventure-achv-cat-bar"><div class="adventure-achv-cat-fill" style="width:${p}%"></div></div>
          ${progress.autoMode ? '<div class="adventure-achv-cat-actions"><span class="adventure-achv-cat-total">Auto-synced from visited data</span></div>' : `<div class="adventure-achv-cat-actions">
            <button class="adventure-achv-adj-btn" data-achv-btn data-achv-type="categories" data-achv-id="${cat.key}" data-achv-delta="-1" data-achv-goal="999" title="Remove one visit">−</button>
            <button class="adventure-achv-adj-btn adventure-achv-adj-btn--add" data-achv-btn data-achv-type="categories" data-achv-id="${cat.key}" data-achv-delta="1" data-achv-goal="999" title="Log a visit">+</button>
          </div>`}
        </div>`;
    }).join('');
    const totalVisited = progress.totalVisited;
    return `
      <div class="card adventure-achv-section">
        <div class="card-header">
          <div>
            <div class="card-title">📊 Category Progression</div>
            <div class="card-subtitle">Track your ${esc(config.label)} visits by category. Total logged: <strong>${totalVisited}</strong>${progress.explorerLoaded ? '' : ' <em style="font-size:11px;color:#9ca3af;">(Open the explorer once to sync category totals)</em>'}.</div>
          </div>
        </div>
        <div class="adventure-achv-cat-grid">${catHtml}</div>
      </div>`;
  }

  function renderChallengesSection(key, config, sub, progress) {
    const doneCount = config.challenges.reduce((sum, ch) => {
      const progressValue = Number(progress.challengesById[ch.id] || 0);
      return sum + CHALLENGE_TIER_TARGETS.filter((target) => progressValue >= target).length;
    }, 0);
    const totalCount = config.challenges.length * CHALLENGE_TIER_TARGETS.length;

    const chHtml = config.challenges.map(ch => {
      const progressValue = Number(progress.challengesById[ch.id] || 0);
      const highestTier = CHALLENGE_TIER_TARGETS.filter((target) => progressValue >= target).length;
      const tiersHtml = CHALLENGE_TIER_TARGETS.map((target, idx) => {
        const isComplete = progressValue >= target;
        const isLocked = idx > 0 && progressValue < CHALLENGE_TIER_TARGETS[idx - 1];
        const levelName = LEVEL_NAMES[idx] || `Level ${idx + 1}`;
        return `
          <div class="adventure-achv-tier-item${isComplete ? ' is-complete' : ''}${isLocked ? ' is-locked' : ''}">
            <span class="adventure-achv-tier-badge">L${idx + 1} ${esc(levelName)}</span>
            <span class="adventure-achv-tier-goal">${esc(challengeObjectiveLabel(ch, target))}</span>
            <span class="adventure-achv-tier-state">${isComplete ? 'Complete' : (isLocked ? 'Locked' : 'Unlocked')}</span>
          </div>`;
      }).join('');

      return `
        <div class="adventure-achv-challenge-card${highestTier >= CHALLENGE_TIER_TARGETS.length ? ' is-complete' : ''}">
          <div class="adventure-achv-challenge-icon">${esc(ch.icon)}</div>
          <div class="adventure-achv-challenge-body">
            <div class="adventure-achv-challenge-title">${esc(ch.title)}${highestTier >= CHALLENGE_TIER_TARGETS.length ? ' <span class="adventure-achv-done-check">✓</span>' : ''}</div>
            <div class="adventure-achv-challenge-tip">${esc(ch.tip)}</div>
            <div class="adventure-achv-challenge-meta">Current progress: ${progressValue} visits • Tier ${Math.max(1, highestTier)}/${CHALLENGE_TIER_TARGETS.length}</div>
            <div class="adventure-achv-tier-list">${tiersHtml}</div>
            ${progress.autoMode ? '<div class="adventure-achv-challenge-actions"><span class="adventure-achv-cat-total">Auto-synced from visited data</span></div>' : `<div class="adventure-achv-challenge-actions">
              <button class="adventure-achv-adj-btn" data-achv-btn data-achv-type="challenges" data-achv-id="${ch.id}" data-achv-delta="-1" data-achv-goal="${ch.goal}" title="Remove one">−</button>
              <button class="adventure-achv-adj-btn adventure-achv-adj-btn--add" data-achv-btn data-achv-type="challenges" data-achv-id="${ch.id}" data-achv-delta="1" data-achv-goal="${ch.goal}" title="Log a visit toward this challenge">+ Log</button>
            </div>`}
          </div>
        </div>`;
    }).join('');
    return `
      <div class="card adventure-achv-section">
        <div class="card-header">
          <div>
            <div class="card-title">🎯 Challenges</div>
            <div class="card-subtitle">Progressive challenge gates unlock one-by-one as you advance.</div>
          </div>
          <div class="adventure-achv-count-badge">${doneCount}/${totalCount}</div>
        </div>
        <div class="adventure-achv-challenge-grid">${chHtml}</div>
      </div>`;
  }

  function renderBadgesSection(key, config, sub, progress) {
    // Compute unlocked state per badge
    function isBadgeUnlocked(badge) {
      if (badge.metric === 'total') {
        const total = config.categories.reduce((s, c) => s + Number(progress.categoryVisited[c.key] || 0), 0);
        return total >= badge.goal;
      }
      if (badge.metric === 'challenges') {
        const done = config.challenges.filter(ch => Number(progress.challengesById[ch.id] || 0) >= ch.goal).length;
        return done >= badge.goal;
      }
      if (badge.metric === 'total_types') {
        const types = config.categories.filter(c => Number(progress.categoryVisited[c.key] || 0) >= 1).length;
        return types >= badge.goal;
      }
      // category metric
      return Number(progress.categoryVisited[badge.metric] || 0) >= badge.goal;
    }

    function getBadgeProgress(badge) {
      if (badge.metric === 'total') return config.categories.reduce((s, c) => s + Number(progress.categoryVisited[c.key] || 0), 0);
      if (badge.metric === 'challenges') return config.challenges.filter(ch => Number(progress.challengesById[ch.id] || 0) >= ch.goal).length;
      if (badge.metric === 'total_types') return config.categories.filter(c => Number(progress.categoryVisited[c.key] || 0) >= 1).length;
      return Number(progress.categoryVisited[badge.metric] || 0);
    }

    function metricLabelForBadge(badge) {
      if (badge.metric === 'total') return 'total visits';
      if (badge.metric === 'challenges') return 'completed challenges';
      if (badge.metric === 'total_types') return 'category types';
      const category = config.categories.find((cat) => cat.key === badge.metric);
      return category ? category.label.toLowerCase() : toHumanLabel(badge.metric || 'visits');
    }

    const earnedCount = config.badges.reduce((sum, badge) => {
      const progressValue = getBadgeProgress(badge);
      return sum + BADGE_LEVEL_TARGETS.filter((target) => progressValue >= target).length;
    }, 0);
    const badgeTotalCount = config.badges.length * BADGE_LEVEL_TARGETS.length;

    const badgeHtml = config.badges.map(badge => {
      const unlocked = isBadgeUnlocked(badge);
      const badgeProgress = getBadgeProgress(badge);
      const color = RARITY_COLORS[badge.rarity] || '#6b7280';
      const focusLabel = metricLabelForBadge(badge);
      const levelsHtml = BADGE_LEVEL_TARGETS.map((target, idx) => {
        const isComplete = badgeProgress >= target;
        const isLocked = idx > 0 && badgeProgress < BADGE_LEVEL_TARGETS[idx - 1];
        const plus = target >= BADGE_LEVEL_TARGETS[BADGE_LEVEL_TARGETS.length - 1] ? '+' : '';
        const levelName = LEVEL_NAMES[idx] || `Level ${idx + 1}`;
        return `
          <div class="adventure-achv-tier-item${isComplete ? ' is-complete' : ''}${isLocked ? ' is-locked' : ''}">
            <span class="adventure-achv-tier-badge">L${idx + 1} ${esc(levelName)}</span>
            <span class="adventure-achv-tier-goal">Reach ${target}${plus} ${esc(focusLabel)}</span>
            <span class="adventure-achv-tier-state">${isComplete ? 'Complete' : (isLocked ? 'Locked' : 'Unlocked')}</span>
          </div>`;
      }).join('');

      return `
        <div class="adventure-achv-badge-card${unlocked ? ' is-unlocked' : ''}" style="--rarity-color:${color}">
          <div class="adventure-achv-badge-icon">${unlocked ? esc(badge.icon) : '🔒'}</div>
          <div class="adventure-achv-badge-title">${esc(badge.title)}</div>
          <div class="adventure-achv-badge-rarity" style="color:${color}">${RARITY_LABELS[badge.rarity] || badge.rarity}</div>
          <div class="adventure-achv-badge-desc">${esc(badge.description)}</div>
          <div class="adventure-achv-badge-prog">Current progress: ${badgeProgress} ${esc(focusLabel)}</div>
          <div class="adventure-achv-tier-list">${levelsHtml}</div>
        </div>`;
    }).join('');
    return `
      <div class="card adventure-achv-section">
        <div class="card-header">
          <div>
            <div class="card-title">🏅 Badges</div>
            <div class="card-subtitle">Each badge has 5 levels: Rookie, Novice, Semi-Pro, Pro, and MVP.</div>
          </div>
          <div class="adventure-achv-count-badge">${earnedCount}/${badgeTotalCount}</div>
        </div>
        <div class="adventure-achv-badge-grid">${badgeHtml}</div>
      </div>`;
  }

  function renderQuestsSection(key, config, sub) {
    const season = currentSeason();
    const questHtml = config.quests.map(quest => {
      const isCurrent = quest.season === season;
      const meta = SEASON_MAP[quest.season];
      const stepsHtml = quest.steps.map((step, i) => {
        const stepKey = `${quest.id}-step-${i}`;
        const done = getVal(sub.quest, stepKey) >= 1;
        return `
          <div class="adventure-achv-quest-step${done ? ' is-done' : ''}">
            <span class="adventure-achv-step-check">${done ? '✅' : '○'}</span>
            <span class="adventure-achv-step-text">${esc(step)}</span>
            <button class="adventure-achv-step-btn" data-achv-btn data-achv-type="quest" data-achv-id="${stepKey}" data-achv-delta="${done ? -1 : 1}" data-achv-goal="1" title="${done ? 'Unmark' : 'Mark done'}">${done ? 'Undo' : 'Done'}</button>
          </div>`;
      }).join('');
      const doneSteps = quest.steps.filter((_, i) => getVal(sub.quest, `${quest.id}-step-${i}`) >= 1).length;
      const questDone = doneSteps >= quest.steps.length;
      return `
        <div class="adventure-achv-quest-card${isCurrent ? ' is-current-season' : ''}${questDone ? ' is-complete' : ''}">
          <div class="adventure-achv-quest-season">${esc(meta?.icon || '')} ${esc(meta?.label || quest.season)} ${isCurrent ? '<span class="adventure-achv-season-now">Now</span>' : ''}</div>
          <div class="adventure-achv-quest-title">${esc(quest.title)} ${questDone ? '🎉' : ''}</div>
          <div class="adventure-achv-quest-progress">${doneSteps}/${quest.steps.length} steps</div>
          <div class="adventure-achv-quest-steps">${stepsHtml}</div>
        </div>`;
    }).join('');
    return `
      <div class="card adventure-achv-section">
        <div class="card-header">
          <div>
            <div class="card-title">📚 Seasonal Quests</div>
            <div class="card-subtitle">Multi-step seasonal goals for ${esc(config.label)}.</div>
          </div>
        </div>
        <div class="adventure-achv-quest-grid">${questHtml}</div>
      </div>`;
  }

  function renderBingoSection(key, config, sub) {
    const markedCount = config.bingo.filter(tile => Boolean(sub.bingo?.[tile.key])).length;
    const total = config.bingo.length;
    // Check rows/columns/diagonal for 3x3 (9 tiles)
    let bingo = false;
    if (total === 9) {
      const m = (idx) => Boolean(sub.bingo?.[config.bingo[idx].key]);
      bingo = (m(0)&&m(1)&&m(2)) || (m(3)&&m(4)&&m(5)) || (m(6)&&m(7)&&m(8)) ||
              (m(0)&&m(3)&&m(6)) || (m(1)&&m(4)&&m(7)) || (m(2)&&m(5)&&m(8)) ||
              (m(0)&&m(4)&&m(8)) || (m(2)&&m(4)&&m(6));
    }
    const tilesHtml = config.bingo.map(tile => {
      const marked = Boolean(sub.bingo?.[tile.key]);
      return `
        <button class="adventure-achv-bingo-tile${marked ? ' is-marked' : ''}" data-bingo-tile="${tile.key}" title="${marked ? 'Unmark' : 'Mark'}: ${esc(tile.label)}" aria-pressed="${marked}">
          <span class="adventure-achv-bingo-icon">${esc(tile.icon)}</span>
          <span class="adventure-achv-bingo-label">${esc(tile.label)}</span>
          ${marked ? '<span class="adventure-achv-bingo-check" aria-hidden="true">✓</span>' : ''}
        </button>`;
    }).join('');
    return `
      <div class="card adventure-achv-section">
        <div class="card-header">
          <div>
            <div class="card-title">🟩 ${esc(config.label)} Bingo</div>
            <div class="card-subtitle">Tap tiles when you visit that category. Complete a row, column, or diagonal for BINGO!</div>
          </div>
          <div class="adventure-achv-count-badge">${markedCount}/${total}</div>
        </div>
        <div class="adventure-achv-bingo-board">${tilesHtml}</div>
        <div class="adventure-achv-bingo-meta">${markedCount}/${total} tiles marked${bingo ? ' 🎉 <strong>BINGO!</strong>' : ''}</div>
      </div>`;
  }

  // ─── Main render ────────────────────────────────────────────────────────────
  function renderAll(key) {
    const container = document.getElementById(`achv-root-${key}`);
    if (!container) return;
    const config = CONFIGS[key];
    if (!config) return;
    const state = loadState();
    const sub = getSubState(state, key);
    const settings = getSubSettings(state, key);
    const progress = buildProgressModel(key, config, sub, settings);

    container.innerHTML =
      renderSyncModeSection(key, progress) +
      renderCategorySection(key, config, sub, progress) +
      renderChallengesSection(key, config, sub, progress) +
      renderBadgesSection(key, config, sub, progress) +
      renderQuestsSection(key, config, sub) +
      renderBingoSection(key, config, sub);

    bindEvents(container, key, config, state);
  }

  function bindEvents(container, key, config, state) {
    const modeSelect = container.querySelector('[data-achv-sync-mode]');
    if (modeSelect) {
      modeSelect.addEventListener('change', () => {
        const settings = getSubSettings(state, key);
        const nextMode = String(modeSelect.value || '').trim();
        settings.mode = MATCH_MODES[nextMode] ? nextMode : 'balanced';
        saveState(state);
        renderAll(key);
      });
    }

    container.querySelectorAll('[data-achv-btn]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = btn.getAttribute('data-achv-type');
        const id = btn.getAttribute('data-achv-id');
        const delta = parseInt(btn.getAttribute('data-achv-delta') || '1', 10);
        const goal = parseInt(btn.getAttribute('data-achv-goal') || '1', 10);
        const sub = getSubState(state, key);
        if (!sub[type]) sub[type] = {};
        const cur = Number(sub[type][id] ?? 0);
        sub[type][id] = Math.max(0, Math.min(type === 'quest' ? 1 : goal * 3, cur + delta));
        saveState(state);
        renderAll(key);
      });
    });
    container.querySelectorAll('[data-bingo-tile]').forEach(tile => {
      tile.addEventListener('click', () => {
        const tileKey = tile.getAttribute('data-bingo-tile');
        const sub = getSubState(state, key);
        sub.bingo[tileKey] = !sub.bingo[tileKey];
        saveState(state);
        renderAll(key);
      });
    });
  }

  // ─── Init ──────────────────────────────────────────────────────────────────
  function init() {
    const doRender = () => {
      Object.keys(CONFIGS).forEach(k => {
        if (document.getElementById(`achv-root-${k}`)) renderAll(k);
      });
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(doRender, 900));
    } else {
      setTimeout(doRender, 900);
    }

    // Re-render when subtab is activated
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-progress-subtab]');
      if (btn) {
        const k = btn.getAttribute('data-progress-subtab');
        if (CONFIGS[k]) setTimeout(() => renderAll(k), 120);
        return;
      }

      const visitToggle = e.target.closest('[data-visit-action="toggle"]');
      if (visitToggle) {
        Object.keys(CONFIGS).forEach((k) => setTimeout(() => renderAll(k), 1200));
        return;
      }

      const refreshAction = e.target.closest('[data-visited-subtab-action]');
      if (refreshAction && /^(refresh-subtab-|open-explorer-|close-explorer-)/.test(String(refreshAction.getAttribute('data-visited-subtab-action') || ''))) {
        Object.keys(CONFIGS).forEach((k) => setTimeout(() => renderAll(k), 800));
      }
    });
  }

  return { init, renderAll, currentSeason, CONFIGS, MATCH_MODES };
})();

AdventureAchievements.init();

