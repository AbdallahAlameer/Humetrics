import { useState } from 'react';
import { Bell, Monitor, Lock, Mail, AlertTriangle, Moon, Sun, DollarSign } from "lucide-react";
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { usePreferences } from '../context/PreferencesContext';

export default function Settings() {
    const { theme, setTheme } = useTheme();
    const { currency, setCurrency } = useCurrency();
    const { landingPage, setLandingPage } = usePreferences();
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [weeklySummary, setWeeklySummary] = useState(false);
    const [highRiskAlerts, setHighRiskAlerts] = useState(true);

    return (
        <div className="flex flex-col gap-8 rise">
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Notification Preferences */}
                <div className="flex flex-col gap-6">
                    <div className="border border-rule bg-card overflow-hidden">
                        <div className="p-4 border-b border-rule bg-paper/50 flex items-center gap-3">
                            <Bell className="h-5 w-5 text-primary" />
                            <h3 className="font-display text-xl text-ink">Notification Preferences</h3>
                        </div>
                        <div className="p-6 flex flex-col gap-6">
                            
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium text-ink">Email Alerts</span>
                                    <span className="text-sm text-muted-foreground">Receive instant email notifications for system events.</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />
                                    <div className="w-11 h-6 bg-rule peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium text-ink">Weekly Summaries</span>
                                    <span className="text-sm text-muted-foreground">Get a weekly digest of turnover and performance metrics.</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={weeklySummary} onChange={(e) => setWeeklySummary(e.target.checked)} />
                                    <div className="w-11 h-6 bg-rule peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium text-ink">High Risk Notifications</span>
                                    <span className="text-sm text-muted-foreground">Immediate alerts when a critical employee hits High Risk status.</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={highRiskAlerts} onChange={(e) => setHighRiskAlerts(e.target.checked)} />
                                    <div className="w-11 h-6 bg-rule peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                        </div>
                    </div>
                </div>

                {/* App Preferences */}
                <div className="flex flex-col gap-6">
                    <div className="border border-rule bg-card overflow-hidden">
                        <div className="p-4 border-b border-rule bg-paper/50 flex items-center gap-3">
                            <Monitor className="h-5 w-5 text-primary" />
                            <h3 className="font-display text-xl text-ink">App Preferences</h3>
                        </div>
                        <div className="p-6 flex flex-col gap-6">

                            <div className="flex flex-col gap-2">
                                <span className="font-medium text-ink">Appearance</span>
                                <span className="text-sm text-muted-foreground mb-2">Select your preferred color theme.</span>
                                <select 
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                    className="w-full bg-paper px-3 py-2 text-sm border border-rule rounded-none focus:outline-none focus:border-primary font-mono text-ink"
                                >
                                    <option value="dark">Dark Mode</option>
                                    <option value="light">Light Mode</option>
                                    <option value="system">System Default</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="font-medium text-ink">Default Currency</span>
                                <span className="text-sm text-muted-foreground mb-2">Currency used for salary and pay equity charts.</span>
                                <select 
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="w-full bg-paper px-3 py-2 text-sm border border-rule rounded-none focus:outline-none focus:border-primary font-mono text-ink"
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="font-medium text-ink">Default Landing Page</span>
                                <span className="text-sm text-muted-foreground mb-2">The page shown when you first log in.</span>
                                <select 
                                    value={landingPage}
                                    onChange={(e) => setLandingPage(e.target.value)}
                                    className="w-full bg-paper px-3 py-2 text-sm border border-rule rounded-none focus:outline-none focus:border-primary font-mono text-ink"
                                >
                                    <option value="overview">Overview Dashboard</option>
                                    <option value="employees">Employee Directory</option>
                                    <option value="risk-alerts">Risk & Alerts</option>
                                </select>
                            </div>

                        </div>
                        <div className="p-4 border-t border-rule bg-paper/50 flex justify-end">
                            <button className="px-4 py-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest hover:opacity-90 transition-opacity">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>

            </section>
        </div>
    );
}
