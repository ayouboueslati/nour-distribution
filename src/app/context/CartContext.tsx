'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../lib/api';
import { notificationService } from '../lib/notifications';
import { v4 as uuidv4 } from 'uuid';

interface ProductForCart {
  product_id: string; // Product ID
  name: string;
  category: string;
  image: string;
  stock: number;
  sku?: string;
}

interface CartItem {
  id: string; // Cart item ID (from backend)
  product_id: string; // Product ID
  name: string;
  category: string;
  quantity: number;
  image: string;
  stock: number;
  sku?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: ProductForCart, quantity: number) => Promise<void>; // Changed type
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  guestSessionId: string;
  loadCart: () => Promise<void>;
  checkout: (clientInfo: any) => Promise<any>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [guestSessionId, setGuestSessionId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Initialize client ID on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let sessionId = localStorage.getItem('guestSessionId');
      if (!sessionId) {
        sessionId = uuidv4();
        localStorage.setItem('guestSessionId', sessionId);
      }
      setGuestSessionId(sessionId);
      loadCart(sessionId);
    }
  }, []);

  const loadCart = async (sessionId?: string) => {
    const currentSessionId = sessionId || guestSessionId;
    if (!currentSessionId) return;

    try {
      setLoading(true);
      const response = await apiService.getGuestCart(currentSessionId);

      // Transform backend cart items to frontend format
      const items = (response.items || []).map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        name: item.product?.name || 'Produit',
        category: item.product?.category?.name || 'Catégorie',
        quantity: item.quantity,
        image: item.product?.main_image || '/placeholder-product.jpg',
        stock: item.product?.available_quantity || 0,
        sku: item.product?.sku
      }));

      setCartItems(items);
    } catch (error: any) {
      // If cart doesn't exist yet, that's ok - it will be created on first add
      if (!error.message?.includes('404')) {
        console.error('Error loading cart:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: ProductForCart, quantity: number) => {
    if (!guestSessionId) {
      notificationService.error('Erreur', 'Session non initialisé');
      return;
    }

    console.log('🛒 Adding to cart:', {
      guestSessionId,
      product,
      quantity
    });

    try {
      // Check if item already exists in cart
      const existingItem = cartItems.find(item => item.product_id === product.product_id);

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          notificationService.warning(
            'Stock insuffisant',
            `Seulement ${product.stock} unités disponibles`
          );
          return;
        }
        await updateQuantity(existingItem.id, newQuantity);
      } else {
        // Add new item
        if (quantity > product.stock) {
          notificationService.warning(
            'Stock insuffisant',
            `Seulement ${product.stock} unités disponibles`
          );
          return;
        }

        console.log('📤 Sending to API:', {
          product_id: product.product_id,
          quantity
        });

        await apiService.addItemToGuestCart(guestSessionId, {
          product_id: product.product_id,
          quantity
        });

        // Reload cart to get the new item with its cart item ID
        await loadCart();
      }
    } catch (error: any) {
      console.error('❌ Error adding to cart:', error);
      if (error.message?.includes('Out of stock')) {
        notificationService.error(
          'Stock insuffisant',
          'Quantité demandée non disponible'
        );
      }
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!guestSessionId) return;

    if (quantity < 1) {
      await removeFromCart(itemId);
      return;
    }

    try {
      await apiService.updateGuestCartItem(guestSessionId, itemId, { quantity });

      // Update local state
      setCartItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? { ...item, quantity: Math.min(quantity, item.stock) }
            : item
        )
      );
    } catch (error: any) {
      if (error.message?.includes('Out of stock')) {
        notificationService.error(
          'Stock insuffisant',
          'Quantité demandée non disponible'
        );
      }
      // Reload to sync with backend
      await loadCart();
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!guestSessionId) return;

    try {
      await apiService.removeGuestCartItem(guestSessionId, itemId);
      setCartItems(prev => prev.filter(item => item.id !== itemId));

      notificationService.success(
        'Article retiré',
        'L\'article a été retiré du panier'
      );
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const clearCart = async () => {
    if (!guestSessionId) return;

    try {
      await apiService.clearGuestCart(guestSessionId);
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const checkout = async (clientInfo: any) => {
    if (!guestSessionId) {
      throw new Error('Client ID non initialisé');
    }

    try {
      const response = await apiService.guestCheckout(guestSessionId, clientInfo);

      // Clear cart after successful checkout
      setCartItems([]);

      // Save order tracking info
      if (response.order) {
        localStorage.setItem('lastOrderNumber', response.order.order_number);
        localStorage.setItem('lastVerificationCode', response.order.tracking_info?.verification_code || '');
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalItems,
      guestSessionId,
      loadCart,
      checkout
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};