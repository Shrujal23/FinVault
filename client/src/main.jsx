import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
import { ThemeProvider } from './pages/ThemeContext.jsx';

const root = createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<ThemeProvider>
			<App />
		</ThemeProvider>
	</React.StrictMode>
);
