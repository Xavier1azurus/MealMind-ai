"use strict";

/* =========================================================
   MEALMIND
   Complete mobile cookbook system
   ========================================================= */

const STORAGE_KEY = "mealmind_data_v4";

let data = loadData();

let currentBook = null;
let currentFolder = null;
let currentRecipe = null;
let currentScanFiles = [];


/* =========================================================
   STORAGE
   ========================================================= */

function loadData() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (saved) {

            const parsed =
                JSON.parse(saved);

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
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
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
   GLOBAL BUTTON SYSTEM
   ========================================================= */

document.addEventListener("click", event => {

    const button =
        event.target.closest("button");

    if (!button) return;

    const action =
        button.dataset.action;

    if (!action) return;


    switch (action) {

        case "home":
            goHome();
            break;


        case "make-cookbook":
            showScreen("makeScreen");
            break;


        case "join-cookbook":
            showScreen("joinScreen");
            break;


        case "public-books":
            renderPublicBooks();
            showScreen("publicScreen");
            break;


        case "create-cookbook":
            createCookbook();
            break;


        case "join":
            joinCookbook();
            break;


        case "exit-book":
            goHome();
            break;


        case "scan":
            startScanner();
            break;


        case "cancel-scan":
            showScreen("mainScreen");
            break;


        case "start-scan":
            processScan();
            break;


        case "add-folder":
            addFolder();
            break;


        case "edit-folder":
            editFolder(button.dataset.folder);
            break;


        case "delete-folder":
            deleteFolder(button.dataset.folder);
            break;


        case "edit-recipe":
            editRecipe();
            break;


        case "delete-recipe":
            deleteRecipe();
            break;


        case "close-recipe":
            closeRecipe();
            break;


        case "save-recipe":
            saveRecipe();
            break;


        case "cancel-edit":
            closeEditor();
            break;


        case "select-folder":
            selectFolder(button.dataset.folder);
            break;


        case "open-recipe":
            openRecipeByID(button.dataset.recipeId);
            break;

    }

});


/* =========================================================
   PASSWORD SHOW/HIDE
   ========================================================= */

document.addEventListener("change", event => {

    if (
        event.target.id ===
        "showCreatePassword"
    ) {

        const input =
            document.getElementById(
                "cookbookPassword"
            );

        input.type =
            event.target.checked
                ? "text"
                : "password";
    }


    if (
        event.target.id ===
        "showJoinPassword"
    ) {

        const input =
            document.getElementById(
                "joinPassword"
            );

        input.type =
            event.target.checked
                ? "text"
                : "password";
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

    const privacy =
        document
            .getElementById("cookbookPrivacy")
            ?.value || "private";


    if (!name) {

        alert("Enter a cookbook name.");
        return;

    }


    if (password.length < 4) {

        alert(
            "The cookbook code must be at least 4 characters."
        );

        return;

    }


    const duplicate =
        data.books.some(
            book =>
                book.name.toLowerCase() ===
                name.toLowerCase()
        );


    if (duplicate) {

        alert(
            "A cookbook with that name already exists."
        );

        return;

    }


    const book = {

        id: makeID(),

        name,

        password,

        privacy,

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

        alert("Incorrect cookbook code.");
        return;

    }


    currentBook = book;
    currentFolder = null;

    openBook();

}


/* =========================================================
   OPEN BOOK
   ========================================================= */

function openBook() {

    if (!currentBook) return;

    showScreen("mainScreen");

    document
        .getElementById("mainBookName")
        .textContent =
        currentBook.name;

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


        const row =
            document.createElement("div");

        row.className =
            "folder-row";


        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "folder-card";

        if (
            currentFolder === folder
        ) {

            button.classList.add("active");

        }

        button.dataset.action =
            "select-folder";

        button.dataset.folder =
            folder;


        button.innerHTML = `

            <span class="folder-icon">
                📁
            </span>

            <span class="folder-info">

                <span class="folder-name">
                    ${escapeHTML(folder)}
                </span>

                <span class="folder-count">
                    ${count}
                    ${count === 1
                        ? "recipe"
                        : "recipes"}
                </span>

            </span>

        `;


        const edit =
            document.createElement("button");

        edit.type = "button";

        edit.className =
            "folder-action";

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
            "folder-action delete";

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


function selectFolder(folder) {

    if (!currentBook) return;

    if (currentFolder === folder) {

        currentFolder = null;

    } else {

        currentFolder = folder;

    }

    renderFolders();
    renderRecipes();

}


/* =========================================================
   ADD FOLDER
   ========================================================= */

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
            item =>
                item.toLowerCase() ===
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


/* =========================================================
   EDIT FOLDER
   ========================================================= */

function editFolder(oldName) {

    if (
        !currentBook ||
        oldName === "Recipes"
    ) {

        if (oldName === "Recipes") {

            alert(
                "The main Recipes folder cannot be renamed."
            );

        }

        return;

    }


    const newName =
        prompt(
            "Rename folder:",
            oldName
        );


    if (!newName) return;


    const name =
        newName.trim();

    if (!name) return;


    const duplicate =
        currentBook.folders.some(
            folder =>
                folder !== oldName &&
                folder.toLowerCase() ===
                name.toLowerCase()
        );


    if (duplicate) {

        alert(
            "A folder with that name already exists."
        );

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


/* =========================================================
   DELETE FOLDER
   ========================================================= */

function deleteFolder(folder) {

    if (
        !currentBook ||
        folder === "Recipes"
    ) {

        return;

    }


    const count =
        currentBook.recipes.filter(
            recipe =>
                recipe.folder === folder
        ).length;


    const confirmed =
        confirm(
            count
                ? `Delete "${folder}"? Its ${count} recipe(s) will be moved to Recipes.`
                : `Delete "${folder}"?`
        );


    if (!confirmed) return;


    currentBook.recipes.forEach(recipe => {

        if (recipe.folder === folder) {

            recipe.folder =
                "Recipes";

        }

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
   RENDER RECIPES
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
                    [
                        recipe.title,
                        recipe.cuisine,
                        recipe.folder,
                        ...(recipe.ingredients || [])
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

                <strong>
                    No recipes here
                </strong>

                <p>
                    Scan a recipe to add one.
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

        button.dataset.action =
            "open-recipe";

        button.dataset.recipeId =
            recipe.id;


        button.innerHTML = `

            <div class="recipe-icon">
                🍴
            </div>

            <div class="recipe-info">

                <span class="recipe-title">
                    ${escapeHTML(
                        recipe.title ||
                        "Untitled Recipe"
                    )}
                </span>

                <span class="recipe-folder">
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

        currentFolder = null;

        renderFolders();
        renderRecipes();

    }

});


/* =========================================================
   OPEN RECIPE
   ========================================================= */

function openRecipeByID(id) {

    if (!currentBook) return;


    const recipe =
        currentBook.recipes.find(
            item =>
                item.id === id
        );


    if (!recipe) {

        alert("Recipe could not be found.");
        return;

    }


    openRecipe(recipe);

}


function openRecipe(recipe) {

    currentRecipe = recipe;


    const viewer =
        document.getElementById(
            "recipeViewer"
        );


    viewer.classList.remove("hidden");


    const servings =
        Number(recipe.servings) || 4;


    viewer.innerHTML = `

        <article class="recipe-sheet">

            <div class="recipe-topbar">

                <button
                    class="back-button"
                    data-action="close-recipe">
                    ← Back
                </button>

                <div class="recipe-actions">

                    <button
                        class="recipe-action"
                        data-action="edit-recipe">
                        ✏️
                    </button>

                    <button
                        class="recipe-action delete"
                        data-action="delete-recipe">
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
                                ${escapeHTML(
                                    recipe.cuisine
                                )}
                            </p>
                          `
                        : ""
                }


                <div class="recipe-serving-row">

                    <span>
                        Serves
                    </span>

                    <button
                        id="recipeServingMinus">
                        −
                    </button>

                    <strong id="recipeServingNumber">
                        ${servings}
                    </strong>

                    <button
                        id="recipeServingPlus">
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
                    class="recipe-ingredients">
                </ul>

            </section>


            <section class="recipe-section">

                <h2>
                    Instructions
                </h2>

                <ol
                    id="recipeInstructionList"
                    class="recipe-instructions">
                </ol>

            </section>


            ${
                recipe.notes
                    ? `
                        <section class="recipe-section">

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


            <div class="recipe-footer">
                MealMind
            </div>

        </article>

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

        viewer.classList.add("hidden");

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

    renderFolders();
    renderRecipes();

}


/* =========================================================
   EDIT RECIPE
   ========================================================= */

function editRecipe() {

    if (!currentRecipe) return;


    const modal =
        document.getElementById(
            "editorModal"
        );


    modal.classList.remove("hidden");


    modal.innerHTML = `

        <div class="editor-box">

            <h2>
                Edit Recipe
            </h2>


            <label>
                Recipe title
            </label>

            <input
                id="editTitle"
                class="text-input"
                value="${escapeHTML(
                    currentRecipe.title || ""
                )}">


            <label>
                Cuisine
            </label>

            <input
                id="editCuisine"
                class="text-input"
                value="${escapeHTML(
                    currentRecipe.cuisine || ""
                )}">


            <label>
                Servings
            </label>

            <input
                id="editServings"
                class="text-input"
                type="number"
                min="1"
                value="${
                    Number(
                        currentRecipe.servings
                    ) || 4
                }">


            <label>
                Folder
            </label>

            <select
                id="editFolder"
                class="text-input">

                ${
                    currentBook.folders
                        .map(folder => `

                            <option
                                value="${escapeHTML(folder)}"
                                ${
                                    currentRecipe.folder ===
                                    folder
                                        ? "selected"
                                        : ""
                                }>

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
                id="editIngredients"
                placeholder="One ingredient per line">${escapeHTML(
                    (currentRecipe.ingredients || [])
                        .join("\n")
                )}</textarea>


            <label>
                Instructions
            </label>

            <textarea
                id="editInstructions"
                placeholder="One step per line">${escapeHTML(
                    (currentRecipe.instructions || [])
                        .join("\n")
                )}</textarea>


            <label>
                Notes
            </label>

            <textarea
                id="editNotes">${escapeHTML(
                    currentRecipe.notes || ""
                )}</textarea>


            <div class="editor-buttons">

                <button
                    class="main-button"
                    data-action="save-recipe">
                    Save
                </button>

                <button
                    class="main-button"
                    data-action="cancel-edit">
                    Cancel
                </button>

            </div>

        </div>

    `;

}


/* =========================================================
   SAVE RECIPE
   ========================================================= */

function saveRecipe() {

    if (!currentRecipe) return;


    currentRecipe.title =
        document
            .getElementById("editTitle")
            ?.value
            .trim() ||
        "Untitled Recipe";


    currentRecipe.cuisine =
        document
            .getElementById("editCuisine")
            ?.value
            .trim() ||
        "";


    currentRecipe.servings =
        Number(
            document
                .getElementById("editServings")
                ?.value
        ) || 4;


    currentRecipe.folder =
        document
            .getElementById("editFolder")
            ?.value ||
        "Recipes";


    currentRecipe.ingredients =
        document
            .getElementById("editIngredients")
            ?.value
            .split("\n")
            .map(item => item.trim())
            .filter(Boolean) ||
        [];


    currentRecipe.instructions =
        document
            .getElementById("editInstructions")
            ?.value
            .split("\n")
            .map(item => item.trim())
            .filter(Boolean) ||
        [];


    currentRecipe.notes =
        document
            .getElementById("editNotes")
            ?.value
            .trim() ||
        "";


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
   SERVINGS
   ========================================================= */

document.addEventListener("click", event => {

    if (
        event.target.id ===
        "recipeServingMinus"
    ) {

        changeServings(-1);

    }


    if (
        event.target.id ===
        "recipeServingPlus"
    ) {

        changeServings(1);

    }

});


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


    (recipe.instructions || [])
        .forEach(instruction => {

            const li =
                document.createElement("li");

            li.textContent =
                instruction;

            list.appendChild(li);

        });

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

    if (
        fractionValues[value] !==
        undefined
    ) {

        return fractionValues[value];

    }


    if (value.includes("/")) {

        const parts =
            value.split("/");


        if (parts.length === 2) {

            const top =
                Number(parts[0]);

            const bottom =
                Number(parts[1]);


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
            ) < .03
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
        parseAmount(match[1]);


    if (amount === null) {

        return ingredient;

    }


    return (
        formatAmount(
            amount * multiplier
        ) +
        ingredient.substring(
            match[0].length
        )
    );

}


/* =========================================================
   SCANNER
   ========================================================= */

function startScanner() {

    if (!currentBook) {

        alert(
            "Open a cookbook first."
        );

        return;

    }


    showScreen("scannerScreen");


    const input =
        document.getElementById(
            "scannerInput"
        );


    input.value = "";

    currentScanFiles = [];

    document.getElementById(
        "selectedPages"
    ).textContent =
        "No pages selected.";

}


/* =========================================================
   SELECT SCANNER PAGES
   ========================================================= */

document.addEventListener("change", event => {

    if (
        event.target.id !==
        "scannerInput"
    ) {

        return;

    }


    const files =
        Array.from(
            event.target.files || []
        );


    if (!files.length) {

        currentScanFiles = [];

        document.getElementById(
            "selectedPages"
        ).textContent =
            "No pages selected.";

        return;

    }


    if (files.length > 5) {

        alert(
            "You can scan up to 5 pages."
        );

        currentScanFiles =
            files.slice(0, 5);

    } else {

        currentScanFiles =
            files;

    }


    document.getElementById(
        "selectedPages"
    ).textContent =
        `${currentScanFiles.length} page${
            currentScanFiles.length === 1
                ? ""
                : "s"
        } selected.`;

});


/* =========================================================
   PROCESS SCAN
   ========================================================= */

async function processScan() {

    if (!currentBook) {

        alert("Open a cookbook first.");
        return;

    }


    if (!currentScanFiles.length) {

        alert(
            "Select at least one recipe page first."
        );

        return;

    }


    showScannerStatus(
        "Starting scanner..."
    );


    try {

        await loadTesseract();


        let combinedText = "";


        for (
            let i = 0;
            i < currentScanFiles.length;
            i++
        ) {

            const file =
                currentScanFiles[i];


            updateScannerStatus(
                `Reading page ${i + 1} of ${currentScanFiles.length}...`
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

                                updateScannerStatus(
                                    `Reading page ${i + 1} of ${currentScanFiles.length}... ${percent}%`
                                );

                            }

                        }

                    }
                );


            combinedText +=
                "\n" +
                result.data.text;

        }


        updateScannerStatus(
            "Turning the scan into a recipe..."
        );


        const recipe =
            parseRecipe(
                combinedText
            );


        recipe.id =
            makeID();


        recipe.folder =
            currentFolder ||
            "Recipes";


        recipe.pages =
            currentScanFiles.length;


        currentBook.recipes.push(
            recipe
        );


        if (
            !currentBook.folders.includes(
                recipe.folder
            )
        ) {

            currentBook.folders.push(
                recipe.folder
            );

        }


        saveData();


        hideScannerStatus();

        showScreen("mainScreen");

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
            "The scanner could not read the image. Try a clearer photo with good lighting."
        );

    }

}


/* =========================================================
   TESSERACT
   ========================================================= */

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
                    document.createElement(
                        "script"
                    );


                script.src =
                    "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";


                script.onload =
                    resolve;


                script.onerror =
                    () =>
                        reject(
                            new Error(
                                "Tesseract failed to load."
                            )
                        );


                document.head.appendChild(
                    script
                );

            }
        );


    return tesseractPromise;

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
    let servings = 4;

    const ingredients = [];
    const instructions = [];


    let section = "none";


    const ingredientHeading =
        /^(ingredients?|what you need)$/i;


    const instructionHeading =
        /^(instructions?|directions?|method|preparation|steps|how to make)$/i;


    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        const line =
            cleanOCR(lines[i]);


        if (
            ingredientHeading.test(line)
        ) {

            section =
                "ingredients";

            continue;

        }


        if (
            instructionHeading.test(line)
        ) {

            section =
                "instructions";

            continue;

        }


        const servingMatch =
            line.match(
                /(?:serves|servings|makes)\s*:?\s*(\d+)/i
            );


        if (servingMatch) {

            servings =
                Number(
                    servingMatch[1]
                );

            continue;

        }


        if (
            !title &&
            i < 6 &&
            line.length >= 3 &&
            line.length < 100 &&
            !looksLikeIngredient(line) &&
            !looksLikeInstruction(line) &&
            !ingredientHeading.test(line) &&
            !instructionHeading.test(line)
        ) {

            title = line;
            continue;

        }


        if (
            section ===
            "ingredients"
        ) {

            if (
                !ingredientHeading.test(line) &&
                !instructionHeading.test(line)
            ) {

                ingredients.push(
                    cleanIngredient(line)
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

    }


    /*
       If headings weren't recognized,
       use a fallback split.
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

            ingredients.push(
                ...fallback.ingredients
            );

        }


        if (
            instructions.length === 0
        ) {

            instructions.push(
                ...fallback.instructions
            );

        }

    }


    /*
       If OCR only gave us a title,
       don't leave the recipe completely empty.
    */

    if (!title) {

        title =
            guessTitle(lines);

    }


    if (!ingredients.length) {

        ingredients.push(
            "See scanned recipe"
        );

    }


    if (!instructions.length) {

        instructions.push(
            "Follow the instructions shown on the scanned recipe."
        );

    }


    return {

        title:
            title || "Scanned Recipe",

        cuisine,

        servings,

        ingredients,

        instructions,

        notes: ""

    };

}


/* =========================================================
   OCR CLEANUP
   ========================================================= */

function cleanOCR(line) {

    return line
        .replace(/[|]/g, "I")
        .replace(/\s+/g, " ")
        .trim();

}


function cleanIngredient(line) {

    return line
        .replace(/^[•●▪◦*-]\s*/, "")
        .replace(/^\d+[.)]\s*/, "")
        .trim();

}


function cleanInstruction(line) {

    return line
        .replace(/^[•●▪◦*-]\s*/, "")
        .replace(/^\d+[.)]\s*/, "")
        .trim();

}


function looksLikeIngredient(line) {

    return /^(\d+|\d+\/\d+|½|⅓|⅔|¼|¾|⅛|⅜|⅝|⅞)\s*/.test(line) ||

        /\b(cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|oz|ounce|ounces|lb|lbs|pound|pounds|gram|grams|kg|ml|liter|liters|litre|litres)\b/i
            .test(line);

}


function looksLikeInstruction(line) {

    return /^(add|mix|stir|bake|cook|heat|combine|place|pour|remove|serve|chop|slice|preheat|whisk|fold|boil|simmer|let|allow|season|transfer|drain|cover|uncover|cool|refrigerate|marinate)\b/i
        .test(line);

}


function guessTitle(lines) {

    for (
        const line of lines.slice(0, 8)
    ) {

        if (
            line.length >= 3 &&
            line.length <= 100 &&
            !looksLikeIngredient(line) &&
            !looksLikeInstruction(line)
        ) {

            return line;

        }

    }


    return "Scanned Recipe";

}


/* =========================================================
   FALLBACK SPLIT
   ========================================================= */

function fallbackSplit(lines) {

    const ingredients = [];
    const instructions = [];


    let instructionStarted =
        false;


    for (
        const line of lines
    ) {

        if (
            looksLikeInstruction(line)
        ) {

            instructionStarted = true;

        }


        if (instructionStarted) {

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
       If OCR didn't give enough clues,
       divide the page around the middle.
    */

    if (
        ingredients.length < 2 &&
        instructions.length < 1 &&
        lines.length >= 6
    ) {

        const start =
            Math.min(1, lines.length - 1);


        const split =
            Math.floor(
                lines.length * .55
            );


        return {

            ingredients:
                lines
                    .slice(start, split)
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
   SCANNER STATUS
   ========================================================= */

function showScannerStatus(text) {

    const box =
        document.getElementById(
            "scannerStatus"
        );


    const progress =
        document.getElementById(
            "scannerProgress"
        );


    box.classList.remove("hidden");


    if (progress) {

        progress.textContent = text;

    }

}


function updateScannerStatus(text) {

    const progress =
        document.getElementById(
            "scannerProgress"
        );


    if (progress) {

        progress.textContent = text;

    }

}


function hideScannerStatus() {

    document
        .getElementById(
            "scannerStatus"
        )
        ?.classList.add("hidden");

}


/* =========================================================
   PUBLIC COOKBOOKS
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

        button.type = "button";

        button.className =
            "main-button";

        button.style.marginBottom =
            "12px";

        button.textContent =
            `📖 ${book.name}`;


        button.addEventListener(
            "click",
            () => {

                currentBook = book;
                currentFolder = null;

                openBook();

            }
        );


        container.appendChild(button);

    });

}


/* =========================================================
   FIX OLD DATA
   ========================================================= */

function repairData() {

    data.books.forEach(book => {

        if (
            !Array.isArray(book.folders)
        ) {

            book.folders = ["Recipes"];

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


        if (
            !Array.isArray(book.recipes)
        ) {

            book.recipes = [];

        }


        book.recipes.forEach(recipe => {

            if (!recipe.id) {

                recipe.id =
                    makeID();

            }


            if (!recipe.folder) {

                recipe.folder =
                    "Recipes";

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


            if (
                !recipe.servings
            ) {

                recipe.servings = 4;

            }

        });

    });


    saveData();

}


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        repairData();

        showScreen("homeScreen");

    }
);
