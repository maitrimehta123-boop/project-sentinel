import type { DBProduct } from "@/lib/shop";

/**
 * Built-in catalog used as an instant, offline-safe fallback for the shop.
 * Rendered immediately (no network wait) when the database returns no rows,
 * so the collection never shows an empty state or a long loading skeleton.
 */
const make = (
  id: string,
  name: string,
  price: number,
  image: string,
  description: string,
  category: string,
  extra: Partial<DBProduct> = {}
): DBProduct => ({
  id,
  name,
  description,
  price,
  image_url: image,
  images: [image],
  category,
  stock: 25,
  active: true,
  discount_percent: 0,
  variants: null,
  sku: null,
  badge: null,
  rating: 4.7,
  review_count: 24,
  sort_order: 0,
  created_at: "2026-01-01T00:00:00Z",
  ...extra,
});

/** Product photo folder (files live in /public/assets/products). */
const img = (file: string) => `/assets/products/${encodeURIComponent(file)}`;

export const CATEGORIES = ["Bracelet", "Prosperity & Wealth", "Chakra & Protection", "Vedic Remedy"] as const;

export const CATALOG: DBProduct[] = [
  make(
    "trishield-bracelet",
    "Trishield Bracelet",
    750,
    img("trishield-1.jpg"),
    "The Trishield Bracelet brings together three powerful gems — Rudraksh, Sphatik (Clear Quartz) and Karungali (Black Ebony). This combination is traditionally believed to boost confidence, build positivity, and attract success. Designed for everyday wear and suitable for both men and women.",
    "Chakra & Protection",
    {
      sort_order: 0,
      badge: "New Launch",
      featured: true,
      discount_percent: 21,
      rating: 4.8,
      review_count: 31,
      images: [
        img("trishield-1.jpg"),
        img("trishield-2.jpg"),
        img("trishield-3.jpg"),
        img("trishield-4.jpg"),
      ],
    }
  ),
  make(
    "chakra-tree",
    "7 Chakra Crystal Tree",
    860,
    img("1000212756.jpg"),
    "Bring harmony, positive energy, and spiritual balance into your home or workspace with this handcrafted 7 Chakra Crystal Tree. Made with natural crystal representing all seven chakras, this beautiful crystal tree is believed to attract positive vibrations, encourage emotional well-being, and create a peaceful environment.",
    "Chakra & Protection",
    {
      sort_order: 1,
      badge: "Bestseller",
      discount_percent: 20,
      rating: 4.8,
      review_count: 96,
      images: [img("1000212756.jpg")],
    }
  ),
  make(
    "ranga-dhatu-sarp-set",
    "Ranga Dhatu Sarp Set",
    1950,
    img("1000212762.jpg"),
    "The Ranga Dhatu Sarp Set consists of 11 pairs (22 serpents) crafted from lead (Ranga Dhatu). Traditionally recommended in specific Vedic remedies, this set is commonly used during Kaal Sarp Dosh Nivaran rituals and other prescribed astrological pujas. This product should be used only after consultation with an experienced astrologer.",
    "Vedic Remedy",
    {
      sort_order: 2,
      badge: "Per Box",
      discount_percent: 15,
      rating: 4.6,
      review_count: 41,
      images: [img("1000212762.jpg")],
    }
  ),
  make(
    "moonstone-bracelet",
    "Moonstone Bracelet",
    750,
    img("1000212764.jpg"),
    "The Moonstone Bracelet is crafted from genuine natural Moonstone beads, admired for their soft, luminous appearance and calming energy. In Vedic astrology, the Moon governs the mind, emotions, intuition, and mental peace. A balanced Moon is believed to support emotional stability, clarity of thought, and harmonious relationships. Traditionally known as the \"Mother of All Planets\", Moonstone is associated with nurturing energy, compassion, and emotional well-being. It is often recommended for individuals who experience stress, confusion, mood swings, or excessive overthinking.",
    "Bracelet",
    {
      sort_order: 3,
      discount_percent: 25,
      rating: 4.7,
      review_count: 68,
      images: [img("1000212764.jpg")],
    }
  ),
  make(
    "rose-quartz-bracelet",
    "Rose Quartz Bracelet",
    600,
    img("1000212766.jpg"),
    "The Rose Quartz Bracelet is crafted from natural Rose Quartz gemstones, traditionally known as the Stone of Love. It is believed to attract love, strengthen relationships, encourage self-love, and promote emotional healing. Whether you're looking to nurture an existing relationship or searching for a thoughtful gift for someone special, this bracelet symbolizes affection, compassion, and harmony.",
    "Bracelet",
    {
      sort_order: 4,
      discount_percent: 20,
      rating: 4.8,
      review_count: 112,
      images: [img("1000212766.jpg")],
    }
  ),
  make(
    "pyrite-bracelet",
    "Pyrite Bracelet",
    750,
    img("1000212768.jpg"),
    "The Pyrite Bracelet is crafted from natural Pyrite gemstones, traditionally associated with Shani (Saturn) in Vedic astrology. Often known as the Stone of Prosperity, Pyrite is believed to attract wealth, enhance confidence, remove financial obstacles, and support individuals facing struggles in their personal or professional life. Traditionally, this bracelet is recommended to be worn on the left hand after consultation with a qualified astrologer.",
    "Prosperity & Wealth",
    {
      sort_order: 5,
      discount_percent: 18,
      rating: 4.7,
      review_count: 87,
      images: [img("1000212768.jpg")],
    }
  ),
  make(
    "sunstone-bracelet",
    "Sunstone Bracelet",
    750,
    img("1000212775.jpg"),
    "The Sunstone Bracelet is crafted from natural Sunstone gemstones, traditionally associated with confidence, leadership, and success. It is believed to inspire motivation, attract opportunities, and support long-term growth, making it a popular choice for business owners, entrepreneurs, managers, and professionals seeking progress in their careers and ventures.",
    "Bracelet",
    {
      sort_order: 6,
      discount_percent: 22,
      rating: 4.6,
      review_count: 54,
      images: [img("1000212775.jpg"), img("1000212775 copy.jpg")],
    }
  ),
  make(
    "carnelian-bracelet",
    "Carnelian Bracelet",
    750,
    img("1000212777.jpg"),
    "The Carnelian Bracelet is crafted from natural Carnelian gemstones, traditionally associated with Mangal (Mars) in Vedic astrology. Known as the Stone of Courage and Action, Carnelian is believed to enhance confidence, increase motivation, balance the Sacral Chakra, and channel Mars' powerful energy in a positive and productive way.",
    "Bracelet",
    {
      sort_order: 7,
      discount_percent: 15,
      rating: 4.5,
      review_count: 37,
      images: [img("1000212777.jpg"), img("1000212777 copy.jpg")],
    }
  ),
  make(
    "tiger-eye-bracelet",
    "Tiger Eye Bracelet",
    750,
    img("1000212779.jpg"),
    "The Tiger Eye Bracelet is crafted from natural Tiger Eye gemstones, traditionally known as the Stone of Courage and Confidence. It is believed to boost self-confidence, improve focus, enhance decision-making, and provide protection from negative energies. Perfect for professionals, entrepreneurs, students, and anyone striving to achieve their goals with confidence.",
    "Bracelet",
    {
      sort_order: 8,
      badge: "Popular",
      discount_percent: 25,
      rating: 4.8,
      review_count: 129,
      images: [img("1000212779.jpg"), img("1000212779 copy.jpg")],
    }
  ),
  make(
    "7-chakra-black-tourmaline-bracelet",
    "7 Chakra Black Tourmaline Bracelet",
    650,
    img("1000212781.jpg"),
    "The 7 Chakra Black Tourmaline Bracelet combines the protective properties of Black Tourmaline with the healing energy of the Seven Chakra gemstones. Traditionally believed to protect against negative energy, Nazar Dosh (evil eye), and emotional stress, this bracelet also helps balance the body's seven chakras. Suitable for anyone aged 10 years and above.",
    "Chakra & Protection",
    {
      sort_order: 9,
      discount_percent: 20,
      rating: 4.7,
      review_count: 73,
      images: [img("1000212781.jpg"), img("1000212781 copy.jpg")],
    }
  ),
  make(
    "dhanyog-bracelet",
    "Dhanyog Bracelet",
    750,
    img("1000212783.jpg"),
    "The Dhanyog Bracelet is a premium combination of carefully selected natural crystals traditionally believed to attract wealth, prosperity, confidence, success, and positive energy. Designed for everyday wear, this bracelet is suitable for both men and women and is ideal for entrepreneurs, professionals, students, and anyone looking to invite abundance into their life.",
    "Prosperity & Wealth",
    {
      sort_order: 10,
      discount_percent: 18,
      rating: 4.6,
      review_count: 58,
      images: [img("1000212783.jpg"), img("1000212783 copy.jpg")],
    }
  ),
];

export const catalogById = (id?: string) => CATALOG.find((p) => p.id === id) ?? null;
