// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  base: '/',
  build: {
    format: 'file',
    inlineStylesheets: 'always',
    assetsPrefix: '/'
  },
  vite: {
    base: '/',
    build: {
      minify: 'esbuild',
      cssCodeSplit: false
    }
  }
});
