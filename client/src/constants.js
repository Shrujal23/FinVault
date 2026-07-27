import {
  Settings,
  User,
  Link,
  Bell,
  Shield,
  CreditCard,
} from "lucide-react";

// From SettingsExperience.jsx
export const SETTINGS_NAV = [
  { id: 'main', icon: Settings, label: 'Overview' },
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'brokers', icon: Link, label: 'Brokers' },
  { id: 'notifications', icon: Bell, label: 'Alerts' },
  { id: 'security', icon: Shield, label: 'Security' },
];

export const SETTINGS_ITEMS = [
  { id: 'profile', icon: User, title: 'Profile', description: 'Photo, display name, and account email', action: 'profile', group: 'Account' },
  { id: 'link_broker', icon: Link, title: 'Link broker', description: 'Sync holdings from supported brokers', action: 'brokers', chevron: true, group: 'Connections' },
  { id: 'notifications', icon: Bell, title: 'Notifications', description: 'Price moves, dividends, and digests', action: 'notifications', group: 'Preferences' },
  { id: 'security', icon: Shield, title: 'Security', description: 'Password and sign-in options', action: 'security', group: 'Preferences' },
  { id: 'billing', icon: CreditCard, title: 'Billing & plan', description: 'Subscription and invoices', action: 'billing', chevron: true, group: 'Plan' },
];

// From BrokerConnection.jsx
export const INDIA_BROKERS = [
  {
    name: "Zerodha",
    description: "India's #1 Broker",
    logo: "https://zerodha.com/static/images/logo.svg",
    logoBg: "bg-white",
    connected: true,
  },
  {
    name: "Upstox",
    description: "Fast & Reliable",
    logo: "https://upstox.com/assets/img/upstox-logo.svg",
    logoBg: "bg-white",
    connected: false,
  },
  {
    name: "Angel One",
    description: "Smart Investing",
    logo: "https://static.angelone.in/images/angel-one-logo.svg",
    logoBg: "bg-white",
    connected: false,
  },
];

export const US_BROKERS = [
  {
    name: "Interactive Brokers",
    description: "Global Access",
    logo: "https://download.logo.wine/logo/Interactive_Brokers/Interactive_Brokers-Logo.wine.png",
    logoBg: "bg-white",
    connected: false,
  },
  {
    name: "Alpaca",
    description: "US Markets & Crypto",
    logo: "https://thewealthmosaic.s3.amazonaws.com/media/Logo_Alpaca.png",
    logoBg: "bg-white",
    connected: false,
  },
  {
    name: "Tradier",
    description: "US Stocks & Options",
    logo: "https://images.squarespace-cdn.com/content/v1/5f5d9506e0415a490b9b21af/1607533064474-RWXPWUA2S5KHIJVF0COJ/tradier-brokerage-vectorwithborders1500.jpg",
    logoBg: "bg-white",
    connected: false,
  },
];

// From RegisterForm.jsx
export const PASSWORD_STRENGTH_CONFIG = {
  labels: ['Too short', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'],
  colors: ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-emerald-600'],
};

export const getPasswordChecks = (password) => [
    { id: 'length', label: 'At least 12 characters', met: password.length >= 12 },
    { id: 'uppercase', label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { id: 'lowercase', label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { id: 'number', label: 'One number', met: /\d/.test(password) },
    { id: 'special', label: 'One special character', met: /[^A-Za-z0-9\s]/.test(password) },
    { id: 'spaces', label: 'No spaces', met: !/\s/.test(password) },
];