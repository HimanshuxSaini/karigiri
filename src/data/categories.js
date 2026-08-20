export const categoryStructure = {
  'Women': {
    width: 'w-[90vw] lg:w-max max-w-[90vw]',
    gridCols: 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    position: 'left-0',
    image: '/shawl.webp',
    sections: [
      { title: 'Winterwear', items: ['Sweaters', 'Ponchos', 'Caps, Hats, Beanies', 'Neckwarmers', 'Mufflers', 'Socks'] },
      { title: 'Beachwear', items: ['Bralettes', 'Cover Ups', 'Sarongs'] },
      { title: 'Resortwear', items: ['Crochet Tops', 'Dresses', 'Co-ord Sets', 'Crochet Shorts', 'Crochet Skirts', 'Jeans'] },
      { title: 'Accessories', items: ['Earrings', 'Bracelets', 'Crochet Scarf', 'Neckwarmers', 'Macrame Belts', 'Socks'] },
      { title: 'Bags', items: ['Crochet Handbags', 'Tote Bags', 'Sling Bags', 'Clutches'] }
    ]
  },
  'Kids': {
    width: 'w-[90vw] lg:w-max max-w-[90vw]',
    gridCols: 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    position: 'left-0 lg:-left-10 xl:left-0',
    image: '/item4.webp',
    sections: [
      { title: 'Clothing', items: ['Handmade Sweaters', 'Frocks', 'Poncho', 'Vests', 'Rompers / Jumpsuits', 'Winterwear Sets'] },
      { title: 'Girls (2-12Y)', items: ['Crochet Tops', 'Casual Dresses', 'Co-ords', 'Party Dresses', 'Ethnic Wear'] },
      { title: 'Accessories', items: ['Booties', 'Cap Mitten Set', 'Caps', 'Mufflers', 'Headband', 'Socks', 'Hair Accessories'] },
      { title: 'Photoprops', items: ['Mermaid', 'Beach Theme', 'Jungle Theme', 'Christmas Theme', 'Sports'] }
    ]
  },
  'Men': {
    width: 'w-[90vw] lg:w-max max-w-[90vw]',
    gridCols: 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    position: 'left-0 lg:left-1/2 lg:-translate-x-1/2',
    image: '/item4.webp', // Placeholder or use a real one if available
    sections: [
      { title: 'Winterwear', items: ['Sweaters'] },
      { title: 'Topwear', items: ['Handmade Shirts', 'Pullovers', 'Knitted Tees'] },
      { title: 'Accessories', items: ['Mufflers', 'Caps & Beanies', 'Handmade Gloves', 'Woolen Socks', 'Neck Warmers', 'Belts'] },
      { title: 'Gifting', items: ['Gift Sets', 'Winter Combos'] }
    ]
  },
  'Bouquet': {
    width: 'w-[90vw] lg:w-max max-w-[90vw]',
    gridCols: 'grid-cols-2',
    position: 'left-0 lg:left-1/2 lg:-translate-x-1/2 xl:-translate-x-1/4',
    image: '/bookey.webp',
    sections: [
      { title: 'Floral', items: ['Rose Bouquets', 'Tulip Bouquets', 'Sunflower Bouquets', 'Lavender Bunches'] },
      { title: 'Occasions', items: ['Birthday Special', 'Anniversary'] }
    ]
  },
  'Laddu Gopal': {
    width: 'w-[90vw] lg:w-max max-w-[90vw]',
    gridCols: 'grid-cols-1 lg:grid-cols-1',
    position: 'right-0',
    image: '/item4.webp',
    sections: [
      { title: 'Collection', items: ['Handmade Dresses', 'Mukut & Shringar', 'Bedding & Pillows'] }
    ]
  },
  'Yarn': {
    width: 'w-[90vw] lg:w-max max-w-[90vw]',
    gridCols: 'grid-cols-1 lg:grid-cols-1',
    position: 'right-0',
    image: '/yarn.webp',
    sections: [
      { title: 'Collection', items: ['Organic Woolen Yarn', 'Cotton Yarn', 'Milk Cotton Yarn'] }
    ]
  },
};

export const navLinks = [
  { name: 'Women', path: '/shop?category=Women' },
  { name: 'Kids', path: '/shop?category=Kids' },
  { name: 'Men', path: '/shop?category=Men' },
  { name: 'Bouquet', path: '/shop?category=Bouquet' },
  { name: 'Laddu Gopal', path: '/shop?category=Laddu Gopal' },
  { name: 'Yarn', path: '/shop?category=Yarn' },
];
