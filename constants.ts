
import { Product, Allergen, CustomizationOption, OrderStatus } from './types';

export const APP_NAME = "KUKIE";
export const APP_SLOGAN = "GALLETAS CASERAS";
export const CONTACT_INFO = {
  instagram: "@Etxekokukie",
  phone: "659 804 940",
};

export const ALLERGEN_DETAILS: Record<Allergen, { label: string, icon?: string }> = {
  gluten: { label: "Gluten" },
  dairy: { label: "Lácteos" },
  nuts: { label: "Frutos secos" },
  sugar: { label: "Azúcar" },
  eggs: { label: "Huevos" },
};

export const CUSTOMIZATION_OPTIONS: CustomizationOption[] = [
  { id: 'gluten-toggle', label: 'Opción Con/Sin Gluten', appliesTo: 'gluten' },
  { id: 'dairy-free', label: 'Hacer Sin Lácteos', appliesTo: 'dairy' },
  { id: 'nut-free', label: 'Hacer Sin Frutos Secos', appliesTo: 'nuts' },
  { id: 'sugar-free', label: 'Hacer Sin Azúcar', appliesTo: 'sugar' },
  { id: 'eggs-free', label: 'Hacer Sin Huevos', appliesTo: 'eggs' },
];


export const INITIAL_PRODUCTS_DATA: Product[] = ([
  {
    id: 'sub001',
    name: 'Kukie Box Suscripción',
    description: 'Recibe una selección sorpresa de galletas y novedades cada periodo. ¡Siempre sin gluten!',
    longDescription: 'Disfruta de la comodidad de Kukie Box. Cada periodo seleccionado (semanal, quincenal o mensual), recibe un pedido valorado en 10€ con una deliciosa mezcla de nuestras galletas más populares y creaciones exclusivas, ¡directo a tu puerta! Todas nuestras suscripciones son 100% sin gluten y puedes personalizarlas para otros alérgenos (lácteos, frutos secos, azúcar, huevos).',
    price: 10.00,
    imageUrl: 'https://picsum.photos/seed/kukiesubbox/600/400', 
    defaultAllergens: [], 
    availableCustomizations: ['dairy', 'nuts', 'sugar', 'eggs'], 
    category: 'Suscripciones',
    productType: 'subscription',
  },
  {
    id: '1',
    name: 'Classic Chocolate Chip',
    description: 'Timeless classic, soft and chewy, packed with chocolate chips.',
    longDescription: 'Our Classic Chocolate Chip cookie is a throwback to childhood joy. Made with premium chocolate chunks and a hint of vanilla, each bite is a perfect balance of sweetness and rich cocoa. Perfect with a glass of milk!',
    price: 2.50,
    imageUrl: 'https://picsum.photos/seed/kukiechoco1/600/400',
    defaultAllergens: ['dairy', 'eggs'],
    availableCustomizations: ['gluten', 'dairy', 'sugar', 'eggs'],
    category: 'Classics',
    productType: 'cookie',
  },
  {
    id: '2',
    name: 'Oatmeal Raisin Delight',
    description: 'Hearty oats and sweet raisins in a perfectly spiced cookie.',
    longDescription: 'A wholesome favorite, our Oatmeal Raisin cookies are soft, chewy, and spiced with cinnamon and nutmeg. Plump raisins and hearty rolled oats make this a truly satisfying treat.',
    price: 2.75,
    imageUrl: 'https://picsum.photos/seed/kukieoats/600/400',
    defaultAllergens: ['eggs'],
    availableCustomizations: ['gluten', 'sugar', 'eggs'],
    category: 'Classics',
    productType: 'cookie',
  },
  {
    id: '3',
    name: 'Velvet Peanut Butter',
    description: 'Rich, creamy peanut butter goodness in every bite.',
    longDescription: 'Indulge in the ultimate peanut butter experience. These cookies are incredibly soft and bursting with roasted peanut flavor, a true delight for peanut butter lovers.',
    price: 3.00,
    imageUrl: 'https://picsum.photos/seed/kukiepeanut/600/400',
    defaultAllergens: ['dairy', 'eggs', 'nuts'],
    availableCustomizations: ['gluten', 'dairy', 'sugar', 'eggs'],
    category: 'Specialty',
    productType: 'cookie',
  },
  {
    id: '4',
    name: 'Double Chocolate Fudge',
    description: 'An intense chocolate experience for the true chocoholic.',
    longDescription: 'Dive into a deep, dark chocolate dream. Our Double Chocolate Fudge cookies are made with cocoa powder and loaded with dark chocolate chunks for an irresistibly rich and decadent treat.',
    price: 3.25,
    imageUrl: 'https://picsum.photos/seed/kukiedoublechoco/600/400',
    defaultAllergens: ['dairy', 'eggs'],
    availableCustomizations: ['gluten', 'dairy', 'sugar', 'eggs'],
    category: 'Specialty',
    productType: 'cookie',
  },
  {
    id: '5',
    name: 'Lemon Zest Shortbread',
    description: 'Buttery shortbread infused with bright lemon zest.',
    longDescription: 'A light and refreshing treat, our Lemon Zest Shortbread cookies are crumbly, buttery, and infused with fresh lemon zest for a delightful citrusy note. Perfect with tea.',
    price: 2.80,
    imageUrl: 'https://picsum.photos/seed/kukielemon/600/400',
    defaultAllergens: ['dairy'],
    availableCustomizations: ['gluten', 'dairy', 'sugar', 'eggs'],
    category: 'Seasonal',
    productType: 'cookie',
  },
   {
    id: '6',
    name: 'Ginger Snap Sparkle',
    description: 'Crisp, spicy, and perfectly sweet ginger snaps.',
    longDescription: 'Experience the warm embrace of ginger, cinnamon, and molasses in our Ginger Snap Sparkle cookies. These thin and crispy cookies are full of flavor and have a delightful sugary crunch.',
    price: 2.60,
    imageUrl: 'https://picsum.photos/seed/kukieginger/600/400',
    defaultAllergens: ['eggs'],
    availableCustomizations: ['gluten', 'sugar', 'eggs'],
    category: 'Seasonal',
    productType: 'cookie',
  }
] as Product[]).map(product => {
  if (product.productType !== 'subscription') {
    product.defaultAllergens = product.defaultAllergens.filter(allergen => allergen !== 'gluten');
    if (!product.availableCustomizations.includes('gluten')) {
      product.availableCustomizations.push('gluten');
    }
  }
  if (!product.availableCustomizations.includes('eggs') && product.id !== 'sub001') { 
      product.availableCustomizations.push('eggs');
  }
  return product;
});

export const ALL_ALLERGENS: Allergen[] = ['gluten', 'dairy', 'nuts', 'sugar', 'eggs'];
export const PRODUCT_CATEGORIES: string[] = ['Suscripciones', 'Classics', 'Specialty', 'Seasonal', 'Vegan', 'Other'];

export const ALL_ORDER_STATUSES: OrderStatus[] = [
  "Pendiente (Procesamiento desde Lunes)",
  "Procesando",
  "Listo para Recoger",
  "Enviado",
  "Completado",
  "Cancelado",
  "Subscription Active",
  "Subscription Cancelled",
  "En Punto de Recogida",
  "Listo para Recoger por Cliente Final",
  "Recogido por Cliente Final"
];
