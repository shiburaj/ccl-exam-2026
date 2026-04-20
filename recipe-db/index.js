require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { pool, testConnection } = require('./database');

const app = express();

// Test database connection
testConnection();

// Set up EJS as view engine
app.set('view engine', 'ejs');
app.set('views', 'views');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Use app name from environment variables
app.locals.appName = process.env.APP_NAME || 'Recipe App';

// Routes
app.get('/', async (req, res, next) => {
    try {
        const [recipes] = await pool.query(`
            SELECT r.*, GROUP_CONCAT(i.name SEPARATOR ', ') AS ingredient_list
            FROM recipes r
            LEFT JOIN ingredients i ON r.id = i.recipe_id
            GROUP BY r.id
        `);
        
        // Format recipes for the view
        const formattedRecipes = recipes.map(recipe => ({
            ...recipe,
            ingredients: recipe.ingredient_list ? recipe.ingredient_list.split(', ') : []
        }));
        
        res.render('index', { recipes: formattedRecipes });
    } catch (error) {
        next(error);
    }
});

app.get('/recipe/:id', async (req, res, next) => {
    try {
        const [recipes] = await pool.query(`
            SELECT r.*, GROUP_CONCAT(i.name SEPARATOR ', ') AS ingredient_list
            FROM recipes r
            LEFT JOIN ingredients i ON r.id = i.recipe_id
            WHERE r.id = ?
            GROUP BY r.id
        `, [req.params.id]);
        
        if (recipes.length === 0) {
            return res.status(404).send('Recipe not found');
        }
        
        const recipe = {
            ...recipes[0],
            ingredients: recipes[0].ingredient_list ? recipes[0].ingredient_list.split(', ') : []
        };
        
        res.render('recipe', { recipe });
    } catch (error) {
        next(error);
    }
});

app.get('/add-recipe', (req, res) => {
    res.render('add-recipe');
});

app.post('/add-recipe', async (req, res, next) => {
    const { title, ingredients, instructions } = req.body;
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // Insert recipe
        const [result] = await connection.query(
            'INSERT INTO recipes (title, instructions) VALUES (?, ?)',
            [title, instructions]
        );
        
        const recipeId = result.insertId;
        
        // Insert ingredients
        if (ingredients) {
            const ingredientValues = ingredients.split(',')
                .map(i => i.trim())
                .filter(i => i.length > 0)
                .map(name => [recipeId, name]);
            
            if (ingredientValues.length > 0) {
                await connection.query(
                    'INSERT INTO ingredients (recipe_id, name) VALUES ?',
                    [ingredientValues]
                );
            }
        }
        
        await connection.commit();
        res.redirect('/');
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
});

app.get('/edit-recipe/:id', async (req, res, next) => {
    try {
        const [recipes] = await pool.query(`
            SELECT r.*, GROUP_CONCAT(i.name SEPARATOR ', ') AS ingredient_list
            FROM recipes r
            LEFT JOIN ingredients i ON r.id = i.recipe_id
            WHERE r.id = ?
            GROUP BY r.id
        `, [req.params.id]);
        
        if (recipes.length === 0) {
            return res.status(404).send('Recipe not found');
        }
        
        const recipe = {
            ...recipes[0],
            ingredients: recipes[0].ingredient_list || ''
        };
        
        res.render('edit-recipe', { recipe });
    } catch (error) {
        next(error);
    }
});

app.post('/edit-recipe/:id', async (req, res, next) => {
    const { title, ingredients, instructions } = req.body;
    const recipeId = req.params.id;
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // Update recipe
        await connection.query(
            'UPDATE recipes SET title = ?, instructions = ? WHERE id = ?',
            [title, instructions, recipeId]
        );
        
        // Delete existing ingredients
        await connection.query(
            'DELETE FROM ingredients WHERE recipe_id = ?',
            [recipeId]
        );
        
        // Insert new ingredients
        if (ingredients) {
            const ingredientValues = ingredients.split(',')
                .map(i => i.trim())
                .filter(i => i.length > 0)
                .map(name => [recipeId, name]);
            
            if (ingredientValues.length > 0) {
                await connection.query(
                    'INSERT INTO ingredients (recipe_id, name) VALUES ?',
                    [ingredientValues]
                );
            }
        }
        
        await connection.commit();
        res.redirect(`/recipe/${recipeId}`);
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
});

app.post('/delete-recipe/:id', async (req, res, next) => {
    try {
        // No need to delete ingredients separately due to ON DELETE CASCADE
        await pool.query('DELETE FROM recipes WHERE id = ?', [req.params.id]);
        res.redirect('/');
    } catch (error) {
        next(error);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});