
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, ProductContextType, Allergen } from '../types';
import { INITIAL_PRODUCTS_DATA } from '../constants';

const ProductContext = createContext<ProductContextType | undefined>(undefined);
const PRODUCTS_STORAGE_KEY = 'kukieProducts';

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      // Seed with initial data if localStorage is empty
      setProducts(INITIAL_PRODUCTS_DATA);
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS_DATA));
    }
    setIsLoading(false);
  }, []);

  const persistProducts = (updatedProducts: Product[]) => {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
  };

  const addProduct = useCallback(async (productData: Omit<Product, 'id'>): Promise<void> => {
    // Basic validation
    if (!productData.name || !productData.price || productData.price <=0 || !productData.category) {
        throw new Error("Nombre, precio y categoría son obligatorios.");
    }
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      defaultAllergens: productData.defaultAllergens || [],
      availableCustomizations: productData.availableCustomizations || [],
      imageUrl: productData.imageUrl || 'https://via.placeholder.com/600x400.png?text=No+Image'
    };
    persistProducts([...products, newProduct]);
  }, [products]);

  const updateProduct = useCallback(async (updatedProduct: Product): Promise<void> => {
    if (!updatedProduct.name || !updatedProduct.price || updatedProduct.price <=0 || !updatedProduct.category) {
        throw new Error("Nombre, precio y categoría son obligatorios.");
    }
    persistProducts(
      products.map(p => (p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p))
    );
  }, [products]);

  const deleteProduct = useCallback(async (productId: string): Promise<void> => {
    persistProducts(products.filter(p => p.id !== productId));
  }, [products]);

  const getProductById = useCallback((productId: string): Product | undefined => {
    return products.find(p => p.id === productId);
  }, [products]);


  return (
    <ProductContext.Provider value={{ products, isLoading, addProduct, updateProduct, deleteProduct, getProductById }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
