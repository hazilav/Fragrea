import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding FRAGREA 17-Model Relational Database Architecture...');

  // 1. Clean existing records in correct foreign key order
  await prisma.shipping.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.productNote.deleteMany({});
  await prisma.fragranceNote.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.collection.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.admin.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Seed Users & Admin
  const adminPasswordHash = await bcrypt.hash('FragreaLuxury2025!', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@fragrea.com',
      passwordHash: adminPasswordHash,
      firstName: 'Jean-Luc',
      lastName: 'Vaneau',
      role: 'SUPER_ADMIN',
      isActive: true,
      admin: {
        create: {
          role: 'SUPER_ADMIN',
          permissions: JSON.stringify(['ALL_ACCESS', 'CATALOG_WRITE', 'ORDER_MANAGE', 'INVENTORY_MANAGE']),
          lastLoginAt: new Date(),
        },
      },
    },
  });

  const customerUser1 = await prisma.user.create({
    data: {
      email: 'j.sterling@mayfairclub.co.uk',
      passwordHash: await bcrypt.hash('ClientPassword2025!', 10),
      firstName: 'Julian',
      lastName: 'Sterling',
      phone: '+44 20 7946 0912',
      role: 'CUSTOMER',
      isActive: true,
    },
  });

  const customerUser2 = await prisma.user.create({
    data: {
      email: 'eleonore.montmirail@palais.fr',
      passwordHash: await bcrypt.hash('ClientPassword2025!', 10),
      firstName: 'Éléonore',
      lastName: 'de Montmirail',
      phone: '+33 1 42 68 55 00',
      role: 'CUSTOMER',
      isActive: true,
    },
  });

  // 3. Seed Customers & Addresses
  const customer1 = await prisma.customer.create({
    data: {
      userId: customerUser1.id,
      email: customerUser1.email,
      firstName: 'Julian',
      lastName: 'Sterling',
      phone: customerUser1.phone,
      totalOrders: 1,
      totalSpent: 690,
      addresses: {
        create: [
          {
            type: 'SHIPPING',
            firstName: 'Julian',
            lastName: 'Sterling',
            company: 'Mayfair Club',
            addressLine1: '14 Berkeley Square',
            city: 'London',
            postalCode: 'W1J 6EG',
            country: 'United Kingdom',
            phone: '+44 20 7946 0912',
            isDefault: true,
          },
        ],
      },
    },
    include: { addresses: true },
  });

  const customer2 = await prisma.customer.create({
    data: {
      userId: customerUser2.id,
      email: customerUser2.email,
      firstName: 'Éléonore',
      lastName: 'de Montmirail',
      phone: customerUser2.phone,
      totalOrders: 1,
      totalSpent: 580,
      addresses: {
        create: [
          {
            type: 'SHIPPING',
            firstName: 'Éléonore',
            lastName: 'de Montmirail',
            addressLine1: '7 Place Vendôme',
            city: 'Paris',
            postalCode: '75001',
            country: 'France',
            phone: '+33 1 42 68 55 00',
            isDefault: true,
          },
        ],
      },
    },
    include: { addresses: true },
  });

  // 4. Seed Collections
  const colNocturne = await prisma.collection.create({
    data: {
      name: 'The Nocturne Series',
      slug: 'the-nocturne-series',
      subtitle: 'Shadowed woods, velvety leathers & nocturnal roses',
      description: 'Conceived for the hours between midnight and dawn. A provocative collection dominated by dark agarwood, smoldering incense, and velvet florals.',
      heroImage: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?q=80&w=1400&auto=format&fit=crop',
      featured: true,
      status: 'ACTIVE',
    },
  });

  const colPrivate = await prisma.collection.create({
    data: {
      name: 'Private Reserve',
      slug: 'private-reserve',
      subtitle: 'Aged distillations & sacred botanicals',
      description: 'Extremely limited small-batch creations featuring vintage Mysore sandalwood, rare distillates, and barrel-aged amber resins.',
      heroImage: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1400&auto=format&fit=crop',
      featured: true,
      status: 'ACTIVE',
    },
  });

  const colOrient = await prisma.collection.create({
    data: {
      name: "L'Or d'Orient",
      slug: 'lor-dorient',
      subtitle: 'Molten ambers, Florentine iris & royal solar notes',
      description: 'A tribute to the golden route of antiquity. Luminous, sun-drenched resins and powdered iris bathed in warm antique gold aura.',
      heroImage: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?q=80&w=1400&auto=format&fit=crop',
      featured: true,
      status: 'ACTIVE',
    },
  });

  // 5. Seed Fragrance Notes Taxonomy
  const noteList = [
    { name: 'Cambodian Agarwood (Oud)', category: 'Woody', origin: 'Koh Kong, Cambodia', description: 'Rare aged wild resin with medicinal leather and balsamic smoke.' },
    { name: 'Mysore Sandalwood', category: 'Woody', origin: 'Karnataka, India', description: 'Sacred milky woody depth of vintage distillation.' },
    { name: 'Taif Rose Absolu', category: 'Floral', origin: 'Taif, Saudi Arabia', description: 'Spicy, dark mountain rose harvested at dawn.' },
    { name: 'Saffron Suede', category: 'Spicy', origin: 'Kashmir', description: 'Bittersweet golden spice with soft leather facets.' },
    { name: 'Cracked Cardamom', category: 'Spicy', origin: 'Guatemala', description: 'Crystalline aromatic warmth with eucalyptus clarity.' },
    { name: 'Calabrian Bergamot', category: 'Citrus', origin: 'Southern Italy', description: 'Cold-pressed solar zest with peppery sparkle.' },
    { name: 'Smoked Incense', category: 'Amber', origin: 'Oman', description: 'Royal Green Hojari frankincense resin tears.' },
    { name: 'Florentine Iris Pallida', category: 'Floral', origin: 'Tuscany, Italy', description: '3-year aged rhizome butter with silvery violet powder.' },
    { name: 'Moroccan Labdanum', category: 'Amber', origin: 'Morocco', description: 'Sticky golden rockrose resin with honeyed leather depth.' },
    { name: 'Siam Benzoin', category: 'Amber', origin: 'Thailand / Laos', description: 'Sweet vanilla balsamic resin with warm caramel nuances.' },
    { name: 'Bourbon Vanilla Bean', category: 'Gourmand', origin: 'Madagascar', description: 'Dark woody vanilla caviar devoid of sugary synthetic tones.' },
    { name: 'Tuscan Suede Accord', category: 'Leather', origin: 'Florence, Italy', description: 'Supple hand-buffed leather reminiscent of vintage saddlery.' },
    { name: 'Haitian Vetiver Coeur', category: 'Earthy', origin: 'Les Cayes, Haiti', description: 'Smoky, mineral root distillate with aristocratic freshness.' },
    { name: 'Blonde Tobacco Leaf', category: 'Woody', origin: 'Havana, Cuba', description: 'Sun-cured blonde leaf steeped in aged cognac barrels.' },
    { name: 'Tunisian Orange Blossom', category: 'Floral', origin: 'Nabeul, Tunisia', description: 'Dew-kissed solar blossom absolute.' },
  ];

  const noteMap: Record<string, string> = {};
  for (const n of noteList) {
    const createdNote = await prisma.fragranceNote.create({ data: n });
    noteMap[n.name] = createdNote.id;
  }

  // 6. Seed Products with complete specifications
  const productsToCreate = [
    {
      name: 'Oud Nocturne',
      slug: 'oud-nocturne',
      sku: 'FRG-EXT-001',
      shortDescription: 'Shadowed Cambodian Agarwood & Smoked Frankincense',
      description: 'An intense, enigmatic exploration of nocturnal elegance. Rare aged Cambodian oud intertwines with smoldering frankincense, velvety leather, and the intoxicating warmth of bourbon vanilla. Unfolds on the skin with sovereign distinction.',
      price: 340,
      salePrice: null,
      currency: 'USD',
      size: '100 ml / 3.4 FL. OZ.',
      stockQuantity: 14,
      status: 'ACTIVE',
      featured: true,
      newArrival: false,
      collectionId: colNocturne.id,
      topNotes: JSON.stringify(['Saffron Suede', 'Calabrian Bergamot', 'Cracked Cardamom']),
      heartNotes: JSON.stringify(['Smoked Incense', 'Taif Rose Absolu', 'Florentine Iris Pallida']),
      baseNotes: JSON.stringify(['Cambodian Agarwood (Oud)', 'Bourbon Vanilla Bean', 'Tuscan Suede Accord']),
      baseDescription: 'Smoldering Koh Kong agarwood, birch tar, bourbon vanilla, and raw oceanic ambergris.',
      images: [
        { url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1200&auto=format&fit=crop', isPrimary: false, displayOrder: 2 },
        { url: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?q=80&w=1200&auto=format&fit=crop', isPrimary: false, displayOrder: 3 },
      ],
      notesRelations: [
        { noteName: 'Saffron Suede', type: 'TOP', order: 1 },
        { noteName: 'Calabrian Bergamot', type: 'TOP', order: 2 },
        { noteName: 'Cracked Cardamom', type: 'TOP', order: 3 },
        { noteName: 'Smoked Incense', type: 'HEART', order: 1 },
        { noteName: 'Taif Rose Absolu', type: 'HEART', order: 2 },
        { noteName: 'Cambodian Agarwood (Oud)', type: 'BASE', order: 1 },
        { noteName: 'Bourbon Vanilla Bean', type: 'BASE', order: 2 },
      ],
    },
    {
      name: 'Santal Impérial',
      slug: 'santal-imperial',
      sku: 'FRG-EXT-002',
      shortDescription: 'Sacred Mysore Sandalwood & Creamy Cashmeran',
      description: 'A masterwork of quiet majesty. Sacred Mysore sandalwood draped in crisp cardamom pods, white amber, and crystalline cedarwood. Silky, opulent, and whispering timeless authority.',
      price: 320,
      salePrice: null,
      currency: 'USD',
      size: '100 ml / 3.4 FL. OZ.',
      stockQuantity: 18,
      status: 'ACTIVE',
      featured: true,
      newArrival: false,
      collectionId: colPrivate.id,
      topNotes: JSON.stringify(['Cracked Cardamom', 'Calabrian Bergamot']),
      heartNotes: JSON.stringify(['Mysore Sandalwood', 'Florentine Iris Pallida']),
      baseNotes: JSON.stringify(['Bourbon Vanilla Bean', 'Tuscan Suede Accord']),
      baseDescription: 'Ancient vintage Mysore sandalwood, atlas cedar, and cashmeran.',
      images: [
        { url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1200&auto=format&fit=crop', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop', isPrimary: false, displayOrder: 2 },
      ],
      notesRelations: [
        { noteName: 'Cracked Cardamom', type: 'TOP', order: 1 },
        { noteName: 'Mysore Sandalwood', type: 'HEART', order: 1 },
        { noteName: 'Bourbon Vanilla Bean', type: 'BASE', order: 1 },
      ],
    },
    {
      name: 'Ambre Céleste',
      slug: 'ambre-celeste',
      sku: 'FRG-EXT-003',
      shortDescription: 'Golden Moroccan Labdanum & Royal Siam Benzoin',
      description: 'A radiant golden hour captured in obsidian glass. Golden labdanum resin melts over royal benzoin and dark honeycomb, infused with toasted coriander and warm almond blossoms.',
      price: 290,
      salePrice: 260,
      currency: 'USD',
      size: '100 ml / 3.4 FL. OZ.',
      stockQuantity: 9,
      status: 'ACTIVE',
      featured: true,
      newArrival: true,
      collectionId: colOrient.id,
      topNotes: JSON.stringify(['Calabrian Bergamot', 'Cracked Cardamom']),
      heartNotes: JSON.stringify(['Moroccan Labdanum', 'Siam Benzoin']),
      baseNotes: JSON.stringify(['Bourbon Vanilla Bean', 'Cambodian Agarwood (Oud)']),
      baseDescription: 'Golden labdanum resin, royal benzoin tears, and dark honeycomb.',
      images: [
        { url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1200&auto=format&fit=crop', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=1200&auto=format&fit=crop', isPrimary: false, displayOrder: 2 },
      ],
      notesRelations: [
        { noteName: 'Calabrian Bergamot', type: 'TOP', order: 1 },
        { noteName: 'Moroccan Labdanum', type: 'HEART', order: 1 },
        { noteName: 'Siam Benzoin', type: 'HEART', order: 2 },
        { noteName: 'Bourbon Vanilla Bean', type: 'BASE', order: 1 },
      ],
    },
    {
      name: 'Rose Velours',
      slug: 'rose-velours',
      sku: 'FRG-EXT-004',
      shortDescription: 'Midnight Damask Rose, Suede & Black Pepper',
      description: 'A nocturnal velvet rose stripped of innocence. Crimson Damask petals dipped in black pepper, Turkish coffee, and dark Indonesian patchouli, settling into warm Tuscan suede.',
      price: 310,
      salePrice: null,
      currency: 'USD',
      size: '100 ml / 3.4 FL. OZ.',
      stockQuantity: 12,
      status: 'ACTIVE',
      featured: true,
      newArrival: false,
      collectionId: colNocturne.id,
      topNotes: JSON.stringify(['Calabrian Bergamot', 'Cracked Cardamom']),
      heartNotes: JSON.stringify(['Taif Rose Absolu']),
      baseNotes: JSON.stringify(['Tuscan Suede Accord', 'Bourbon Vanilla Bean']),
      baseDescription: 'Midnight crimson rose, dark patchouli, and Tuscan suede.',
      images: [
        { url: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=1200&auto=format&fit=crop', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1200&auto=format&fit=crop', isPrimary: false, displayOrder: 2 },
      ],
      notesRelations: [
        { noteName: 'Taif Rose Absolu', type: 'HEART', order: 1 },
        { noteName: 'Tuscan Suede Accord', type: 'BASE', order: 1 },
      ],
    },
    {
      name: 'Cuir Tabac',
      slug: 'cuir-tabac',
      sku: 'FRG-EXT-005',
      shortDescription: 'Havana Blonde Leaf, Vintage Cognac & Smoked Cacao',
      description: 'The aroma of private members’ clubs and antique leather armchairs. Cured blonde tobacco leaves steeped in oak-barrel cognac, sweetened with dried prune and smoked Venezuelan cacao.',
      price: 350,
      salePrice: null,
      currency: 'USD',
      size: '100 ml / 3.4 FL. OZ.',
      stockQuantity: 7,
      status: 'ACTIVE',
      featured: true,
      newArrival: false,
      collectionId: colPrivate.id,
      topNotes: JSON.stringify(['Cracked Cardamom']),
      heartNotes: JSON.stringify(['Blonde Tobacco Leaf']),
      baseNotes: JSON.stringify(['Tuscan Suede Accord', 'Smoked Incense']),
      baseDescription: 'Aged blonde tobacco leaf, oak cognac barrel, and smoky styrax.',
      images: [
        { url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1200&auto=format&fit=crop', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=1200&auto=format&fit=crop', isPrimary: false, displayOrder: 2 },
      ],
      notesRelations: [
        { noteName: 'Blonde Tobacco Leaf', type: 'HEART', order: 1 },
        { noteName: 'Tuscan Suede Accord', type: 'BASE', order: 1 },
      ],
    },
    {
      name: 'Iris d’Or',
      slug: 'iris-dor',
      sku: 'FRG-EXT-006',
      shortDescription: 'Florentine Pallida Iris Butter & White Cashmere',
      description: 'Three-year aged Florentine iris pallida butter. Powdery yet luminous, wrapped in sparkling champagne aldehydes, almond milk, and golden ambroxan. Pure couture perfumery.',
      price: 380,
      salePrice: null,
      currency: 'USD',
      size: '100 ml / 3.4 FL. OZ.',
      stockQuantity: 8,
      status: 'ACTIVE',
      featured: false,
      newArrival: true,
      collectionId: colOrient.id,
      topNotes: JSON.stringify(['Calabrian Bergamot']),
      heartNotes: JSON.stringify(['Florentine Iris Pallida']),
      baseNotes: JSON.stringify(['Bourbon Vanilla Bean']),
      baseDescription: 'Three-year aged Florentine iris pallida butter and white cashmere.',
      images: [
        { url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=1200&auto=format&fit=crop', isPrimary: true, displayOrder: 1 },
      ],
      notesRelations: [
        { noteName: 'Florentine Iris Pallida', type: 'HEART', order: 1 },
      ],
    },
    {
      name: 'Vétiver Solaire',
      slug: 'vetiver-solaire',
      sku: 'FRG-EXT-007',
      shortDescription: 'Sun-Bleached Haitian Vetiver & Green Bergamot',
      description: 'Earth washed in radiant golden light. Smoky, mineral roots of Haitian vetiver sharpened by green bergamot zest and warm Mediterranean sun-salt.',
      price: 280,
      salePrice: 245,
      currency: 'USD',
      size: '100 ml / 3.4 FL. OZ.',
      stockQuantity: 16,
      status: 'ACTIVE',
      featured: false,
      newArrival: false,
      collectionId: colPrivate.id,
      topNotes: JSON.stringify(['Calabrian Bergamot']),
      heartNotes: JSON.stringify(['Haitian Vetiver Coeur']),
      baseNotes: JSON.stringify(['Smoked Incense']),
      baseDescription: 'Haitian vetiver roots, mineral ambergris, and sun-salt.',
      images: [
        { url: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=1200&auto=format&fit=crop', isPrimary: true, displayOrder: 1 },
      ],
      notesRelations: [
        { noteName: 'Calabrian Bergamot', type: 'TOP', order: 1 },
        { noteName: 'Haitian Vetiver Coeur', type: 'HEART', order: 1 },
      ],
    },
    {
      name: 'Néroli Renaissance',
      slug: 'neroli-renaissance',
      sku: 'FRG-EXT-008',
      shortDescription: 'Tunisian Orange Blossom & Solar Amber Crystal',
      description: 'The architecture of a Mediterranean dawn. Dew-kissed Tunisian orange blossoms electrified with candied citron rind and anchored in deep crystalline amber.',
      price: 295,
      salePrice: null,
      currency: 'USD',
      size: '100 ml / 3.4 FL. OZ.',
      stockQuantity: 11,
      status: 'ACTIVE',
      featured: false,
      newArrival: false,
      collectionId: colOrient.id,
      topNotes: JSON.stringify(['Calabrian Bergamot']),
      heartNotes: JSON.stringify(['Tunisian Orange Blossom']),
      baseNotes: JSON.stringify(['Moroccan Labdanum']),
      baseDescription: 'Orange blossom absolute, crystalline solar molecules, and milky sandalwood.',
      images: [
        { url: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?q=80&w=1200&auto=format&fit=crop', isPrimary: true, displayOrder: 1 },
      ],
      notesRelations: [
        { noteName: 'Tunisian Orange Blossom', type: 'HEART', order: 1 },
      ],
    },
    {
      name: 'Abrar',
      slug: 'abrar',
      sku: 'FRG-EXT-009',
      shortDescription: 'Golden Cambodian Amber, Royal Saffron & White Musk',
      description: 'Abrar is a majestic tribute to sovereign warmth and noble radiance. Macerated for 180 days with select harvest Cambodian amber resin, golden Spanish saffron stigma, and sheer celestial white musk, it leaves an indelible trail of quiet power.',
      price: 380,
      salePrice: 340,
      currency: 'USD',
      size: '100 ml / 3.4 FL. OZ.',
      stockQuantity: 12,
      status: 'ACTIVE',
      featured: true,
      newArrival: true,
      collectionId: colOrient.id,
      topNotes: JSON.stringify(['Golden Saffron', 'Italian Bergamot', 'Nutmeg']),
      heartNotes: JSON.stringify(['Damascus Rose', 'Smoked Incense', 'Ambergris Accord']),
      baseNotes: JSON.stringify(['Cambodian Amber', 'White Musk', 'Cedarwood']),
      baseDescription: 'Golden amber resin, celestial white musk, and aged Atlas cedarwood.',
      images: [
        { url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop', isPrimary: true, displayOrder: 1 },
        { url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1200&auto=format&fit=crop', isPrimary: false, displayOrder: 2 },
      ],
      notesRelations: [
        { noteName: 'Calabrian Bergamot', type: 'TOP', order: 1 },
        { noteName: 'Moroccan Labdanum', type: 'HEART', order: 1 },
        { noteName: 'Bourbon Vanilla Bean', type: 'BASE', order: 1 },
      ],
    },
    {
      name: 'Solstice Privé',
      slug: 'solstice-prive',
      sku: 'FRG-EXT-010',
      shortDescription: 'Vintage 2021 Maceration & Taif Rose Absolu',
      description: 'An ultra-limited vintage distillation reserved exclusively for private patronage. All flacons from this harvest are currently claimed in our vault.',
      price: 450,
      salePrice: null,
      currency: 'USD',
      size: '100 ml / 3.4 FL. OZ.',
      stockQuantity: 0, // OUT OF STOCK
      status: 'ACTIVE',
      featured: false,
      newArrival: false,
      collectionId: colPrivate.id,
      topNotes: JSON.stringify(['Taif Rose Absolu', 'Pink Pepper']),
      heartNotes: JSON.stringify(['Cambodian Agarwood (Oud)', 'Smoked Incense']),
      baseNotes: JSON.stringify(['Mysore Sandalwood', 'Grey Ambergris']),
      baseDescription: 'Aged Taif rose, smoked incense, and vintage grey ambergris.',
      images: [
        { url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=1200&auto=format&fit=crop', isPrimary: true, displayOrder: 1 },
      ],
      notesRelations: [
        { noteName: 'Taif Rose Absolu', type: 'TOP', order: 1 },
        { noteName: 'Cambodian Agarwood (Oud)', type: 'HEART', order: 1 },
        { noteName: 'Mysore Sandalwood', type: 'BASE', order: 1 },
      ],
    },
  ];

  const createdProductsMap: Record<string, any> = {};

  for (const p of productsToCreate) {
    const { images, notesRelations, ...prodFields } = p;

    const createdProduct = await prisma.product.create({
      data: {
        ...prodFields,
        images: {
          create: images.map((img) => ({
            url: img.url,
            altText: `${p.name} Bottle`,
            isPrimary: img.isPrimary,
            displayOrder: img.displayOrder,
          })),
        },
        inventory: {
          create: {
            quantity: p.stockQuantity,
            reservedQuantity: 0,
            lowStockThreshold: 5,
            allowBackorder: false,
            batchNumber: `BAT-${new Date().getFullYear()}-${p.sku.split('-')[2]}`,
          },
        },
      },
    });

    createdProductsMap[p.slug] = createdProduct;

    // Attach ProductNote relations
    for (const nr of notesRelations) {
      const fNoteId = noteMap[nr.noteName];
      if (fNoteId) {
        await prisma.productNote.create({
          data: {
            productId: createdProduct.id,
            fragranceNoteId: fNoteId,
            noteType: nr.type,
            displayOrder: nr.order,
          },
        });
      }
    }
  }
  console.log(`Created ${productsToCreate.length} products with Inventory, Images, and ProductNotes.`);

  // 7. Seed Coupons
  const coupon1 = await prisma.coupon.create({
    data: {
      code: 'MAISON10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 250,
      isActive: true,
      usedCount: 3,
    },
  });

  const coupon2 = await prisma.coupon.create({
    data: {
      code: 'PRIVATERESERVE',
      discountType: 'FIXED_AMOUNT',
      discountValue: 50,
      minOrderAmount: 500,
      isActive: true,
      usedCount: 1,
    },
  });

  // 8. Seed Carts & CartItems
  const cart1 = await prisma.cart.create({
    data: {
      userId: customerUser1.id,
      status: 'ACTIVE',
      giftWrap: true,
      sampleChoices: 'Oud Nocturne (2ml Vial), Santal Impérial (2ml Vial)',
      couponId: coupon1.id,
      items: {
        create: [
          {
            productId: createdProductsMap['oud-nocturne'].id,
            size: '100 ml / 3.4 FL. OZ.',
            quantity: 1,
            unitPrice: 340,
          },
        ],
      },
    },
  });

  // 9. Seed Orders, OrderItems, Payments, and Shipping
  const pOud = createdProductsMap['oud-nocturne'];
  const pCuir = createdProductsMap['cuir-tabac'];

  if (customer1.addresses[0]) {
    const order1 = await prisma.order.create({
      data: {
        orderNumber: 'FRG-2026-8841',
        userId: customerUser1.id,
        customerId: customer1.id,
        customerEmail: customer1.email,
        customerName: `${customer1.firstName} ${customer1.lastName}`,
        shippingAddressId: customer1.addresses[0].id,
        billingAddressId: customer1.addresses[0].id,
        status: 'DELIVERED',
        currency: 'USD',
        subtotal: 690,
        discountAmount: 0,
        shippingFee: 0,
        taxAmount: 0,
        total: 690,
        giftWrap: true,
        sampleChoices: 'Rose Velours (2ml), Santal Impérial (2ml)',
        specialInstructions: 'Please leave with concierge.',
        items: {
          create: [
            {
              productId: pOud.id,
              productName: pOud.name,
              productSku: pOud.sku,
              productImage: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200',
              size: pOud.size,
              unitPrice: pOud.price,
              quantity: 1,
              totalPrice: pOud.price,
            },
            {
              productId: pCuir.id,
              productName: pCuir.name,
              productSku: pCuir.sku,
              productImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1200',
              size: pCuir.size,
              unitPrice: pCuir.price,
              quantity: 1,
              totalPrice: pCuir.price,
            },
          ],
        },
        payments: {
          create: [
            {
              amount: 690,
              currency: 'USD',
              paymentMethod: 'CREDIT_CARD',
              status: 'CAPTURED',
              transactionId: 'TXN-FRG-984102',
            },
          ],
        },
        shipment: {
          create: {
            carrier: 'White-Glove Private Courier',
            trackingNumber: 'WG-LON-992140',
            trackingUrl: 'https://courier.fragrea.com/track/WG-LON-992140',
            status: 'DELIVERED',
            dispatchedAt: new Date(Date.now() - 86400000 * 3),
            deliveredAt: new Date(),
          },
        },
      },
    });
    console.log(`Created Order ${order1.orderNumber} with Payment & Shipping.`);
  }

  console.log('Database seeded with all 17 models successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
