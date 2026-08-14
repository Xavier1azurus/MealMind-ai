"use strict";

/*
=========================================================
MEALMIND
No personal API required.

Features:
- Cookbooks
- Cookbook codes
- Folders
- Automatic recipe folder sorting
- 1–5 page scanner
- Local OCR
- Recipe format
- Ingredient calculator
- Notes
- Edit recipe
- Delete recipe
- Edit folder
- Delete folder
- Search
- Mobile/iPad buttons
=========================================================
*/

const STORAGE_KEY = "mealmind_v3";

let data = loadData();

let currentBook = null;
let currentFolder = null;
let currentRecipe = null;

let scanPages = [];
let scanPageCount = 1;


/* =====================================================
   STORAGE
===================================================== */

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

        console.error(error);
    }

    return {
        books: []
    };
}


function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );
}


function id() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .slice(2)
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


/* =====================================================
   SCREEN CONTROL
===================================================== */

function showScreen(screenID) {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {
            screen.classList.add("hidden");
        });

    const screen =
        document.getElementById(screenID);

    if (screen) {
        screen.classList.remove("hidden");
    }
}


function goHome() {

    closeRecipe();

    closeEditor();

    closeScanner();

    currentBook = null;
    currentFolder = null;
    currentRecipe = null;

    showScreen("homeScreen");
}


/* =====================================================
   BUTTON SYSTEM
===================================================== */

document.addEventListener("click", function(event) {

    const button =
        event.target.closest("[data-action]");

    if (!button) return;

    const action =
        button.dataset.action;


    if (action === "home") {
        goHome();
        return;
    }


    if (action === "make-cookbook") {

        showScreen("makeScreen");
        return;
    }


    if (action === "join-cookbook") {

        showScreen("joinScreen");
        return;
    }


    if (action === "public-books") {

        showScreen("publicScreen");
        renderPublicBooks();

        return;
    }


    if (action === "create-cookbook") {

        createCookbook();
        return;
    }


    if (action === "join") {

        joinCookbook();
        return;
    }


    if (action === "exit-book") {

        goHome();
        return;
    }


    if (action === "scan") {

        openScanner();
        return;
    }


    if (action === "add-folder") {

        addFolder();
        return;
    }


    if (action === "edit-folder") {

        editFolder(button.dataset.folder);
        return;
    }


    if (action === "delete-folder") {

        deleteFolder(button.dataset.folder);
        return;
    }


    if (action === "edit-recipe") {

        editRecipe();
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


    if (action === "save-recipe") {

        saveRecipeEdit();
        return;
    }


    if (action === "cancel-edit") {

        closeEditor();
        return;
    }


    if (action === "minus-servings") {

        changeServings(-1);
        return;
    }


    if (action === "plus-servings") {

        changeServings(1);
        return;
    }


    if (action === "scan-page") {

        startPageScan();
        return;
    }


    if (action === "finish-scan") {

        finishScan();
        return;
    }


    if (action === "cancel-scan") {

        closeScanner();
        return;
    }


    if (action === "change-pages") {

        setScanPages(
            Number(button.dataset.pages)
        );

        return;
    }


    if (button.dataset.folderCard) {

        currentFolder =
            button.dataset.folderCard;

        renderFolders();
        renderRecipes();

        return;
    }


    if (button.dataset.recipeId) {

        const recipe =
            currentBook?.recipes?.find(
                r =>
                    r.id ===
                    button.dataset.recipeId
            );

        if (recipe) {
            openRecipe(recipe);
        }

    }

});


/* =====================================================
   CREATE COOKBOOK
===================================================== */

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


    data.books.push(currentBook);

    saveData();

    openBook();
}


/* =====================================================
   JOIN COOKBOOK
===================================================== */

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
        data.books.find(
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


/* =====================================================
   OPEN BOOK
===================================================== */

function openBook() {

    if (!currentBook) return;

    showScreen("mainScreen");

    currentFolder = null;

    const title =
        document.getElementById("mainBookName");

    if (title) {
        title.textContent =
            currentBook.name;
    }

    renderFolders();
    renderRecipes();
}


/* =====================================================
   FOLDERS
===================================================== */

function renderFolders() {

    const container =
        document.getElementById("folders");

    if (!container) return;

    container.innerHTML = "";


    if (!currentBook) return;


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


        row.innerHTML = `

            <button
                type="button"
                class="folder-card"
                data-folder-card="${escapeHTML(folder)}"
            >

                <span>
                    📁
                </span>

                <span class="folder-name">
                    ${escapeHTML(folder)}
                </span>

                <span class="folder-count">
                    ${count}
                </span>

            </button>

            <button
                type="button"
                class="small-action"
                data-action="edit-folder"
                data-folder="${escapeHTML(folder)}"
            >
                ✏️
            </button>

            <button
                type="button"
                class="small-action danger"
                data-action="delete-folder"
                data-folder="${escapeHTML(folder)}"
            >
                🗑️
            </button>

        `;


        container.appendChild(row);

    });


    const title =
        document.getElementById(
            "recipeSectionTitle"
        );

    if (title) {

        title.textContent =
            currentFolder
                ? currentFolder
                : "Recipes";
    }
}


/* =====================================================
   ADD FOLDER
===================================================== */

function addFolder() {

    if (!currentBook) return;


    const name =
        prompt("Folder name:");

    if (!name) return;


    const folder =
        name.trim();

    if (!folder) return;


    const exists =
        currentBook.folders.some(
            f =>
                f.toLowerCase() ===
                folder.toLowerCase()
        );


    if (exists) {

        alert("That folder already exists.");
        return;
    }


    currentBook.folders.push(folder);

    saveData();

    renderFolders();
}


/* =====================================================
   EDIT FOLDER
===================================================== */

function editFolder(oldName) {

    if (!currentBook) return;


    if (oldName === "Recipes") {

        alert("The main Recipes folder cannot be renamed.");
        return;
    }


    const newName =
        prompt(
            "New folder name:",
            oldName
        );


    if (!newName) return;


    const name =
        newName.trim();

    if (!name) return;


    if (
        currentBook.folders.some(
            f =>
                f.toLowerCase() ===
                name.toLowerCase() &&
                f !== oldName
        )
    ) {

        alert("That folder already exists.");
        return;
    }


    const index =
        currentBook.folders.indexOf(oldName);

    if (index !== -1) {

        currentBook.folders[index] =
            name;
    }


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


/* =====================================================
   DELETE FOLDER
===================================================== */

function deleteFolder(folder) {

    if (!currentBook) return;


    if (folder === "Recipes") {

        alert(
            "The main Recipes folder cannot be deleted."
        );

        return;
    }


    const count =
        currentBook.recipes.filter(
            r =>
                r.folder === folder
        ).length;


    const okay =
        confirm(
            `Delete "${folder}"?\n\n${count} recipe(s) will be moved to Recipes.`
        );


    if (!okay) return;


    currentBook.recipes.forEach(recipe => {

        if (recipe.folder === folder) {

            recipe.folder = "Recipes";
        }

    });


    currentBook.folders =
        currentBook.folders.filter(
            f =>
                f !== folder
        );


    currentFolder = null;

    saveData();

    renderFolders();
    renderRecipes();
}


/* =====================================================
   RECIPES
===================================================== */

function renderRecipes() {

    const container =
        document.getElementById("recipes");

    if (!container) return;


    container.innerHTML = "";


    if (!currentBook) return;


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
                    [
                        recipe.title,
                        recipe.cuisine,
                        ...(recipe.ingredients || []),
                        ...(recipe.instructions || [])
                    ]
                    .join(" ")
                    .toLowerCase();

                return text.includes(search);

            });
    }


    if (!recipes.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-state-icon">
                    🍽️
                </div>

                <h3>
                    No recipes yet
                </h3>

                <p>
                    Scan a recipe to add it here.
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
                    ${
                        recipe.pages > 1
                            ? `${recipe.pages} scanned pages`
                            : "Recipe"
                    }
                </span>

            </div>

            <span class="recipe-arrow">
                ›
            </span>

        `;


        container.appendChild(button);

    });
}


/* =====================================================
   SEARCH
===================================================== */

document.addEventListener("input", event => {

    if (
        event.target.id ===
        "searchInput"
    ) {

        renderRecipes();
    }

});


/* =====================================================
   OPEN RECIPE
===================================================== */

function openRecipe(recipe) {

    currentRecipe = recipe;


    const viewer =
        document.createElement("div");

    viewer.id =
        "recipeViewer";

    viewer.className =
        "recipe-viewer";


    const servings =
        Number(recipe.servings) || 4;


    viewer.innerHTML = `

        <div class="recipe-viewer-background">

            <article class="recipe-sheet">

                <div class="recipe-topbar">

                    <button
                        class="recipe-back-button"
                        data-action="close-recipe"
                    >
                        ← Back
                    </button>

                    <div class="recipe-actions">

                        <button
                            class="recipe-action-button"
                            data-action="edit-recipe"
                        >
                            ✏️ Edit
                        </button>

                        <button
                            class="recipe-action-button danger"
                            data-action="delete-recipe"
                        >
                            🗑️
                        </button>

                    </div>

                </div>


                <header class="recipe-header">

                    <div class="recipe-label">
                        MEALMIND RECIPE
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
                                    ${escapeHTML(recipe.cuisine)}
                                </p>
                              `
                            : ""
                    }


                    <div class="recipe-serving-row">

                        <span>
                            🍽️ Serves
                        </span>

                        <button
                            data-action="minus-servings"
                        >
                            −
                        </button>

                        <strong id="servingNumber">
                            ${servings}
                        </strong>

                        <button
                            data-action="plus-servings"
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
                        id="ingredientList"
                        class="recipe-ingredients"
                    ></ul>

                </section>


                <section class="recipe-section">

                    <h2>
                        Instructions
                    </h2>

                    <ol
                        id="instructionList"
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
                                    ${escapeHTML(recipe.notes)}
                                </p>

                            </section>
                          `
                        : ""
                }


                <footer class="recipe-footer">
                    Made by Narayan Xavier Gill
                </footer>

            </article>

        </div>
    `;


    document.body.appendChild(viewer);

    renderIngredients(recipe, servings);
    renderInstructions(recipe);
}


/* =====================================================
   CLOSE RECIPE
===================================================== */

function closeRecipe() {

    document
        .getElementById("recipeViewer")
        ?.remove();

    currentRecipe = null;
}


/* =====================================================
   DELETE RECIPE
===================================================== */

function deleteRecipe() {

    if (
        !currentBook ||
        !currentRecipe
    ) {
        return;
    }


    const okay =
        confirm(
            `Delete "${currentRecipe.title || "this recipe"}"?`
        );


    if (!okay) return;


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


/* =====================================================
   EDIT RECIPE
===================================================== */

function editRecipe() {

    if (!currentRecipe) return;


    closeRecipe();


    const overlay =
        document.createElement("div");

    overlay.id =
        "editorModal";

    overlay.className =
        "editor-overlay";


    overlay.innerHTML = `

        <div class="editor-box">

            <h2>
                Edit Recipe
            </h2>

            <label>
                Recipe title
            </label>

            <input
                id="editTitle"
                value="${escapeHTML(
                    currentRecipe.title || ""
                )}"
            >


            <label>
                Cuisine
            </label>

            <input
                id="editCuisine"
                value="${escapeHTML(
                    currentRecipe.cuisine || ""
                )}"
            >


            <label>
                Servings
            </label>

            <input
                id="editServings"
                type="number"
                min="1"
                value="${
                    Number(currentRecipe.servings) || 4
                }"
            >


            <label>
                Ingredients
            </label>

            <textarea
                id="editIngredients"
            >${escapeHTML(
                (currentRecipe.ingredients || [])
                    .join("\n")
            )}</textarea>


            <label>
                Instructions
            </label>

            <textarea
                id="editInstructions"
            >${escapeHTML(
                (currentRecipe.instructions || [])
                    .join("\n")
            )}</textarea>


            <label>
                Notes
            </label>

            <textarea
                id="editNotes"
            >${escapeHTML(
                currentRecipe.notes || ""
            )}</textarea>


            <div class="editor-buttons">

                <button
                    class="primary-button"
                    data-action="save-recipe"
                >
                    Save Recipe
                </button>

                <button
                    class="secondary-button"
                    data-action="cancel-edit"
                >
                    Cancel
                </button>

            </div>

        </div>
    `;


    document.body.appendChild(overlay);
}


/* =====================================================
   SAVE RECIPE EDIT
===================================================== */

function saveRecipeEdit() {

    if (!currentRecipe) return;


    const title =
        document.getElementById("editTitle")
            ?.value
            .trim();


    const cuisine =
        document.getElementById("editCuisine")
            ?.value
            .trim();


    const servings =
        Number(
            document.getElementById("editServings")
                ?.value
        ) || 4;


    const ingredients =
        document.getElementById("editIngredients")
            ?.value
            .split(/\r?\n/)
            .map(x => x.trim())
            .filter(Boolean) || [];


    const instructions =
        document.getElementById("editInstructions")
            ?.value
            .split(/\r?\n/)
            .map(x => x.trim())
            .filter(Boolean) || [];


    const notes =
        document.getElementById("editNotes")
            ?.value
            .trim() || "";


    currentRecipe.title =
        title || "Untitled Recipe";

    currentRecipe.cuisine =
        cuisine;

    currentRecipe.servings =
        servings;

    currentRecipe.ingredients =
        ingredients;

    currentRecipe.instructions =
        instructions;

    currentRecipe.notes =
        notes;


    saveData();

    closeEditor();

    renderRecipes();

    openRecipe(currentRecipe);
}


/* =====================================================
   CLOSE EDITOR
===================================================== */

function closeEditor() {

    document
        .getElementById("editorModal")
        ?.remove();
}


/* =====================================================
   INGREDIENT CALCULATOR
===================================================== */

function renderIngredients(
    recipe,
    servings
) {

    const list =
        document.getElementById(
            "ingredientList"
        );

    if (!list) return;


    list.innerHTML = "";


    const original =
        Number(recipe.servings) || 4;


    const multiplier =
        servings / original;


    (recipe.ingredients || [])
        .forEach(ingredient => {

            const li =
                document.createElement("li");

            li.textContent =
                scaleIngredient(
                    ingredient,
                    multiplier
                );

            list.appendChild(li);

        });
}


function changeServings(amount) {

    if (!currentRecipe) return;


    const number =
        document.getElementById(
            "servingNumber"
        );

    if (!number) return;


    let servings =
        Number(number.textContent) || 4;


    servings += amount;


    if (servings < 1) {
        servings = 1;
    }


    number.textContent =
        servings;


    renderIngredients(
        currentRecipe,
        servings
    );
}


function scaleIngredient(
    text,
    multiplier
) {

    if (multiplier === 1) {
        return text;
    }


    const match =
        text.match(
            /^(\d+(?:\.\d+)?|\d+\/\d+|½|⅓|⅔|¼|¾|⅛|⅜|⅝|⅞)(?=\s|$)/
        );


    if (!match) {
        return text;
    }


    const amount =
        parseAmount(match[1]);


    if (amount === null) {
        return text;
    }


    return (
        formatAmount(
            amount * multiplier
        ) +
        text.slice(match[0].length)
    );
}


function parseAmount(value) {

    const fractions = {
        "½": .5,
        "⅓": 1 / 3,
        "⅔": 2 / 3,
        "¼": .25,
        "¾": .75,
        "⅛": .125,
        "⅜": .375,
        "⅝": .625,
        "⅞": .875
    };


    if (
        fractions[value] !== undefined
    ) {
        return fractions[value];
    }


    if (value.includes("/")) {

        const parts =
            value.split("/");

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


    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : null;
}


function formatAmount(number) {

    const fractions = [
        [.125, "⅛"],
        [.25, "¼"],
        [1 / 3, "⅓"],
        [.375, "⅜"],
        [.5, "½"],
        [.625, "⅝"],
        [2 / 3, "⅔"],
        [.75, "¾"],
        [.875, "⅞"]
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
            Math.abs(decimal - value) < .025
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
        ) < .01
    ) {

        return String(
            Math.round(number)
        );
    }


    return String(
        Math.round(number * 100) / 100
    );
}


/* =====================================================
   INSTRUCTIONS
===================================================== */

function renderInstructions(recipe) {

    const list =
        document.getElementById(
            "instructionList"
        );

    if (!list) return;


    list.innerHTML = "";


    (recipe.instructions || [])
        .forEach(instruction => {

            const li =
                document.createElement("li");

            li.textContent =
                instruction;

            list.appendChild(li);

        });
}


/* =====================================================
   SCANNER
===================================================== */

function openScanner() {

    if (!currentBook) {

        alert(
            "Open your cookbook first."
        );

        return;
    }


    scanPages = [];

    scanPageCount = 1;


    const overlay =
        document.createElement("div");

    overlay.id =
        "scannerOverlay";

    overlay.className =
        "scanner-overlay";


    overlay.innerHTML = `

        <div class="scanner-box">

            <h2>
                📷 Scan Recipe
            </h2>

            <p class="muted">
                Choose how many pages your recipe has.
                You can scan each page separately.
            </p>


            <div class="page-counter">

                <span id="scanPageText">
                    1 page
                </span>

            </div>


            <div class="scanner-buttons">

                <button
                    class="secondary-button"
                    data-action="change-pages"
                    data-pages="1"
                >
                    1 Page
                </button>

                <button
                    class="secondary-button"
                    data-action="change-pages"
                    data-pages="2"
                >
                    2 Pages
                </button>

                <button
                    class="secondary-button"
                    data-action="change-pages"
                    data-pages="3"
                >
                    3 Pages
                </button>

                <button
                    class="secondary-button"
                    data-action="change-pages"
                    data-pages="4"
                >
                    4 Pages
                </button>

                <button
                    class="secondary-button"
                    data-action="change-pages"
                    data-pages="5"
                >
                    5 Pages
                </button>

                <button
                    class="primary-button"
                    data-action="scan-page"
                >
                    📸 Scan Page 1
                </button>

                <button
                    class="secondary-button"
                    data-action="finish-scan"
                >
                    Finish Recipe
                </button>

                <button
                    class="secondary-button"
                    data-action="cancel-scan"
                >
                    Cancel
                </button>

            </div>


            <div id="scanPagesPreview"></div>

            <input
                id="scannerFileInput"
                type="file"
                accept="image/*"
                capture="environment"
                hidden
            >

        </div>
    `;


    document.body.appendChild(overlay);

    updateScanner();
}


function setScanPages(number) {

    number =
        Math.max(
            1,
            Math.min(5, number)
        );


    scanPageCount =
        number;


    updateScanner();
}


function updateScanner() {

    const text =
        document.getElementById(
            "scanPageText"
        );


    if (text) {

        text.textContent =
            `${scanPageCount} ${
                scanPageCount === 1
                    ? "page"
                    : "pages"
            } selected`;
    }


    const scanButton =
        document.querySelector(
            '#scannerOverlay [data-action="scan-page"]'
        );


    if (scanButton) {

        const next =
            scanPages.length + 1;


        if (next <= scanPageCount) {

            scanButton.textContent =
                `📸 Scan Page ${next}`;

        } else {

            scanButton.textContent =
                "📸 Scan Again";
        }
    }


    renderScanPreviews();
}


function renderScanPreviews() {

    const container =
        document.getElementById(
            "scanPagesPreview"
        );

    if (!container) return;


    container.innerHTML = "";


    scanPages.forEach((file, index) => {

        const image =
            document.createElement("img");

        image.className =
            "scan-preview";

        image.src =
            URL.createObjectURL(file);

        image.alt =
            `Recipe page ${index + 1}`;

        container.appendChild(image);

    });
}


function startPageScan() {

    const input =
        document.getElementById(
            "scannerFileInput"
        );

    if (!input) return;


    input.value = "";


    input.onchange =
        async function() {

            const file =
                input.files?.[0];

            if (!file) return;


            if (
                scanPages.length >=
                scanPageCount
            ) {

                alert(
                    "You already selected all the pages."
                );

                return;
            }


            scanPages.push(file);

            updateScanner();


            if (
                scanPages.length ===
                scanPageCount
            ) {

                const finish =
                    confirm(
                        "All pages have been selected. Scan the recipe now?"
                    );

                if (finish) {

                    await finishScan();
                }
            }
        };


    input.click();
}


/* =====================================================
   FINISH SCAN
===================================================== */

async function finishScan() {

    if (!scanPages.length) {

        alert(
            "Scan at least one recipe page first."
        );

        return;
    }


    closeScanner();


    showScannerStatus(
        "Starting recipe scanner..."
    );


    try {

        await loadTesseract();


        let combinedText = "";


        for (
            let i = 0;
            i < scanPages.length;
            i++
        ) {

            showScannerStatus(
                `Reading page ${i + 1} of ${scanPages.length}...`
            );


            const result =
                await Tesseract.recognize(
                    scanPages[i],
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
                                    `Reading page ${i + 1} of ${scanPages.length}... ${percent}%`
                                );
                            }
                        }
                    }
                );


            combinedText +=
                "\n" +
                result.data.text;
        }


        showScannerStatus(
            "Organizing your recipe..."
        );


        const recipe =
            parseRecipe(
                combinedText
            );


        recipe.id =
            id();


        recipe.pages =
            scanPages.length;


        recipe.folder =
            currentFolder ||
            "Recipes";


        if (
            !currentBook.folders.includes(
                recipe.folder
            )
        ) {

            recipe.folder =
                "Recipes";
        }


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
            "The scanner couldn't read the image. Try a clearer photo with good lighting."
        );
    }
}


/* =====================================================
   LOAD TESSERACT
===================================================== */

let tesseractPromise = null;


function loadTesseract() {

    if (window.Tesseract) {
        return Promise.resolve();
    }


    if (tesseractPromise) {
        return tesseractPromise;
    }


    tesseractPromise =
        new Promise(
            (resolve, reject) => {

                const script =
                    document.createElement("script");


                script.src =
                    "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";


                script.onload =
                    () => resolve();


                script.onerror =
                    () =>
                        reject(
                            new Error(
                                "OCR library failed to load."
                            )
                        );


                document.head.appendChild(
                    script
                );
            }
        );


    return tesseractPromise;
}


/* =====================================================
   RECIPE PARSER
===================================================== */

function parseRecipe(rawText) {

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


    const ingredientHeading =
        /^(ingredients?|what you need|you will need)$/i;


    const instructionHeading =
        /^(instructions?|directions?|method|preparation|steps|how to make)$/i;


    const notesHeading =
        /^(notes?|tips?)$/i;


    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        const line =
            lines[i];


        if (
            ingredientHeading.test(line)
        ) {

            section = "ingredients";
            continue;
        }


        if (
            instructionHeading.test(line)
        ) {

            section = "instructions";
            continue;
        }


        if (
            notesHeading.test(line)
        ) {

            section = "notes";
            continue;
        }


        /*
        TITLE:
        The first useful line near the top
        becomes the recipe title.
        */

        if (
            !title &&
            i < 8 &&
            line.length >= 3 &&
            line.length <= 100 &&
            !looksLikeIngredient(line) &&
            !looksLikeInstruction(line) &&
            !ingredientHeading.test(line) &&
            !instructionHeading.test(line)
        ) {

            title =
                cleanTitle(line);

            continue;
        }


        if (
            section === "ingredients"
        ) {

            if (
                !looksLikeInstruction(line)
            ) {

                ingredients.push(
                    cleanIngredient(line)
                );
            }

            continue;
        }


        if (
            section === "instructions"
        ) {

            instructions.push(
                cleanInstruction(line)
            );

            continue;
        }


        if (
            section === "notes"
        ) {

            notes +=
                (
                    notes
                        ? " "
                        : ""
                ) +
                line;

            continue;
        }

    }


    /*
    If headings weren't detected,
    intelligently separate the page.
    */

    if (
        ingredients.length === 0 ||
        instructions.length === 0
    ) {

        const fallback =
            fallbackSplit(lines);


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
    Remove obvious scan junk.
    */

    ingredients =
        cleanArray(ingredients);


    instructions =
        cleanArray(instructions);


    if (!title) {

        title =
            "Untitled Recipe";
    }


    return {

        title,

        cuisine: "",

        servings: 4,

        ingredients,

        instructions,

        notes

    };
}


/* =====================================================
   OCR CLEANUP
===================================================== */

function cleanTitle(text) {

    return text
        .replace(/^[•●▪◦*-]\s*/, "")
        .replace(/\s+/g, " ")
        .trim();
}


function cleanIngredient(text) {

    return text
        .replace(/^[•●▪◦*-]\s*/, "")
        .replace(/^\d+[.)]\s*/, "")
        .replace(/\s+/g, " ")
        .trim();
}


function cleanInstruction(text) {

    return text
        .replace(/^\d+[.)]\s*/, "")
        .replace(/^[•●▪◦*-]\s*/, "")
        .replace(/\s+/g, " ")
        .trim();
}


function cleanArray(array) {

    return array
        .map(x => x.trim())
        .filter(x => x.length > 1)
        .filter(
            (x, index, arr) =>
                arr.indexOf(x) === index
        );
}


/* =====================================================
   INGREDIENT DETECTION
===================================================== */

function looksLikeIngredient(line) {

    return /(^\d|½|⅓|⅔|¼|¾|⅛|⅜|⅝|⅞).*(cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|oz|ounce|ounces|lb|lbs|pound|pounds|g|kg|ml|l|pinch|clove|cloves)/i
        .test(line);
}


function looksLikeInstruction(line) {

    return /^(add|mix|stir|bake|cook|heat|combine|place|pour|remove|serve|chop|slice|preheat|whisk|fold|boil|simmer|let|allow|season|transfer|drain|bring|cover|uncover|refrigerate|chill|beat|melt|fry|saute|sauté|roast|grill)\b/i
        .test(line);
}


/* =====================================================
   FALLBACK SPLIT
===================================================== */

function fallbackSplit(lines) {

    const ingredients = [];
    const instructions = [];


    let instructionStarted =
        false;


    for (
        let i = 0;
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
                cleanIngredient(line)
            );
        }

    }


    /*
    If OCR did not recognize measurements,
    split around the middle.
    */

    if (
        ingredients.length < 2 &&
        instructions.length < 1 &&
        lines.length >= 6
    ) {

        const start =
            titleOffset(lines);


        const middle =
            Math.ceil(
                (
                    lines.length -
                    start
                ) * .55
            ) + start;


        return {

            ingredients:
                lines
                    .slice(start, middle)
                    .map(cleanIngredient),

            instructions:
                lines
                    .slice(middle)
                    .map(cleanInstruction)

        };
    }


    return {
        ingredients,
        instructions
    };
}


function titleOffset(lines) {

    return lines.length > 1
        ? 1
        : 0;
}


/* =====================================================
   SCANNER STATUS
===================================================== */

function showScannerStatus(text) {

    let box =
        document.getElementById(
            "scannerStatus"
        );


    if (!box) {

        box =
            document.createElement("div");

        box.id =
            "scannerStatus";

        box.className =
            "scanner-overlay";

        box.innerHTML = `

            <div class="scanner-box">

                <div class="scanner-status">
                    ${escapeHTML(text)}
                </div>

            </div>
        `;

        document.body.appendChild(box);

    } else {

        const status =
            box.querySelector(
                ".scanner-status"
            );

        if (status) {
            status.textContent = text;
        }
    }
}


function hideScannerStatus() {

    document
        .getElementById(
            "scannerStatus"
        )
        ?.remove();
}


function closeScanner() {

    document
        .getElementById(
            "scannerOverlay"
        )
        ?.remove();

    scanPages = [];
    scanPageCount = 1;
}


/* =====================================================
   PUBLIC BOOKS
===================================================== */

function renderPublicBooks() {

    const container =
        document.getElementById(
            "publicBooksList"
        );

    if (!container) return;


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

                <div class="empty-state-icon">
                    📚
                </div>

                <p>
                    No public cookbooks yet.
                </p>

            </div>
        `;

        return;
    }


    books.forEach(book => {

        const button =
            document.createElement("button");

        button.className =
            "secondary-button";

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


/* =====================================================
   MIGRATE OLD DATA
===================================================== */

function migrateData() {

    data.books.forEach(book => {

        if (!Array.isArray(book.folders)) {

            book.folders = [
                "Recipes"
            ];
        }


        if (
            !book.folders.includes(
                "Recipes"
            )
        ) {

            book.folders.unshift(
                "Recipes"
            );
        }


        if (!Array.isArray(book.recipes)) {

            book.recipes = [];
        }


        book.recipes.forEach(recipe => {

            if (!recipe.id) {
                recipe.id = id();
            }


            if (!recipe.folder) {
                recipe.folder = "Recipes";
            }


            if (
                !Array.isArray(
                    recipe.ingredients
                )
            ) {

                recipe.ingredients = [];
            }


            if (
                !Array.isArray(
                    recipe.instructions
                )
            ) {

                recipe.instructions = [];
            }


            if (!recipe.servings) {

                recipe.servings = 4;
            }


            if (!recipe.pages) {

                recipe.pages = 1;
            }

        });

    });


    saveData();
}


/* =====================================================
   START
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        migrateData();

        showScreen("homeScreen");

    }
);


