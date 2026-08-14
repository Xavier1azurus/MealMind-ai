"use strict";

/* =========================================================
   MEALMIND
   Recipe Scanner + Recipe Format + Ingredient Calculator
   =========================================================

   SCANNER:
   - Title stays EMPTY after scanning
   - Ingredients -> Ingredients
   - Instructions -> Instructions
   - Notes -> Notes

   RECIPE FORMAT:
   - Title
   - Cuisine
   - Servings
   - Ingredients
   - Instructions
   - Notes

   CALCULATOR:
   - Changes ingredient quantities based on servings
   - Understands fractions
   - Keeps "to taste" and other non-numeric amounts unchanged
   ========================================================= */


/* =========================================================
   STORAGE
   ========================================================= */

const STORAGE_KEY = "mealmind_v6";

let data = loadData();

let currentBook = null;
let currentFolder = null;

let pendingRecipe = null;
let editingRecipeId = null;

let viewedRecipe = null;
let viewedPage = 1;


/* =========================================================
   LOAD / SAVE
   ========================================================= */

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return {
                books: []
            };
        }

        const parsed = JSON.parse(saved);

        if (
            !parsed ||
            !Array.isArray(parsed.books)
        ) {
            return {
                books: []
            };
        }

        return parsed;

    } catch (error) {

        console.error(
            "MealMind could not load data:",
            error
        );

        return {
            books: []
        };
    }
}


function saveData() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );

    } catch (error) {

        console.error(
            "MealMind could not save data:",
            error
        );

    }
}


/* =========================================================
   ID
   ========================================================= */

function createId() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 10)
    );

}


/* =========================================================
   HTML SAFETY
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   SCREEN CONTROL
   ========================================================= */

const screens = [
    "homeScreen",
    "makeScreen",
    "joinScreen",
    "publicScreen"
];


function hideScreens() {

    screens.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.classList.add("hidden");
        }

    });


    const main =
        document.getElementById(
            "mainScreen"
        );

    if (main) {
        main.classList.add("hidden");
    }

}


function showScreen(id) {

    hideScreens();

    const element =
        document.getElementById(id);

    if (element) {
        element.classList.remove("hidden");
    }

}


/* =========================================================
   HOME
   ========================================================= */

document
    .getElementById("makeCookbookButton")
    ?.addEventListener(
        "click",
        () => showScreen("makeScreen")
    );


document
    .getElementById("joinCookbookButton")
    ?.addEventListener(
        "click",
        () => showScreen("joinScreen")
    );


document
    .getElementById("publicBooksButton")
    ?.addEventListener(
        "click",
        () => {

            showScreen("publicScreen");

            renderPublicBooks();

        }
    );


/* =========================================================
   BACK BUTTONS
   ========================================================= */

document
    .getElementById("backFromMake")
    ?.addEventListener(
        "click",
        goHome
    );


document
    .getElementById("backFromJoin")
    ?.addEventListener(
        "click",
        goHome
    );


document
    .getElementById("backFromPublic")
    ?.addEventListener(
        "click",
        goHome
    );


function goHome() {

    currentBook = null;
    currentFolder = null;

    pendingRecipe = null;
    editingRecipeId = null;

    viewedRecipe = null;

    hideScreens();

    document
        .getElementById("homeScreen")
        ?.classList.remove("hidden");

}


/* =========================================================
   PRIVACY
   ========================================================= */

document
    .getElementById("privateButton")
    ?.addEventListener(
        "click",
        () => {

            selectedPrivacy("private");

        }
    );


document
    .getElementById("publicButton")
    ?.addEventListener(
        "click",
        () => {

            selectedPrivacy("public");

        }
    );


function selectedPrivacy(type) {

    const privateButton =
        document.getElementById(
            "privateButton"
        );

    const publicButton =
        document.getElementById(
            "publicButton"
        );


    if (privateButton) {

        privateButton.classList.toggle(
            "selected",
            type === "private"
        );

    }


    if (publicButton) {

        publicButton.classList.toggle(
            "selected",
            type === "public"
        );

    }


    window.mealmindPrivacy = type;

}


/* =========================================================
   PASSWORD VISIBILITY
   ========================================================= */

document
    .getElementById("showPasswordButton")
    ?.addEventListener(
        "click",
        () => togglePassword(
            "cookbookPassword"
        )
    );


document
    .getElementById("showJoinPassword")
    ?.addEventListener(
        "click",
        () => togglePassword(
            "joinPassword"
        )
    );


function togglePassword(id) {

    const input =
        document.getElementById(id);

    if (!input) return;

    input.type =
        input.type === "password"
            ? "text"
            : "password";

}


/* =========================================================
   CREATE COOKBOOK
   ========================================================= */

document
    .getElementById("createCookbookButton")
    ?.addEventListener(
        "click",
        createCookbook
    );


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


    const error =
        document.getElementById(
            "makeError"
        );


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

        name: name,

        privacy:
            window.mealmindPrivacy ||
            "private",

        password: password,

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
    ?.addEventListener(
        "click",
        joinBook
    );


function joinBook() {

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


    const error =
        document.getElementById(
            "joinError"
        );


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

    const list =
        document.getElementById(
            "publicBooksList"
        );


    if (!list) return;


    list.innerHTML = "";


    const books =
        data.books.filter(
            book =>
                book.privacy === "public"
        );


    if (!books.length) {

        list.innerHTML = `
            <div class="empty-state">
                <div>📚</div>
                <p>No public cookbooks yet.</p>
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

                currentBook = book;

                openBook();

            }
        );


        list.appendChild(button);

    });

}


/* =========================================================
   OPEN BOOK
   ========================================================= */

function openBook() {

    hideScreens();


    document
        .getElementById(
            "mainScreen"
        )
        ?.classList.remove(
            "hidden"
        );


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

    render();

}


/* =========================================================
   EXIT BOOK
   ========================================================= */

document
    .getElementById(
        "exitBookButton"
    )
    ?.addEventListener(
        "click",
        goHome
    );


/* =========================================================
   SCANNER
   ========================================================= */

document
    .getElementById(
        "scanButton"
    )
    ?.addEventListener(
        "click",
        () => {

            const input =
                document.getElementById(
                    "cameraInput"
                );


            if (input) {

                input.value = "";

                input.click();

            }

        }
    );


document
    .getElementById(
        "cameraInput"
    )
    ?.addEventListener(
        "change",
        async event => {

            const file =
                event.target.files?.[0];


            if (!file) return;


            setScanStatus(
                "📸 Preparing recipe..."
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

                pendingRecipe.pages = 1;

                openEditor(
                    pendingRecipe
                );

            }

        }
    );


function setScanStatus(message) {

    const status =
        document.getElementById(
            "scanStatus"
        );


    if (status) {
        status.textContent = message;
    }

}


/* =========================================================
   SCAN RECIPE
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

                            const progress =
                                Math.round(
                                    (
                                        info.progress ||
                                        0
                                    ) * 100
                                );


                            setScanStatus(
                                `🔎 Reading recipe ${progress}%`
                            );

                        }

                    }

                }
            );


        const text =
            result?.data?.text || "";


        if (!text.trim()) {

            throw new Error(
                "No recipe text detected."
            );

        }


        return parseRecipe(text);


    } catch (error) {

        console.error(
            "MealMind scanner error:",
            error
        );


        setScanStatus(
            "❌ Could not read recipe."
        );


        alert(
            "MealMind couldn't read that recipe clearly. Try taking a brighter, straighter photo."
        );


        return null;

    }

}


/* =========================================================
   OCR CLEANING
   ========================================================= */

function cleanOCRText(text) {

    return text

        .normalize("NFKC")

        .replace(
            /[░▒▓█■□◆◇●◦]/g,
            ""
        )

        .replace(
            /[“”]/g,
            '"'
        )

        .replace(
            /[‘’]/g,
            "'"
        )

        .replace(
            /\r/g,
            ""
        )

        .replace(
            /[ \t]+/g,
            " "
        )

        .replace(
            /\n{3,}/g,
            "\n\n"
        )

        .trim();

}


/* =========================================================
   RECIPE HEADINGS
   ========================================================= */

const INGREDIENT_HEADINGS = [
    "ingredient",
    "ingredients",
    "what you need",
    "you will need",
    "you'll need",
    "shopping list"
];


const INSTRUCTION_HEADINGS = [
    "instruction",
    "instructions",
    "directions",
    "direction",
    "method",
    "steps",
    "step by step",
    "preparation",
    "how to make",
    "how to prepare"
];


const NOTE_HEADINGS = [
    "note",
    "notes",
    "tip",
    "tips",
    "chef's notes",
    "chefs notes"
];


function normalizeHeading(line) {

    return line
        .toLowerCase()
        .replace(
            /[:\-–—]+$/g,
            ""
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


function detectSection(line) {

    const normalized =
        normalizeHeading(line);


    if (
        INGREDIENT_HEADINGS.includes(
            normalized
        )
    ) {
        return "ingredients";
    }


    if (
        INSTRUCTION_HEADINGS.includes(
            normalized
        )
    ) {
        return "instructions";
    }


    if (
        NOTE_HEADINGS.includes(
            normalized
        )
    ) {
        return "notes";
    }


    return null;

}


/* =========================================================
   PARSE RECIPE
   ========================================================= */

function parseRecipe(text) {

    const cleaned =
        cleanOCRText(text);


    const lines =
        cleaned
            .split("\n")
            .map(cleanOCRLine)
            .filter(Boolean);


    const ingredients = [];
    const instructions = [];
    const notes = [];


    let section = "unknown";


    /*
     * IMPORTANT:
     *
     * TITLE IS DELIBERATELY EMPTY.
     *
     * We do NOT take the first OCR line.
     */

    for (const line of lines) {

        const detected =
            detectSection(line);


        if (detected) {

            section = detected;

            continue;

        }


        if (
            isUnwantedOCRLine(line)
        ) {
            continue;
        }


        if (
            section === "ingredients"
        ) {

            if (
                looksLikeIngredient(line)
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

            if (
                looksLikeInstruction(line) ||
                line.length > 25
            ) {

                if (
                    !looksLikeIngredient(line)
                ) {

                    instructions.push(
                        cleanInstruction(line)
                    );

                }

            }

            continue;
        }


        if (
            section === "notes"
        ) {

            notes.push(
                cleanNote(line)
            );

            continue;
        }

    }


    /*
     * If the picture doesn't have headings,
     * try to figure out ingredients and steps.
     */

    if (
        ingredients.length === 0 &&
        instructions.length === 0
    ) {

        const guessed =
            guessRecipeSections(lines);


        ingredients.push(
            ...guessed.ingredients
        );


        instructions.push(
            ...guessed.instructions
        );

    }


    return {

        id: null,

        /*
         * ALWAYS EMPTY AFTER SCANNING.
         */

        title: "",

        cuisine: "",

        folder:
            currentBook?.folders?.[0] ||
            "Sweet",

        servings: 4,

        ingredients:
            uniqueCleanLines(
                ingredients
            ),

        instructions:
            uniqueCleanLines(
                instructions
            ),

        notes:
            uniqueCleanLines(
                notes
            ).join(" "),

        pages: 1

    };

}


/* =========================================================
   CLEAN OCR LINE
   ========================================================= */

function cleanOCRLine(line) {

    return line

        .replace(
            /^[•●▪◦·]+/,
            ""
        )

        .replace(
            /\s{2,}/g,
            " "
        )

        .trim();

}


/* =========================================================
   REMOVE OCR GARBAGE
   ========================================================= */

function isUnwantedOCRLine(line) {

    if (line.length < 2) {
        return true;
    }


    const letters =
        (
            line.match(
                /[a-zA-Z]/g
            ) || []
        ).length;


    const symbols =
        (
            line.match(
                /[^a-zA-Z0-9\s]/g
            ) || []
        ).length;


    if (
        symbols > letters &&
        letters < 3
    ) {
        return true;
    }


    const lower =
        line.toLowerCase();


    const unwanted = [
        "www.",
        "http://",
        "https://",
        "instagram.com",
        "facebook.com",
        "pinterest.com",
        "copyright",
        "©"
    ];


    return unwanted.some(
        word =>
            lower.includes(word)
    );

}


/* =========================================================
   INGREDIENT DETECTION
   ========================================================= */

function looksLikeIngredient(line) {

    const measurement =
        /(^|\s)(\d+([\/.]\d+)?|\d+\s+\d+\/\d+|½|⅓|⅔|¼|¾|⅛|⅜|⅝|⅞)\s*(cups?|cup|tbsp|tbs|tablespoons?|tsp|teaspoons?|oz|ounces?|lb|lbs|pounds?|g|grams?|kg|ml|milliliters?|l|liters?|pinch|dash)\b/i;


    if (
        measurement.test(line)
    ) {
        return true;
    }


    if (
        /^\s*(\d+\/\d+|½|⅓|⅔|¼|¾|⅛|⅜|⅝|⅞)\s+/.test(
            line
        )
    ) {
        return true;
    }


    const words = [

        "flour",
        "sugar",
        "salt",
        "pepper",
        "butter",
        "oil",
        "olive oil",
        "vegetable oil",
        "egg",
        "eggs",
        "milk",
        "cream",
        "cheese",
        "chicken",
        "beef",
        "pork",
        "turkey",
        "garlic",
        "onion",
        "tomato",
        "potato",
        "rice",
        "pasta",
        "water",
        "vanilla",
        "cinnamon",
        "honey",
        "lemon",
        "lime",
        "chocolate",
        "yeast",
        "baking powder",
        "baking soda",
        "cocoa",
        "cornstarch",
        "bread",
        "beans",
        "carrot",
        "celery",
        "parsley",
        "basil",
        "oregano",
        "thyme",
        "paprika",
        "cheddar",
        "mozzarella",
        "parmesan"

    ];


    const lower =
        line.toLowerCase();


    return words.some(
        word =>
            lower.includes(word)
    );

}


/* =========================================================
   INSTRUCTION DETECTION
   ========================================================= */

function looksLikeInstruction(line) {

    if (
        /^\s*\d+[\.\):\-]\s*/.test(
            line
        )
    ) {
        return true;
    }


    const lower =
        line
            .toLowerCase()
            .replace(
                /^\s*[-•*]\s*/,
                ""
            );


    const verbs = [

        "preheat",
        "heat",
        "cook",
        "bake",
        "boil",
        "simmer",
        "fry",
        "stir",
        "mix",
        "whisk",
        "combine",
        "add",
        "pour",
        "place",
        "put",
        "remove",
        "serve",
        "chop",
        "slice",
        "dice",
        "cut",
        "blend",
        "beat",
        "fold",
        "knead",
        "roast",
        "grill",
        "broil",
        "marinate",
        "season",
        "drain",
        "cover",
        "uncover",
        "cool",
        "refrigerate",
        "freeze",
        "rest",
        "allow"

    ];


    return verbs.some(
        verb =>
            lower.startsWith(
                verb + " "
            )
    );

}


/* =========================================================
   CLEAN INGREDIENT
   ========================================================= */

function cleanIngredient(line) {

    return line

        .replace(
            /^\s*[-•*]\s*/,
            ""
        )

        .replace(
            /^\s*\d+[\.\)]\s*/,
            ""
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


/* =========================================================
   CLEAN INSTRUCTION
   ========================================================= */

function cleanInstruction(line) {

    return line

        .replace(
            /^\s*\d+[\.\):\-]\s*/,
            ""
        )

        .replace(
            /^\s*[-•*]\s*/,
            ""
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


/* =========================================================
   CLEAN NOTE
   ========================================================= */

function cleanNote(line) {

    return line

        .replace(
            /^\s*[-•*]\s*/,
            ""
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


/* =========================================================
   NO-HEADING FALLBACK
   ========================================================= */

function guessRecipeSections(lines) {

    const ingredients = [];
    const instructions = [];

    let foundIngredients = false;


    for (const line of lines) {

        if (
            isUnwantedOCRLine(line)
        ) {
            continue;
        }


        if (
            looksLikeIngredient(line)
        ) {

            foundIngredients = true;

            ingredients.push(
                cleanIngredient(line)
            );

            continue;
        }


        if (
            foundIngredients &&
            looksLikeInstruction(line)
        ) {

            instructions.push(
                cleanInstruction(line)
            );

            continue;
        }


        if (
            foundIngredients &&
            line.length > 30 &&
            !looksLikeIngredient(line)
        ) {

            instructions.push(
                cleanInstruction(line)
            );

        }

    }


    return {
        ingredients:
            uniqueCleanLines(
                ingredients
            ),

        instructions:
            uniqueCleanLines(
                instructions
            )
    };

}


/* =========================================================
   REMOVE DUPLICATES
   ========================================================= */

function uniqueCleanLines(lines) {

    const seen = new Set();
    const output = [];


    for (const line of lines) {

        const cleaned =
            String(line)
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();


        if (!cleaned) {
            continue;
        }


        const key =
            cleaned.toLowerCase();


        if (seen.has(key)) {
            continue;
        }


        seen.add(key);

        output.push(cleaned);

    }


    return output;

}


/* =========================================================
   PAGE COUNT
   ========================================================= */

document
    .querySelectorAll(
        "[data-pages]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                if (!pendingRecipe) {
                    return;
                }


                pendingRecipe.pages =
                    Number(
                        button.dataset.pages
                    ) || 1;


                document
                    .getElementById(
                        "pageCountModal"
                    )
                    ?.classList.add(
                        "hidden"
                    );


                openEditor(
                    pendingRecipe
                );

            }
        );

    });


/* =========================================================
   EDITOR
   ========================================================= */

function openEditor(recipe) {

    editingRecipeId =
        recipe.id || null;


    const title =
        document.getElementById(
            "recipeTitleInput"
        );


    /*
     * Scanned recipes have an empty title.
     */

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
            recipe.servings ||
            4;

    }


    const ingredients =
        document.getElementById(
            "recipeIngredients"
        );


    if (ingredients) {

        ingredients.value =
            (
                recipe.ingredients ||
                []
            ).join("\n");

    }


    const instructions =
        document.getElementById(
            "recipeInstructions"
        );


    if (instructions) {

        instructions.value =
            (
                recipe.instructions ||
                []
            ).join("\n");

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
            currentBook.folders ||
            []
        ).forEach(
            folderName => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    folderName;

                option.textContent =
                    folderName;


                folder.appendChild(
                    option
                );

            }
        );


        folder.value =
            recipe.folder ||
            currentBook.folders[0];

    }


    document
        .getElementById(
            "editorModal"
        )
        ?.classList.remove(
            "hidden"
        );

}


/* =========================================================
   SAVE RECIPE
   ========================================================= */

document
    .getElementById(
        "saveRecipeButton"
    )
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


    const servingsInput =
        document.getElementById(
            "recipeServings"
        );


    let servings =
        Number(
            servingsInput?.value
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

        title: title,

        cuisine:
            document
                .getElementById(
                    "recipeCuisine"
                )
                ?.value
                .trim() || "",

        servings: servings,

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
                .map(
                    line =>
                        line.trim()
                )
                .filter(Boolean) || [],

        instructions:
            document
                .getElementById(
                    "recipeInstructions"
                )
                ?.value
                .split("\n")
                .map(
                    line =>
                        line.trim()
                )
                .filter(Boolean) || [],

        notes:
            document
                .getElementById(
                    "recipeNotes"
                )
                ?.value
                .trim() || "",

        pages:
            pendingRecipe?.pages ||
            1

    };


    const index =
        currentBook.recipes.findIndex(
            item =>
                item.id ===
                recipe.id
        );


    if (index === -1) {

        currentBook.recipes.push(
            recipe
        );

    } else {

        currentBook.recipes[index] =
            recipe;

    }


    saveCurrentBook();


    document
        .getElementById(
            "editorModal"
        )
        ?.classList.add(
            "hidden"
        );


    pendingRecipe = null;
    editingRecipeId = null;


    render();

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

        data.books.push(
            currentBook
        );

    } else {

        data.books[index] =
            currentBook;

    }


    saveData();

}


/* =========================================================
   RENDER EVERYTHING
   ========================================================= */

function render() {

    if (!currentBook) {
        return;
    }


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


    currentBook.folders.forEach(
        folder => {

            const count =
                currentBook.recipes.filter(
                    recipe =>
                        recipe.folder ===
                        folder
                ).length;


            const button =
                document.createElement(
                    "button"
                );


            button.type = "button";

            button.className =
                "folder-card";


            button.innerHTML = `
                <div class="folder-icon">
                    📁
                </div>

                <strong>
                    ${escapeHTML(folder)}
                </strong>

                <div class="folder-count">
                    ${count}
                    ${
                        count === 1
                            ? "recipe"
                            : "recipes"
                    }
                </div>
            `;


            button.addEventListener(
                "click",
                () => {

                    currentFolder =
                        folder;

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
   RECIPE LIST
   ========================================================= */

function renderRecipes() {

    const container =
        document.getElementById(
            "recipes"
        );


    if (!container) return;


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


    recipes.forEach(
        recipe => {

            const card =
                document.createElement(
                    "button"
                );


            card.type = "button";

            card.className =
                "recipe-card";


            card.innerHTML = `
                <div class="recipe-card-icon">
                    🍴
                </div>

                <div class="recipe-card-info">

                    <strong>
                        ${escapeHTML(
                            recipe.title
                        )}
                    </strong>

                    <span>
                        ${
                            recipe.ingredients?.length ||
                            0
                        }
                        ingredients
                    </span>

                </div>
            `;


            card.addEventListener(
                "click",
                () => openRecipe(recipe)
            );


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   SEARCH
   ========================================================= */

document
    .getElementById(
        "searchInput"
    )
    ?.addEventListener(
        "input",
        renderRecipes
    );


/* =========================================================
   OPEN RECIPE
   ========================================================= */

function openRecipe(recipe) {

    viewedRecipe = recipe;

    viewedPage = 1;


    renderRecipeViewer(
        recipe
    );

}


/* =========================================================
   RECIPE VIEWER
   ========================================================= */

function renderRecipeViewer(recipe) {

    /*
     * Try the existing viewer first.
     */

    const viewer =
        document.getElementById(
            "recipeViewer"
        );


    if (!viewer) {

        /*
         * If your HTML doesn't have a viewer
         * yet, use the editor area if available.
         */

        openEditor(recipe);

        return;

    }


    viewer.classList.remove(
        "hidden"
    );


    const title =
        escapeHTML(
            recipe.title ||
            "Untitled Recipe"
        );


    const cuisine =
        recipe.cuisine
            ? `<div class="recipe-cuisine">
                    ${escapeHTML(
                        recipe.cuisine
                    )}
               </div>`
            : "";


    const servings =
        Number(
            recipe.servings
        ) || 4;


    viewer.innerHTML = `

        <div class="recipe-format">

            <div class="recipe-header">

                <h1>
                    ${title}
                </h1>

                ${cuisine}

            </div>


            <div class="recipe-servings">

                <button
                    type="button"
                    id="servingsMinus"
                    class="servings-button"
                >
                    −
                </button>


                <span>

                    <strong>
                        <span id="servingsNumber">
                            ${servings}
                        </span>
                    </strong>

                    servings

                </span>


                <button
                    type="button"
                    id="servingsPlus"
                    class="servings-button"
                >
                    +
                </button>

            </div>


            <section class="recipe-section">

                <h2>
                    🥕 Ingredients
                </h2>

                <div id="viewerIngredients">
                </div>

            </section>


            <section class="recipe-section">

                <h2>
                    👨‍🍳 Instructions
                </h2>

                <ol id="viewerInstructions">
                </ol>

            </section>


            ${
                recipe.notes
                    ? `
                    <section class="recipe-section">

                        <h2>
                            📝 Notes
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


            <div class="recipe-actions">

                <button
                    type="button"
                    id="editViewedRecipe"
                >
                    ✏️ Edit Recipe
                </button>

            </div>

        </div>

    `;


    renderCalculatedIngredients(
        recipe,
        servings
    );


    document
        .getElementById(
            "servingsMinus"
        )
        ?.addEventListener(
            "click",
            () => {

                const newServings =
                    Math.max(
                        1,
                        (
                            Number(
                                document
                                    .getElementById(
                                        "servingsNumber"
                                    )
                                    ?.textContent
                            ) || servings
                        ) - 1
                    );


                updateRecipeServings(
                    recipe,
                    newServings
                );

            }
        );


    document
        .getElementById(
            "servingsPlus"
        )
        ?.addEventListener(
            "click",
            () => {

                const current =
                    Number(
                        document
                            .getElementById(
                                "servingsNumber"
                            )
                            ?.textContent
                    ) || servings;


                updateRecipeServings(
                    recipe,
                    current + 1
                );

            }
        );


    document
        .getElementById(
            "editViewedRecipe"
        )
        ?.addEventListener(
            "click",
            () => openEditor(recipe)
        );

}


/* =========================================================
   INGREDIENT CALCULATOR
   ========================================================= */

function updateRecipeServings(
    recipe,
    newServings
) {

    if (
        !Number.isFinite(
            newServings
        ) ||
        newServings <= 0
    ) {
        return;
    }


    const servingsNumber =
        document.getElementById(
            "servingsNumber"
        );


    if (servingsNumber) {

        servingsNumber.textContent =
            newServings;

    }


    renderCalculatedIngredients(
        recipe,
        newServings
    );

}


/* =========================================================
   CALCULATE INGREDIENTS
   ========================================================= */

function renderCalculatedIngredients(
    recipe,
    targetServings
) {

    const container =
        document.getElementById(
            "viewerIngredients"
        );


    if (!container) return;


    container.innerHTML = "";


    const originalServings =
        Number(
            recipe.servings
        ) || 4;


    const multiplier =
        targetServings /
        originalServings;


    const list =
        document.createElement(
            "ul"
        );


    list.className =
        "ingredient-list";


    (
        recipe.ingredients ||
        []
    ).forEach(
        ingredient => {

            const li =
                document.createElement(
                    "li"
                );


            const calculated =
                calculateIngredient(
                    ingredient,
                    multiplier
                );


            li.textContent =
                calculated;


            list.appendChild(
                li
            );

        }
    );


    if (
        !recipe.ingredients?.length
    ) {

        const empty =
            document.createElement(
                "p"
            );


        empty.textContent =
            "No ingredients added.";


        container.appendChild(
            empty
        );


        return;

    }


    container.appendChild(
        list
    );

}


/* =========================================================
   INGREDIENT MATH
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


function parseAmount(value) {

    value =
        value.trim();


    if (
        FRACTIONS[value] !== undefined
    ) {

        return FRACTIONS[value];

    }


    /*
     * Mixed number:
     *
     * 1 1/2
     */

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


    /*
     * Fraction:
     *
     * 1/2
     */

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


    if (
        Number.isFinite(number)
    ) {

        return number;

    }


    return null;

}


/* =========================================================
   FORMAT NUMBER
   ========================================================= */

function formatAmount(value) {

    if (
        !Number.isFinite(value)
    ) {
        return "";
    }


    /*
     * Common cooking fractions.
     */

    const fractions = [
        {
            value: 1 / 8,
            text: "⅛"
        },
        {
            value: 1 / 4,
            text: "¼"
        },
        {
            value: 1 / 3,
            text: "⅓"
        },
        {
            value: 3 / 8,
            text: "⅜"
        },
        {
            value: 1 / 2,
            text: "½"
        },
        {
            value: 5 / 8,
            text: "⅝"
        },
        {
            value: 2 / 3,
            text: "⅔"
        },
        {
            value: 3 / 4,
            text: "¾"
        },
        {
            value: 7 / 8,
            text: "⅞"
        }
    ];


    const whole =
        Math.floor(value);


    const decimal =
        value - whole;


    for (
        const fraction of fractions
    ) {

        if (
            Math.abs(
                decimal -
                fraction.value
            ) < 0.03
        ) {

            if (whole === 0) {

                return fraction.text;

            }


            return (
                whole +
                " " +
                fraction.text
            );

        }

    }


    /*
     * Round awkward calculator values.
     */

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


    if (
        value < 10
    ) {

        return String(
            Math.round(
                value * 100
            ) / 100
        );

    }


    return String(
        Math.round(value * 10) / 10
    );

}


/* =========================================================
   CALCULATE ONE INGREDIENT
   ========================================================= */

function calculateIngredient(
    ingredient,
    multiplier
) {

    if (
        !Number.isFinite(
            multiplier
        ) ||
        multiplier === 1
    ) {

        return ingredient;

    }


    /*
     * Handle mixed numbers and normal
     * fractions at the beginning of
     * the ingredient.
     */

    const unicodePattern =
        /^(\d+\s+)?(½|⅓|⅔|¼|¾|⅕|⅖|⅗|⅘|⅙|⅚|⅛|⅜|⅝|⅞)\b/;


    const unicodeMatch =
        ingredient.match(
            unicodePattern
        );


    if (unicodeMatch) {

        let amount = 0;


        if (
            unicodeMatch[1]
        ) {

            amount +=
                Number(
                    unicodeMatch[1]
                );

        }


        amount +=
            FRACTIONS[
                unicodeMatch[2]
            ];


        const newAmount =
            amount *
            multiplier;


        return (
            formatAmount(
                newAmount
            ) +
            ingredient.slice(
                unicodeMatch[0].length
            )
        );

    }


    /*
     * Normal number or fraction.
     */

    const numberPattern =
        /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\b/;


    const match =
        ingredient.match(
            numberPattern
        );


    if (!match) {

        return ingredient;

    }


    const amount =
        parseAmount(
            match[1]
        );


    if (amount === null) {

        return ingredient;

    }


    const newAmount =
        amount *
        multiplier;


    return (
        formatAmount(
            newAmount
        ) +
        ingredient.slice(
            match[0].length
        )
    );

}


/* =========================================================
   INITIALIZE
   ========================================================= */

window.mealmindPrivacy =
    "private";


hideScreens();


document
    .getElementById(
        "homeScreen"
    )
    ?.classList.remove(
        "hidden"
    );


console.log(
    "🍽️ MealMind recipe system loaded."
);
