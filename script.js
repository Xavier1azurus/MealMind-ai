/* =========================================================
   MEALMIND
   PRIVATE COOKBOOK
   ========================================================= */


/* =========================================================
   STORAGE
   ========================================================= */

const COOKBOOK_KEY =
    "mealmind_cookbook_v2";


const savedData =
    JSON.parse(
        localStorage.getItem(
            COOKBOOK_KEY
        ) || "null"
    );


let cookbook =
    savedData || null;


let unlocked =
    false;


let recipes =
    cookbook?.recipes || [];


let folders =
    cookbook?.folders || [
        "Sweet",
        "Savoury",
        "Fried",
        "International"
    ];


let editingRecipeId =
    null;


let selectedFolder =
    null;


let currentViewedRecipe =
    null;


let currentPage =
    1;


let pendingImage =
    null;


/* =========================================================
   ELEMENTS
   ========================================================= */

const setupScreen =
    document.getElementById(
        "setupScreen"
    );


const lockScreen =
    document.getElementById(
        "lockScreen"
    );


const mainScreen =
    document.getElementById(
        "mainScreen"
    );


const codeSetup =
    document.getElementById(
        "codeSetup"
    );


const cookbookSetup =
    document.getElementById(
        "cookbookSetup"
    );


const newCode =
    document.getElementById(
        "newCode"
    );


const confirmCode =
    document.getElementById(
        "confirmCode"
    );


const setupError =
    document.getElementById(
        "setupError"
    );


const cookbookName =
    document.getElementById(
        "cookbookName"
    );


const pageCount =
    document.getElementById(
        "pageCount"
    );


const continueSetup =
    document.getElementById(
        "continueSetup"
    );


const createCookbook =
    document.getElementById(
        "createCookbook"
    );


const lockedCookbookName =
    document.getElementById(
        "lockedCookbookName"
    );


const unlockCode =
    document.getElementById(
        "unlockCode"
    );


const unlockButton =
    document.getElementById(
        "unlockButton"
    );


const unlockError =
    document.getElementById(
        "unlockError"
    );


const mainCookbookName =
    document.getElementById(
        "mainCookbookName"
    );


const lockButton =
    document.getElementById(
        "lockButton"
    );


const cameraInput =
    document.getElementById(
        "cameraInput"
    );


const scanButton =
    document.getElementById(
        "scanButton"
    );


const scanStatus =
    document.getElementById(
        "scanStatus"
    );


const foldersElement =
    document.getElementById(
        "folders"
    );


const recipesElement =
    document.getElementById(
        "recipes"
    );


const recipeSectionTitle =
    document.getElementById(
        "recipeSectionTitle"
    );


const recipeSectionCount =
    document.getElementById(
        "recipeSectionCount"
    );


const searchInput =
    document.getElementById(
        "searchInput"
    );


/* Editor */

const editorModal =
    document.getElementById(
        "editorModal"
    );


const editorHeading =
    document.getElementById(
        "editorHeading"
    );


const closeEditor =
    document.getElementById(
        "closeEditor"
    );


const recipeTitle =
    document.getElementById(
        "recipeTitle"
    );


const recipeFolder =
    document.getElementById(
        "recipeFolder"
    );


const recipeCuisine =
    document.getElementById(
        "recipeCuisine"
    );


const recipeIngredients =
    document.getElementById(
        "recipeIngredients"
    );


const recipeInstructions =
    document.getElementById(
        "recipeInstructions"
    );


const recipeNotes =
    document.getElementById(
        "recipeNotes"
    );


const saveRecipeButton =
    document.getElementById(
        "saveRecipeButton"
    );


const editorError =
    document.getElementById(
        "editorError"
    );


/* Recipe viewer */

const recipeModal =
    document.getElementById(
        "recipeModal"
    );


const closeRecipe =
    document.getElementById(
        "closeRecipe"
    );


const viewTitle =
    document.getElementById(
        "viewTitle"
    );


const viewCuisine =
    document.getElementById(
        "viewCuisine"
    );


const viewIngredients =
    document.getElementById(
        "viewIngredients"
    );


const viewInstructions =
    document.getElementById(
        "viewInstructions"
    );


const viewNotes =
    document.getElementById(
        "viewNotes"
    );


const recipePage1 =
    document.getElementById(
        "recipePage1"
    );


const recipePage2 =
    document.getElementById(
        "recipePage2"
    );


const recipePage3 =
    document.getElementById(
        "recipePage3"
    );


const previousPage =
    document.getElementById(
        "previousPage"
    );


const nextPage =
    document.getElementById(
        "nextPage"
    );


const pageNumber =
    document.getElementById(
        "pageNumber"
    );


/* Folder */

const makeFolderButton =
    document.getElementById(
        "makeFolderButton"
    );


const editFolderButton =
    document.getElementById(
        "editFolderButton"
    );


const deleteFolderButton =
    document.getElementById(
        "deleteFolderButton"
    );


const folderModal =
    document.getElementById(
        "folderModal"
    );


const folderModalTitle =
    document.getElementById(
        "folderModalTitle"
    );


const folderNameInput =
    document.getElementById(
        "folderNameInput"
    );


const saveFolderButton =
    document.getElementById(
        "saveFolderButton"
    );


const closeFolderModal =
    document.getElementById(
        "closeFolderModal"
    );


const folderError =
    document.getElementById(
        "folderError"
    );


/* Recipe management */

const editRecipeButton =
    document.getElementById(
        "editRecipeButton"
    );


const deleteRecipeButton =
    document.getElementById(
        "deleteRecipeButton"
    );


const allRecipesButton =
    document.getElementById(
        "allRecipesButton"
    );


/* =========================================================
   SAVE COOKBOOK
   ========================================================= */

function saveCookbook() {

    cookbook.recipes =
        recipes;

    cookbook.folders =
        folders;

    localStorage.setItem(
        COOKBOOK_KEY,
        JSON.stringify(
            cookbook
        )
    );

}


/* =========================================================
   INITIAL SCREEN
   ========================================================= */

function showInitialScreen() {

    setupScreen.classList.add(
        "hidden"
    );

    lockScreen.classList.add(
        "hidden"
    );

    mainScreen.classList.add(
        "hidden"
    );


    if (!cookbook) {

        setupScreen.classList.remove(
            "hidden"
        );

    } else {

        lockedCookbookName.textContent =
            cookbook.name;

        lockScreen.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   CREATE CODE
   ========================================================= */

continueSetup.onclick =
    () => {

        const code =
            newCode.value;

        const confirmation =
            confirmCode.value;


        setupError.textContent =
            "";


        if (
            code.length < 4
        ) {

            setupError.textContent =
                "Your code must be at least 4 characters.";

            return;

        }


        if (
            code !==
            confirmation
        ) {

            setupError.textContent =
                "The codes do not match.";

            return;

        }


        codeSetup.classList.add(
            "hidden"
        );

        cookbookSetup.classList.remove(
            "hidden"
        );

    };


/* =========================================================
   CREATE COOKBOOK
   ========================================================= */

createCookbook.onclick =
    () => {

        const name =
            cookbookName.value.trim();


        if (!name) {

            setupError.textContent =
                "Please enter a cookbook name.";

            return;

        }


        const code =
            newCode.value;


        cookbook = {

            name,

            /*
             * This is not a server password.
             * It is a local cookbook lock.
             */

            code,

            pages:
                Number(
                    pageCount.value
                ),

            recipes: [],

            folders: [
                "Sweet",
                "Savoury",
                "Fried",
                "International"
            ]

        };


        recipes =
            cookbook.recipes;


        folders =
            cookbook.folders;


        saveCookbook();


        unlocked =
            true;


        showMain();

    };


/* =========================================================
   UNLOCK
   ========================================================= */

unlockButton.onclick =
    unlock;


unlockCode.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Enter"
        ) {

            unlock();

        }

    }
);


function unlock() {

    unlockError.textContent =
        "";


    if (
        unlockCode.value ===
        cookbook.code
    ) {

        unlocked =
            true;

        unlockCode.value =
            "";

        showMain();

    } else {

        unlockError.textContent =
            "Incorrect cookbook code.";

    }

}


/* =========================================================
   SHOW MAIN
   ========================================================= */

function showMain() {

    setupScreen.classList.add(
        "hidden"
    );

    lockScreen.classList.add(
        "hidden"
    );

    mainScreen.classList.remove(
        "hidden"
    );


    mainCookbookName.textContent =
        cookbook.name;


    render();

}


/* =========================================================
   LOCK
   ========================================================= */

lockButton.onclick =
    () => {

        unlocked =
            false;

        mainScreen.classList.add(
            "hidden"
        );

        lockedCookbookName.textContent =
            cookbook.name;

        lockScreen.classList.remove(
            "hidden"
        );

    };


/* =========================================================
   SCAN BUTTON
   ========================================================= */

scanButton.onclick =
    () => {

        cameraInput.click();

    };


/* =========================================================
   CAMERA INPUT
   ========================================================= */

cameraInput.addEventListener(
    "change",
    async () => {

        if (
            !cameraInput.files ||
            !cameraInput.files[0]
        ) {

            return;

        }


        pendingImage =
            cameraInput.files[0];


        await scanRecipe(
            pendingImage
        );

    }
);


/* =========================================================
   SCAN RECIPE
   ========================================================= */

async function scanRecipe(
    file
) {

    try {

        scanStatus.textContent =
            "📸 Preparing photo...";


        const image =
            await loadImage(
                file
            );


        const canvas =
            prepareImage(
                image
            );


        scanStatus.textContent =
            "🔎 Reading recipe...";


        const result =
            await Tesseract.recognize(
                canvas,
                "eng",
                {

                    logger:
                        data => {

                            if (
                                data.status ===
                                "recognizing text"
                            ) {

                                const percent =
                                    Math.round(
                                        data.progress *
                                        100
                                    );

                                scanStatus.textContent =
                                    `🔎 Reading recipe ${percent}%`;

                            }

                        }

                }
            );


        const text =
            cleanOCR(
                result.data.text
            );


        if (
            !text
        ) {

            scanStatus.textContent =
                "Couldn't read the recipe. Try a clearer photo.";

            return;

        }


        const parsed =
            parseRecipe(
                text
            );


        /*
         * IMPORTANT:
         *
         * We ONLY keep:
         * title
         * ingredients
         * instructions
         * notes
         *
         * Everything else from the OCR
         * is discarded.
         */


        openEditor({

            id: null,

            title:
                parsed.title,

            folder:
                autoFolder(
                    text
                ),

            cuisine:
                detectCuisine(
                    text
                ),

            ingredients:
                parsed.ingredients,

            instructions:
                parsed.instructions,

            notes:
                parsed.notes

        });


        scanStatus.textContent =
            "✅ Recipe organized.";

    } catch (
        error
    ) {

        console.error(
            error
        );

        scanStatus.textContent =
            "❌ Scanner error. Try another photo.";

    }

}


/* =========================================================
   LOAD IMAGE
   ========================================================= */

function loadImage(
    file
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const reader =
                new FileReader();


            reader.onload =
                event => {

                    const image =
                        new Image();


                    image.onload =
                        () => {

                            resolve(
                                image
                            );

                        };


                    image.onerror =
                        reject;


                    image.src =
                        event.target.result;

                };


            reader.onerror =
                reject;


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =========================================================
   PREPARE IMAGE
   ========================================================= */

function prepareImage(
    image
) {

    const maxWidth =
        2400;


    const maxHeight =
        3200;


    let width =
        image.width;


    let height =
        image.height;


    const scale =
        Math.min(
            1,
            maxWidth / width,
            maxHeight / height
        );


    width =
        Math.round(
            width * scale
        );


    height =
        Math.round(
            height * scale
        );


    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        width;


    canvas.height =
        height;


    const ctx =
        canvas.getContext(
            "2d"
        );


    ctx.drawImage(
        image,
        0,
        0,
        width,
        height
    );


    /*
     * Improve contrast for OCR.
     */

    const imageData =
        ctx.getImageData(
            0,
            0,
            width,
            height
        );


    const pixels =
        imageData.data;


    for (
        let i = 0;
        i < pixels.length;
        i += 4
    ) {

        const gray =
            (
                0.299 *
                pixels[i]
            ) +
            (
                0.587 *
                pixels[i + 1]
            ) +
            (
                0.114 *
                pixels[i + 2]
            );


        pixels[i] =
            gray;

        pixels[i + 1] =
            gray;

        pixels[i + 2] =
            gray;

    }


    ctx.putImageData(
        imageData,
        0,
        0
    );


    return canvas;

}


/* =========================================================
   CLEAN OCR
   ========================================================= */

function cleanOCR(
    text
) {

    return text
        .normalize(
            "NFKC"
        )
        .replace(
            /[^\S\r\n]+/g,
            " "
        )
        .replace(
            /[░▒▓█■□◆◇]+/g,
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
            /[–—−]/g,
            "-"
        )
        .split("\n")
        .map(
            line =>
                line.trim()
        )
        .filter(
            line =>
                line.length > 0
        )
        .join("\n");

}


/* =========================================================
   PARSE RECIPE
   ========================================================= */

function parseRecipe(
    text
) {

    const lines =
        text
            .split("\n")
            .map(
                line =>
                    line.trim()
            )
            .filter(Boolean);


    let section =
        "unknown";


    let title =
        "";


    const ingredients =
        [];


    const instructions =
        [];


    const notes =
        [];


    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        let line =
            lines[i];


        const lower =
            line.toLowerCase();


        /*
         * Detect headings.
         */

        if (
            /^(ingredients?|what you need|shopping list)\s*:?\s*$/i
                .test(line)
        ) {

            section =
                "ingredients";

            continue;

        }


        if (
            /^(instructions?|directions?|method|steps?|preparation)\s*:?\s*$/i
                .test(line)
        ) {

            section =
                "instructions";

            continue;

        }


        if (
            /^(notes?|tips?|chef'?s notes?)\s*:?\s*$/i
                .test(line)
        ) {

            section =
                "notes";

            continue;

        }


        /*
         * Detect likely title.
         *
         * We only use the first reasonable
         * short line before ingredients.
         */

        if (
            !title &&
            section === "unknown" &&
            line.length <= 80 &&
            !looksLikeIngredient(line) &&
            !looksLikeInstruction(line)
        ) {

            title =
                line;

            continue;

        }


        /*
         * Remove OCR bullets/numbers.
         */

        line =
            line
                .replace(
                    /^[•●▪◦*-]\s*/,
                    ""
                )
                .replace(
                    /^\d+\s*[.)-]\s*/,
                    ""
                )
                .trim();


        if (!line)
            continue;


        if (
            section ===
            "ingredients"
        ) {

            ingredients.push(
                line
            );

        }


        else if (
            section ===
            "instructions"
        ) {

            instructions.push(
                line
            );

        }


        else if (
            section ===
            "notes"
        ) {

            notes.push(
                line
            );

        }


        /*
         * If headings aren't present,
         * make an educated guess.
         */

        else {

            if (
                looksLikeIngredient(
                    line
                )
            ) {

                ingredients.push(
                    line
                );

            }

            else if (
                looksLikeInstruction(
                    line
                )
            ) {

                instructions.push(
                    line
                );

            }

        }

    }


    /*
     * If OCR didn't identify a title,
     * leave it blank.
     */

    return {

        title,

        ingredients:
            unique(
                ingredients
            ),

        instructions:
            unique(
                instructions
            ),

        notes:
            unique(
                notes
            ).join(
                " "
            )

    };

}


/* =========================================================
   INGREDIENT DETECTION
   ========================================================= */

function looksLikeIngredient(
    line
) {

    return (
        /\b(cup|cups|tbsp|tsp|tablespoon|tablespoons|teaspoon|teaspoons|gram|grams|kg|g|ml|l|oz|ounce|ounces|lb|lbs|pound|pounds|pinch|clove|cloves)\b/i
            .test(line)
        ||
        /\b(flour|sugar|salt|pepper|butter|oil|milk|egg|eggs|chicken|beef|pork|rice|pasta|cheese|onion|garlic|tomato|water|cream|vanilla|cocoa)\b/i
            .test(line)
    );

}


/* =========================================================
   INSTRUCTION DETECTION
   ========================================================= */

function looksLikeInstruction(
    line
) {

    return (
        /^(mix|add|cook|bake|boil|heat|stir|combine|place|put|remove|serve|chop|slice|cut|pour|whisk|preheat|blend|fry|simmer|let|allow|cover|uncover)\b/i
            .test(line)
    );

}


/* =========================================================
   AUTO FOLDER
   ========================================================= */

function autoFolder(
    text
) {

    const value =
        text.toLowerCase();


    const sweetWords = [
        "cake",
        "cookie",
        "cookies",
        "brownie",
        "chocolate",
        "cupcake",
        "muffin",
        "dessert",
        "frosting",
        "icing",
        "caramel",
        "pie",
        "pudding"
    ];


    const friedWords = [
        "fried",
        "frying",
        "deep fried",
        "deep-fried",
        "fritter",
        "tempura"
    ];


    const internationalWords = [
        "taco",
        "sushi",
        "ramen",
        "curry",
        "pizza",
        "lasagna",
        "burrito",
        "enchilada",
        "teriyaki",
        "pad thai",
        "quesadilla"
    ];


    if (
        containsAny(
            value,
            sweetWords
        )
    ) {

        return getFolder(
            "Sweet"
        );

    }


    if (
        containsAny(
            value,
            friedWords
        )
    ) {

        return getFolder(
            "Fried"
        );

    }


    if (
        containsAny(
            value,
            internationalWords
        )
    ) {

        return getFolder(
            "International"
        );

    }


    return getFolder(
        "Savoury"
    );

}


/* =========================================================
   CUISINE DETECTION
   ========================================================= */

function detectCuisine(
    text
) {

    const value =
        text.toLowerCase();


    if (
        value.includes(
            "italian"
        ) ||
        value.includes(
            "pasta"
        ) ||
        value.includes(
            "lasagna"
        )
    ) {

        return "Italian";

    }


    if (
        value.includes(
            "mexican"
        ) ||
        value.includes(
            "taco"
        ) ||
        value.includes(
            "burrito"
        )
    ) {

        return "Mexican";

    }


    if (
        value.includes(
            "japanese"
        ) ||
        value.includes(
            "sushi"
        ) ||
        value.includes(
            "ramen"
        )
    ) {

        return "Japanese";

    }


    if (
        value.includes(
            "indian"
        ) ||
        value.includes(
            "curry"
        )
    ) {

        return "Indian";

    }


    return "General";

}


/* =========================================================
   HELPERS
   ========================================================= */

function containsAny(
    text,
    words
) {

    return words.some(
        word =>
            text.includes(
                word
            )
    );

}


function getFolder(
    name
) {

    if (
        folders.includes(
            name
        )
    ) {

        return name;

    }


    return folders[0];

}


function unique(
    array
) {

    return [
        ...new Set(
            array
                .map(
                    item =>
                        item.trim()
                )
                .filter(Boolean)
        )
    ];

}


/* =========================================================
   OPEN EDITOR
   ========================================================= */

function openEditor(
    recipe
) {

    editingRecipeId =
        recipe.id || null;


    editorHeading.textContent =
        recipe.id
            ? "✏️ Edit Recipe"
            : "📖 Recipe";


    recipeTitle.value =
        recipe.title || "";


    recipeCuisine.value =
        recipe.cuisine ||
        "General";


    recipeIngredients.value =
        (
            recipe.ingredients ||
            []
        ).join(
            "\n"
        );


    recipeInstructions.value =
        (
            recipe.instructions ||
            []
        ).join(
            "\n"
        );


    recipeNotes.value =
        recipe.notes ||
        "";


    fillFolderSelect(
        recipe.folder
    );


    editorModal.classList.remove(
        "hidden"
    );

}


/* =========================================================
   FOLDER SELECT
   ========================================================= */

function fillFolderSelect(
    selected
) {

    recipeFolder.innerHTML =
        "";


    folders.forEach(
        folder => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                folder;


            option.textContent =
                folder;


            recipeFolder.appendChild(
                option
            );

        }
    );


    recipeFolder.value =
        selected ||
        folders[0];

}


/* =========================================================
   CLOSE EDITOR
   ========================================================= */

closeEditor.onclick =
    () => {

        editorModal.classList.add(
            "hidden"
        );

    };


/* =========================================================
   SAVE RECIPE
   ========================================================= */

saveRecipeButton.onclick =
    () => {

        editorError.textContent =
            "";


        const title =
            recipeTitle.value.trim();


        const ingredients =
            recipeIngredients.value
                .split("\n")
                .map(
                    item =>
                        item.trim()
                )
                .filter(Boolean);


        const instructions =
            recipeInstructions.value
                .split("\n")
                .map(
                    item =>
                        item.trim()
                )
                .filter(Boolean);


        if (
            !title
        ) {

            editorError.textContent =
                "Please enter a recipe title.";

            return;

        }


        if (
            !ingredients.length
        ) {

            editorError.textContent =
                "Please add at least one ingredient.";

            return;

        }


        if (
            !instructions.length
        ) {

            editorError.textContent =
                "Please add the instructions.";

            return;

        }


        const recipe = {

            id:
                editingRecipeId ||
                Date.now(),

            title,

            folder:
                recipeFolder.value,

            cuisine:
                recipeCuisine.value.trim() ||
                "General",

            ingredients,

            instructions,

            notes:
                recipeNotes.value.trim()

        };


        const index =
            recipes.findIndex(
                item =>
                    item.id ===
                    editingRecipeId
            );


        if (
            index === -1
        ) {

            recipes.push(
                recipe
            );

        } else {

            recipes[index] =
                recipe;

        }


        saveCookbook();


        editorModal.classList.add(
            "hidden"
        );


        render();

    };


/* =========================================================
   RENDER
   ========================================================= */

function render() {

    renderFolders();

    renderRecipes();

}


/* =========================================================
   RENDER FOLDERS
   ========================================================= */

function renderFolders() {

    foldersElement.innerHTML =
        "";


    folders.forEach(
        folder => {

            const count =
                recipes.filter(
                    recipe =>
                        recipe.folder ===
                        folder
                ).length;


            const card =
                document.createElement(
                    "button"
                );


            card.className =
                "folder-card";


            card.innerHTML = `
                <div class="folder-icon">
                    📁
                </div>

                <div class="folder-name">
                    ${escapeHTML(folder)}
                </div>

                <div class="folder-count">
                    ${count}
                    ${count === 1
                        ? "recipe"
                        : "recipes"}
                </div>
            `;


            card.onclick =
                () => {

                    selectedFolder =
                        folder;


                    recipeSectionTitle.textContent =
                        "📁 " +
                        folder;


                    renderRecipes();

                };


            foldersElement.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   RENDER RECIPES
   ========================================================= */

function renderRecipes() {

    recipesElement.innerHTML =
        "";


    let list =
        recipes;


    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    if (
        selectedFolder
    ) {

        list =
            list.filter(
                recipe =>
                    recipe.folder ===
                    selectedFolder
            );

    }


    if (
        search
    ) {

        list =
            list.filter(
                recipe =>

                    recipe.title
                        .toLowerCase()
                        .includes(
                            search
                        )

                    ||

                    recipe.ingredients
                        .join(" ")
                        .toLowerCase()
                        .includes(
                            search
                        )

            );

    }


    recipeSectionCount.textContent =
        `${list.length} ${
            list.length === 1
                ? "recipe"
                : "recipes"
        }`;


    if (
        !list.length
    ) {

        recipesElement.innerHTML = `
            <div class="recipe-card">
                <p>
                    No recipes here yet.
                </p>
            </div>
        `;

        return;

    }


    list.forEach(
        recipe => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "recipe-card";


            card.innerHTML = `
                <h3>
                    ${escapeHTML(
                        recipe.title
                    )}
                </h3>

                <div class="recipe-meta">
                    ${escapeHTML(
                        recipe.cuisine ||
                        "General"
                    )}
                    ·
                    ${escapeHTML(
                        recipe.folder
                    )}
                </div>
            `;


            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "recipe-open";


            button.textContent =
                "Open Recipe";


            button.onclick =
                () => {

                    openRecipe(
                        recipe
                    );

                };


            card.appendChild(
                button
            );


            recipesElement.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   SEARCH
   ========================================================= */

searchInput.addEventListener(
    "input",
    renderRecipes
);


/* =========================================================
   ALL RECIPES
   ========================================================= */

allRecipesButton.onclick =
    () => {

        selectedFolder =
            null;


        recipeSectionTitle.textContent =
            "📖 All Recipes";


        renderRecipes();

    };


/* =========================================================
   OPEN RECIPE
   ========================================================= */

function openRecipe(
    recipe
) {

    currentViewedRecipe =
        recipe;


    currentPage =
        1;


    viewTitle.textContent =
        recipe.title;


    viewCuisine.textContent =
        `${recipe.cuisine || "General"} · ${recipe.folder}`;


    viewIngredients.innerHTML =
        "";


    recipe.ingredients.forEach(
        ingredient => {

            const li =
                document.createElement(
                    "li"
                );


            li.textContent =
                ingredient;


            viewIngredients.appendChild(
                li
            );

        }
    );


    viewInstructions.innerHTML =
        "";


    recipe.instructions.forEach(
        instruction => {

            const li =
                document.createElement(
                    "li"
                );


            li.textContent =
                instruction;


            viewInstructions.appendChild(
                li
            );

        }
    );


    viewNotes.textContent =
        recipe.notes ||
        "No notes added.";


    recipeModal.classList.remove(
        "hidden"
    );


    updateRecipePage();

}


/* =========================================================
   RECIPE PAGES
   ========================================================= */

function updateRecipePage() {

    const total =
        Number(
            cookbook.pages
        );


    recipePage1.classList.add(
        "hidden"
    );


    recipePage2.classList.add(
        "hidden"
    );


    recipePage3.classList.add(
        "hidden"
    );


    /*
     * Page 1 = What You Need
     * Page 2 = Instructions
     * Page 3 = Notes
     */

    if (
        currentPage === 1
    ) {

        recipePage1.classList.remove(
            "hidden"
        );

    }


    if (
        currentPage === 2
    ) {

        recipePage2.classList.remove(
            "hidden"
        );

    }


    if (
        currentPage >= 3
    ) {

        recipePage3.classList.remove(
            "hidden"
        );

    }


    pageNumber.textContent =
        `Page ${currentPage} of ${total}`;


    previousPage.disabled =
        currentPage <= 1;


    nextPage.disabled =
        currentPage >= total;

}


/* =========================================================
   NEXT PAGE
   ========================================================= */

nextPage.onclick =
    () => {

        const total =
            Number(
                cookbook.pages
            );


        if (
            currentPage <
            total
        ) {

            currentPage++;

            updateRecipePage();

        }

    };


/* =========================================================
   PREVIOUS PAGE
   ========================================================= */

previousPage.onclick =
    () => {

        if (
            currentPage >
            1
        ) {

            currentPage--;

            updateRecipePage();

        }

    };


/* =========================================================
   CLOSE RECIPE
   ========================================================= */

closeRecipe.onclick =
    () => {

        recipeModal.classList.add(
            "hidden"
        );

    };


/* =========================================================
   EDIT RECIPE
   ========================================================= */

editRecipeButton.onclick =
    () => {

        if (
            !recipes.length
        ) {

            alert(
                "You don't have any recipes yet."
            );

            return;

        }


        const choices =
            recipes
                .map(
                    (
                        recipe,
                        index
                    ) =>
                        `${index + 1}. ${recipe.title}`
                )
                .join(
                    "\n"
                );


        const answer =
            prompt(
                choices +
                "\n\nEnter the recipe number to edit:"
            );


        const index =
            Number(
                answer
            ) - 1;


        if (
            !recipes[index]
        )
            return;


        openEditor(
            recipes[index]
        );

    };


/* =========================================================
   DELETE RECIPE
   ========================================================= */

deleteRecipeButton.onclick =
    () => {

        if (
            !recipes.length
        ) {

            alert(
                "You don't have any recipes."
            );

            return;

        }


        const choices =
            recipes
                .map(
                    (
                        recipe,
                        index
                    ) =>
                        `${index + 1}. ${recipe.title}`
                )
                .join(
                    "\n"
                );


        const answer =
            prompt(
                choices +
                "\n\nEnter the recipe number to delete:"
            );


        const index =
            Number(
                answer
            ) - 1;


        if (
            !recipes[index]
        )
            return;


        const confirmed =
            confirm(
                `Delete "${recipes[index].title}"?`
            );


        if (
            !confirmed
        )
            return;


        recipes.splice(
            index,
            1
        );


        saveCookbook();


        render();

    };


/* =========================================================
   MAKE FOLDER
   ========================================================= */

makeFolderButton.onclick =
    () => {

        folderModalTitle.textContent =
            "➕ Make Folder";


        folderNameInput.value =
            "";


        folderError.textContent =
            "";


        folderModal.classList.remove(
            "hidden"
        );


        folderNameInput.focus();

    };


/* =========================================================
   EDIT FOLDER
   ========================================================= */

editFolderButton.onclick =
    () => {

        if (
            !folders.length
        )
            return;


        const oldName =
            prompt(
                "Enter the folder name you want to edit:\n\n" +
                folders.join(
                    "\n"
                )
            );


        if (
            !oldName ||
            !folders.includes(
                oldName
            )
        )
            return;


        const newName =
            prompt(
                "Enter the new folder name:"
            );


        if (
            !newName
        )
            return;


        if (
            folders.includes(
                newName
            )
        ) {

            alert(
                "That folder already exists."
            );

            return;

        }


        const index =
            folders.indexOf(
                oldName
            );


        folders[index] =
            newName;


        recipes =
            recipes.map(
                recipe => {

                    if (
                        recipe.folder ===
                        oldName
                    ) {

                        recipe.folder =
                            newName;

                    }

                    return recipe;

                }
            );


        saveCookbook();


        render();

    };


/* =========================================================
   DELETE FOLDER
   ========================================================= */

deleteFolderButton.onclick =
    () => {

        if (
            folders.length <= 1
        ) {

            alert(
                "You need at least one folder."
            );

            return;

        }


        const name =
            prompt(
                "Enter the folder you want to delete:\n\n" +
                folders.join(
                    "\n"
                )
            );


        if (
            !name ||
            !folders.includes(
                name
            )
        )
            return;


        const confirmed =
            confirm(
                `Delete "${name}"? Recipes inside it will be moved to the first remaining folder.`
            );


        if (
            !confirmed
        )
            return;


        folders =
            folders.filter(
                folder =>
                    folder !==
                    name
            );


        const replacement =
            folders[0];


        recipes =
            recipes.map(
                recipe => {

                    if (
                        recipe.folder ===
                        name
                    ) {

                        recipe.folder =
                            replacement;

                    }

                    return recipe;

                }
            );


        selectedFolder =
            null;


        saveCookbook();


        render();

    };


/* =========================================================
   FOLDER MODAL SAVE
   ========================================================= */

saveFolderButton.onclick =
    () => {

        const name =
            folderNameInput.value.trim();


        folderError.textContent =
            "";


        if (
            !name
        ) {

            folderError.textContent =
                "Enter a folder name.";

            return;

        }


        if (
            folders.includes(
                name
            )
        ) {

            folderError.textContent =
                "That folder already exists.";

            return;

        }


        folders.push(
            name
        );


        saveCookbook();


        folderModal.classList.add(
            "hidden"
        );


        render();

    };


/* =========================================================
   CLOSE FOLDER MODAL
   ========================================================= */

closeFolderModal.onclick =
    () => {

        folderModal.classList.add(
            "hidden"
        );

    };


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
    value
) {

    return String(
        value
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
   START
   ========================================================= */

showInitialScreen();
