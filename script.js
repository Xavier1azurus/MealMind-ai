"use strict";

/* =========================================================
   MEALMIND
   ========================================================= */

const STORAGE_KEY = "mealmind_data_v3";

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

            if (parsed && Array.isArray(parsed.books)) {
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

    return Date.now().toString(36) +
        Math.random().toString(36).slice(2);
}


function esc(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   SCREENS
   ========================================================= */

function showScreen(screenID) {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {
            screen.classList.add("hidden");
        });

    document
        .getElementById(screenID)
        ?.classList.remove("hidden");
}


function home() {

    closeRecipe();

    currentBook = null;
    currentFolder = null;
    currentRecipe = null;

    showScreen("homeScreen");
}


/* =========================================================
   ALL BUTTONS
   ========================================================= */

document.addEventListener("click", function(event) {

    const button = event.target.closest("button");

    if (!button) return;

    const action = button.dataset.action;


    if (action === "home") {
        home();
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
        createBook();
        return;
    }


    if (action === "join") {
        joinBook();
        return;
    }


    if (action === "exit-book") {
        home();
        return;
    }


    if (action === "scan") {
        document.getElementById("cameraInput")?.click();
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


    if (action === "clear-folder") {

        currentFolder = null;

        renderFolders();
        renderRecipes();

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


    if (action === "minus") {
        changeServings(-1);
        return;
    }


    if (action === "plus") {
        changeServings(1);
        return;
    }


    if (button.dataset.folder !== undefined) {

        currentFolder = button.dataset.folder;

        renderFolders();
        renderRecipes();

        return;
    }


    if (button.dataset.recipeId) {

        const recipe =
            currentBook?.recipes.find(
                r => r.id === button.dataset.recipeId
            );

        if (recipe) {
            openRecipe(recipe);
        }

    }

});


/* =========================================================
   PASSWORD SHOW/HIDE
   ========================================================= */

document.addEventListener("change", event => {

    if (event.target.id === "showCreatePassword") {

        document.getElementById("cookbookPassword").type =
            event.target.checked ? "text" : "password";
    }


    if (event.target.id === "showJoinPassword") {

        document.getElementById("joinPassword").type =
            event.target.checked ? "text" : "password";
    }

});


/* =========================================================
   CREATE BOOK
   ========================================================= */

function createBook() {

    const name =
        document.getElementById("cookbookName")
            ?.value.trim();

    const password =
        document.getElementById("cookbookPassword")
            ?.value || "";

    const privacy =
        document.getElementById("cookbookPrivacy")
            ?.value || "private";


    if (!name) {
        alert("Enter a cookbook name.");
        return;
    }


    if (password.length < 4) {
        alert("Your code must be at least 4 characters.");
        return;
    }


    if (
        data.books.some(
            book =>
                book.name.toLowerCase() === name.toLowerCase()
        )
    ) {

        alert("A cookbook with that name already exists.");
        return;
    }


    currentBook = {

        id: id(),

        name: name,

        password: password,

        privacy: privacy,

        folders: ["Recipes"],

        recipes: []

    };


    data.books.push(currentBook);

    saveData();

    openBook();
}


/* =========================================================
   JOIN
   ========================================================= */

function joinBook() {

    const name =
        document.getElementById("joinName")
            ?.value.trim();

    const password =
        document.getElementById("joinPassword")
            ?.value || "";


    const book =
        data.books.find(
            b =>
                b.name.toLowerCase() ===
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

    currentFolder = null;

    document.getElementById("mainBookName").textContent =
        currentBook.name;

    showScreen("mainScreen");

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
                recipe => recipe.folder === folder
            ).length;


        const row =
            document.createElement("div");

        row.className = "folder-row";


        const folderButton =
            document.createElement("button");

        folderButton.type = "button";

        folderButton.className = "folder-card";

        folderButton.dataset.folder = folder;

        folderButton.innerHTML = `
            <span class="folder-icon">📁</span>

            <span>
                <strong>${esc(folder)}</strong>
                <small>${count} ${count === 1 ? "recipe" : "recipes"}</small>
            </span>
        `;


        const edit =
            document.createElement("button");

        edit.type = "button";
        edit.className = "icon-button";
        edit.dataset.action = "edit-folder";
        edit.dataset.folder = folder;
        edit.textContent = "✏️";


        const remove =
            document.createElement("button");

        remove.type = "button";
        remove.className = "icon-button";
        remove.dataset.action = "delete-folder";
        remove.dataset.folder = folder;
        remove.textContent = "🗑️";


        row.appendChild(folderButton);
        row.appendChild(edit);
        row.appendChild(remove);

        container.appendChild(row);

    });
}


/* =========================================================
   ADD FOLDER
   ========================================================= */

function addFolder() {

    if (!currentBook) return;

    const name =
        prompt("Folder name:");

    if (!name?.trim()) return;

    const folder = name.trim();


    if (
        currentBook.folders.some(
            f => f.toLowerCase() === folder.toLowerCase()
        )
    ) {

        alert("That folder already exists.");
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

    const newName =
        prompt("New folder name:", oldName);

    if (!newName?.trim()) return;

    const name = newName.trim();


    if (
        name !== oldName &&
        currentBook.folders.some(
            f => f.toLowerCase() === name.toLowerCase()
        )
    ) {

        alert("That folder already exists.");
        return;
    }


    const index =
        currentBook.folders.indexOf(oldName);


    if (index !== -1) {
        currentBook.folders[index] = name;
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


/* =========================================================
   DELETE FOLDER
   ========================================================= */

function deleteFolder(folder) {

    if (currentBook.folders.length <= 1) {
        alert("You need at least one folder.");
        return;
    }


    if (!confirm(`Delete "${folder}"?`)) {
        return;
    }


    currentBook.recipes.forEach(recipe => {

        if (recipe.folder === folder) {
            recipe.folder = "Recipes";
        }

    });


    currentBook.folders =
        currentBook.folders.filter(
            f => f !== folder
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


    let recipes = [...currentBook.recipes];


    if (currentFolder) {

        recipes =
            recipes.filter(
                recipe =>
                    recipe.folder === currentFolder
            );

    }


    const search =
        document.getElementById("searchInput")
            ?.value.trim().toLowerCase();


    if (search) {

        recipes =
            recipes.filter(recipe =>
                recipe.title
                    .toLowerCase()
                    .includes(search)
            );

    }


    if (!recipes.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div style="font-size:40px">🍽️</div>
                <h3>No recipes here</h3>
                <p>Scan a recipe to add it.</p>
            </div>
        `;

        return;
    }


    recipes.forEach(recipe => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className = "recipe-card";

        button.dataset.recipeId = recipe.id;


        button.innerHTML = `
            <div class="recipe-card-icon">🍴</div>

            <div class="recipe-card-text">

                <strong>
                    ${esc(recipe.title || "Untitled Recipe")}
                </strong>

                <span>
                    ${esc(recipe.folder || "Recipes")}
                    · ${recipe.pages || 1} page${recipe.pages === 1 ? "" : "s"}
                </span>

            </div>

            <span class="recipe-arrow">›</span>
        `;


        container.appendChild(button);

    });
}


/* SEARCH */

document.addEventListener("input", event => {

    if (event.target.id === "searchInput") {
        renderRecipes();
    }

});


/* =========================================================
   RECIPE VIEW
   ========================================================= */

function openRecipe(recipe) {

    currentRecipe = recipe;


    const viewer =
        document.createElement("div");

    viewer.id = "recipeViewer";

    viewer.className = "recipe-viewer";


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
                        ${esc(recipe.title || "Untitled Recipe")}
                    </h1>

                    ${
                        recipe.cuisine
                            ? `<p class="recipe-cuisine">
                                ${esc(recipe.cuisine)}
                               </p>`
                            : ""
                    }

                    <div class="recipe-serving-row">

                        <span>🍽️ Serves</span>

                        <button data-action="minus">−</button>

                        <strong id="servingNumber">
                            ${servings}
                        </strong>

                        <button data-action="plus">+</button>

                    </div>

                </header>


                <div class="recipe-line"></div>


                <section class="recipe-section">

                    <h2>Ingredients</h2>

                    <ul
                        id="ingredientList"
                        class="recipe-ingredients"
                    ></ul>

                </section>


                <section class="recipe-section">

                    <h2>Instructions</h2>

                    <ol
                        id="instructionList"
                        class="recipe-instructions"
                    ></ol>

                </section>


                ${
                    recipe.notes
                        ? `
                            <section class="recipe-section recipe-notes">
                                <h2>Notes</h2>
                                <p>${esc(recipe.notes)}</p>
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

    renderRecipeIngredients(servings);

    renderRecipeInstructions();
}


/* =========================================================
   CLOSE RECIPE
   ========================================================= */

function closeRecipe() {

    document.getElementById("recipeViewer")?.remove();

    currentRecipe = null;
}


/* =========================================================
   SERVINGS
   ========================================================= */

function changeServings(amount) {

    if (!currentRecipe) return;

    const display =
        document.getElementById("servingNumber");

    if (!display) return;


    let servings =
        Number(display.textContent) || 4;


    servings += amount;


    if (servings < 1) {
        servings = 1;
    }


    display.textContent = servings;

    renderRecipeIngredients(servings);
}


/* =========================================================
   INGREDIENT CALCULATOR
   ========================================================= */

const fractionValues = {
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


function parseAmount(value) {

    if (fractionValues[value] !== undefined) {
        return fractionValues[value];
    }


    if (value.includes("/")) {

        const parts = value.split("/");

        if (parts.length === 2) {

            const a = Number(parts[0]);
            const b = Number(parts[1]);

            if (b !== 0) {
                return a / b;
            }
        }
    }


    const n = Number(value);

    return Number.isFinite(n) ? n : null;
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


    const whole = Math.floor(number);
    const decimal = number - whole;


    for (const [value, symbol] of fractions) {

        if (Math.abs(decimal - value) < .025) {

            return whole
                ? `${whole} ${symbol}`
                : symbol;
        }
    }


    if (
        Math.abs(number - Math.round(number)) < .01
    ) {

        return String(Math.round(number));
    }


    return String(
        Math.round(number * 100) / 100
    );
}


function scaleIngredient(text, multiplier) {

    const match =
        text.match(
            /^(\d+(?:\.\d+)?|\d+\/\d+|½|⅓|⅔|¼|¾|⅛|⅜|⅝|⅞)(?=\s|$)/
        );


    if (!match) return text;


    const amount =
        parseAmount(match[1]);


    if (amount === null) return text;


    return (
        formatAmount(amount * multiplier) +
        text.slice(match[0].length)
    );
}


function renderRecipeIngredients(servings) {

    const list =
        document.getElementById("ingredientList");

    if (!list || !currentRecipe) return;


    list.innerHTML = "";


    const original =
        Number(currentRecipe.servings) || 4;


    const multiplier =
        servings / original;


    currentRecipe.ingredients.forEach(ingredient => {

        const li = document.createElement("li");

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

function renderRecipeInstructions() {

    const list =
        document.getElementById("instructionList");

    if (!list || !currentRecipe) return;


    list.innerHTML = "";


    currentRecipe.instructions.forEach(instruction => {

        const li = document.createElement("li");

        li.textContent = instruction;

        list.appendChild(li);

    });
}


/* =========================================================
   DELETE RECIPE
   ========================================================= */

function deleteRecipe() {

    if (!currentRecipe || !currentBook) return;


    if (
        !confirm(
            `Delete "${currentRecipe.title}"?`
        )
    ) {
        return;
    }


    currentBook.recipes =
        currentBook.recipes.filter(
            recipe =>
                recipe.id !== currentRecipe.id
        );


    saveData();

    closeRecipe();

    renderFolders();
    renderRecipes();
}


/* =========================================================
   EDIT RECIPE
   ========================================================= */

function editRecipe() {

    if (!currentRecipe) return;


    const modal =
        document.createElement("div");

    modal.id = "editorModal";


    modal.innerHTML = `

        <div class="editor-box">

            <h2>Edit Recipe</h2>

            <label>Recipe title</label>

            <input
                id="editTitle"
                value="${esc(currentRecipe.title)}"
            >


            <label>Cuisine</label>

            <input
                id="editCuisine"
                value="${esc(currentRecipe.cuisine)}"
            >


            <label>Pages</label>

            <select id="editPages">

                ${[1,2,3,4,5].map(page => `
                    <option
                        value="${page}"
                        ${Number(currentRecipe.pages) === page ? "selected" : ""}
                    >
                        ${page} page${page === 1 ? "" : "s"}
                    </option>
                `).join("")}

            </select>


            <label>Servings</label>

            <input
                id="editServings"
                type="number"
                min="1"
                value="${Number(currentRecipe.servings) || 4}"
            >


            <label>Ingredients</label>

            <textarea
                id="editIngredients"
            >${esc(currentRecipe.ingredients.join("\n"))}</textarea>


            <label>Instructions</label>

            <textarea
                id="editInstructions"
            >${esc(currentRecipe.instructions.join("\n"))}</textarea>


            <label>Notes</label>

            <textarea
                id="editNotes"
            >${esc(currentRecipe.notes || "")}</textarea>


            <div class="editor-buttons">

                <button
                    class="save-btn"
                    data-action="save-recipe"
                >
                    Save
                </button>

                <button
                    data-action="cancel-edit"
                >
                    Cancel
                </button>

            </div>

        </div>
    `;


    document.body.appendChild(modal);
}


function saveRecipeEdit() {

    if (!currentRecipe) return;


    currentRecipe.title =
        document.getElementById("editTitle")
            ?.value.trim() ||
        "Untitled Recipe";


    currentRecipe.cuisine =
        document.getElementById("editCuisine")
            ?.value.trim() || "";


    currentRecipe.pages =
        Number(
            document.getElementById("editPages")
                ?.value
        ) || 1;


    currentRecipe.servings =
        Number(
            document.getElementById("editServings")
                ?.value
        ) || 4;


    currentRecipe.ingredients =
        document.getElementById("editIngredients")
            ?.value
            .split("\n")
            .map(x => x.trim())
            .filter(Boolean) || [];


    currentRecipe.instructions =
        document.getElementById("editInstructions")
            ?.value
            .split("\n")
            .map(x => x.trim())
            .filter(Boolean) || [];


    currentRecipe.notes =
        document.getElementById("editNotes")
            ?.value.trim() || "";


    saveData();

    closeEditor();

    renderFolders();
    renderRecipes();

    openRecipe(currentRecipe);
}


function closeEditor() {

    document.getElementById("editorModal")?.remove();
}


/* =========================================================
   SCANNER
   ========================================================= */

document.addEventListener("change", async event => {

    if (event.target.id !== "cameraInput") {
        return;
    }


    const file = event.target.files?.[0];

    if (!file) return;


    await scanRecipe(file);


    /* Allows the SAME photo to be selected again. */
    event.target.value = "";

});


async function scanRecipe(file) {

    if (!currentBook) {

        alert("Open a cookbook first.");

        return;
    }


    showStatus("📷 Preparing scanner...");


    try {

        if (!window.Tesseract) {

            throw new Error(
                "Tesseract.js did not load."
            );
        }


        showStatus("🔎 Reading your recipe...");


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
                                    message.progress * 100
                                );

                            showStatus(
                                `🔎 Reading recipe... ${percent}%`
                            );
                        }

                    }
                }
            );


        const text =
            result.data.text;


        console.log("SCANNED TEXT:");
        console.log(text);


        if (!text.trim()) {

            throw new Error(
                "No text detected."
            );
        }


        showStatus("🍳 Creating recipe...");


        const recipe =
            parseRecipe(text);


        recipe.id = id();


        /*
         * AUTOMATIC FOLDER SORTING
         *
         * If the user has selected a folder,
         * the recipe goes there.
         *
         * Otherwise it goes into Recipes.
         */

        recipe.folder =
            currentFolder &&
            currentBook.folders.includes(currentFolder)
                ? currentFolder
                : "Recipes";


        currentBook.recipes.push(recipe);


        saveData();


        hideStatus();


        renderFolders();
        renderRecipes();


        openRecipe(recipe);


    } catch (error) {

        console.error(
            "SCANNER ERROR:",
            error
        );


        hideStatus();


        alert(
            "The scanner couldn't read that image. Try a clear photo showing the recipe text."
        );
    }

}


/* =========================================================
   RECIPE PARSER
   ========================================================= */

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
    let cuisine = "";
    let ingredients = [];
    let instructions = [];
    let notes = "";


    let section = "unknown";


    const ingredientHeader =
        /^(ingredients?|what you need|you will need)$/i;


    const instructionHeader =
        /^(instructions?|directions?|method|preparation|steps?|how to make)$/i;


    const notesHeader =
        /^(notes?|tips?)$/i;


    for (let i = 0; i < lines.length; i++) {

        const line = lines[i];


        if (ingredientHeader.test(line)) {

            section = "ingredients";
            continue;
        }


        if (instructionHeader.test(line)) {

            section = "instructions";
            continue;
        }


        if (notesHeader.test(line)) {

            section = "notes";
            continue;
        }


        /*
         * The first useful line becomes
         * the recipe title.
         */

        if (
            !title &&
            i < 6 &&
            line.length >= 3 &&
            line.length <= 100 &&
            !isIngredient(line) &&
            !isInstruction(line)
        ) {

            title = cleanTitle(line);
            continue;
        }


        if (section === "ingredients") {

            if (!isInstruction(line)) {

                ingredients.push(
                    cleanIngredient(line)
                );
            }

            continue;
        }


        if (section === "instructions") {

            instructions.push(
                cleanInstruction(line)
            );

            continue;
        }


        if (section === "notes") {

            notes +=
                (notes ? " " : "") +
                line;

        }

    }


    /*
     * If OCR didn't detect headings,
     * intelligently separate the recipe.
     */

    if (
        ingredients.length === 0 ||
        instructions.length === 0
    ) {

        const fallback =
            smartSplit(lines);


        if (!ingredients.length) {
            ingredients = fallback.ingredients;
        }


        if (!instructions.length) {
            instructions = fallback.instructions;
        }

    }


    /*
     * Remove obvious non-recipe junk.
     */

    ingredients =
        ingredients.filter(
            line =>
                !isJunk(line)
        );


    instructions =
        instructions.filter(
            line =>
                !isJunk(line)
        );


    /*
     * Never leave the title as a random
     * instruction/ingredient.
     */

    if (!title) {

        title = "Untitled Recipe";
    }


    /*
     * Detect servings.
     */

    let servings = 4;


    const servingLine =
        lines.find(
            line =>
                /serves?\s+\d+|\d+\s+servings?/i.test(line)
        );


    if (servingLine) {

        const match =
            servingLine.match(/\d+/);

        if (match) {
            servings = Number(match[0]);
        }

    }


    return {

        id: id(),

        title,

        cuisine,

        servings,

        pages: 1,

        ingredients,

        instructions,

        notes,

        folder: "Recipes"

    };

}


/* =========================================================
   SMART SCANNER SPLIT
   ========================================================= */

function smartSplit(lines) {

    const ingredients = [];
    const instructions = [];


    let instructionStarted = false;


    for (
        let i = 1;
        i < lines.length;
        i++
    ) {

        const line = lines[i];


        if (isInstruction(line)) {

            instructionStarted = true;
        }


        if (instructionStarted) {

            instructions.push(
                cleanInstruction(line)
            );

        } else if (
            isIngredient(line)
        ) {

            ingredients.push(
                cleanIngredient(line)
            );
        }

    }


    /*
     * If OCR didn't identify measurements,
     * use a reasonable page split.
     */

    if (
        ingredients.length < 2 &&
        instructions.length < 1 &&
        lines.length >= 6
    ) {

        const split =
            Math.ceil(lines.length * .55);


        return {

            ingredients:
                lines
                    .slice(1, split)
                    .map(cleanIngredient),

            instructions:
                lines
                    .slice(split)
                    .map(cleanInstruction)

        };

    }


    return {
        ingredients,
        instructions
    };

}


/* =========================================================
   SCANNER HELPERS
   ========================================================= */

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


function isIngredient(text) {

    return /\b\d+(?:\.\d+)?\s*(?:\/\s*\d+)?\s*(?:cups?|tbsp|tablespoons?|tsp|teaspoons?|oz|ounces?|lb|pounds?|g|grams?|kg|ml|liters?|l)\b/i
        .test(text);
}


function isInstruction(text) {

    return /^(add|mix|stir|bake|cook|heat|combine|place|pour|remove|serve|chop|slice|preheat|whisk|fold|boil|simmer|let|allow|season|transfer|pour|drain|cut|put|bring|cover|uncover|refrigerate|cool|sprinkle|spread|beat|blend|knead|roll|marinate|fry|roast|grill|broil)\b/i
        .test(text);
}


function isJunk(text) {

    return /^(page\s+\d+|\d+\s*\/\s*\d+|www\.|http|copyright)/i
        .test(text);

}


/* =========================================================
   STATUS
   ========================================================= */

function showStatus(text) {

    let box =
        document.getElementById("scannerStatus");


    if (!box) {

        box =
            document.createElement("div");

        box.id = "scannerStatus";


        Object.assign(box.style, {

            position: "fixed",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: "50000",
            background: "white",
            padding: "25px 30px",
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(0,0,0,.25)",
            fontWeight: "700",
            textAlign: "center",
            maxWidth: "85%"

        });


        document.body.appendChild(box);
    }


    box.textContent = text;
}


function hideStatus() {

    document.getElementById(
        "scannerStatus"
    )?.remove();

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
                <div style="font-size:40px">📚</div>
                <p>No public cookbooks yet.</p>
            </div>
        `;

        return;
    }


    books.forEach(book => {

        const button =
            document.createElement("button");

        button.className = "main-button";
        button.type = "button";

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
   INITIALIZE / MIGRATE
   ========================================================= */

function initialize() {

    data.books.forEach(book => {

        if (!Array.isArray(book.folders)) {
            book.folders = ["Recipes"];
        }


        if (!book.folders.includes("Recipes")) {
            book.folders.unshift("Recipes");
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


            if (!Array.isArray(recipe.ingredients)) {
                recipe.ingredients = [];
            }


            if (!Array.isArray(recipe.instructions)) {
                recipe.instructions = [];
            }


            if (!recipe.title) {
                recipe.title = "Untitled Recipe";
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

    showScreen("homeScreen");

}


document.addEventListener(
    "DOMContentLoaded",
    initialize
);

