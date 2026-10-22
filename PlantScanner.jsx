import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Upload,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Sun,
  Droplets,
  Thermometer,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Leaf,
  Scan,
  X,
  Info,
  BookOpen,
  Lock,
  Microscope,
  Activity,
  ShieldQuestion,
  Pill,
  FlaskConical,
  Eye,
  Timer,
  CloudSun,
  Sprout,
  Stamp,
  History,
  Clock,
  Trash2,
  Share2,
  Bookmark
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Offline botanical knowledge base.
//
// This is the fallback used when the server has no GEMINI_API_KEY configured or
// the vision request fails. It also defines the *shape* the server returns, so
// every field below has a matching entry in server/vision.js and every one of
// them is rendered somewhere in the report card.
// ---------------------------------------------------------------------------
const BOTANICAL_DATABASE = [
  {
    id: 'aloe-vera',
    commonName: 'Aloe Vera',
    scientificName: 'Aloe barbadensis miller',
    family: 'Asphodelaceae',
    confidence: 99.4,
    healthStatus: 'Healthy',
    issue: 'None — optimal, vigorous foliage. No lesions, chlorosis, or pest activity was detected on the scanned surface.',
    severity: '0% (Healthy)',
    organScanned: 'Mature outer leaf, upper epidermis',
    growthStage: 'Mature rosette',
    overview: 'A stemless succulent rosette of thick, gel-filled lanceolate leaves edged with soft pale teeth. It is a CAM (crassulacean acid metabolism) plant, meaning its stomata open at night to fix carbon dioxide — which is why it is so drought tolerant and why it keeps releasing oxygen after dark.',
    appearance: 'Leaves are 30–60 cm long, blue-green to grey-green, with a waxy cuticle and a mildly serrated margin. Healthy specimens are plump, upright, and translucent at the base.',
    medicinal: {
      constituents: 'Acemannan (a mucopolysaccharide) and glucomannan in the inner gel; anthraquinones (aloin, aloe-emodin) concentrated in the yellow latex layer just under the rind.',
      uses: 'The inner gel is a classic vulnerary (wound healer): it speeds collagen synthesis and keratinocyte migration, so it is used topically on minor burns, sunburn, scalds, eczema, psoriasis plaques, razor burn, and grazes. Taken internally as a food-grade fillet (never the whole leaf) it acts as a demulcent for reflux and constipation.',
      preparation: 'For burns and grazes: split a mature lower leaf, scoop the clear inner gel, and apply a thin layer 2–3 times daily. For a soothing drink: blend 2 tbsp of gel into water or juice. Never consume the yellow latex — it is a strong anthraquinone laxative.',
      caution: 'Do not apply to deep or infected wounds, and stop if irritation develops. The latex is a stimulant laxative and is unsuitable for long-term use or during pregnancy.',
      evidence: 'Well studied in dermatology for burn healing and as an adjunct in oral lichen planus; the internal laxative action rests on the anthraquinone content.',
    },
    needs: {
      sunlight: 'Bright indirect light with 4–6 hours of gentle morning sun. Scorches only in harsh all-day summer sun.',
      watering: 'Deep soak every 14–21 days in warm weather, every 4–6 weeks in cool weather. Let the medium dry out completely first.',
      soil: 'Gritty cactus or succulent mix with 30–50% perlite or pumice. pH 6.0–7.2.',
      temperature: '18–29°C (65–85°F). Tolerates 10°C (50°F) briefly. Chilling below 5°C causes collapse.',
      humidity: 'Average indoor humidity (~40%). Avoid misting — standing water in the rosette core invites rot.',
      fertilizer: 'Dilute succulent feed (half strength) once in spring and once in midsummer. Do not feed in winter.',
    },
    petSafety: {
      safe: false,
      status: 'Toxic to Dogs, Cats & Birds',
      note: 'Aloin, aloesin, and saponins in the leaf latex are the culprits. Chewing the plant causes vomiting, diarrhea, lethargy, unsteady walking, and red-tinted urine; heavy ingestion can trigger tremors. Cats appear especially sensitive.',
      symptoms: 'Vomiting, diarrhea, drooling, loss of appetite, lethargy, tremors, changes in urine colour.',
      action: 'Remove the plant from reach and phone your vet or a pet poison line. Do not induce vomiting unless a vet tells you to. Rinse the mouth with water if latex is still present.',
    },
    household: 'Used in natural skincare balms, hair masks, and as a root-soothing gel for minor kitchen burns. It is also mildly air-improving — it strips formaldehyde and benzene from indoor air and, unusually for a houseplant, continues fixing carbon after dark.',
    ecosystem: 'Pollinated by sunbirds and bees in its native Arabia; the gel-filled leaf is a water-storage adaptation for semi-arid scrubland.',
    treatment: '1. No disease present — keep the current drought-tolerant routine.\n2. Confirm the pot has drainage holes and a free-draining mix; most aloe deaths are root rot from overwatering.\n3. Remove any lower leaf that yellows or feels soft at the base.\n4. Repot every 2–3 years in spring, going up only one pot size.\n5. Rotate the pot quarterly so the rosette does not lean towards the light.',
    prevention: 'Water the medium, never the crown; keep the plant off cold windowsills in winter; quarantine new plants for two weeks before placing them beside this one.',
    derivedFrom: 'Curated botanical database (Aloe), cross-checked against ASPCA pet-toxicity data.',
    specimenEmoji: '🪴',
  },
  {
    id: 'guava-bayabas',
    commonName: 'Guava (Bayabas)',
    scientificName: 'Psidium guajava',
    family: 'Myrtaceae',
    confidence: 98.8,
    healthStatus: 'Healthy / Minor Insect Activity',
    issue: 'Minor aphid foliar feeding on the undersides of two young leaves — low severity. The aphids are tapping phloem sap and are not yet transmitting disease; natural predators usually catch up within a week or two.',
    severity: '12% of leaf surface (Low)',
    organScanned: 'Young expanding leaf, underside surface',
    growthStage: 'Vegetative flush',
    overview: 'A fast-growing evergreen shrub or small tree to 6 m, with opposite oval leaves on four-angled twigs and thin peeling bark. Guava leaf has one of the highest tannin contents of any common fruit tree, which is exactly why it works as an astringent medicine.',
    appearance: 'Leaves are 7–15 cm, oblong-elliptic, dull green above and softly hairy beneath, with prominent parallel lateral veins. Crushed leaves release a resinous, slightly citrus aroma.',
    medicinal: {
      constituents: 'Tannins (up to about 15% in dried leaf), flavonoids (quercetin, guaijaverin), triterpenes, and vitamin C in the fruit.',
      uses: 'The most widely used folk antiseptic in the Philippines. A cooled decoction of the leaves is used as a wound and burn wash, a gargle for sore throat and mouth ulcers, a sitz bath during post-partum recovery, and a rinse for diarrhea. The fruit is a vitamin-C-rich food that supports immunity and skin repair.',
      preparation: 'Antiseptic wash: boil 10–15 washed fresh leaves in 1 L water for 15 minutes, cool, strain, and use within 24 hours. Mouth rinse: the same decoction at room temperature, three times daily. Never apply boiling liquid to skin.',
      caution: 'Topical use is very safe. Avoid drinking large volumes of the decoction during pregnancy. Very high tannin intake can cause stomach irritation or constipation.',
      evidence: 'Antibacterial activity against Staphylococcus aureus, E. coli, and oral bacteria is well documented in vitro, supporting the wound-wash tradition. Human clinical trials remain limited.',
    },
    needs: {
      sunlight: 'Full sun, 8+ hours. Shade sharply reduces fruiting.',
      watering: 'Moderate. Deep soak weekly in the dry season, tapering in the wet season. Established trees are drought-hardy; container plants are not.',
      soil: 'Rich, well-draining loam. pH 5.0–7.0. Tolerates poor soil but fruits best in fertile ground.',
      temperature: '23–32°C (73–90°F). Protect from frost and from long spells below 10°C.',
      humidity: 'Thrives in humid tropics. Good airflow reduces anthracnose.',
      fertilizer: 'Balanced fruit-tree feed monthly through the growing season, plus potassium at flowering.',
    },
    petSafety: {
      safe: true,
      status: 'Safe for Dogs & Cats',
      note: 'Guava fruit, leaves, and seeds are non-toxic to dogs and cats. The seeds are hard, so a large amount of fruit can cause mild stomach upset or pose a choking risk; the leaves are simply bitter and rarely eaten.',
      symptoms: 'None expected. Watch only for vomiting or diarrhea after a very large fruit meal.',
      action: 'No emergency action needed. Keep whole fruit away from small pets to avoid choking.',
    },
    household: 'Fruit for fresh eating, juice, and jam; leaf decoctions for household antiseptic wash, herbal tea, and soap-making. The wood is dense and traditionally used for tool handles and firewood.',
    ecosystem: 'A larval host for the guava skipper butterfly. Bees pollinate the fluffy white flowers, and the fruit feeds birds and fruit bats throughout the tropics.',
    treatment: '1. Knock the aphids off with a strong jet of water aimed at the leaf undersides.\n2. Spray a mild organic neem oil or insecticidal soap late in the day, every 5–7 days for 3 rounds.\n3. Thin dense inner growth so air and ladybirds can reach the colonies.\n4. Pause nitrogen-heavy feeding while the new flush is soft — it invites aphids.\n5. Re-scan the undersides of new leaves in 7 days to confirm the count is falling.',
    prevention: 'Inspect new growth weekly, encourage ladybirds and hoverflies, and keep ants off the trunk — ants farm aphids for honeydew and will keep reintroducing them.',
    derivedFrom: 'Curated botanical database (Guava), Philippine ethnobotanical tradition.',
    specimenEmoji: '🍈',
  },
  {
    id: 'snake-plant',
    commonName: "Snake Plant (Mother-in-Law's Tongue)",
    scientificName: 'Dracaena trifasciata',
    family: 'Asparagaceae',
    confidence: 99.2,
    healthStatus: 'Healthy',
    issue: 'None — pristine foliar condition. Upright turgid leaves, strong horizontal banding, and no evidence of rhizome rot or mealybug.',
    severity: '0% (Healthy)',
    organScanned: 'Mature leaf blade, mid-section',
    growthStage: 'Established clump',
    overview: 'A rhizomatous succulent that evolved in the seasonally dry tropics of West Africa. Its CAM metabolism lets it open its stomata at night, so it is one of the few houseplants that keeps producing oxygen after dark — a trait that made it famous in the NASA clean-air studies.',
    appearance: 'Stiff, sword-shaped leaves 40–120 cm, dark green with irregular transverse grey-green bands and often a yellow margin. Leaves rise from a shallow orange rhizome mat, never from a central trunk.',
    medicinal: {
      constituents: 'Saponins (sansevierigenin derivatives), a little mucilage, and irritating calcium oxalate-like crystals in the leaf sap.',
      uses: 'Traditional folk medicine only. The expressed leaf juice has been applied topically in West Africa for minor skin inflammation, ringworm, and insect bites, and the ash used in wound dressings. It is not a modern therapeutic plant.',
      preparation: 'Folk topical: a few drops of fresh leaf juice on intact skin for itching. Wash the area afterwards.',
      caution: 'Never eat or drink any preparation of this plant. The saponins irritate the mouth and gut, and the plant is toxic to pets. Keep every home remedy strictly topical.',
      evidence: 'Almost entirely ethnobotanical. There is no clinical trial base — treat internal claims as unverified.',
    },
    needs: {
      sunlight: 'Adaptable from deep shade to bright indirect light. Direct harsh midday sun bleaches the leaves.',
      watering: 'Lowest of any common houseplant — once every 2–4 weeks in summer and as little as every 6–8 weeks in winter. Water only when the medium is bone dry.',
      soil: 'Free-draining succulent mix, ideally with added perlite. pH 5.5–7.5.',
      temperature: '15–30°C (60–85°F). Keep above 10°C (50°F).',
      humidity: 'Ordinary dry indoor air is ideal. Never mist the rosette.',
      fertilizer: 'One half-strength succulent feed in spring and one in summer. Feeding in winter is the usual cause of soft rot.',
    },
    petSafety: {
      safe: false,
      status: 'Toxic to Dogs & Cats',
      note: 'Steroidal saponins are concentrated in the leaves and rhizome. Biting or chewing causes nausea, heavy drooling, vomiting, and diarrhea. Symptoms are usually self-limiting, but the plant is genuinely toxic, not merely unpalatable.',
      symptoms: 'Drooling, nausea, vomiting, diarrhea, abdominal pain, loss of appetite.',
      action: 'Move the plant out of reach and call your vet if a pet has chewed it. Offer water; do not induce vomiting without veterinary advice.',
    },
    household: 'A bulletproof bathroom or bedroom plant that survives neglect and low light. It filters airborne formaldehyde, benzene, trichloroethylene, xylene, and toluene, and is one of the few plants that scrubs carbon dioxide at night.',
    ecosystem: 'Propagates naturally by underground rhizome spread and by leaf fragments rooting in dry soil — a survival strategy for rocky, seasonal habitat.',
    treatment: '1. No action required. Keep the current light and watering rhythm.\n2. Wipe the leaves with a damp cloth monthly; dust blocks the stomata the plant relies on.\n3. Water the rim of the pot only — never into the centre of the rosette.\n4. Divide the clump every 3–5 years when the rhizomes crowd the pot edge.\n5. Check the base monthly for soft brown patches, the first sign of rhizome rot.',
    prevention: 'Use a pot with drainage, never let the plant stand in water, and cut watering back whenever indoor temperatures drop below 15°C.',
    derivedFrom: 'Curated botanical database (Dracaena), cross-checked against ASPCA pet-toxicity data.',
    specimenEmoji: '🌿',
  },
  {
    id: 'oregano',
    commonName: 'Cuban Oregano / Mexican Mint',
    scientificName: 'Plectranthus amboinicus',
    family: 'Lamiaceae',
    confidence: 99.0,
    healthStatus: 'Healthy / High Vitality',
    issue: 'None — robust aromatic foliage. Thick, fleshy leaves with strong oil-gland development and no pest damage.',
    severity: '0% (Healthy)',
    organScanned: 'Mature leaf, full blade',
    growthStage: 'Active vegetative growth',
    overview: 'A sprawling succulent-stemmed herb in the mint family, grown across the tropics as Mexican mint, Indian borage, and Cuban oregano. Almost all of its value sits in the essential oil trapped in the fleshy leaves — crush one and the smell fills a room.',
    appearance: 'Thick, fleshy, broadly ovate leaves 5–10 cm with scalloped margins, covered in fine velvety hairs. The stems are succulent and semi-prostrate, rooting wherever they touch soil.',
    medicinal: {
      constituents: 'Volatile oils dominated by carvacrol and thymol, plus caryophyllene and limonene; rosmarinic acid and flavonoids in the leaf.',
      uses: 'A first-line home remedy across Southeast Asia. The leaf is a potent antibacterial and expectorant: crushed leaf or leaf tea is used for cough, sore throat, bronchitis, and nasal congestion, and a warmed leaf is laid on insect stings, boils, and small burns. Carvacrol is the same compound that gives oregano its antimicrobial power.',
      preparation: 'For cough: steep 3–4 fresh leaves in hot water for 5 minutes, sweeten with honey, and drink 2–3 times daily. For stings: crush a leaf, warm it briefly against the skin, and hold it in place for 10 minutes.',
      caution: 'Not for medicinal doses during pregnancy or breastfeeding. Do not apply to broken skin. Concentrated essential oil must never be swallowed. Check for individual allergy before internal use.',
      evidence: 'Carvacrol and thymol show strong in vitro antibacterial and antifungal activity; the traditional cough use is plausible but not confirmed by controlled human trials.',
    },
    needs: {
      sunlight: 'Bright light with some direct morning sun, 4–6 hours. Full tropical sun is fine if the roots stay moist.',
      watering: 'Water when the top 2–3 cm of soil is dry — roughly weekly. Drought tolerant; the leaves store water.',
      soil: 'Well-draining, compost-enriched mix in a pot with drainage. pH 6.0–7.5.',
      temperature: '20–32°C (68–90°F). Very frost tender; move indoors below 12°C.',
      humidity: 'Tolerates average to high humidity; good airflow prevents stem rot.',
      fertilizer: 'Light feeding monthly. Rich nitrogen makes the leaves soft and dilutes the aromatic oil.',
    },
    petSafety: {
      safe: false,
      status: 'Mildly Toxic to Pets',
      note: 'The concentrated essential oils (carvacrol and thymol) can irritate a pet’s mouth and stomach. A single nibbled leaf is generally harmless; a plant-eating session is not.',
      symptoms: 'Drooling, mouth pawing, vomiting, diarrhea, loss of appetite.',
      action: 'Usually no treatment is needed — offer water and watch for 12 hours. Call a vet if vomiting repeats or the pet becomes lethargic.',
    },
    household: 'A kitchen essential in Filipino and Latin American cooking for soups, adobo, stuffing, and bean dishes. The essential oil doubles as a food-safe cleaner base, and the living plant repels mosquitoes and pantry moths.',
    ecosystem: 'The succulent stems sprawl and root at every node, forming a living ground cover. Bees and small butterflies visit the pale lilac flowers.',
    treatment: '1. No action required. Pinch the tips every few weeks to keep the plant dense instead of leggy.\n2. Remove flower spikes as they appear — flowering shuts down leaf production.\n3. Root the cut stems in water or soil to keep a young, vigorous stock.\n4. Harvest outer leaves only, always leaving the growing tip intact.\n5. Watch for mealybug in the tight leaf axils; wipe with an alcohol swab if you see white fluff.',
    prevention: 'Refresh the plant from stem cuttings every second year — older plants lose oil strength. Avoid overhead watering to prevent leaf spot.',
    derivedFrom: 'Curated botanical database (Plectranthus), Southeast Asian ethnobotanical tradition.',
    specimenEmoji: '🍃',
  },
  {
    id: 'tomato-early-blight',
    commonName: 'Tomato Plant',
    scientificName: 'Solanum lycopersicum',
    family: 'Solanaceae',
    confidence: 98.6,
    healthStatus: 'Infected',
    issue: 'Early blight (Alternaria solani, a fungal pathogen). The lower leaves carry the classic concentric target-spot lesions ringed in yellow, and the infection is creeping upward along the stem. It is the most common foliar disease of tomatoes worldwide and spreads fastest in warm, wet, humid weather.',
    severity: '45% — Moderate foliar lesion coverage',
    organScanned: 'Lower mature leaf with lesions',
    growthStage: 'Reproductive (fruiting), lower canopy',
    overview: 'A tender perennial vine in the nightshade family, grown as an annual. Early blight is a soil-borne fungus whose spores splash up from the soil surface or from last season’s debris, so the lowest leaves are always hit first. Left alone it defoliates the plant from the bottom up, the fruit sunscalds, and yield collapses.',
    appearance: 'Dark brown spots 5–15 mm across with visible concentric rings — the target pattern that gives the disease its name — surrounded by a chlorotic yellow halo. Affected tissue dries and tears, leaving the plant looking scorched.',
    medicinal: {
      constituents: 'Ripe fruit: lycopene, beta-carotene, vitamin C, vitamin K, and potassium. Leaves and stems: the glycoalkaloids tomatine and solanine.',
      uses: 'Culinary and nutritional rather than medicinal. Lycopene is a potent antioxidant associated with prostate and cardiovascular protection, vitamin C supports collagen and immune function, and cooked tomatoes release more lycopene than raw ones.',
      preparation: 'Cook tomatoes with a little olive oil to maximise lycopene absorption. Discard the leaves and stems — never eat them or brew them as tea.',
      caution: 'Tomato foliage, stems, and unripe green fruit contain solanine and tomatine and must not be eaten by people or pets. Only fully ripe red fruit is food.',
      evidence: 'The lycopene/cardiovascular link is well studied observationally; there is no valid medicinal use for tomato foliage.',
    },
    needs: {
      sunlight: 'Full sun, 6–8 hours minimum. Morning sun dries the leaves and slows blight.',
      watering: 'Deep, regular watering at the base to keep moisture off the foliage. Water in the morning, never in the evening.',
      soil: 'Rich, well-aerated soil with steady calcium. pH 6.2–6.8.',
      temperature: '21–29°C (70–85°F) for fruit set. Nights persistently above 29°C or below 10°C stop fruit set entirely.',
      humidity: 'Wants free air movement and dry leaves. High humidity is the single biggest blight trigger.',
      fertilizer: 'Balanced feed early, then a low-nitrogen, high-potassium tomato feed once fruit sets. Excess nitrogen gives soft, disease-prone foliage.',
    },
    petSafety: {
      safe: false,
      status: 'Foliage Toxic to Dogs & Cats',
      note: 'The green leaves and stems contain solanine and tomatine, which cause drooling, vomiting, diarrhea, and weakness — and in large amounts, cardiac and neurological signs. Ripe red fruit is non-toxic, and pets commonly eat dropped tomatoes without harm.',
      symptoms: 'Drooling, vomiting, diarrhea, loss of coordination, weakness, dilated pupils, slow heart rate.',
      action: 'If a pet ate foliage or green fruit, contact your vet or a pet poison line immediately. Ripe fruit alone usually needs only observation.',
    },
    household: 'The productive kitchen crop of the world — salads, sauces, passata, chutney, and drying. Companion planted with basil and marigolds to confuse pest insects, and with borage to attract pollinators.',
    ecosystem: 'Pollinated by bumblebees using “buzz pollination” — vibrating the flower to shake pollen loose. The foliage feeds the hornworm caterpillar.',
    treatment: '1. Prune off and bin (never compost) every leaf showing a target lesion, working from the bottom upward, and strip any leaf within 30 cm of the soil.\n2. Apply copper fungicide or a bio-fungicide (Bacillus subtilis) every 7–10 days, covering the leaf undersides, and reapply after rain.\n3. Mulch the soil surface with straw or compost to block the spores that splash up from the soil.\n4. Switch to drip or base watering and irrigate in the morning so leaves are dry by nightfall.\n5. Thin the inner canopy so air moves through the plant — blight needs more than 6 hours of leaf wetness to infect.\n6. Keep potassium up and calcium steady while the plant recovers, to avoid blossom-end rot.\n7. Re-scan in 7 days: new lesions on the upper canopy mean you need a stronger fungicide rotation.',
    prevention: 'Rotate tomatoes to a different bed for 2–3 years, remove all nightshade debris at the end of the season, stake plants for airflow, and choose a blight-tolerant variety next season.',
    derivedFrom: 'Curated botanical database (Solanum) plus extension plant-pathology guidance on Alternaria solani.',
    specimenEmoji: '🍅',
  },
  {
    id: 'neem-tree',
    commonName: 'Neem Plant',
    scientificName: 'Azadirachta indica',
    family: 'Meliaceae',
    confidence: 99.5,
    healthStatus: 'Healthy',
    issue: 'None — high azadirachtin content detected in the foliage, and no leaf-feeding insects on the scanned specimen, which is expected: neem is effectively self-defending.',
    severity: '0% (Healthy)',
    organScanned: 'Compound leaf, mature leaflet',
    growthStage: 'Mature tree, established canopy',
    overview: 'An evergreen tree in the mahogany family, native to the Indian subcontinent and now planted throughout the tropics. It is called “the village pharmacy” because one tree supplies medicine, pesticide, soap, fuel, and timber — all of it from the bitter triterpenoids the tree evolved as insect defences.',
    appearance: 'Pinnate leaves 20–40 cm with 8–18 curved, sickle-shaped leaflets that are glossy dark green and toothed. Crushed leaflets smell strongly of garlic and peanut. Trees reach 15–20 m with a broad spreading crown.',
    medicinal: {
      constituents: 'Azadirachtin (the lead insecticide), nimbin, nimbidin, nimbolide, quercetin, and bitter triterpenes. The seed oil is the most concentrated source; the leaf carries the same compounds at lower strength.',
      uses: 'Antifungal, antibacterial, antiviral, and anti-inflammatory. Crushed leaves and leaf paste are used for skin infections, acne, ringworm, dandruff, scabies, wound disinfection, and gum inflammation. Neem twigs have been chewed as toothbrushes for centuries, and the bitter leaf tea is a traditional tonic for fever and intestinal worms.',
      preparation: 'Skin wash: boil a handful of leaves in 1 L water for 10 minutes, cool, strain, and bathe the area. Scalp oil: infuse dried leaves in warm coconut oil for 2 hours, strain, and massage in before washing. Decoctions keep 2–3 days refrigerated.',
      caution: 'Not for children, pregnancy, or anyone trying to conceive — neem oil has documented antifertility effects and can be toxic in children. Never take concentrated neem oil internally, and never apply it to broken skin or near the eyes.',
      evidence: 'Antimicrobial, antifungal, and insecticidal actions are well documented in vitro and in field trials. Many internal claims lack controlled human evidence.',
    },
    needs: {
      sunlight: 'Full blazing sun — a true sun tree with no shade tolerance once established.',
      watering: 'Very low. Water deeply every 2–3 weeks while young; once established, rainfall is normally enough.',
      soil: 'Tolerates poor, sandy, stony, and even slightly saline soils. pH 6.2–7.0.',
      temperature: '22–38°C (72–100°F). Damaged below 4°C; not a frost tree.',
      humidity: 'Thrives in hot dry and monsoon climates alike. Sensitive to waterlogged roots.',
      fertilizer: 'Rarely needs feeding. One slow-release balanced feed per year is plenty for a young tree.',
    },
    petSafety: {
      safe: true,
      status: 'Safe for Pets in diluted tops only',
      note: 'A diluted neem rinse is widely and safely used as a natural flea and tick repellent for dogs. The plant itself is not a hazard, but concentrated neem oil is not safe to ingest and is not recommended for cats, who groom themselves heavily.',
      symptoms: 'If a pet eats a large quantity of leaves or laps neem oil: vomiting, diarrhea, drooling, lethargy.',
      action: 'After a diluted topical rinse, no action is needed. If concentrated oil is ingested, call your vet. Never use concentrated neem on cats.',
    },
    household: 'The leading natural organic pesticide — the oil and the pressed cake fight aphids, whitefly, scale, mealybugs, and soil nematodes while being harmless to bees once dried. Also used for neem soap, mosquito coils, toothpaste, and organic fertiliser cake.',
    ecosystem: 'Azadirachtin disrupts insect moulting rather than killing on contact, so it spares most beneficial insects. Drought-tolerant and deep-rooted, neem also helps bind degraded soil in dryland agroforestry.',
    treatment: '1. No action required — the specimen is vigorous and pest-free.\n2. Harvest leaflets from the outer branches for garden sprays, and never strip a branch bare.\n3. Leaf spray: soak 500 g of fresh leaves in 5 L water overnight, strain, add a drop of soap, and use within 24 hours.\n4. Always spray in the evening to protect pollinators.\n5. Give a young tree 20 L of water every 2–3 weeks through its first two dry seasons to establish the taproot.',
    prevention: 'Space trees well so the canopy stays dry and airflow high. Watch seedlings for scale and for termites around the collar.',
    derivedFrom: 'Curated botanical database (Azadirachta), Indian ethnopharmacology and neem field trials.',
    specimenEmoji: '🌳',
  },
  {
    id: 'basil-sweet',
    commonName: 'Sweet Basil',
    scientificName: 'Ocimum basilicum',
    family: 'Lamiaceae',
    confidence: 99.1,
    healthStatus: 'Healthy',
    issue: 'None — tender aromatic leaves in excellent condition. Bright turgid foliage, no downy mildew, and oil glands clearly developed.',
    severity: '0% (Healthy)',
    organScanned: 'Young tender leaf, upper canopy',
    growthStage: 'Vegetative, pre-flowering',
    overview: 'A fast-growing tender annual herb in the mint family, grown since antiquity as both food and medicine. Its value sits in the leaf essential oil — the aroma is the plant’s own defence system, and it is also what makes basil soothing to people.',
    appearance: 'Soft, glossy, oval leaves 3–8 cm, bright green, slightly cupped, with smooth or lightly toothed margins. The stems are square and the plant forms a bushy clump when pinched.',
    medicinal: {
      constituents: 'Eugenol (the clove-like note), linalool, estragole, 1,8-cineole, rosmarinic acid, and flavonoids.',
      uses: 'Digestive and calming. Basil tea is used for bloating, gas, cramps, and mild nausea. Eugenol and linalool give mild anti-inflammatory and antimicrobial action, so the herb is also used as a gargle for sore throat and a poultice for insect bites and minor skin infections. In aromatherapy it is used for mental fatigue and mild anxiety.',
      preparation: 'Tea: steep 5–8 fresh leaves in hot (not boiling) water for 5 minutes, two or three cups a day after meals. Poultice: crush fresh leaves with a pinch of salt and apply to bites. Gargle: strong tea at room temperature.',
      caution: 'Culinary amounts are entirely safe. In concentrated medicinal doses, avoid during pregnancy and before surgery (estragole is a mild blood thinner). Stay within normal culinary and tea quantities.',
      evidence: 'Antimicrobial and antioxidant activity is well established in vitro; the digestive and anti-anxiety uses are traditional with limited clinical support.',
    },
    needs: {
      sunlight: 'Bright warm light — 6–8 hours of sun daily. Shade makes it leggy and flavourless.',
      watering: 'Water when the top 1 cm of soil feels dry, usually every 2–3 days in warm weather. It dislikes both drought and a soggy pot.',
      soil: 'Nutrient-rich, well-draining potting soil. pH 6.0–7.0.',
      temperature: '18–30°C (65–85°F). Chill below 12°C blackens the leaves, so it is not a winter herb outdoors.',
      humidity: 'Moderate. High humidity plus cool nights is the recipe for downy mildew.',
      fertilizer: 'Light balanced feed every 3–4 weeks. Heavy feeding dilutes the essential oil and the flavour.',
    },
    petSafety: {
      safe: true,
      status: 'Non-Toxic to Dogs & Cats (ASPCA listed)',
      note: 'Basil is fully non-toxic to dogs, cats, and horses. A pet nibbling the leaves is harmless; only a very large amount would cause mild stomach upset.',
      symptoms: 'None expected. Large ingestion could cause mild nausea or diarrhea.',
      action: 'No action needed. Wash and re-pot the plant if a pet has been grazing on it.',
    },
    household: 'The defining herb of Mediterranean and Southeast Asian cooking — pesto, pizza, pasta, caprese, and pho. It is also a companion plant that repels mosquitoes, flies, and asparagus beetles, and makes a natural room freshener.',
    ecosystem: 'The small white flowers are a magnet for bees and hoverflies in late summer, making it one of the best pollinator plants for a kitchen garden.',
    treatment: '1. No action required. Pinch off every flower bud the moment it appears — flowering ends leaf production and turns the flavour bitter.\n2. Harvest the top two leaf pairs above a node; each cut makes the plant fork and double its foliage.\n3. Water at the base only. Wet basil leaves are how downy mildew starts.\n4. Root a cutting in water every 6–8 weeks, since annual basil declines after flowering.\n5. Check leaf undersides for aphids and leaf tops for the yellow banding of downy mildew, and remove affected leaves at once.',
    prevention: 'Water in the morning, keep plants 25 cm apart for airflow, never water overhead, and start replacements from seed or cuttings before the old plants flower out.',
    derivedFrom: 'Curated botanical database (Ocimum), cross-checked against ASPCA pet-toxicity data.',
    specimenEmoji: '🌱',
  },
];

// ---------------------------------------------------------------------------
// Helpers for rendering the report.
// ---------------------------------------------------------------------------

const DEFAULT_PET_SAFETY = {
  safe: false,
  status: 'Toxicity unknown',
  note: 'No pet-safety data was returned for this specimen. Treat it as potentially toxic and keep it away from dogs and cats until you can confirm otherwise.',
  symptoms: 'Watch for drooling, vomiting, diarrhea, or lethargy after any mouth contact.',
  action: 'If a pet has chewed it, contact your vet or a pet poison line with the photo and the species name.',
};

const SECTION_TITLES = {
  all: 'Full Botanical & Diagnostic Report',
  needs: 'Care, Cultivation & Environment',
  medicinal: 'Healing, Medicinal & Household Uses',
  pets: 'Pet & Animal Toxicity Safety',
  issues: 'Pathology & Issue Diagnosis',
  treatment: 'Treatment & Recovery Protocol',
};

// Normalizes whatever the AI (or the local database) returned into one shape,
// so the report never hits an undefined field. `confidence` is clamped to 0-100
// and rounded, because the model occasionally returns a stray decimal.
const shapeAnalysisResult = (raw) => {
  const needs = raw?.needs || {};
  const medicinal = raw?.medicinal || {};
  const petSafety = raw?.petSafety || raw?.goodFor?.petSafety || {};
  const confidence = Number(raw?.confidence);

  return {
    ...raw,
    id: raw?.id || 'live-scan',
    commonName: raw?.commonName || 'Unidentified specimen',
    scientificName: raw?.scientificName || 'Species not determined',
    family: raw?.family || 'Family not determined',
    confidence: Number.isFinite(confidence) ? Math.min(100, Math.max(0, Math.round(confidence * 10) / 10)) : 0,
    healthStatus: raw?.healthStatus || 'Not assessed',
    issue: raw?.issue || 'No diagnosis text was returned for this specimen.',
    severity: raw?.severity || 'Not assessed',
    organScanned: raw?.organScanned || 'Scanned specimen surface',
    growthStage: raw?.growthStage || '',
    overview: raw?.overview || '',
    appearance: raw?.appearance || '',
    needs: {
      sunlight: needs.sunlight || 'No light requirement was returned.',
      watering: needs.watering || 'No watering guidance was returned.',
      soil: needs.soil || 'No soil guidance was returned.',
      temperature: needs.temperature || 'No temperature range was returned.',
      humidity: needs.humidity || 'No humidity guidance was returned.',
      fertilizer: needs.fertilizer || 'No feeding guidance was returned.',
    },
    medicinal: {
      constituents: medicinal.constituents || 'No active-compound data was returned.',
      uses: medicinal.uses || raw?.goodFor?.healing || 'No medicinal-use data was returned.',
      preparation: medicinal.preparation || 'No preparation guidance was returned.',
      caution: medicinal.caution || 'Use caution: no safety data was returned for this preparation.',
      evidence: medicinal.evidence || 'Evidence level not stated.',
    },
    petSafety: {
      safe: Boolean(petSafety.safe),
      status: petSafety.status || (petSafety.safe ? 'Safe for Dogs & Cats' : DEFAULT_PET_SAFETY.status),
      note: petSafety.note || DEFAULT_PET_SAFETY.note,
      symptoms: petSafety.symptoms || DEFAULT_PET_SAFETY.symptoms,
      action: petSafety.action || DEFAULT_PET_SAFETY.action,
    },
    household: raw?.household || raw?.goodFor?.household || 'No household-use data was returned.',
    ecosystem: raw?.ecosystem || '',
    treatment: raw?.treatment || 'No treatment protocol was returned for this specimen.',
    prevention: raw?.prevention || '',
    derivedFrom: raw?.derivedFrom || 'Gemini vision analysis of the uploaded specimen.',
    specimenEmoji: raw?.specimenEmoji || raw?.sampleEmoji || '🔬',
  };
};

// The animated "what the model is doing" checklist shown over the specimen.
// The timings are illustrative pacing for the UI, not real pipeline stages.
// Stage timings are tuned so the checklist still has something to show on a
// fast reply (a real Gemini vision call is typically 3-8s), but a slow one does
// not sit frozen on the last line. The label simply holds at "Compiling..."
// until the response lands.
const ANALYSIS_STAGES = [
  { at: 0, label: 'Segmenting the specimen from the frame' },
  { at: 700, label: 'Reading leaf venation & margin geometry' },
  { at: 1600, label: 'Matching against the botanical knowledge base' },
  { at: 2800, label: 'Compiling diagnosis, care & safety report' },
];

// Reports true wall-clock time. An earlier version printed "on device" or
// "chronological", which read like invented telemetry.
const processingLabel = (secs) => `${secs.toFixed(1)}s`;

// ---------------------------------------------------------------------------
// Report stamp category.
//
// The stamp needs ONE short word for "what kind of plant is this". The model
// returns a free-text healthStatus, so this maps that onto a small, stable set
// of categories. Order matters: the more specific/serious verdicts are tested
// first so "Healthy / Minor Insect Activity" reads as a pest issue, not as
// merely healthy.
// ---------------------------------------------------------------------------
const categorizeScan = (result) => {
  if (!result) return { key: 'unknown', label: 'Unclassified', tone: 'slate' };
  const health = `${result.healthStatus || ''} ${result.severity || ''}`.toLowerCase();

  if (health.includes('infected') || health.includes('disease') || health.includes('blight') || health.includes('fungal')) {
    return { key: 'diseased', label: 'Diseased', tone: 'rose' };
  }
  if (health.includes('pest') || health.includes('insect') || health.includes('aphid') || health.includes('infest')) {
    return { key: 'pest', label: 'Pest Activity', tone: 'amber' };
  }
  if (health.includes('deficien') || health.includes('nutrient') || health.includes('stress') || health.includes('wil')) {
    return { key: 'stressed', label: 'Stressed', tone: 'amber' };
  }
  if (health.includes('healthy') || health.includes('optimal') || health.includes('vitality')) {
    return { key: 'healthy', label: 'Healthy', tone: 'emerald' };
  }
  return { key: 'assessed', label: 'Assessed', tone: 'cyan' };
};

// Tailwind classes per category tone. Kept as a lookup (not a template string)
// because Tailwind only emits classes it can see literally in the source.
const STAMP_TONES = {
  emerald: 'border-emerald-400/60 text-emerald-300 bg-emerald-500/10',
  rose: 'border-rose-400/60 text-rose-300 bg-rose-500/10',
  amber: 'border-amber-400/60 text-amber-300 bg-amber-500/10',
  cyan: 'border-cyan-400/60 text-cyan-300 bg-cyan-500/10',
  slate: 'border-slate-400/50 text-slate-300 bg-slate-500/10',
};

const RECENT_SCANS_LIMIT = 8;

// "Stamp" formatting: a compact, unambiguous date + 24h clock, e.g.
// "14 Mar 2026 · 09:41". Fixed-width so the stamp never reflows per scan.
const formatStamp = (date) => {
  if (!date) return '—';
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Human "time ago" for the recent-scans list, which is scannable at a glance.
const timeAgo = (date) => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  const secs = Math.floor((Date.now() - d.getTime()) / 1000);
  if (secs < 60) return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  if (secs < 604800) return `${Math.floor(secs / 86400)}d ago`;
  return formatStamp(d).split(' · ')[0];
};

// Recent-scan persistence key. Scoped per account so one user's history never
// leaks into another's on a shared browser.
const recentScansKey = (email) => `ldx_recent_scans_${(email || 'guest').toLowerCase()}`;

export const PlantScanner = ({ currentUser, onRequireLogin, onSaved }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // The specimen that is being scanned in this session. It starts empty — the
  // report card is driven purely by the image the user shoots or uploads, so
  // there is nothing to look at until a plant has actually been analyzed.
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzedImage, setAnalyzedImage] = useState(null);
  const [analyzedAt, setAnalyzedAt] = useState(null);

  // Share & bookmark button feedback state ('idle' | 'copied' | 'saved').
  const [shareState, setShareState] = useState('idle');
  const [bookmarkState, setBookmarkState] = useState('idle');
  const shareTimerRef = useRef(null);
  const bookmarkTimerRef = useRef(null);

  // Builds the plain-text summary shared or shown for a report.
  const buildResultText = (result) =>
    `LeafDex Result\nPlant: ${result.commonName} (${result.scientificName})\nStatus: ${result.healthStatus}\nConfidence: ${result.confidence}% AI match`;

  // Share via the Web Share API; fall back to copying to the clipboard.
  const handleShareResult = async (result) => {
    const text = buildResultText(result);
    if (navigator.share) {
      try {
        await navigator.share({ title: 'LeafDex Result', text });
      } catch {
        // User cancelled the share sheet — do nothing.
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setShareState('copied');
      if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
      shareTimerRef.current = window.setTimeout(() => setShareState('idle'), 2000);
    }
  };

  // Saves the plant to localStorage under the "savedScans" key (the same key
  // the Saved Scans page reads) with name, disease status, treatment and date.
  const handleSaveBookmark = (result) => {
    if (!result) return;
    let savedScans = [];
    try {
      savedScans = JSON.parse(localStorage.getItem('savedScans') || '[]');
      if (!Array.isArray(savedScans)) savedScans = [];
    } catch {
      savedScans = [];
    }
    // Avoid duplicates: if this exact plant was already saved, skip.
    const alreadySaved = savedScans.some(
      (s) => s.plantName === result.commonName && s.diseaseStatus === (result.healthStatus || 'Unknown')
    );
    if (!alreadySaved) {
      savedScans.push({
        id: `scan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        plantName: result.commonName,
        scientificName: result.scientificName || '',
        diseaseStatus: result.healthStatus || 'Unknown',
        treatment: result.treatment || result.recommendation || 'No treatment recorded',
        savedAt: new Date().toISOString(),
        emoji: result.specimenEmoji || '🌱',
      });
      try {
        localStorage.setItem('savedScans', JSON.stringify(savedScans));
      } catch {
        // localStorage full — nothing else to do
      }
    }
    // Keep the "Saved!" state sticky — it does not revert to "Save".
    setBookmarkState('saved');
    // Jump straight to the Saved Scans view after saving.
    if (onSaved) onSaved();
  };

  // Recent scans: a compact, per-account log of what was identified and when.
  // Each entry is { id, stamp, categoryKey, categoryLabel, tone, commonName,
  // scientificName, healthStatus, confidence, thumb }. `stamp` is an ISO string
  // so it survives the round-trip through localStorage as a real Date again.
  const [recentScans, setRecentScans] = useState([]);
  const [showRecentScans, setShowRecentScans] = useState(true);

  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all', 'needs', 'medicinal', 'pets', 'issues', 'treatment'
  const [customImageName, setCustomImageName] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [analysisError, setAnalysisError] = useState(null);

  // Drives the analyzing animation: elapsed time, the fake stage pointer, and a
  // shake flag for the camera warning.
  const [elapsed, setElapsed] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [cameraNotice, setCameraNotice] = useState(null);
  const [noticeKey, setNoticeKey] = useState(0);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const stageTimersRef = useRef([]);
  const noticeTimerRef = useRef(null);
  const reportRef = useRef(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // A live getUserMedia viewfinder needs a secure context. The browser grants
  // that to https:// and to localhost, but NOT to a plain-http LAN address such
  // as http://192.168.1.50:3000 — so on a phone over Wi-Fi the API is missing
  // entirely and no settings toggle can help.
  const isSecureForCamera = typeof window !== 'undefined' && window.isSecureContext;

  // Load this account's saved scan log on mount / whenever the account changes.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(recentScansKey(currentUser?.email));
      const parsed = raw ? JSON.parse(raw) : [];
      setRecentScans(Array.isArray(parsed) ? parsed : []);
    } catch {
      setRecentScans([]); // Corrupt or unavailable storage must never break a scan.
    }
  }, [currentUser?.email]);

  // Persist the scan log. Stored under the user's email key so histories stay
  // separate. Thumbnails are intentionally tiny (see buildRecentEntry) because
  // localStorage caps out around 5 MB — a full report photo would blow that.
  const persistRecentScans = (entries) => {
    setRecentScans(entries);
    try {
      localStorage.setItem(recentScansKey(currentUser?.email), JSON.stringify(entries));
    } catch {
      // Quota exceeded or storage disabled — the in-memory list still works.
    }
  };

  // Builds one recent-scan entry from a finished report. The thumbnail is drawn
  // down to 96px on the long edge via a canvas so it stays a few KB, not MB.
  const recordScan = (result, sourceImage, when) => {
    const category = categorizeScan(result);
    const entryId = `ldx-${when.getTime()}-${Math.random().toString(36).slice(2, 7)}`;
    const base = {
      id: entryId,
      stamp: when.toISOString(),
      categoryKey: category.key,
      categoryLabel: category.label,
      tone: category.tone,
      commonName: result.commonName,
      scientificName: result.scientificName,
      healthStatus: result.healthStatus,
      confidence: result.confidence,
      specimenEmoji: result.specimenEmoji,
      thumb: null,
    };

    // Push immediately (with whatever thumbnail we can get), then patch the
    // thumbnail in once the downscale finishes so the list never waits on it.
    // The functional update reads the latest list, not a possibly-stale closure.
    setRecentScans((prev) => {
      const next = [base, ...prev].slice(0, RECENT_SCANS_LIMIT);
      try {
        localStorage.setItem(recentScansKey(currentUser?.email), JSON.stringify(next));
      } catch {
        // Quota exceeded or storage disabled — the in-memory list still works.
      }
      return next;
    });

    if (!sourceImage) return;
    const img = new Image();
    img.onload = () => {
      try {
        const maxEdge = 96;
        const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const thumb = canvas.toDataURL('image/jpeg', 0.6);
        setRecentScans((prev) => {
          const patched = prev.map((e) => (e.id === entryId ? { ...e, thumb } : e));
          try {
            localStorage.setItem(recentScansKey(currentUser?.email), JSON.stringify(patched));
          } catch {
            // Ignore quota errors — the entry without a thumb is still useful.
          }
          return patched;
        });
      } catch {
        // Tainted canvas / decode failure — keep the entry thumbnail-less.
      }
    };
    img.src = sourceImage;
  };

  // Ask the OS directly whether camera permission is granted/denied, so the
  // error we show can name the real cause instead of guessing.
  const queryCameraPermission = async () => {
    try {
      if (!navigator.permissions?.query) return null;
      const status = await navigator.permissions.query({ name: 'camera' });
      return status.state; // 'granted' | 'denied' | 'prompt'
    } catch {
      return null; // Safari does not support querying the camera permission.
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraActive(false);
    setCameraReady(false);
  };

  // Transient amber notice under the viewfinder, used for missing-permission and
  // no-specimen warnings. The key bump retriggers the shake animation.
  const flashCameraNotice = (message) => {
    setCameraNotice(message);
    setNoticeKey((k) => k + 1);
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(() => setCameraNotice(null), 6000);
  };

  const describeCameraFailure = async (err) => {
    const name = err?.name;
    const permState = await queryCameraPermission();

    if (!isSecureForCamera) {
      return 'The live viewfinder needs a secure address. This page is open over plain http, so the browser hides the camera from it. Reopen the app at https://' + window.location.hostname + ':' + window.location.port + ' (accept the certificate warning) or use "Take Photo" to open your phone\u2019s camera app, which works on http.';
    }
    if (name === 'NotAllowedError' || permState === 'denied') {
      return 'The browser is blocking camera access for this site. Open your browser site settings for this address, set Camera to Allow, then reload. You can also just use "Take Photo".';
    }
    if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
      return 'No camera was found on this device. Use "Upload Photo" to pick an image instead.';
    }
    if (name === 'NotReadableError' || name === 'TrackStartError') {
      return 'Your camera is busy — another app or browser tab is using it. Close it and try again, or use "Take Photo".';
    }
    if (name === 'OverconstrainedError') {
      return 'Your camera does not support the requested video mode. Trying again may work, or use "Take Photo".';
    }
    return 'Unable to access the camera (' + (name || 'unknown error') + '). Use "Take Photo" to shoot one, or "Upload Photo" to pick an image.';
  };

  // Attach the stream after React has committed the <video> element.
  useEffect(() => {
    const video = videoRef.current;
    const stream = mediaStreamRef.current;
    if (!isCameraActive || !video || !stream) return;
    video.srcObject = stream;
    const onPlaying = () => setCameraReady(true);
    video.addEventListener('playing', onPlaying);
    const playPromise = video.play?.();
    if (playPromise?.catch) playPromise.catch(() => {});
    return () => video.removeEventListener('playing', onPlaying);
  }, [isCameraActive]);

  // Stop the camera stream and clear pending timers on unmount.
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      stageTimersRef.current.forEach((id) => window.clearTimeout(id));
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    };
  }, []);

  // Drive the analyzing animation: a tenth-second ticker for the elapsed clock
  // plus one timer per pipeline stage. Both are reset whenever a new scan starts
  // or the scan ends, and every timer is cleared on cleanup so nothing leaks.
  useEffect(() => {
    stageTimersRef.current.forEach((id) => window.clearTimeout(id));
    stageTimersRef.current = [];
    setElapsed(0);
    setStageIndex(0);

    if (!isAnalyzing) return undefined;

    const tick = window.setInterval(() => setElapsed((s) => s + 0.1), 100);
    ANALYSIS_STAGES.forEach((stage, i) => {
      if (i === 0) return;
      stageTimersRef.current.push(window.setTimeout(() => setStageIndex(i), stage.at));
    });

    return () => {
      window.clearInterval(tick);
      stageTimersRef.current.forEach((id) => window.clearTimeout(id));
      stageTimersRef.current = [];
    };
  }, [isAnalyzing]);

  // A live scan always re-opens on the whole report rather than whichever tab
  // the previous specimen was left on.
  const scanStartedAtRef = useRef(null);
  const sequenceKey = useMemo(() => {
    if (isAnalyzing) {
      if (scanStartedAtRef.current === null) scanStartedAtRef.current = Date.now();
      return `run-${scanStartedAtRef.current}`;
    }
    scanStartedAtRef.current = null;
    return analyzedAt ? `done-${analyzedAt.getTime()}` : 'idle';
  }, [isAnalyzing, analyzedAt]);

  const progressPercent = isAnalyzing
    ? Math.min(97, Math.round((elapsed / 4.6) * 100))
    : 0;
  const activeStage = ANALYSIS_STAGES[Math.min(stageIndex, ANALYSIS_STAGES.length - 1)];

  // The flip button only makes sense on a device with more than one camera.
  useEffect(() => {
    const mediaDevices = typeof navigator !== 'undefined' ? navigator.mediaDevices : null;
    if (!mediaDevices?.enumerateDevices) return;

    let cancelled = false;
    const countCameras = async () => {
      try {
        const devices = await mediaDevices.enumerateDevices();
        if (cancelled) return;
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      } catch {
        /* Enumeration is best-effort. */
      }
    };
    countCameras();
    const handleChange = () => countCameras();
    mediaDevices.addEventListener?.('devicechange', handleChange);
    return () => {
      cancelled = true;
      mediaDevices.removeEventListener?.('devicechange', handleChange);
    };
  }, []);

  const startCamera = async (mode) => {
    if (!currentUser) {
      if (onRequireLogin) onRequireLogin();
      return;
    }

    const desiredMode = mode || facingMode;
    setFacingMode(desiredMode);
    setCameraError(null);
    setIsStartingCamera(true);
    setIsCameraActive(true);
    setCameraReady(false);

    // Release any stream already open before requesting a new one.
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    // Plain-http pages never expose mediaDevices at all, so stop here with a
    // message that names the real fix instead of a generic failure.
    if (!isSecureForCamera) {
      setCameraError(await describeCameraFailure(null));
      setIsCameraActive(false);
      setIsStartingCamera(false);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('This browser does not expose camera access to web pages. Use "Take Photo" to open your phone\u2019s camera app instead.');
      setIsCameraActive(false);
      setIsStartingCamera(false);
      return;
    }

    // Degrade gracefully: some phone cameras reject the ideal HD constraint or
    // a specific facingMode, so each attempt is looser than the last.
    const attempts = [
      { video: { facingMode: { ideal: desiredMode }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
      { video: { facingMode: desiredMode }, audio: false },
      { video: true, audio: false },
    ];

    let lastError = null;
    for (const constraints of attempts) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        mediaStreamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;

        // Labels only become readable once a stream has been granted.
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const cams = devices.filter((d) => d.kind === 'videoinput');
          setHasMultipleCameras(cams.length > 1);

          // If we held the stream from the other side, flip to the requested one.
          const activeId = stream.getVideoTracks()[0]?.getSettings?.().deviceId;
          const wanted = cams.find((c) =>
            desiredMode === 'user'
              ? /front|user|facetime/i.test(c.label)
              : /back|rear|environment|world/i.test(c.label)
          );
          if (wanted && wanted.deviceId && activeId && wanted.deviceId !== activeId && cams.length > 1) {
            try {
              const better = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: wanted.deviceId },
                audio: false,
              }
              });
              stream.getTracks().forEach((t) => t.stop());
              mediaStreamRef.current = better;
              if (videoRef.current) videoRef.current.srcObject = better;
            } catch {
              /* Keep the stream we already have. */
            }
          }
        } catch {
          /* Enumeration is optional. */
        }

        setIsStartingCamera(false);
        lastError = null;
        break;
      } catch (err) {
        lastError = err;
      }
    }

    if (lastError) {
      console.error('Camera access error:', lastError);
      setCameraError(await describeCameraFailure(lastError));
      setIsCameraActive(false);
      setIsStartingCamera(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) {
      setCameraError('The camera is still warming up. Hold steady for a moment and tap Take Snapshot again.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    stopCamera();
    setCameraError(null);
    processImage(dataUrl, 'Live Camera Capture');
  };

  // Shared by the upload picker and the native camera picker.
  const readFileAsImage = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      processImage(event.target?.result, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e) => {
    readFileAsImage(e.target.files?.[0]);
    e.target.value = '';
  };

  // Opens the phone's own camera app via the file picker. This needs no secure
  // context and no in-page video pipeline, so it works over plain http.
  const openNativeCamera = () => {
    if (!currentUser) {
      if (onRequireLogin) onRequireLogin();
      return;
    }
    setCameraError(null);
    cameraInputRef.current?.click();
  };

  // Prefer the native camera app whenever the in-page viewfinder cannot work,
  // so the "Shoot Photo" button still does what its label promises.
  const handleShootPhoto = () => {
    if (!currentUser) {
      if (onRequireLogin) onRequireLogin();
      return;
    }
    if (!isSecureForCamera) {
      openNativeCamera();
      return;
    }
    startCamera();
  };

  // Offline / fallback matcher. Only reached when the server has no Gemini key
  // configured or the request fails, and it matches on the uploaded file name.
  const matchLocalSample = (name) => {
    const lowerName = (name || '').toLowerCase();
    if (lowerName.includes('bayabas') || lowerName.includes('guava')) return BOTANICAL_DATABASE[1];
    if (lowerName.includes('snake') || lowerName.includes('sansevieria') || lowerName.includes('dracaena')) return BOTANICAL_DATABASE[2];
    if (lowerName.includes('oregano') || lowerName.includes('mint') || lowerName.includes('plectranthus')) return BOTANICAL_DATABASE[3];
    if (lowerName.includes('tomato') || lowerName.includes('blight') || lowerName.includes('disease')) return BOTANICAL_DATABASE[4];
    if (lowerName.includes('neem')) return BOTANICAL_DATABASE[5];
    if (lowerName.includes('aloe')) return BOTANICAL_DATABASE[0];
    return BOTANICAL_DATABASE[6];
  };

  // Publish a finished diagnosis: normalize the shape, remember which photo it
  // came from, and pull the report into view so the 0.3s fade-in is seen.
  const publishResult = (raw, sourceImage) => {
    const shaped = shapeAnalysisResult(raw);
    const when = new Date();
    setAnalysisResult(shaped);
    setAnalyzedImage(sourceImage || null);
    setAnalyzedAt(when);
    setActiveSubTab('all');
    recordScan(shaped, sourceImage, when);
    window.setTimeout(() => {
      reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  // Re-open a past scan from the recent list. Re-shapes the stored entry into a
  // full report object so the report card, stamp and tabs all populate exactly
  // as they did on the original scan.
  const openRecentScan = (entry) => {
    const shaped = shapeAnalysisResult({
      id: entry.id,
      commonName: entry.commonName,
      scientificName: entry.scientificName,
      healthStatus: entry.healthStatus,
      confidence: entry.confidence,
      specimenEmoji: entry.specimenEmoji,
    });
    setAnalysisResult(shaped);
    setAnalyzedImage(entry.thumb || null);
    setAnalyzedAt(new Date(entry.stamp));
    setActiveSubTab('all');
    window.setTimeout(() => {
      reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const clearRecentScans = () => {
    persistRecentScans([]);
  };

  // Send a real photo to the server, which runs Gemini vision and returns a
  // structured diagnosis. Falls back to the local database if the server has
  // no AI key configured.
  const analyzeViaServer = async (imageDataUrl, name) => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    const mimeMatch = /^data:(image\/[^;]+);base64,/.exec(imageDataUrl || '');
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const token = localStorage.getItem('ldx_token');

    // Hold the animation just long enough that the reveal can be seen. This is
    // pure added latency on top of the model, so keep it small: 1.6s reads as
    // deliberate, 3.2s read as slow.
    const minSweepMs = 1600;
    const startedAt = Date.now();
    const waitOutSweep = async () => {
      const remaining = minSweepMs - (Date.now() - startedAt);
      if (remaining > 0) await new Promise((resolve) => window.setTimeout(resolve, remaining));
    };

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageBase64: imageDataUrl, mimeType, fileName: name }),
      });
      const data = await res.json();
      await waitOutSweep();

      if (data.success && data.aiConfigured && data.result) {
        publishResult(data.result, imageDataUrl);
      } else if (data.success && !data.aiConfigured) {
        // Server has no key — use the local database so the UI still works.
        publishResult(matchLocalSample(name), imageDataUrl);
        setAnalysisError('Server AI is not configured (no GEMINI_API_KEY). This report came from the offline botanical database, matched on the file name.');
      } else {
        publishResult(matchLocalSample(name), imageDataUrl);
        setAnalysisError(data.message || 'The AI analysis failed. This report came from the offline botanical database.');
      }
    } catch (err) {
      console.error('Scan request failed:', err);
      await waitOutSweep();
      publishResult(matchLocalSample(name), imageDataUrl);
      setAnalysisError('Could not reach the analysis server. This report came from the offline botanical database.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const processImage = (imageDataUrl, name) => {
    setSelectedImage(imageDataUrl);
    setCustomImageName(name);
    analyzeViaServer(imageDataUrl, name);
  };

  // Re-analyze the specimen that is already on the bench.
  const triggerAnalysis = () => {
    if (!selectedImage) {
      flashCameraNotice('There is no specimen on the bench yet — shoot or upload a plant photo first.');
      return;
    }
    analyzeViaServer(selectedImage, customImageName);
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">

      {/* Top Banner Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
          <Scan className="w-3.5 h-3.5 text-emerald-400" />
          <span>Deep Learning Botanical Classifier &amp; Pharmacognosy Engine</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          LeafDex Plant Identifier &amp; Care Diagnosis
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100/70">
          Shoot or upload a plant photo to identify its species, diagnose health issues, discover care needs, healing/medicinal uses, and pet safety toxicity warnings.
        </p>
      </div>

      {/* Authentication Notice if not logged in */}
      {!currentUser && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-2.5 text-emerald-200">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-white">Sign In Required to Scan:</strong> Please log in or create an account to access the live camera viewfinder, upload custom plant photos, and generate AI health reports.
            </span>
          </div>
          <button
            type="button"
            onClick={onRequireLogin}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer shadow-sm hover:brightness-110 flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In to Scan</span>
          </button>
        </div>
      )}

      {/* Main Upload & Camera Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Camera / Upload Box.
            Deliberately not stretched to the row height and not justify-between:
            either one turns this column into a tall ribbon of empty space as soon
            as the report beside it grows. */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900/80 border-white/15 p-5 sm:p-6 backdrop-blur-2xl shadow-2xl relative overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              Capture or Upload Specimen
            </span>
            <span className="text-[11px] font-mono text-emerald-300">AI Vision v3.4</span>
          </div>

          {/* Camera View or Preview Canvas */}
          <div className="flex mt-4 rounded-2xl bg-black/60 border-white/10 flex-col items-center justify-center relative overflow-hidden p-5">

            <AnimatePresence mode="wait">

            {/* Live Camera Stream */}
            {isCameraActive ? (
              <motion.div
                key="viewfinder"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex relative w-full flex-col items-center justify-center"
              >
                <div className="relative w-full overflow-hidden rounded-xl border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.25)]">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-56 object-cover"
                  />

                  {/* Faint alignment grid so the leaf can be squared up. */}
                  <div className="pointer-events-none absolute inset-0 ldx-scan-grid opacity-40" />

                  {/* Corner brackets. */}
                  <div className="pointer-events-none absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-emerald-400/80 rounded-tl-md" />
                  <div className="pointer-events-none absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-emerald-400/80 rounded-tr-md" />
                  <div className="pointer-events-none absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-emerald-400/80 rounded-bl-md" />
                  <div className="pointer-events-none absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-emerald-400/80 rounded-br-md" />

                  {/* Laser line sweeping the frame, once the stream is live. */}
                  {cameraReady && (
                    <div
                      className="ldx-beam pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_18px_4px_rba(52,211,153,0.75)]"
                      style={{ '--ldx-beam-travel': '222px' }}
                    />
                  )}

                  <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider text-emerald-300 backdrop-blur-md">
                    <span className={`w-1.5 h-1.5 rounded-full ${cameraReady ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    {cameraReady ? 'LIVE' : 'STARTING'}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={capturePhoto}
                    disabled={!cameraReady}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs shadow-lg hover:brightness-110 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Take Snapshot</span>
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : isAnalyzing && selectedImage ? (
              /* Analyzing the specimen that was just shot or uploaded */
              <motion.div
                key={`analyzing-${sequenceKey}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex w-full flex-col items-center justify-center"
              >
                <div className="relative w-full overflow-hidden rounded-xl border-emerald-400/40 bg-black">
                  <img
                    src={selectedImage}
                    alt="Specimen being analyzed"
                    className="w-full h-52 object-contain opacity-80"
                  />

                  {/* Darkened glass + grid while the model reads the frame. */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-950/70 via-black/50 to-emerald-950/70" />
                  <div className="pointer-events-none absolute inset-0 ldx-scan-grid opacity-50" />

                  {/* Breathing glow that sells the "something is working" feel. */}
                  <div className="ldx-glow pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(16,185,129,0.30),transparent_65%)]" />

                  {/* The sweep bar. */}
                  <div className="ldx-sweep pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-transparent via-emerald-400/30 to-transparent">
                    <div className="absolute bottom-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_24px_6px_rgba(52,211,153,0.85)]" />
                  </div>

                  {/* Rotating scan reticle. */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                      className="w-20 h-20 rounded-full border-dashed border-emerald-300/50"
                    />
                    <Microscope className="absolute w-6 h-6 text-emerald-300/80" />
                  </div>

                  {/* Corner brackets. */}
                  <div className="pointer-events-none absolute top-3 left-3 w-7 h-7 border-t-2 border-l-2 border-emerald-300 rounded-tl-md" />
                  <div className="pointer-events-none absolute top-3 right-3 w-7 h-7 border-t-2 border-r-2 border-emerald-300 rounded-tr-md" />
                  <div className="pointer-events-none absolute bottom-3 left-3 w-7 h-7 border-b-2 border-l-2 border-emerald-300 rounded-bl-md" />
                  <div className="pointer-events-none absolute bottom-3 right-3 w-7 h-7 border-b-2 border-r-2 border-emerald-300 rounded-br-md" />

                  <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider text-emerald-300 backdrop-blur-md">
                    <Activity className="w-3 h-3 animate-pulse" />
                    ANALYZING SPECIMEN
                  </div>
                </div>

                {/* Elapsed clock + pipeline checklist. */}
                <div className="mt-4 w-full space-y-2">
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-emerald-200/80">
                    <span className="truncate">{activeStage.label}</span>
                    <span className="shrink-0 text-emerald-300">{processingLabel(elapsed)}</span>
                  </div>

                  <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 shadow-[0_0_12px_rgba(52,211,153,0.7)] transition-[width] duration-200 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="space-y-1 pt-0.5">
                    {ANALYSIS_STAGES.map((stage, i) => {
                      const done = i < stageIndex;
                      const active = i === stageIndex;
                      return (
                        <div
                          key={stage.label}
                          className={`flex items-center gap-2 text-[11px] transition-colors duration-300 ${
                            done ? 'text-emerald-300' : active ? 'text-white' : 'text-slate-500'
                          }`}
                        >
                          {done ? (
                            <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-400" />
                          ) : active ? (
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                              className="shrink-0 flex"
                            >
                              <RefreshCw className="w-3 h-3 text-cyan-300" />
                            </motion.span>
                          ) : (
                            <span className="w-3 h-3 shrink-0 rounded-full border-slate-600" />
                          )}
                          <span className="truncate">{stage.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ) : selectedImage ? (
              /* Specimen on the bench, report already filed */
              <motion.div
                key="specimen"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex relative w-full flex-col items-center justify-center"
              >
                <div className="relative w-full overflow-hidden rounded-xl border-emerald-500/30">
                  <img
                    src={selectedImage}
                    alt="Analyzed plant specimen"
                    className="w-full h-52 object-contain bg-black"
                  />
                  <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider text-emerald-300 backdrop-blur-md">
                    <CheckCircle2 className="w-3 h-3" />
                    ANALYZED
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setSelectedImage(null);
                      setCustomImageName(null);
                    }}
                    title="Clear this specimen"
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 hover:bg-rose-500/40 text-slate-300 hover:text-white backdrop-blur-md transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-2 flex w-full items-center justify-between gap-2 text-[11px] font-mono text-emerald-300">
                  <span className="truncate max-w-[60%]">{customImageName || 'Custom Photo Specimen'}</span>
                  <span className="shrink-0 text-slate-400">{analysisResult?.confidence ?? 0}% match</span>
                </div>

                <button
                  type="button"
                  onClick={triggerAnalysis}
                  className="mt-3 w-full py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border-white/15 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Re-analyze this specimen</span>
                </button>
              </motion.div>
            ) : (
              /* Nothing on the bench yet */
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-full text-center py-6 px-4 space-y-4"
              >
                {/* mx-auto is required: a block-level div ignores the parent's
                    text-center, which is what left it stranded on the left. */}
                <div className="relative w-44 sm:w-52 mx-auto aspect-[4/3] rounded-2xl border-dashed border-emerald-500/30 bg-emerald-500/[0.04] flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 ldx-scan-grid opacity-30" />
                  <Scan className="w-8 h-8 text-emerald-400/50" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">No specimen on the bench</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Shoot a photo of a single leaf, or upload one from your gallery. The full report lands in this panel.
                  </p>
                </div>
              </motion.div>
            )}

            </AnimatePresence>

            {/* Camera error notice */}
            {!isCameraActive && cameraError && (
              <div className="mt-2 p-2 rounded-lg bg-rose-500/20 border-rose-500/40 text-rose-200 text-xs text-center">
                {cameraError}
              </div>
            )}

            {/* Transient nudge when the user tries to analyze nothing, with a shake. */}
            {!isCameraActive && cameraNotice && (
              <motion.div
                key={`notice-${noticeKey}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0, x: [0, -5, 5, -3, 3, 0] }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="mt-2 p-2.5 rounded-lg bg-amber-500/15 border-amber-400/50 text-amber-100 text-xs text-center flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>{cameraNotice}</span>
              </motion.div>
            )}

          </div>

          {/* AI / server notice (no API key, model unavailable, unreachable).
              Sits below the canvas so it never inflates the viewfinder. */}
          {!isCameraActive && analysisError && !isAnalyzing && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-500/15 border-amber-500/40 text-amber-200 text-xs leading-relaxed flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
              <span>{analysisError}</span>
            </div>
          )}

          {/* Action Buttons: Live Camera, Native Camera & File Upload */}
          <div className="space-y-3 pt-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleShootPhoto}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Shoot Photo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    if (onRequireLogin) onRequireLogin();
                    return;
                  }
                  fileInputRef.current?.click();
                }}
                className="py-3 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Upload Photo</span>
              </button>
            </div>

            {/* Opens the phone camera app through the file picker - the path that works over plain http. */}
            <button
              type="button"
              onClick={openNativeCamera}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-200 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-300" />
              <span>Take Photo (Phone Camera App)</span>
            </button>

            {!isSecureForCamera && (
              <p className="text-[11px] leading-relaxed text-amber-200/90 bg-amber-500/10 border-amber-500/30 rounded-xl p-2.5">
                The in-page viewfinder needs a secure address, so &quot;Shoot Photo&quot; opens your
                phone&apos;s camera app. Reopen this app over https for the live viewfinder.
              </p>
            )}

            {/* Hidden file inputs: gallery picker, and native camera capture */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* No sample gallery: the scanner works on the specimen that is
              actually shot or uploaded in this session. */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-start gap-2 text-[11px] leading-relaxed text-emerald-200/70">
              <Info className="w-3.5 h-3.5 text-emerald-400/80 shrink-0 mt-0.5" />
              <span>
                Every report is generated from your own photo. Nothing is preloaded, so the
                diagnosis below always belongs to the specimen on the bench.
              </span>
            </div>
          </div>
        </div>

        {/* Right: Comprehensive Deep Learning Diagnosis Card */}
        <div
          ref={reportRef}
          className="lg:col-span-7 scroll-mt-6 rounded-3xl bg-slate-900/80 border-white/15 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl overflow-hidden"
        >
          <AnimatePresence mode="wait" initial={false}>

          {/* ---------------------------------------------------------------- */}
          {/* A. Analyzing — the report panel mirrors the pipeline               */}
          {/* ---------------------------------------------------------------- */}
          {isAnalyzing ? (
            <motion.div
              key={`report-analyzing-${sequenceKey}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex min-h-[520px] flex-col items-center justify-center gap-6 text-center"
            >
              <div className="relative flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                  className="w-28 h-28 rounded-full border-2 border-dashed border-emerald-400/40"
                />
                <motion.div
                  animate={{ scale: [1, 1.12, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute w-20 h-20 rounded-full bg-emerald-500/20 blur-xl"
                />
                <Sprout className="absolute w-9 h-9 text-emerald-300" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-white">Analyzing your specimen</h3>
                <p className="text-xs text-slate-400">
                  The vision model is reading the leaf and cross-referencing the botanical knowledge base.
                </p>
              </div>

              <div className="w-full max-w-sm space-y-2">
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 shadow-[0_0_12px_rgba(52,211,153,0.7)] transition-[width] duration-200 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-emerald-200/70">
                  <span className="truncate pr-2">{activeStage.label}</span>
                  <span className="shrink-0">{processingLabel(elapsed)}</span>
                </div>
              </div>

              {/* Skeleton placeholders shaped like the report that is coming. */}
              <div className="w-full space-y-3 pt-2">
                {[0, 1, 2].map((row) => (
                  <div
                    key={row}
                    className="ldx-fade-in rounded-2xl border-white/10 bg-white/[0.03] p-4"
                    style={{ '--ldx-delay': `${row * 0.3}s` }}
                  >
                    <div className="h-2.5 w-1/3 rounded-full bg-white/10" />
                    <div className="mt-2.5 h-2 w-full rounded-full bg-white/[0.07]" />
                    <div className="mt-2 h-2 w-4/5 rounded-full bg-white/[0.07]" />
                  </div>
                ))}
              </div>
            </motion.div>
          ) : !analysisResult ? (
          /* ---------------------------------------------------------------- */
          /* B. Nothing analyzed yet                                           */
          /* ---------------------------------------------------------------- */
            <motion.div
              key="report-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex min-h-[520px] flex-col items-center justify-center gap-5 text-center"
            >
              <div className="relative w-24 h-24 rounded-3xl bg-emerald-500/10 border-emerald-500/30 flex items-center justify-center">
                <div className="absolute inset-0 ldx-scan-grid opacity-30 rounded-3xl" />
                <Microscope className="w-10 h-10 text-emerald-400/70" />
              </div>

              <div className="space-y-1.5 max-w-md">
                <h3 className="text-lg font-black text-white">No diagnosis on file</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This panel is reserved for the plant being scanned right now. Shoot or upload a
                  photo on the left and LeafDex will fill it with the full species profile,
                  diagnosis, care plan, medicinal uses, and pet-safety verdict.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-md text-[11px]">
                {[
                  'Species & confidence',
                  'Health & severity',
                  'Care requirements',
                  'Medicinal profile',
                  'Pet toxicity',
                  'Treatment protocol',
                ].map((label) => (
                  <div
                    key={label}
                    className="rounded-xl border-white/10 bg-white/[0.03] px-3 py-2 text-slate-400 font-mono"
                  >
                    {label}
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
          /* ---------------------------------------------------------------- */
          /* C. The report — fades in section by section (0.3s stagger)         */
          /* ---------------------------------------------------------------- */
            <motion.div
              key={`report-${sequenceKey}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* Specimen header */}
              <div
                className="ldx-fade-in relative overflow-hidden rounded-2xl border-white/10 bg-white/[0.04] p-4 sm:p-5"
                style={{ '--ldx-delay': '0s' }}
              >
                {/* Sheen that sweeps once when the report arrives. */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                  <div className="ldx-sheen absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>

                <div className="flex relative flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4 min-w-0">
                    {/* The specimen the report belongs to. */}
                    <div className="w-[70px] h-[70px] shrink-0 overflow-hidden rounded-2xl border-emerald-500/30 bg-black/50">
                      {analyzedImage ? (
                        <img
                          src={analyzedImage}
                          alt="Analyzed specimen"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                          {analysisResult.specimenEmoji}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <span className="text-[10px] uppercase tracking-wider font-mono text-emerald-300/70">
                        Current session specimen
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xl">{analysisResult.specimenEmoji}</span>
                        <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                          {analysisResult.commonName}
                        </h2>
                      </div>
                      <p className="text-xs font-mono text-emerald-300 italic mt-1">
                        {analysisResult.scientificName} &bull; Family: {analysisResult.family}
                      </p>
                      {analysisResult.growthStage && (
                        <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
                          <Sprout className="w-3 h-3 text-emerald-400" />
                          {analysisResult.growthStage}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                      {analysisResult.confidence}% AI Match
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        analysisResult.healthStatus.toLowerCase().includes('healthy')
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : analysisResult.healthStatus.toLowerCase().includes('infected')
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {analysisResult.healthStatus}
                    </span>
                    <button
                      onClick={() => handleShareResult(analysisResult)}
                      title="Share this result"
                      className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border-white/20 hover:border-emerald-400/50 transition-all cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      {shareState === 'copied' ? 'Copied!' : 'Share'}
                    </button>
                    <button
                      onClick={() => handleSaveBookmark(analysisResult)}
                      title="Save this plant to bookmarks"
                      className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border-white/20 hover:border-emerald-400/50 transition-all cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      {bookmarkState === 'saved' ? 'Saved!' : 'Save'}
                    </button>
                  </div>
                </div>

                {/* Report stamp — the plant's category plus the exact time it was
                    scanned, presented as a pressed ink stamp. Registered to the
                    `analyzedAt` of whatever report is on screen, so it re-dates
                    itself when a past scan is reopened from the recent list. */}
                <div
                  className="ldx-stamp relative mt-5"
                  style={{ '--ldx-delay': '0.15s' }}
                >
                  {(() => {
                    const stampCategory = categorizeScan(analysisResult);
                    return (
                      <div
                        className={`flex flex-col items-stretch gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${STAMP_TONES[stampCategory.tone]}`}
                      >
                        {/* Left: the stamped seal — icon inside a ringed badge,
                            with the label stacked neatly beside it. */}
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-current">
                            <Stamp className="h-[18px] w-[18px]" />
                          </div>
                          <div className="leading-none">
                            <span className="block text-[9px] font-mono font-semibold uppercase tracking-[0.2em] opacity-70">
                              Category
                            </span>
                            <span className="mt-1 block text-base font-black uppercase tracking-wide">
                              {stampCategory.label}
                            </span>
                          </div>
                        </div>

                        {/* Right: the scan timestamp, aligned to a shared baseline
                            so it never drifts or wraps oddly. */}
                        <div className="flex items-center gap-3 sm:justify-end">
                          <span className="hidden h-9 w-px shrink-0 bg-current opacity-20 sm:block" />
                          <div className="leading-none sm:text-right">
                            <span className="block text-[9px] font-mono font-semibold uppercase tracking-[0.2em] opacity-70">
                              Scanned
                            </span>
                            <span className="mt-1 block font-mono text-sm font-bold tabular-nums">
                              {formatStamp(analyzedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Meta strip: what was scanned, how severe, and when. */}
                <div className="grid relative mt-5 grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                  <div className="rounded-xl border-white/10 bg-black/30 px-3.5 py-2.5 space-y-1">
                    <span className="text-slate-400 block font-semibold flex items-center gap-1.5">
                      <Eye className="w-3 h-3 text-emerald-400 shrink-0" /> Organ scanned
                    </span>
                    <span className="text-slate-200 block leading-relaxed">{analysisResult.organScanned}</span>
                  </div>
                  <div className="rounded-xl border-white/10 bg-black/30 px-3.5 py-2.5 space-y-1">
                    <span className="text-slate-400 block font-semibold flex items-center gap-1.5">
                      <Activity className="w-3 h-3 text-rose-400 shrink-0" /> Severity
                    </span>
                    <span className="text-slate-200 block leading-relaxed">{analysisResult.severity}</span>
                  </div>
                  <div className="rounded-xl border-white/10 bg-black/30 px-3 py-2">
                    <span className="text-slate-400 block font-semibold flex items-center gap-1">
                      <Timer className="w-3 h-3 text-cyan-400" /> Scanned
                    </span>
                    <span className="text-slate-200 font-mono">
                      {analyzedAt ? analyzedAt.toLocaleTimeString() : 'just now'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Tab Filter Navigation */}
              <div
                className="ldx-fade-in flex-wrap gap-1.5 p-1 rounded-2xl bg-white/[0.04] border-white/10 text-xs"
                style={{ '--ldx-delay': '0.3s' }}
              >
                {[
                  { key: 'all', label: '📋 Overview' },
                  { key: 'needs', label: '💧 Care & Needs' },
                  { key: 'medicinal', label: '🩹 Healing & Uses' },
                  { key: 'pets', label: '🐾 Pet Toxicity' },
                  { key: 'issues', label: '🔬 Diagnosis' },
                  { key: 'treatment', label: '💊 Treatment Plan' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveSubTab(tab.key)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                      activeSubTab === tab.key
                        ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Report body — each block animates in 0.3s after the previous one. */}
              <div className="space-y-4 text-xs">

                {/* 1. SPECIES OVERVIEW */}
                {(activeSubTab === 'all' || activeSubTab === 'issues') && (
                  <div
                    className="ldx-fade-in p-4 rounded-2xl bg-white/[0.04] border-white/10 space-y-3"
                    style={{ '--ldx-delay': '0.3s' }}
                  >
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      Species Overview
                    </div>
                    {analysisResult.overview ? (
                      <p className="text-slate-200 leading-relaxed">{analysisResult.overview}</p>
                    ) : (
                      <p className="text-slate-400 italic leading-relaxed">
                        No species description was returned for this specimen.
                      </p>
                    )}
                    {analysisResult.appearance && (
                      <div className="rounded-xl bg-black/25 border-white/10 p-3">
                        <span className="text-emerald-300 font-semibold block mb-1">
                          🔍 What to look for:
                        </span>
                        <p className="text-slate-200 leading-relaxed">{analysisResult.appearance}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. PATHOLOGY & DIAGNOSIS */}
                {(activeSubTab === 'all' || activeSubTab === 'issues') && (
                  <div
                    className="ldx-fade-in p-4 rounded-2xl bg-white/[0.04] border-white/10 space-y-2"
                    style={{ '--ldx-delay': '0.6s' }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <HeartPulse className="w-4 h-4 text-rose-400" />
                        Pathology &amp; Diagnosis
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        Severity: <strong className="text-white">{analysisResult.severity}</strong>
                      </span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{analysisResult.issue}</p>
                  </div>
                )}

                {/* 3. CARE NEEDS & ENVIRONMENT */}
                {(activeSubTab === 'all' || activeSubTab === 'needs') && (
                  <div
                    className="ldx-fade-in p-4 rounded-2xl bg-white/[0.04] border-white/10 space-y-3"
                    style={{ '--ldx-delay': '0.9s' }}
                  >
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-cyan-400" />
                      Cultivation, Care &amp; Environment
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-2.5 rounded-xl bg-black/30 border-white/5">
                        <span className="text-slate-400 text-[11px] block font-semibold flex items-center gap-1">
                          <Sun className="w-3 h-3 text-amber-400" /> Sunlight
                        </span>
                        <span className="text-slate-200 mt-0.5 block leading-relaxed">
                          {analysisResult.needs.sunlight}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-black/30 border-white/5">
                        <span className="text-slate-400 text-[11px] block font-semibold flex items-center gap-1">
                          <Droplets className="w-3 h-3 text-cyan-400" /> Watering
                        </span>
                        <span className="text-slate-200 mt-0.5 block leading-relaxed">
                          {analysisResult.needs.watering}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-black/30 border-white/5">
                        <span className="text-slate-400 text-[11px] block font-semibold flex items-center gap-1">
                          <Leaf className="w-3 h-3 text-emerald-400" /> Soil &amp; pH
                        </span>
                        <span className="text-slate-200 mt-0.5 block leading-relaxed">
                          {analysisResult.needs.soil}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-black/30 border-white/5">
                        <span className="text-slate-400 text-[11px] block font-semibold flex items-center gap-1">
                          <Thermometer className="w-3 h-3 text-rose-400" /> Temperature
                        </span>
                        <span className="text-slate-200 mt-0.5 block leading-relaxed">
                          {analysisResult.needs.temperature}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-black/30 border-white/5">
                        <span className="text-slate-400 text-[11px] block font-semibold flex items-center gap-1">
                          <CloudSun className="w-3 h-3 text-teal-300" /> Humidity
                        </span>
                        <span className="text-slate-200 mt-0.5 block leading-relaxed">
                          {analysisResult.needs.humidity}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-black/30 border-white/5">
                        <span className="text-slate-400 text-[11px] block font-semibold flex items-center gap-1">
                          <FlaskConical className="w-3 h-3 text-amber-300" /> Feeding
                        </span>
                        <span className="text-slate-200 mt-0.5 block leading-relaxed">
                          {analysisResult.needs.fertilizer}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. HEALING / MEDICINAL / HOUSEHOLD */}
                {(activeSubTab === 'all' || activeSubTab === 'medicinal') && (
                  <div
                    className="ldx-fade-in p-4 rounded-2xl bg-emerald-950/40 border-emerald-500/30 space-y-2.5"
                    style={{ '--ldx-delay': '1.2s' }}
                  >
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      What Is It Good For? (Medicinal, Healing &amp; Household)
                    </div>

                    <div className="text-slate-200 leading-relaxed bg-black/20 p-3 rounded-xl border-emerald-500/20">
                      <strong className="text-emerald-300 block mb-1">
                        🩹 Healing &amp; Medicinal Uses:
                      </strong>
                      {analysisResult.medicinal.uses}
                    </div>

                    <div className="text-slate-200 leading-relaxed bg-black/20 p-3 rounded-xl border-emerald-500/20">
                      <strong className="text-cyan-300 block mb-1 flex items-center gap-1.5">
                        <FlaskConical className="w-3.5 h-3.5" /> Active Constituents:
                      </strong>
                      {analysisResult.medicinal.constituents}
                    </div>

                    <div className="text-slate-200 leading-relaxed bg-black/20 p-3 rounded-xl border-emerald-500/20">
                      <strong className="text-amber-300 block mb-1 flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5" /> How It Is Prepared:
                      </strong>
                      {analysisResult.medicinal.preparation}
                    </div>

                    <div className="p-3 rounded-xl bg-rose-950/30 border-rose-500/30 text-rose-100 leading-relaxed">
                      <strong className="text-rose-300 block mb-1 flex items-center gap-1.5">
                        <ShieldQuestion className="w-3.5 h-3.5" /> Safety Caution:
                      </strong>
                      {analysisResult.medicinal.caution}
                    </div>

                    <div className="text-slate-300 leading-relaxed bg-black/20 p-3 rounded-xl border-white/10">
                      <strong className="text-slate-200 block mb-1">📖 Evidence Level:</strong>
                      {analysisResult.medicinal.evidence}
                    </div>

                    <div className="text-slate-200 leading-relaxed bg-black/20 p-3 rounded-xl border-emerald-500/20">
                      <strong className="text-teal-300 block mb-1">
                        🏡 Household &amp; Wellness Benefits:
                      </strong>
                      {analysisResult.household}
                      {analysisResult.ecosystem && (
                        <span className="block mt-2 pt-2 border-t border-white/10">
                          <strong className="text-emerald-300">🌍 Pollinators &amp; Ecosystem:</strong>{' '}
                          {analysisResult.ecosystem}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. PET SAFETY & TOXICITY */}
                {(activeSubTab === 'all' || activeSubTab === 'pets') && (
                  <div
                    className={`ldx-fade-in p-4 rounded-2xl border space-y-3 ${
                      analysisResult.petSafety.safe
                        ? 'bg-emerald-950/30 border-emerald-500/40'
                        : 'bg-rose-950/30 border-rose-500/40'
                    }`}
                    style={{ '--ldx-delay': '1.5s' }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`font-bold flex items-center gap-1.5 ${
                          analysisResult.petSafety.safe ? 'text-emerald-300' : 'text-rose-300'
                        }`}
                      >
                        {analysisResult.petSafety.safe ? (
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                        )}
                        Pet &amp; Animal Safety Check (Dogs / Cats)
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          analysisResult.petSafety.safe
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {analysisResult.petSafety.status}
                      </span>
                    </div>

                    <p className="text-slate-200 leading-relaxed">{analysisResult.petSafety.note}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-black/30 border-white/5">
                        <span className="text-slate-400 text-[11px] block font-semibold">
                          ⚠️ Symptoms to watch for
                        </span>
                        <span className="text-slate-200 mt-0.5 block leading-relaxed">
                          {analysisResult.petSafety.symptoms}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/30 border-white/5">
                        <span className="text-slate-400 text-[11px] block font-semibold">
                          🚑 First response
                        </span>
                        <span className="text-slate-200 mt-0.5 block leading-relaxed">
                          {analysisResult.petSafety.action}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. TREATMENT & PREVENTION */}
                {(activeSubTab === 'all' || activeSubTab === 'treatment') && (
                  <div
                    className="ldx-fade-in p-4 rounded-2xl bg-teal-950/30 border-teal-500/30 space-y-3"
                    style={{ '--ldx-delay': '1.8s' }}
                  >
                    <div className="font-bold text-teal-300 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Prescribed Treatment &amp; Agronomic Protocol
                    </div>
                    <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                      {analysisResult.treatment}
                    </p>

                    {analysisResult.prevention && (
                      <div className="rounded-xl bg-black/25 border-teal-500/20 p-3">
                        <strong className="text-teal-200 block mb-1">
                          🛡️ Preventing it from coming back:
                        </strong>
                        <p className="text-slate-200 leading-relaxed">{analysisResult.prevention}</p>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Footer controls */}
              <div
                className="ldx-fade-in pt-2 flex-wrap items-center justify-between gap-2 border-t border-white/10 text-xs"
                style={{ '--ldx-delay': '2.1s' }}
              >
                <div className="text-slate-400 font-mono text-[11px] min-w-0">
                  <span className="block truncate">Specimen ID: #{analysisResult.id}</span>
                  <span className="block truncate text-slate-500">{analysisResult.derivedFrom}</span>
                </div>
                <button
                  onClick={triggerAnalysis}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin text-emerald-400' : ''}`} />
                  <span>Re-analyze</span>
                </button>
              </div>
            </motion.div>
          )}

          </AnimatePresence>
        </div>

      </div>

      {/* Recent Scans — a compact, per-account log of what was identified and
          when. Sits below the studio so it is a full-width row on phones and
          a wide strip on desktop. Each row reopens its report when clicked. */}
      {currentUser && (
        <div className="rounded-3xl bg-slate-900/80 border-white/15 p-5 sm:p-6 backdrop-blur-2xl shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
            <button
              type="button"
              onClick={() => setShowRecentScans((v) => !v)}
              className="flex items-center gap-2 text-sm font-bold text-white cursor-pointer"
            >
              <History className="w-4 h-4 text-emerald-400" />
              <span>Recent Scans</span>
              {recentScans.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                  {recentScans.length}
                </span>
              )}
              <span className="text-[10px] font-mono text-slate-400">
                {showRecentScans ? '▾' : '▸'}
              </span>
            </button>

            {recentScans.length > 0 && (
              <button
                type="button"
                onClick={clearRecentScans}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/15 text-slate-300 hover:text-rose-200 border-white/10 hover:border-rose-500/30 text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear history</span>
              </button>
            )}
          </div>

          {showRecentScans && (
            <div className="mt-4">
              {recentScans.length === 0 ? (
                <div className="flex items-center gap-2.5 text-[11px] text-slate-400 leading-relaxed">
                  <Clock className="w-3.5 h-3.5 text-emerald-400/70 shrink-0" />
                  <span>
                    No scans logged yet. Every plant you identify is stamped with its category and
                    the exact time it was scanned, and will appear here.
                  </span>
                </div>
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
                  {recentScans.map((entry) => {
                    const isActive = analysisResult?.id === entry.id;
                    return (
                      <li key={entry.id}>
                        <button
                          type="button"
                          onClick={() => openRecentScan(entry)}
                          title={`Open the report for ${entry.commonName} (scanned ${formatStamp(entry.stamp)})`}
                          className={`w-full text-left rounded-2xl border p-2.5 flex items-center gap-3 transition-all cursor-pointer ${
                            isActive
                              ? 'border-emerald-500/50 bg-emerald-500/10'
                              : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20'
                          }`}
                        >
                          <div className="w-11 h-11 shrink-0 overflow-hidden rounded-xl border-white/10 bg-black/50 flex items-center justify-center">
                            {entry.thumb ? (
                              <img src={entry.thumb} alt={entry.commonName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-lg">{entry.specimenEmoji || '🔬'}</span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <span className="block text-xs font-bold text-white truncate">
                              {entry.commonName}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${STAMP_TONES[entry.tone] || STAMP_TONES.slate}`}
                              >
                                {entry.categoryLabel}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {timeAgo(entry.stamp)}
                              </span>
                            </div>
                            <span className="block text-[10px] font-mono text-slate-500 truncate mt-0.5">
                              {formatStamp(entry.stamp)}
                            </span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

