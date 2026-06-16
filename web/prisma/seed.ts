import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { slugify } from "../src/lib/domain/slug";
import { photoUrl } from "../src/lib/placeholder";

const db = new PrismaClient();

const CITY_GEO: Record<string, { lat: number; lng: number }> = {
  london: { lat: 51.5074, lng: -0.1278 },
  birmingham: { lat: 52.4862, lng: -1.8904 },
  manchester: { lat: 53.4808, lng: -2.2426 },
  leicester: { lat: 52.6369, lng: -1.1398 },
  sheffield: { lat: 53.3811, lng: -1.4701 },
};

// simple deterministic pseudo-random for stable seeds
let rngState = 42;
function rnd(): number {
  rngState = (rngState * 1103515245 + 12345) % 2 ** 31;
  return rngState / 2 ** 31;
}
function jitter(): number {
  return (rnd() - 0.5) * 0.06;
}

const HOURS_RESTAURANT = JSON.stringify({
  mon: [{ open: "12:00", close: "22:00" }],
  tue: [{ open: "12:00", close: "22:00" }],
  wed: [{ open: "12:00", close: "22:00" }],
  thu: [{ open: "12:00", close: "22:30" }],
  fri: [{ open: "12:00", close: "23:00" }],
  sat: [{ open: "12:00", close: "23:00" }],
  sun: [{ open: "12:00", close: "21:00" }],
});
const HOURS_SHOP = JSON.stringify({
  mon: [{ open: "09:00", close: "19:00" }],
  tue: [{ open: "09:00", close: "19:00" }],
  wed: [{ open: "09:00", close: "19:00" }],
  thu: [{ open: "09:00", close: "19:00" }],
  fri: [{ open: "09:00", close: "20:00" }],
  sat: [{ open: "09:00", close: "20:00" }],
  sun: [{ open: "10:00", close: "17:00" }],
});
const HOURS_OFFICE = JSON.stringify({
  mon: [{ open: "09:00", close: "17:30" }],
  tue: [{ open: "09:00", close: "17:30" }],
  wed: [{ open: "09:00", close: "17:30" }],
  thu: [{ open: "09:00", close: "17:30" }],
  fri: [{ open: "09:00", close: "17:00" }],
});

interface BizSeed {
  name: string;
  category: string;
  city: string;
  address: string;
  postcode: string;
  phone: string;
  website?: string;
  description: string;
  hours?: string;
  plan?: string;
  featured?: boolean;
  level?: number;
  status?: string;
  owned?: boolean; // owned by demo owner account
}

const BUSINESSES: BizSeed[] = [
  // Restaurants
  { name: "Abyssinia Restaurant", category: "restaurants", city: "london", address: "12 Caledonian Road, Islington", postcode: "N1 9DT", phone: "020 7837 1010", website: "https://abyssinia-restaurant.example.co.uk", description: "Family-run Ethiopian restaurant serving traditional injera platters, slow-cooked wots and a full coffee ceremony. Vegan-friendly with a warm, welcoming dining room in the heart of Islington.", hours: HOURS_RESTAURANT, plan: "FEATURED", featured: true, level: 3, owned: true },
  { name: "Lalibela Kitchen", category: "restaurants", city: "birmingham", address: "44 Soho Road, Handsworth", postcode: "B21 9LU", phone: "0121 554 2200", website: "https://lalibela-kitchen.example.co.uk", description: "Authentic Habesha cooking in Birmingham. Generous sharing platters, doro wot on Sundays and freshly made injera every morning. Family booths and event catering available.", hours: HOURS_RESTAURANT, plan: "VERIFIED", level: 2 },
  { name: "Queen of Sheba Restaurant", category: "restaurants", city: "manchester", address: "8 Wilmslow Road, Rusholme", postcode: "M14 5TP", phone: "0161 224 8800", website: "https://queenofsheba.example.co.uk", description: "Ethiopian and Eritrean dishes on Manchester's Curry Mile. Famous for kitfo, shiro and our weekend coffee ceremony with fresh popcorn. Large groups welcome.", hours: HOURS_RESTAURANT, level: 1 },
  { name: "Addis Red Sea", category: "restaurants", city: "leicester", address: "23 Granby Street", postcode: "LE1 6EP", phone: "0116 254 7100", description: "Cosy Ethiopian restaurant near Leicester station with daily vegan fasting menus, tej honey wine and takeaway injera wraps at lunch.", hours: HOURS_RESTAURANT, level: 0 },
  { name: "Habesha Flavours", category: "restaurants", city: "sheffield", address: "101 London Road", postcode: "S2 4LE", phone: "0114 255 6600", description: "Sheffield's home of Ethiopian food. Beyaynetu platters, tibs sizzling plates and student-friendly prices a short walk from the city centre.", hours: HOURS_RESTAURANT, level: 1 },
  // Grocery
  { name: "Habesha Market", category: "grocery-stores", city: "birmingham", address: "162 Dudley Road, Winson Green", postcode: "B18 7QX", phone: "0121 455 7733", website: "https://habesha-market.example.co.uk", description: "Ethiopian and Eritrean groceries: teff flour, berbere, shiro, mitmita, fresh injera daily, Ethiopian coffee beans and traditional clothing. Wholesale enquiries welcome.", hours: HOURS_SHOP, plan: "FEATURED", featured: true, level: 3, owned: true },
  { name: "Merkato Mini Market", category: "grocery-stores", city: "london", address: "201 Old Kent Road", postcode: "SE1 5LU", phone: "020 7701 4040", description: "South London's Ethiopian corner shop. Fresh injera delivered every morning, spices ground in-house, plus money transfer and phone top-up services.", hours: HOURS_SHOP, level: 1 },
  { name: "Axum Grocery", category: "grocery-stores", city: "manchester", address: "55 Stockport Road, Longsight", postcode: "M12 4NN", phone: "0161 273 9090", description: "Family grocery stocking teff, berbere, coffee, frozen kitfo cuts and Habesha homeware. Friendly staff who will track down anything you cannot find.", hours: HOURS_SHOP, level: 2, plan: "VERIFIED" },
  // Cafes
  { name: "Tomoca Coffee House", category: "cafes", city: "london", address: "78 Kingsland High Street, Dalston", postcode: "E8 2NS", phone: "020 7254 6611", website: "https://tomoca-london.example.co.uk", description: "Specialty Ethiopian coffee roasted on site, traditional jebena buna ceremony every Saturday, plus baklava, himbasha bread and fast wifi for remote workers.", hours: HOURS_SHOP, plan: "VERIFIED", level: 2 },
  { name: "Buna Bet Cafe", category: "cafes", city: "sheffield", address: "12 Abbeydale Road", postcode: "S7 1FD", phone: "0114 258 1212", description: "Neighbourhood cafe pouring single-origin Yirgacheffe and Sidamo, with Ethiopian breakfasts of ful, chechebsa and fresh juice on weekends.", hours: HOURS_SHOP, level: 0 },
  // Travel
  { name: "Selam Travel", category: "travel-agencies", city: "london", address: "310 Edgware Road", postcode: "W2 1DY", phone: "020 7723 8181", website: "https://selam-travel.example.co.uk", description: "ATOL-protected flights to Addis Ababa, Asmara and East Africa. Cargo, visa support and Ethiopian Airlines ticketing with multilingual staff in Amharic, Tigrinya and English.", hours: HOURS_OFFICE, plan: "VERIFIED", level: 3 },
  { name: "Walia Tours & Travel", category: "travel-agencies", city: "birmingham", address: "89 Stratford Road, Sparkhill", postcode: "B11 1QS", phone: "0121 772 5566", description: "Flight deals to Ethiopia and Eritrea, Umrah packages and group tour bookings for the Midlands Habesha community since 2009.", hours: HOURS_OFFICE, level: 1 },
  // Lawyers
  { name: "Addis Solicitors", category: "lawyers", city: "london", address: "2nd Floor, 45 Gray's Inn Road", postcode: "WC1X 8PP", phone: "020 7242 3344", website: "https://addis-solicitors.example.co.uk", description: "SRA-regulated solicitors specialising in immigration, asylum, family reunion and housing law. Amharic and Tigrinya spoken. Legal aid cases considered, free first consultation.", hours: HOURS_OFFICE, plan: "FEATURED", featured: true, level: 4, owned: true },
  { name: "Tana Legal Services", category: "lawyers", city: "manchester", address: "150 Cheetham Hill Road", postcode: "M8 8PZ", phone: "0161 832 7700", description: "Immigration and nationality law specialists serving the North West. Fixed fees for visa applications, citizenship and appeals, with evening appointments available.", hours: HOURS_OFFICE, level: 2, plan: "VERIFIED" },
  // Accountants
  { name: "Blue Nile Accounting", category: "accountants", city: "london", address: "Unit 7, 290 High Road, Tottenham", postcode: "N15 4AJ", phone: "020 8801 9090", website: "https://bluenile-accounting.example.co.uk", description: "Chartered accountants for small businesses, restaurants and taxi drivers. Self-assessment, VAT, payroll and company formation explained clearly in Amharic or English.", hours: HOURS_OFFICE, plan: "VERIFIED", level: 3 },
  { name: "Entoto Tax & Books", category: "accountants", city: "leicester", address: "31 Belgrave Gate", postcode: "LE1 3HR", phone: "0116 251 4400", description: "Affordable bookkeeping, tax returns and CIS refunds for the East Midlands community. First-year discount for new Ethiopian-owned businesses.", hours: HOURS_OFFICE, level: 1 },
  // Beauty
  { name: "Sheba Hair & Beauty", category: "beauty-services", city: "london", address: "133 Rye Lane, Peckham", postcode: "SE15 4ST", phone: "020 7639 2233", description: "Habesha hair braiding, weaves, bridal styling and traditional shuruba. Walk-ins welcome, bridal parties by appointment with henna artists on site.", hours: HOURS_SHOP, level: 2, plan: "VERIFIED" },
  { name: "Adey Beauty Studio", category: "beauty-services", city: "birmingham", address: "12 Bearwood Road, Smethwick", postcode: "B66 4HB", phone: "0121 420 1100", description: "Nails, lashes, brows and Habesha bridal makeup. Late-night appointments Thursdays and Fridays, with student discounts every Wednesday.", hours: HOURS_SHOP, level: 0 },
  // Construction
  { name: "Ras Dashen Builders", category: "construction", city: "london", address: "Unit 3, 55 Markhouse Road, Walthamstow", postcode: "E17 8BB", phone: "020 8520 6677", description: "Extensions, loft conversions, kitchens and full refurbishments. Fully insured with checkable references across East London. Free written quotes within 48 hours.", hours: HOURS_OFFICE, level: 1 },
  { name: "Semien Contractors", category: "construction", city: "manchester", address: "27 Bury New Road", postcode: "M8 8FR", phone: "0161 795 8800", description: "Commercial and domestic building work, shop fit-outs and property maintenance for landlords across Greater Manchester.", hours: HOURS_OFFICE, level: 0 },
  // Cleaning
  { name: "Shine Addis Cleaning", category: "cleaning-services", city: "london", address: "Office 12, 2 Thames Road, Barking", postcode: "IG11 0HZ", phone: "020 8594 3030", description: "End-of-tenancy, office and deep cleaning across London. DBS-checked, insured team with same-week availability and a satisfaction guarantee.", hours: HOURS_OFFICE, level: 2, plan: "VERIFIED" },
  { name: "Fresh Start Cleaners", category: "cleaning-services", city: "sheffield", address: "8 Spital Hill", postcode: "S4 7LG", phone: "0114 272 5050", description: "Domestic and commercial cleaning in Sheffield and Rotherham. Regular weekly slots, carpet cleaning and after-builders cleans.", hours: HOURS_OFFICE, level: 0 },
  // Wedding services
  { name: "Habesha Grand Hall", category: "wedding-services", city: "london", address: "Royal Victoria Dock, 1 Western Gateway", postcode: "E16 1XL", phone: "020 7474 9999", website: "https://habesha-grand-hall.example.co.uk", description: "Landmark events venue for Habesha weddings up to 600 guests. In-house Ethiopian catering, stage and sound, bridal suite, free parking and flexible packages.", hours: HOURS_OFFICE, plan: "FEATURED", featured: true, level: 3 },
  { name: "Addis Event Centre", category: "wedding-services", city: "london", address: "240 High Road, Willesden", postcode: "NW10 2NX", phone: "020 8459 7777", description: "Weddings, christenings and community events for up to 300 guests. Full catering kitchen, decor packages and late licence until 2am.", hours: HOURS_OFFICE, level: 2, plan: "VERIFIED" },
  { name: "Enku Wedding Photography", category: "wedding-services", city: "birmingham", address: "Studio 5, Custard Factory, Gibb Street", postcode: "B9 4AA", phone: "0121 224 7788", website: "https://enku-photography.example.co.uk", description: "Award-winning Habesha wedding photography and cinematic film. Telet and melse coverage, same-day edits and albums shipped worldwide.", hours: HOURS_OFFICE, level: 2, plan: "VERIFIED" },
  // Churches
  { name: "St. Mary Ethiopian Orthodox Tewahedo Church", category: "churches", city: "london", address: "Battersea Park Road", postcode: "SW11 4LG", phone: "020 7622 4060", description: "Ethiopian Orthodox Tewahedo parish with Kidase every Sunday from 7am, Sunday school, Amharic classes and youth fellowship. All are welcome.", level: 1 },
  { name: "Medhane Alem Church Manchester", category: "churches", city: "manchester", address: "Moss Lane East, Moss Side", postcode: "M16 7DG", phone: "0161 226 5511", description: "Weekly liturgy, baptisms, weddings and community support services for the Ethiopian Orthodox community in the North West.", level: 0 },
  // Community organizations
  { name: "Ethiopian Community in Britain", category: "community-organizations", city: "london", address: "2A Lithos Road, Hampstead", postcode: "NW3 6EF", phone: "020 7794 4265", website: "https://ecib.example.org.uk", description: "Registered charity supporting Ethiopians in the UK since 1984. Advice surgeries, ESOL classes, elders lunch club, youth mentoring and cultural events.", hours: HOURS_OFFICE, level: 3, plan: "VERIFIED" },
  { name: "Habesha Community Leicester", category: "community-organizations", city: "leicester", address: "St Matthews Centre, Malabar Road", postcode: "LE1 2PD", phone: "0116 262 8080", description: "Volunteer-run association organising Enkutatash celebrations, supplementary school and welfare support for new arrivals in Leicester.", level: 1 },
  // Pending (for admin demo)
  { name: "Zema Sound & Events", category: "wedding-services", city: "sheffield", address: "14 The Moor", postcode: "S1 4PF", phone: "0114 279 6611", description: "DJ, PA hire and lighting for Habesha weddings and parties across Yorkshire. Ethiopian and Eritrean music specialists.", status: "PENDING" },
  { name: "Kaldi's Coffee Imports", category: "grocery-stores", city: "london", address: "Arch 7, Rope Street, Surrey Quays", postcode: "SE16 7TX", phone: "020 7237 5151", description: "Direct-trade green and roasted Ethiopian coffee for cafes and home brewers. Wholesale and subscriptions.", status: "PENDING" },
];

interface EventSeed {
  title: string;
  type: string;
  city: string;
  venueName: string;
  address: string;
  startsAt: Date;
  description: string;
  ticketUrl?: string;
  priceFrom?: number;
  featured?: boolean;
  status?: string;
}

const EVENTS: EventSeed[] = [
  { title: "Ethiopian New Year Festival 2026", type: "cultural", city: "london", venueName: "Habesha Grand Hall", address: "Royal Victoria Dock, London", startsAt: new Date("2026-09-11T14:00:00"), description: "Enkutatash! The UK's biggest Ethiopian New Year celebration: live music, traditional dance, coffee ceremony, kids' zone and a Habesha food market.", ticketUrl: "https://tickets.example.com/enkutatash-2026", priceFrom: 15, featured: true },
  { title: "Habesha Business Expo", type: "business", city: "birmingham", venueName: "Birmingham City Hall", address: "Victoria Square, Birmingham", startsAt: new Date("2026-07-24T09:30:00"), description: "Exhibition and networking for Ethiopian and Eritrean entrepreneurs across the UK. Panels on funding, importing and growing your high-street business.", ticketUrl: "https://tickets.example.com/habesha-expo", priceFrom: 10, featured: true },
  { title: "Habesha Concert: Teddy Tribute Night", type: "music", city: "manchester", venueName: "O2 Ritz Manchester", address: "Whitworth Street West, Manchester", startsAt: new Date("2026-08-08T19:00:00"), description: "A night of Ethiopian classics and modern hits with a live band, special guest vocalists and DJ until late.", ticketUrl: "https://tickets.example.com/habesha-concert", priceFrom: 25, featured: true },
  { title: "Meskel Demera Celebration", type: "religious", city: "london", venueName: "St. Mary Ethiopian Orthodox Church", address: "Battersea Park Road, London", startsAt: new Date("2026-09-26T16:00:00"), description: "Annual Meskel bonfire celebration with prayers, chanting and community feast. Open to all.", priceFrom: 0 },
  { title: "Ethiopian Coffee Ceremony Masterclass", type: "education", city: "london", venueName: "Tomoca Coffee House", address: "Kingsland High Street, Dalston", startsAt: new Date("2026-07-04T11:00:00"), description: "Hands-on jebena buna workshop: roasting, grinding and the three rounds of buna. Includes beans to take home.", ticketUrl: "https://tickets.example.com/buna-class", priceFrom: 20 },
  { title: "Habesha Networking Drinks", type: "networking", city: "london", venueName: "The Anthologist, Gresham Street", address: "58 Gresham Street, London", startsAt: new Date("2026-06-26T18:30:00"), description: "Monthly informal meet-up for Habesha professionals in finance, tech, law and healthcare. First drink on us for new members.", ticketUrl: "https://tickets.example.com/habesha-network", priceFrom: 5 },
  { title: "Community Iftar & Fundraiser", type: "community", city: "leicester", venueName: "St Matthews Centre", address: "Malabar Road, Leicester", startsAt: new Date("2026-07-18T18:00:00"), description: "Fundraising dinner for the Leicester supplementary school. Traditional dishes, raffle and cultural performances.", priceFrom: 12 },
  { title: "Eritrean & Ethiopian Cultural Day", type: "cultural", city: "sheffield", venueName: "Sheffield City Hall", address: "Barker's Pool, Sheffield", startsAt: new Date("2026-08-22T12:00:00"), description: "Music, traditional dress showcase, kids' activities and food stalls celebrating Habesha culture in Yorkshire.", ticketUrl: "https://tickets.example.com/sheffield-cultural-day", priceFrom: 8 },
  { title: "Amharic for Beginners — Summer Course", type: "education", city: "manchester", venueName: "Manchester Central Library", address: "St Peter's Square, Manchester", startsAt: new Date("2026-07-11T10:00:00"), description: "Six-week Saturday course covering fidel, greetings and everyday conversation. Materials included.", ticketUrl: "https://tickets.example.com/amharic-course", priceFrom: 60 },
  { title: "Habesha Wedding Fair", type: "business", city: "london", venueName: "Addis Event Centre", address: "High Road, Willesden", startsAt: new Date("2026-10-04T11:00:00"), description: "Meet venues, photographers, caterers, dress designers and melse planners all under one roof. Live bridal showcase at 2pm.", ticketUrl: "https://tickets.example.com/wedding-fair", priceFrom: 0 },
  { title: "Gospel & Mezmur Night", type: "religious", city: "birmingham", venueName: "Bethel Convention Centre", address: "Kelvin Way, West Bromwich", startsAt: new Date("2026-08-29T18:00:00"), description: "An evening of mezmur with choirs from across the Midlands. Family-friendly, refreshments available.", priceFrom: 0 },
  { title: "Ethio-UK Startup Pitch Night", type: "networking", city: "london", venueName: "Google Campus", address: "4-5 Bonhill Street, London", startsAt: new Date("2026-09-17T18:00:00"), description: "Five Habesha founders pitch to a panel of investors. Networking and injera canapes to follow.", ticketUrl: "https://tickets.example.com/pitch-night", priceFrom: 7, status: "PENDING" },
];

const REVIEW_POOL: { rating: number; title: string; body: string }[] = [
  { rating: 5, title: "Best injera in the city", body: "Amazing authentic food, the injera was fresh and the doro wot rich and spicy. Staff were so friendly and explained every dish. We will be back!" },
  { rating: 5, title: "A true gem", body: "Lovely authentic dishes and a wonderful atmosphere with traditional music. The coffee ceremony at the end was beautiful. Highly recommend." },
  { rating: 4, title: "Great food, slow on Saturdays", body: "The food was delicious and great value for the portions. Only downside was the waiting time on a busy Saturday night, almost 40 minutes for mains." },
  { rating: 5, title: "Felt like home", body: "Welcoming staff, generous portions and the best shiro I have had outside Addis. Clean, cosy and great value." },
  { rating: 3, title: "Good but pricey", body: "Food was good and authentic but a bit expensive compared to similar places. Service was friendly though the wait was long." },
  { rating: 5, title: "Excellent service", body: "Excellent, professional service from start to finish. They were helpful, quick to respond and the result was perfect. Highly recommend to anyone." },
  { rating: 4, title: "Very helpful team", body: "Friendly and knowledgeable staff who took time to explain everything clearly. Good value and a clean, organised office." },
  { rating: 5, title: "Sorted everything quickly", body: "Brilliant service. They handled my case professionally and kept me updated at every step. The staff are friendly and speak Amharic which made everything easy." },
  { rating: 2, title: "Disappointing visit", body: "Unfortunately a bad experience. The waiting time was terrible and the staff seemed rude and dismissive when we asked. Hopefully just an off day." },
  { rating: 4, title: "Great selection", body: "Great selection of spices and fresh injera daily. Prices are reasonable and the owner is lovely. Parking nearby can be difficult at busy times." },
  { rating: 5, title: "Fresh and authentic", body: "Everything is fresh and authentic, from the teff to the coffee beans. The staff are friendly and always happy to help you find things." },
  { rating: 4, title: "Lovely atmosphere", body: "Beautiful cosy atmosphere and excellent single-origin coffee. Gets busy at weekends so come early. Good value lunch deals." },
  { rating: 5, title: "Perfect for our wedding", body: "We hired them for our wedding and they were fantastic. Beautiful venue, amazing food and the team were so helpful throughout. Our guests still talk about it." },
  { rating: 4, title: "Professional and reliable", body: "Reliable, professional and great communication. Work was completed on time and the price was exactly as quoted. Would use again." },
  { rating: 5, title: "Highly recommend", body: "Wonderful experience. Friendly staff, spotless clean and excellent attention to detail. The best in the area by far." },
  { rating: 3, title: "Decent but slow", body: "Decent quality overall but quite slow to respond to messages and the appointment started late. Good value for the price though." },
];

const OWNER_RESPONSES = [
  "Thank you so much for your kind words! We look forward to welcoming you back soon.",
  "Thank you for the feedback. We are so glad you enjoyed your visit — see you again soon!",
  "We are sorry about the wait on busy nights and are adding more weekend staff. Thank you for your patience and support.",
];

async function main() {
  console.log("Clearing existing data...");
  await db.importJob.deleteMany();
  await db.analyticsEvent.deleteMany();
  await db.ad.deleteMany();
  await db.claimRequest.deleteMany();
  await db.review.deleteMany();
  await db.favorite.deleteMany();
  await db.follow.deleteMany();
  await db.businessPhoto.deleteMany();
  await db.event.deleteMany();
  await db.business.deleteMany();
  await db.user.deleteMany();

  // No hard-coded credentials in source. Use SEED_PASSWORD if provided, else a
  // random per-run password (printed once to the seeding operator only). Seed
  // accounts are for local/dev fixtures and must never be relied on in prod.
  const seedPassword = process.env.SEED_PASSWORD || `seed-${randomBytes(12).toString("hex")}`;
  if (!process.env.SEED_PASSWORD) {
    console.log(`[seed] generated dev password for fixture accounts: ${seedPassword}`);
  }
  const hash = await bcrypt.hash(seedPassword, 10);

  console.log("Creating users...");
  const admin = await db.user.create({ data: { email: "admin@ebh.uk", passwordHash: hash, name: "EBH Admin", roles: "USER,ADMIN" } });
  const owner = await db.user.create({ data: { email: "owner@ebh.uk", passwordHash: hash, name: "Selam Bekele", roles: "USER,BUSINESS_OWNER" } });
  const organizer = await db.user.create({ data: { email: "organizer@ebh.uk", passwordHash: hash, name: "Dawit Haile", roles: "USER,EVENT_ORGANIZER" } });
  const demoUser = await db.user.create({ data: { email: "user@ebh.uk", passwordHash: hash, name: "Hanna Tesfaye", roles: "USER" } });

  const firstNames = ["Meron", "Yonas", "Liya", "Abel", "Sara", "Bereket", "Tigist", "Samuel", "Rahel", "Henok", "Mahder", "Eyob", "Bethlehem", "Natnael"];
  const lastNames = ["Tadesse", "Gebre", "Alemu", "Kebede", "Worku", "Assefa", "Mengistu", "Negash", "Abate", "Desta", "Fikre", "Girma", "Hagos", "Lemma"];
  const reviewers = [demoUser];
  for (let i = 0; i < 14; i++) {
    reviewers.push(
      await db.user.create({
        data: { email: `member${i + 1}@example.com`, passwordHash: hash, name: `${firstNames[i]} ${lastNames[i]}`, roles: "USER" },
      })
    );
  }

  console.log("Creating businesses...");
  const businessIds: { id: string; status: string }[] = [];
  for (const b of BUSINESSES) {
    const slug = slugify(b.name);
    const geo = CITY_GEO[b.city];
    const photoCount = 4;
    const socials = JSON.stringify({ instagram: `https://instagram.com/${slug}`, facebook: `https://facebook.com/${slug}` });
    const level = b.level ?? 0;
    const created = await db.business.create({
      data: {
        name: b.name,
        slug,
        category: b.category,
        description: b.description,
        address: b.address,
        city: b.city,
        postcode: b.postcode,
        lat: geo.lat + jitter(),
        lng: geo.lng + jitter(),
        phone: b.phone,
        website: b.website ?? "",
        socials,
        openingHours: b.hours ?? "{}",
        verificationLevel: level,
        featured: b.featured ?? false,
        plan: b.plan ?? "FREE",
        status: b.status ?? "APPROVED",
        ownerId: b.owned ? owner.id : null,
        claimedAt: b.owned ? new Date("2026-01-15") : null,
        sourceType: "demo",
        sourceId: `demo-${slug}`,
        photos: {
          create: Array.from({ length: photoCount }, (_, i) => ({
            url: photoUrl(`${slug}-${i + 1}`),
            alt: `${b.name} photo ${i + 1}`,
            sortOrder: i,
          })),
        },
        sources: {
          create: [{ sourceType: "demo", sourceId: `demo-${slug}`, rawData: "{}" }],
        },
      },
    });
    businessIds.push({ id: created.id, status: b.status ?? "APPROVED" });
  }

  console.log("Creating reviews...");
  let reviewCount = 0;
  const approved = businessIds.filter((b) => b.status === "APPROVED");
  for (let bi = 0; bi < approved.length; bi++) {
    const numReviews = 2 + Math.floor(rnd() * 3); // 2-4 each
    const offset = Math.floor(rnd() * reviewers.length);
    for (let i = 0; i < numReviews; i++) {
      const reviewer = reviewers[(offset + i) % reviewers.length];
      const r = REVIEW_POOL[Math.floor(rnd() * REVIEW_POOL.length)];
      const withResponse = rnd() < 0.3;
      await db.review.create({
        data: {
          businessId: approved[bi].id,
          userId: reviewer.id,
          rating: r.rating,
          title: r.title,
          body: r.body,
          ownerResponse: withResponse ? OWNER_RESPONSES[Math.floor(rnd() * OWNER_RESPONSES.length)] : null,
          ownerRespondedAt: withResponse ? new Date("2026-05-01") : null,
          createdAt: new Date(2026, Math.floor(rnd() * 5), 1 + Math.floor(rnd() * 27)),
        },
      });
      reviewCount++;
    }
  }

  console.log("Creating favorites and follows for demo user...");
  for (const b of approved.slice(0, 4)) {
    await db.favorite.create({ data: { userId: demoUser.id, businessId: b.id } });
  }
  for (const b of approved.slice(0, 2)) {
    await db.follow.create({ data: { userId: demoUser.id, businessId: b.id } });
  }

  console.log("Creating events...");
  for (const e of EVENTS) {
    const slug = slugify(e.title);
    const geo = CITY_GEO[e.city];
    await db.event.create({
      data: {
        title: e.title,
        slug,
        type: e.type,
        description: e.description,
        imageUrl: photoUrl(`event-${slug}`, 800, 1000),
        startsAt: e.startsAt,
        endsAt: new Date(e.startsAt.getTime() + 5 * 3600 * 1000),
        venueName: e.venueName,
        address: e.address,
        city: e.city,
        lat: geo.lat + jitter(),
        lng: geo.lng + jitter(),
        ticketUrl: e.ticketUrl ?? "",
        priceFrom: e.priceFrom ?? null,
        organizerId: organizer.id,
        status: e.status ?? "APPROVED",
        featured: e.featured ?? false,
        sourceType: "demo",
        sources: {
          create: [{ sourceType: "demo", sourceId: `demo-${slug}` }],
        },
      },
    });
  }

  console.log("Creating ads...");
  const ads = [
    { placement: "HOME_HERO", headline: "Fly to Addis Ababa from £499 return", body: "Selam Travel — ATOL-protected fares and cargo services.", targetUrl: "/business/selam-travel", imageUrl: photoUrl("ad-travel", 1200, 300) },
    { placement: "SEARCH_RESULTS", headline: "Need an accountant who speaks your language?", body: "Blue Nile Accounting — self-assessment from £99.", targetUrl: "/business/blue-nile-accounting", imageUrl: photoUrl("ad-accounting", 800, 200) },
    { placement: "BUSINESS_DETAIL", headline: "Plan your wedding at Habesha Grand Hall", body: "Up to 600 guests, in-house Ethiopian catering.", targetUrl: "/business/habesha-grand-hall", imageUrl: photoUrl("ad-wedding", 800, 200) },
    { placement: "EVENT_DETAIL", headline: "Promote your business to thousands of Ethiopian consumers", body: "Banner advertising from £50/month.", targetUrl: "/advertise", imageUrl: photoUrl("ad-promo", 800, 200) },
  ];
  for (const a of ads) await db.ad.create({ data: a });

  console.log("Creating sample analytics...");
  const analyticsTypes = ["LISTING_VIEW", "LISTING_VIEW", "LISTING_VIEW", "PHONE_CLICK", "WEBSITE_CLICK"];
  for (const b of approved) {
    const n = 20 + Math.floor(rnd() * 60);
    for (let i = 0; i < n; i++) {
      await db.analyticsEvent.create({
        data: {
          type: analyticsTypes[Math.floor(rnd() * analyticsTypes.length)],
          businessId: b.id,
          createdAt: new Date(Date.now() - Math.floor(rnd() * 30) * 24 * 3600 * 1000),
        },
      });
    }
  }

  const counts = {
    users: await db.user.count(),
    businesses: await db.business.count(),
    reviews: reviewCount,
    events: await db.event.count(),
    ads: await db.ad.count(),
    analytics: await db.analyticsEvent.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
