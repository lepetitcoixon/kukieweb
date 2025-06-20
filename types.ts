
export type Allergen = 'gluten' | 'dairy' | 'nuts' | 'sugar' | 'eggs';
export type SubscriptionFrequency = 'weekly' | 'bi-weekly' | 'monthly';

export interface CustomizationOption {
  id: string;
  label: string;
  appliesTo: Allergen;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  imageUrl: string;
  defaultAllergens: Allergen[];
  availableCustomizations: Allergen[];
  category: string;
  productType?: 'cookie' | 'subscription';
}

export interface CartItemType {
  product: Product;
  quantity: number;
  selectedCustomizations: Allergen[];
  subscriptionFrequency?: SubscriptionFrequency;
  assignedToCustomer?: string; // New: For pickup points to assign items to specific end customers
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  address?: string; // This can serve as the Pickup Point's address if they are one
  isAdmin?: boolean;
  isPickupPoint?: boolean; // New: Identifies a pickup point user
  pickupPointName?: string; // New: Official name of the pickup point (e.g., "Kiosko Amara")
}

export type OrderStatus =
  | "Pendiente (Procesamiento desde Lunes)"
  | "Procesando"
  | "Listo para Recoger" // Original: Ready for pickup from Kukie's main location / by delivery
  | "Enviado"
  | "Completado"
  | "Cancelado"
  | "Subscription Active"
  | "Subscription Cancelled"
  | "En Punto de Recogida" // New: Order has arrived at the designated third-party pickup point
  | "Listo para Recoger por Cliente Final" // New: Pickup point has marked the order ready for the end customer
  | "Recogido por Cliente Final"; // New: End customer has collected the order from the pickup point

export interface Order {
  id: string;
  userId?: string; // The user who PLACED the order (could be customer or pickup point user)
  items: CartItemType[];
  totalAmount: number;
  customerDetails: CustomerDetails; // Details of who is paying / initiating the order. If pickup, name/email is customer, address is pickup point.
  orderDate: Date;
  status?: OrderStatus;
  isPickupOrder?: boolean; // New: True if this order is for pickup at a designated point
  pickupPointId?: string; // New: User ID of the selected pickup point user
  endCustomerName?: string; // New: Name of the end customer if a pickup point places an order on their behalf
}

export interface CustomerDetails { // Remains as is, contextually used.
  name: string;
  email: string;
  address: string; // If pickup order, this will be the pickup point's address.
  phone?: string;
}

export interface CartContextType {
  cartItems: CartItemType[];
  addToCart: (product: Product, quantity: number, customizations: Allergen[], subscriptionFrequency?: SubscriptionFrequency) => void;
  removeFromCart: (productId: string, customizations: Allergen[], subscriptionFrequency?: SubscriptionFrequency) => void;
  updateQuantity: (productId: string, customizations: Allergen[], quantity: number, subscriptionFrequency?: SubscriptionFrequency) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  // Register can now optionally include pickupPointName to directly register a pickup point.
  register: (name: string, email: string, password: string, pickupPointName?: string, address?: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: () => boolean;
  isPickupPointUser: () => boolean; // New: Checks if the current logged-in user is a pickup point
  updateUser: (userId: string, updatedUserData: Partial<Omit<User, 'id' | 'password'>>) => Promise<boolean>; // New: For admin/profile updates (e.g. setting isPickupPoint)
  getAllUsers: () => User[]; // New: Utility to get all users, e.g., for listing pickup points
}

export interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  getProductById: (productId: string) => Product | undefined;
}
