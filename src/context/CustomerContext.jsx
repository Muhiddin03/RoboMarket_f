import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const Ctx = createContext(null);
const KEY = 'rm_customer';

export const CustomerProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (s) setCustomer(JSON.parse(s));
    } catch {}
  }, []);

  const fetchOrders = useCallback(async (phone) => {
    setLoading(true);
    try {
      const r = await api.get('/customer-orders', { params: { phone } });
      setOrders(r.data.orders || []);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (customer?.phone) fetchOrders(customer.phone);
  }, [customer, fetchOrders]);

  const setupProfile = (name, phone, pin) => {
    const c = { name, phone, pin };
    setCustomer(c);
    localStorage.setItem(KEY, JSON.stringify(c));
  };

  const loginWithPin = (phone, pin) => {
    try {
      const s = localStorage.getItem(KEY);
      if (!s) return false;
      const c = JSON.parse(s);
      const ok = c.phone.replace(/\D/g,'').slice(-9) === phone.replace(/\D/g,'').slice(-9) && c.pin === pin;
      if (ok) setCustomer(c);
      return ok;
    } catch { return false; }
  };

  const logout = () => { setCustomer(null); setOrders([]); localStorage.removeItem(KEY); };
  const refresh = () => { if (customer?.phone) fetchOrders(customer.phone); };

  return (
    <Ctx.Provider value={{ customer, orders, loading, setupProfile, loginWithPin, logout, refresh }}>
      {children}
    </Ctx.Provider>
  );
};

export const useCustomer = () => useContext(Ctx);