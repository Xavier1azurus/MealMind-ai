"use strict";

/* =========================================================
   MEALMIND
   RECIPE SCANNER + COOKBOOK SYSTEM
   =========================================================

   IMPORTANT:
   - Scanned title is ALWAYS EMPTY.
   - Ingredients go ONLY into Ingredients.
   - Instructions go ONLY into Instructions.
   - Notes go ONLY into Notes.
   - OCR headings are removed.
   - Random OCR text is filtered when possible.
   ========================================================= */


/* =========================================================
   STORAGE
   ========================================================= */

const STORAGE_KEY = "mealmind_v5";

let data = loadData();

let currentBook = null;
let currentFolder = null;

let editingRecipeId = null;
let pendingRecipe = null;

let viewedRecipe = null;
let viewedPage = 1;

let selectedPrivacy = "private";


function loadData() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return {
                books: []
            };
        }

        const parsed =
            JSON.parse(saved);

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
            "MealMind storage error:",
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
            "Could not save MealMind:",
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
            .substring(2, 9)
    );

}


/* =========================================================
   SAFE HTML
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

            element.classList.add(
                "hidden"
            );

        }

    });


    const main =
        document.getElementById(
            "mainScreen"
        );

    if (main) {

        main.classList.add(
            "hidden"
        );

    }

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


/* =========================================================
   HOME
   ========================================================= */

document
    .getElementById("makeCookbookButton")
    ?.addEventListener(
        "click",
        () => {

            showScreen("makeScreen");

        }
    );


document
    .getElementById("joinCookbookButton")
    ?.addEventListener(
        "click",
        () => {

            showScreen("joinScreen");

        }
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

    hideScreens();

    document
        .getElementById("homeScreen")
        ?.classList.remove(
            "hidden"
        );

}


/* =========================================================
   PRIVACY
   ========================================================= */

document
    .getElementById("privateButton")
    ?.addEventListener(
        "click",
        () => {

            selectedPrivacy =
                "private";

            document
                .getElementById(
                    "privateButton"
                )
                ?.classList.add(
                    "selected"
                );

            document
                .getElementById(
                    "publicButton"
                )
                ?.classList.remove(
                    "selected"
                );

        }
    );


document
    .getElementById("publicButton")
    ?.addEventListener(
        "click",
        () => {

            selectedPrivacy =
                "public";

            document
                .getElementById(
                    "publicButton"
                )
                ?.classList.add(
                    "selected"
                );

            document
                .getElementById(
                    "privateButton"
                )
                ?.classList.remove(
                    "selected"
                );

        }
    );


/* =========================================================
   PASSWORD VISIBILITY
   ========================================================= */

document
    .getElementById("showPasswordButton")
    ?.addEventListener(
        "click",
        () => {

            togglePassword(
                "cookbookPassword"
            );

        }
    );


document
    .getElementById("showJoinPassword")
    ?.addEventListener(
        "click",
        () => {

            togglePassword(
                "joinPassword"
            );

        }
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
    .getElementById(
        "createCookbookButton"
    )
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
            selectedPrivacy,

        password: password,

        folders: [
            "Sweet",
            "Savoury",
            "Fried",
            "International"
        ],

        recipes: []

    };


    data.books.push(
        currentBook
    );

    saveData();

    openBook();

}


/* =========================================================
   JOIN
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


    if (
        book.password !==
        password
    ) {

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
                book.privacy ===
                "public"
        );


    if (!books.length) {

        list.innerHTML =
            `
            <p>
                No public cookbooks yet.
            </p>
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

                currentBook =
                    book;

                openBook();

            }
        );


        list.appendChild(
            button
        );

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


    const name =
        document.getElementById(
            "mainBookName"
        );


    if (name) {

        name.textContent =
            currentBook.name;

    }


    const badge =
        document.getElementById(
            "privacyBadge"
        );


    if (badge) {

        badge.textContent =
            currentBook.privacy ===
            "public"

                ? "🌐 Public"

                : "🔒 Private";

    }


    currentFolder = null;


    const search =
        document.getElementById(
            "searchInput"
        );


    if (search) {

        search.value = "";

    }


    render();

}


/* =========================================================
   EXIT
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
   SCANNER BUTTON
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


/* =========================================================
   CAMERA INPUT
   ========================================================= */

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


            if (!recipe) {

                return;

            }


            pendingRecipe =
                recipe;


            setScanStatus(
                "✅ Recipe scanned!"
            );


            const modal =
                document.getElementById(
                    "pageCountModal"
                );


            if (modal) {

                modal.classList.remove(
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


/* =========================================================
   SCAN STATUS
   ========================================================= */

function setScanStatus(message) {

    const status =
        document.getElementById(
            "scanStatus"
        );


    if (status) {

        status.textContent =
            message;

    }

}


/* =========================================================
   RECIPE SCANNER
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


        const rawText =
            result?.data?.text ||
            "";


        if (!rawText.trim()) {

            throw new Error(
                "No text found."
            );

        }


        return parseRecipe(
            rawText
        );


    } catch (error) {

        console.error(
            "Scanner error:",
            error
        );


        setScanStatus(
            "❌ Could not read recipe."
        );


        alert(
            "MealMind couldn't read that recipe clearly. Try a brighter, straighter photo."
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
   SECTION HEADINGS
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
    "tips",
    "tip",
    "chef's notes",
    "chefs notes"
];


function headingName(line) {

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
        headingName(line);


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
            .map(line =>
                cleanOCRLine(line)
            )
            .filter(Boolean);


    const ingredients = [];

    const instructions = [];

    const notes = [];


    let section =
        "unknown";


    /*
     * VERY IMPORTANT:
     *
     * title is deliberately blank.
     *
     * MealMind does NOT use the first line
     * as the recipe title.
     */

    const title = "";


    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        const line =
            lines[i];


        const detected =
            detectSection(line);


        if (detected) {

            section =
                detected;

            continue;

        }


        /*
         * Remove common page headings.
         */

        if (
            isUnwantedOCRLine(line)
        ) {

            continue;

        }


        if (
            section ===
            "ingredients"
        ) {

            if (
                looksLikeIngredient(
                    line
                )
            ) {

                ingredients.push(
                    cleanIngredient(
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

            if (
                looksLikeInstruction(
                    line
                )
            ) {

                instructions.push(
                    cleanInstruction(
                        line
                    )
                );

            } else if (
                line.length > 25 &&
                !looksLikeIngredient(line)
            ) {

                instructions.push(
                    cleanInstruction(
                        line
                    )
                );

            }

            continue;

        }


        if (
            section ===
            "notes"
        ) {

            notes.push(
                cleanNote(line)
            );

            continue;

        }

    }


    /*
     * If headings weren't detected,
     * use a second-pass classifier.
     */

    if (
        ingredients.length === 0 &&
        instructions.length === 0
    ) {

        const guessed =
            guessSections(
                lines
            );


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
         * NEVER automatically fill title.
         */

        title: "",

        cuisine: "",

        folder:
            currentBook?.folders?.[0] ||
            "Sweet",

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
   OCR LINE CLEANING
   ========================================================= */

function cleanOCRLine(line) {

    return line

        .replace(
            /^[•●▪◦·]+/g,
            ""
        )

        .replace(
            /^\s+/,
            ""
        )

        .replace(
            /\s+$/,
            ""
        )

        .replace(
            /\s{2,}/g,
            " "
        )

        .trim();

}


/* =========================================================
   REMOVE BAD OCR
   ========================================================= */

function isUnwantedOCRLine(line) {

    const lower =
        line.toLowerCase();


    if (
        line.length < 2
    ) {

        return true;

    }


    /*
     * Lines made almost completely from
     * symbols are usually OCR garbage.
     */

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


    /*
     * Common website/photo leftovers.
     */

    const unwanted = [
        "www.",
        "http://",
        "https://",
        "instagram",
        "facebook",
        "pinterest",
        "copyright",
        "©"
    ];


    if (
        unwanted.some(
            word =>
                lower.includes(word)
        )
    ) {

        return true;

    }


    return false;

}


/* =========================================================
   INGREDIENT DETECTION
   ========================================================= */

function looksLikeIngredient(line) {

    const lower =
        line.toLowerCase();


    /*
     * Measurements.
     */

    const measurement =
        /(^|\s)(\d+([\/.]\d+)?|\d+\s+\d+\/\d+|½|⅓|⅔|¼|¾|⅛|⅜|⅝|⅞)\s*(cups?|cup|tbsp|tbs|tablespoons?|tsp|teaspoons?|oz|ounces?|lb|lbs|pounds?|g|grams?|kg|ml|milliliters?|l|liters?|pinch|dash)\b/i;


    if (
        measurement.test(line)
    ) {

        return true;

    }


    /*
     * Fractions and amounts without
     * a measurement word.
     */

    if (
        /^\s*(\d+\/\d+|½|⅓|⅔|¼|¾|⅛|⅜|⅝|⅞)\s+/.test(
            line
        )
    ) {

        return true;

    }


    /*
     * Common ingredients.
     */

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
        "bake",
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

function guessSections(lines) {

    const ingredients = [];

    const instructions = [];


    let ingredientMode =
        false;


    for (
        const line of lines
    ) {

        if (
            isUnwantedOCRLine(line)
        ) {

            continue;

        }


        if (
            looksLikeIngredient(line)
        ) {

            ingredientMode =
                true;


            ingredients.push(
                cleanIngredient(line)
            );


            continue;

        }


        if (
            ingredientMode &&
            looksLikeInstruction(line)
        ) {

            instructions.push(
                cleanInstruction(line)
            );


            continue;

        }


        if (
            ingredientMode &&
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

    const seen =
        new Set();

    const output = [];


    for (
        const line of lines
    ) {

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


        if (
            seen.has(key)
        ) {

            continue;

        }


        seen.add(key);

        output.push(
            cleaned
        );

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

                if (
                    !pendingRecipe
                ) {

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
   EDIT RECIPE
   ========================================================= */

function openEditor(recipe) {

    editingRecipeId =
        recipe.id || null;


    const title =
        document.getElementById(
            "recipeTitleInput"
        );


    /*
     * Scanned title remains blank.
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


    /*
     * Title MUST be entered manually.
     */

    if (!title) {

        if (error) {

            error.textContent =
                "Please enter a recipe title.";

        }

        return;

    }


    if (error) {

        error.textContent = "";

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
   SAVE CURRENT BOOK
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
   RENDER
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


    if (!container) {
        return;
    }


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
   RECIPES
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
                <p>
                    No recipes here yet.
                </p>
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
                        } ingredients
                    </span>

                </div>
            `;


            card.addEventListener(
                "click",
                () => {

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
   SEARCH
   ========================================================= */

document
    .getElementById(
        "searchInput"
    )
    ?.addEventListener(
        "input",
        () => {

            /*
             * Re-render the recipe area
             * without destroying the cookbook.
             */

            renderRecipes();

        }
    );


/* =========================================================
   INITIALIZE
   ========================================================= */

hideScreens();

document
    .getElementById(
        "homeScreen"
    )
    ?.classList.remove(
        "hidden"
    );
