
"use strict";

/* =========================================================
   MEALMIND
   Scanner + Recipes + Folders + Editing
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

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (saved) {

            const data =
                JSON.parse(saved);

            if (
                data &&
                Array.isArray(data.books)
            ) {
                return data;
            }
        }

    } catch (error) {

        console.error(
            "MealMind storage error:",
            error
        );
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
   SCREENS
   ========================================================= */

function hideScreens() {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.add(
                "hidden"
            );
        });
}


function showScreen(id) {

    hideScreens();

    const screen =
        document.getElementById(id);

    if (screen) {

        screen.classList.remove(
            "hidden"
        );
    }
}


function goHome() {

    closeRecipe();

    currentBook = null;
    currentFolder = null;

    showScreen(
        "homeScreen"
    );
}


/* =========================================================
   BUTTONS
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest("button");

        if (!button) return;


        const action =
            button.dataset.action;


        /* HOME */

        if (
            action ===
            "make-cookbook"
        ) {

            showScreen(
                "makeScreen"
            );

            return;
        }


        if (
            action ===
            "join-cookbook"
        ) {

            showScreen(
                "joinScreen"
            );

            return;
        }


        if (
            action ===
            "public-books"
        ) {

            showScreen(
                "publicScreen"
            );

            renderPublicBooks();

            return;
        }


        /* HOME / BACK */

        if (
            action === "home"
        ) {

            goHome();

            return;
        }


        /* CREATE BOOK */

        if (
            action ===
            "create-cookbook"
        ) {

            createCookbook();

            return;
        }


        /* JOIN */

        if (
            action === "join"
        ) {

            joinCookbook();

            return;
        }


        /* EXIT */

        if (
            action === "exit-book"
        ) {

            goHome();

            return;
        }


        /* SCANNER */

        if (
            action === "scan"
        ) {

            document
                .getElementById(
                    "cameraInput"
                )
                ?.click();

            return;
        }


        /* ADD FOLDER */

        if (
            action === "add-folder"
        ) {

            addFolder();

            return;
        }


        /* EDIT FOLDER */

        if (
            action === "edit-folder"
        ) {

            editFolder(
                button.dataset.folder
            );

            return;
        }


        /* DELETE FOLDER */

        if (
            action === "delete-folder"
        ) {

            deleteFolder(
                button.dataset.folder
            );

            return;
        }


        /* EDIT RECIPE */

        if (
            action === "edit-recipe"
        ) {

            editCurrentRecipe();

            return;
        }


        /* DELETE RECIPE */

        if (
            action === "delete-recipe"
        ) {

            deleteRecipe();

            return;
        }


        /* CLOSE RECIPE */

        if (
            action ===
            "close-recipe"
        ) {

            closeRecipe();

            return;
        }


        /* SERVINGS */

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


        /* SAVE EDIT */

        if (
            action ===
            "save-recipe"
        ) {

            saveEditedRecipe();

            return;
        }


        /* CANCEL EDIT */

        if (
            action ===
            "cancel-edit"
        ) {

            closeEditor();

            return;
        }


        /* FOLDER CARD */

        if (
            button.dataset.folder
        ) {

            currentFolder =
                button.dataset.folder;

            renderFolders();
            renderRecipes();

            return;
        }


        /* RECIPE CARD */

        if (
            button.dataset.recipeId
        ) {

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

    }
);


/* =========================================================
   CREATE COOKBOOK
   ========================================================= */

function createCookbook() {

    const name =
        document
            .getElementById(
                "cookbookName"
            )
            ?.value
            .trim();

    const password =
        document
            .getElementById(
                "cookbookPassword"
            )
            ?.value || "";


    if (!name) {

        alert(
            "Enter a cookbook name."
        );

        return;
    }


    if (
        password.length < 4
    ) {

        alert(
            "Your cookbook code must be at least 4 characters."
        );

        return;
    }


    currentBook = {

        id: makeID(),

        name,

        password,

        privacy: "private",

        folders: [
            "Recipes"
        ],

        recipes: []

    };


    mealMind.books.push(
        currentBook
    );

    saveData();

    openBook();
}


/* =========================================================
   JOIN COOKBOOK
   ========================================================= */

function joinCookbook() {

    const name =
        document
            .getElementById(
                "joinName"
            )
            ?.value
            .trim();

    const password =
        document
            .getElementById(
                "joinPassword"
            )
            ?.value || "";


    const book =
        mealMind.books.find(
            item =>
                item.name
                    .toLowerCase() ===
                name.toLowerCase()
        );


    if (!book) {

        alert(
            "Cookbook not found."
        );

        return;
    }


    if (
        book.password !==
        password
    ) {

        alert(
            "Wrong cookbook code."
        );

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


    showScreen(
        "mainScreen"
    );


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
        document.getElementById(
            "folders"
        );

    if (!container) return;


    container.innerHTML = "";


    (
        currentBook?.folders ||
        []
    ).forEach(folder => {

        const count =
            currentBook.recipes.filter(
                recipe =>
                    recipe.folder ===
                    folder
            ).length;


        const wrapper =
            document.createElement(
                "div"
            );

        wrapper.style.display =
            "flex";

        wrapper.style.gap =
            "6px";

        wrapper.style.alignItems =
            "stretch";


        const button =
            document.createElement(
                "button"
            );

        button.type = "button";

        button.className =
            "folder-card";

        button.dataset.folder =
            folder;

        button.style.flex = "1";


        button.innerHTML = `

            <span class="folder-icon">
                📁
            </span>

            <strong>
                ${escapeHTML(folder)}
            </strong>

            <small>
                ${count}
                ${count === 1
                    ? "recipe"
                    : "recipes"}
            </small>

        `;


        const edit =
            document.createElement(
                "button"
            );

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
            document.createElement(
                "button"
            );

        remove.type = "button";

        remove.className =
            "recipe-action-button danger";

        remove.dataset.action =
            "delete-folder";

        remove.dataset.folder =
            folder;

        remove.textContent =
            "🗑️";


        wrapper.appendChild(
            button
        );

        wrapper.appendChild(
            edit
        );

        wrapper.appendChild(
            remove
        );


        container.appendChild(
            wrapper
        );

    });
}


/* =========================================================
   ADD FOLDER
   ========================================================= */

function addFolder() {

    if (!currentBook) return;


    const name =
        prompt(
            "Enter a folder name:"
        );


    if (
        !name ||
        !name.trim()
    ) {
        return;
    }


    const folder =
        name.trim();


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


    currentBook.folders.push(
        folder
    );


    saveData();

    renderFolders();
}


/* =========================================================
   EDIT FOLDER
   ========================================================= */

function editFolder(
    oldName
) {

    if (!currentBook) return;


    const newName =
        prompt(
            "Rename folder:",
            oldName
        );


    if (
        !newName ||
        !newName.trim()
    ) {
        return;
    }


    const name =
        newName.trim();


    if (
        name === oldName
    ) {
        return;
    }


    if (
        currentBook.folders.some(
            folder =>
                folder.toLowerCase() ===
                name.toLowerCase()
        )
    ) {

        alert(
            "A folder with that name already exists."
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

            if (
                recipe.folder ===
                oldName
            ) {

                recipe.folder =
                    name;
            }
        }
    );


    if (
        currentFolder ===
        oldName
    ) {

        currentFolder =
            name;
    }


    saveData();

    renderFolders();
    renderRecipes();
}


/* =========================================================
   DELETE FOLDER
   ========================================================= */

function deleteFolder(
    folder
) {

    if (!currentBook) return;


    if (
        currentBook.folders.length <=
        1
    ) {

        alert(
            "You need to keep at least one folder."
        );

        return;
    }


    const recipeCount =
        currentBook.recipes.filter(
            recipe =>
                recipe.folder ===
                folder
        ).length;


    const message =
        recipeCount > 0
            ? `Delete "${folder}"? Its ${recipeCount} recipe(s) will be moved to "Recipes".`
            : `Delete "${folder}"?`;


    if (
        !confirm(message)
    ) {
        return;
    }


    if (
        !currentBook.folders.includes(
            "Recipes"
        )
    ) {

        currentBook.folders.unshift(
            "Recipes"
        );
    }


    currentBook.recipes.forEach(
        recipe => {

            if (
                recipe.folder ===
                folder
            ) {

                recipe.folder =
                    "Recipes";
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
        document.getElementById(
            "recipes"
        );

    if (!container) return;


    container.innerHTML = "";


    let recipes =
        currentBook?.recipes ||
        [];


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
            .getElementById(
                "searchInput"
            )
            ?.value
            .trim()
            .toLowerCase();


    if (search) {

        recipes =
            recipes.filter(
                recipe =>
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

                <div>
                    🍽️
                </div>

                <h3>
                    No recipes yet
                </h3>

                <p>
                    Scan a recipe to add it
                    to your cookbook.
                </p>

            </div>

        `;

        return;
    }


    recipes.forEach(
        recipe => {

            const button =
                document.createElement(
                    "button"
                );

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
                            recipe.cuisine ||
                            "Recipe"
                        )}
                    </span>

                </div>

                <span class="recipe-arrow">
                    ›
                </span>

            `;


            container.appendChild(
                button
            );

        }
    );
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

function openRecipe(
    recipe
) {

    currentRecipe =
        recipe;


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

        document.body.appendChild(
            viewer
        );
    }


    viewer.className =
        "recipe-viewer";


    const servings =
        Number(
            recipe.servings
        ) || 4;


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
                            ✏️ Edit
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

                    Made by Narayan Xavier Gill

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


    if (
        !confirm(
            `Delete "${currentRecipe.title || "this recipe"}"?`
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

    if (!currentRecipe) return;


    let modal =
        document.getElementById(
            "editorModal"
        );


    if (!modal) {

        modal =
            document.createElement(
                "div"
            );

        modal.id =
            "editorModal";

        document.body.appendChild(
            modal
        );
    }


    modal.className = "";


    modal.innerHTML = `

        <div>

            <h2>
                Edit Recipe
            </h2>


            <label>
                Title
            </label>

            <input
                id="editRecipeTitle"
                value="${escapeHTML(
                    currentRecipe.title || ""
                )}"
            >


            <br><br>


            <label>
                Cuisine
            </label>

            <input
                id="editRecipeCuisine"
                value="${escapeHTML(
                    currentRecipe.cuisine || ""
                )}"
            >


            <br><br>


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


            <br><br>


            <label>
                Ingredients
            </label>

            <textarea
                id="editRecipeIngredients"
            >${escapeHTML(
                (
                    currentRecipe.ingredients ||
                    []
                ).join("\n")
            )}</textarea>


            <br><br>


            <label>
                Instructions
            </label>

            <textarea
                id="editRecipeInstructions"
            >${escapeHTML(
                (
                    currentRecipe.instructions ||
                    []
                ).join("\n")
            )}</textarea>


            <br><br>


            <label>
                Notes
            </label>

            <textarea
                id="editRecipeNotes"
            >${escapeHTML(
                currentRecipe.notes ||
                ""
            )}</textarea>


            <br><br>


            <button
                type="button"
                class="main-button"
                data-action="save-recipe"
            >
                Save Recipe
            </button>


            <button
                type="button"
                class="main-button"
                data-action="cancel-edit"
            >
                Cancel
            </button>

        </div>

    `;
}


/* =========================================================
   SAVE EDITED RECIPE
   ========================================================= */

function saveEditedRecipe() {

    if (!currentRecipe) return;


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


    const ingredients =
        document
            .getElementById(
                "editRecipeIngredients"
            )
            ?.value
            .split("\n")
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
            .split("\n")
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

    openRecipe(
        currentRecipe
    );
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

        modal.classList.add(
            "hidden"
        );
    }
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
        Number(
            recipe.servings
        ) || 4;


    const multiplier =
        servings / original;


    (
        recipe.ingredients ||
        []
    ).forEach(
        ingredient => {

            const li =
                document.createElement(
                    "li"
                );


            li.textContent =
                scaleIngredient(
                    ingredient,
                    multiplier
                );


            list.appendChild(
                li
            );
        }
    );
}


/* =========================================================
   INSTRUCTIONS
   ========================================================= */

function renderInstructions(
    recipe
) {

    const list =
        document.getElementById(
            "recipeInstructionList"
        );


    if (!list) return;


    list.innerHTML = "";


    (
        recipe.instructions ||
        []
    ).forEach(
        instruction => {

            const li =
                document.createElement(
                    "li"
                );


            li.textContent =
                instruction;


            list.appendChild(
                li
            );
        }
    );
}


/* =========================================================
   SERVING CALCULATOR
   ========================================================= */

function changeServings(
    amount
) {

    if (!currentRecipe) return;


    const display =
        document.getElementById(
            "recipeServingNumber"
        );


    if (!display) return;


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
   INGREDIENT CALCULATOR
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


function getNumber(
    value
) {

    if (
        fractions[value] !==
        undefined
    ) {

        return fractions[value];
    }


    if (
        value.includes("/")
    ) {

        const parts =
            value.split("/");


        if (
            parts.length === 2
        ) {

            const a =
                Number(parts[0]);

            const b =
                Number(parts[1]);


            if (
                b !== 0 &&
                Number.isFinite(a) &&
                Number.isFinite(b)
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


function formatAmount(
    number
) {

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


    for (
        const [value, symbol]
        of common
    ) {

        if (
            Math.abs(
                decimal - value
            ) < 0.03
        ) {

            if (
                whole === 0
            ) {

                return symbol;
            }


            return (
                `${whole} ${symbol}`
            );
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


function scaleIngredient(
    ingredient,
    multiplier
) {

    if (
        multiplier === 1
    ) {

        return ingredient;
    }


    const match =
        ingredient.match(
            /^(\d+(?:\.\d+)?|\d+\/\d+|½|⅓|⅔|¼|¾|⅛|⅜|⅝|⅞)\b/
        );


    if (!match) {

        return ingredient;
    }


    const amount =
        getNumber(
            match[1]
        );


    if (
        amount === null
    ) {

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
   SCANNER
   ========================================================= */

/*
   The scanner uses Tesseract.js.
   It runs OCR locally in the browser.
*/

async function scanRecipeImage(
    file
) {

    if (!currentBook) {

        alert(
            "Open your cookbook first."
        );

        return;
    }


    showScannerStatus(
        "Reading recipe..."
    );


    try {

        await loadOCR();


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
            result.data.text;


        const recipe =
            parseRecipeText(
                text
            );


        recipe.id =
            makeID();


        recipe.folder =
            currentFolder ||
            "Recipes";


        recipe.pages = 1;


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


        renderFolders();
        renderRecipes();


        openRecipe(
            recipe
        );


    } catch (error) {

        console.error(
            "Scanner error:",
            error
        );


        hideScannerStatus();


        alert(
            "I couldn't read that recipe image. Try a clearer photo with the whole recipe visible."
        );
    }
}


/* =========================================================
   LOAD OCR
   ========================================================= */

let ocrLoading = null;


function loadOCR() {

    if (
        window.Tesseract
    ) {

        return Promise.resolve();
    }


    if (ocrLoading) {

        return ocrLoading;
    }


    ocrLoading =
        new Promise(
            (
                resolve,
                reject
            ) => {

                const script =
                    document.createElement(
                        "script"
                    );


                script.src =
                    "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";


                script.onload =
                    () => resolve();


                script.onerror =
                    () =>
                        reject(
                            new Error(
                                "Could not load OCR."
                            )
                        );


                document.head.appendChild(
                    script
                );

            }
        );


    return ocrLoading;
}


/* =========================================================
   RECIPE TEXT PARSER
   ========================================================= */

function parseRecipeText(
    rawText
) {

    const lines =
        rawText
            .split(/\r?\n/)
            .map(line =>
                line
                    .replace(/\s+/g, " ")
                    .trim()
            )
            .filter(Boolean);


    let title =
        "";


    let cuisine =
        "";


    let ingredients = [];


    let instructions = [];


    let section =
        "unknown";


    const ingredientWords = [
        "ingredients",
        "ingredient",
        "what you need"
    ];


    const instructionWords = [
        "instructions",
        "directions",
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

        const line =
            lines[i];


        const lower =
            line.toLowerCase();


        if (
            ingredientWords.some(
                word =>
                    lower === word
            )
        ) {

            section =
                "ingredients";

            continue;
        }


        if (
            instructionWords.some(
                word =>
                    lower === word
            )
        ) {

            section =
                "instructions";

            continue;
        }


        if (
            !title &&
            i < 5 &&
            line.length >= 3 &&
            line.length <= 80 &&
            !looksLikeIngredient(line) &&
            !looksLikeInstruction(line)
        ) {

            title =
                cleanOCRLine(
                    line
                );

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
                    cleanOCRLine(
                        line
                    )
                );
            }

            continue;
        }


        if (
            section ===
            "instructions"
        ) {

            instructions.push(
                cleanInstruction(
                    line
                )
            );

            continue;
        }
    }


    /*
     * If the scan didn't have clear headings,
     * try to intelligently split the page.
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


    if (!title) {

        title =
            "Scanned Recipe";
    }


    return {

        title,

        cuisine,

        servings: 4,

        ingredients,

        instructions,

        notes: ""

    };
}


/* =========================================================
   OCR CLEANUP
   ========================================================= */

function cleanOCRLine(
    line
) {

    return line
        .replace(/^[•●▪◦*-]\s*/, "")
        .replace(/^\d+[.)]\s*/, "")
        .replace(/\s{2,}/g, " ")
        .trim();
}


function cleanInstruction(
    line
) {

    return line
        .replace(/^\d+[.)]\s*/, "")
        .replace(/^[•●▪◦*-]\s*/, "")
        .trim();
}


function looksLikeIngredient(
    line
) {

    return /(\d+\s*(cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|oz|ounce|ounces|lb|pound|pounds|g|kg|ml|l)\b)/i
        .test(line);
}


function looksLikeInstruction(
    line
) {

    return /^(add|mix|stir|bake|cook|heat|combine|place|pour|remove|serve|chop|slice|preheat|whisk|fold|boil|simmer|let|allow|season|transfer)\b/i
        .test(line);
}


/* =========================================================
   FALLBACK SCANNER SPLIT
   ========================================================= */

function fallbackRecipeSplit(
    lines
) {

    const ingredients = [];
    const instructions = [];


    let likelyInstructions =
        false;


    lines.forEach(
        line => {

            if (
                looksLikeInstruction(
                    line
                )
            ) {

                likelyInstructions =
                    true;
            }


            if (
                likelyInstructions
            ) {

                instructions.push(
                    cleanInstruction(
                        line
                    )
                );

            } else {

                if (
                    looksLikeIngredient(
                        line
                    )
                ) {

                    ingredients.push(
                        cleanOCRLine(
                            line
                        )
                    );
                }
            }

        }
    );


    /*
     * If there aren't enough ingredient
     * matches, use the middle of the
     * recipe as a fallback.
     */

    if (
        ingredients.length < 2 &&
        lines.length > 5
    ) {

        const middle =
            Math.ceil(
                lines.length * 0.55
            );


        return {

            ingredients:
                lines
                    .slice(1, middle)
                    .map(
                        cleanOCRLine
                    ),

            instructions:
                lines
                    .slice(middle)
                    .map(
                        cleanInstruction
                    )

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
    text
) {

    let box =
        document.getElementById(
            "scannerStatus"
        );


    if (!box) {

        box =
            document.createElement(
                "div"
            );

        box.id =
            "scannerStatus";


        box.style.position =
            "fixed";

        box.style.left =
            "50%";

        box.style.top =
            "50%";

        box.style.transform =
            "translate(-50%, -50%)";

        box.style.zIndex =
            "20000";

        box.style.padding =
            "22px 28px";

        box.style.borderRadius =
            "20px";

        box.style.background =
            "#ffffff";

        box.style.boxShadow =
            "0 15px 50px rgba(0,0,0,.2)";

        box.style.fontWeight =
            "700";

        document.body.appendChild(
            box
        );
    }


    box.textContent =
        text;
}


function hideScannerStatus() {

    document
        .getElementById(
            "scannerStatus"
        )
        ?.remove();
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

                <div>
                    📚
                </div>

                <p>
                    No public cookbooks yet.
                </p>

            </div>

        `;

        return;
    }


    books.forEach(
        book => {

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

        }
    );
}

/* =========================================================
   CAMERA / SCANNER BUTTON CONNECTION
   ========================================================= */

document.addEventListener("change", event => {

    if (event.target.id !== "cameraInput") {
        return;
    }

    const file = event.target.files?.[0];

    if (!file) {
        return;
    }

    scanRecipeImage(file);

    // Allows the same photo to be selected again later
    event.target.value = "";
});


/* =========================================================
   MOBILE BUTTON TOUCH SUPPORT
   ========================================================= */

document.addEventListener("click", event => {

    const button = event.target.closest("button");

    if (!button) {
        return;
    }

    console.log(
        "MealMind button pressed:",
        button.dataset.action
    );

}, true);
/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        hideScreens();


        document
            .getElementById(
                "homeScreen"
            )
            ?.classList.remove(
                "hidden"
            );


        mealMind.books.forEach(
            book => {

                if (
                    !Array.isArray(
                        book.folders
                    )
                ) {

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


                if (
                    !Array.isArray(
                        book.recipes
                    )
                ) {

                    book.recipes = [];
                }


                book.recipes.forEach(
                    recipe => {

                        if (!recipe.id) {

                            recipe.id =
                                makeID();
                        }


                        if (
                            !recipe.folder
                        ) {

                            recipe.folder =
                                "Recipes";
                        }


                        if (
                            !Array.isArray(
                                recipe.ingredients
                            )
                        ) {

                            recipe.ingredients =
                                [];
                        }


                        if (
                            !Array.isArray(
                                recipe.instructions
                            )
                        ) {

                            recipe.instructions =
                                [];
                        }

                    }
                );

            }
        );


        saveData();

    }
);
```

