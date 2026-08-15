

/* =========================================================
   MEALMIND
   Complete JavaScript
========================================================= */


/* =========================================================
   DATA
========================================================= */

let currentBook = null;
let currentRecipe = null;
let currentFolder = "";
let currentScanFiles = [];
let selectedPageCount = 0;


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "mealmind_books";


function getBooks() {

    try {

        return JSON.parse(
            localStorage.getItem(
                STORAGE_KEY
            )
        ) || [];

    } catch (error) {

        return [];

    }

}


function saveBooks(books) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(books)
    );

}


function saveData() {

    saveBooks(
        getBooks()
    );

}


/* =========================================================
   IDs
========================================================= */

function makeID() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}


/* =========================================================
   SCREEN SYSTEM
========================================================= */

function showScreen(id) {

    document
        .querySelectorAll(".screen")
        .forEach(function(screen) {

            screen.classList.add("hidden");

        });


    const screen =
        document.getElementById(id);


    if (screen) {

        screen.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   HOME
========================================================= */

function goHome() {

    currentBook = null;
    currentRecipe = null;

    showScreen(
        "homeScreen"
    );

}


function setupHomeButtons() {

    document.addEventListener(
        "click",
        function(event) {

            const actionElement =
                event.target.closest(
                    "[data-action]"
                );


            if (!actionElement) {
                return;
            }


            const action =
                actionElement.dataset.action;


            if (
                action ===
                "home"
            ) {

                goHome();

            }


            if (
                action ===
                "make-cookbook"
            ) {

                showScreen(
                    "makeScreen"
                );

            }


            if (
                action ===
                "join-cookbook"
            ) {

                showScreen(
                    "joinScreen"
                );

            }


            if (
                action ===
                "public-books"
            ) {

                renderPublicCookbooks();

                showScreen(
                    "publicScreen"
                );

            }


            if (
                action ===
                "create-cookbook"
            ) {

                createCookbook();

            }


            if (
                action ===
                "join"
            ) {

                joinCookbook();

            }


            if (
                action ===
                "exit-book"
            ) {

                currentBook = null;

                showScreen(
                    "homeScreen"
                );

            }


            if (
                action ===
                "scan"
            ) {

                openPageCountModal();

            }


            if (
                action ===
                "cancel-scan"
            ) {

                showScreen(
                    "mainScreen"
                );

            }


            if (
                action ===
                "start-scan"
            ) {

                startScan();

            }


            if (
                action ===
                "add-folder"
            ) {

                createFolder();

            }

        }
    );

}


/* =========================================================
   CREATE COOKBOOK
========================================================= */

function createCookbook() {

    const nameInput =
        document.getElementById(
            "cookbookName"
        );


    const passwordInput =
        document.getElementById(
            "cookbookPassword"
        );


    const privacyInput =
        document.getElementById(
            "cookbookPrivacy"
        );


    if (!nameInput) {
        return;
    }


    const name =
        nameInput.value.trim();


    const password =
        passwordInput
            ? passwordInput.value
            : "";


    if (!name) {

        alert(
            "Please enter a cookbook name."
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


    const books =
        getBooks();


    const book = {

        id: makeID(),

        name: name,

        password: password,

        privacy:
            privacyInput
                ? privacyInput.value
                : "private",

        folders: [],

        recipes: []

    };


    books.push(book);

    saveBooks(books);


    openCookbook(
        book
    );

}


/* =========================================================
   JOIN COOKBOOK
========================================================= */

function joinCookbook() {

    const nameInput =
        document.getElementById(
            "joinName"
        );


    const passwordInput =
        document.getElementById(
            "joinPassword"
        );


    const name =
        nameInput
            ? nameInput.value.trim()
            : "";


    const password =
        passwordInput
            ? passwordInput.value
            : "";


    if (!name || !password) {

        alert(
            "Enter the cookbook name and code."
        );

        return;

    }


    const books =
        getBooks();


    const book =
        books.find(function(item) {

            return (
                item.name.toLowerCase() ===
                name.toLowerCase() &&
                item.password ===
                password
            );

        });


    if (!book) {

        alert(
            "Cookbook not found or the code is incorrect."
        );

        return;

    }


    openCookbook(
        book
    );

}


/* =========================================================
   OPEN COOKBOOK
========================================================= */

function openCookbook(book) {

    currentBook = book;


    normalizeBook(
        currentBook
    );


    const title =
        document.getElementById(
            "mainBookName"
        );


    if (title) {

        title.textContent =
            currentBook.name;

    }


    currentFolder = "";

    renderFolders();

    renderRecipes();


    showScreen(
        "mainScreen"
    );

}


/* =========================================================
   NORMALIZE BOOK
========================================================= */

function normalizeBook(book) {

    if (!book) {
        return;
    }


    if (
        !Array.isArray(
            book.folders
        )
    ) {

        book.folders = [];

    }


    if (
        !Array.isArray(
            book.recipes
        )
    ) {

        book.recipes = [];

    }

}


/* =========================================================
   PUBLIC COOKBOOKS
========================================================= */

function renderPublicCookbooks() {

    const container =
        document.getElementById(
            "publicBooksList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const publicBooks =
        getBooks().filter(function(book) {

            return book.privacy === "public";

        });


    if (
        publicBooks.length === 0
    ) {

        container.innerHTML =
            "<p>No public cookbooks yet.</p>";

        return;

    }


    publicBooks.forEach(function(book) {

        const button =
            document.createElement(
                "button"
            );


        button.className =
            "main-button";


        button.textContent =
            "📖 " + book.name;


        button.addEventListener(
            "click",
            function() {

                openCookbook(
                    book
                );

            }
        );


        container.appendChild(
            button
        );

    });

}


/* =========================================================
   FOLDERS
========================================================= */

function createFolder() {

    if (!currentBook) {
        return;
    }


    const name =
        prompt(
            "What would you like to name the folder?"
        );


    if (!name) {
        return;
    }


    const cleaned =
        cleanFolderName(
            name
        );


    if (!cleaned) {

        alert(
            "Please enter a valid folder name."
        );

        return;

    }


    normalizeBook(
        currentBook
    );


    currentBook.folders.push({

        id: makeID(),

        name: cleaned

    });


    saveData();


    renderFolders();

}


function cleanFolderName(name) {

    return String(name)

        .replace(
            /[^a-zA-Z0-9\s.'\/_-]/g,
            ""
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


function renderFolders() {

    const container =
        document.getElementById(
            "folders"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!currentBook) {
        return;
    }


    normalizeBook(
        currentBook
    );


    currentBook.folders.forEach(
        function(folder) {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "folder-button";


            button.textContent =
                "📁 " +
                folder.name;


            button.addEventListener(
                "click",
                function() {

                    currentFolder =
                        folder.id;

                    renderRecipes();

                }
            );


            container.appendChild(
                button
            );

        }
    );

}


/* =========================================================
   RECIPE FOLDER PICKER
========================================================= */

function populateRecipeFolderPicker() {

    const select =
        document.getElementById(
            "recipeFolder"
        );


    if (!select) {
        return;
    }


    select.innerHTML = "";


    const firstOption =
        document.createElement(
            "option"
        );


    firstOption.value = "";

    firstOption.textContent =
        "Choose a folder...";


    select.appendChild(
        firstOption
    );


    if (!currentBook) {
        return;
    }


    normalizeBook(
        currentBook
    );


    currentBook.folders.forEach(
        function(folder) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                folder.id;


            option.textContent =
                "📁 " +
                folder.name;


            select.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   RECIPE LIST
========================================================= */

function renderRecipes() {

    const container =
        document.getElementById(
            "recipes"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!currentBook) {
        return;
    }


    normalizeBook(
        currentBook
    );


    let recipes =
        currentBook.recipes;


    if (currentFolder) {

        recipes =
            recipes.filter(
                function(recipe) {

                    return (
                        recipe.folderId ===
                        currentFolder
                    );

                }
            );

    }


    if (
        recipes.length === 0
    ) {

        container.innerHTML =
            "<p>No recipes here yet.</p>";

        return;

    }


    recipes.forEach(
        function(recipe) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "recipe-card";


            const title =
                recipe.title ||
                "Untitled Recipe";


            card.textContent =
                "🍴 " + title;


            card.addEventListener(
                "click",
                function() {

                    openRecipe(
                        recipe
                    );

                }
            );


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   PAGE COUNT
========================================================= */

function openPageCountModal() {

    const modal =
        document.getElementById(
            "pageCountModal"
        );


    if (!modal) {

        /*
         * If the HTML popup wasn't added,
         * create a simple one.
         */

        createPageCountModal();

        return;

    }


    modal.classList.add(
        "show"
    );

}


function closePageCountModal() {

    const modal =
        document.getElementById(
            "pageCountModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


function selectPageCount(count) {

    selectedPageCount =
        Number(count);


    closePageCountModal();


    showScreen(
        "scannerScreen"
    );


    const status =
        document.getElementById(
            "selectedPages"
        );


    if (status) {

        status.textContent =
            selectedPageCount === 1
                ? "Choose 1 recipe page."
                : `Choose ${selectedPageCount} recipe pages.`;

    }


    const input =
        document.getElementById(
            "scannerInput"
        );


    if (input) {

        input.value = "";

    }

}


function createPageCountModal() {

    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "pageCountModal";


    modal.className =
        "modal show";


    modal.innerHTML = `

        <div class="page-count-box">

            <h2>
                How many would you like to scan?
            </h2>

            <p>
                Choose 1 to 5 recipe pages.
            </p>

            <div class="page-count-options">

                <button onclick="selectPageCount(1)">
                    1
                </button>

                <button onclick="selectPageCount(2)">
                    2
                </button>

                <button onclick="selectPageCount(3)">
                    3
                </button>

                <button onclick="selectPageCount(4)">
                    4
                </button>

                <button onclick="selectPageCount(5)">
                    5
                </button>

            </div>

            <button onclick="closePageCountModal()">
                Cancel
            </button>

        </div>
    `;


    document.body.appendChild(
        modal
    );

}


/* =========================================================
   SCANNER FILE SELECTION
========================================================= */

function setupScanner() {

    const input =
        document.getElementById(
            "scannerInput"
        );


    if (!input) {
        return;
    }


    input.addEventListener(
        "change",
        function() {

            const files =
                Array.from(
                    input.files || []
                );


            if (
                selectedPageCount === 0
            ) {

                return;

            }


            if (
                files.length !==
                selectedPageCount
            ) {

                alert(
                    selectedPageCount === 1
                        ? "Please select exactly 1 page."
                        : `Please select exactly ${selectedPageCount} pages.`
                );


                input.value = "";

                return;

            }


            currentScanFiles =
                files;


            const status =
                document.getElementById(
                    "selectedPages"
                );


            if (status) {

                status.textContent =
                    files.length === 1
                        ? "1 page selected."
                        : `${files.length} pages selected.`;

            }

        }
    );

}


/* =========================================================
   START SCAN
========================================================= */

async function startScan() {

    const input =
        document.getElementById(
            "scannerInput"
        );


    if (!input) {
        return;
    }


    const files =
        Array.from(
            input.files || []
        );


    if (
        files.length !==
        selectedPageCount
    ) {

        alert(
            selectedPageCount === 1
                ? "Please select exactly 1 page."
                : `Please select exactly ${selectedPageCount} pages.`
        );

        return;

    }


    currentScanFiles =
        files;


    showScannerStatus(
        "Reading recipe pages..."
    );


    try {

        const results = [];


        for (
            let i = 0;
            i < files.length;
            i++
        ) {

            updateScannerProgress(
                `Reading page ${i + 1} of ${files.length}...`
            );


            const text =
                await runOCR(
                    files[i]
                );


            results.push(
                text
            );

        }


        const combinedText =
            results.join(
                "\n"
            );


        updateScannerProgress(
            "Organizing ingredients and instructions..."
        );


        const recipe =
            parseRecipe(
                combinedText
            );


        hideScannerStatus();


        openRecipeEditor(
            recipe
        );

    } catch (error) {

        console.error(
            error
        );


        hideScannerStatus();


        alert(
            "MealMind couldn't read the recipe. Please try again."
        );

    }

}


/* =========================================================
   OCR
========================================================= */

async function runOCR(file) {

    if (
        typeof Tesseract ===
        "undefined"
    ) {

        throw new Error(
            "Tesseract is not loaded."
        );

    }


    const result =
        await Tesseract.recognize(
            file,
            "eng",
            {

                logger:
                    function(message) {

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


                            updateScannerProgress(
                                `Reading page... ${percent}%`
                            );

                        }

                    }

            }
        );


    return result.data.text || "";

}


/* =========================================================
   OCR TEXT CLEANING
========================================================= */

function cleanRecipeText(text) {

    if (!text) {
        return "";
    }


    return String(text)

        .replace(
            /�/g,
            ""
        )

        .replace(
            /[^a-zA-Z0-9\s.'\/,\-:()]/g,
            ""
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


/* =========================================================
   TITLE CLEANING
========================================================= */

function cleanRecipeTitle(title) {

    if (!title) {
        return "";
    }


    return String(title)

        .replace(
            /�/g,
            ""
        )

        /*
         * TITLE ONLY:
         *
         * letters
         * numbers
         * spaces
         * /
         * .
         * '
         */

        .replace(
            /[^a-zA-Z0-9\s.'\/]/g,
            ""
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


/* =========================================================
   CLEAN LIST
========================================================= */

function cleanRecipeList(items) {

    if (
        !Array.isArray(
            items
        )
    ) {

        return [];

    }


    return items

        .map(
            function(item) {

                return cleanRecipeText(
                    item
                );

            }
        )

        .filter(
            function(item) {

                return item.length > 0;

            }
        );

}


/* =========================================================
   PARSE RECIPE
========================================================= */

function parseRecipe(text) {

    const cleaned =
        String(text || "")
            .replace(/\r/g, "");


    const lines =
        cleaned
            .split("\n")
            .map(
                function(line) {

                    return cleanRecipeText(
                        line
                    );

                }
            )
            .filter(
                function(line) {

                    return line.length > 0;

                }
            );


    let title = "";


    /*
     * Do NOT automatically use
     * "Scanned Recipe".
     *
     * Only use the first line if it
     * looks like a reasonable title.
     */

    if (
        lines.length > 0
    ) {

        const possibleTitle =
            cleanRecipeTitle(
                lines[0]
            );


        if (
            possibleTitle.length >= 2 &&
            possibleTitle.length <= 80
        ) {

            title =
                possibleTitle;

        }

    }


    const ingredients = [];

    const instructions = [];


    let mode =
        "ingredients";


    lines.forEach(
        function(line, index) {

            const lower =
                line.toLowerCase();


            if (
                lower.includes(
                    "ingredient"
                )
            ) {

                mode =
                    "ingredients";

                return;

            }


            if (
                lower.includes(
                    "instruction"
                ) ||
                lower.includes(
                    "directions"
                ) ||
                lower.includes(
                    "method"
                )
            ) {

                mode =
                    "instructions";

                return;

            }


            if (
                index === 0 &&
                title
            ) {

                return;

            }


            if (
                mode ===
                "ingredients"
            ) {

                ingredients.push(
                    line
                );

            } else {

                instructions.push(
                    line
                );

            }

        }
    );


    return {

        title:
            cleanRecipeTitle(
                title
            ),

        cuisine: "",

        servings: "",

        ingredients:
            cleanRecipeList(
                ingredients
            ),

        instructions:
            cleanRecipeList(
                instructions
            ),

        notes: ""

    };

}


/* =========================================================
   RECIPE EDITOR
========================================================= */

function openRecipeEditor(recipe) {

    currentRecipe =
        recipe;


    /*
     * Make sure the title is clean.
     */

    currentRecipe.title =
        cleanRecipeTitle(
            currentRecipe.title
        );


    currentRecipe.ingredients =
        cleanRecipeList(
            currentRecipe.ingredients
        );


    currentRecipe.instructions =
        cleanRecipeList(
            currentRecipe.instructions
        );


    /*
     * Use the existing editor if your HTML
     * already contains it.
     */

    const modal =
        document.getElementById(
            "editorModal"
        );


    if (!modal) {

        createRecipeEditor();

        return;

    }


    fillRecipeEditor();

}


/* =========================================================
   CREATE EDITOR IF NEEDED
========================================================= */

function createRecipeEditor() {

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

        modal.className =
            "overlay";

        document.body.appendChild(
            modal
        );

    }


    modal.innerHTML = `

        <div class="editor-box">

            <h2>
                Edit & Save Recipe
            </h2>

            <label>
                Recipe Title
            </label>

            <input
                id="recipeTitle"
                type="text"
                placeholder="Enter recipe title"
            >

            <label>
                Ingredients
            </label>

            <textarea
                id="recipeIngredients"
                rows="8"
            ></textarea>

            <label>
                Instructions
            </label>

            <textarea
                id="recipeInstructions"
                rows="8"
            ></textarea>

            <label>
                📁 Save to folder
            </label>

            <select id="recipeFolder">
                <option value="">
                    Choose a folder...
                </option>
            </select>

            <button
                onclick="saveEditedRecipe()"
            >
                Save Recipe
            </button>

            <button
                onclick="closeRecipeEditor()"
            >
                Cancel
            </button>

        </div>
    `;


    fillRecipeEditor();


    modal.classList.remove(
        "hidden"
    );

}


/* =========================================================
   FILL EDITOR
========================================================= */

function fillRecipeEditor() {

    const titleInput =
        document.getElementById(
            "recipeTitle"
        );


    const ingredientsInput =
        document.getElementById(
            "recipeIngredients"
        );


    const instructionsInput =
        document.getElementById(
            "recipeInstructions"
        );


    if (titleInput) {

        /*
         * If OCR couldn't find a valid title,
         * leave it completely blank.
         */

        titleInput.value =
            cleanRecipeTitle(
                currentRecipe.title
            );

    }


    if (ingredientsInput) {

        ingredientsInput.value =
            currentRecipe.ingredients
                .join("\n");

    }


    if (instructionsInput) {

        instructionsInput.value =
            currentRecipe.instructions
                .join("\n");

    }


    populateRecipeFolderPicker();


    const modal =
        document.getElementById(
            "editorModal"
        );


    if (modal) {

        modal.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   TITLE VALIDATION
========================================================= */

function isValidRecipeTitle(title) {

    if (!title) {
        return false;
    }


    const cleaned =
        title.trim();


    if (!cleaned) {
        return false;
    }


    /*
     * Only:
     *
     * letters
     * numbers
     * spaces
     * /
     * .
     * '
     */

    return /^[a-zA-Z0-9\s.'\/]+$/.test(
        cleaned
    );

}


/* =========================================================
   SAVE EDITED RECIPE
========================================================= */

function saveEditedRecipe() {

    if (!currentBook) {
        return;
    }


    const titleInput =
        document.getElementById(
            "recipeTitle"
        );


    const ingredientsInput =
        document.getElementById(
            "recipeIngredients"
        );


    const instructionsInput =
        document.getElementById(
            "recipeInstructions"
        );


    const folderInput =
        document.getElementById(
            "recipeFolder"
        );


    const title =
        titleInput
            ? titleInput.value.trim()
            : "";


    /*
     * TITLE IS REQUIRED.
     */

    if (!title) {

        alert(
            "Please enter a recipe title before saving."
        );


        if (titleInput) {

            titleInput.focus();

        }


        return;

    }


    /*
     * TITLE MUST BE CLEAN.
     */

    if (
        !isValidRecipeTitle(
            title
        )
    ) {

        alert(
            "The title can only contain letters, numbers, spaces, /, . and '."
        );


        if (titleInput) {

            titleInput.focus();

        }


        return;

    }


    const ingredients =
        ingredientsInput
            ? ingredientsInput.value
                .split("\n")
                .map(
                    cleanRecipeText
                )
                .filter(Boolean)
            : [];


    const instructions =
        instructionsInput
            ? instructionsInput.value
                .split("\n")
                .map(
                    cleanRecipeText
                )
                .filter(Boolean)
            : [];


    const folderId =
        folderInput
            ? folderInput.value
            : "";


    const recipe = {

        id:
            currentRecipe &&
            currentRecipe.id
                ? currentRecipe.id
                : makeID(),

        title:
            cleanRecipeTitle(
                title
            ),

        cuisine:
            currentRecipe &&
            currentRecipe.cuisine
                ? cleanRecipeText(
                    currentRecipe.cuisine
                )
                : "",

        servings:
            currentRecipe &&
            currentRecipe.servings
                ? currentRecipe.servings
                : "",

        ingredients:
            cleanRecipeList(
                ingredients
            ),

        instructions:
            cleanRecipeList(
                instructions
            ),

        notes:
            currentRecipe &&
            currentRecipe.notes
                ? cleanRecipeText(
                    currentRecipe.notes
                )
                : "",

        folderId:
            folderId,

        pages:
            currentScanFiles.length

    };


    const existingIndex =
        currentBook.recipes.findIndex(
            function(item) {

                return (
                    currentRecipe &&
                    item.id ===
                    currentRecipe.id
                );

            }
        );


    if (
        existingIndex >= 0
    ) {

        currentBook.recipes[
            existingIndex
        ] = recipe;

    } else {

        currentBook.recipes.push(
            recipe
        );

    }


    currentRecipe =
        recipe;


    saveBooks(
        getBooks().map(
            function(book) {

                return (
                    book.id ===
                    currentBook.id
                )
                    ? currentBook
                    : book;

            }
        )
    );


    closeRecipeEditor();


    renderFolders();

    renderRecipes();


    alert(
        "Recipe saved!"
    );

}


/* =========================================================
   CLOSE EDITOR
========================================================= */

function closeRecipeEditor() {

    const modal =
        document.getElementById(
            "editorModal"
        );


    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }


    currentRecipe =
        null;

}


/* =========================================================
   OPEN SAVED RECIPE
========================================================= */

function openRecipe(recipe) {

    currentRecipe =
        recipe;


    const viewer =
        document.getElementById(
            "recipeViewer"
        );


    if (!viewer) {

        return;

    }


    viewer.innerHTML = `

        <div class="recipe-view-box">

            <h2>
                ${escapeHTML(
                    recipe.title ||
                    "Untitled Recipe"
                )}
            </h2>

            <h3>
                Ingredients
            </h3>

            <ul>

                ${(
                    recipe.ingredients ||
                    []
                )
                .map(
                    function(item) {

                        return `
                            <li>
                                ${escapeHTML(item)}
                            </li>
                        `;

                    }
                )
                .join("")}

            </ul>

            <h3>
                Instructions
            </h3>

            <ol>

                ${(
                    recipe.instructions ||
                    []
                )
                .map(
                    function(item) {

                        return `
                            <li>
                                ${escapeHTML(item)}
                            </li>
                        `;

                    }
                )
                .join("")}

            </ol>

            <button
                onclick="closeRecipeViewer()"
            >
                Close
            </button>

        </div>
    `;


    viewer.classList.remove(
        "hidden"
    );

}


function closeRecipeViewer() {

    const viewer =
        document.getElementById(
            "recipeViewer"
        );


    if (viewer) {

        viewer.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    return String(
        value || ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   SCANNER STATUS
========================================================= */

function showScannerStatus(message) {

    const status =
        document.getElementById(
            "scannerStatus"
        );


    if (!status) {
        return;
    }


    status.classList.remove(
        "hidden"
    );


    const progress =
        document.getElementById(
            "scannerProgress"
        );


    if (progress) {

        progress.textContent =
            message;

    }

}


function updateScannerProgress(message) {

    const progress =
        document.getElementById(
            "scannerProgress"
        );


    if (progress) {

        progress.textContent =
            message;

    }

}


function hideScannerStatus() {

    const status =
        document.getElementById(
            "scannerStatus"
        );


    if (status) {

        status.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   PASSWORD SHOW/HIDE
========================================================= */

function setupPasswordToggles() {

    const createPassword =
        document.getElementById(
            "showCreatePassword"
        );


    const createInput =
        document.getElementById(
            "cookbookPassword"
        );


    if (
        createPassword &&
        createInput
    ) {

        createPassword.addEventListener(
            "change",
            function() {

                createInput.type =
                    this.checked
                        ? "text"
                        : "password";

            }
        );

    }


    const joinPassword =
        document.getElementById(
            "showJoinPassword"
        );


    const joinInput =
        document.getElementById(
            "joinPassword"
        );


    if (
        joinPassword &&
        joinInput
    ) {

        joinPassword.addEventListener(
            "change",
            function() {

                joinInput.type =
                    this.checked
                        ? "text"
                        : "password";

            }
        );

    }

}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

    const input =
        document.getElementById(
            "searchInput"
        );


    if (!input) {
        return;
    }


    input.addEventListener(
        "input",
        function() {

            const query =
                this.value
                    .trim()
                    .toLowerCase();


            const cards =
                document.querySelectorAll(
                    ".recipe-card"
                );


            cards.forEach(
                function(card) {

                    const text =
                        card.textContent
                            .toLowerCase();


                    card.style.display =
                        !query ||
                        text.includes(query)
                            ? ""
                            : "none";

                }
            );

        }
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

function initializeMealMind() {

    setupHomeButtons();

    setupScanner();

    setupPasswordToggles();

    setupSearch();


    showScreen(
        "homeScreen"
    );

}


document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializeMealMind();

    }
);

