import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Relative assets work at both a custom domain and /repository/ GitHub Pages URLs.
export default defineConfig({ plugins: [react()], base: './' });
