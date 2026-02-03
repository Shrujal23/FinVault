import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
import { ThemeProvider } from './pages/ThemeContext.jsx';
import { Analytics } from '@vercel/analytics/react';

const root = createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<ThemeProvider>
			<App />
			<Analytics />
		</ThemeProvider>
	</React.StrictMode>
);
