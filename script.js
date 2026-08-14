```javascript
"use strict";

/* =========================================================
   MEALMIND
   Complete JavaScript
   - Cookbooks
   - Passwords
   - Folders
   - Recipe scanning
   - OCR
   - Recipe viewer
   - 1–5 page recipe setting
   - Ingredient calculator
   - Edit recipe
   - Delete recipe
   - Edit folder
   - Delete folder
   - Search
   ========================================================= */

const STORAGE_KEY = "mealmind_data_v2";

let data = loadData();

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

            const parsed = JSON.parse(saved);

            if (
                parsed &&
                Array.isArray(parsed.books)
            ) {
                return parsed;
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

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );

    } catch (error) {

        console.error("Could not save MealMind:", error);

        alert(
            "MealMind could not save your changes on this device."
        );
    }
}


/* =========================================================
   HELPERS
   ========================================================= */

function makeID() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2)
    );
}


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function normalizeBook(book) {

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

        if (!Number(recipe.servings)) {
            recipe.servings = 4;
        }

        if (!Number(recipe.pages)) {
            recipe.pages = 1;
        }

        if (recipe.pages < 1) {
            recipe.pages = 1;
        }

        if (recipe.pages > 5) {
            recipe.pages = 5;
        }

        if (!recipe.title) {
            recipe.title = "Untitled Recipe";
        }

    });

    return book;
}


data.books.forEach(normalizeBook);


/* =========================================================
   SCREEN SYSTEM
   ========================================================= */

function hideScreens() {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.add("hidden");

        });
}


function showScreen(id) {

    hideScreens();

    const screen =
        document.getElementById(id);

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

document.addEventListener("click", function(event) {

    const button =
        event.target.closest("button");

    if (!button) {
        return;
    }

    const action =
        button.dataset.action;


    /* Make cookbook */

    if (action === "make-cookbook") {

        showScreen("makeScreen");

        return;
    }


    /* Join cookbook */

    if (action === "join-cookbook") {

        showScreen("joinScreen");

        return;
    }


    /* Public books */

    if (action === "public-books") {

        showScreen("publicScreen");

        renderPublicBooks();

        return;
    }


    /* Home */

    if (action === "home") {

        goHome();

        return;
    }


    /* Create */

    if (action === "create-cookbook") {

        createCookbook();

        return;
    }


    /* Join */

    if (action === "join") {

        joinCookbook();

        return;
    }


    /* Exit */

    if (action === "exit-book") {

        goHome();

        return;
    }


    /* Scanner */

    if (action === "scan") {

        openScanner();

        return;
    }


    /* Folder */

    if (action === "add-folder") {

        addFolder();

        return;
    }


    if (action === "edit-folder") {

        editFolder(
            button.dataset.folder
        );

        return;
    }


    if (action === "delete-folder") {

        deleteFolder(
            button.dataset.folder
        );

        return;
    }


    /* Recipe */

    if (action === "edit-recipe") {

        editCurrentRecipe();

        return;
    }


    if (action === "delete-recipe") {

        deleteRecipe();

        return;
    }


    if (action === "close-recipe") {

        closeRecipe();

        return;
    }


    /* Editor */

    if (action === "save-recipe") {

        saveEditedRecipe();

        return;
    }


    if (action === "cancel-edit") {

        closeEditor();

        return;
    }


    /* Servings */

    if (
        button.id ===
        "recipeServingMinus"
    ) {

        changeServings(-1);

        return;
    }


    if (
        button.id ===
        "recipeServingPlus"
    ) {

        changeServings(1);

        return;
    }


    /* Folder card */

    if (
        button.dataset.folder &&
        !action
    ) {

        currentFolder =
            button.dataset.folder;

        renderFolders();
        renderRecipes();

        return;
    }


    /* Recipe card */

    if (button.dataset.recipeId) {

        const recipe =
            currentBook?.recipes?.find(
                item =>
                    item.id ===
                    button.dataset.recipeId
            );

        if (recipe) {
            openRecipe(recipe);
        }

        return;
    }

});


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

        alert(
            "Please enter a cookbook name."
        );

        return;
    }


    if (password.length < 4) {

        alert(
            "Your cookbook code must be at least 4 characters."
        );

        return;
    }


    const book = {

        id: makeID(),

        name: name,

        password: password,

        privacy: "private",

        folders: [
            "Recipes"
        ],

        recipes: []

    };


    data.books.push(book);

    saveData();

    currentBook = book;

    currentFolder = null;

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
        data.books.find(
            item =>
                item.name.toLowerCase() ===
                name.toLowerCase()
        );


    if (!book) {

        alert(
            "Cookbook not found."
        );

        return;
    }


    if (book.password !== password) {

        alert(
            "Wrong cookbook code."
        );

        return;
    }


    currentBook = normalizeBook(book);

    currentFolder = null;

    saveData();

    openBook();
}


/* =========================================================
   OPEN BOOK
   ========================================================= */

function openBook() {

    if (!currentBook) {
        return;
    }

    currentBook =
        normalizeBook(currentBook);

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


/* =========================================================
   FOLDERS
   ========================================================= */

function renderFolders() {

    const container =
        document.getElementById("folders");

    if (!container) {
        return;
    }

    container.innerHTML = "";


    if (!currentBook) {
        return;
    }


    currentBook.folders.forEach(folder => {

        const count =
            currentBook.recipes.filter(
                recipe =>
                    recipe.folder === folder
            ).length;


        const row =
            document.createElement("div");

        row.className =
            "folder-row";


        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "folder-card";

        button.dataset.folder =
            folder;


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


        const edit =
            document.createElement("button");

        edit.type = "button";

        edit.className =
            "recipe-action-button";

        edit.dataset.action =
            "edit-folder";

        edit.dataset.folder =
            folder;

        edit.textContent =
            "✏️";


        const remove =
            document.createElement("button");

        remove.type = "button";

        remove.className =
            "recipe-action-button danger";

        remove.dataset.action =
            "delete-folder";

        remove.dataset.folder =
            folder;

        remove.textContent =
            "🗑️";


        row.appendChild(button);
        row.appendChild(edit);
        row.appendChild(remove);

        container.appendChild(row);

    });

}


/* =========================================================
   ADD FOLDER
   ========================================================= */

function addFolder() {

    if (!currentBook) {
        return;
    }


    const name =
        prompt("Enter a folder name:");

    if (!name) {
        return;
    }


    const folder =
        name.trim();


    if (!folder) {
        return;
    }


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

    if (!currentBook) {
        return;
    }


    const newName =
        prompt(
            "Rename folder:",
            oldName
        );


    if (!newName) {
        return;
    }


    const name =
        newName.trim();


    if (!name || name === oldName) {
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
            "A folder with that name already exists."
        );

        return;
    }


    const index =
        currentBook.folders.indexOf(oldName);


    if (index === -1) {
        return;
    }


    currentBook.folders[index] =
        name;


    currentBook.recipes.forEach(recipe => {

        if (recipe.folder === oldName) {

            recipe.folder = name;

        }

    });


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

    if (!currentBook) {
        return;
    }


    if (currentBook.folders.length <= 1) {

        alert(
            "You need to keep at least one folder."
        );

        return;
    }


    if (folder === "Recipes") {

        alert(
            'The "Recipes" folder cannot be deleted.'
        );

        return;
    }


    const recipesInside =
        currentBook.recipes.filter(
            recipe =>
                recipe.folder === folder
        );


    const answer =
        confirm(
            recipesInside.length
                ? `Delete "${folder}"? Its recipes will be moved to Recipes.`
                : `Delete "${folder}"?`
        );


    if (!answer) {
        return;
    }


    recipesInside.forEach(recipe => {

        recipe.folder =
            "Recipes";

    });


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

    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!currentBook) {
        return;
    }


    let recipes =
        [...currentBook.recipes];


    /* Folder filter */

    if (currentFolder) {

        recipes =
            recipes.filter(
                recipe =>
                    recipe.folder ===
                    currentFolder
            );

    }


    /* Search */

    const search =
        document
            .getElementById("searchInput")
            ?.value
            .trim()
            .toLowerCase();


    if (search) {

        recipes =
            recipes.filter(recipe => {

                const title =
                    recipe.title || "";

                const ingredients =
                    recipe.ingredients.join(" ");

                return (
                    title.toLowerCase().includes(search) ||
                    ingredients.toLowerCase().includes(search)
                );

            });

    }


    /* Sort alphabetically */

    recipes.sort((a, b) =>
        (a.title || "")
            .localeCompare(
                b.title || ""
            )
    );


    if (!recipes.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div>🍽️</div>

                <h3>
                    No recipes yet
                </h3>

                <p>
                    Scan a recipe to add it to this folder.
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
                        recipe.folder ||
                        "Recipes"
                    )}
                    ·
                    ${recipe.pages || 1}
                    ${recipe.pages === 1 ? "page" : "pages"}
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

document.addEventListener("input", event => {

    if (
        event.target.id ===
        "searchInput"
    ) {

        renderRecipes();

    }

});


/* =========================================================
   SCANNER
   ========================================================= */

function openScanner() {

    if (!currentBook) {

        alert(
            "Open a cookbook first."
        );

        return;
    }


    const input =
        document.getElementById(
            "cameraInput"
        );


    if (!input) {

        alert(
            "Scanner input was not found. Make sure you copied the new index.html."
        );

        return;
    }


    /*
       Reset the value first.

       This is important because selecting
       the SAME photo twice otherwise may
       not trigger the change event.
    */

    input.value = "";

    input.click();
}


/* =========================================================
   CAMERA INPUT
   ========================================================= */

/*
   THIS IS THE PART THAT CONNECTS THE
   SCAN BUTTON TO THE SCANNER.
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const input =
            document.getElementById(
                "cameraInput"
            );


        if (!input) {
            console.error(
                "MealMind: cameraInput not found."
            );

            return;
        }


        input.addEventListener(
            "change",
            async event => {

                const file =
                    event.target.files?.[0];


                if (!file) {
                    return;
                }


                await scanRecipeImage(file);

            }
        );

    }
);


/* =========================================================
   OCR
   ========================================================= */

let tesseractLoading = null;


function loadOCR() {

    if (window.Tesseract) {
        return Promise.resolve();
    }


    if (tesseractLoading) {
        return tesseractLoading;
    }


    tesseractLoading =
        new Promise(
            (resolve, reject) => {

                const script =
                    document.createElement("script");


                script.src =
                    "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";


                script.onload =
                    () => resolve();


                script.onerror =
                    () => reject(
                        new Error(
                            "Tesseract could not be loaded."
                        )
                    );


                document.head.appendChild(script);

            }
        );


    return tesseractLoading;
}


/* =========================================================
   SCAN RECIPE
   ========================================================= */

async function scanRecipeImage(file) {

    if (!currentBook) {
        return;
    }


    showScannerStatus(
        "Preparing scanner..."
    );


    try {

        await loadOCR();


        showScannerStatus(
            "Reading your recipe..."
        );


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
                                `Reading recipe... ${percent}%`
                            );

                        }

                    }
                }
            );


        const text =
            result?.data?.text || "";


        if (!text.trim()) {

            throw new Error(
                "No text was detected."
            );
        }


        showScannerStatus(
            "Organizing recipe..."
        );


        const parsed =
            parseRecipeText(text);


        /*
           The scanner creates ONE recipe.

           It removes random OCR sections
           instead of showing the entire
           scanned page.
        */

        const recipe = {

            id: makeID(),

            title:
                parsed.title ||
                "Scanned Recipe",

            cuisine:
                parsed.cuisine || "",

            servings:
                parsed.servings || 4,

            pages:
                parsed.pages || 1,

            ingredients:
                parsed.ingredients || [],

            instructions:
                parsed.instructions || [],

            notes: "",

            /*
               IMPORTANT:
               Recipe goes into the folder
               currently selected.
            */

            folder:
                currentFolder ||
                "Recipes"

        };


        /*
           Make sure folder exists.
        */

        if (
            !currentBook.folders.includes(
                recipe.folder
            )
        ) {

            currentBook.folders.push(
                recipe.folder
            );

        }


        currentBook.recipes.push(
            recipe
        );


        saveData();


        hideScannerStatus();


        renderFolders();
        renderRecipes();


        /*
           Immediately show the newly
           scanned recipe.
        */

        openRecipe(recipe);


    } catch (error) {

        console.error(
            "MealMind scanner error:",
            error
        );


        hideScannerStatus();


        alert(
            "I couldn't read that recipe. Try a clearer photo with the recipe text fully visible."
        );

    }

}


/* =========================================================
   SCANNER STATUS
   ========================================================= */

function showScannerStatus(text) {

    const box =
        document.getElementById(
            "scannerStatus"
        );


    if (!box) {
        return;
    }


    box.classList.remove("hidden");


    box.innerHTML = `

        <div class="scanner-status-card">

            <div class="scanner-spinner"></div>

            <strong>
                ${escapeHTML(text)}
            </strong>

            <p>
                Please wait...
            </p>

        </div>

    `;

}


function hideScannerStatus() {

    const box =
        document.getElementById(
            "scannerStatus"
        );


    if (box) {
        box.classList.add("hidden");
    }

}


/* =========================================================
   RECIPE PARSER
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
    let cuisine = "";

    let ingredients = [];
    let instructions = [];

    let servings = 4;

    let pages = 1;

    let section = "unknown";


    const ingredientHeaders = [
        "ingredients",
        "ingredient",
        "what you need"
    ];


    const instructionHeaders = [
        "instructions",
        "instruction",
        "directions",
        "direction",
        "method",
        "preparation",
        "steps",
        "how to make"
    ];


    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        const original =
            lines[i];

        const line =
            original.trim();

        const lower =
            line.toLowerCase();


        /* Page detection */

        const pageMatch =
            lower.match(
                /(?:page|pages)\s*[:\-]?\s*(\d+)/i
            );


        if (pageMatch) {

            pages =
                Math.min(
                    5,
                    Math.max(
                        1,
                        Number(
                            pageMatch[1]
                        )
                    )
                );

            continue;
        }


        /* Servings */

        const servingMatch =
            lower.match(
                /(?:serves|servings|yield)\s*[:\-]?\s*(\d+)/i
            );


        if (servingMatch) {

            servings =
                Number(
                    servingMatch[1]
                ) || 4;

            continue;
        }


        /* Ingredient heading */

        if (
            ingredientHeaders.some(
                word =>
                    lower === word
            )
        ) {

            section =
                "ingredients";

            continue;
        }


        /* Instruction heading */

        if (
            instructionHeaders.some(
                word =>
                    lower === word
            )
        ) {

            section =
                "instructions";

            continue;
        }


        /* Title */

        if (
            !title &&
            i < 6 &&
            line.length >= 3 &&
            line.length <= 100 &&
            !looksLikeIngredient(line) &&
            !looksLikeInstruction(line) &&
            !isMetadataLine(line)
        ) {

            title =
                cleanTitle(line);

            continue;
        }


        /* Ingredients */

        if (
            section ===
            "ingredients"
        ) {

            if (
                !looksLikeInstruction(line) &&
                !isMetadataLine(line)
            ) {

                const cleaned =
                    cleanIngredient(line);


                if (cleaned) {
                    ingredients.push(cleaned);
                }

            }

            continue;
        }


        /* Instructions */

        if (
            section ===
            "instructions"
        ) {

            if (
                !isMetadataLine(line)
            ) {

                const cleaned =
                    cleanInstruction(line);


                if (cleaned) {
                    instructions.push(cleaned);
                }

            }

            continue;
        }

    }


    /*
       If the headings weren't detected,
       intelligently split the recipe.
    */

    if (
        ingredients.length === 0 ||
        instructions.length === 0
    ) {

        const fallback =
            fallbackRecipeSplit(lines);


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
       Remove duplicates.
    */

    ingredients =
        [...new Set(ingredients)];


    instructions =
        [...new Set(instructions)];


    /*
       If title wasn't found,
       create a safe title.
    */

    if (!title) {
        title = "Scanned Recipe";
    }


    return {

        title,

        cuisine,

        servings,

        pages,

        ingredients,

        instructions

    };

}


/* =========================================================
   OCR CLEANING
   ========================================================= */

function cleanTitle(line) {

    return line
        .replace(/^[•●▪◦*-]\s*/, "")
        .replace(/^\d+[.)]\s*/, "")
        .trim();

}


function cleanIngredient(line) {

    return line
        .replace(/^[•●▪◦*-]\s*/, "")
        .replace(/^\d+[.)]\s*/, "")
        .replace(/\s+/g, " ")
        .trim();

}


function cleanInstruction(line) {

    return line
        .replace(/^\d+[.)]\s*/, "")
        .replace(/^[•●▪◦*-]\s*/, "")
        .replace(/\s+/g, " ")
        .trim();

}


function isMetadataLine(line) {

    return /^(nutrition|calories|calorie|protein|fat|carbohydrates|prep time|cook time|total time|ready in|page|pages|serves|servings|yield)\b/i
        .test(line);

}


function looksLikeIngredient(line) {

    return (

        /^\d+(?:\.\d+)?\s*(?:\/\s*\d+)?\s*(?:cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|oz|ounce|ounces|lb|lbs|pound|pounds|g|kg|ml|l)\b/i
            .test(line)

        ||

        /^[½⅓⅔¼¾⅛⅜⅝⅞]\s*/.test(line)

        ||

        /^\d+(?:\/\d+)?\s+/.test(line)

    );

}


function looksLikeInstruction(line) {

    return /^(add|mix|stir|bake|cook|heat|combine|place|pour|remove|serve|chop|slice|preheat|whisk|fold|boil|simmer|let|allow|season|transfer|spread|drain|rinse|cover|uncover|bring|reduce|marinate|refrigerate|cool|divide|sprinkle|brush|knead|roll|cut)\b/i
        .test(line);

}


/* =========================================================
   FALLBACK SPLITTER
   ========================================================= */

function fallbackRecipeSplit(lines) {

    const ingredients = [];
    const instructions = [];


    /*
       First look for ingredient-looking
       lines and instruction-looking lines.
    */

    lines.forEach((line, index) => {

        if (index === 0) {
            return;
        }


        if (
            looksLikeInstruction(line)
        ) {

            instructions.push(
                cleanInstruction(line)
            );

            return;
        }


        if (
            looksLikeIngredient(line)
        ) {

            ingredients.push(
                cleanIngredient(line)
            );

        }

    });


    /*
       If OCR didn't recognize units,
       use a reasonable split.
    */

    if (
        ingredients.length < 2 &&
        instructions.length < 1 &&
        lines.length >= 5
    ) {

        const usable =
            lines.slice(1);


        const splitPoint =
            Math.max(
                2,
                Math.floor(
                    usable.length * 0.55
                )
            );


        return {

            ingredients:
                usable
                    .slice(0, splitPoint)
                    .map(cleanIngredient)
                    .filter(Boolean),

            instructions:
                usable
                    .slice(splitPoint)
                    .map(cleanInstruction)
                    .filter(Boolean)

        };

    }


    return {

        ingredients:
            [...new Set(
                ingredients
            )],

        instructions:
            [...new Set(
                instructions
            )]

    };

}


/* =========================================================
   OPEN RECIPE
   ========================================================= */

function openRecipe(recipe) {

    currentRecipe =
        recipe;


    let viewer =
        document.getElementById(
            "recipeViewer"
        );


    if (!viewer) {

        viewer =
            document.createElement("div");

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


    const pages =
        Math.min(
            5,
            Math.max(
                1,
                Number(recipe.pages) || 1
            )
        );


    viewer.innerHTML = `

        <div class="recipe-viewer-background">

            <article class="recipe-sheet">

                <div class="recipe-topbar">

                    <button
                        type="button"
                        class="recipe-back-button"
                        data-action="close-recipe"
                    >
                        ← Back
                    </button>


                    <div class="recipe-actions">

                        <button
                            type="button"
                            class="recipe-action-button"
                            data-action="edit-recipe"
                        >
                            ✏️
                        </button>


                        <button
                            type="button"
                            class="recipe-action-button danger"
                            data-action="delete-recipe"
                        >
                            🗑️
                        </button>

                    </div>

                </div>


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


                    <p
                        style="
                            color:#999;
                            font-size:12px;
                            margin-top:8px;
                        "
                    >
                        📁 ${escapeHTML(
                            recipe.folder ||
                            "Recipes"
                        )}
                        ·
                        📄 ${pages}
                        ${pages === 1 ? "page" : "pages"}
                    </p>


                    <div class="recipe-serving-row">

                        <span>
                            🍽️ Serves
                        </span>

                        <button
                            type="button"
                            id="recipeServingMinus"
                        >
                            −
                        </button>

                        <strong
                            id="recipeServingNumber"
                        >
                            ${servings}
                        </strong>

                        <button
                            type="button"
                            id="recipeServingPlus"
                        >
                            +
                        </button>

                    </div>

                </header>


                <div class="recipe-line"></div>


                <section class="recipe-section">

                    <h2>
                        Ingredients
                    </h2>

                    <ul
                        id="recipeIngredientList"
                        class="recipe-ingredients"
                    ></ul>

                </section>


                <section class="recipe-section">

                    <h2>
                        Instructions
                    </h2>

                    <ol
                        id="recipeInstructionList"
                        class="recipe-instructions"
                    ></ol>

                </section>


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

                    MealMind Cookbook

                </footer>

            </article>

        </div>

    `;


    renderIngredients(
        recipe,
        servings
    );


    renderInstructions(recipe);

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

        viewer.className =
            "hidden";

        viewer.innerHTML = "";

    }


    currentRecipe =
        null;

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


    const title =
        currentRecipe.title ||
        "this recipe";


    if (
        !confirm(
            `Delete "${title}"?`
        )
    ) {
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
   EDIT RECIPE
   ========================================================= */

function editCurrentRecipe() {

    if (!currentRecipe) {
        return;
    }


    const modal =
        document.getElementById(
            "editorModal"
        );


    if (!modal) {
        return;
    }


    modal.className = "";


    modal.innerHTML = `

        <div class="editor-card">

            <h2>
                Edit Recipe
            </h2>


            <label>
                Recipe title
            </label>

            <input
                id="editRecipeTitle"
                type="text"
                value="${escapeHTML(
                    currentRecipe.title || ""
                )}"
            >


            <label>
                Cuisine
            </label>

            <input
                id="editRecipeCuisine"
                type="text"
                value="${escapeHTML(
                    currentRecipe.cuisine || ""
                )}"
            >


            <label>
                Servings
            </label>

            <input
                id="editRecipeServings"
                type="number"
                min="1"
                value="${
                    Number(
                        currentRecipe.servings
                    ) || 4
                }"
            >


            <label>
                Recipe pages
            </label>

            <select
                id="editRecipePages"
            >

                <option value="1">
                    1 page
                </option>

                <option value="2">
                    2 pages
                </option>

                <option value="3">
                    3 pages
                </option>

                <option value="4">
                    4 pages
                </option>

                <option value="5">
                    5 pages
                </option>

            </select>


            <label>
                Folder
            </label>

            <select
                id="editRecipeFolder"
            >

                ${
                    currentBook.folders
                        .map(folder => `
                            <option
                                value="${escapeHTML(folder)}"
                                ${
                                    folder === currentRecipe.folder
                                        ? "selected"
                                        : ""
                                }
                            >
                                ${escapeHTML(folder)}
                            </option>
                        `)
                        .join("")
                }

            </select>


            <label>
                Ingredients
            </label>

            <textarea
                id="editRecipeIngredients"
            >${escapeHTML(
                currentRecipe.ingredients.join("\n")
            )}</textarea>


            <label>
                Instructions
            </label>

            <textarea
                id="editRecipeInstructions"
            >${escapeHTML(
                currentRecipe.instructions.join("\n")
            )}</textarea>


            <label>
                Notes
            </label>

            <textarea
                id="editRecipeNotes"
            >${escapeHTML(
                currentRecipe.notes || ""
            )}</textarea>


            <div class="editor-buttons">

                <button
                    type="button"
                    class="main-button"
                    data-action="save-recipe"
                >
                    Save
                </button>

                <button
                    type="button"
                    class="main-button secondary"
                    data-action="cancel-edit"
                >
                    Cancel
                </button>

            </div>

        </div>

    `;


    const pageSelect =
        document.getElementById(
            "editRecipePages"
        );


    if (pageSelect) {

        pageSelect.value =
            String(
                currentRecipe.pages || 1
            );

    }

}


/* =========================================================
   SAVE EDIT
   ========================================================= */

function saveEditedRecipe() {

    if (!currentRecipe) {
        return;
    }


    const title =
        document
            .getElementById(
                "editRecipeTitle"
            )
            ?.value
            .trim();


    const cuisine =
        document
            .getElementById(
                "editRecipeCuisine"
            )
            ?.value
            .trim();


    const servings =
        Number(
            document
                .getElementById(
                    "editRecipeServings"
                )
                ?.value
        ) || 4;


    const pages =
        Number(
            document
                .getElementById(
                    "editRecipePages"
                )
                ?.value
        ) || 1;


    const folder =
        document
            .getElementById(
                "editRecipeFolder"
            )
            ?.value ||
        "Recipes";


    const ingredients =
        document
            .getElementById(
                "editRecipeIngredients"
            )
            ?.value
            .split(/\r?\n/)
            .map(item =>
                item.trim()
            )
            .filter(Boolean) ||
        [];


    const instructions =
        document
            .getElementById(
                "editRecipeInstructions"
            )
            ?.value
            .split(/\r?\n/)
            .map(item =>
                item.trim()
            )
            .filter(Boolean) ||
        [];


    const notes =
        document
            .getElementById(
                "editRecipeNotes"
            )
            ?.value
            .trim() ||
        "";


    currentRecipe.title =
        title ||
        "Untitled Recipe";


    currentRecipe.cuisine =
        cuisine;


    currentRecipe.servings =
        Math.max(1, servings);


    currentRecipe.pages =
        Math.min(
            5,
            Math.max(
                1,
                pages
            )
        );


    currentRecipe.folder =
        folder;


    currentRecipe.ingredients =
        ingredients;


    currentRecipe.instructions =
        instructions;


    currentRecipe.notes =
        notes;


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


    if (!modal) {
        return;
    }


    modal.className =
        "hidden";

    modal.innerHTML = "";

}


/* =========================================================
   INGREDIENT DISPLAY
   ========================================================= */

function renderIngredients(
    recipe,
    servings
) {

    const list =
        document.getElementById(
            "recipeIngredientList"
        );


    if (!list) {
        return;
    }


    list.innerHTML = "";


    const originalServings =
        Number(recipe.servings) || 4;


    const multiplier =
        servings /
        originalServings;


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


    if (
        recipe.ingredients.length === 0
    ) {

        const li =
            document.createElement("li");


        li.textContent =
            "No ingredients were detected.";


        list.appendChild(li);

    }

}


/* =========================================================
   INSTRUCTIONS
   ========================================================= */

function renderInstructions(recipe) {

    const list =
        document.getElementById(
            "recipeInstructionList"
        );


    if (!list) {
        return;
    }


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


    if (
        recipe.instructions.length === 0
    ) {

        const li =
            document.createElement("li");


        li.textContent =
            "No instructions were detected.";


        list.appendChild(li);

    }

}


/* =========================================================
   SERVING CALCULATOR
   ========================================================= */

function changeServings(amount) {

    if (!currentRecipe) {
        return;
    }


    const display =
        document.getElementById(
            "recipeServingNumber"
        );


    if (!display) {
        return;
    }


    let servings =
        Number(
            display.textContent
        ) || 4;


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
   FRACTION CALCULATOR
   ========================================================= */

const FRACTIONS = {

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

    if (
        Object.prototype.hasOwnProperty.call(
            FRACTIONS,
            value
        )
    ) {

        return FRACTIONS[value];

    }


    if (value.includes("/")) {

        const parts =
            value.split("/");


        if (parts.length === 2) {

            const top =
                Number(
                    parts[0]
                );

            const bottom =
                Number(
                    parts[1]
                );


            if (
                Number.isFinite(top) &&
                Number.isFinite(bottom) &&
                bottom !== 0
            ) {

                return top / bottom;

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

    const fractions = [

        [1 / 8, "⅛"],
        [1 / 4, "¼"],
        [1 / 3, "⅓"],
        [3 / 8, "⅜"],
        [1 / 2, "½"],
        [5 / 8, "⅝"],
        [2 / 3, "⅔"],
        [3 / 4, "¾"],
        [7 / 8, "⅞"]

    ];


    const whole =
        Math.floor(number);


    const decimal =
        number - whole;


    for (
        const [value, symbol]
        of fractions
    ) {

        if (
            Math.abs(
                decimal - value
            ) < 0.035
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
        Math.round(
            number * 100
        ) / 100
    );

}


/* =========================================================
   SCALE INGREDIENT
   ========================================================= */

function scaleIngredient(
    ingredient,
    multiplier
) {

    if (
        multiplier === 1
    ) {

        return ingredient;

    }


    /*
       Supports:

       2 cups
       1/2 cup
       ½ cup
       1.5 tbsp
       3 eggs
    */

    const match =
        ingredient.match(
            /^(\d+(?:\.\d+)?\s*\/\s*\d+|\d+(?:\.\d+)?|[½⅓⅔¼¾⅛⅜⅝⅞])(?=\s|$)/
        );


    if (!match) {
        return ingredient;
    }


    const original =
        match[1]
            .replace(/\s/g, "");


    const amount =
        getNumber(original);


    if (amount === null) {
        return ingredient;
    }


    const scaled =
        amount * multiplier;


    return (
        formatAmount(scaled) +
        ingredient.slice(
            match[0].length
        )
    );

}


/* =========================================================
   PUBLIC COOKBOOKS
   ========================================================= */

function renderPublicBooks() {

    const container =
        document.getElementById(
            "publicBooksList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const books =
        data.books.filter(
            book =>
                book.privacy ===
                "public"
        );


    if (!books.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div>📚</div>

                <h3>
                    No public cookbooks
                </h3>

                <p>
                    There aren't any public cookbooks yet.
                </p>

            </div>

        `;

        return;
    }


    books.forEach(book => {

        const button =
            document.createElement("button");


        button.type =
            "button";


        button.className =
            "main-button";


        button.style.marginBottom =
            "12px";


        button.textContent =
            `📖 ${book.name}`;


        button.addEventListener(
            "click",
            () => {

                currentBook =
                    normalizeBook(book);

                currentFolder = null;

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

        /*
           Make sure the home screen
           is the first screen.
        */

        hideScreens();

        showScreen("homeScreen");


        /*
           Repair old saved data.
        */

        data.books.forEach(
            normalizeBook
        );


        saveData();


        /*
           Confirm scanner exists.
        */

        const cameraInput =
            document.getElementById(
                "cameraInput"
            );


        if (!cameraInput) {

            console.error(
                "MealMind ERROR: cameraInput is missing."
            );

        }


        console.log(
            "MealMind loaded successfully."
        );

    }
);
```

