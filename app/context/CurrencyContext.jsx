'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [selectedCurrency, setSelectedCurrency] = useState('NGN');
  const [exchangeRates, setExchangeRates] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch exchange rates on mount and every hour
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/NGN`);
        const data = await response.json();
        setExchangeRates(data.rates);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
        setLoading(false);
      }
    };

    fetchExchangeRates();
    const interval = setInterval(fetchExchangeRates, 3600000); // Update every hour

    return () => clearInterval(interval);
  }, []);

  // Convert price from NGN to selected currency
  const convertPrice = (priceInNGN) => {
    if (!exchangeRates || !priceInNGN) return priceInNGN;

    const NGNtoUSD = exchangeRates['USD']; // Get NGN to USD rate
    const priceInUSD = priceInNGN * NGNtoUSD;

    if (selectedCurrency === 'NGN') return priceInNGN;
    
    const USDtoTarget = exchangeRates[selectedCurrency] / exchangeRates['USD'];
    const convertedPrice = priceInUSD * USDtoTarget;

    return Number(convertedPrice.toFixed(2));
  };

  // Format price with currency symbol
  const formatPrice = (price) => {
    const currencies = {
      NGN: { symbol: '₦', position: 'before' },
      USD: { symbol: '$', position: 'before' },
      EUR: { symbol: '€', position: 'before' },
      GBP: { symbol: '£', position: 'before' },
      JPY: { symbol: '¥', position: 'before' },
      CHF: { symbol: 'CHF', position: 'before' },
    };

    const { symbol, position } = currencies[selectedCurrency];
    const formattedNumber = price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return position === 'before' ? `${symbol}${formattedNumber}` : `${formattedNumber}${symbol}`;
  };

  const value = {
    selectedCurrency,
    setSelectedCurrency,
    convertPrice,
    formatPrice,
    loading,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
} 