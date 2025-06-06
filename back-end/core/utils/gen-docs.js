import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openapiSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Game API',
            version: '1.0.0',
            description: 'API for game system'
        },
        servers: [
            {
                url: 'http://localhost:8000'
            }
        ]
    },
    apis: [path.resolve(__dirname, '../router/*.js')],
});
const outputPath = path.join(process.cwd(), '/config/openapi.json');

fs.writeFileSync(outputPath, JSON.stringify(openapiSpec, null, 2));
console.log(`OpenAPI spec generated at ${outputPath}`);