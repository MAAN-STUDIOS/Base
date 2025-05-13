import { defineConfig } from 'vite';
import path from 'path';


export default defineConfig({
  resolve : {
    alias : {
      '@': path.resolve(__dirname, './src/'),
      '@utils': path.resolve(__dirname, './src/core/utils/'),
      '@engine': path.resolve(__dirname, './src/core/engine/'),
      '@screens': path.resolve(__dirname, './src/screens/'),
      '@assets': path.resolve(__dirname, './src/assets/'),
      '@sprites': path.resolve(__dirname, './src/assets/sprites/'),
      '@tiles': path.resolve(__dirname, './src/assets/tiles/')
    }
  },
});
