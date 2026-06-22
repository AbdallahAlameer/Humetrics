import { createContext, useContext, useEffect, useState } from 'react';

const PreferencesContext = createContext();

export function PreferencesProvider({ children }) {
    const [landingPage, setLandingPage] = useState(() => {
        return localStorage.getItem('humetrics-landing-page') || 'overview';
    });

    useEffect(() => {
        localStorage.setItem('humetrics-landing-page', landingPage);
    }, [landingPage]);

    return (
        <PreferencesContext.Provider value={{ landingPage, setLandingPage }}>
            {children}
        </PreferencesContext.Provider>
    );
}

export const usePreferences = () => {
    const context = useContext(PreferencesContext);
    if (context === undefined) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
};
