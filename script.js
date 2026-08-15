"use strict";

/* =========================================================
   MEALMIND
   COMPLETE SCRIPT
   Matches the current MealMind index.html
   ========================================================= */

const STORAGE_KEY = "mealmind_data";

let mealMind = loadData();

let currentBook = null;
let currentFolder = null;
let currentRecipe = null;

let currentScanFiles = [];
let tesseractPromise = null;


/* =========================================================
   STORAGE
   ========================================================= */

function loadData() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

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

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(mealMind)
        );

    } catch (error) {

        console.error(
            "Could not save MealMind:",
            error
        );
    }
}


function makeID() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .slice(2)
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
    currentScanFiles = [];

    showScreen("homeScreen");
}


function cancelScan() {

    currentScanFiles = [];

    const input =
        document.getElementById("scannerInput");

    if (input) {
        input.value = "";
    }

    const pages =
        document.getElementById("selectedPages");

    if (pages) {
        pages.textContent =
            "No pages selected.";
    }

    showScreen("mainScreen");
}


/* =========================================================
   ALL BUTTONS
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest("button");

        if (!button) {
            return;
        }

        const action =
            button.dataset.action;


        /* HOME */

        if (action === "home") {

            goHome();
            return;
        }


        /* MAKE COOKBOOK */

        if (action === "make-cookbook") {

            showScreen("makeScreen");
            return;
        }


        /* JOIN COOKBOOK */

        if (action === "join-cookbook") {

            showScreen("joinScreen");
            return;
        }


        /* PUBLIC COOKBOOKS */

        if (action === "public-books") {

            showScreen("publicScreen");
            renderPublicBooks();
            return;
        }


        /* CREATE */

        if (action === "create-cookbook") {

            createCookbook();
            return;
        }


        /* JOIN */

        if (action === "join") {

            joinCookbook();
            return;
        }


        /* EXIT BOOK */

        if (action === "exit-book") {

            goHome();
            return;
        }


        /* MAIN SCAN BUTTON */

        if (action === "scan") {

            openScanner();
            return;
        }


        /* CANCEL SCAN */

        if (action === "cancel-scan") {

            cancelScan();
            return;
        }


        /* START SCAN */

        if (action === "start-scan") {

            processScan();
            return;
        }


        /* ADD FOLDER */

        if (action === "add-folder") {

            addFolder();
            return;
        }


        /* EDIT FOLDER */

        if (action === "edit-folder") {

            editFolder(
                button.dataset.folder
            );

            return;
        }


        /* DELETE FOLDER */

        if (action === "delete-folder") {

            deleteFolder(
                button.dataset.folder
            );

            return;
        }


        /* EDIT RECIPE */

        if (action === "edit-recipe") {

            editCurrentRecipe();
            return;
        }


        /* DELETE RECIPE */

        if (action === "delete-recipe") {

            deleteRecipe();
            return;
        }


        /* CLOSE RECIPE */

        if (action === "close-recipe") {

            closeRecipe();
            return;
        }


        /* SAVE RECIPE */

        if (action === "save-recipe") {

            saveEditedRecipe();
            return;
        }


        /* CANCEL EDIT */

        if (action === "cancel-edit") {

            closeEditor();
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


        /* FOLDER */

        if (button.dataset.folder) {

            currentFolder =
                button.dataset.folder;

            renderFolders();
            renderRecipes();

            return;
        }


        /* RECIPE */

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

    }
);


/* =========================================================
   PASSWORD SHOW/HIDE
   ========================================================= */

document.addEventListener(
    "change",
    event => {

        if (
            event.target.id ===
            "showCreatePassword"
        ) {

            const input =
                document.getElementById(
                    "cookbookPassword"
                );

            if (input) {

                input.type =
                    event.target.checked
                        ? "text"
                        : "password";
            }
        }


        if (
            event.target.id ===
            "showJoinPassword"
        ) {

            const input =
                document.getElementById(
                    "joinPassword"
                );

            if (input) {

                input.type =
                    event.target.checked
                        ? "text"
                        : "password";
            }
        }

    }
);


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


    const name =
        nameInput?.value.trim() || "";

    const password =
        passwordInput?.value || "";

    const privacy =
        privacyInput?.value || "private";


    if (!name) {

        alert(
            "Enter a cookbook name."
        );

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

        privacy: privacy,

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
            .getElementById("joinName")
            ?.value
            .trim() || "";


    const password =
        document
            .getElementById("joinPassword")
            ?.value || "";


    if (!name) {

        alert(
            "Enter the cookbook name."
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

    normalizeBook(currentBook);

    saveData();

    openBook();
}


/* =========================================================
   BOOK NORMALIZATION
   ========================================================= */

function normalizeBook(book) {

    if (
        !Array.isArray(book.folders)
    ) {

        book.folders = [];

    }


    if (
        !book.folders.includes("Recipes")
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


    book.recipes.forEach(
        recipe => {

            if (!recipe.id) {
                recipe.id = makeID();
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

            if (
                !Number(recipe.servings)
            ) {

                recipe.servings = 4;

            }

        }
    );
}


/* =========================================================
   OPEN BOOK
   ========================================================= */

function openBook() {

    if (!currentBook) {
        return;
    }


    normalizeBook(currentBook);


    currentFolder = null;


    const title =
        document.getElementById(
            "mainBookName"
        );


    if (title) {

        title.textContent =
            currentBook.name;

    }


    showScreen("mainScreen");

    renderFolders();
    renderRecipes();
}


/* =========================================================
   SCANNER SCREEN
   ========================================================= */

function openScanner() {

    if (!currentBook) {

        alert(
            "Open a cookbook first."
        );

        return;
    }


    currentScanFiles = [];


    const input =
        document.getElementById(
            "scannerInput"
        );


    if (input) {
        input.value = "";
    }


    const selected =
        document.getElementById(
            "selectedPages"
        );


    if (selected) {

        selected.textContent =
            "No pages selected.";

    }


    showScreen("scannerScreen");
}


/* =========================================================
   MOBILE SCANNER FILE SELECTION
   ========================================================= */

document.addEventListener(
    "change",
    event => {

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


            const selected =
                document.getElementById(
                    "selectedPages"
                );


            if (selected) {

                selected.textContent =
                    "No pages selected.";

            }


            return;
        }


        currentScanFiles =
            files.slice(0, 5);


        const pageText =
            currentScanFiles.length === 1
                ? "1 page selected."
                : `${currentScanFiles.length} pages selected.`;


        const selected =
            document.getElementById(
                "selectedPages"
            );


        if (selected) {

            selected.textContent =
                pageText;

        }

    }
);


/* =========================================================
   CAMERA INPUT FALLBACK
   ========================================================= */

document.addEventListener(
    "change",
    event => {

        if (
            event.target.id !==
            "cameraInput"
        ) {

            return;

        }


        const files =
            Array.from(
                event.target.files || []
            );


        if (!files.length) {
            return;
        }


        if (!currentBook) {

            alert(
                "Open a cookbook first."
            );

            return;
        }


        currentScanFiles =
            files.slice(0, 5);


        processScan();

    }
);


/* =========================================================
   PROCESS SCAN
   ========================================================= */

async function processScan() {

    if (!currentBook) {

        alert(
            "Open a cookbook first."
        );

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


            showScannerProgress(
                `Reading page ${i + 1} of ${currentScanFiles.length}...`
            );


            const result =
                await Tesseract.recognize(
                    file,
                    "eng",
                    {

                        logger:
                            message => {

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


                                    showScannerProgress(
                                        `Reading page ${i + 1} of ${currentScanFiles.length}... ${percent}%`
                                    );

                                }

                            }

                    }
                );


            const text =
                result?.data?.text || "";


            if (text.trim()) {

                combinedText +=
                    "\n" +
                    text +
                    "\n";

            }
        }


        if (!combinedText.trim()) {

            throw new Error(
                "No readable text found."
            );

        }


        showScannerProgress(
            "Organizing recipe..."
        );


        const recipe =
            parseRecipe(
                combinedText
            );


        if (
            !recipe.ingredients.length &&
            !recipe.instructions.length
        ) {

            throw new Error(
                "Could not find recipe information."
            );

        }


        saveScannedRecipe(
            recipe
        );


        hideScannerStatus();


        currentScanFiles = [];


        const scannerInput =
            document.getElementById(
                "scannerInput"
            );


        if (scannerInput) {
            scannerInput.value = "";
        }


        renderFolders();
        renderRecipes();


        openRecipe(
            recipe
        );


    } catch (error) {

        console.error(
            "MealMind scanner error:",
            error
        );


        hideScannerStatus();


        alert(
            "I couldn't read that recipe. Try a clearer photo with the whole recipe visible."
        );

    }

}


/* =========================================================
   SAVE SCANNED RECIPE
   ========================================================= */

function saveScannedRecipe(recipe) {

    normalizeBook(currentBook);


    const selectedFolder =
        currentFolder ||
        "Recipes";


    const mainRecipe = {

        id: makeID(),

        title:
            recipe.title ||
            "Scanned Recipe",

        cuisine:
            recipe.cuisine || "",

        servings:
            recipe.servings || 4,

        ingredients:
            [...recipe.ingredients],

        instructions:
            [...recipe.instructions],

        notes:
            recipe.notes || "",

        folder:
            selectedFolder,

        pages:
            currentScanFiles.length

    };


    /*
       Save the main copy.
    */

    currentBook.recipes.push(
        mainRecipe
    );


    /*
       Always keep a copy in Recipes.
       If already in Recipes, don't make
       a duplicate.
    */

    if (
        selectedFolder !==
        "Recipes"
    ) {

        const recipesCopy = {

            id: makeID(),

            title:
                mainRecipe.title,

            cuisine:
                mainRecipe.cuisine,

            servings:
                mainRecipe.servings,

            ingredients:
                [...mainRecipe.ingredients],

            instructions:
                [...mainRecipe.instructions],

            notes:
                mainRecipe.notes,

            folder:
                "Recipes",

            pages:
                mainRecipe.pages

        };


        currentBook.recipes.push(
            recipesCopy
        );
    }


    saveData();


    /*
       Return the actual recipe that should
       open on screen.
    */

    currentRecipe =
        mainRecipe;
}


/* =========================================================
   LOAD TESSERACT
   ========================================================= */

function loadTesseract() {

    if (
        window.Tesseract
    ) {

        return Promise.resolve();

    }


    if (tesseractPromise) {

        return tesseractPromise;

    }


    tesseractPromise =
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
                    () => {

                        if (
                            window.Tesseract
                        ) {

                            resolve();

                        } else {

                            reject(
                                new Error(
                                    "Tesseract did not load."
                                )
                            );

                        }

                    };


                script.onerror =
                    () => {

                        reject(
                            new Error(
                                "Could not load scanner."
                            )
                        );

                    };


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
            .map(cleanOCRLine)
            .filter(Boolean);


    let title = "";
    let servings = 4;
    let cuisine = "";

    const ingredients = [];
    const instructions = [];

    let section = "unknown";


    const ingredientHeaders = [
        "ingredients",
        "ingredient",
        "what you need",
        "you will need",
        "you'll need"
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


    /*
       Find title near the top.
    */

    for (
        let i = 0;
        i < Math.min(lines.length, 10);
        i++
    ) {

        const line =
            lines[i];


        const lower =
            line.toLowerCase();


        if (
            ingredientHeaders.includes(
                lower
            ) ||
            instructionHeaders.includes(
                lower
            )
        ) {

            continue;

        }


        if (
            isGoodTitle(line)
        ) {

            title = line;
            break;

        }
    }


    /*
       Read the sections.
    */

    for (
        const line of lines
    ) {

        const lower =
            line.toLowerCase();


        if (
            ingredientHeaders.includes(
                lower
            )
        ) {

            section =
                "ingredients";

            continue;
        }


        if (
            instructionHeaders.includes(
                lower
            )
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
                Math.max(
                    1,
                    Number(
                        servingMatch[1]
                    )
                );

            continue;
        }


        if (
            line === title
        ) {

            continue;
        }


        if (
            section ===
            "ingredients"
        ) {

            const ingredient =
                cleanIngredient(
                    line
                );


            if (
                isRealIngredient(
                    ingredient
                )
            ) {

                ingredients.push(
                    ingredient
                );

            }


            continue;
        }


        if (
            section ===
            "instructions"
        ) {

            const instruction =
                cleanInstruction(
                    line
                );


            if (
                isRealInstruction(
                    instruction
                )
            ) {

                instructions.push(
                    instruction
                );

            }

        }

    }


    /*
       If headings weren't detected,
       use an intelligent fallback.
    */

    if (
        ingredients.length === 0 ||
        instructions.length === 0
    ) {

        const fallback =
            fallbackSplit(
                lines,
                title
            );


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


    return {

        title:
            title ||
            "Scanned Recipe",

        cuisine,

        servings,

        ingredients:
            removeDuplicates(
                ingredients
            ),

        instructions:
            removeDuplicates(
                instructions
            ),

        notes: ""

    };
}


/* =========================================================
   OCR CLEANUP
   ========================================================= */

function cleanOCRLine(line) {

    let text =
        String(line || "");


    /*
       Remove obvious OCR garbage.
    */

    text =
        text.replace(
            /\b\d+\s*:\s*\d+\b/g,
            ""
        );


    text =
        text.replace(
            /(^|\s)[:;|]{2,}\s*\d*\b/g,
            " "
        );


    text =
        text.replace(
            /[|]{2,}/g,
            " "
        );


    /*
       Remove bullets.
    */

    text =
        text.replace(
            /^\s*[•●▪◦*]\s*/,
            ""
        );


    /*
       Remove step numbering.
    */

    text =
        text.replace(
            /^\s*\d+\s*[.)-]\s*/,
            ""
        );


    /*
       Fix OCR spacing.
    */

    text =
        text.replace(
            /\s+/g,
            " "
        );


    text =
        text.trim();


    /*
       Don't keep lines made entirely of
       numbers/symbols.
    */

    if (
        !/[A-Za-z]{2,}/.test(text)
    ) {

        return "";

    }


    return text;
}


/* =========================================================
   TITLE
   ========================================================= */

function isGoodTitle(line) {

    if (!line) {
        return false;
    }


    if (
        line.length < 3 ||
        line.length > 100
    ) {

        return false;
    }


    if (
        !/[A-Za-z]{2,}/.test(line)
    ) {

        return false;
    }


    if (
        looksLikeIngredient(line)
    ) {

        return false;
    }


    if (
        looksLikeInstruction(line)
    ) {

        return false;
    }


    return true;
}


/* =========================================================
   INGREDIENTS
   ========================================================= */

function looksLikeIngredient(line) {

    return /(?:\d+(?:\s*\/\s*\d+)?|\d*\s*[½⅓⅔¼¾⅛⅜⅝⅞])\s*(?:cups?|tablespoons?|tbsp|teaspoons?|tsp|ounces?|oz|pounds?|lbs?|grams?|g|kilograms?|kg|milliliters?|ml|liters?|l)\b/i
        .test(line);
}


function cleanIngredient(line) {

    let text =
        cleanOCRLine(line);


    text =
        text.replace(
            /^\s*[-–—]\s*/,
            ""
        );


    return text.trim();
}


function isRealIngredient(line) {

    if (!line) {
        return false;
    }


    if (
        !/[A-Za-z]{2,}/.test(line)
    ) {

        return false;
    }


    if (
        /^[:;|@#$%^&*]+$/.test(line)
    ) {

        return false;
    }


    return true;
}


/* =========================================================
   INSTRUCTIONS
   ========================================================= */

function looksLikeInstruction(line) {

    return /^(?:add|mix|stir|bake|cook|heat|combine|place|pour|remove|serve|chop|slice|preheat|whisk|fold|boil|simmer|let|allow|season|transfer|spread|cover|cool|drain|blend|beat|knead|roll|fry|saute|sauté|roast|grill|marinate|prepare)\b/i
        .test(line);
}


function cleanInstruction(line) {

    let text =
        cleanOCRLine(line);


    text =
        text.replace(
            /^\d+\s*[.)-]\s*/,
            ""
        );


    return text.trim();
}


function isRealInstruction(line) {

    if (!line) {
        return false;
    }


    if (
        !/[A-Za-z]{2,}/.test(line)
    ) {

        return false;
    }


    return true;
}


/* =========================================================
   FALLBACK SPLITTER
   ========================================================= */

function fallbackSplit(
    lines,
    title
) {

    const usable =
        lines.filter(
            line =>
                line !== title
        );


    const ingredients = [];
    const instructions = [];


    let instructionStarted =
        false;


    for (
        const line of usable
    ) {

        if (
            looksLikeInstruction(line)
        ) {

            instructionStarted =
                true;

        }


        if (
            instructionStarted
        ) {

            const instruction =
                cleanInstruction(line);


            if (
                isRealInstruction(
                    instruction
                )
            ) {

                instructions.push(
                    instruction
                );

            }

        } else {

            const ingredient =
                cleanIngredient(line);


            if (
                isRealIngredient(
                    ingredient
                )
            ) {

                ingredients.push(
                    ingredient
                );

            }

        }

    }


    /*
       Final fallback if no instruction
       verbs were recognized.
    */

    if (
        instructions.length === 0 &&
        usable.length >= 6
    ) {

        const split =
            Math.max(
                2,
                Math.floor(
                    usable.length * 0.55
                )
            );


        return {

            ingredients:
                usable
                    .slice(0, split)
                    .map(cleanIngredient)
                    .filter(
                        isRealIngredient
                    ),

            instructions:
                usable
                    .slice(split)
                    .map(cleanInstruction)
                    .filter(
                        isRealInstruction
                    )

        };

    }


    return {
        ingredients,
        instructions
    };
}


/* =========================================================
   REMOVE DUPLICATES
   ========================================================= */

function removeDuplicates(lines) {

    const seen =
        new Set();

    const result = [];


    for (
        const line of lines
    ) {

        const key =
            line
                .toLowerCase()
                .replace(/\s+/g, " ")
                .trim();


        if (
            !key ||
            seen.has(key)
        ) {

            continue;
        }


        seen.add(key);

        result.push(line);
    }


    return result;
}


/* =========================================================
   FOLDERS
   ========================================================= */

function renderFolders() {

    const container =
        document.getElementById(
            "folders"
        );


    if (!container || !currentBook) {
        return;
    }


    normalizeBook(currentBook);


    container.innerHTML = "";


    currentBook.folders.forEach(
        folder => {

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.style.display =
                "flex";

            wrapper.style.gap =
                "8px";

            wrapper.style.alignItems =
                "stretch";


            const folderButton =
                document.createElement(
                    "button"
                );


            folderButton.type =
                "button";

            folderButton.className =
                "folder-card";

            folderButton.dataset.folder =
                folder;


            const count =
                currentBook.recipes.filter(
                    recipe =>
                        recipe.folder ===
                        folder
                ).length;


            folderButton.innerHTML = `

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


            const editButton =
                document.createElement(
                    "button"
                );


            editButton.type =
                "button";

            editButton.className =
                "recipe-action-button";

            editButton.dataset.action =
                "edit-folder";

            editButton.dataset.folder =
                folder;

            editButton.textContent =
                "✏️";


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.type =
                "button";

            deleteButton.className =
                "recipe-action-button danger";

            deleteButton.dataset.action =
                "delete-folder";

            deleteButton.dataset.folder =
                folder;

            deleteButton.textContent =
                "🗑️";


            wrapper.appendChild(
                folderButton
            );

            wrapper.appendChild(
                editButton
            );

            wrapper.appendChild(
                deleteButton
            );


            container.appendChild(
                wrapper
            );

        }
    );
}


/* =========================================================
   ADD FOLDER
   ========================================================= */

function addFolder() {

    if (!currentBook) {
        return;
    }


    const input =
        prompt(
            "Enter a folder name:"
        );


    if (
        !input ||
        !input.trim()
    ) {

        return;
    }


    const folder =
        input.trim();


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

function editFolder(oldName) {

    if (!currentBook) {
        return;
    }


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

function deleteFolder(folder) {

    if (!currentBook) {
        return;
    }


    if (
        folder === "Recipes"
    ) {

        alert(
            'The main "Recipes" folder cannot be deleted.'
        );

        return;
    }


    if (
        currentBook.folders.length <=
        1
    ) {

        alert(
            "You need to keep at least one folder."
        );

        return;
    }


    const count =
        currentBook.recipes.filter(
            recipe =>
                recipe.folder ===
                folder
        ).length;


    const message =
        count > 0
            ? `Delete "${folder}"? Its ${count} recipe(s) will be moved to Recipes.`
            : `Delete "${folder}"?`;


    if (
        !confirm(message)
    ) {

        return;
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


    if (
        !container ||
        !currentBook
    ) {

        return;
    }


    container.innerHTML = "";


    let recipes =
        currentBook.recipes;


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
            .toLowerCase() || "";


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


            button.type =
                "button";

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
   RECIPE VIEWER
   ========================================================= */

function openRecipe(recipe) {

    if (!recipe) {
        return;
    }


    currentRecipe =
        recipe;


    const viewer =
        document.getElementById(
            "recipeViewer"
        );


    if (!viewer) {
        return;
    }


    const servings =
        Number(
            recipe.servings
        ) || 4;


    viewer.classList.remove(
        "hidden"
    );


    viewer.innerHTML = `

        <div class="recipe-sheet">

            <div class="recipe-topbar">

                <button
                    type="button"
                    class="recipe-back-button"
                    data-action="close-recipe">
                    ← Back
                </button>

                <div class="recipe-actions">

                    <button
                        type="button"
                        class="recipe-action-button"
                        data-action="edit-recipe">
                        ✏️ Edit
                    </button>

                    <button
                        type="button"
                        class="recipe-action-button danger"
                        data-action="delete-recipe">
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
                        id="recipeServingNumber">
                        ${servings}
                    </strong>

                    <button
                        type="button"
                        id="recipeServingMinus">
                        −
                    </button>

                    <button
                        type="button"
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

                MealMind

            </footer>

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

        viewer.classList.add(
            "hidden"
        );

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


    modal.classList.remove(
        "hidden"
    );


    modal.innerHTML = `

        <div class="editor-box">

            <h2>
                Edit Recipe
            </h2>

            <label>
                Title
            </label>

            <input
                id="editRecipeTitle"
                class="text-input"
                type="text"
                value="${escapeHTML(
                    currentRecipe.title || ""
                )}">


            <label>
                Cuisine
            </label>

            <input
                id="editRecipeCuisine"
                class="text-input"
                type="text"
                value="${escapeHTML(
                    currentRecipe.cuisine || ""
                )}">


            <label>
                Servings
            </label>

            <input
                id="editRecipeServings"
                class="text-input"
                type="number"
                min="1"
                value="${
                    Number(
                        currentRecipe.servings
                    ) || 4
                }">


            <label>
                Ingredients
            </label>

            <textarea
                id="editRecipeIngredients"
                class="text-input"
                rows="8">${escapeHTML(
                    (
                        currentRecipe.ingredients ||
                        []
                    ).join("\n")
                )}</textarea>


            <label>
                Instructions
            </label>

            <textarea
                id="editRecipeInstructions"
                class="text-input"
                rows="8">${escapeHTML(
                    (
                        currentRecipe.instructions ||
                        []
                    ).join("\n")
                )}</textarea>


            <label>
                Notes
            </label>

            <textarea
                id="editRecipeNotes"
                class="text-input"
                rows="5">${escapeHTML(
                    currentRecipe.notes ||
                    ""
                )}</textarea>


            <button
                type="button"
                class="main-button"
                data-action="save-recipe">
                Save Recipe
            </button>


            <button
                type="button"
                class="main-button"
                data-action="cancel-edit">
                Cancel
            </button>

        </div>

    `;
}


/* =========================================================
   SAVE EDITED RECIPE
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
            .trim() || "";


    const cuisine =
        document
            .getElementById(
                "editRecipeCuisine"
            )
            ?.value
            .trim() || "";


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
            .split(/\r?\n/)
            .map(
                cleanIngredient
            )
            .filter(Boolean) || [];


    const instructions =
        document
            .getElementById(
                "editRecipeInstructions"
            )
            ?.value
            .split(/\r?\n/)
            .map(
                cleanInstruction
            )
            .filter(Boolean) || [];


    const notes =
        document
            .getElementById(
                "editRecipeNotes"
            )
            ?.value
            .trim() || "";


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

        modal.innerHTML = "";

    }
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
        Number(
            recipe.servings
        ) || 4;


    const multiplier =
        servings /
        originalServings;


    const ingredients =
        Array.isArray(
            recipe.ingredients
        )
            ? recipe.ingredients
            : [];


    if (!ingredients.length) {

        const li =
            document.createElement(
                "li"
            );

        li.textContent =
            "No ingredients found.";

        list.appendChild(li);

        return;
    }


    ingredients.forEach(
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
   INSTRUCTION DISPLAY
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


    const instructions =
        Array.isArray(
            recipe.instructions
        )
            ? recipe.instructions
            : [];


    if (!instructions.length) {

        const li =
            document.createElement(
                "li"
            );

        li.textContent =
            "No instructions found.";

        list.appendChild(li);

        return;
    }


    instructions.forEach(
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
   FRACTIONS
   ========================================================= */

const fractionValues = {

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


function parseAmount(value) {

    const text =
        String(value)
            .trim();


    if (
        fractionValues[text] !==
        undefined
    ) {

        return fractionValues[text];
    }


    if (
        text.includes("/")
    ) {

        const parts =
            text.split("/");


        if (
            parts.length === 2
        ) {

            const a =
                Number(
                    parts[0]
                );


            const b =
                Number(
                    parts[1]
                );


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
        Number(text);


    if (
        Number.isFinite(number)
    ) {

        return number;
    }


    return null;
}


function formatAmount(number) {

    const fractions = [

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
        of fractions
    ) {

        if (
            Math.abs(
                decimal - value
            ) < 0.025
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


    /*
       Supports:

       2 cups
       1/2 cup
       ½ cup
       2.5 cups
    */

    const match =
        ingredient.match(
            /^(\d+(?:\.\d+)?|\d+\s*\/\s*\d+|[½⅓⅔¼¾⅛⅜⅝⅞])(?=\s|$)/
        );


    if (!match) {

        return ingredient;
    }


    const amount =
        parseAmount(
            match[1]
        );


    if (
        amount === null
    ) {

        return ingredient;
    }


    const scaled =
        amount *
        multiplier;


    return (
        formatAmount(scaled) +
        ingredient.slice(
            match[0].length
        )
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


    if (!container) {
        return;
    }


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


            button.type =
                "button";

            button.className =
                "main-button";


            button.textContent =
                `📖 ${book.name}`;


            button.addEventListener(
                "click",
                () => {

                    currentBook =
                        book;

                    normalizeBook(
                        currentBook
                    );

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
   SCANNER STATUS
   ========================================================= */

function showScannerStatus(text) {

    const status =
        document.getElementById(
            "scannerStatus"
        );


    const progress =
        document.getElementById(
            "scannerProgress"
        );


    if (status) {

        status.classList.remove(
            "hidden"
        );

    }


    if (progress) {

        progress.textContent =
            text;

    }
}


function showScannerProgress(text) {

    const progress =
        document.getElementById(
            "scannerProgress"
        );


    if (progress) {

        progress.textContent =
            text;

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
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        mealMind.books.forEach(
            normalizeBook
        );


        saveData();


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

    }
);
