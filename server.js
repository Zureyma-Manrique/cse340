import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

const app = express();

// ESM specific workaround to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static middleware (Serves your CSS and Images)
app.use(express.static('public'));

// Routes
app.get('/', async (req, res) => {
    const pageTitle = 'Home';
    res.render('index', { title: pageTitle });
});

app.get('/organizations', async (req, res) => {
    const pageTitle = 'Organizations';
    res.render('organizations', { title: pageTitle });
});

app.get('/projects', async (req, res) => {
    const pageTitle = 'Service Projects';
    res.render('projects', { title: pageTitle });
});

// The NEW Categories Route
app.get('/categories', async (req, res) => {
    const pageTitle = 'Service Project Categories';
    res.render('categories', { title: pageTitle });
});

// Server initialization
const serverPort = process.env.PORT || 3000;

app.listen(serverPort, () => {
    console.log(`Server is running on http://localhost:${serverPort}`);
});