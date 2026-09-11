import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
import { ThemeProvider } from './pages/ThemeContext.jsx';
import { AuthProvider } from './hooks/useAuth.js';
import { Analytics } from '@vercel/analytics/react';

const root = createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<ThemeProvider>
			<AuthProvider>
				<App />
				<Analytics />
			</AuthProvider>
		</ThemeProvider>
	</React.StrictMode>
);
