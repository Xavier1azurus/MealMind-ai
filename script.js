
"use strict";

/* =========================================================
   MEALMIND
   Fixed buttons + clickable recipes + cookbook recipe view
   ========================================================= */

const STORAGE_KEY = "mealmind_data";

let mealMind = loadData();
let currentBook = null;
let currentFolder = null;
let currentRecipe = null;


/* =========================================================
   STORAGE
   ========================================================= */

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
            const data = JSON.parse(saved);

            if (data && Array.isArray(data.books)) {
                return data;
            }
        }
    } catch (error) {
        console.error("MealMind storage error:", error);
    }

    return {
        books: []
    };
}


function saveData() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(mealMind)
    );
}


function id() {
    return (
        Date.now().toString(36) +
        Math.random().toString(36).substring(2)
    );
}


function escapeHTML(text) {
    return String(text ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   SCREEN SYSTEM
   ========================================================= */

function hideScreens() {

    document
        .querySelectorAll(
            ".screen, [data-screen]"
        )
        .forEach(screen => {
            screen.classList.add("hidden");
        });
}


function showScreen(screenId) {

    hideScreens();

    const screen =
        document.getElementById(screenId);

    if (screen) {
        screen.classList.remove("hidden");
    }
}


/* =========================================================
   BUTTON SYSTEM
   ========================================================= */

/*
   This uses ONE event listener for the whole document.

   That means buttons still work even if MealMind
   creates them later with JavaScript.
*/

document.addEventListener("click", function(event) {

    const button =
        event.target.closest("button");

    if (!button) return;


    /* HOME */

    if (
        button.matches(
            "#makeCookbookButton, [data-action='make-cookbook']"
        )
    ) {
        showScreen("makeScreen");
        return;
    }


    if (
        button.matches(
            "#joinCookbookButton, [data-action='join-cookbook']"
        )
    ) {
        showScreen("joinScreen");
        return;
    }


    if (
        button.matches(
            "#publicBooksButton, [data-action='public-books']"
        )
    ) {
        showScreen("publicScreen");
        renderPublicBooks();
        return;
    }


    /* BACK */

    if (
        button.matches(
            "#backFromMake, #backFromJoin, #backFromPublic, [data-action='home']"
        )
    ) {
        goHome();
        return;
    }


    /* EXIT BOOK */

    if (
        button.matches(
            "#exitBookButton, [data-action='exit-book']"
        )
    ) {
        goHome();
        return;
    }


    /* CREATE COOKBOOK */

    if (
        button.matches(
            "#createCookbookButton, [data-action='create-cookbook']"
        )
    ) {
        createCookbook();
        return;
    }


    /* JOIN */

    if (
        button.matches(
            "#joinButton, [data-action='join']"
        )
    ) {
        joinCookbook();
        return;
    }


    /* SCAN */

    if (
        button.matches(
            "#scanButton, [data-action='scan']"
        )
    ) {
        document
            .getElementById("cameraInput")
            ?.click();

        return;
    }


    /* CLOSE RECIPE */

    if (
        button.matches(
            "#closeRecipeViewer, [data-action='close-recipe']"
        )
    ) {
        closeRecipe();
        return;
    }


    /* DELETE RECIPE */

    if (
        button.matches(
            "[data-action='delete-recipe']"
        )
    ) {
        deleteRecipe();
        return;
    }


    /* EDIT RECIPE */

    if (
        button.matches(
            "[data-action='edit-recipe']"
        )
    ) {
        editCurrentRecipe();
        return;
    }


    /* SERVING DOWN */

    if (
        button.matches(
            "#recipeServingMinus"
        )
    ) {
        changeServings(-1);
        return;
    }


    /* SERVING UP */

    if (
        button.matches(
            "#recipeServingPlus"
        )
    ) {
        changeServings(1);
        return;
    }


    /* FOLDER */

    if (
        button.matches(
            "[data-folder]"
        )
    ) {

        currentFolder =
            button.dataset.folder;

        renderRecipes();

        return;
    }


    /* RECIPE */

    if (
        button.matches(
            "[data-recipe-id]"
        )
    ) {

        const recipeId =
            button.dataset.recipeId;

        const recipe =
            currentBook?.recipes?.find(
                item => item.id === recipeId
            );

        if (recipe) {
            openRecipe(recipe);
        }

        return;
    }

});


/* =========================================================
   HOME
   ========================================================= */

function goHome() {

    currentBook = null;
    currentFolder = null;
    currentRecipe = null;

    closeRecipe();

    showScreen("homeScreen");
}


/* =========================================================
   CREATE COOKBOOK
   ========================================================= */

function createCookbook() {

    const name =
        document
            .getElementById("cookbookName")
            ?.value
            .trim();

    const password =
        document
            .getElementById("cookbookPassword")
            ?.value || "";

    if (!name) {
        alert("Enter a cookbook name.");
        return;
    }

    if (password.length < 4) {
        alert(
            "Your cookbook code must be at least 4 characters."
        );
        return;
    }

    currentBook = {

        id: id(),

        name: name,

        password: password,

        privacy: "private",

        folders: [
            "Recipes"
        ],

        recipes: []
    };

    mealMind.books.push(currentBook);

    saveData();

    openBook();
}


/* =========================================================
   JOIN COOKBOOK
   ========================================================= */

function joinCookbook() {

    const name =
        document
            .getElementById("joinName")
            ?.value
            .trim();

    const password =
        document
            .getElementById("joinPassword")
            ?.value || "";

    const book =
        mealMind.books.find(
            item =>
                item.name.toLowerCase() ===
                name.toLowerCase()
        );

    if (!book) {
        alert("Cookbook not found.");
        return;
    }

    if (book.password !== password) {
        alert("Wrong cookbook code.");
        return;
    }

    currentBook = book;

    openBook();
}


/* =========================================================
   OPEN BOOK
   ========================================================= */

function openBook() {

    if (!currentBook) return;

    showScreen("mainScreen");

    const name =
        document.getElementById(
            "mainBookName"
        );

    if (name) {
        name.textContent =
            currentBook.name;
    }

    currentFolder = null;

    renderFolders();
    renderRecipes();
}


/* =========================================================
   FOLDERS
   ========================================================= */

function renderFolders() {

    const container =
        document.getElementById("folders");

    if (!container) return;

    container.innerHTML = "";

    const folders =
        currentBook?.folders || [];

    folders.forEach(folder => {

        const count =
            currentBook.recipes.filter(
                recipe =>
                    recipe.folder === folder
            ).length;

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "folder-card";

        button.dataset.folder =
            folder;

        button.innerHTML = `
            <span class="folder-icon">📁</span>

            <strong>
                ${escapeHTML(folder)}
            </strong>

            <small>
                ${count}
                ${count === 1 ? "recipe" : "recipes"}
            </small>
        `;

        container.appendChild(button);
    });
}


/* =========================================================
   RECIPES
   ========================================================= */

function renderRecipes() {

    const container =
        document.getElementById("recipes");

    if (!container) return;

    container.innerHTML = "";

    let recipes =
        currentBook?.recipes || [];


    if (currentFolder) {

        recipes =
            recipes.filter(
                recipe =>
                    recipe.folder ===
                    currentFolder
            );
    }


    const search =
        document
            .getElementById("searchInput")
            ?.value
            .trim()
            .toLowerCase();


    if (search) {

        recipes =
            recipes.filter(recipe =>
                (
                    recipe.title ||
                    ""
                )
                .toLowerCase()
                .includes(search)
            );
    }


    if (!recipes.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div>🍽️</div>
                <h3>No recipes yet</h3>
                <p>
                    Scan a recipe to add it
                    to your cookbook.
                </p>
            </div>
        `;

        return;
    }


    recipes.forEach(recipe => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "recipe-card";

        /*
         * THIS IS THE IMPORTANT PART.
         *
         * Every recipe gets its own ID.
         *
         * Clicking the card opens the
         * actual recipe.
         */

        button.dataset.recipeId =
            recipe.id;

        button.innerHTML = `

            <div class="recipe-card-icon">
                🍴
            </div>

            <div class="recipe-card-text">

                <strong>
                    ${escapeHTML(
                        recipe.title ||
                        "Untitled Recipe"
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        recipe.cuisine ||
                        "Recipe"
                    )}
                </span>

            </div>

            <span class="recipe-arrow">
                ›
            </span>
        `;

        container.appendChild(button);
    });
}


/* =========================================================
   SEARCH
   ========================================================= */

document.addEventListener(
    "input",
    event => {

        if (
            event.target.id ===
            "searchInput"
        ) {
            renderRecipes();
        }

    }
);


/* =========================================================
   OPEN RECIPE
   ========================================================= */

function openRecipe(recipe) {

    currentRecipe = recipe;

    let viewer =
        document.getElementById(
            "recipeViewer"
        );


    /*
     * Create the recipe viewer if it
     * doesn't already exist.
     */

    if (!viewer) {

        viewer =
            document.createElement(
                "div"
            );

        viewer.id =
            "recipeViewer";

        document.body.appendChild(
            viewer
        );
    }


    viewer.className =
        "recipe-viewer";


    const servings =
        Number(recipe.servings) || 4;


    viewer.innerHTML = `

        <div class="recipe-viewer-background">

            <article class="recipe-sheet">


                <!-- TOP BAR -->

                <div class="recipe-topbar">

                    <button
                        type="button"
                        id="closeRecipeViewer"
                        class="recipe-back-button"
                    >
                        ← Back
                    </button>


                    <div class="recipe-actions">

                        <button
                            type="button"
                            data-action="edit-recipe"
                            class="recipe-action-button"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            data-action="delete-recipe"
                            class="recipe-action-button danger"
                        >
                            Delete
                        </button>

                    </div>

                </div>


                <!-- RECIPE HEADER -->

                <header class="recipe-header">

                    <div class="recipe-label">
                        MEALMIND
                    </div>

                    <h1>
                        ${escapeHTML(
                            recipe.title ||
                            "Untitled Recipe"
                        )}
                    </h1>


                    ${
                        recipe.cuisine
                        ? `
                            <p class="recipe-cuisine">
                                ${escapeHTML(
                                    recipe.cuisine
                                )}
                            </p>
                        `
                        : ""
                    }


                    <div class="recipe-serving-row">

                        <span>
                            🍽️ Serves
                        </span>

                        <strong
                            id="recipeServingNumber"
                        >
                            ${servings}
                        </strong>


                        <button
                            type="button"
                            id="recipeServingMinus"
                        >
                            −
                        </button>

                        <button
                            type="button"
                            id="recipeServingPlus"
                        >
                            +
                        </button>

                    </div>

                </header>


                <div class="recipe-line"></div>


                <!-- INGREDIENTS -->

                <section class="recipe-section">

                    <h2>
                        Ingredients
                    </h2>

                    <ul
                        id="recipeIngredientList"
                        class="recipe-ingredients"
                    ></ul>

                </section>


                <!-- INSTRUCTIONS -->

                <section class="recipe-section">

                    <h2>
                        Instructions
                    </h2>

                    <ol
                        id="recipeInstructionList"
                        class="recipe-instructions"
                    ></ol>

                </section>


                <!-- NOTES -->

                ${
                    recipe.notes
                    ? `
                        <section class="recipe-section recipe-notes">

                            <h2>
                                Notes
                            </h2>

                            <p>
                                ${escapeHTML(
                                    recipe.notes
                                )}
                            </p>

                        </section>
                    `
                    : ""
                }


                <footer class="recipe-footer">
                    Made with MealMind
                </footer>

            </article>

        </div>
    `;


    renderIngredients(
        recipe,
        servings
    );


    renderInstructions(
        recipe
    );
}


/* =========================================================
   INGREDIENTS
   ========================================================= */

function renderIngredients(
    recipe,
    servings
) {

    const list =
        document.getElementById(
            "recipeIngredientList"
        );

    if (!list) return;

    list.innerHTML = "";


    const originalServings =
        Number(recipe.servings) || 4;


    const multiplier =
        servings /
        originalServings;


    (
        recipe.ingredients || []
    ).forEach(ingredient => {

        const li =
            document.createElement(
                "li"
            );

        li.textContent =
            scaleIngredient(
                ingredient,
                multiplier
            );

        list.appendChild(li);
    });
}


/* =========================================================
   INSTRUCTIONS
   ========================================================= */

function renderInstructions(recipe) {

    const list =
        document.getElementById(
            "recipeInstructionList"
        );

    if (!list) return;

    list.innerHTML = "";


    (
        recipe.instructions || []
    ).forEach(instruction => {

        const li =
            document.createElement(
                "li"
            );

        li.textContent =
            instruction;

        list.appendChild(li);
    });
}


/* =========================================================
   SERVING CALCULATOR
   ========================================================= */

function changeServings(amount) {

    if (!currentRecipe) return;


    const display =
        document.getElementById(
            "recipeServingNumber"
        );

    if (!display) return;


    let servings =
        Number(display.textContent) || 4;


    servings += amount;


    if (servings < 1) {
        servings = 1;
    }


    display.textContent =
        servings;


    renderIngredients(
        currentRecipe,
        servings
    );
}


/* =========================================================
   INGREDIENT SCALING
   ========================================================= */

const fractions = {

    "½": 0.5,
    "⅓": 1 / 3,
    "⅔": 2 / 3,
    "¼": 0.25,
    "¾": 0.75,
    "⅛": 0.125,
    "⅜": 0.375,
    "⅝": 0.625,
    "⅞": 0.875
};


function fractionValue(value) {

    if (fractions[value] !== undefined) {
        return fractions[value];
    }


    if (value.includes("/")) {

        const parts =
            value.split("/");

        if (parts.length === 2) {

            const a =
                Number(parts[0]);

            const b =
                Number(parts[1]);

            if (b !== 0) {
                return a / b;
            }
        }
    }


    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : null;
}


function formatNumber(number) {

    const common = [

        [0.125, "⅛"],
        [0.25, "¼"],
        [0.333, "⅓"],
        [0.375, "⅜"],
        [0.5, "½"],
        [0.625, "⅝"],
        [0.667, "⅔"],
        [0.75, "¾"],
        [0.875, "⅞"]

    ];


    const whole =
        Math.floor(number);

    const decimal =
        number - whole;


    for (
        const [value, symbol]
        of common
    ) {

        if (
            Math.abs(
                decimal - value
            ) < 0.03
        ) {

            if (whole === 0) {
                return symbol;
            }

            return `${whole} ${symbol}`;
        }
    }


    if (
        Math.abs(
            number -
            Math.round(number)
        ) < 0.01
    ) {

        return String(
            Math.round(number)
        );
    }


    return String(
        Math.round(number * 100) / 100
    );
}


function scaleIngredient(
    ingredient,
    multiplier
) {

    if (multiplier === 1) {
        return ingredient;
    }


    /*
     * 1 ½ cups
     */

    const mixed =
        ingredient.match(
            /^(\d+)\s+(½|⅓|⅔|¼|¾|⅛|⅜|⅝|⅞)\b/
        );


    if (mixed) {

        const amount =
            Number(mixed[1]) +
            fractions[mixed[2]];


        return (
            formatNumber(
                amount * multiplier
            ) +
            ingredient.slice(
                mixed[0].length
            )
        );
    }


    /*
     * ½ cup
     */

    const unicode =
        ingredient.match(
            /^(½|⅓|⅔|¼|¾|⅛|⅜|⅝|⅞)\b/
        );


    if (unicode) {

        return (
            formatNumber(
                fractions[unicode[1]] *
                multiplier
            ) +
            ingredient.slice(
                unicode[0].length
            )
        );
    }


    /*
     * 2 cups
     * 1/2 cup
     */

    const normal =
        ingredient.match(
            /^(\d+(?:\.\d+)?|\d+\/\d+)\b/
        );


    if (!normal) {
        return ingredient;
    }


    const amount =
        fractionValue(
            normal[1]
        );


    if (amount === null) {
        return ingredient;
    }


    return (
        formatNumber(
            amount * multiplier
        ) +
        ingredient.slice(
            normal[0].length
        )
    );
}


/* =========================================================
   CLOSE RECIPE
   ========================================================= */

function closeRecipe() {

    const viewer =
        document.getElementById(
            "recipeViewer"
        );

    if (viewer) {
        viewer.remove();
    }

    currentRecipe = null;
}


/* =========================================================
   DELETE RECIPE
   ========================================================= */

function deleteRecipe() {

    if (
        !currentBook ||
        !currentRecipe
    ) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${currentRecipe.title}"?`
        );


    if (!confirmed) return;


    currentBook.recipes =
        currentBook.recipes.filter(
            recipe =>
                recipe.id !==
                currentRecipe.id
        );


    saveData();

    closeRecipe();

    renderRecipes();
    renderFolders();
}


/* =========================================================
   EDIT RECIPE
   ========================================================= */

function editCurrentRecipe() {

    if (!currentRecipe) return;

    /*
     * If your existing editor exists,
     * use it.
     */

    if (
        typeof openRecipeEditor ===
        "function"
    ) {

        openRecipeEditor(
            currentRecipe
        );

        return;
    }


    /*
     * Otherwise give a simple message
     * instead of making the button do
     * nothing.
     */

    alert(
        "The recipe editor is ready to connect to your edit screen."
    );
}


/* =========================================================
   PUBLIC BOOKS
   ========================================================= */

function renderPublicBooks() {

    const container =
        document.getElementById(
            "publicBooksList"
        );

    if (!container) return;

    container.innerHTML = "";


    const books =
        mealMind.books.filter(
            book =>
                book.privacy ===
                "public"
        );


    if (!books.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div>📚</div>
                <p>
                    No public cookbooks yet.
                </p>
            </div>
        `;

        return;
    }


    books.forEach(book => {

        const button =
            document.createElement(
                "button"
            );

        button.type = "button";

        button.className =
            "main-button";

        button.textContent =
            `📖 ${book.name}`;


        button.addEventListener(
            "click",
            () => {

                currentBook =
                    book;

                openBook();
            }
        );


        container.appendChild(
            button
        );
    });
}


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
         * Don't automatically open a cookbook.
         *
         * The user starts at the MealMind
         * home screen.
         */

        hideScreens();

        const home =
            document.getElementById(
                "homeScreen"
            );

        if (home) {
            home.classList.remove(
                "hidden"
            );
        }


        /*
         * Make sure existing recipes
         * have IDs.
         */

        let changed = false;


        mealMind.books.forEach(
            book => {

                if (!Array.isArray(
                    book.recipes
                )) {
                    book.recipes = [];
                    changed = true;
                }


                book.recipes.forEach(
                    recipe => {

                        if (!recipe.id) {

                            recipe.id =
                                id();

                            changed = true;
                        }

                        if (
                            !Array.isArray(
                                recipe.ingredients
                            )
                        ) {
                            recipe.ingredients = [];
                            changed = true;
                        }

                        if (
                            !Array.isArray(
                                recipe.instructions
                            )
                        ) {
                            recipe.instructions = [];
                            changed = true;
                        }

                    }
                );
            }
        );


        if (changed) {
            saveData();
        }

    }
);

