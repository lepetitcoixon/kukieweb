
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItemType, Product, CartContextType, Allergen, SubscriptionFrequency } from '../types';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItemType[]>(() => {
    const localData = localStorage.getItem('kukieCart');
    return localData ? JSON.parse(localData) : [];
  });

  useEffect(() => {
    localStorage.setItem('kukieCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const getCartItemKey = (productId: string, customizations: Allergen[], frequency?: SubscriptionFrequency): string => {
    return `${productId}-${customizations.sort().join('-')}-${frequency || ''}`;
  };

  const addToCart = useCallback((product: Product, quantity: number, customizations: Allergen[], subscriptionFrequency?: SubscriptionFrequency) => {
    setCartItems(prevItems => {
      const itemKey = getCartItemKey(product.id, customizations, subscriptionFrequency);
      const existingItemIndex = prevItems.findIndex(item => getCartItemKey(item.product.id, item.selectedCustomizations, item.subscriptionFrequency) === itemKey);

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        // For subscriptions, quantity is typically 1 (one plan). If adding same subscription again, maybe don't increase quantity.
        // For now, let's allow quantity increase, but it might mean "multiple identical subscription plans".
        if (product.productType !== 'subscription') {
             updatedItems[existingItemIndex].quantity += quantity;
        } else {
            // alert("Ya tienes esta suscripción en tu carrito. Para modificarla, elimínala y añádela de nuevo.");
            // Or replace:
             updatedItems[existingItemIndex].quantity = quantity; // keep it 1 or allow change
             updatedItems[existingItemIndex].selectedCustomizations = customizations;
             updatedItems[existingItemIndex].subscriptionFrequency = subscriptionFrequency;
        }
        return updatedItems;
      } else {
        return [...prevItems, { product, quantity, selectedCustomizations: customizations, subscriptionFrequency }];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId: string, customizations: Allergen[], subscriptionFrequency?: SubscriptionFrequency) => {
    setCartItems(prevItems => {
      const itemKey = getCartItemKey(productId, customizations, subscriptionFrequency);
      return prevItems.filter(item => getCartItemKey(item.product.id, item.selectedCustomizations, item.subscriptionFrequency) !== itemKey);
    });
  }, []);

  const updateQuantity = useCallback((productId: string, customizations: Allergen[], quantity: number, subscriptionFrequency?: SubscriptionFrequency) => {
    setCartItems(prevItems => {
      const itemKey = getCartItemKey(productId, customizations, subscriptionFrequency);
      return prevItems.map(item =>
        getCartItemKey(item.product.id, item.selectedCustomizations, item.subscriptionFrequency) === itemKey
          ? { ...item, quantity: Math.max(0, quantity) } 
          : item
      ).filter(item => item.quantity > 0); 
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
