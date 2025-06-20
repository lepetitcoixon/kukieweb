
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useParams, useLocation, Outlet, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { INITIAL_PRODUCTS_DATA, CUSTOMIZATION_OPTIONS, ALLERGEN_DETAILS, ALL_ALLERGENS, PRODUCT_CATEGORIES, ALL_ORDER_STATUSES } from './constants';
import { Product, CartItemType, Allergen, CustomerDetails, Order, User, SubscriptionFrequency, OrderStatus } from './types';
import { CookieCard } from './components/CookieCard';
import { Button } from './components/ui/Button';
import { Modal } from './components/ui/Modal';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProductProvider, useProducts } from './context/ProductContext';
import { AllergenDisplay } from './components/ui/AllergenIcon';
import { CookieLogo } from './components/ui/CookieLogo';


// Helper: Product Detail Modal Content
const ProductDetailModalContent: React.FC<{ product: Product; onClose: () => void }> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<Allergen[]>([]);
  const [selectedFrequency, setSelectedFrequency] = useState<SubscriptionFrequency>('monthly');

  const isSubscription = product.productType === 'subscription';

  const handleCustomizationToggle = (optionAppliesTo: Allergen) => {
    setSelectedCustomizations(prev =>
      prev.includes(optionAppliesTo)
        ? prev.filter(c => c !== optionAppliesTo)
        : [...prev, optionAppliesTo]
    );
  };

  const handleAddToCart = () => {
    const q = isSubscription ? 1 : quantity;
    const freq = isSubscription ? selectedFrequency : undefined;
    addToCart(product, q, selectedCustomizations, freq);
    onClose();
  };
  
  const calculateResultingAllergensDisplay = (): { text: string, type: 'present' | 'customized-free' }[] => {
    if (isSubscription) {
        const displayItems: { text: string, type: 'customized-free' }[] = [
            { text: "Siempre Sin Gluten", type: 'customized-free' }
        ];
        selectedCustomizations.forEach(customSelected => {
            displayItems.push({ text: `Sin ${ALLERGEN_DETAILS[customSelected].label}`, type: 'customized-free' });
        });
        return displayItems;
    } else {
        let currentAllergens = [...product.defaultAllergens];
        selectedCustomizations.forEach(customSelected => {
            if (customSelected !== 'gluten' && product.availableCustomizations.includes(customSelected)) {
                currentAllergens = currentAllergens.filter(a => a !== customSelected);
            }
        });
        if (selectedCustomizations.includes('gluten')) { 
            if (!currentAllergens.includes('gluten')) {
                currentAllergens.push('gluten');
            }
        }
        return currentAllergens.map(allergen => ({ text: ALLERGEN_DETAILS[allergen].label, type: 'present' as 'present'}));
    }
  };
  
  const resultingAllergensForDisplay = calculateResultingAllergensDisplay();

  return (
    <div className="text-kukie-brown">
      <img src={product.imageUrl} alt={product.name} className="w-full h-48 sm:h-64 object-cover rounded-lg mb-4 shadow-md" />
      <h2 className="text-2xl sm:text-3xl font-bold text-kukie-brown mb-2">{product.name}</h2>
      <p className="text-kukie-light-brown mb-4 leading-relaxed text-sm sm:text-base">{product.longDescription}</p>
      
      {isSubscription && (
        <div className="mb-6">
          <h4 className="font-semibold mb-2 text-md sm:text-lg text-kukie-brown">Frecuencia de Entrega:</h4>
          {(['weekly', 'bi-weekly', 'monthly'] as SubscriptionFrequency[]).map(freq => (
            <label key={freq} className="flex items-center mb-1.5 p-2.5 bg-kukie-dark-beige text-kukie-brown rounded-md hover:bg-opacity-80 transition-colors cursor-pointer">
              <input
                type="radio"
                name="subscriptionFrequency"
                value={freq}
                checked={selectedFrequency === freq}
                onChange={() => setSelectedFrequency(freq)}
                className="h-4 w-4 text-kukie-yellow focus:ring-kukie-yellow border-kukie-light-brown"
              />
              <span className="ml-2.5 text-sm sm:text-base">
                {freq === 'weekly' ? 'Semanal' : freq === 'bi-weekly' ? 'Quincenal' : 'Mensual'}
              </span>
            </label>
          ))}
        </div>
      )}

      <div className="mb-6">
        <h4 className="font-semibold mb-2 text-md sm:text-lg text-kukie-brown">
          {isSubscription ? "Personaliza tu caja (Siempre Sin Gluten):" : "Personaliza tu galleta:"}
        </h4>
        {CUSTOMIZATION_OPTIONS
            .filter(opt => product.availableCustomizations.includes(opt.appliesTo))
            .filter(opt => !(isSubscription && opt.appliesTo === 'gluten')) 
            .map(option => {
                let customizationLabel = `Sin ${ALLERGEN_DETAILS[option.appliesTo].label}`;
                if (option.appliesTo === 'gluten' && !isSubscription) {
                    customizationLabel = `Con ${ALLERGEN_DETAILS[option.appliesTo].label}`;
                }
            return (
                <div key={option.id} className="flex items-center mb-2">
                <input
                    type="checkbox"
                    id={`custom-${option.id}-${product.id}`}
                    checked={selectedCustomizations.includes(option.appliesTo)}
                    onChange={() => handleCustomizationToggle(option.appliesTo)}
                    className="h-5 w-5 text-kukie-yellow border-kukie-light-brown rounded focus:ring-kukie-yellow focus:ring-2"
                />
                <label htmlFor={`custom-${option.id}-${product.id}`} className="ml-2.5 text-sm">
                    {customizationLabel}
                </label>
                </div>
            );
        })}
        {CUSTOMIZATION_OPTIONS.filter(opt => product.availableCustomizations.includes(opt.appliesTo)).length === 0 && (
            <p className="text-sm text-kukie-dark-beige italic">Esta galleta no tiene opciones de personalización de alérgenos.</p>
        )}
      </div>

       <div className="mb-6">
        <h4 className="font-semibold mb-2 text-md text-kukie-brown">
            {isSubscription ? "Tu caja será:" : "Alérgenos resultantes:"}
        </h4>
        <div className="flex flex-wrap">
            {resultingAllergensForDisplay.length > 0 ? (
                resultingAllergensForDisplay.map(item => (
                item.type === 'present' ?
                    <AllergenDisplay key={`resulting-${item.text}`} allergen={ALL_ALLERGENS.find(a => ALLERGEN_DETAILS[a].label === item.text)!} type="present" />
                    : <span key={`custom-${item.text}`} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full mr-1.5 mb-1.5 shadow-sm">{item.text}</span>
                ))
            ) : (
                <span className="text-sm text-green-600 italic">
                    {isSubscription ? "Sin Gluten (y sin otras restricciones seleccionadas)" : "Personalizada para estar libre de alérgenos comunes."}
                </span>
            )}
        </div>
      </div>

      <div className="text-center mb-4">
        <p className="text-3xl sm:text-4xl font-bold text-kukie-brown">
            ${product.price.toFixed(2)}
            {isSubscription && <span className="text-base sm:text-lg font-normal text-kukie-light-brown">/entrega</span>}
        </p>
      </div>
      
      {!isSubscription && (
        <div className="flex items-center justify-center mb-6 space-x-3 sm:space-x-4">
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                className="!px-3 !py-1 sm:!px-3.5 sm:!py-1.5 border-kukie-light-brown hover:bg-kukie-dark-beige text-lg sm:text-xl font-semibold text-kukie-brown rounded-md"
                aria-label="Disminuir cantidad"
            >
            -
            </Button>
            <span className="mx-2 sm:mx-4 text-lg sm:text-xl font-semibold text-kukie-brown tabular-nums">{quantity}</span>
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setQuantity(q => q + 1)} 
                className="!px-3 !py-1 sm:!px-3.5 sm:!py-1.5 border-kukie-light-brown hover:bg-kukie-dark-beige text-lg sm:text-xl font-semibold text-kukie-brown rounded-md"
                aria-label="Aumentar cantidad"
            >
            +
            </Button>
        </div>
      )}

      <Button onClick={handleAddToCart} variant="primary" size="lg" className="w-full shadow-md hover:shadow-lg transition-shadow">
        {isSubscription ? 'Suscribirme y Añadir al Carrito' : `Añadir ${quantity} al Carrito`}
      </Button>
    </div>
  );
};

// Helper function to calculate time remaining
const calculateTimeRemaining = (targetDate: Date) => {
  const now = new Date();
  const difference = targetDate.getTime() - now.getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isPast: false };
};

// OrderWindowCountdown component
const OrderWindowCountdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const currentDay = now.getDay(); 

      let targetDate: Date;
      if (currentDay >= 1 && currentDay <= 5) {
        setMessage('Tiempo restante para realizar pedidos esta semana:');
        targetDate = new Date(now);
        targetDate.setDate(now.getDate() + (5 - currentDay));
        targetDate.setHours(23, 59, 59, 999);
      } else { 
        setMessage('Los pedidos se abrirán de nuevo en:');
        targetDate = new Date(now);
        targetDate.setDate(now.getDate() + ((currentDay === 6) ? 2 : 1));
        targetDate.setHours(0, 0, 0, 0);
      }
      
      const remaining = calculateTimeRemaining(targetDate);
      if (remaining.isPast) setTimeLeft("0d 0h 0m 0s");
      else setTimeLeft(`${remaining.days}d ${remaining.hours}h ${remaining.minutes}m ${remaining.seconds}s`);
    };
    updateCountdown(); 
    const timerId = setInterval(updateCountdown, 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="my-6 p-4 bg-kukie-dark-beige text-kukie-brown rounded-lg shadow-md text-center">
      <p className="font-semibold text-md sm:text-lg mb-1">Horario de Pedidos: Lunes a Viernes</p>
      {message && <p className="text-sm mb-2">{message}</p>}
      {timeLeft ? <p className="text-xl sm:text-2xl font-bold text-kukie-yellow tracking-wider">{timeLeft}</p> : <p className="text-xl sm:text-2xl font-bold text-kukie-yellow tracking-wider">Calculando...</p>}
    </div>
  );
};

// Helper function to calculate next delivery date for subscriptions
const calculateNextDeliveryDate = (startDate: Date, frequency: SubscriptionFrequency): Date => {
  let nextDelivery = new Date(startDate); 
  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  const advanceByFrequency = (date: Date, freq: SubscriptionFrequency): Date => {
    const newDate = new Date(date);
    switch (freq) {
      case 'weekly': newDate.setDate(newDate.getDate() + 7); break;
      case 'bi-weekly': newDate.setDate(newDate.getDate() + 14); break;
      case 'monthly': newDate.setMonth(newDate.getMonth() + 1); break;
    }
    return newDate;
  };

  if (nextDelivery > today) {
    return nextDelivery;
  }

  while (nextDelivery <= today) {
    nextDelivery = advanceByFrequency(nextDelivery, frequency);
  }
  return nextDelivery;
};


// Page Components
const HomePage: React.FC = () => (
  <div className="text-center py-6 sm:py-10">
    <CookieLogo className="mx-auto mb-6 sm:mb-8 text-kukie-yellow animate-pulse" width="120" height="120" chipColor="rgba(93,84,76,0.5)" biteColor="#FAF0E6"/>
    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-kukie-brown mb-3 sm:mb-4">¡Bienvenido a Kukie!</h1>
    <OrderWindowCountdown />
    <p className="text-md sm:text-lg lg:text-xl text-kukie-light-brown mb-6 sm:mb-8 max-w-xl lg:max-w-2xl mx-auto">
      Deliciosas galletas caseras, elaboradas con amor y los mejores ingredientes. ¡Explora nuestro catálogo y personaliza tus dulces para que sean aptos para alérgenos!
    </p>
    <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
      <Link to="/catalog">
        <Button variant="primary" size="lg" className="shadow-lg transform hover:scale-105 text-base sm:text-lg">
          Explora Nuestras Galletas
        </Button>
      </Link>
    </div>
     <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
        <div className="bg-kukie-light-brown p-4 sm:p-6 rounded-lg text-kukie-beige shadow-md">
            <h3 className="text-lg sm:text-xl font-semibold text-kukie-yellow mb-2">Recién Horneadas</h3>
            <p className="text-sm">Cada galleta se hornea por encargo, garantizando la máxima frescura y sabor.</p>
        </div>
        <div className="bg-kukie-light-brown p-4 sm:p-6 rounded-lg text-kukie-beige shadow-md">
            <h3 className="text-lg sm:text-xl font-semibold text-kukie-yellow mb-2">Apto para Alérgenos</h3>
            <p className="text-sm">Personaliza tus galletas: opciones con gluten, sin lácteos, sin azúcar y sin frutos secos disponibles.</p>
        </div>
        <div className="bg-kukie-light-brown p-4 sm:p-6 rounded-lg text-kukie-beige shadow-md">
            <h3 className="text-lg sm:text-xl font-semibold text-kukie-yellow mb-2">Ingredientes de Calidad</h3>
            <p className="text-sm">Utilizamos solo los mejores ingredientes para crear nuestras deliciosas galletas.</p>
        </div>
    </div>
  </div>
);

const CatalogPage: React.FC = () => {
  const { products, isLoading: isLoadingProducts } = useProducts();
  const [selectedCookie, setSelectedCookie] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...PRODUCT_CATEGORIES.filter(cat => products.some(p => p.category === cat))];
  const translatedCategories = categories.map(category => {
    if (category === 'All') return 'Todas';
    if (category === 'Suscripciones') return 'Suscripciones';
    return category;
  });

  const filteredCookies = products.filter(cookie => {
    const matchesSearch = cookie.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cookie.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || cookie.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoadingProducts) {
    return <p className="text-center text-lg sm:text-xl text-kukie-light-brown py-10">Cargando catálogo...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-kukie-brown mb-6 sm:mb-8 text-center">Nuestras Deliciosas Galletas</h1>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center">
        <input 
          type="text"
          placeholder="Buscar galletas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 sm:px-4 sm:py-2 border border-kukie-light-brown rounded-lg focus:ring-kukie-yellow focus:border-kukie-yellow w-full sm:w-auto text-sm sm:text-base"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 sm:px-4 sm:py-2.5 border border-kukie-light-brown rounded-lg focus:ring-kukie-yellow focus:border-kukie-yellow bg-white w-full sm:w-auto text-sm sm:text-base"
        >
          {categories.map((category, index) => (
            <option key={category} value={category}>{translatedCategories[index]}</option>
          ))}
        </select>
      </div>

      {filteredCookies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {filteredCookies.map((cookie, index, arr) => {
            const isFirstOverallSubscription = products.length > 0 && products[0].id === cookie.id && cookie.productType === 'subscription';
            const shouldSpan = isFirstOverallSubscription && (selectedCategory === 'All' || selectedCategory === 'Suscripciones') && index === 0 ;

            return (
              <div 
                key={cookie.id} 
                className={ shouldSpan ? 'md:col-span-2 lg:col-span-2' : '' }
              >
                <CookieCard 
                    cookie={cookie} 
                    onViewDetails={setSelectedCookie} 
                />
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-kukie-light-brown text-lg sm:text-xl col-span-full">
          Ninguna galleta coincide con tus criterios. ¡Intenta ajustar tu búsqueda o filtros!
        </p>
      )}

      {selectedCookie && (
        <Modal isOpen={!!selectedCookie} onClose={() => setSelectedCookie(null)} title={selectedCookie.productType === 'subscription' ? 'Configura tu Suscripción' : "Personaliza Tu Galleta"} size="lg">
          <ProductDetailModalContent product={selectedCookie} onClose={() => setSelectedCookie(null)} />
        </Modal>
      )}
    </div>
  );
};

const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-kukie-brown mb-4">Tu Carrito está Vacío</h1>
        <p className="text-kukie-light-brown mb-6 text-sm sm:text-base">¡Parece que aún no has añadido ninguna galleta!</p>
        <Link to="/catalog">
          <Button variant="primary" size="lg">Ver Galletas</Button>
        </Link>
      </div>
    );
  }

  const getCustomizationLabel = (allergen: Allergen, productType?: 'cookie' | 'subscription') => {
    if (allergen === 'gluten') {
        return productType === 'subscription' ? 'Siempre Sin Gluten' : `Con ${ALLERGEN_DETAILS[allergen].label}`;
    }
    return `Sin ${ALLERGEN_DETAILS[allergen].label}`;
  };

  const getFrequencyLabel = (frequency?: SubscriptionFrequency) => {
    if (!frequency) return '';
    switch (frequency) {
      case 'weekly': return 'Semanal';
      case 'bi-weekly': return 'Quincenal';
      case 'monthly': return 'Mensual';
      default: return '';
    }
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-kukie-brown mb-6 sm:mb-8">Tu Carrito de Compras</h1>
      <div className="space-y-4 sm:space-y-6">
        {cartItems.map(item => (
          <div key={`${item.product.id}-${item.selectedCustomizations.sort().join('-')}-${item.subscriptionFrequency || ''}-${item.assignedToCustomer || ''}`} className="bg-kukie-light-brown text-kukie-beige p-3 sm:p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <img src={item.product.imageUrl} alt={item.product.name} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md flex-shrink-0"/>
              <div className="flex-grow">
                <h2 className="text-lg sm:text-xl font-semibold text-kukie-yellow">{item.product.name}</h2>
                <p className="text-xs sm:text-sm text-kukie-dark-beige">${item.product.price.toFixed(2)} {item.product.productType === 'subscription' ? '/entrega' : 'c/u'}</p>
                {item.subscriptionFrequency && (
                    <span className="text-xs bg-purple-500 text-white px-1.5 py-0.5 rounded-full mr-1">
                        Frecuencia: {getFrequencyLabel(item.subscriptionFrequency)}
                    </span>
                )}
                {item.product.productType === 'subscription' && (
                    <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full mr-1 mb-1">
                        Siempre Sin Gluten
                    </span>
                )}
                {item.selectedCustomizations.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.selectedCustomizations.map(custom => (
                       <span key={custom} className="text-xs bg-kukie-yellow text-kukie-brown px-1.5 py-0.5 rounded-full">
                         {getCustomizationLabel(custom, item.product.productType)}
                       </span>
                    ))}
                  </div>
                )}
                 {item.assignedToCustomer && (
                    <p className="text-xs mt-1 text-kukie-dark-beige italic">Para: {item.assignedToCustomer}</p>
                 )}
              </div>
            </div>
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3 w-full sm:w-auto mt-2 sm:mt-0">
              {item.product.productType !== 'subscription' && (
                <div className="flex items-center justify-between xs:justify-start">
                  <Button variant="ghost" size="sm" onClick={() => updateQuantity(item.product.id, item.selectedCustomizations, item.quantity - 1, item.subscriptionFrequency)} className="text-kukie-beige hover:bg-kukie-brown !px-2.5 !py-1">-</Button>
                  <span className="mx-2 sm:mx-3 text-md sm:text-lg">{item.quantity}</span>
                  <Button variant="ghost" size="sm" onClick={() => updateQuantity(item.product.id, item.selectedCustomizations, item.quantity + 1, item.subscriptionFrequency)} className="text-kukie-beige hover:bg-kukie-brown !px-2.5 !py-1">+</Button>
                </div>
              )}
              {item.product.productType === 'subscription' && (
                 <span className="mx-2 sm:mx-3 text-md sm:text-lg">Cant: {item.quantity}</span>
              )}
              <p className="text-md sm:text-lg font-semibold text-kukie-yellow w-full xs:w-20 text-right xs:text-center mt-1 xs:mt-0">${(item.product.price * item.quantity).toFixed(2)}</p>
              <Button variant="outline" size="sm" onClick={() => removeFromCart(item.product.id, item.selectedCustomizations, item.subscriptionFrequency)} className="border-red-400 text-red-400 hover:bg-red-400 hover:text-kukie-beige !py-1">
                Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-kukie-light-brown flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-bold text-kukie-brown">Total: ${getTotalPrice().toFixed(2)}</h2>
        <Button variant="primary" size="lg" onClick={() => navigate('/checkout')} className="w-full sm:w-auto">
          Proceder al Pago
        </Button>
      </div>
    </div>
  );
};

const CheckoutPage: React.FC = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { currentUser, getAllUsers } = useAuth();
  const navigate = useNavigate();
  
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({ name: '', email: '', address: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'revolut'>('cod');
  const [deliveryMethod, setDeliveryMethod] = useState<'home' | 'pickup'>('home');
  const [availablePickupPoints, setAvailablePickupPoints] = useState<User[]>([]);
  const [selectedPickupPointId, setSelectedPickupPointId] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string>('');
  const [isOrderWindowCurrentlyOpen, setIsOrderWindowCurrentlyOpen] = useState(true); 

  useEffect(() => {
    const now = new Date();
    const currentDay = now.getDay(); 
    setIsOrderWindowCurrentlyOpen(!(currentDay === 0 || currentDay === 6));

    const allUsers = getAllUsers();
    setAvailablePickupPoints(allUsers.filter(user => user.isPickupPoint && user.address));
  }, [getAllUsers]);

  useEffect(() => {
    if (currentUser) {
      setCustomerDetails(prev => ({ 
        ...prev, 
        name: currentUser.name || '', 
        email: currentUser.email || '', 
        // Only set address from currentUser if it's home delivery or no specific pickup point address logic yet
        address: deliveryMethod === 'home' && currentUser.address ? currentUser.address : prev.address 
      }));
    }
  }, [currentUser, deliveryMethod]);

  useEffect(() => {
    if (cartItems.length === 0 && !isSubmitting) navigate('/catalog');
  }, [cartItems, navigate, isSubmitting]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentMethod(e.target.value as 'cod' | 'revolut');
    setPaymentError('');
  };

  const handleDeliveryMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMethod = e.target.value as 'home' | 'pickup';
    setDeliveryMethod(newMethod);
    if (newMethod === 'home' && currentUser?.address) {
      setCustomerDetails(prev => ({ ...prev, address: currentUser.address || '' }));
      setSelectedPickupPointId('');
    } else if (newMethod === 'pickup') {
      setCustomerDetails(prev => ({ ...prev, address: '' })); // Clear address for pickup, will be set by selected point
    }
  };

  const handlePickupPointChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pointId = e.target.value;
    setSelectedPickupPointId(pointId);
    const selectedPoint = availablePickupPoints.find(p => p.id === pointId);
    if (selectedPoint?.address) {
      setCustomerDetails(prev => ({ ...prev, address: selectedPoint.address! }));
    }
  };
  
  const completeOrderProcessing = (isSuccess: boolean) => {
    if (!isSuccess) { setIsSubmitting(false); return; }
    const orderId = `KUKIE-${Date.now()}`;
    
    const hasSubscriptionItem = cartItems.some(item => item.product.productType === 'subscription');
    let orderStatus: OrderStatus = "Procesando";
    if (hasSubscriptionItem) {
      orderStatus = "Subscription Active";
    } else if (!isOrderWindowCurrentlyOpen) {
      orderStatus = "Pendiente (Procesamiento desde Lunes)";
    }
    
    // If pickup order, and the one placing the order is a pickup point themselves ordering for an end customer,
    // this logic is handled in the PickupDashboard's order placement.
    // This CheckoutPage is for regular customers or pickup points ordering for themselves.
    const finalCustomerDetails = {...customerDetails};
    if (deliveryMethod === 'pickup' && selectedPickupPointId) {
        const point = availablePickupPoints.find(p => p.id === selectedPickupPointId);
        if (point?.address) finalCustomerDetails.address = point.address;
    }


    const orderData: Order = { 
        id: orderId, 
        userId: currentUser?.id, 
        items: cartItems, 
        totalAmount: getTotalPrice(), 
        customerDetails: finalCustomerDetails, 
        orderDate: new Date(), 
        status: orderStatus,
        isPickupOrder: deliveryMethod === 'pickup',
        pickupPointId: deliveryMethod === 'pickup' ? selectedPickupPointId : undefined,
        // endCustomerName is set if a pickup point is ordering FOR a customer, handled in pickup dashboard
    };

    const allOrders = JSON.parse(localStorage.getItem('allKukieOrders') || '[]') as Order[];
    allOrders.push(orderData);
    localStorage.setItem('allKukieOrders', JSON.stringify(allOrders));
    setTimeout(() => { clearCart(); navigate('/confirmation', { state: { order: orderData } }); }, 1000);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerDetails.name || !customerDetails.email) {
        setPaymentError("Por favor, complete nombre y email."); return;
    }
    if (deliveryMethod === 'home' && !customerDetails.address) {
        setPaymentError("Por favor, ingrese su dirección de entrega."); return;
    }
    if (deliveryMethod === 'pickup' && !selectedPickupPointId) {
        setPaymentError("Por favor, seleccione un punto de recogida."); return;
    }
    setIsSubmitting(true); setPaymentError('');
    if (paymentMethod === 'cod') completeOrderProcessing(true); 
    else if (paymentMethod === 'revolut') {
      setTimeout(() => {
        const isRevolutPaymentSuccessful = true; 
        if (isRevolutPaymentSuccessful) completeOrderProcessing(true);
        else { setPaymentError("El pago simulado con Revolut falló."); completeOrderProcessing(false); }
      }, 2000);
    }
  };

  if (cartItems.length === 0 && !isSubmitting) return <div className="text-center py-10"><h1 className="text-2xl">Tu carrito está vacío. Redirigiendo...</h1></div>;
  
  const getButtonText = () => isSubmitting ? (paymentMethod === 'revolut' ? 'Procesando con Revolut...' : 'Procesando Pedido...') : 'Realizar Pedido';

  const getFrequencyLabelCheckout = (frequency?: SubscriptionFrequency) => {
    if (!frequency) return '';
    switch (frequency) {
      case 'weekly': return ' (Semanal)';
      case 'bi-weekly': return ' (Quincenal)';
      case 'monthly': return ' (Mensual)';
      default: return '';
    }
  };


  return (
    <div className="max-w-xl lg:max-w-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-kukie-brown mb-6 sm:mb-8 text-center">Finalizar Compra</h1>
      {!isOrderWindowCurrentlyOpen && !cartItems.some(item => item.product.productType === 'subscription') && (
         <div className="mb-6 p-3 sm:p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md text-center">
            <p className="font-semibold text-sm sm:text-base">Aviso sobre Horario de Procesamiento</p>
            <p className="text-xs sm:text-sm">Nuestro horario de procesamiento de pedidos es de Lunes a Viernes. Puedes realizar tu pedido ahora; se registrará y comenzaremos a procesarlo el próximo Lunes.</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-kukie-light-brown text-kukie-beige p-4 sm:p-6 lg:p-8 rounded-lg shadow-xl space-y-4 sm:space-y-6">
        {['name', 'email'].map(field => (
          <div key={field}>
            <label htmlFor={field} className="block text-xs sm:text-sm font-medium text-kukie-dark-beige">{field === 'name' ? 'Nombre Completo' : 'Dirección de Email'}</label>
            <input type={field === 'email' ? 'email' : 'text'} name={field} id={field} required value={customerDetails[field as keyof Omit<CustomerDetails, 'address'|'phone'>]} onChange={handleChange} className="mt-1 block w-full input-style"/>
          </div>
        ))}

        <div className="border-t border-kukie-dark-beige pt-4 sm:pt-6">
            <h3 className="text-md sm:text-lg font-semibold text-kukie-dark-beige mb-2 sm:mb-3">Método de Entrega</h3>
            <div className="space-y-2">
                <label className="flex items-center p-2.5 sm:p-3 bg-kukie-beige text-kukie-brown rounded-md hover:bg-kukie-dark-beige transition-colors cursor-pointer">
                    <input type="radio" name="deliveryMethod" value="home" checked={deliveryMethod === 'home'} onChange={handleDeliveryMethodChange} className="h-4 w-4 text-kukie-yellow focus:ring-kukie-yellow border-kukie-brown"/>
                    <span className="ml-2 sm:ml-3 text-xs sm:text-sm font-medium">Entrega a Domicilio</span>
                </label>
                <label className="flex items-center p-2.5 sm:p-3 bg-kukie-beige text-kukie-brown rounded-md hover:bg-kukie-dark-beige transition-colors cursor-pointer">
                    <input type="radio" name="deliveryMethod" value="pickup" checked={deliveryMethod === 'pickup'} onChange={handleDeliveryMethodChange} className="h-4 w-4 text-kukie-yellow focus:ring-kukie-yellow border-kukie-brown"/>
                    <span className="ml-2 sm:ml-3 text-xs sm:text-sm font-medium">Recoger en Punto Autorizado</span>
                </label>
            </div>
        </div>
        
        {deliveryMethod === 'home' && (
            <div>
            <label htmlFor="address" className="block text-xs sm:text-sm font-medium text-kukie-dark-beige">Dirección de Entrega</label>
            <textarea name="address" id="address" rows={3} required={deliveryMethod === 'home'} value={customerDetails.address} onChange={handleChange} className="mt-1 block w-full input-style"></textarea>
            </div>
        )}

        {deliveryMethod === 'pickup' && (
            <div>
                <label htmlFor="pickupPoint" className="block text-xs sm:text-sm font-medium text-kukie-dark-beige">Seleccionar Punto de Recogida</label>
                {availablePickupPoints.length > 0 ? (
                    <select name="pickupPoint" id="pickupPoint" value={selectedPickupPointId} onChange={handlePickupPointChange} required className="mt-1 block w-full input-style">
                        <option value="">-- Elija un punto --</option>
                        {availablePickupPoints.map(point => (
                            <option key={point.id} value={point.id}>{point.pickupPointName} ({point.address})</option>
                        ))}
                    </select>
                ) : <p className="text-xs text-kukie-dark-beige mt-1">No hay puntos de recogida disponibles actualmente.</p>}
            </div>
        )}

         <div>
          <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-kukie-dark-beige">Número de Teléfono (Opcional)</label>
          <input type="tel" name="phone" id="phone" value={customerDetails.phone || ''} onChange={handleChange} className="mt-1 block w-full input-style"/>
        </div>

        <div className="border-t border-kukie-dark-beige pt-4 sm:pt-6">
          <h3 className="text-md sm:text-lg font-semibold text-kukie-dark-beige mb-2 sm:mb-3">Método de Pago</h3>
          <div className="space-y-2">
            {[{value: 'cod', label: 'Pagar al Recibir/Recoger (Efectivo/Transferencia)'}, {value: 'revolut', label: 'Pagar con Revolut (Simulado)'}].map(opt => (
              <label key={opt.value} className="flex items-center p-2.5 sm:p-3 bg-kukie-beige text-kukie-brown rounded-md hover:bg-kukie-dark-beige transition-colors cursor-pointer">
                <input type="radio" name="paymentMethod" value={opt.value} checked={paymentMethod === opt.value} onChange={handlePaymentMethodChange} className="h-4 w-4 text-kukie-yellow focus:ring-kukie-yellow border-kukie-brown"/>
                <span className="ml-2 sm:ml-3 text-xs sm:text-sm font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
           {paymentError && <p className="mt-2 text-xs sm:text-sm text-red-400">{paymentError}</p>}
        </div>
        <div className="border-t border-kukie-dark-beige pt-4 sm:pt-6">
          <h3 className="text-lg sm:text-xl font-semibold text-kukie-yellow mb-2">Resumen del Pedido</h3>
          {cartItems.map(item => ( <div key={`${item.product.id}-${item.selectedCustomizations.sort().join('-')}-${item.subscriptionFrequency || ''}`} className="flex justify-between text-xs sm:text-sm mb-1"><span>{item.product.name}{item.subscriptionFrequency ? getFrequencyLabelCheckout(item.subscriptionFrequency) : ''} (x{item.quantity})</span><span>${(item.product.price * item.quantity).toFixed(2)}</span></div> ))}
          <div className="flex justify-between font-bold text-md sm:text-lg mt-2 text-kukie-yellow"><span>Total:</span><span>${getTotalPrice().toFixed(2)}</span></div>
        </div>
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>{getButtonText()}</Button>
      </form>
      <style>{`.input-style { background-color: #FAF0E6; color: #5D544C; border: 1px solid #DCD0C0; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); padding: 0.5rem 0.75rem; font-size: 0.875rem; line-height: 1.25rem; } .input-style:focus { outline: none; box-shadow: 0 0 0 2px #DAB13B; border-color: #DAB13B; } `}</style>
    </div>
  );
};

const ConfirmationPage: React.FC = () => {
  const location = useLocation();
  const { getAllUsers } = useAuth();
  const typedState = location.state as { order: Order } | null;
  const finalOrder: Order | undefined = typedState?.order;
  const [pickupPointDetails, setPickupPointDetails] = useState<User | null>(null);

  useEffect(() => {
    if (finalOrder?.isPickupOrder && finalOrder.pickupPointId) {
      const users = getAllUsers();
      const point = users.find(u => u.id === finalOrder.pickupPointId);
      if (point) setPickupPointDetails(point);
    }
  }, [finalOrder, getAllUsers]);

  if (!finalOrder) return (
    <div className="text-center py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-kukie-brown mb-4">Error en la Confirmación</h1>
      <p className="text-kukie-light-brown mb-6 text-sm sm:text-base">No se pudieron encontrar los detalles de tu pedido.</p>
      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4"><Link to="/"><Button variant="primary" size="lg">Ir a Inicio</Button></Link><Link to="/catalog"><Button variant="secondary" size="lg">Seguir Comprando</Button></Link></div>
    </div>
  );

  const getFrequencyLabelConfirm = (frequency?: SubscriptionFrequency) => {
    if (!frequency) return '';
    switch (frequency) {
      case 'weekly': return ' (Semanal)';
      case 'bi-weekly': return ' (Quincenal)';
      case 'monthly': return ' (Mensual)';
      default: return '';
    }
  };

  return (
    <div className="text-center py-8 sm:py-10 max-w-md lg:max-w-lg mx-auto bg-kukie-light-brown text-kukie-beige p-6 sm:p-8 rounded-xl shadow-2xl">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 text-kukie-yellow mx-auto mb-3 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <h1 className="text-2xl sm:text-3xl font-bold text-kukie-yellow mb-2 sm:mb-3">¡Gracias Por Tu Pedido!</h1>
      <p className="text-kukie-dark-beige mb-1 sm:mb-2 text-sm sm:text-base">Tu pedido <span className="font-semibold text-kukie-yellow">#{finalOrder.id.substring(finalOrder.id.length-6)}</span> se ha realizado con éxito.</p>
      <p className="text-kukie-dark-beige mb-1 text-sm sm:text-base">Estado del pedido: <span className="font-semibold text-yellow-300">{finalOrder.status || "Procesando"}</span>.</p>
      {finalOrder.isPickupOrder && pickupPointDetails && (
        <div className="my-3 p-3 bg-kukie-brown rounded-md">
            <p className="text-sm font-semibold text-kukie-yellow">Recogerás tu pedido en:</p>
            <p className="text-xs">{pickupPointDetails.pickupPointName}</p>
            <p className="text-xs">{pickupPointDetails.address}</p>
        </div>
      )}
      {finalOrder.endCustomerName && (
        <p className="text-kukie-dark-beige mb-1 text-sm sm:text-base">Pedido para: <span className="font-semibold">{finalOrder.endCustomerName}</span></p>
      )}
      <p className="text-kukie-dark-beige mb-4 sm:mb-6 text-xs sm:text-sm">Te notificaremos. Confirmación por email a <span className="font-semibold">{finalOrder.customerDetails.email}</span>.</p>
      <div className="text-left text-xs sm:text-sm mb-4 sm:mb-6 bg-kukie-brown p-3 sm:p-4 rounded-md">
        <h4 className="font-semibold text-kukie-yellow mb-1 sm:mb-2 text-sm sm:text-base">Resumen:</h4>
        {finalOrder.items.map((item: CartItemType) => (<p key={`${item.product.id}-${item.selectedCustomizations.sort().join('-')}-${item.subscriptionFrequency || ''}`} className="mb-0.5 sm:mb-1">{item.product.name}{getFrequencyLabelConfirm(item.subscriptionFrequency)} x {item.quantity} - ${(item.product.price * item.quantity).toFixed(2)} {item.assignedToCustomer ? `(Para: ${item.assignedToCustomer})` : ''}</p>))}
        <p className="font-bold mt-1 sm:mt-2 text-kukie-yellow">Total: ${finalOrder.totalAmount.toFixed(2)}</p>
      </div>
      <Link to="/catalog"><Button variant="primary" size="lg">Seguir Comprando</Button></Link>
    </div>
  );
};

const LoginPage: React.FC = () => {
  const { login, isLoading, error: authError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError(null);
    if (!email || !password) { setFormError('Por favor, ingrese email y contraseña.'); return; }
    const success = await login(email, password);
    if (success) navigate('/profile'); // Will redirect to /pickup-dashboard if user is pickup point
    else setFormError(authError || 'Fallo al iniciar sesión.');
  };

  return (
    <div className="max-w-md mx-auto mt-8 sm:mt-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-kukie-brown mb-6 sm:mb-8 text-center">Iniciar Sesión</h1>
      <form onSubmit={handleSubmit} className="bg-kukie-light-brown text-kukie-beige p-6 sm:p-8 rounded-lg shadow-xl space-y-4 sm:space-y-6">
        <div>
          <label htmlFor="email" className="text-sm sm:text-base">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full input-style"/>
        </div>
        <div>
          <label htmlFor="password" className="text-sm sm:text-base">Contraseña</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full input-style"/>
        </div>
        {formError && <p className="text-sm text-red-400">{formError}</p>}
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>{isLoading ? 'Iniciando...' : 'Iniciar Sesión'}</Button>
        <p className="text-xs sm:text-sm text-center">
          ¿No tienes cuenta? <Link to="/register" className="font-medium text-kukie-yellow hover:underline">Regístrate</Link>
        </p>
        <div className="text-center mt-3 pt-3 border-t border-kukie-dark-beige">
          <p className="text-xs sm:text-sm mb-2">¿Eres un punto de recogida?</p>
          <Link to="/register-pickup">
            <Button variant="secondary" size="md" className="w-full sm:w-auto">
              Registrar Punto de Recogida
            </Button>
          </Link>
        </div>
      </form>
      <style>{`.input-style { background-color: #FAF0E6; color: #5D544C; border: 1px solid #DCD0C0; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); padding: 0.5rem 0.75rem; font-size: 0.875rem; } .input-style:focus { outline: none; box-shadow: 0 0 0 2px #DAB13B; border-color: #DAB13B; } `}</style>
    </div>
  );
};

const RegisterPage: React.FC<{isPickupPointRegistration?: boolean}> = ({ isPickupPointRegistration }) => {
  const { register, isLoading, error: authError } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(''); 
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [pickupPointName, setPickupPointName] = useState('');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormError(null);
    if (!name || !email || !password || !confirmPassword) { setFormError('Complete todos los campos obligatorios.'); return; }
    if (isPickupPointRegistration && (!pickupPointName || !address)) { setFormError('Nombre del punto y dirección son obligatorios para puntos de recogida.'); return; }
    if (password !== confirmPassword) { setFormError('Las contraseñas no coinciden.'); return; }
    
    const success = await register(
        name, 
        email, 
        password, 
        isPickupPointRegistration ? pickupPointName : undefined,
        isPickupPointRegistration ? address : undefined
    );
    if (success) navigate(isPickupPointRegistration ? '/pickup-dashboard' : '/profile');
    else setFormError(authError || 'Fallo al registrarse.');
  };
  return ( <div className="max-w-md mx-auto mt-8 sm:mt-10"> <h1 className="text-2xl sm:text-3xl font-bold text-kukie-brown mb-6 sm:mb-8 text-center">{isPickupPointRegistration ? 'Registrar Punto de Recogida' : 'Crear Cuenta'}</h1> <form onSubmit={handleSubmit} className="bg-kukie-light-brown text-kukie-beige p-6 sm:p-8 rounded-lg shadow-xl space-y-4 sm:space-y-6"> <div><label htmlFor="name" className="text-sm sm:text-base">Tu Nombre (Contacto)</label><input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full input-style"/></div>
  {isPickupPointRegistration && <>
    <div><label htmlFor="pickupPointName" className="text-sm sm:text-base">Nombre del Punto de Recogida</label><input type="text" id="pickupPointName" value={pickupPointName} onChange={e => setPickupPointName(e.target.value)} required className="mt-1 block w-full input-style"/></div>
    <div><label htmlFor="address" className="text-sm sm:text-base">Dirección del Punto de Recogida</label><input type="text" id="address" value={address} onChange={e => setAddress(e.target.value)} required className="mt-1 block w-full input-style"/></div>
  </>}
  <div><label htmlFor="email" className="text-sm sm:text-base">Email de Contacto</label><input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full input-style"/></div> <div><label htmlFor="password" className="text-sm sm:text-base">Contraseña</label><input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full input-style"/></div> <div><label htmlFor="confirmPassword" className="text-sm sm:text-base">Confirmar Contraseña</label><input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 block w-full input-style"/></div> {formError && <p className="text-sm text-red-400">{formError}</p>} <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>{isLoading ? 'Registrando...' : (isPickupPointRegistration ? 'Registrar Punto' : 'Registrarse')}</Button> <p className="text-xs sm:text-sm text-center">¿Ya tienes cuenta? <Link to="/login" className="font-medium text-kukie-yellow hover:underline">Inicia sesión</Link></p> </form> <style>{`.input-style { background-color: #FAF0E6; color: #5D544C; border: 1px solid #DCD0C0; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); padding: 0.5rem 0.75rem; font-size: 0.875rem; } .input-style:focus { outline: none; box-shadow: 0 0 0 2px #DAB13B; border-color: #DAB13B; } `}</style> </div> );
};

const ProfilePage: React.FC = () => { // This page is now primarily for NON-pickup point users
  const { currentUser, logout, updateUser } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  
  const loadUserOrders = useCallback(() => {
    if (!currentUser) return;
    setIsLoadingOrders(true);
    setTimeout(() => { 
      const allOrders = JSON.parse(localStorage.getItem('allKukieOrders') || '[]') as Order[];
      const userOrders = allOrders
        .filter(o => o.userId === currentUser.id)
        .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
      setMyOrders(userOrders);

      const userActiveSubscriptions = userOrders.filter(order =>
        order.items.some(item => item.product.productType === 'subscription') &&
        order.status === "Subscription Active"
      );
      setActiveSubscriptions(userActiveSubscriptions);
      setIsLoadingOrders(false);
    }, 500);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else {
      loadUserOrders();
    }
  }, [currentUser, navigate, loadUserOrders]);

  const handleRepeatOrder = (order: Order) => {
    if (order.items.some(item => item.product.productType === 'subscription')) {
      alert("Para gestionar suscripciones, usa la sección 'Mis Suscripciones'.");
      return;
    }
    order.items.forEach(item => {
      addToCart(item.product, item.quantity, item.selectedCustomizations, item.subscriptionFrequency);
    });
    navigate('/cart');
  };

  const handleCancelSubscription = (orderId: string) => {
    if (!window.confirm("¿Estás seguro de que quieres cancelar esta suscripción?")) return;

    const allOrders = JSON.parse(localStorage.getItem('allKukieOrders') || '[]') as Order[];
    const updatedOrders = allOrders.map(order =>
      order.id === orderId ? { ...order, status: "Subscription Cancelled" as OrderStatus } : order
    );
    localStorage.setItem('allKukieOrders', JSON.stringify(updatedOrders));
    loadUserOrders(); 
    alert("Suscripción cancelada.");
  };
  
  const getCustomizationDisplay = (customization: Allergen, productType?: 'cookie' | 'subscription'): string => {
    if (customization === 'gluten') {
      return productType === 'subscription' ? 'Siempre Sin Gluten' : `Con ${ALLERGEN_DETAILS[customization].label}`;
    }
    return `Sin ${ALLERGEN_DETAILS[customization].label}`;
  };
  
  const getFrequencyDisplay = (frequency?: SubscriptionFrequency): string => {
    if (!frequency) return '';
    switch(frequency) {
        case 'weekly': return 'Semanal';
        case 'bi-weekly': return 'Quincenal';
        case 'monthly': return 'Mensual';
        default: return '';
    }
  }

  if (!currentUser) return null; 

  return (
    <div className="max-w-xl lg:max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-kukie-brown">Mi Cuenta</h1>
        <Button onClick={() => { logout(); navigate('/'); }} variant="outline" size="sm">Cerrar Sesión</Button>
      </div>
      <div className="bg-kukie-light-brown text-kukie-beige p-4 sm:p-6 rounded-lg shadow-xl mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-kukie-yellow mb-2 sm:mb-3">Detalles</h2>
        <p className="text-sm sm:text-base"><strong>Nombre:</strong> {currentUser.name}</p>
        <p className="text-sm sm:text-base"><strong>Email:</strong> {currentUser.email}</p>
         {currentUser.address && ( // Regular users might have an address
             <p className="text-sm sm:text-base"><strong>Dirección:</strong> {currentUser.address}</p>
         )}
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-kukie-brown mb-4 sm:mb-6">Mis Suscripciones Activas</h2>
      {isLoadingOrders ? ( <p className="text-kukie-light-brown">Cargando suscripciones...</p> ) : activeSubscriptions.length === 0 ? ( <div className="bg-kukie-light-brown text-kukie-beige p-6 rounded-lg shadow-xl text-center"> <p className="text-md sm:text-lg mb-4">No tienes suscripciones activas.</p> <Link to="/catalog"> <Button variant="primary">Explorar Suscripciones</Button> </Link> </div> ) : ( <div className="space-y-4"> {activeSubscriptions.map(order => { const subscriptionItem = order.items.find(item => item.product.productType === 'subscription'); if (!subscriptionItem || !subscriptionItem.subscriptionFrequency) return null; const nextDelivery = calculateNextDeliveryDate(new Date(order.orderDate), subscriptionItem.subscriptionFrequency); return ( <div key={order.id} className="bg-kukie-light-brown text-kukie-beige p-3 sm:p-4 rounded-lg shadow-md"> <h3 className="text-md sm:text-lg font-semibold text-kukie-yellow">{subscriptionItem.product.name}</h3> <p className="text-xs sm:text-sm">Frecuencia: {getFrequencyDisplay(subscriptionItem.subscriptionFrequency)}</p> <p className="text-xs sm:text-sm">Próxima entrega: {nextDelivery.toLocaleDateString()}</p> <p className="text-xs sm:text-sm">Iniciada el: {new Date(order.orderDate).toLocaleDateString()}</p> <div className="mt-3"> <Button onClick={() => handleCancelSubscription(order.id)} variant="outline" size="sm" className="!border-red-400 !text-red-400 hover:!bg-red-400 hover:!text-kukie-beige"> Cancelar Suscripción </Button> </div> </div> ); })} </div> )}

      <h2 className="text-xl sm:text-2xl font-bold text-kukie-brown mb-4 sm:mb-6 mt-8 sm:mt-10">Historial de Pedidos</h2>
      {isLoadingOrders ? ( <p className="text-kukie-light-brown">Cargando tus pedidos...</p> ) : myOrders.filter(o => o.status !== "Subscription Active").length === 0 && activeSubscriptions.length === 0 ? ( <div className="bg-kukie-light-brown text-kukie-beige p-6 rounded-lg shadow-xl text-center"> <p className="text-md sm:text-lg mb-4">Aún no has realizado ningún pedido que no sea una suscripción activa.</p> <Link to="/catalog"> <Button variant="primary">Explorar Galletas</Button> </Link> </div> ) : ( <div className="space-y-4"> {myOrders.filter(o => o.status !== "Subscription Active" && o.status !== "Subscription Cancelled").map(order => ( <div key={order.id} className="bg-kukie-light-brown text-kukie-beige p-3 sm:p-4 rounded-lg shadow-md"> <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center"> <div> <h3 className="text-md sm:text-lg font-semibold text-kukie-yellow">Pedido #{order.id.substring(order.id.length - 6)}</h3> <p className="text-xs sm:text-sm">Fecha: {new Date(order.orderDate).toLocaleDateString()}</p> <p className="text-xs sm:text-sm">Estado: <span className="font-medium text-yellow-300">{order.status || "Procesando"}</span></p> </div> <p className="text-md sm:text-lg font-bold mt-2 sm:mt-0">${order.totalAmount.toFixed(2)}</p> </div> <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-kukie-dark-beige"> <h4 className="text-xs sm:text-sm font-semibold mb-1">Artículos:</h4> <ul className="list-disc list-inside text-xs space-y-0.5"> {order.items.map(item => ( <li key={`${item.product.id}-${item.selectedCustomizations.sort().join('-')}-${item.subscriptionFrequency || ''}`}> {item.product.name}{ getFrequencyDisplay(item.subscriptionFrequency)} (x{item.quantity}) {item.product.productType === 'subscription' && ( <span className="ml-1 text-gray-400">(Siempre Sin Gluten)</span> )} {item.selectedCustomizations.length > 0 && item.product.productType !== 'subscription' && ( <span className="ml-1 text-gray-400"> ({item.selectedCustomizations.map(c => getCustomizationDisplay(c, item.product.productType)).join(', ')}) </span> )} {item.selectedCustomizations.length > 0 && item.product.productType === 'subscription' && ( <span className="ml-1 text-gray-400"> (Personalizado: {item.selectedCustomizations.map(c => `Sin ${ALLERGEN_DETAILS[c].label}`).join(', ')}) </span> )} </li> ))} </ul> </div> {order.isPickupOrder && order.pickupPointId && ( <p className="text-xs mt-1 text-kukie-dark-beige">Recogida en: {currentUser?.isPickupPoint && currentUser.id === order.pickupPointId ? currentUser.pickupPointName : 'Punto Autorizado'}</p>)} {order.endCustomerName && (<p className="text-xs mt-1 text-kukie-dark-beige">Pedido para: {order.endCustomerName}</p>)} {!order.items.some(item => item.product.productType === 'subscription') && ( <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-kukie-dark-beige text-right"> <Button onClick={() => handleRepeatOrder(order)} variant="secondary" size="sm" > Repetir Pedido </Button> </div> )} </div> ))} {myOrders.filter(o => o.status === "Subscription Cancelled").length > 0 && ( <> <h3 className="text-lg font-semibold text-kukie-brown mt-6 mb-3">Suscripciones Canceladas</h3> {myOrders.filter(o => o.status === "Subscription Cancelled").map(order => ( <div key={order.id} className="bg-gray-700 text-gray-300 p-3 sm:p-4 rounded-lg shadow-md opacity-70"> <h3 className="text-md sm:text-lg font-semibold text-kukie-yellow">Suscripción #{order.id.substring(order.id.length - 6)} (Cancelada)</h3> <p className="text-xs sm:text-sm">Fecha de inicio: {new Date(order.orderDate).toLocaleDateString()}</p> <p className="text-xs sm:text-sm">Artículos: {order.items.map(i => `${i.product.name} ${getFrequencyDisplay(i.subscriptionFrequency)}`).join(', ')}</p> </div> ))} </> )} </div> )}
       <style>{`.input-style { background-color: #FAF0E6; color: #5D544C; border: 1px solid #DCD0C0; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); padding: 0.25rem 0.5rem; } .input-style:focus { outline: none; box-shadow: 0 0 0 2px #DAB13B; border-color: #DAB13B; } `}</style>
    </div>
  );
};

// Admin Components
const AdminRouteGuard: React.FC = () => {
  const { isAdmin, currentUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <p className="text-center text-xl py-10">Verificando acceso...</p>; 
  if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin()) return <Navigate to="/" state={{ from: location }} replace />;
  
  return <Outlet />;
};

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-kukie-dark-beige">
      <aside className="w-full md:w-64 bg-kukie-brown text-kukie-beige p-4 md:p-5 space-y-3 md:space-y-4 shadow-lg flex-shrink-0">
        <h2 className="text-xl md:text-2xl font-bold text-kukie-yellow mb-4 md:mb-6">Panel Admin</h2>
        <nav>
          <ul className="space-y-1">
            <li><Link to="/admin" className="block py-2 px-3 rounded hover:bg-kukie-light-brown transition-colors text-sm md:text-base">Dashboard</Link></li>
            <li><Link to="/admin/orders" className="block py-2 px-3 rounded hover:bg-kukie-light-brown transition-colors text-sm md:text-base">Pedidos</Link></li>
            <li><Link to="/admin/products" className="block py-2 px-3 rounded hover:bg-kukie-light-brown transition-colors text-sm md:text-base">Productos</Link></li>
            <li><Link to="/admin/subscriptions" className="block py-2 px-3 rounded hover:bg-kukie-light-brown transition-colors text-sm md:text-base">Suscripciones</Link></li>
            <li><Link to="/admin/users" className="block py-2 px-3 rounded hover:bg-kukie-light-brown transition-colors text-sm md:text-base">Usuarios</Link></li>
          </ul>
        </nav>
        <Button onClick={() => navigate('/')} variant="secondary" className="w-full mt-auto text-sm md:text-base">Volver a Tienda</Button>
      </aside>
      <main className="flex-grow p-4 md:p-6 lg:p-8 bg-kukie-beige text-kukie-brown overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

const AdminDashboardPage: React.FC = () => {
    const { products } = useProducts();
    const [orders, setOrders] = useState<Order[]>([]);
    const [activeSubscriptionsCount, setActiveSubscriptionsCount] = useState(0);

    useEffect(() => {
        const allOrders = JSON.parse(localStorage.getItem('allKukieOrders') || '[]') as Order[];
        setOrders(allOrders);
        const activeSubs = allOrders.filter(o => o.status === "Subscription Active").length;
        setActiveSubscriptionsCount(activeSubs);
    }, []);

    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-kukie-light-brown text-kukie-beige p-4 sm:p-6 rounded-lg shadow-md">
                    <h2 className="text-lg sm:text-xl font-semibold text-kukie-yellow mb-2">Total Productos</h2>
                    <p className="text-2xl sm:text-3xl font-bold">{products.length}</p>
                </div>
                <div className="bg-kukie-light-brown text-kukie-beige p-4 sm:p-6 rounded-lg shadow-md">
                    <h2 className="text-lg sm:text-xl font-semibold text-kukie-yellow mb-2">Total Pedidos Registrados</h2>
                    <p className="text-2xl sm:text-3xl font-bold">{orders.length}</p>
                </div>
                 <div className="bg-kukie-light-brown text-kukie-beige p-4 sm:p-6 rounded-lg shadow-md">
                    <h2 className="text-lg sm:text-xl font-semibold text-kukie-yellow mb-2">Suscripciones Activas</h2>
                    <p className="text-2xl sm:text-3xl font-bold">{activeSubscriptionsCount}</p>
                </div>
            </div>
        </div>
    );
};

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingStatus, setEditingStatus] = useState<OrderStatus | ''>('');
  const { getAllUsers } = useAuth(); // To get pickup point names

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const allOrders = JSON.parse(localStorage.getItem('allKukieOrders') || '[]') as Order[];
    setOrders(allOrders.sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
  };
  
  const handleUpdateStatus = (orderId: string) => {
    if (!selectedOrder || !editingStatus) return;
    const updatedOrders = orders.map(o => o.id === orderId ? {...o, status: editingStatus} : o);
    localStorage.setItem('allKukieOrders', JSON.stringify(updatedOrders));
    setOrders(updatedOrders); // Refresh local state
    setSelectedOrder(null); // Close modal
    setEditingStatus('');
  };

  const openEditModal = (order: Order) => {
    setSelectedOrder(order);
    setEditingStatus(order.status || 'Procesando');
  }

  const getPickupPointName = (pickupPointId?: string) => {
    if (!pickupPointId) return 'N/A';
    const users = getAllUsers();
    const point = users.find(u => u.id === pickupPointId);
    return point?.pickupPointName || point?.name || 'Punto Desconocido';
  };


  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Gestionar Pedidos</h1>
      {orders.length === 0 ? <p>No hay pedidos aún.</p> : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-kukie-light-brown text-kukie-beige">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider hidden md:table-cell">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider hidden lg:table-cell">Tipo/Punto Recogida</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-kukie-brown">
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="px-4 py-4 whitespace-nowrap text-xs sm:text-sm">#{order.id.slice(-6)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-xs sm:text-sm">
                    {order.customerDetails.name}
                    {order.endCustomerName && <span className="block text-xxs italic text-gray-500">Para: {order.endCustomerName}</span>}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-xs sm:text-sm hidden md:table-cell">{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-xs sm:text-sm">${order.totalAmount.toFixed(2)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-xs sm:text-sm">{order.status}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-xs sm:text-sm hidden lg:table-cell">
                    {order.isPickupOrder ? `Recogida (${getPickupPointName(order.pickupPointId)})` : 'Domicilio'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-xs sm:text-sm">
                    <Button onClick={() => openEditModal(order)} size="sm" variant="outline" className="!text-xs !px-2 !py-1">Cambiar Estado</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selectedOrder && (
        <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Editar Estado Pedido #${selectedOrder.id.slice(-6)}`} size="md">
            <div className="space-y-4 text-sm">
                <p><strong>Cliente:</strong> {selectedOrder.customerDetails.name} {selectedOrder.endCustomerName ? `(Para: ${selectedOrder.endCustomerName})` : ''}</p>
                <p><strong>Total:</strong> ${selectedOrder.totalAmount.toFixed(2)}</p>
                 {selectedOrder.isPickupOrder && <p><strong>Punto Recogida:</strong> {getPickupPointName(selectedOrder.pickupPointId)}</p>}
                <div>
                    <label htmlFor="status" className="block text-xs font-medium text-kukie-brown">Nuevo Estado:</label>
                    <select 
                        id="status" 
                        value={editingStatus} 
                        onChange={e => setEditingStatus(e.target.value as OrderStatus)} 
                        className="mt-1 block w-full input-style text-sm"
                    >
                        {ALL_ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <Button onClick={() => handleUpdateStatus(selectedOrder.id)} variant="primary" className="w-full text-sm">Actualizar Estado</Button>
            </div>
             <style>{`.input-style { background-color: #FAF0E6; color: #5D544C; border: 1px solid #DCD0C0; border-radius: 0.375rem; padding: 0.5rem 0.75rem; } `}</style>
        </Modal>
      )}
    </div>
  );
};

// Admin Users Page (Basic Structure)
const AdminUsersPage: React.FC = () => {
    const { getAllUsers, updateUser, isLoading: authLoading } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formIsPickupPoint, setFormIsPickupPoint] = useState(false);
    const [formPickupPointName, setFormPickupPointName] = useState('');
    const [formAddress, setFormAddress] = useState('');


    useEffect(() => {
        setUsers(getAllUsers());
    }, [getAllUsers]);

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setFormIsPickupPoint(user.isPickupPoint || false);
        setFormPickupPointName(user.pickupPointName || '');
        setFormAddress(user.address || '');
    };

    const handleSaveUser = async () => {
        if (!editingUser) return;
        const success = await updateUser(editingUser.id, {
            isPickupPoint: formIsPickupPoint,
            pickupPointName: formIsPickupPoint ? formPickupPointName : undefined,
            address: formAddress // Address can be updated for any user
        });
        if (success) {
            setUsers(getAllUsers()); // Refresh user list
            setEditingUser(null);
            alert('Usuario actualizado.');
        } else {
            alert('Error al actualizar usuario.');
        }
    };

    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Gestionar Usuarios</h1>
            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-kukie-light-brown text-kukie-beige">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase">Nombre</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase">Admin</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase">Punto Recogida</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-kukie-brown">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-4 py-4 whitespace-nowrap text-xs sm:text-sm">{user.name}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs sm:text-sm">{user.email}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs sm:text-sm">{user.isAdmin ? 'Sí' : 'No'}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs sm:text-sm">{user.isPickupPoint ? `Sí (${user.pickupPointName || 'Sin nombre'})` : 'No'}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs sm:text-sm">
                                    <Button onClick={() => handleEditUser(user)} size="sm" variant="outline" className="!text-xs">Editar</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {editingUser && (
                <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title={`Editar Usuario: ${editingUser.name}`} size="md">
                    <div className="space-y-4 text-sm text-kukie-brown">
                        <p><strong>Email:</strong> {editingUser.email}</p>
                        <div>
                            <label className="flex items-center">
                                <input type="checkbox" checked={formIsPickupPoint} onChange={(e) => setFormIsPickupPoint(e.target.checked)} className="form-checkbox h-4 w-4 text-kukie-yellow"/>
                                <span className="ml-2">Es Punto de Recogida</span>
                            </label>
                        </div>
                        {formIsPickupPoint && (
                            <div>
                                <label htmlFor="pickupName" className="block text-xs font-medium">Nombre del Punto de Recogida</label>
                                <input type="text" id="pickupName" value={formPickupPointName} onChange={e => setFormPickupPointName(e.target.value)} className="mt-1 block w-full input-style-modal"/>
                            </div>
                        )}
                        <div>
                            <label htmlFor="address" className="block text-xs font-medium">Dirección (Personal / Punto Recogida)</label>
                            <input type="text" id="address" value={formAddress} onChange={e => setFormAddress(e.target.value)} className="mt-1 block w-full input-style-modal"/>
                        </div>

                        <Button onClick={handleSaveUser} variant="primary" className="w-full text-sm" disabled={authLoading}>
                            {authLoading ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </Modal>
            )}
             <style>{`.input-style-modal { background-color: white; color: #5D544C; border: 1px solid #DCD0C0; border-radius: 0.375rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; } .input-style-modal:focus { outline: none; box-shadow: 0 0 0 2px #DAB13B; border-color: #DAB13B; } `}</style>
        </div>
    );
};


// Reusable Product Form Component
interface ProductFormProps {
  initialData?: Product;
  onSubmit: (productData: Product | Omit<Product, 'id'>) => Promise<void>;
  onCancel: () => void;
  isEditMode: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, onCancel, isEditMode }) => {
  const [formData, setFormData] = useState<Partial<Product>>(
    initialData || {
      name: '', description: '', longDescription: '', price: 0, imageUrl: '',
      defaultAllergens: [], availableCustomizations: [], category: PRODUCT_CATEGORIES[0], productType: 'cookie'
    }
  );
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => { 
    if (isEditMode && initialData) {
        setFormData({
            ...initialData,
            productType: initialData.productType || 'cookie' 
        });
    } else if (!isEditMode) {
         setFormData({
            name: '', description: '', longDescription: '', price: 0, imageUrl: '',
            defaultAllergens: [], availableCustomizations: [], category: PRODUCT_CATEGORIES.find(c => c !== 'Suscripciones') || PRODUCT_CATEGORIES[0], productType: 'cookie'
         });
    }
  }, [initialData, isEditMode]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'productType') {
        const newProductType = value as 'cookie' | 'subscription';
        setFormData(prev => ({ 
            ...prev, 
            productType: newProductType,
            defaultAllergens: newProductType === 'subscription' ? [] : prev.defaultAllergens,
            availableCustomizations: newProductType === 'subscription' 
                ? ALL_ALLERGENS.filter(a => a !== 'gluten') 
                : prev.availableCustomizations?.includes('gluten') ? prev.availableCustomizations : [...(prev.availableCustomizations || []), 'gluten'],
            category: newProductType === 'subscription' ? 'Suscripciones' : (prev.category === 'Suscripciones' ? PRODUCT_CATEGORIES.find(c => c !== 'Suscripciones') || PRODUCT_CATEGORIES[0] : prev.category)
        }));
    } else if (type === 'number' && name === 'price') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMultiSelectChange = (allergen: Allergen, field: 'defaultAllergens' | 'availableCustomizations') => {
    if (formData.productType === 'subscription' && allergen === 'gluten' && field === 'availableCustomizations') {
        return;
    }

    setFormData(prev => {
      const currentSelection = prev[field] || [];
      const newSelection = currentSelection.includes(allergen)
        ? currentSelection.filter(a => a !== allergen)
        : [...currentSelection, allergen];
      return { ...prev, [field]: newSelection };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.name || !formData.price || formData.price <= 0 || !formData.category) {
      setFormError("Nombre, Precio (mayor a 0) y Categoría son obligatorios.");
      return;
    }
    const productToSubmit = {
        ...formData,
        productType: formData.productType || 'cookie'
    };

    try {
      if (isEditMode && initialData) {
        await onSubmit({ ...initialData, ...productToSubmit } as Product);
      } else {
        await onSubmit(productToSubmit as Omit<Product, 'id'>);
      }
    } catch (err: any) {
      setFormError(err.message || "Error al guardar el producto.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 text-kukie-brown bg-kukie-beige p-4 sm:p-6 rounded-lg shadow text-sm">
      {formError && <p className="text-red-500 bg-red-100 p-2 rounded text-xs sm:text-sm">{formError}</p>}
      <div><label htmlFor="name" className="block text-xs sm:text-sm font-medium">Nombre</label><input type="text" name="name" id="name" value={formData.name || ''} onChange={handleChange} required className="mt-1 block w-full input-style" /></div>
      
      <div>
        <label htmlFor="productType" className="block text-xs sm:text-sm font-medium">Tipo de Producto</label>
        <select name="productType" id="productType" value={formData.productType || 'cookie'} onChange={handleChange} className="mt-1 block w-full input-style">
            <option value="cookie">Galleta Individual</option>
            <option value="subscription">Suscripción</option>
        </select>
      </div>

      <div><label htmlFor="description" className="block text-xs sm:text-sm font-medium">Descripción Corta</label><textarea name="description" id="description" value={formData.description || ''} onChange={handleChange} rows={2} className="mt-1 block w-full input-style" /></div>
      <div><label htmlFor="longDescription" className="block text-xs sm:text-sm font-medium">Descripción Larga</label><textarea name="longDescription" id="longDescription" value={formData.longDescription || ''} onChange={handleChange} rows={3} className="mt-1 block w-full input-style" /></div>
      <div><label htmlFor="price" className="block text-xs sm:text-sm font-medium">Precio</label><input type="number" name="price" id="price" value={formData.price || 0} onChange={handleChange} step="0.01" min="0" required className="mt-1 block w-full input-style" /></div>
      <div><label htmlFor="imageUrl" className="block text-xs sm:text-sm font-medium">URL de Imagen</label><input type="url" name="imageUrl" id="imageUrl" value={formData.imageUrl || ''} onChange={handleChange} className="mt-1 block w-full input-style" /></div>
      <div>
        <label htmlFor="category" className="block text-xs sm:text-sm font-medium">Categoría</label>
        <select name="category" id="category" value={formData.category || ''} onChange={handleChange} required className="mt-1 block w-full input-style" disabled={formData.productType === 'subscription'}>
            {PRODUCT_CATEGORIES.map(cat => <option key={cat} value={cat} disabled={formData.productType !== 'subscription' && cat === 'Suscripciones'}>{cat}</option>)}
        </select>
      </div>
      
      {formData.productType !== 'subscription' && (
        <div><p className="block text-xs sm:text-sm font-medium mb-1">Alérgenos Predeterminados:</p><div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-1 sm:gap-2 text-xs">{ALL_ALLERGENS.map(allergen => (<label key={`def-${allergen}`} className="flex items-center space-x-1 sm:space-x-2"><input type="checkbox" checked={formData.defaultAllergens?.includes(allergen)} onChange={() => handleMultiSelectChange(allergen, 'defaultAllergens')} className="form-checkbox h-3.5 w-3.5 sm:h-4 sm:w-4 text-kukie-yellow"/><span>{ALLERGEN_DETAILS[allergen].label}</span></label>))}</div></div>
      )}
      
      <div>
        <p className="block text-xs sm:text-sm font-medium mb-1">
            {formData.productType === 'subscription' ? "Personalizaciones (además de ser Sin Gluten):" : "Personalizaciones Disponibles:"}
        </p>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-1 sm:gap-2 text-xs">
            {ALL_ALLERGENS.map(allergen => {
                if (formData.productType === 'subscription' && allergen === 'gluten') return null; 
                return (<label key={`avail-${allergen}`} className="flex items-center space-x-1 sm:space-x-2">
                    <input 
                        type="checkbox" 
                        checked={formData.availableCustomizations?.includes(allergen)} 
                        onChange={() => handleMultiSelectChange(allergen, 'availableCustomizations')} 
                        className="form-checkbox h-3.5 w-3.5 sm:h-4 sm:w-4 text-kukie-yellow"
                    />
                    <span>{ALLERGEN_DETAILS[allergen].label}</span>
                </label>)
            })}
        </div>
      </div>


      <div className="flex justify-end space-x-2 sm:space-x-3 pt-3 sm:pt-4">
        <Button type="button" onClick={onCancel} variant="ghost" size="sm" className="!text-xs sm:!text-sm">Cancelar</Button>
        <Button type="submit" variant="primary" size="sm" className="!text-xs sm:!text-sm">{isEditMode ? 'Actualizar Producto' : 'Añadir Producto'}</Button>
      </div>
       <style>{`.input-style { background-color: white; color: #5D544C; border: 1px solid #DCD0C0; border-radius: 0.375rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; } .input-style:focus { outline: none; box-shadow: 0 0 0 2px #DAB13B; border-color: #DAB13B; } `}</style>
    </form>
  );
};


const AdminProductsPage: React.FC = () => {
  const { products, isLoading, addProduct, updateProduct, deleteProduct } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  const handleAddNew = () => { setEditingProduct(undefined); setShowForm(true); };
  const handleEdit = (product: Product) => { setEditingProduct(product); setShowForm(true); };
  const handleDelete = async (productId: string) => { if (window.confirm('¿Seguro que quieres eliminar este producto?')) { try { await deleteProduct(productId); } catch (err) { alert("Error al eliminar: "+ (err as Error).message); } } };
  const handleFormSubmit = async (productData: Product | Omit<Product, 'id'>) => {
    const dataToSubmit = { ...productData, productType: productData.productType || 'cookie' };

    if (editingProduct && 'id' in dataToSubmit) { 
      await updateProduct(dataToSubmit as Product);
    } else {
      await addProduct(dataToSubmit as Omit<Product, 'id'>);
    }
    setShowForm(false); setEditingProduct(undefined);
  };

  if (isLoading) return <p>Cargando productos...</p>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-0">
        <h1 className="text-2xl md:text-3xl font-bold">Gestionar Productos</h1>
        <Button onClick={handleAddNew} variant="primary" size="md" className="!text-sm w-full sm:w-auto">Añadir Nuevo Producto</Button>
      </div>

      {showForm && (
        <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingProduct(undefined); }} title={editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'} size="xl">
          <ProductForm 
            initialData={editingProduct} 
            onSubmit={handleFormSubmit} 
            onCancel={() => { setShowForm(false); setEditingProduct(undefined); }}
            isEditMode={!!editingProduct} 
          />
        </Modal>
      )}

      {products.length === 0 ? <p>No hay productos en el catálogo.</p> : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-kukie-light-brown text-kukie-beige">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase">Imagen</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase">Nombre</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase">Precio</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase hidden sm:table-cell">Categoría</th>
                 <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase hidden sm:table-cell">Tipo</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-kukie-brown">
              {products.map(product => (
                <tr key={product.id}>
                  <td className="px-3 sm:px-6 py-2 sm:py-4"><img src={product.imageUrl || 'https://via.placeholder.com/50'} alt={product.name} className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded"/></td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">{product.name}</td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">${product.price.toFixed(2)}</td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm hidden sm:table-cell">{product.category}</td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm hidden sm:table-cell">{product.productType === 'subscription' ? 'Suscripción' : 'Galleta'}</td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm space-x-1 sm:space-x-2">
                    <Button onClick={() => handleEdit(product)} size="sm" variant="outline" className="!text-xs !px-2 !py-1">Editar</Button>
                    <Button onClick={() => handleDelete(product.id)} size="sm" variant="ghost" className="text-red-500 hover:bg-red-100 !text-xs !px-2 !py-1">Eliminar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AdminSubscriptionsPage: React.FC = () => {
  const [allUserSubscriptions, setAllUserSubscriptions] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');

  const ORDER_STATUS_OPTIONS_SUB: OrderStatus[] = ["Subscription Active", "Subscription Cancelled"];


  const loadSubscriptions = useCallback(() => {
    setIsLoading(true);
    const allOrders = JSON.parse(localStorage.getItem('allKukieOrders') || '[]') as Order[];
    const subscriptions = allOrders
      .filter(order => order.items.some(item => item.product.productType === 'subscription'))
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    setAllUserSubscriptions(subscriptions);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);
  
  const getFrequencyDisplay = (frequency?: SubscriptionFrequency): string => {
    if (!frequency) return 'N/A';
    switch(frequency) {
        case 'weekly': return 'Semanal';
        case 'bi-weekly': return 'Quincenal';
        case 'monthly': return 'Mensual';
        default: return frequency;
    }
  }

  const handleOpenEditModal = (order: Order) => {
    setEditingOrder(order);
    setNewStatus(order.status || "Subscription Active");
  };

  const handleUpdateSubscriptionStatus = () => {
    if (!editingOrder || !newStatus) return;
    const updatedOrders = JSON.parse(localStorage.getItem('allKukieOrders') || '[]').map((o: Order) =>
      o.id === editingOrder.id ? { ...o, status: newStatus } : o
    );
    localStorage.setItem('allKukieOrders', JSON.stringify(updatedOrders));
    setEditingOrder(null);
    setNewStatus('');
    loadSubscriptions(); 
  };


  if (isLoading) return <p>Cargando suscripciones...</p>;

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Gestionar Suscripciones de Usuarios</h1>
      {allUserSubscriptions.length === 0 ? (
        <p>No hay suscripciones activas o pasadas.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-kukie-light-brown text-kukie-beige">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Suscripción</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Frecuencia</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Fecha Inicio</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Próx. Entrega</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-kukie-brown">
              {allUserSubscriptions.map(order => {
                const subItem = order.items.find(item => item.product.productType === 'subscription');
                if (!subItem || !subItem.subscriptionFrequency) return null; 
                const nextDelivery = order.status === "Subscription Active" ? calculateNextDeliveryDate(new Date(order.orderDate), subItem.subscriptionFrequency) : null;
                return (
                  <tr key={order.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-xs sm:text-sm">{order.customerDetails.name} <br/> ({order.customerDetails.email})</td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs sm:text-sm">{subItem.product.name}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs sm:text-sm">{getFrequencyDisplay(subItem.subscriptionFrequency)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs sm:text-sm">{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs sm:text-sm">
                      {nextDelivery ? nextDelivery.toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs sm:text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === "Subscription Active" ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs sm:text-sm">
                       <Button onClick={() => handleOpenEditModal(order)} size="sm" variant="outline" className="!text-xs !px-2 !py-1">
                         {order.status === "Subscription Active" ? "Cancelar" : "Reactivar (Verificar)"}
                       </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
       {editingOrder && (
        <Modal isOpen={!!editingOrder} onClose={() => setEditingOrder(null)} title={`Gestionar Suscripción de ${editingOrder.customerDetails.name}`} size="md">
          <div className="space-y-4 text-sm">
            <p><strong>Suscripción:</strong> {editingOrder.items.find(i=>i.product.productType === 'subscription')?.product.name}</p>
            <p><strong>Estado Actual:</strong> {editingOrder.status}</p>
            <div>
              <label htmlFor="subscriptionStatus" className="block text-xs font-medium text-kukie-brown">Nuevo Estado:</label>
              <select 
                id="subscriptionStatus" 
                value={newStatus} 
                onChange={e => setNewStatus(e.target.value as OrderStatus)} 
                className="mt-1 block w-full input-style text-sm"
              >
                {ORDER_STATUS_OPTIONS_SUB.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <Button onClick={handleUpdateSubscriptionStatus} variant="primary" className="w-full text-sm">Actualizar Estado Suscripción</Button>
          </div>
          <style>{`.input-style { background-color: #FAF0E6; color: #5D544C; border: 1px solid #DCD0C0; border-radius: 0.375rem; padding: 0.5rem 0.75rem; } `}</style>
        </Modal>
      )}
    </div>
  );
};

// --- START OF PICKUP POINT HUB SECTION ---

// Pickup Point - Place Order View (adapted from PickupPlaceOrderPage)
const PickupPlaceOrderView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { products, isLoading: isLoadingProducts } = useProducts();
    const { currentUser } = useAuth();
    const { addToCart, cartItems, clearCart, getTotalPrice } = useCart();
    const navigate = useNavigate();

    const [selectedCookie, setSelectedCookie] = useState<Product | null>(null);
    const [endCustomerName, setEndCustomerName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const handlePlaceOrderForCustomer = () => {
        if (!endCustomerName.trim()) {
            setFormError("Por favor, ingrese el nombre del cliente final.");
            return;
        }
        if (cartItems.length === 0) {
            setFormError("El carrito está vacío. Agregue productos para el cliente.");
            return;
        }
        setFormError('');
        setIsSubmitting(true);

        const orderId = `KUKIE-PU-${Date.now()}`;
        const orderData: Order = {
            id: orderId,
            userId: currentUser?.id, 
            items: cartItems.map(item => ({...item, assignedToCustomer: endCustomerName.trim()})),
            totalAmount: getTotalPrice(),
            customerDetails: { 
                name: currentUser?.pickupPointName || currentUser?.name || 'Punto de Recogida',
                email: currentUser?.email || '',
                address: currentUser?.address || 'Dirección del Punto de Recogida',
            },
            orderDate: new Date(),
            status: "Procesando",
            isPickupOrder: true,
            pickupPointId: currentUser?.id,
            endCustomerName: endCustomerName.trim(),
        };

        const allOrders = JSON.parse(localStorage.getItem('allKukieOrders') || '[]') as Order[];
        allOrders.push(orderData);
        localStorage.setItem('allKukieOrders', JSON.stringify(allOrders));
        
        setTimeout(() => {
            clearCart();
            setIsSubmitting(false);
            // Instead of navigating to confirmation, show a success message or go back.
            // For now, let's use the main confirmation page.
            navigate('/confirmation', { state: { order: orderData } }); 
            onBack(); // Go back to hub main view after order.
        }, 1000);
    };
    
    if (isLoadingProducts) return <p>Cargando productos...</p>;

    return (
        <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-kukie-brown">Realizar Pedido para Cliente</h2>
              <Button onClick={onBack} variant="outline" size="sm">Volver al Panel</Button>
            </div>
            <div className="mb-4">
                <label htmlFor="endCustomerName" className="block text-sm font-medium text-kukie-brown">Nombre del Cliente Final:</label>
                <input 
                    type="text" 
                    id="endCustomerName" 
                    value={endCustomerName} 
                    onChange={(e) => setEndCustomerName(e.target.value)} 
                    className="mt-1 block w-full sm:w-1/2 input-style-profile" 
                    required 
                />
            </div>

            <h3 className="text-lg font-semibold text-kukie-brown mb-3">Productos Disponibles:</h3>
            {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {products.map((cookie) => (
                        <CookieCard key={cookie.id} cookie={cookie} onViewDetails={setSelectedCookie} />
                    ))}
                </div>
            ) : <p>No hay productos para mostrar.</p>}

            {selectedCookie && (
                <Modal isOpen={!!selectedCookie} onClose={() => setSelectedCookie(null)} title={`Personalizar ${selectedCookie.name}`} size="lg">
                    <ProductDetailModalContent product={selectedCookie} onClose={() => setSelectedCookie(null)} />
                </Modal>
            )}

            {cartItems.length > 0 && (
                <div className="mt-8 p-4 bg-kukie-dark-beige rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-kukie-yellow mb-2">Resumen para {endCustomerName || "Cliente"}:</h3>
                    {cartItems.map(item => (
                        <div key={`${item.product.id}-${item.selectedCustomizations.join('-')}`} className="flex justify-between text-sm text-kukie-beige mb-1">
                            <span>{item.product.name} (x{item.quantity})</span>
                            <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <p className="text-md font-bold text-kukie-yellow mt-2">Total: ${getTotalPrice().toFixed(2)}</p>
                    {formError && <p className="text-red-400 text-sm mt-2">{formError}</p>}
                    <Button 
                        onClick={handlePlaceOrderForCustomer} 
                        variant="primary" 
                        size="lg" 
                        className="w-full mt-4"
                        disabled={isSubmitting || !endCustomerName.trim()}
                    >
                        {isSubmitting ? "Procesando Pedido..." : "Confirmar Pedido para Cliente"}
                    </Button>
                </div>
            )}
        </div>
    );
};

// Pickup Point - Manage Assigned Orders View (adapted from PickupManageOrdersPage)
const PickupManageOrdersView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [itemAssignments, setItemAssignments] = useState<Record<string, string>>({});
    const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');

    const PICKUP_POINT_ORDER_STATUSES: OrderStatus[] = [
        "Procesando", "En Punto de Recogida", "Listo para Recoger por Cliente Final", "Recogido por Cliente Final", "Cancelado"
    ];

    const loadPickupOrders = useCallback(() => {
        if (!currentUser?.id) return;
        setIsLoading(true);
        const allOrders = JSON.parse(localStorage.getItem('allKukieOrders') || '[]') as Order[];
        const pickupOrders = allOrders.filter(
            order => order.pickupPointId === currentUser.id && order.isPickupOrder
        ).sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        setOrders(pickupOrders);
        setIsLoading(false);
    }, [currentUser]);

    useEffect(() => { loadPickupOrders(); }, [loadPickupOrders]);

    const handleOpenEditModal = (order: Order) => {
        setEditingOrder(order);
        setNewStatus(order.status || "Procesando");
        const initialAssignments: Record<string, string> = {};
        order.items.forEach((item, index) => {
            const key = `${order.id}-${item.product.id}-${index}`;
            initialAssignments[key] = item.assignedToCustomer || '';
        });
        setItemAssignments(initialAssignments);
    };

    const handleItemAssignmentChange = (key: string, customerName: string) => {
        setItemAssignments(prev => ({ ...prev, [key]: customerName }));
    };
    
    const getCartItemKeyForAssignment = (orderId: string, productId: string, itemIndex: number) => {
        return `${orderId}-${productId}-${itemIndex}`;
    };

    const handleSaveOrderChanges = () => {
        if (!editingOrder) return;
        const updatedItems = editingOrder.items.map((item, index) => {
            const key = getCartItemKeyForAssignment(editingOrder.id, item.product.id, index);
            return { ...item, assignedToCustomer: itemAssignments[key] || undefined };
        });

        const allStorageOrders = JSON.parse(localStorage.getItem('allKukieOrders') || '[]') as Order[];
        const updatedStorageOrders = allStorageOrders.map(o =>
            o.id === editingOrder.id ? { ...o, status: newStatus || o.status, items: updatedItems } : o
        );
        localStorage.setItem('allKukieOrders', JSON.stringify(updatedStorageOrders));
        
        setEditingOrder(null);
        setNewStatus('');
        loadPickupOrders();
    };

    if (isLoading) return <p className="text-kukie-light-brown">Cargando pedidos...</p>;

    return (
        <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-kukie-brown">Gestionar Pedidos de Recogida</h2>
              <Button onClick={onBack} variant="outline" size="sm">Volver al Panel</Button>
            </div>
            {orders.length === 0 ? <p className="text-kukie-light-brown">No hay pedidos asignados a tu punto de recogida.</p> : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="bg-kukie-light-brown text-kukie-beige p-4 rounded-lg shadow-md">
                            <div className="flex flex-col sm:flex-row justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold text-kukie-yellow">Pedido #{order.id.slice(-6)}</h3>
                                    <p className="text-xs">Cliente: {order.customerDetails.name} {order.endCustomerName ? `(Para: ${order.endCustomerName})` : ''}</p>
                                    <p className="text-xs">Fecha: {new Date(order.orderDate).toLocaleDateString()}</p>
                                    <p className="text-xs">Estado: <span className="font-semibold">{order.status}</span></p>
                                </div>
                                <Button onClick={() => handleOpenEditModal(order)} variant="outline" size="sm" className="!text-xs mt-2 sm:mt-0">Gestionar</Button>
                            </div>
                             <ul className="mt-2 list-disc list-inside text-xs space-y-0.5 pl-2">
                                {order.items.map((item, index) => (
                                    <li key={getCartItemKeyForAssignment(order.id, item.product.id, index)}>
                                        {item.product.name} (x{item.quantity})
                                        {item.assignedToCustomer && <span className="italic text-kukie-dark-beige"> - Para: {item.assignedToCustomer}</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
            {editingOrder && (
                <Modal isOpen={!!editingOrder} onClose={() => setEditingOrder(null)} title={`Gestionar Pedido #${editingOrder.id.slice(-6)}`} size="lg">
                    <div className="space-y-4 text-sm text-kukie-brown">
                        <p><strong>Cliente:</strong> {editingOrder.customerDetails.name} {editingOrder.endCustomerName ? `(Para: ${editingOrder.endCustomerName})` : ''}</p>
                        <p><strong>Total:</strong> ${editingOrder.totalAmount.toFixed(2)}</p>
                        
                        <div>
                            <label htmlFor="orderStatus" className="block text-xs font-medium">Actualizar Estado:</label>
                            <select 
                                id="orderStatus" 
                                value={newStatus} 
                                onChange={e => setNewStatus(e.target.value as OrderStatus)} 
                                className="mt-1 block w-full input-style-modal"
                            >
                                {PICKUP_POINT_ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <h4 className="text-sm font-semibold mt-3 mb-1">Asignar Artículos a Clientes:</h4>
                        {editingOrder.items.map((item, index) => {
                            const key = getCartItemKeyForAssignment(editingOrder.id, item.product.id, index);
                            return (
                                <div key={key} className="flex items-center gap-2 mb-1.5">
                                    <span className="flex-grow text-xs">{item.product.name} (x{item.quantity})</span>
                                    <input 
                                        type="text" 
                                        placeholder="Nombre cliente final" 
                                        value={itemAssignments[key] || ''}
                                        onChange={(e) => handleItemAssignmentChange(key, e.target.value)}
                                        className="input-style-modal !text-xs !p-1 w-1/2"
                                    />
                                </div>
                            );
                        })}
                        <Button onClick={handleSaveOrderChanges} variant="primary" className="w-full mt-4">Guardar Cambios</Button>
                    </div>
                     <style>{`.input-style-modal { background-color: white; color: #5D544C; border: 1px solid #DCD0C0; border-radius: 0.375rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; } .input-style-modal:focus { outline: none; box-shadow: 0 0 0 2px #DAB13B; border-color: #DAB13B; }`}</style>
                </Modal>
            )}
        </div>
    );
};

// Pickup Point Hub Page - Combines Profile and Dashboard functionality
const PickupPointHubPage: React.FC = () => {
  const { currentUser, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'main' | 'placeOrder' | 'manageOrders'>('main');

  const [pickupOrders, setPickupOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  
  // For details editing
  const [editingPickupName, setEditingPickupName] = useState(false);
  const [newPickupPointName, setNewPickupPointName] = useState(currentUser?.pickupPointName || '');
  const [editingAddress, setEditingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState(currentUser?.address || '');

  const loadPickupPointOrders = useCallback(() => {
    if (!currentUser) return;
    setIsLoadingOrders(true);
    setTimeout(() => { 
      const allOrders = JSON.parse(localStorage.getItem('allKukieOrders') || '[]') as Order[];
      const relevantOrders = allOrders
        .filter(o => o.pickupPointId === currentUser.id || (o.userId === currentUser.id && !o.isPickupOrder)) // Orders at this point, or personal orders
        .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
      setPickupOrders(relevantOrders);
      setIsLoadingOrders(false);
    }, 500);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else {
      loadPickupPointOrders();
      setNewPickupPointName(currentUser.pickupPointName || '');
      setNewAddress(currentUser.address || '');
    }
  }, [currentUser, navigate, loadPickupPointOrders]);

  const handleUpdatePickupPointName = async () => {
    if (!currentUser || !newPickupPointName.trim()) return;
    const success = await updateUser(currentUser.id, { pickupPointName: newPickupPointName.trim() });
    if (success) {
        setEditingPickupName(false);
        alert("Nombre del punto de recogida actualizado.");
    } else { alert("Error al actualizar el nombre."); }
  };

  const handleUpdateAddress = async () => {
    if (!currentUser || !newAddress.trim()) return;
    const success = await updateUser(currentUser.id, { address: newAddress.trim() });
    if (success) {
        setEditingAddress(false);
        alert("Dirección actualizada.");
    } else { alert("Error al actualizar la dirección."); }
  };

  const getFrequencyDisplay = (frequency?: SubscriptionFrequency): string => { // Copied from ProfilePage
    if (!frequency) return '';
    switch(frequency) {
        case 'weekly': return 'Semanal';
        case 'bi-weekly': return 'Quincenal';
        case 'monthly': return 'Mensual';
        default: return '';
    }
  }

  if (!currentUser) return null;

  if (currentView === 'placeOrder') {
    return <PickupPlaceOrderView onBack={() => setCurrentView('main')} />;
  }
  if (currentView === 'manageOrders') {
    return <PickupManageOrdersView onBack={() => setCurrentView('main')} />;
  }

  // Main View
  return (
    <div className="max-w-xl lg:max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-kukie-brown">Panel de Punto de Recogida</h1>
        <Button onClick={() => { logout(); navigate('/'); }} variant="outline" size="sm">Cerrar Sesión</Button>
      </div>

      {/* User Details Section */}
      <div className="bg-kukie-light-brown text-kukie-beige p-4 sm:p-6 rounded-lg shadow-xl mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-kukie-yellow mb-3">Mis Datos</h2>
        <p className="text-sm sm:text-base"><strong>Nombre de Contacto:</strong> {currentUser.name}</p>
        <p className="text-sm sm:text-base"><strong>Email:</strong> {currentUser.email}</p>
        <div className="mt-2">
            <strong>Nombre Punto de Recogida:</strong>
            {editingPickupName ? (
                <div className="flex items-center gap-2 mt-1">
                    <input type="text" value={newPickupPointName} onChange={(e) => setNewPickupPointName(e.target.value)} className="input-style-profile text-sm p-1 flex-grow"/>
                    <Button onClick={handleUpdatePickupPointName} size="sm" variant="primary" className="!text-xs">Guardar</Button>
                    <Button onClick={() => {setEditingPickupName(false); setNewPickupPointName(currentUser.pickupPointName || '');}} size="sm" variant="ghost" className="!text-xs">Cancelar</Button>
                </div>
            ) : (
                <span> {currentUser.pickupPointName || 'No especificado'} <Button onClick={() => setEditingPickupName(true)} variant="ghost" size="sm" className="ml-2 !text-xs !p-0.5">Editar</Button></span>
            )}
        </div>
        <div className="mt-2">
            <strong>Dirección del Punto:</strong>
            {editingAddress ? (
                <div className="flex items-center gap-2 mt-1">
                    <input type="text" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} className="input-style-profile text-sm p-1 flex-grow"/>
                    <Button onClick={handleUpdateAddress} size="sm" variant="primary" className="!text-xs">Guardar</Button>
                    <Button onClick={() => {setEditingAddress(false); setNewAddress(currentUser.address || '');}} size="sm" variant="ghost" className="!text-xs">Cancelar</Button>
                </div>
            ) : (
                <span> {currentUser.address || 'No especificada'} <Button onClick={() => setEditingAddress(true)} variant="ghost" size="sm" className="ml-2 !text-xs !p-0.5">Editar</Button></span>
            )}
        </div>
      </div>

      {/* Actions Section */}
      <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-kukie-brown mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={() => setCurrentView('placeOrder')} variant="primary" size="lg" className="w-full">
                  Realizar Pedido para Cliente
              </Button>
              <Button onClick={() => setCurrentView('manageOrders')} variant="secondary" size="lg" className="w-full">
                  Gestionar Pedidos de Recogida
              </Button>
          </div>
      </div>

      {/* Order History Section (relevant to pickup point) */}
      <h2 className="text-xl sm:text-2xl font-bold text-kukie-brown mb-4">Historial de Pedidos en mi Punto</h2>
      {isLoadingOrders ? ( <p className="text-kukie-light-brown">Cargando pedidos...</p> ) : pickupOrders.length === 0 ? ( <div className="bg-kukie-light-brown text-kukie-beige p-6 rounded-lg shadow-xl text-center"> <p className="text-md sm:text-lg">No hay pedidos registrados para tu punto.</p> </div> ) : ( <div className="space-y-4"> {pickupOrders.map(order => ( <div key={order.id} className="bg-kukie-light-brown text-kukie-beige p-3 sm:p-4 rounded-lg shadow-md"> <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center"> <div> <h3 className="text-md sm:text-lg font-semibold text-kukie-yellow">Pedido #{order.id.substring(order.id.length - 6)}</h3> <p className="text-xs sm:text-sm">Fecha: {new Date(order.orderDate).toLocaleDateString()}</p> <p className="text-xs sm:text-sm">Estado: <span className="font-medium text-yellow-300">{order.status || "Procesando"}</span></p> {order.endCustomerName && <p className="text-xs sm:text-sm italic">Para Cliente: {order.endCustomerName}</p>} {order.isPickupOrder && order.pickupPointId !== currentUser.id && <p className="text-xs sm:text-sm italic">Otro Punto: {order.customerDetails.address}</p>} </div> <p className="text-md sm:text-lg font-bold mt-2 sm:mt-0">${order.totalAmount.toFixed(2)}</p> </div> <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-kukie-dark-beige"> <h4 className="text-xs sm:text-sm font-semibold mb-1">Artículos:</h4> <ul className="list-disc list-inside text-xs space-y-0.5"> {order.items.map(item => ( <li key={`${item.product.id}-${item.selectedCustomizations.sort().join('-')}-${item.subscriptionFrequency || ''}`}> {item.product.name}{ getFrequencyDisplay(item.subscriptionFrequency)} (x{item.quantity}) {item.assignedToCustomer ? ` (Para: ${item.assignedToCustomer})` : ''} </li> ))} </ul> </div> </div> ))} </div> )}
      <style>{`.input-style-profile { background-color: #FAF0E6; color: #5D544C; border: 1px solid #DCD0C0; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); padding: 0.25rem 0.5rem; } .input-style-profile:focus { outline: none; box-shadow: 0 0 0 2px #DAB13B; border-color: #DAB13B; } `}</style>
    </div>
  );
};

// --- END OF PICKUP POINT HUB SECTION ---

// Pickup Point Dashboard Guard
const PickupPointRouteGuard: React.FC = () => {
  const { isPickupPointUser, currentUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <p className="text-center text-xl py-10">Verificando acceso...</p>;
  if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isPickupPointUser()) return <Navigate to="/" state={{ from: location }} replace />; // Redirect to home if not pickup point trying to access dashboard
  
  return <Outlet />;
};

// AuthAwareProfileRenderer: Decides which profile/dashboard to show
const AuthAwareProfileRenderer: React.FC = () => {
  const { isPickupPointUser, isLoading, currentUser } = useAuth();
  const location = useLocation();

  if (isLoading) return <p className="text-center text-xl py-10">Cargando...</p>;
  if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />; // Should not happen if ProfilePage is protected by a general auth guard

  return isPickupPointUser() ? <Navigate to="/pickup-dashboard" replace /> : <ProfilePage />;
};


function App() {
  return (
    <AuthProvider>
      <ProductProvider> 
        <CartProvider>
          <HashRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Layout><HomePage /></Layout>} />
              <Route path="/catalog" element={<Layout><CatalogPage /></Layout>} />
              <Route path="/cart" element={<Layout><CartPage /></Layout>} />
              <Route path="/checkout" element={<Layout><CheckoutPage /></Layout>} />
              <Route path="/confirmation" element={<Layout><ConfirmationPage /></Layout>} />
              <Route path="/login" element={<Layout><LoginPage /></Layout>} />
              <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
              <Route path="/register-pickup" element={<Layout><RegisterPage isPickupPointRegistration={true} /></Layout>} />
              
              {/* Profile Route - Handled by AuthAwareProfileRenderer */}
              <Route path="/profile" element={<Layout><AuthAwareProfileRenderer /></Layout>} />

              {/* Pickup Point Hub Route */}
              <Route path="/pickup-dashboard" element={<PickupPointRouteGuard />}>
                  <Route index element={<Layout><PickupPointHubPage /></Layout>} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRouteGuard />}>
                <Route element={<AdminLayout />}> 
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                </Route>
              </Route>
              
              <Route path="*" element={<Layout><div className="text-center py-10 sm:py-20"><h1 className="text-2xl sm:text-4xl">404 - Página no encontrada</h1><Link to="/"><Button className="mt-4">Volver al Inicio</Button></Link></div></Layout>} />
            </Routes>
          </HashRouter>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
