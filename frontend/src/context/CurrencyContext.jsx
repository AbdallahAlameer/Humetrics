import { createContext, useContext, useEffect, useState } from 'react';

const CurrencyContext = createContext();

const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
};

const exchangeRates = {
    'USD': 1.0,
    'EUR': 0.92, // mock static conversion rate
    'GBP': 0.79  // mock static conversion rate
};

export function CurrencyProvider({ children }) {
    const [currency, setCurrency] = useState(() => {
        return localStorage.getItem('humetrics-currency') || 'USD';
    });

    useEffect(() => {
        localStorage.setItem('humetrics-currency', currency);
    }, [currency]);

    // Format currency taking into account the symbol and exchange rate
    const formatCurrency = (amountInUSD) => {
        if (amountInUSD == null) return '—';
        const rate = exchangeRates[currency] || 1.0;
        const symbol = currencySymbols[currency] || '$';
        const converted = amountInUSD * rate;
        
        // Return formatted string with commas (e.g., $100,000)
        return `${symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    };
    
    // Format shorthand (e.g. $100K)
    const formatCurrencyShorthand = (amountInUSD) => {
        if (amountInUSD == null) return '—';
        const rate = exchangeRates[currency] || 1.0;
        const symbol = currencySymbols[currency] || '$';
        const converted = amountInUSD * rate;
        
        return `${symbol}${(converted / 1000).toFixed(0)}K`;
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, formatCurrencyShorthand }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
