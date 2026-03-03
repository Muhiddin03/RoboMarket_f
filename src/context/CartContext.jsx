import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const FREE_DELIVERY = 500000;
const DELIVERY_COST = 25000;

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) { removeFromCart(id); return; }
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
  const deliveryCost = DELIVERY_COST;
  const total = subtotal;
  const totalItems = cart.reduce((acc, i) => acc + i.qty, 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, updateQty, removeFromCart, clearCart,
      subtotal, deliveryCost, total, totalItems,
      FREE_DELIVERY,
    }}>
      {children}
    </CartContext.Provider>
  );
}
