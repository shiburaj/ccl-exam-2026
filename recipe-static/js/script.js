document.addEventListener('DOMContentLoaded', function() {
    // Recipe data
    const recipes = [
        {
            id: 'spaghetti',
            title: 'Spaghetti Carbonara',
            category: 'main',
            time: '25 mins',
            image: 'images/spaghetti.jpg',
            description: 'Classic Italian pasta with eggs, cheese, and pancetta.'
        },
        {
            id: 'cookies',
            title: 'Chocolate Chip Cookies',
            category: 'bakery',
            time: '35 mins',
            image: 'images/cookies.jpg',
            description: 'Soft and chewy cookies with melty chocolate chips.'
        },
        {
            id: 'salad',
            title: 'Greek Salad',
            category: 'salad',
            time: '15 mins',
            image: 'images/salad.jpg',
            description: 'Fresh and healthy Mediterranean salad.'
        },
        {
            id: 'pancakes',
            title: 'Fluffy Pancakes',
            category: 'bakery',
            time: '20 mins',
            image: 'images/pancakes.jpg',
            description: 'Light and fluffy pancakes perfect for breakfast.'
        },
        {
            id: 'burger',
            title: 'Classic Burger',
            category: 'main',
            time: '30 mins',
            image: 'images/burger.jpg',
            description: 'Juicy beef patty with all the classic toppings.'
        }
    ];

    // DOM Elements
    const recipeList = document.getElementById('recipe-list');
    const searchInput = document.getElementById('search');
    const categoryFilter = document.getElementById('category-filter');

    // Display all recipes
    function displayRecipes(recipesToDisplay) {
        recipeList.innerHTML = '';
        
        recipesToDisplay.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';
            recipeCard.innerHTML = `
                <div class="recipe-info">
                    <h3>${recipe.title}</h3>
                    <p class="time"><i class="far fa-clock"></i> ${recipe.time}</p>
                    <p class="description">${recipe.description}</p>
                    <a href="recipes.html#${recipe.id}" class="btn">View Recipe</a>
                </div>
            `;
            recipeList.appendChild(recipeCard);
        });
    }

    // Filter recipes
    function filterRecipes() {
        const searchTerm = searchInput.value.toLowerCase();
        const category = categoryFilter.value;
        
        const filteredRecipes = recipes.filter(recipe => {
            const matchesSearch = recipe.title.toLowerCase().includes(searchTerm) || 
                                 recipe.description.toLowerCase().includes(searchTerm);
            const matchesCategory = category === 'all' || recipe.category === category;
            
            return matchesSearch && matchesCategory;
        });
        
        displayRecipes(filteredRecipes);
    }

    // Event listeners
    if (searchInput && categoryFilter) {
        searchInput.addEventListener('input', filterRecipes);
        categoryFilter.addEventListener('change', filterRecipes);
        
        // Initial display
        displayRecipes(recipes);
    }

    // Highlight current recipe in list when viewing details
    if (window.location.hash) {
        const recipeId = window.location.hash.substring(1);
        const recipeLinks = document.querySelectorAll(`a[href="#${recipeId}"]`);
        
        recipeLinks.forEach(link => {
            link.classList.add('current-recipe');
        });
    }

    // Mobile menu toggle (could be added if needed)
});