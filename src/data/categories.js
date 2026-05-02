export const categoryStructure = {
  'Women': {
    width: 'w-[1000px]',
    gridCols: 'grid-cols-5',
    image: '/shawl.png',
    sections: [
      { title: 'Winterwear', items: ['Sweaters', 'Ponchos', 'Caps, Hats, Beanies', 'Neckwarmers', 'Mufflers', 'Socks'] },
      { title: 'Beachwear', items: ['Bralettes', 'Cover Ups', 'Sarongs'] },
      { title: 'Resortwear', items: ['Crochet Tops', 'Dresses', 'Co-ord Sets', 'Crochet Shorts', 'Crochet Skirts', 'Jeans'] },
      { title: 'Accessories', items: ['Earrings', 'Bracelets', 'Crochet Scarf', 'Neckwarmers', 'Macrame Belts', 'Socks'] },
      { title: 'Bags', items: ['Crochet Handbags', 'Tote Bags', 'Sling Bags', 'Clutches'] }
    ]
  },
  'Kids': {
    width: 'w-[800px]',
    gridCols: 'grid-cols-4',
    image: '/item4.png',
    sections: [
      { title: 'Clothing', items: ['Handmade Sweaters', 'Frocks', 'Poncho', 'Vests', 'Rompers / Jumpsuits', 'Winterwear Sets'] },
      { title: 'Girls (2-12Y)', items: ['Crochet Tops', 'Casual Dresses', 'Co-ords', 'Party Dresses', 'Ethnic Wear'] },
      { title: 'Accessories', items: ['Booties', 'Cap Mitten Set', 'Caps', 'Mufflers', 'Headband', 'Socks', 'Hair Accessories'] },
      { title: 'Photoprops', items: ['Mermaid', 'Beach Theme', 'Jungle Theme', 'Christmas Theme', 'Sports'] }
    ]
  },
  'Men': {
    width: 'w-[900px]',
    gridCols: 'grid-cols-4',
    image: '/item4.png', // Placeholder or use a real one if available
    sections: [
      { title: 'Winterwear', items: ['Sweaters', 'Cardigans', 'Vests', 'Hoodies', 'Jackets', 'Coats'] },
      { title: 'Topwear', items: ['Handmade Shirts', 'Pullovers', 'Knitted Tees'] },
      { title: 'Accessories', items: ['Mufflers', 'Caps & Beanies', 'Handmade Gloves', 'Woolen Socks', 'Neck Warmers', 'Belts'] },
      { title: 'Gifting', items: ['Gift Sets', 'Winter Combos'] }
    ]
  },
  'Bookey': {
    width: 'w-[500px]',
    gridCols: 'grid-cols-2',
    image: '/bookey.png',
    sections: [
      { title: 'Floral', items: ['Rose Bouquets', 'Tulip Bouquets', 'Sunflower Bouquets', 'Lavender Bunches'] },
      { title: 'Occasions', items: ['Birthday Special', 'Anniversary'] }
    ]
  },
  'Laddu Gopal': {
    width: 'w-[400px]',
    gridCols: 'grid-cols-1',
    image: '/item4.png',
    sections: [
      { title: 'Collection', items: ['Handmade Dresses', 'Mukut & Shringar', 'Bedding & Pillows'] }
    ]
  },
  'Yarn': {
    width: 'w-[400px]',
    gridCols: 'grid-cols-1',
    image: '/yarn.png',
    sections: [
      { title: 'Collection', items: ['Organic Woolen Yarn', 'Cotton Yarn', 'Milk Cotton Yarn'] }
    ]
  },
};

export const navLinks = [
  { name: 'Women', path: '/shop?category=Women' },
  { name: 'Kids', path: '/shop?category=Kids' },
  { name: 'Men', path: '/shop?category=Men' },
  { name: 'Bookey', path: '/shop?category=Bookey' },
  { name: 'Laddu Gopal', path: '/shop?category=Laddu Gopal' },
  { name: 'Yarn', path: '/shop?category=Yarn' },
];
