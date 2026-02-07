import type { Pin } from "./hero-types";



export const PINTEREST_RED = '#e17100';
export const PINTEREST_TEAL = '#008b7e';

const generatePins = (count: number, category: string): Pin[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${category}-${i}`,
    url: `https://picsum.photos/seed/${category}${i}/400/${300 + Math.floor(Math.random() * 300)}`,
    title: `${category} inspiration ${i}`,
    height: `${Math.floor(Math.random() * 200) + 200}px`,
    color: ['bg-red-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200'][Math.floor(Math.random() * 5)],
  }));
};

export const HERO_THEMES = [
  {
    keyword: 'gourmet burgers',
    color: 'text-[#fa5f2e]',
    mainImage: 'https://thumbs.dreamstime.com/z/mix-various-smoked-steak-ham-pork-american-style-salad-hot-spicy-foods-table-atmosphere-smoke-steaks-hams-porks-usa-bbq-148198493.jpg',
    subImage: 'https://t3.ftcdn.net/jpg/02/52/38/80/360_F_252388016_KjPnB9vglSCuUJAumCDNbmMzGdzPAucK.jpg',
    accent: '#fa5f2e'
  },
  {
    keyword: 'fresh salads',
    color: 'text-[#2a9d8f]',
    mainImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRrgURTITF4RiovkGBX5l408DE_YKeXBDLmQ&s',
    subImage: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&q=80&w=400',
    accent: '#2a9d8f'
  },
  {
    keyword: 'decadent desserts',
    color: 'text-[#f4a261]',
    mainImage: 'https://i.guim.co.uk/img/media/f2ad41e23600d764f27bd365dab1488a5589f242/0_3593_6732_4039/master/6732.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=5047c77fb44965a7d269db52330977ac',
    subImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyaALzFvS2SDkjupyHRA2vzRAwp3zStER0fg&s',
    accent: '#f4a261'
  },
  {
    keyword: 'cozy brunch spots',
    color: 'text-[#264653]',
    mainImage: 'https://media.istockphoto.com/id/1457433817/photo/group-of-healthy-food-for-flexitarian-diet.jpg?s=612x612&w=0&k=20&c=v48RE0ZNWpMZOlSp13KdF1yFDmidorO2pZTu2Idmd3M=',
    subImage: 'https://img.freepik.com/free-psd/roasted-chicken-dinner-platter-delicious-feast_632498-25445.jpg?semt=ais_hybrid&w=740&q=80',
    accent: '#264653'
  }
];


export const EXPLORE_PINS = generatePins(10, 'explore');
