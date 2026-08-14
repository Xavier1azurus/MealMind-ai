"use strict";

/* =========================================================
   MEALMIND
   Complete JavaScript
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

        console.error("Could not load MealMind:", error);
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


function makeID() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2)
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

function showScreen(id) {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {
            screen.classList.add("hidden");
        });

    const screen = document.getElementById(id);

    if (screen) {
        screen.classList.remove("hidden");
    }
}


function goHome() {

    closeRecipe();
    closeEditor();

    currentBook = null;
    currentFolder = null;
    currentRecipe = null;

    showScreen("homeScreen");
}


/* =========================================================
   HOME BUTTONS
   ========================================================= */

function setupHomeButtons() {

    document
        .getElementById("makeCookbookBtn")
        ?.addEventListener("click", () => {

            showScreen("makeScreen");

        });


    document
        .getElementById("joinCookbookBtn")
        ?.addEventListener("click", () => {

            showScreen("joinScreen");

        });


    document
        .getElementById("publicBooksBtn")
        ?.addEventListener("click", () => {

            showScreen("publicScreen");

            renderPublicBooks();

        });


    document
        .getElementById("makeBackBtn")
        ?.addEventListener("click", goHome);


    document
        .getElementById("joinBackBtn")
        ?.addEventListener("click", goHome);


    document
        .getElementById("publicBackBtn")
        ?.addEventListener("click", goHome);


    document
        .getElementById("exitBookBtn")
        ?.addEventListener("click", goHome);


    document
        .getElementById("createCookbookBtn")
        ?.addEventListener(
            "click",
            createCookbook
        );


    document
        .getElementById("joinBtn")
        ?.addEventListener(
            "click",
            joinCookbook
        );


    document
        .getElementById("showCreatePassword")
        ?.addEventListener("change", event => {

            const input =
                document.getElementById(
                    "cookbookPassword"
                );

            input.type =
                event.target.checked
                    ? "text"
                    : "password";

        });


    document
        .getElementById("showJoinPassword")
        ?.addEventListener("change", event => {

            const input =
                document.getElementById(
                    "joinPassword"
                );

            input.type =
                event.target.checked
                    ? "text"
                    : "password";

        });


    document
        .getElementById("addFolderBtn")
        ?.addEventListener(
            "click",
            addFolder
        );


    document
        .getElementById("scanBtn")
        ?.addEventListener(
            "click",
            () => {

                document
                    .getElementById("cameraInput")
                    ?.click();

            }
        );


    document
        .getElementById("clearFolderBtn")
        ?.addEventListener(
            "click",
            () => {

                currentFolder = null;

                renderFolders();
                renderRecipes();

            }
        );


    document
        .getElementById("searchInput")
        ?.addEventListener(
            "input",
            renderRecipes
        );


    document
        .getElementById("cameraInput")
        ?.addEventListener(
            "change",
            handleScanner
        );


    document
        .getElementById("closeRecipeBtn")
        ?.addEventListener(
            "click",
            closeRecipe
        );


    document
        .getElementById("editRecipeBtn")
        ?.addEventListener(
            "click",
            editCurrentRecipe
        );


    document
        .getElementById("deleteRecipeBtn")
        ?.addEventListener(
            "click",
            deleteRecipe
        );


    document
        .getElementById("recipeServingMinus")
        ?.addEventListener(
            "click",
            () => changeServings(-1)
        );


    document
        .getElementById("recipeServingPlus")
        ?.addEventListener(
            "click",
            () => changeServings(1)
        );


    document
        .getElementById("closeEditorBtn")
        ?.addEventListener(
            "click",
            closeEditor
        );


    document
        .getElementById("cancelEditBtn")
        ?.addEventListener(
            "click",
            closeEditor
        );


    document
        .getElementById("saveRecipeBtn")
        ?.addEventListener(
            "click",
            saveEditedRecipe
        );
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

        alert("Please enter a cookbook name.");

        return;
    }


    if (password.length < 4) {

        alert(
            "Your cookbook code must be at least 4 characters."
        );

        return;
    }


    currentBook = {

        id: makeID(),

        name: name,

        password: password,

        privacy: "private",

        folders: [
            "Recipes",
            "Breakfast",
            "Lunch",
            "Dinner",
            "Desserts",
            "Drinks"
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


    if (!name || !password) {

        alert(
            "Enter the cookbook name and code."
        );

        return;
    }


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

        alert("Incorrect cookbook code.");

        return;
    }


    currentBook = book;

    fixBookData(currentBook);

    saveData();

    openBook();
}


/* =========================================================
   BOOK
   ========================================================= */

function openBook() {

    if (!currentBook) return;

    fixBookData(currentBook);

    showScreen("mainScreen");

    const title =
        document.getElementById(
            "mainBookName"
        );

    if (title) {
        title.textContent =
            currentBook.name;
    }

    currentFolder = null;

    renderFolders();
    renderRecipes();
}


function fixBookData(book) {

    if (!Array.isArray(book.folders)) {
        book.folders = [];
    }


    if (!book.folders.includes("Recipes")) {
        book.folders.unshift("Recipes");
    }


    if (!Array.isArray(book.recipes)) {
        book.recipes = [];
    }


    book.recipes.forEach(recipe => {

        if (!recipe.id) {
            recipe.id = makeID();
        }

        if (!recipe.folder) {
            recipe.folder = "Recipes";
        }

        if (!Array.isArray(recipe.ingredients)) {
            recipe.ingredients = [];
        }

        if (!Array.isArray(recipe.instructions)) {
            recipe.instructions = [];
        }

        if (!recipe.servings) {
            recipe.servings = 4;
        }

    });
}


/* =========================================================
   FOLDERS
   ========================================================= */

function renderFolders() {

    const container =
        document.getElementById("folders");

    if (!container || !currentBook) return;

    container.innerHTML = "";


    currentBook.folders.forEach(folder => {

        const count =
            currentBook.recipes.filter(
                recipe =>
                    recipe.folder === folder
            ).length;


        const wrapper =
            document.createElement("div");

        wrapper.className =
            "folder-wrapper";


        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "folder-card";

        button.innerHTML = `

            <span class="folder-icon">
                📁
            </span>

            <strong>
                ${escapeHTML(folder)}
            </strong>

            <small>
                ${count}
                ${count === 1 ? "recipe" : "recipes"}
            </small>

        `;


        button.addEventListener(
            "click",
            () => {

                currentFolder = folder;

                renderFolders();
                renderRecipes();

            }
        );


        const edit =
            document.createElement("button");

        edit.type = "button";

        edit.className =
            "small-button";

        edit.textContent = "✏️";

        edit.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                editFolder(folder);

            }
        );


        const remove =
            document.createElement("button");

        remove.type = "button";

        remove.className =
            "small-button danger";

        remove.textContent = "🗑️";

        remove.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                deleteFolder(folder);

            }
        );


        wrapper.appendChild(button);
        wrapper.appendChild(edit);
        wrapper.appendChild(remove);

        container.appendChild(wrapper);

    });
}


/* =========================================================
   ADD FOLDER
   ========================================================= */

function addFolder() {

    if (!currentBook) return;


    const name =
        prompt("Enter a folder name:");


    if (!name || !name.trim()) {
        return;
    }


    const folder = name.trim();


    const exists =
        currentBook.folders.some(
            item =>
                item.toLowerCase() ===
                folder.toLowerCase()
        );


    if (exists) {

        alert(
            "That folder already exists."
        );

        return;
    }


    currentBook.folders.push(folder);

    saveData();

    renderFolders();
}


/* =========================================================
   EDIT FOLDER
   ========================================================= */

function editFolder(oldName) {

    if (!currentBook) return;


    const newName =
        prompt(
            "Rename folder:",
            oldName
        );


    if (!newName || !newName.trim()) {
        return;
    }


    const name = newName.trim();


    if (name === oldName) {
        return;
    }


    const exists =
        currentBook.folders.some(
            folder =>
                folder.toLowerCase() ===
                name.toLowerCase()
        );


    if (exists) {

        alert(
            "That folder already exists."
        );

        return;
    }


    const index =
        currentBook.folders.indexOf(
            oldName
        );


    if (index !== -1) {

        currentBook.folders[index] =
            name;

    }


    currentBook.recipes.forEach(
        recipe => {

            if (recipe.folder === oldName) {

                recipe.folder = name;

            }

        }
    );


    if (currentFolder === oldName) {
        currentFolder = name;
    }


    saveData();

    renderFolders();
    renderRecipes();
}


/* =========================================================
   DELETE FOLDER
   ========================================================= */

function deleteFolder(folder) {

    if (!currentBook) return;


    if (folder === "Recipes") {

        alert(
            "The Recipes folder cannot be deleted."
        );

        return;
    }


    const count =
        currentBook.recipes.filter(
            recipe =>
                recipe.folder === folder
        ).length;


    const message =
        count > 0
            ? `Delete "${folder}"? Its ${count} recipe(s) will move to Recipes.`
            : `Delete "${folder}"?`;


    if (!confirm(message)) {
        return;
    }


    currentBook.recipes.forEach(
        recipe => {

            if (recipe.folder === folder) {
                recipe.folder = "Recipes";
            }

        }
    );


    currentBook.folders =
        currentBook.folders.filter(
            item =>
                item !== folder
        );


    currentFolder = null;

    saveData();

    renderFolders();
    renderRecipes();
}


/* =========================================================
   RECIPES
   ========================================================= */

function renderRecipes() {

    const container =
        document.getElementById("recipes");

    if (!container || !currentBook) return;


    container.innerHTML = "";


    let recipes =
        [...currentBook.recipes];


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
            recipes.filter(recipe => {

                const text =
                    (
                        recipe.title +
                        " " +
                        recipe.folder +
                        " " +
                        recipe.ingredients.join(" ")
                    ).toLowerCase();

                return text.includes(search);

            });

    }


    recipes.sort(
        (a, b) =>
            (a.title || "").localeCompare(
                b.title || ""
            )
    );


    const heading =
        document.getElementById(
            "recipesHeading"
        );


    if (heading) {

        heading.textContent =
            currentFolder
                ? currentFolder
                : "Recipes";

    }


    if (!recipes.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div>🍽️</div>

                <h3>
                    No recipes here yet
                </h3>

                <p>
                    Scan a recipe to add one.
                </p>

            </div>

        `;

        return;
    }


    recipes.forEach(recipe => {

        const card =
            document.createElement("button");

        card.type = "button";

        card.className =
            "recipe-card";


        card.innerHTML = `

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
                    📁 ${escapeHTML(
                        recipe.folder ||
                        "Recipes"
                    )}
                </span>

            </div>

            <span class="recipe-arrow">
                ›
            </span>

        `;


        card.addEventListener(
            "click",
            () => openRecipe(recipe)
        );


        container.appendChild(card);

    });
}


/* =========================================================
   RECIPE VIEWER
   ========================================================= */

function openRecipe(recipe) {

    currentRecipe = recipe;


    const viewer =
        document.getElementById(
            "recipeViewer"
        );


    if (!viewer) return;


    viewer.classList.remove("hidden");


    document.getElementById(
        "viewRecipeTitle"
    ).textContent =
        recipe.title ||
        "Untitled Recipe";


    document.getElementById(
        "viewRecipeCuisine"
    ).textContent =
        recipe.cuisine || "";


    document.getElementById(
        "recipeServingNumber"
    ).textContent =
        Number(recipe.servings) || 4;


    renderIngredients(
        recipe,
        Number(recipe.servings) || 4
    );


    renderInstructions(recipe);


    const notesSection =
        document.getElementById(
            "recipeNotesSection"
        );


    const notes =
        document.getElementById(
            "viewRecipeNotes"
        );


    if (recipe.notes) {

        notes.textContent =
            recipe.notes;

        notesSection.classList.remove(
            "hidden"
        );

    } else {

        notes.textContent = "";

        notesSection.classList.add(
            "hidden"
        );
    }
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
        viewer.classList.add("hidden");
    }


    currentRecipe = null;
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


    const original =
        Number(recipe.servings) || 4;


    const multiplier =
        servings / original;


    recipe.ingredients.forEach(
        ingredient => {

            const li =
                document.createElement("li");

            li.textContent =
                scaleIngredient(
                    ingredient,
                    multiplier
                );

            list.appendChild(li);

        }
    );
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


    recipe.instructions.forEach(
        instruction => {

            const li =
                document.createElement("li");

            li.textContent =
                instruction;

            list.appendChild(li);

        }
    );
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


    let servings =
        Number(display.textContent) || 4;


    servings += amount;


    if (servings < 1) {
        servings = 1;
    }


    display.textContent = servings;


    renderIngredients(
        currentRecipe,
        servings
    );
}


/* =========================================================
   INGREDIENT MATH
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


function getNumber(value) {

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


            if (
                Number.isFinite(a) &&
                Number.isFinite(b) &&
                b !== 0
            ) {

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


function formatAmount(number) {

    const common = [

        [0.125, "⅛"],
        [0.25, "¼"],
        [1 / 3, "⅓"],
        [0.375, "⅜"],
        [0.5, "½"],
        [0.625, "⅝"],
        [2 / 3, "⅔"],
        [0.75, "¾"],
        [0.875, "⅞"]

    ];


    const whole =
        Math.floor(number);


    const decimal =
        number - whole;


    for (const [value, symbol] of common) {

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
            number - Math.round(number)
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


    const match =
        ingredient.match(
            /^(\d+(?:\.\d+)?|\d+\/\d+|½|⅓|⅔|¼|¾|⅛|⅜|⅝|⅞)(?=\s|$)/
        );


    if (!match) {
        return ingredient;
    }


    const amount =
        getNumber(match[1]);


    if (amount === null) {
        return ingredient;
    }


    return (
        formatAmount(
            amount * multiplier
        ) +
        ingredient.slice(
            match[1].length
        )
    );
}


/* =========================================================
   EDIT RECIPE
   ========================================================= */

function editCurrentRecipe() {

    if (!currentRecipe) return;


    document
        .getElementById("editorModal")
        ?.classList.remove("hidden");


    document.getElementById(
        "editRecipeTitle"
    ).value =
        currentRecipe.title || "";


    document.getElementById(
        "editRecipeCuisine"
    ).value =
        currentRecipe.cuisine || "";


    document.getElementById(
        "editRecipeServings"
    ).value =
        currentRecipe.servings || 4;


    document.getElementById(
        "editRecipeIngredients"
    ).value =
        currentRecipe.ingredients.join("\n");


    document.getElementById(
        "editRecipeInstructions"
    ).value =
        currentRecipe.instructions.join("\n");


    document.getElementById(
        "editRecipeNotes"
    ).value =
        currentRecipe.notes || "";
}


/* =========================================================
   SAVE RECIPE EDIT
   ========================================================= */

function saveEditedRecipe() {

    if (!currentRecipe) return;


    currentRecipe.title =
        document
            .getElementById(
                "editRecipeTitle"
            )
            .value
            .trim() ||
        "Untitled Recipe";


    currentRecipe.cuisine =
        document
            .getElementById(
                "editRecipeCuisine"
            )
            .value
            .trim();


    currentRecipe.servings =
        Math.max(
            1,
            Number(
                document
                    .getElementById(
                        "editRecipeServings"
                    )
                    .value
            ) || 4
        );


    currentRecipe.ingredients =
        document
            .getElementById(
                "editRecipeIngredients"
            )
            .value
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean);


    currentRecipe.instructions =
        document
            .getElementById(
                "editRecipeInstructions"
            )
            .value
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean);


    currentRecipe.notes =
        document
            .getElementById(
                "editRecipeNotes"
            )
            .value
            .trim();


    saveData();

    closeEditor();

    renderFolders();
    renderRecipes();

    openRecipe(currentRecipe);
}


/* =========================================================
   CLOSE EDITOR
   ========================================================= */

function closeEditor() {

    const modal =
        document.getElementById(
            "editorModal"
        );


    if (modal) {
        modal.classList.add("hidden");
    }
}


/* =========================================================
   DELETE RECIPE
   ========================================================= */

function deleteRecipe() {

    if (!currentBook || !currentRecipe) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${currentRecipe.title || "this recipe"}"?`
        );


    if (!confirmed) {
        return;
    }


    currentBook.recipes =
        currentBook.recipes.filter(
            recipe =>
                recipe.id !==
                currentRecipe.id
        );


    saveData();

    closeRecipe();

    renderFolders();
    renderRecipes();
}


/* =========================================================
   AUTOMATIC FOLDER SORTING
   ========================================================= */

function automaticallyChooseFolder(recipe) {

    if (!currentBook) {
        return "Recipes";
    }


    const text = (

        (recipe.title || "") +
        " " +
        (recipe.ingredients || []).join(" ") +
        " " +
        (recipe.instructions || []).join(" ")

    ).toLowerCase();


    const categories = {

        Breakfast: [
            "breakfast",
            "pancake",
            "pancakes",
            "waffle",
            "waffles",
            "omelet",
            "omelette",
            "egg",
            "eggs",
            "french toast",
            "hash brown",
            "oatmeal",
            "granola"
        ],

        Lunch: [
            "lunch",
            "sandwich",
            "wrap",
            "salad",
            "soup",
            "panini",
            "quesadilla"
        ],

        Dinner: [
            "dinner",
            "pasta",
            "spaghetti",
            "lasagna",
            "chicken",
            "beef",
            "steak",
            "pork",
            "rice",
            "curry",
            "taco",
            "tacos",
            "enchilada",
            "casserole",
            "meatball"
        ],

        Desserts: [
            "dessert",
            "cake",
            "cookie",
            "cookies",
            "brownie",
            "brownies",
            "pie",
            "cupcake",
            "cheesecake",
            "pudding",
            "ice cream",
            "muffin",
            "donut",
            "doughnut"
        ],

        Drinks: [
            "drink",
            "smoothie",
            "milkshake",
            "juice",
            "lemonade",
            "coffee",
            "latte",
            "tea",
            "hot chocolate"
        ]

    };


    let bestFolder = "Recipes";
    let bestScore = 0;


    for (
        const folder in categories
    ) {

        let score = 0;


        categories[folder].forEach(
            keyword => {

                if (
                    text.includes(
                        keyword
                    )
                ) {

                    score++;

                }

            }
        );


        if (
            score > bestScore
        ) {

            bestScore = score;
            bestFolder = folder;

        }
    }


    if (
        !currentBook.folders.includes(
            bestFolder
        )
    ) {

        currentBook.folders.push(
            bestFolder
        );

    }


    return bestFolder;
}


/* =========================================================
   SCANNER
   ========================================================= */

async function handleScanner(event) {

    const file =
        event.target.files?.[0];


    if (!file) {
        return;
    }


    if (!currentBook) {

        alert(
            "Open your cookbook first."
        );

        return;
    }


    showScannerStatus(
        "Reading your recipe...",
        0
    );


    try {

        const result =
            await Tesseract.recognize(
                file,
                "eng",
                {

                    logger: message => {

                        if (
                            message.status ===
                            "recognizing text"
                        ) {

                            const percent =
                                Math.round(
                                    (
                                        message.progress ||
                                        0
                                    ) * 100
                                );

                            showScannerStatus(
                                `Reading your recipe... ${percent}%`,
                                percent
                            );

                        }

                    }

                }
            );


        const text =
            result.data.text;


        if (!text.trim()) {

            throw new Error(
                "No text detected."
            );
        }


        showScannerStatus(
            "Organizing your recipe...",
            100
        );


        const recipe =
            parseRecipeText(text);


        recipe.id =
            makeID();


        recipe.folder =
            automaticallyChooseFolder(
                recipe
            );


        recipe.pages = 1;


        currentBook.recipes.push(
            recipe
        );


        saveData();


        hideScannerStatus();


        renderFolders();
        renderRecipes();


        openRecipe(recipe);


    } catch (error) {

        console.error(
            "Scanner error:",
            error
        );


        hideScannerStatus();


        alert(
            "MealMind couldn't read that recipe. Try taking a clearer, well-lit photo."
        );

    }


    event.target.value = "";
}


/* =========================================================
   RECIPE TEXT PARSER
   ========================================================= */

function parseRecipeText(rawText) {

    const lines =
        rawText
            .split(/\r?\n/)
            .map(line =>
                line
                    .replace(/\s+/g, " ")
                    .trim()
            )
            .filter(Boolean);


    let title = "";
    let ingredients = [];
    let instructions = [];
    let notes = "";


    let section = "unknown";


    const ingredientHeadings = [
        "ingredients",
        "ingredient",
        "what you need"
    ];


    const instructionHeadings = [
        "instructions",
        "directions",
        "method",
        "preparation",
        "steps",
        "how to make"
    ];


    const noteHeadings = [
        "notes",
        "tips",
        "tip"
    ];


    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        const line =
            lines[i];


        const lower =
            line.toLowerCase();


        if (
            ingredientHeadings.includes(
                lower
            )
        ) {

            section =
                "ingredients";

            continue;
        }


        if (
            instructionHeadings.includes(
                lower
            )
        ) {

            section =
                "instructions";

            continue;
        }


        if (
            noteHeadings.includes(
                lower
            )
        ) {

            section =
                "notes";

            continue;
        }


        /*
         * FIRST SHORT NON-INGREDIENT
         * LINE BECOMES TITLE
         */

        if (
            !title &&
            i < 6 &&
            line.length >= 3 &&
            line.length <= 100 &&
            !looksLikeIngredient(line) &&
            !looksLikeInstruction(line) &&
            !/^\d/.test(line)
        ) {

            title =
                cleanOCRLine(line);

            continue;
        }


        if (
            section ===
            "ingredients"
        ) {

            if (
                !looksLikeInstruction(
                    line
                )
            ) {

                ingredients.push(
                    cleanOCRLine(line)
                );

            }

            continue;
        }


        if (
            section ===
            "instructions"
        ) {

            instructions.push(
                cleanInstruction(line)
            );

            continue;
        }


        if (
            section ===
            "notes"
        ) {

            notes +=
                (
                    notes
                        ? " "
                        : ""
                ) +
                line;

        }

    }


    /*
     * FALLBACK
     */

    if (
        ingredients.length === 0 ||
        instructions.length === 0
    ) {

        const fallback =
            fallbackRecipeSplit(
                lines
            );


        if (
            ingredients.length === 0
        ) {

            ingredients =
                fallback.ingredients;

        }


        if (
            instructions.length === 0
        ) {

            instructions =
                fallback.instructions;

        }

    }


    /*
     * Remove obvious non-recipe lines.
     */

    ingredients =
        ingredients.filter(
            item =>
                item.length > 1
        );


    instructions =
        instructions.filter(
            item =>
                item.length > 3
        );


    return {

        title:
            title ||
            "Scanned Recipe",

        cuisine: "",

        servings: 4,

        ingredients,

        instructions,

        notes

    };
}


/* =========================================================
   OCR CLEANUP
   ========================================================= */

function cleanOCRLine(line) {

    return line
        .replace(/^[•●▪◦*-]\s*/, "")
        .replace(/^\d+[.)]\s*/, "")
        .replace(/\s{2,}/g, " ")
        .trim();
}


function cleanInstruction(line) {

    return line
        .replace(/^\d+[.)]\s*/, "")
        .replace(/^[•●▪◦*-]\s*/, "")
        .trim();
}


function looksLikeIngredient(line) {

    return /(\d+\s*(cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|oz|ounce|ounces|lb|lbs|pound|pounds|g|kg|ml|l)\b)/i
        .test(line);
}


function looksLikeInstruction(line) {

    return /^(add|mix|stir|bake|cook|heat|combine|place|pour|remove|serve|chop|slice|preheat|whisk|fold|boil|simmer|let|allow|season|transfer|spread|pour|bring|reduce|cover|uncover|cool)\b/i
        .test(line);
}


/* =========================================================
   FALLBACK RECIPE SPLIT
   ========================================================= */

function fallbackRecipeSplit(lines) {

    const ingredients = [];
    const instructions = [];


    let instructionStarted = false;


    for (
        let i = 1;
        i < lines.length;
        i++
    ) {

        const line =
            lines[i];


        if (
            looksLikeInstruction(line)
        ) {

            instructionStarted = true;

        }


        if (
            instructionStarted
        ) {

            instructions.push(
                cleanInstruction(line)
            );

        } else if (
            looksLikeIngredient(line)
        ) {

            ingredients.push(
                cleanOCRLine(line)
            );

        }

    }


    /*
     * If OCR headings were missing,
     * make a reasonable split.
     */

    if (
        ingredients.length < 2 &&
        lines.length > 6
    ) {

        const splitPoint =
            Math.ceil(
                lines.length * 0.55
            );


        return {

            ingredients:
                lines
                    .slice(1, splitPoint)
                    .map(cleanOCRLine)
                    .filter(Boolean),

            instructions:
                lines
                    .slice(splitPoint)
                    .map(cleanInstruction)
                    .filter(Boolean)

        };

    }


    return {
        ingredients,
        instructions
    };
}


/* =========================================================
   SCANNER STATUS
   ========================================================= */

function showScannerStatus(
    text,
    progress = 0
) {

    const box =
        document.getElementById(
            "scannerStatus"
        );


    const textElement =
        document.getElementById(
            "scannerText"
        );


    const progressElement =
        document.getElementById(
            "scannerProgress"
        );


    if (!box) return;


    box.classList.remove(
        "hidden"
    );


    if (textElement) {
        textElement.textContent =
            text;
    }


    if (progressElement) {
        progressElement.style.width =
            `${progress}%`;
    }
}


function hideScannerStatus() {

    document
        .getElementById(
            "scannerStatus"
        )
        ?.classList.add(
            "hidden"
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
                book.privacy === "public"
        );


    if (!books.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div>📚</div>

                <h3>
                    No public cookbooks yet
                </h3>

                <p>
                    Public cookbooks will appear here.
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


        button.className =
            "main-button";


        button.textContent =
            `📖 ${book.name}`;


        button.addEventListener(
            "click",
            () => {

                currentBook = book;

                openBook();

            }
        );


        container.appendChild(button);

    });
}


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupHomeButtons();


        mealMind.books.forEach(
            fixBookData
        );


        saveData();


        showScreen(
            "homeScreen"
        );

    }
);


