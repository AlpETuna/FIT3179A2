import { defineConfig } from 'vite';

// Relative assets work at both localhost and a GitHub Pages repository subpath.
export default defineConfig({ base: './', build: { target: 'es2022' } });
