require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Basic configuration check
if (!process.env.PORT || !process.env.AUTH) {
    console.error('Missing required environment variables PORT, AUTH');
    //process.exit(1);
}

// Set up EJS as view engine
app.set('view engine', 'ejs');
app.set('views', 'views');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Use app name from environment variables
app.locals.appName = process.env.APP_NAME || 'Recipe App';

// In-memory database (replace with a real database in production)
let recipes = [
    {
        id: 1,
        title: 'Spaghetti Carbonara',
        ingredients: ['spaghetti', 'eggs', 'bacon', 'parmesan', 'black pepper'],
        instructions: 'Cook pasta. Mix eggs with cheese. Combine with cooked bacon and pasta.'
    },
    {
        id: 2,
        title: 'Chocolate Chip Cookies',
        ingredients: ['flour', 'butter', 'sugar', 'chocolate chips', 'eggs'],
        instructions: 'Mix ingredients. Bake at 350°F for 10-12 minutes.'
    }
];

// Routes
app.get('/', (req, res) => {
    res.render('index', { recipes });
});

app.get('/recipe/:id', (req, res) => {
    const recipe = recipes.find(r => r.id == req.params.id);
    if (!recipe) {
        return res.status(404).send('Recipe not found');
    }
    res.render('recipe', { recipe });
});

app.get('/add-recipe', (req, res) => {
    res.render('add-recipe');
});

app.post('/add-recipe', (req, res) => {
    const newRecipe = {
        id: recipes.length > 0 ? Math.max(...recipes.map(r => r.id)) + 1 : 1,
        title: req.body.title,
        ingredients: req.body.ingredients.split(',').map(i => i.trim()),
        instructions: req.body.instructions
    };
    recipes.push(newRecipe);
    res.redirect('/');
});

app.get('/edit-recipe/:id', (req, res) => {
    const recipe = recipes.find(r => r.id == req.params.id);
    if (!recipe) {
        return res.status(404).send('Recipe not found');
    }
    res.render('edit-recipe', { recipe });
});

app.post('/edit-recipe/:id', (req, res) => {
    const recipe = recipes.find(r => r.id == req.params.id);
    if (!recipe) {
        return res.status(404).send('Recipe not found');
    }
    recipe.title = req.body.title;
    recipe.ingredients = req.body.ingredients.split(',').map(i => i.trim());
    recipe.instructions = req.body.instructions;
    res.redirect(`/recipe/${req.params.id}`);
});

app.post('/delete-recipe/:id', (req, res) => {
    recipes = recipes.filter(r => r.id != req.params.id);
    res.redirect('/');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});