```javascript
"use strict";

/* =========================================================
   MEALMIND
   Clean Cookbook Recipe Layout
   Recipe Scanner + Recipe Pages + Serving Calculator
   ========================================================= */

const STORAGE_KEY = "mealmind_v7";

let data = loadData();

let currentBook = null;
let currentFolder = null;
let pendingRecipe = null;
let editingRecipeId = null;
let viewedRecipe = null;


/* =========================================================
   STORAGE
   ========================================================= */

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return { books: [] };
        }

        const parsed = JSON.parse(saved);

        if (!parsed || !Array.isArray(parsed.books)) {
            return { books: [] };
        }

        return parsed;

    } catch (error) {
        console.error("MealMind load error:", error);
        return { books: [] };
    }
}


function saveData() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );
}


/* =========================================================
   HELPERS
   ========================================================= */

function createId() {
    return (
        Date.now().toString(36) +
        Math.random().toString(36).slice(2)
    );
}


function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function uniqueLines(lines) {
    const seen = new Set();
    const result = [];

    for (const line of lines) {
        const clean = String(line || "")
            .replace(/\s+/g, " ")
            .trim();

        if (!clean) continue;

        const key = clean.toLowerCase();

        if (seen.has(key)) continue;

        seen.add(key);
        result.push(clean);
    }

    return result;
}


/* =========================================================
   SCREEN CONTROL
   ========================================================= */

function hideAllScreens() {

    document.querySelectorAll(
        ".screen, #homeScreen, #makeScreen, #joinScreen, #publicScreen, #mainScreen"
    ).forEach(element => {
        element.classList.add("hidden");
    });
}


function showScreen(id) {

    hideAllScreens();

    const screen = document.getElementById(id);

    if (screen) {
        screen.classList.remove("hidden");
    }
}


function goHome() {

    currentBook = null;
    currentFolder = null;
    viewedRecipe = null;

    showScreen("homeScreen");
}


/* =========================================================
   HOME BUTTONS
   ========================================================= */

document
    .getElementById("makeCookbookButton")
    ?.addEventListener("click", () => {
        showScreen("makeScreen");
    });


document
    .getElementById("joinCookbookButton")
    ?.addEventListener("click", () => {
        showScreen("joinScreen");
    });


document
    .getElementById("publicBooksButton")
    ?.addEventListener("click", () => {

        showScreen("publicScreen");

        renderPublicBooks();

    });


document
    .getElementById("backFromMake")
    ?.addEventListener("click", goHome);


document
    .getElementById("backFromJoin")
    ?.addEventListener("click", goHome);


document
    .getElementById("backFromPublic")
    ?.addEventListener("click", goHome);


/* =========================================================
   PASSWORD VISIBILITY
   ========================================================= */

function togglePassword(id) {

    const input = document.getElementById(id);

    if (!input) return;

    input.type =
        input.type === "password"
            ? "text"
            : "password";
}


document
    .getElementById("showPasswordButton")
    ?.addEventListener("click", () => {
        togglePassword("cookbookPassword");
    });


document
    .getElementById("showJoinPassword")
    ?.addEventListener("click", () => {
        togglePassword("joinPassword");
    });


/* =========================================================
   PRIVACY
   ========================================================= */

window.mealmindPrivacy = "private";


document
    .getElementById("privateButton")
    ?.addEventListener("click", () => {

        window.mealmindPrivacy = "private";

        document
            .getElementById("privateButton")
            ?.classList.add("selected");

        document
            .getElementById("publicButton")
            ?.classList.remove("selected");
    });


document
    .getElementById("publicButton")
    ?.addEventListener("click", () => {

        window.mealmindPrivacy = "public";

        document
            .getElementById("publicButton")
            ?.classList.add("selected");

        document
            .getElementById("privateButton")
            ?.classList.remove("selected");
    });


/* =========================================================
   CREATE COOKBOOK
   ========================================================= */

document
    .getElementById("createCookbookButton")
    ?.addEventListener("click", createCookbook);


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

    const error =
        document.getElementById("makeError");

    if (error) {
        error.textContent = "";
    }

    if (!name) {

        if (error) {
            error.textContent =
                "Please enter a cookbook name.";
        }

        return;
    }

    if (password.length < 4) {

        if (error) {
            error.textContent =
                "Password must be at least 4 characters.";
        }

        return;
    }

    currentBook = {

        id: createId(),

        name,

        privacy:
            window.mealmindPrivacy,

        password,

        folders: [
            "Sweet",
            "Savoury",
            "Fried",
            "International"
        ],

        recipes: []
    };

    data.books.push(currentBook);

    saveData();

    openBook();
}


/* =========================================================
   JOIN COOKBOOK
   ========================================================= */

document
    .getElementById("joinButton")
    ?.addEventListener("click", joinBook);


function joinBook() {

    const name =
        document
            .getElementById("joinName")
            ?.value
            .trim();

    const password =
        document
            .getElementById("joinPassword")
            ?.value || "";

    const error =
        document.getElementById("joinError");

    if (error) {
        error.textContent = "";
    }

    const book =
        data.books.find(
            item =>
                item.name.toLowerCase() ===
                name.toLowerCase()
        );

    if (!book) {

        if (error) {
            error.textContent =
                "Cookbook not found.";
        }

        return;
    }

    if (book.password !== password) {

        if (error) {
            error.textContent =
                "Incorrect password.";
        }

        return;
    }

    currentBook = book;

    openBook();
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
        data.books.filter(
            book =>
                book.privacy === "public"
        );

    if (!books.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div>📚</div>
                <p>No public cookbooks yet.</p>
            </div>
        `;

        return;
    }

    books.forEach(book => {

        const button =
            document.createElement("button");

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
   OPEN BOOK
   ========================================================= */

function openBook() {

    showScreen("mainScreen");

    const bookName =
        document.getElementById(
            "mainBookName"
        );

    if (bookName) {
        bookName.textContent =
            currentBook.name;
    }

    const badge =
        document.getElementById(
            "privacyBadge"
        );

    if (badge) {

        badge.textContent =
            currentBook.privacy === "public"
                ? "🌐 Public"
                : "🔒 Private";
    }

    currentFolder = null;

    renderBook();
}


document
    .getElementById("exitBookButton")
    ?.addEventListener("click", goHome);


/* =========================================================
   RENDER BOOK
   ========================================================= */

function renderBook() {

    renderFolders();

    renderRecipes();
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

        const button =
            document.createElement("button");

        button.className =
            "folder-card";

        button.innerHTML = `
            <div class="folder-icon">📁</div>

            <strong>
                ${escapeHTML(folder)}
            </strong>

            <span>
                ${count}
                ${count === 1 ? "recipe" : "recipes"}
            </span>
        `;

        button.addEventListener(
            "click",
            () => {

                currentFolder = folder;

                renderRecipes();
            }
        );

        container.appendChild(button);
    });
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
        currentBook.recipes || [];

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
            recipes.filter(
                recipe =>
                    recipe.title
                        .toLowerCase()
                        .includes(search)
            );
    }

    if (!recipes.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div>🍽️</div>
                <p>No recipes here yet.</p>
            </div>
        `;

        return;
    }

    recipes.forEach(recipe => {

        const card =
            document.createElement("button");

        card.className =
            "recipe-card";

        card.innerHTML = `
            <div class="recipe-card-icon">
                🍴
            </div>

            <div class="recipe-card-info">

                <strong>
                    ${escapeHTML(
                        recipe.title ||
                        "Untitled Recipe"
                    )}
                </strong>

                <span>
                    ${recipe.servings || 4}
                    servings
                </span>

            </div>
        `;

        card.addEventListener(
            "click",
            () => openRecipe(recipe)
        );

        container.appendChild(card);
    });
}


document
    .getElementById("searchInput")
    ?.addEventListener(
        "input",
        renderRecipes
    );


/* =========================================================
   SCANNER
   ========================================================= */

document
    .getElementById("scanButton")
    ?.addEventListener(
        "click",
        () => {

            const input =
                document.getElementById(
                    "cameraInput"
                );

            if (!input) return;

            input.value = "";

            input.click();
        }
    );


document
    .getElementById("cameraInput")
    ?.addEventListener(
        "change",
        async event => {

            const file =
                event.target.files?.[0];

            if (!file) return;

            setScanStatus(
                "📸 Reading your recipe..."
            );

            const recipe =
                await scanRecipe(file);

            if (!recipe) return;

            pendingRecipe = recipe;

            setScanStatus(
                "✅ Recipe organized!"
            );

            const pageModal =
                document.getElementById(
                    "pageCountModal"
                );

            if (pageModal) {

                pageModal.classList.remove(
                    "hidden"
                );

            } else {

                openRecipeEditor(
                    recipe
                );
            }
        }
    );


function setScanStatus(text) {

    const status =
        document.getElementById(
            "scanStatus"
        );

    if (status) {
        status.textContent = text;
    }
}


/* =========================================================
   OCR SCANNER
   ========================================================= */

async function scanRecipe(file) {

    try {

        if (
            typeof Tesseract ===
            "undefined"
        ) {

            throw new Error(
                "Tesseract.js is not loaded."
            );
        }

        const result =
            await Tesseract.recognize(
                file,
                "eng",
                {
                    logger(info) {

                        if (
                            info.status ===
                            "recognizing text"
                        ) {

                            const percent =
                                Math.round(
                                    (info.progress || 0) *
                                    100
                                );

                            setScanStatus(
                                `🔎 Reading ${percent}%`
                            );
                        }
                    }
                }
            );

        const text =
            result?.data?.text || "";

        if (!text.trim()) {
            throw new Error(
                "No text found."
            );
        }

        return parseRecipe(text);

    } catch (error) {

        console.error(
            "Scanner error:",
            error
        );

        setScanStatus(
            "❌ Couldn't read recipe."
        );

        alert(
            "MealMind couldn't read that photo clearly. Try a brighter, straighter photo."
        );

        return null;
    }
}


/* =========================================================
   RECIPE PARSER
   ========================================================= */

function parseRecipe(text) {

    const lines =
        text
            .normalize("NFKC")
            .replace(/\r/g, "")
            .split("\n")
            .map(line =>
                line
                    .replace(/\s+/g, " ")
                    .trim()
            )
            .filter(Boolean);

    const ingredients = [];
    const instructions = [];
    const notes = [];

    let section = "unknown";

    for (const line of lines) {

        const lower =
            line
                .toLowerCase()
                .replace(/[:\-–—]+$/, "")
                .trim();

        if (
            [
                "ingredients",
                "ingredient",
                "what you need",
                "you will need"
            ].includes(lower)
        ) {

            section = "ingredients";
            continue;
        }

        if (
            [
                "instructions",
                "instruction",
                "directions",
                "direction",
                "method",
                "steps",
                "preparation",
                "how to make"
            ].includes(lower)
        ) {

            section = "instructions";
            continue;
        }

        if (
            [
                "notes",
                "note",
                "tips",
                "tip"
            ].includes(lower)
        ) {

            section = "notes";
            continue;
        }

        if (
            line.length < 2
        ) {
            continue;
        }

        if (
            section === "ingredients" &&
            looksLikeIngredient(line)
        ) {

            ingredients.push(
                cleanIngredient(line)
            );

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

            notes.push(line);

            continue;
        }
    }

    /*
     * Fallback for recipes that don't have
     * clear headings.
     */

    if (
        ingredients.length === 0
    ) {

        for (const line of lines) {

            if (
                looksLikeIngredient(line)
            ) {

                ingredients.push(
                    cleanIngredient(line)
                );
            }
        }
    }

    if (
        instructions.length === 0
    ) {

        let started = false;

        for (const line of lines) {

            if (
                looksLikeInstruction(line)
            ) {

                started = true;

                instructions.push(
                    cleanInstruction(line)
                );

                continue;
            }

            if (
                started &&
                line.length > 25 &&
                !looksLikeIngredient(line)
            ) {

                instructions.push(
                    cleanInstruction(line)
                );
            }
        }
    }

    return {

        id: null,

        /*
         * TITLE INTENTIONALLY EMPTY.
         */
        title: "",

        cuisine: "",

        servings: 4,

        folder:
            currentBook?.folders?.[0] ||
            "Sweet",

        ingredients:
            uniqueLines(ingredients),

        instructions:
            uniqueLines(instructions),

        notes:
            uniqueLines(notes).join(" "),

        pages: 1
    };
}


/* =========================================================
   INGREDIENT DETECTION
   ========================================================= */

function looksLikeIngredient(line) {

    const measurement =
        /(^|\s)(\d+([/.]\d+)?|\d+\s+\d+\/\d+|½|⅓|⅔|¼|¾|⅛|⅜|⅝|⅞)\s*(cups?|tbsp|tsp|tablespoons?|teaspoons?|oz|ounces?|lb|lbs|pounds?|g|grams?|kg|ml|milliliters?|l|liters?|pinch|dash)\b/i;

    if (
        measurement.test(line)
    ) {
        return true;
    }

    if (
        /^\s*(\d+\/\d+|½|⅓|⅔|¼|¾|⅛|⅜|⅝|⅞)\s+/
            .test(line)
    ) {
        return true;
    }

    return false;
}


function cleanIngredient(line) {

    return line
        .replace(/^\s*[-•*]\s*/, "")
        .replace(/^\s*\d+[\.\)]\s*/, "")
        .trim();
}


function cleanInstruction(line) {

    return line
        .replace(/^\s*\d+[\.\):\-]\s*/, "")
        .replace(/^\s*[-•*]\s*/, "")
        .trim();
}


function looksLikeInstruction(line) {

    return /^\s*\d+[\.\):\-]\s*/.test(line) ||
        /^(preheat|heat|cook|bake|boil|simmer|fry|stir|mix|whisk|combine|add|pour|place|put|remove|serve|chop|slice|dice|cut|blend|beat|fold|knead|roast|grill|season|drain|cover|cool|refrigerate|freeze|rest)\b/i
            .test(line);
}


/* =========================================================
   PAGE COUNT
   ========================================================= */

document
    .querySelectorAll("[data-pages]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                if (!pendingRecipe) return;

                pendingRecipe.pages =
                    Number(
                        button.dataset.pages
                    ) || 1;

                document
                    .getElementById(
                        "pageCountModal"
                    )
                    ?.classList.add("hidden");

                openRecipeEditor(
                    pendingRecipe
                );
            }
        );
    });


/* =========================================================
   EDITOR
   ========================================================= */

function openRecipeEditor(recipe) {

    editingRecipeId =
        recipe.id || null;

    const title =
        document.getElementById(
            "recipeTitleInput"
        );

    if (title) {
        title.value =
            recipe.title || "";
    }

    const cuisine =
        document.getElementById(
            "recipeCuisine"
        );

    if (cuisine) {
        cuisine.value =
            recipe.cuisine || "";
    }

    const servings =
        document.getElementById(
            "recipeServings"
        );

    if (servings) {
        servings.value =
            recipe.servings || 4;
    }

    const ingredients =
        document.getElementById(
            "recipeIngredients"
        );

    if (ingredients) {
        ingredients.value =
            (recipe.ingredients || [])
                .join("\n");
    }

    const instructions =
        document.getElementById(
            "recipeInstructions"
        );

    if (instructions) {
        instructions.value =
            (recipe.instructions || [])
                .join("\n");
    }

    const notes =
        document.getElementById(
            "recipeNotes"
        );

    if (notes) {
        notes.value =
            recipe.notes || "";
    }

    const folder =
        document.getElementById(
            "recipeFolder"
        );

    if (folder) {

        folder.innerHTML = "";

        (
            currentBook?.folders || []
        ).forEach(folderName => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                folderName;

            option.textContent =
                folderName;

            folder.appendChild(option);
        });

        folder.value =
            recipe.folder ||
            currentBook?.folders?.[0] ||
            "";
    }

    document
        .getElementById("editorModal")
        ?.classList.remove("hidden");
}


/* =========================================================
   SAVE RECIPE
   ========================================================= */

document
    .getElementById("saveRecipeButton")
    ?.addEventListener(
        "click",
        saveRecipe
    );


function saveRecipe() {

    const title =
        document
            .getElementById(
                "recipeTitleInput"
            )
            ?.value
            .trim();

    const error =
        document.getElementById(
            "editorError"
        );

    if (!title) {

        if (error) {
            error.textContent =
                "Please enter a recipe title.";
        }

        return;
    }

    let servings =
        Number(
            document.getElementById(
                "recipeServings"
            )?.value
        );

    if (
        !Number.isFinite(servings) ||
        servings <= 0
    ) {
        servings = 4;
    }

    const recipe = {

        id:
            editingRecipeId ||
            createId(),

        title,

        cuisine:
            document
                .getElementById(
                    "recipeCuisine"
                )
                ?.value
                .trim() || "",

        servings,

        folder:
            document
                .getElementById(
                    "recipeFolder"
                )
                ?.value ||
            currentBook.folders[0],

        ingredients:
            document
                .getElementById(
                    "recipeIngredients"
                )
                ?.value
                .split("\n")
                .map(x => x.trim())
                .filter(Boolean) || [],

        instructions:
            document
                .getElementById(
                    "recipeInstructions"
                )
                ?.value
                .split("\n")
                .map(x => x.trim())
                .filter(Boolean) || [],

        notes:
            document
                .getElementById(
                    "recipeNotes"
                )
                ?.value
                .trim() || "",

        pages:
            pendingRecipe?.pages || 1
    };

    const index =
        currentBook.recipes.findIndex(
            item =>
                item.id === recipe.id
        );

    if (index === -1) {
        currentBook.recipes.push(recipe);
    } else {
        currentBook.recipes[index] =
            recipe;
    }

    saveCurrentBook();

    document
        .getElementById(
            "editorModal"
        )
        ?.classList.add("hidden");

    pendingRecipe = null;
    editingRecipeId = null;

    renderBook();
}


/* =========================================================
   SAVE BOOK
   ========================================================= */

function saveCurrentBook() {

    const index =
        data.books.findIndex(
            book =>
                book.id ===
                currentBook.id
        );

    if (index === -1) {
        data.books.push(currentBook);
    } else {
        data.books[index] =
            currentBook;
    }

    saveData();
}


/* =========================================================
   OPEN RECIPE
   ========================================================= */

function openRecipe(recipe) {

    viewedRecipe = recipe;

    renderRecipePage(recipe);
}


/* =========================================================
   BEAUTIFUL RECIPE PAGE
   ========================================================= */

function renderRecipePage(recipe) {

    let viewer =
        document.getElementById(
            "recipeViewer"
        );

    if (!viewer) {

        viewer =
            document.createElement(
                "div"
            );

        viewer.id =
            "recipeViewer";

        viewer.className =
            "recipe-viewer";

        document.body.appendChild(
            viewer
        );
    }

    viewer.classList.remove("hidden");

    const servings =
        Number(recipe.servings) || 4;

    viewer.innerHTML = `

        <div class="recipe-page">

            <button
                type="button"
                class="recipe-back"
                id="closeRecipeViewer"
            >
                ← Back
            </button>


            <article class="recipe-paper">


                <!-- HEADER -->

                <header class="recipe-title-area">

                    <div class="recipe-small-label">
                        MEALMIND RECIPE
                    </div>

                    <h1 class="recipe-title">
                        ${escapeHTML(
                            recipe.title ||
                            "Untitled Recipe"
                        )}
                    </h1>

                    ${
                        recipe.cuisine
                            ? `
                                <div class="recipe-cuisine">
                                    ${escapeHTML(
                                        recipe.cuisine
                                    )}
                                </div>
                              `
                            : ""
                    }

                    <div class="recipe-meta">

                        <div>
                            <span>🍽️</span>
                            <strong>
                                <span id="recipeServingNumber">
                                    ${servings}
                                </span>
                            </strong>
                            servings
                        </div>

                        <div class="serving-controls">

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

                    </div>

                </header>


                <div class="recipe-divider"></div>


                <!-- INGREDIENTS -->

                <section class="recipe-content-section">

                    <h2>
                        Ingredients
                    </h2>

                    <ul
                        class="beautiful-ingredients"
                        id="recipeIngredientList"
                    ></ul>

                </section>


                <!-- METHOD -->

                <section class="recipe-content-section">

                    <h2>
                        Method
                    </h2>

                    <ol
                        class="beautiful-instructions"
                        id="recipeInstructionList"
                    ></ol>

                </section>


                ${
                    recipe.notes
                        ? `
                            <section class="recipe-notes">

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


    renderRecipeIngredients(
        recipe,
        servings
    );


    const instructions =
        document.getElementById(
            "recipeInstructionList"
        );

    if (instructions) {

        (recipe.instructions || [])
            .forEach(step => {

                const li =
                    document.createElement(
                        "li"
                    );

                li.textContent =
                    step;

                instructions.appendChild(
                    li
                );
            });
    }


    document
        .getElementById(
            "closeRecipeViewer"
        )
        ?.addEventListener(
            "click",
            () => {

                viewer.classList.add(
                    "hidden"
                );

                viewedRecipe = null;
            }
        );


    document
        .getElementById(
            "recipeServingMinus"
        )
        ?.addEventListener(
            "click",
            () => {

                const number =
                    Number(
                        document
                            .getElementById(
                                "recipeServingNumber"
                            )
                            ?.textContent
                    ) || servings;

                const newNumber =
                    Math.max(
                        1,
                        number - 1
                    );

                updateRecipeServingDisplay(
                    recipe,
                    newNumber
                );
            }
        );


    document
        .getElementById(
            "recipeServingPlus"
        )
        ?.addEventListener(
            "click",
            () => {

                const number =
                    Number(
                        document
                            .getElementById(
                                "recipeServingNumber"
                            )
                            ?.textContent
                    ) || servings;

                updateRecipeServingDisplay(
                    recipe,
                    number + 1
                );
            }
        );
}


/* =========================================================
   RECIPE INGREDIENT DISPLAY
   ========================================================= */

function renderRecipeIngredients(
    recipe,
    targetServings
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
        targetServings / original;

    (recipe.ingredients || [])
        .forEach(ingredient => {

            const li =
                document.createElement(
                    "li"
                );

            li.textContent =
                calculateIngredient(
                    ingredient,
                    multiplier
                );

            list.appendChild(li);
        });
}


/* =========================================================
   SERVING CALCULATOR
   ========================================================= */

function updateRecipeServingDisplay(
    recipe,
    servings
) {

    const number =
        document.getElementById(
            "recipeServingNumber"
        );

    if (number) {
        number.textContent =
            servings;
    }

    renderRecipeIngredients(
        recipe,
        servings
    );
}


/* =========================================================
   INGREDIENT CALCULATOR
   ========================================================= */

const FRACTIONS = {

    "½": 0.5,
    "⅓": 1 / 3,
    "⅔": 2 / 3,
    "¼": 0.25,
    "¾": 0.75,
    "⅕": 0.2,
    "⅖": 0.4,
    "⅗": 0.6,
    "⅘": 0.8,
    "⅙": 1 / 6,
    "⅚": 5 / 6,
    "⅛": 0.125,
    "⅜": 0.375,
    "⅝": 0.625,
    "⅞": 0.875
};


function parseFraction(value) {

    value = value.trim();

    if (
        FRACTIONS[value] !== undefined
    ) {
        return FRACTIONS[value];
    }

    const mixed =
        value.match(
            /^(\d+)\s+(\d+)\/(\d+)$/
        );

    if (mixed) {

        return (
            Number(mixed[1]) +
            Number(mixed[2]) /
            Number(mixed[3])
        );
    }

    const fraction =
        value.match(
            /^(\d+)\/(\d+)$/
        );

    if (fraction) {

        return (
            Number(fraction[1]) /
            Number(fraction[2])
        );
    }

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : null;
}


function formatAmount(value) {

    if (!Number.isFinite(value)) {
        return "";
    }

    const commonFractions = [

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
        Math.floor(value);

    const decimal =
        value - whole;

    for (
        const [number, symbol]
        of commonFractions
    ) {

        if (
            Math.abs(
                decimal - number
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
            value -
            Math.round(value)
        ) < 0.01
    ) {
        return String(
            Math.round(value)
        );
    }

    return String(
        Math.round(value * 100) / 100
    );
}


function calculateIngredient(
    ingredient,
    multiplier
) {

    if (
        !Number.isFinite(multiplier) ||
        multiplier === 1
    ) {
        return ingredient;
    }

    /*
     * Mixed number with Unicode fraction.
     * Example:
     * 1 ½ cups
     */

    const unicodeMixed =
        ingredient.match(
            /^(\d+)\s+(½|⅓|⅔|¼|¾|⅕|⅖|⅗|⅘|⅙|⅚|⅛|⅜|⅝|⅞)\b/
        );

    if (unicodeMixed) {

        const amount =
            Number(unicodeMixed[1]) +
            FRACTIONS[unicodeMixed[2]];

        return (
            formatAmount(
                amount * multiplier
            ) +
            ingredient.slice(
                unicodeMixed[0].length
            )
        );
    }

    /*
     * Unicode fraction.
     * Example:
     * ½ cup
     */

    const unicode =
        ingredient.match(
            /^(½|⅓|⅔|¼|¾|⅕|⅖|⅗|⅘|⅙|⅚|⅛|⅜|⅝|⅞)\b/
        );

    if (unicode) {

        const amount =
            FRACTIONS[unicode[1]];

        return (
            formatAmount(
                amount * multiplier
            ) +
            ingredient.slice(
                unicode[0].length
            )
        );
    }

    /*
     * Normal numbers and fractions.
     */

    const match =
        ingredient.match(
            /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\b/
        );

    if (!match) {
        return ingredient;
    }

    const amount =
        parseFraction(match[1]);

    if (amount === null) {
        return ingredient;
    }

    return (
        formatAmount(
            amount * multiplier
        ) +
        ingredient.slice(
            match[0].length
        )
    );
}


/* =========================================================
   START
   ========================================================= */

hideAllScreens();

document
    .getElementById("homeScreen")
    ?.classList.remove("hidden");

console.log(
    "🍽️ MealMind recipe format loaded."
);
```
