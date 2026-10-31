import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting EasyWay database seeding...');

  // 1. Clear existing data in reverse order of foreign keys
  await prisma.tripItem.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.favorite.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.inquiry.deleteMany({});
  await prisma.hotel.deleteMany({});
  await prisma.attraction.deleteMany({});
  await prisma.guide.deleteMany({});
  await prisma.destination.deleteMany({});
  await prisma.travelPreference.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleared previous database entries.');

  // 2. Create users
  const passwordHash = await bcrypt.hash('EasyWay@2026', 10);

  const adminUser = await prisma.user.create({
    data: {
      name: 'Aditi Sharma',
      email: 'admin@easyway.in',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const guideUser = await prisma.user.create({
    data: {
      name: 'Vikramaditya Rathore',
      email: 'vikram@easyway.in',
      passwordHash,
      role: 'GUIDE',
    },
  });

  const travelerUser = await prisma.user.create({
    data: {
      name: 'Rahul Mehra',
      email: 'traveler@easyway.in',
      passwordHash,
      role: 'USER',
    },
  });

  const intlTraveler = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'elena@worldtravel.com',
      passwordHash,
      role: 'USER',
    },
  });

  // 3. User Preferences
  await prisma.travelPreference.create({
    data: {
      userId: travelerUser.id,
      preferredCategories: 'Heritage, Culture, Nature, Food and local experiences',
      preferredRegions: 'North, West, South',
      budgetRange: 'Moderate',
      travelGroupType: 'Family',
      preferredActivities: 'Heritage Walks, Architecture Tours, Local Food Tasting, Boat Rides',
      accommodationPreferences: 'Heritage Haveli, Boutique Hotel',
      preferredDuration: '4-7 Days',
    },
  });

  await prisma.travelPreference.create({
    data: {
      userId: intlTraveler.id,
      preferredCategories: 'Heritage, Spiritual, Culture, Nature',
      preferredRegions: 'North, South',
      budgetRange: 'Luxury',
      travelGroupType: 'Solo',
      preferredActivities: 'Yoga Retreats, Temple Exploration, Ghat Boat Rides',
      accommodationPreferences: 'Luxury Palace, Eco Stay',
      preferredDuration: '1-2 Weeks',
    },
  });

  // 4. Seed 16 Indian Destinations
  const destinationsData = [
    {
      name: 'Agra',
      slug: 'agra',
      state: 'Uttar Pradesh',
      region: 'North',
      description: 'Home to the iconic Taj Mahal, Agra sits gracefully along the Yamuna River. A Mughal capital rich with UNESCO monuments, marble craftwork, and royal Persian-Mughal gardens.',
      imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
      categories: 'Heritage, Culture, Architecture',
      latitude: 27.1751,
      longitude: 78.0421,
      bestTimeToVisit: 'October to March',
      popularityScore: 4.9,
    },
    {
      name: 'Jaipur',
      slug: 'jaipur',
      state: 'Rajasthan',
      region: 'West',
      description: 'The Pink City of India, Jaipur is a vibrant tapestry of majestic hilltop forts, ornate pink sandstone palaces, lively artisan bazaars, and legendary Rajasthani hospitality.',
      imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
      categories: 'Heritage, Culture, Food, Shopping',
      latitude: 26.9124,
      longitude: 75.7873,
      bestTimeToVisit: 'November to February',
      popularityScore: 4.8,
    },
    {
      name: 'Udaipur',
      slug: 'udaipur',
      state: 'Rajasthan',
      region: 'West',
      description: 'Known as the City of Lakes and Venice of the East, Udaipur charms visitors with pristine sapphire waters, majestic white marble palaces, and scenic Aravalli mountain backdrops.',
      imageUrl: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80',
      categories: 'Heritage, Romantic, Culture, Luxury',
      latitude: 24.5854,
      longitude: 73.7125,
      bestTimeToVisit: 'September to March',
      popularityScore: 4.9,
    },
    {
      name: 'Varanasi',
      slug: 'varanasi',
      state: 'Uttar Pradesh',
      region: 'North',
      description: 'One of the oldest continuously inhabited cities in the world, Varanasi is the spiritual capital of India, revered for mystical dawn boat rides along the sacred Ganga and hypnotic evening aartis.',
      imageUrl: 'https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&w=1200&q=80',
      categories: 'Spiritual, Culture, Heritage',
      latitude: 25.3176,
      longitude: 82.9739,
      bestTimeToVisit: 'October to March',
      popularityScore: 4.9,
    },
    {
      name: 'Kerala (Alleppey)',
      slug: 'kerala-alleppey',
      state: 'Kerala',
      region: 'South',
      description: 'Known as "God\'s Own Country", Alleppey is famous for tranquil backwater canals, traditional wooden kettuvallam houseboats, swaying coconut palms, and authentic Ayurvedic wellness.',
      imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
      categories: 'Nature, Relaxation, Culture, Wellness',
      latitude: 9.4981,
      longitude: 76.3388,
      bestTimeToVisit: 'September to March',
      popularityScore: 4.8,
    },
    {
      name: 'Goa',
      slug: 'goa',
      state: 'Goa',
      region: 'West',
      description: 'India\'s premier coastal paradise boasting golden palm-fringed sands, Portuguese colonial heritage churches, fresh seafood shacks, and a soulful laid-back susegad lifestyle.',
      imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
      categories: 'Beaches, Relaxation, Heritage, Food',
      latitude: 15.2993,
      longitude: 74.124,
      bestTimeToVisit: 'November to February',
      popularityScore: 4.7,
    },
    {
      name: 'New Delhi',
      slug: 'delhi',
      state: 'Delhi',
      region: 'North',
      description: 'The historic and dynamic capital of India, blending centuries of Mughal imperial fortresses, British colonial boulevards, vibrant spice markets, and world-class culinary scenes.',
      imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
      categories: 'Heritage, Food, Culture, Urban',
      latitude: 28.6139,
      longitude: 77.209,
      bestTimeToVisit: 'October to March',
      popularityScore: 4.7,
    },
    {
      name: 'Mumbai',
      slug: 'mumbai',
      state: 'Maharashtra',
      region: 'West',
      description: 'The City of Dreams by the Arabian Sea, featuring Victorian Gothic landmarks, the Gateway of India, bustling Marine Drive sunsets, Bollywood glamour, and irresistible street snacks.',
      imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
      categories: 'Urban, Heritage, Culture, Food',
      latitude: 18.922,
      longitude: 72.8347,
      bestTimeToVisit: 'November to February',
      popularityScore: 4.6,
    },
    {
      name: 'Darjeeling',
      slug: 'darjeeling',
      state: 'West Bengal',
      region: 'East',
      description: 'Perched in the Eastern Himalayas, Queen of the Hills Darjeeling is world-celebrated for aromatic emerald tea estates, the vintage UNESCO toy train, and sweeping vistas of Mount Kanchenjunga.',
      imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
      categories: 'Nature, Adventure, Heritage, Tea',
      latitude: 27.041,
      longitude: 88.2663,
      bestTimeToVisit: 'March to May & October to December',
      popularityScore: 4.8,
    },
    {
      name: 'Shimla',
      slug: 'shimla',
      state: 'Himachal Pradesh',
      region: 'North',
      description: 'The charming summer capital of British India, set amid pine-clad Himalayan ridges with neo-Gothic architecture, the bustling Mall Road, and panoramic snow peaks.',
      imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
      categories: 'Nature, Heritage, Adventure, Mountain',
      latitude: 31.1048,
      longitude: 77.1734,
      bestTimeToVisit: 'March to June & December to January',
      popularityScore: 4.6,
    },
    {
      name: 'Manali',
      slug: 'manali',
      state: 'Himachal Pradesh',
      region: 'North',
      description: 'An alpine wonderland in the Beas River Valley, renowned for thrilling mountain adventures, snowy Rohtang Pass, cedar forests, and rustic wooden temples.',
      imageUrl: 'https://images.unsplash.com/photo-1593181824359-565cb8842429?auto=format&fit=crop&w=1200&q=80',
      categories: 'Adventure, Nature, Mountain',
      latitude: 32.2396,
      longitude: 77.1887,
      bestTimeToVisit: 'October to June',
      popularityScore: 4.7,
    },
    {
      name: 'Hampi',
      slug: 'hampi',
      state: 'Karnataka',
      region: 'South',
      description: 'A surreal UNESCO World Heritage boulder-strewn landscape sheltering the monumental ruins of the 14th-century Vijayanagara Empire with carved chariot temples and riverside pavilions.',
      imageUrl: 'https://images.unsplash.com/photo-1600100397608-f010f4439c2c?auto=format&fit=crop&w=1200&q=80',
      categories: 'Heritage, History, Architecture, Spiritual',
      latitude: 15.335,
      longitude: 76.46,
      bestTimeToVisit: 'October to February',
      popularityScore: 4.9,
    },
    {
      name: 'Mysuru (Mysore)',
      slug: 'mysuru',
      state: 'Karnataka',
      region: 'South',
      description: 'The City of Palaces, celebrated for the dazzling illuminated Mysore Palace, aromatic sandalwood, Mysore silk, vibrant Devaraja market, and rich Ashtanga yoga traditions.',
      imageUrl: 'https://images.unsplash.com/photo-1600100397839-4447d6a546d1?auto=format&fit=crop&w=1200&q=80',
      categories: 'Heritage, Culture, Yoga, Royal',
      latitude: 12.2958,
      longitude: 76.6394,
      bestTimeToVisit: 'September to March',
      popularityScore: 4.7,
    },
    {
      name: 'Rishikesh',
      slug: 'rishikesh',
      state: 'Uttarakhand',
      region: 'North',
      description: 'The Yoga Capital of the World, nestled in the Himalayan foothills where the emerald Ganga emerges. Famed for yoga ashrams, Ganga Aarti at Parmarth Niketan, and river rafting.',
      imageUrl: 'https://images.unsplash.com/photo-1609137144822-0a916a241cb2?auto=format&fit=crop&w=1200&q=80',
      categories: 'Spiritual, Wellness, Adventure, Nature',
      latitude: 30.0869,
      longitude: 78.2676,
      bestTimeToVisit: 'September to April',
      popularityScore: 4.8,
    },
    {
      name: 'Shillong',
      slug: 'shillong',
      state: 'Meghalaya',
      region: 'North-East',
      description: 'Known as the Scotland of the East, Shillong boasts misty pine hills, crystal-clear living root bridges nearby, roaring waterfalls, and a passionate indie music culture.',
      imageUrl: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80',
      categories: 'Nature, Adventure, Culture, Waterfalls',
      latitude: 25.5788,
      longitude: 91.8933,
      bestTimeToVisit: 'September to May',
      popularityScore: 4.8,
    },
    {
      name: 'Andaman & Nicobar Islands',
      slug: 'andaman-islands',
      state: 'Andaman and Nicobar',
      region: 'South',
      description: 'An idyllic tropical archipelago with pristine turquoise waters, powder-white sands at Radhanagar Beach, vibrant coral reefs for scuba diving, and historical Cellular Jail.',
      imageUrl: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80',
      categories: 'Beaches, Nature, Adventure, Marine',
      latitude: 11.9761,
      longitude: 92.9876,
      bestTimeToVisit: 'November to May',
      popularityScore: 4.9,
    },
  ];

  const createdDestinations: Record<string, any> = {};
  for (const d of destinationsData) {
    const dest = await prisma.destination.create({ data: d });
    createdDestinations[d.slug] = dest;
  }
  console.log(`Created ${destinationsData.length} destinations.`);

  // 5. Seed at least 22 Tourist Attractions
  const attractionsData = [
    {
      name: 'Taj Mahal',
      slug: 'taj-mahal',
      destinationSlug: 'agra',
      description: 'The world-famous white marble mausoleum commissioned by Emperor Shah Jahan in memory of his beloved wife Mumtaz Mahal. A crown jewel of Islamic architecture in India.',
      category: 'Monument',
      imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
      address: 'Dharmapuri, Forest Colony, Tajganj, Agra, UP 282001',
      latitude: 27.1751,
      longitude: 78.0421,
      estimatedVisitDuration: '2 - 3 hours',
    },
    {
      name: 'Agra Fort',
      slug: 'agra-fort',
      destinationSlug: 'agra',
      description: 'A colossal 16th-century Mughal red sandstone fortress comprising royal palaces like the Sheesh Mahal, Diwan-i-Khas, and prime viewpoints toward the Taj Mahal.',
      category: 'Fort',
      imageUrl: 'https://images.unsplash.com/photo-1598890777032-bde835ba27c2?auto=format&fit=crop&w=800&q=80',
      address: 'Agra Fort, Rakabganj, Agra, UP 282003',
      latitude: 27.1795,
      longitude: 78.0211,
      estimatedVisitDuration: '2 hours',
    },
    {
      name: 'Amber Palace & Fort',
      slug: 'amber-fort',
      destinationSlug: 'jaipur',
      description: 'A grandiose Rajput hilltop fortress overlooking Maota Lake, famous for its mirror-tiled Sheesh Mahal and artistic Hindu-Rajput architectural flourishes.',
      category: 'Fort',
      imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
      address: 'Devisinghpura, Amer, Jaipur, Rajasthan 302001',
      latitude: 26.9855,
      longitude: 75.8513,
      estimatedVisitDuration: '3 - 4 hours',
    },
    {
      name: 'Hawa Mahal (Palace of Winds)',
      slug: 'hawa-mahal',
      destinationSlug: 'jaipur',
      description: 'An iconic 5-storey pink sandstone honeycomb façade with 953 ornate latticework jharokhas that allowed royal women to observe street festivals unseen.',
      category: 'Monument',
      imageUrl: 'https://images.unsplash.com/photo-1609137144822-0a916a241cb2?auto=format&fit=crop&w=800&q=80',
      address: 'Hawa Mahal Rd, Badi Choupad, J.D.A. Market, Jaipur 302002',
      latitude: 26.9239,
      longitude: 75.8267,
      estimatedVisitDuration: '1 - 2 hours',
    },
    {
      name: 'City Palace Udaipur',
      slug: 'city-palace-udaipur',
      destinationSlug: 'udaipur',
      description: 'A mammoth 400-year-old palace complex towering over Lake Pichola with mirrored rooms, miniature painting galleries, and marble courtyards.',
      category: 'Palace',
      imageUrl: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=800&q=80',
      address: 'Old City, Udaipur, Rajasthan 313001',
      latitude: 24.5764,
      longitude: 73.6835,
      estimatedVisitDuration: '3 hours',
    },
    {
      name: 'Lake Pichola Boat Cruise',
      slug: 'lake-pichola',
      destinationSlug: 'udaipur',
      description: 'A serene boat ride around the artificial freshwater lake created in 1362, viewing Jag Mandir Island and the floating white marble Taj Lake Palace.',
      category: 'Lake',
      imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
      address: 'Lake Pichola Ghat, Udaipur, Rajasthan',
      latitude: 24.5786,
      longitude: 73.6792,
      estimatedVisitDuration: '1.5 hours',
    },
    {
      name: 'Dashashwamedh Ghat & Evening Aarti',
      slug: 'dashashwamedh-ghat',
      destinationSlug: 'varanasi',
      description: 'The main and most vibrant riverbank ghat on the holy Ganga, where priests perform the mesmerizing fire ritual ceremony each evening to brass cymbals and conch shells.',
      category: 'Spiritual',
      imageUrl: 'https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&w=800&q=80',
      address: 'Dashashwamedh Ghat Rd, Bangali Tola, Varanasi, UP 221001',
      latitude: 25.3076,
      longitude: 83.0107,
      estimatedVisitDuration: '2 hours',
    },
    {
      name: 'Kashi Vishwanath Temple',
      slug: 'kashi-vishwanath',
      destinationSlug: 'varanasi',
      description: 'One of the 12 sacred Jyotirlinga shrines dedicated to Lord Shiva, featuring magnificent golden spires and the renovated grand temple corridor.',
      category: 'Temple',
      imageUrl: 'https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=800&q=80',
      address: 'Lahori Tola, Varanasi, UP 221001',
      latitude: 25.3109,
      longitude: 83.0107,
      estimatedVisitDuration: '2 hours',
    },
    {
      name: 'Vembanad Backwaters Houseboat Cruise',
      slug: 'vembanad-backwaters',
      destinationSlug: 'kerala-alleppey',
      description: 'Glide gently through tranquil emerald lagoons, water lilies, and rustic village coir-making settlements aboard an eco-friendly thatched houseboat.',
      category: 'Nature',
      imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
      address: 'Finishing Point, Punnamada, Alappuzha, Kerala 688013',
      latitude: 9.5028,
      longitude: 76.3458,
      estimatedVisitDuration: 'Day cruise / Overnight',
    },
    {
      name: 'Marari Beach',
      slug: 'marari-beach',
      destinationSlug: 'kerala-alleppey',
      description: 'An untouched, tranquil golden sand beach lined with swaying coconut groves and peaceful fishing hamlets, perfect for relaxation and Ayurvedic rejuvenation.',
      category: 'Beach',
      imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      address: 'Mararikulam, Alappuzha, Kerala 688523',
      latitude: 9.601,
      longitude: 76.2974,
      estimatedVisitDuration: 'Half Day',
    },
    {
      name: 'Basilica of Bom Jesus',
      slug: 'basilica-bom-jesus',
      destinationSlug: 'goa',
      description: 'A UNESCO World Heritage Baroque church in Old Goa housing the sacred mortal remains of St. Francis Xavier, with intricate gilded wooden altars.',
      category: 'Heritage',
      imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      address: 'Old Goa Rd, Bainguinim, Goa 403402',
      latitude: 15.5009,
      longitude: 73.9116,
      estimatedVisitDuration: '1.5 hours',
    },
    {
      name: 'Palolem Beach',
      slug: 'palolem-beach',
      destinationSlug: 'goa',
      description: 'A crescent-shaped serene bay in South Goa with calm turquoise waters, cozy beach shacks, dolphin boat trips, and dramatic sunset viewpoints.',
      category: 'Beach',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      address: 'Canacona, South Goa, Goa 403702',
      latitude: 15.01,
      longitude: 74.0232,
      estimatedVisitDuration: 'Full Day',
    },
    {
      name: 'Humayun\'s Tomb',
      slug: 'humayuns-tomb',
      destinationSlug: 'delhi',
      description: 'The monumental 1570 red sandstone garden-tomb that served as the architectural inspiration for the Taj Mahal, surrounded by formal Persian Charbagh gardens.',
      category: 'Monument',
      imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
      address: 'Mathura Rd, Nizamuddin East, New Delhi 110013',
      latitude: 28.5933,
      longitude: 77.2507,
      estimatedVisitDuration: '2 hours',
    },
    {
      name: 'Qutub Minar Complex',
      slug: 'qutub-minar',
      destinationSlug: 'delhi',
      description: 'A 73-meter soaring minaret built in 1192 surrounded by historic ruins, ancient calligraphy, and the legendary 1,600-year-old rust-resistant Iron Pillar.',
      category: 'Monument',
      imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&w=800&q=80',
      address: 'Mehrauli, New Delhi 110030',
      latitude: 28.5244,
      longitude: 77.1855,
      estimatedVisitDuration: '2 hours',
    },
    {
      name: 'Gateway of India',
      slug: 'gateway-of-india',
      destinationSlug: 'mumbai',
      description: 'An imposing 26-meter basalt triumphal arch built during the British Raj facing Mumbai Harbour, adjacent to the historic Taj Mahal Palace Hotel.',
      category: 'Monument',
      imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
      address: 'Apollo Bandar, Colaba, Mumbai, Maharashtra 400001',
      latitude: 18.922,
      longitude: 72.8347,
      estimatedVisitDuration: '1 hour',
    },
    {
      name: 'Tiger Hill Sunrise',
      slug: 'tiger-hill',
      destinationSlug: 'darjeeling',
      description: 'The famous Himalayan vantage point offering breathless morning sunrises where rays first illuminate the golden peaks of Kanchenjunga and Mount Everest.',
      category: 'Nature',
      imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
      address: 'Senchal Forest, Darjeeling, West Bengal 734102',
      latitude: 26.9953,
      longitude: 88.2842,
      estimatedVisitDuration: '2 - 3 hours (dawn)',
    },
    {
      name: 'The Ridge & Christ Church',
      slug: 'the-ridge-shimla',
      destinationSlug: 'shimla',
      description: 'The cultural center of Shimla, an expansive open pedestrian street offering spectacular mountain vistas and the stained-glass neo-Gothic Christ Church built in 1857.',
      category: 'Heritage',
      imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
      address: 'The Ridge, Mall Road, Shimla, HP 171001',
      latitude: 31.1044,
      longitude: 77.1751,
      estimatedVisitDuration: '2 hours',
    },
    {
      name: 'Solang Valley Adventure Arena',
      slug: 'solang-valley',
      destinationSlug: 'manali',
      description: 'A scenic mountain valley celebrated for winter skiing and snowboarding, and summer paragliding, zorbing, and cable car rides with glaciers towering overhead.',
      category: 'Adventure',
      imageUrl: 'https://images.unsplash.com/photo-1593181824359-565cb8842429?auto=format&fit=crop&w=800&q=80',
      address: 'Solang Valley, Burwa, Himachal Pradesh 175131',
      latitude: 32.3166,
      longitude: 77.1578,
      estimatedVisitDuration: 'Half Day',
    },
    {
      name: 'Vijaya Vittala Temple & Stone Chariot',
      slug: 'vittala-temple',
      destinationSlug: 'hampi',
      description: 'The pinnacle of Vijayanagara architectural mastery, featuring the iconic monolithic Stone Chariot and the miraculous acoustic musical pillars.',
      category: 'Temple',
      imageUrl: 'https://images.unsplash.com/photo-1600100397608-f010f4439c2c?auto=format&fit=crop&w=800&q=80',
      address: 'Hampi Historical Site, Bellary, Karnataka 583239',
      latitude: 15.335,
      longitude: 76.467,
      estimatedVisitDuration: '3 hours',
    },
    {
      name: 'Mysore Palace (Amba Vilas)',
      slug: 'mysore-palace',
      destinationSlug: 'mysuru',
      description: 'One of India\'s most visited royal palaces, an Indo-Saracenic masterpiece with stained glass ceilings, carved mahogany, and 100,000 bulbs illuminating on Sundays.',
      category: 'Palace',
      imageUrl: 'https://images.unsplash.com/photo-1600100397839-4447d6a546d1?auto=format&fit=crop&w=800&q=80',
      address: 'Sayyaji Rao Rd, Agrahara, Chamrajpura, Mysuru 570001',
      latitude: 12.3051,
      longitude: 76.6551,
      estimatedVisitDuration: '2.5 hours',
    },
    {
      name: 'Triveni Ghat & Parmarth Niketan',
      slug: 'triveni-ghat',
      destinationSlug: 'rishikesh',
      description: 'The revered confluence of holy currents where devotees participate in soul-stirring Ganga Aarti, yoga sessions, and traditional spiritual meditation.',
      category: 'Spiritual',
      imageUrl: 'https://images.unsplash.com/photo-1609137144822-0a916a241cb2?auto=format&fit=crop&w=800&q=80',
      address: 'Mayakund, Rishikesh, Uttarakhand 249201',
      latitude: 30.1065,
      longitude: 78.2938,
      estimatedVisitDuration: '2 hours',
    },
    {
      name: 'Nohkalikai Falls & Living Root Bridges',
      slug: 'nohkalikai-falls',
      destinationSlug: 'shillong',
      description: 'The tallest plunge waterfall in India (340m) cascading dramatically off verdant cliffs, paired with ancient Bio-engineering marvels: living Ficus root bridges.',
      category: 'Nature',
      imageUrl: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80',
      address: 'Cherrapunji / Sohra, Meghalaya 793108',
      latitude: 25.2755,
      longitude: 91.6853,
      estimatedVisitDuration: '4 - 5 hours',
    },
    {
      name: 'Radhanagar Beach (Havelock Island)',
      slug: 'radhanagar-beach',
      destinationSlug: 'andaman-islands',
      description: 'Crowned as Asia\'s Best Beach by Time Magazine, offering breathtaking turquoise waters, gentle waves, and pristine tropical forest perimeter.',
      category: 'Beach',
      imageUrl: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80',
      address: 'Havelock Island (Swaraj Dweep), South Andaman 744211',
      latitude: 11.9839,
      longitude: 92.9511,
      estimatedVisitDuration: 'Full Day',
    },
  ];

  for (const a of attractionsData) {
    const dest = createdDestinations[a.destinationSlug];
    if (dest) {
      await prisma.attraction.create({
        data: {
          name: a.name,
          slug: a.slug,
          destinationId: dest.id,
          description: a.description,
          category: a.category,
          imageUrl: a.imageUrl,
          address: a.address,
          latitude: a.latitude,
          longitude: a.longitude,
          estimatedVisitDuration: a.estimatedVisitDuration,
        },
      });
    }
  }
  console.log(`Created ${attractionsData.length} attractions.`);

  // 6. Seed at least 14 Hotels
  const hotelsData = [
    {
      name: 'The Oberoi Amarvilas',
      slug: 'the-oberoi-amarvilas-agra',
      destinationSlug: 'agra',
      description: 'A lavish luxury retreat situated just 600 meters from the Taj Mahal, where every room, restaurant, and terrace boasts an uninterrupted view of the monument.',
      accommodationType: 'Luxury Palace',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      address: 'Taj East Gate Rd, Paktola, Tajganj, Agra, UP 282001',
      amenities: 'Taj Mahal Views, Infinity Pool, Ayurvedic Spa, Fine Dining, Butler Service, Airport Limousine',
      latitude: 27.1691,
      longitude: 78.0489,
      contactInformation: 'amarvilas.agra@easyway-inquiry.sample',
    },
    {
      name: 'Rambagh Palace',
      slug: 'rambagh-palace-jaipur',
      destinationSlug: 'jaipur',
      description: 'Former residence of the Maharaja of Jaipur, often voted among the world\'s best hotels. Set in 47 acres of tranquil Mughal gardens with peacocks roaming freely.',
      accommodationType: 'Heritage Palace',
      imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      address: 'Bhawani Singh Rd, Rambagh, Jaipur, Rajasthan 302005',
      amenities: 'Royal Mughal Gardens, Indoor Heated Pool, Jiva Grande Spa, Vintage Car Tours, High Tea Pavilion',
      latitude: 26.8978,
      longitude: 75.8087,
      contactInformation: 'rambagh.jaipur@easyway-inquiry.sample',
    },
    {
      name: 'Taj Lake Palace',
      slug: 'taj-lake-palace-udaipur',
      destinationSlug: 'udaipur',
      description: 'An ethereal 18th-century white marble palace appearing to float magically on Lake Pichola, reached exclusively by private wooden royal boat.',
      accommodationType: 'Heritage Haveli',
      imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      address: 'Lake Pichola, Udaipur, Rajasthan 313001',
      amenities: 'Boat Transfers, Jharokha Lake Views, Royal Jiva Spa Boat, Rooftop Candlelight Dining, Astrology Session',
      latitude: 24.5756,
      longitude: 73.6803,
      contactInformation: 'lakepalace.udaipur@easyway-inquiry.sample',
    },
    {
      name: 'BrijRama Palace Heritage Hotel',
      slug: 'brijrama-palace-varanasi',
      destinationSlug: 'varanasi',
      description: 'One of the oldest palaces on the sacred ghats of Varanasi, constructed in 1812 with Maratha stone architecture, bajra boat access, and live classical sitar music.',
      accommodationType: 'Heritage Haveli',
      imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      address: 'Darbhanga Ghat, Dashashwamedh, Varanasi, UP 221001',
      amenities: 'River Ganga Views, Private Ghat Access, Vegetarian Fine Dining, Morning Yoga, Sitar Performances',
      latitude: 25.304,
      longitude: 83.0125,
      contactInformation: 'brijrama.varanasi@easyway-inquiry.sample',
    },
    {
      name: 'Kumarakom Lake Resort',
      slug: 'kumarakom-lake-resort-kerala',
      destinationSlug: 'kerala-alleppey',
      description: 'A world-acclaimed heritage backwater sanctuary featuring 16th-century traditional Keralan homesteads reconstructed piece-by-piece beside meandering pools.',
      accommodationType: 'Eco Stay',
      imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
      address: 'Vembanad Lake, Kumarakom, Kottayam, Kerala 686563',
      amenities: 'Meandering Pool, Ayurmana Heritage Spa, Sunset Backwater Cruise, Pottery Workshop, Seafood Restaurant',
      latitude: 9.6175,
      longitude: 76.4308,
      contactInformation: 'kumarakom.resort@easyway-inquiry.sample',
    },
    {
      name: 'Taj Fort Aguada Resort & Spa',
      slug: 'taj-fort-aguada-goa',
      destinationSlug: 'goa',
      description: 'Perched on the ramparts of a 16th-century Portuguese fortress facing Sinquerim Beach, combining vibrant Goan charm with sea-facing luxury villas.',
      accommodationType: 'Boutique Resort',
      imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
      address: 'Sinquerim, Candolim, Goa 403515',
      amenities: 'Private Beach Access, Sea View Suites, Jiva Spa, Tennis Courts, Horizon Swimming Pool',
      latitude: 15.498,
      longitude: 73.7712,
      contactInformation: 'fortaguada.goa@easyway-inquiry.sample',
    },
    {
      name: 'The Imperial New Delhi',
      slug: 'the-imperial-delhi',
      destinationSlug: 'delhi',
      description: 'An iconic 1930s Art Deco and Victorian grand hotel surrounded by manicured royal palm gardens, housing India\'s largest private collection of colonial art.',
      accommodationType: 'Luxury Hotel',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      address: 'Janpath Lane, Connaught Place, New Delhi 110001',
      amenities: 'Art Gallery, Royal Palm Pool, Imperial Spa, 5 Signature Restaurants, High Tea Verandah',
      latitude: 28.6234,
      longitude: 77.2185,
      contactInformation: 'imperial.delhi@easyway-inquiry.sample',
    },
    {
      name: 'The Taj Mahal Palace & Tower',
      slug: 'taj-mahal-palace-mumbai',
      destinationSlug: 'mumbai',
      description: 'Built in 1903, this legendary harbour-side flagship landmark has hosted royalty, heads of state, and legends, overlooking the Gateway of India and the Arabian Sea.',
      accommodationType: 'Heritage Palace',
      imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
      address: 'Apollo Bunder, Colaba, Mumbai, Maharashtra 400001',
      amenities: 'Arabian Sea Views, 9 Fine Dining Venues, Jiva Grande Spa, Royal Butler Service, Swimming Pool',
      latitude: 18.9217,
      longitude: 72.833,
      contactInformation: 'tajpalace.mumbai@easyway-inquiry.sample',
    },
    {
      name: 'Windamere Hotel Heritage Estate',
      slug: 'windamere-hotel-darjeeling',
      destinationSlug: 'darjeeling',
      description: 'An original 19th-century English boarding house atop Historic Observatory Hill, maintaining authentic coal fires, afternoon tea with scones, and Kanchenjunga panoramas.',
      accommodationType: 'Boutique Hotel',
      imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
      address: 'Observatory Hill, Darjeeling, West Bengal 734101',
      amenities: 'Fireplace Suites, English Afternoon Tea, Kanchenjunga Balcony, Library, Heritage Gardens',
      latitude: 27.0456,
      longitude: 88.2678,
      contactInformation: 'windamere.darjeeling@easyway-inquiry.sample',
    },
    {
      name: 'Wildflower Hall (An Oberoi Resort)',
      slug: 'wildflower-hall-shimla',
      destinationSlug: 'shimla',
      description: 'Nestled at 8,250 feet in 22 acres of fragrant cedar forest, the former estate of Lord Kitchener offers an outdoor heated whirlpool overlooking snow-peaked Himalayas.',
      accommodationType: 'Luxury Resort',
      imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      address: 'Chharabra, Shimla, Himachal Pradesh 171012',
      amenities: 'Heated Outdoor Himalayan Jacuzzi, Nature Trails, Tennis Court, Oberoi Spa, Billiards Room',
      latitude: 31.1158,
      longitude: 77.2341,
      contactInformation: 'wildflower.shimla@easyway-inquiry.sample',
    },
    {
      name: 'The Himalayan Manali Resort',
      slug: 'the-himalayan-manali',
      destinationSlug: 'manali',
      description: 'A premier Victorian Gothic castle resort built with natural stone and wood, nestled amidst apple and cherry orchards with antique cast-iron fireplaces.',
      accommodationType: 'Boutique Resort',
      imageUrl: 'https://images.unsplash.com/photo-1593181824359-565cb8842429?auto=format&fit=crop&w=800&q=80',
      address: 'Hadimba Road, Manali, Himachal Pradesh 175131',
      amenities: 'Castle Architecture, Apple Orchard Views, Heated Pool, Dungeon Bar, Fireplace Rooms',
      latitude: 32.2461,
      longitude: 77.1822,
      contactInformation: 'himalayan.manali@easyway-inquiry.sample',
    },
    {
      name: 'Evolve Back Kamalapura Palace',
      slug: 'evolve-back-hampi',
      destinationSlug: 'hampi',
      description: 'A fort-palace resort mirroring the glorious 14th-century Vijayanagara architecture with stone paved boulevards, regal private plunge pool villas, and reading lounges.',
      accommodationType: 'Luxury Palace',
      imageUrl: 'https://images.unsplash.com/photo-1600100397608-f010f4439c2c?auto=format&fit=crop&w=800&q=80',
      address: 'Kamalapura, Hampi, Bellary, Karnataka 583221',
      amenities: 'Private Plunge Pools, Vaidyasala Ayurveda Clinic, Vijayanagara Architectural Tours, Infinity Pool',
      latitude: 15.312,
      longitude: 76.471,
      contactInformation: 'evolveback.hampi@easyway-inquiry.sample',
    },
    {
      name: 'Ananda in the Himalayas',
      slug: 'ananda-in-the-himalayas-rishikesh',
      destinationSlug: 'rishikesh',
      description: 'World-renowned luxury destination spa located on the 100-acre Maharaja\'s Palace Estate, overlooking the sacred Ganga and tranquil Sal forests.',
      accommodationType: 'Eco Stay',
      imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      address: 'The Palace Estate, Narendra Nagar, Tehri Garhwal, Uttarakhand 249175',
      amenities: 'Comprehensive Ayurvedic Wellness, Yoga Pavilions, Organic Cuisine, Golf Course, Hydrotherapy',
      latitude: 30.178,
      longitude: 78.291,
      contactInformation: 'ananda.rishikesh@easyway-inquiry.sample',
    },
    {
      name: 'Taj Exotica Resort & Spa Havelock',
      slug: 'taj-exotica-havelock-andaman',
      destinationSlug: 'andaman-islands',
      description: 'Spread over 46 acres of lush coastal coconut and palmyra groves along Radhanagar Beach, constructed sustainably without felling a single indigenous tree.',
      accommodationType: 'Luxury Resort',
      imageUrl: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80',
      address: 'Radhanagar Beach, Havelock Island, Andaman & Nicobar 744211',
      amenities: 'Direct Beachfront, Olympic Infinity Pool, Jiva Spa, Scuba Diving Center, Coastal Seafood Grill',
      latitude: 11.981,
      longitude: 92.9525,
      contactInformation: 'tajexotica.andaman@easyway-inquiry.sample',
    },
  ];

  for (const h of hotelsData) {
    const dest = createdDestinations[h.destinationSlug];
    if (dest) {
      await prisma.hotel.create({
        data: {
          name: h.name,
          slug: h.slug,
          destinationId: dest.id,
          description: h.description,
          accommodationType: h.accommodationType,
          imageUrl: h.imageUrl,
          address: h.address,
          amenities: h.amenities,
          latitude: h.latitude,
          longitude: h.longitude,
          contactInformation: h.contactInformation,
        },
      });
    }
  }
  console.log(`Created ${hotelsData.length} hotels.`);

  // 7. Seed 8 Travel Guides
  const guidesData = [
    {
      name: 'Vikramaditya Rathore',
      userId: guideUser.id,
      biography: 'Licensed cultural heritage historian with 14 years of storytelling experience across Rajasthan\'s royal forts, havelis, and secret desert folklore.',
      languages: 'English, Hindi, French',
      specializations: 'Heritage Architecture, Royal Fort History, Traditional Miniature Art',
      serviceRegions: 'Rajasthan, Golden Triangle, Agra',
      profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      experienceYears: 14,
    },
    {
      name: 'Ananya Menon',
      biography: 'Certified eco-naturalist and backwater tour captain specializing in village craft immersion, birding sanctuaries, and spice plantation botanical trails.',
      languages: 'English, Malayalam, Tamil, German',
      specializations: 'Eco Tourism, Backwater Wildlife, Ayurvedic Heritage, Culinary Walks',
      serviceRegions: 'Kerala, South India',
      profileImageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      experienceYears: 9,
    },
    {
      name: 'Pandit Devendra Shastri',
      biography: 'Fifth-generation Varanasi scholar and Ganga philosophy guide providing profound insight into ancient Vedic rituals, astrological history, and dawn ghat walks.',
      languages: 'English, Hindi, Sanskrit',
      specializations: 'Spiritual Pilgrimage, Vedic Philosophy, Ghat Dawn Rituals',
      serviceRegions: 'Varanasi, Rishikesh, Uttar Pradesh',
      profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
      experienceYears: 20,
    },
    {
      name: 'Tenzing Norbu Lepcha',
      biography: 'Mountaineering expedition leader and botanical guide trained in the Eastern Himalayas, guiding tea tasting rituals and Kanchenjunga trekking circuits.',
      languages: 'English, Nepali, Hindi, Japanese',
      specializations: 'Himalayan Trekking, Tea Plantation Agriculture, Buddhist Monasteries',
      serviceRegions: 'Darjeeling, Sikkim, North-East',
      profileImageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
      experienceYears: 11,
    },
    {
      name: 'Farhan Zaidi',
      biography: 'Passionate Old Delhi culinary chronicler and architectural guide leading famous street food journeys through Chandni Chowk, Nizamuddin, and Mehrauli ruins.',
      languages: 'English, Hindi, Urdu',
      specializations: 'Culinary Heritage, Mughal Architecture, Secret Street Food Trails',
      serviceRegions: 'Delhi, Agra, Golden Triangle',
      profileImageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
      experienceYears: 8,
    },
    {
      name: 'Maria Fernandes',
      biography: 'Goan architectural conservator showcasing Latin Quarter Fontainhas heritage walks, baroque Portuguese church frescoes, and spice farm cooking masterclasses.',
      languages: 'English, Portuguese, Konkani, Hindi',
      specializations: 'Colonial Portuguese History, Spice Trails, Coastal Village Culture',
      serviceRegions: 'Goa, Coastal Karnataka',
      profileImageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
      experienceYears: 10,
    },
    {
      name: 'Nagaraja Kulkarni',
      biography: 'Archaeologist and researcher dedicated to deciphering the monolithic stone inscriptions, musical pillars, and military engineering of the Vijayanagara Empire.',
      languages: 'English, Kannada, Telugu, Hindi',
      specializations: 'Archaeological Excavation, Temple Epigraphy, Stone Sculpture',
      serviceRegions: 'Hampi, Karnataka, Mysuru',
      profileImageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
      experienceYears: 16,
    },
    {
      name: 'Swati Kothari',
      biography: 'Certified yoga instructor and Himalayan mountain guide guiding silent meditative hikes, holy river retreats, and high-altitude Himalayan flora photography.',
      languages: 'English, Hindi, Spanish',
      specializations: 'Yoga & Meditation Walks, Adventure Rafting, High Altitude Flora',
      serviceRegions: 'Rishikesh, Himachal, Uttarakhand',
      profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      experienceYears: 7,
    },
  ];

  const createdGuides: Record<string, any> = {};
  for (const g of guidesData) {
    const guide = await prisma.guide.create({ data: g });
    createdGuides[g.name] = guide;
  }
  console.log(`Created ${guidesData.length} guides.`);

  // 8. Seed Reviews
  const agraDest = createdDestinations['agra'];
  const jaipurDest = createdDestinations['jaipur'];
  const keralaDest = createdDestinations['kerala-alleppey'];
  const varanasiDest = createdDestinations['varanasi'];

  if (agraDest && travelerUser) {
    await prisma.review.create({
      data: {
        userId: travelerUser.id,
        destinationId: agraDest.id,
        rating: 5,
        comment: 'Seeing the Taj Mahal at dawn when the fog lifts is a bucket-list experience. EasyWay made navigating the monuments seamless!',
        moderationStatus: 'APPROVED',
      },
    });
  }

  if (jaipurDest && intlTraveler) {
    await prisma.review.create({
      data: {
        userId: intlTraveler.id,
        destinationId: jaipurDest.id,
        rating: 5,
        comment: 'Amber Fort is breathtaking! The craftsmanship of the Sheesh Mahal will stay in my memory forever. The local cuisine is also unforgettable.',
        moderationStatus: 'APPROVED',
      },
    });
  }

  if (keralaDest && travelerUser) {
    await prisma.review.create({
      data: {
        userId: travelerUser.id,
        destinationId: keralaDest.id,
        rating: 5,
        comment: 'The houseboat stay in Alleppey was the most tranquil vacation our family has ever taken. Authentic fish curry and tender coconut water every day.',
        moderationStatus: 'APPROVED',
      },
    });
  }

  if (varanasiDest && intlTraveler) {
    await prisma.review.create({
      data: {
        userId: intlTraveler.id,
        destinationId: varanasiDest.id,
        rating: 5,
        comment: 'The evening Ganga Aarti at Dashashwamedh Ghat is deeply moving. Highly recommend a dawn boat ride along the ancient ghats.',
        moderationStatus: 'APPROVED',
      },
    });
  }

  // 9. Seed Favorites for travelerUser
  if (travelerUser && agraDest && jaipurDest && keralaDest) {
    await prisma.favorite.create({
      data: {
        userId: travelerUser.id,
        destinationId: agraDest.id,
      },
    });

    await prisma.favorite.create({
      data: {
        userId: travelerUser.id,
        destinationId: jaipurDest.id,
      },
    });

    await prisma.favorite.create({
      data: {
        userId: travelerUser.id,
        destinationId: keralaDest.id,
      },
    });
  }

  // 10. Seed Sample Trip with Itinerary Items
  if (travelerUser && jaipurDest) {
    const jaipurAttractions = await prisma.attraction.findMany({
      where: { destinationId: jaipurDest.id },
    });

    const sampleTrip = await prisma.trip.create({
      data: {
        userId: travelerUser.id,
        name: 'Royal Rajasthan Explorer',
        description: 'A 5-day cultural and royal palace discovery trip through Jaipur and Udaipur.',
        startDate: '2026-11-15',
        endDate: '2026-11-20',
      },
    });

    await prisma.tripItem.create({
      data: {
        tripId: sampleTrip.id,
        destinationId: jaipurDest.id,
        attractionId: jaipurAttractions[0]?.id || null,
        dayNumber: 1,
        sortOrder: 1,
        notes: 'Morning excursion to Amber Fort before tourist crowds arrive; explore Sheesh Mahal and enjoy royal courtyard view.',
      },
    });

    await prisma.tripItem.create({
      data: {
        tripId: sampleTrip.id,
        destinationId: jaipurDest.id,
        attractionId: jaipurAttractions[1]?.id || null,
        dayNumber: 1,
        sortOrder: 2,
        notes: 'Afternoon photo stop at Hawa Mahal, followed by shopping for block-print textiles in Johari Bazaar.',
      },
    });

    await prisma.tripItem.create({
      data: {
        tripId: sampleTrip.id,
        destinationId: jaipurDest.id,
        dayNumber: 2,
        sortOrder: 1,
        notes: 'Visit City Palace and Jantar Mantar observatory in the morning; evening dinner at Chokhi Dhani village resort.',
      },
    });
  }

  // 11. Seed Inquiries
  await prisma.inquiry.create({
    data: {
      userId: travelerUser.id,
      recipientType: 'HOTEL',
      recipientId: 'the-oberoi-amarvilas-agra',
      name: 'Rahul Mehra',
      email: 'traveler@easyway.in',
      message: 'Hello, our family is planning to visit Agra in December. Could you let us know if premier balcony rooms with Taj Mahal views are available for 3 nights?',
      travelDate: '2026-12-10',
      status: 'PENDING',
    },
  });

  await prisma.inquiry.create({
    data: {
      userId: null,
      recipientType: 'GUIDE',
      recipientId: createdGuides['Vikramaditya Rathore']?.id || null,
      name: 'Sarah Jenkins',
      email: 'sarah.j@travelworld.org',
      message: 'Greetings Vikramaditya, we are a group of 4 university researchers visiting Jaipur for 2 days. We would love a specialized architectural tour of Amber Fort.',
      travelDate: '2026-11-22',
      status: 'CONTACTED',
    },
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
