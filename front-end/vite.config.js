import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';


export default defineConfig(({ mode }) => {
    let envFile = '.env.dev';

    if (mode === "docker_dev") {
        envFile = null;
    } else if (mode === 'production') {
        envFile = '.env.production';
    } else if (!fs.existsSync(path.resolve(__dirname, envFile))) {
        envFile = '.env.develop';
    }

    let env = process.env;
    if (envFile && fs.existsSync(path.resolve(__dirname, envFile))) {
        console.log(`Loading environment from ${envFile}`);
        const result = dotenv.config({ path: path.resolve(__dirname, envFile) });
        if (result.parsed) {
            env = result.parsed;
        }
    }

    const backendUrl = env.BACKEND_URL.replace(/\/+$/, '');

    return {
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src/'),
                '@utils': path.resolve(__dirname, './src/core/utils/'),
                '@engine': path.resolve(__dirname, './src/core/engine/'),
                '@screens': path.resolve(__dirname, './src/screens/'),
                '@assets': path.resolve(__dirname, './src/assets/'),
                '@sprites': path.resolve(__dirname, './src/assets/sprites/'),
                '@tiles': path.resolve(__dirname, './src/assets/tiles/')
            }
        },
        css: {
            modules: {
                scopeBehaviour: 'local',
                localsConvention: 'camelCase',
                generateScopedName: '[name]__[local]___[hash:base64:5]',
            }
        },
        server: {
            proxy: {
                '/socket.io': {
                    target: backendUrl,
                    ws: true,
                    changeOrigin: true
                }
            }
        },
        define: {
            'process.env': env
        }
    };
});