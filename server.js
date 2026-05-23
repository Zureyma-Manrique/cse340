import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { testConnection } from './src/models/db.js';
import router from './src/routes.js'; // Import your unified router matrix

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));

// Global request logger middleware (Learning Activity requirement)
app.use((req, res, next) => {
    console.log(`${req.method} request received for: ${req.url}`);
    next();
});

// Direct Express to route matching pathways via your clean router module
app.use(router);

// Centralized Catch-All Error Handlers (Learning Activity placeholder structure)
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    console.error(`Error occurred: ${err.message}`);
    const status = err.status || 500;
    res.status(status).render('index', { title: status === 404 ? '404: Not Found' : '500: Server Error' });
});

const serverPort = process.env.PORT || 3000;

app.listen(serverPort, async () => {
    try {
        await testConnection();
        console.log(`Server running smoothly on http://localhost:${serverPort}`);
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
});