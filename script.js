/* =========================================================
   MEALMIND
   RECIPE SCANNER
   ========================================================= */

const OWNER_CODE = "1591";

const RECIPES_KEY = "mealmind_recipes";
const FOLDERS_KEY = "mealmind_folders";
const CUISINES_KEY = "mealmind_cuisines";

let recipes = JSON.parse(
    localStorage.getItem(RECIPES_KEY) || "[]"
);

let folders = JSON.parse(
    localStorage.getItem(FOLDERS_KEY) ||
    JSON.stringify([
        "Sweet",
        "Savoury",
        "Fried",
        "International"
    ])
);

let cuisines = JSON.parse(
    localStorage.getItem(CUISINES_KEY) ||
    JSON.stringify([
        "General"
    ])
);

let pendingImage = null;
let ownerScanning = false;
let editingRecipeId = null;
let selectedFolder = null;


/* =========================================================
   ELEMENTS
   ========================================================= */

const scanBtn =
    document.getElementById("scanBtn");

const recipeImage =
    document.getElementById("recipeImage");

const recipeText =
    document.getElementById("recipeText");

const scanStatus =
    document.getElementById("scanStatus");

const saveMainRecipe =
    document.getElementById("saveMainRecipe");

const photoCheck =
    document.getElementById("photoCheck");

const usePhoto =
    document.getElementById("usePhoto");

const retakePhoto =
    document.getElementById("retakePhoto");

const reviewBox =
    document.getElementById("reviewBox");

const reviewText =
    document.getElementById("reviewText");

const acceptRecipe =
    document.getElementById("acceptRecipe");

const reviewRetake =
    document.getElementById("reviewRetake");

const ownerLogin =
    document.getElementById("ownerLogin");

const ownerPassword =
    document.getElementById("ownerPassword");

const ownerLoginBtn =
    document.getElementById("ownerLoginBtn");

const ownerError =
    document.getElementById("ownerError");

const ownerPanel =
    document.getElementById("ownerPanel");

const exitOwner =
    document.getElementById("exitOwner");

const ownerScan =
    document.getElementById("ownerScan");

const ownerImage =
    document.getElementById("ownerImage");

const addRecipe =
    document.getElementById("addRecipe");

const editRecipe =
    document.getElementById("editRecipe");

const deleteRecipe =
    document.getElementById("deleteRecipe");

const addFolder =
    document.getElementById("addFolder");

const deleteFolder =
    document.getElementById("deleteFolder");

const addCuisine =
    document.getElementById("addCuisine");

const deleteCuisine =
    document.getElementById("deleteCuisine");

const foldersElement =
    document.getElementById("folders");

const recipesElement =
    document.getElementById("recipes");

const currentFolder =
    document.getElementById("currentFolder");

const allRecipes =
    document.getElementById("allRecipes");

const editor =
    document.getElementById("editor");

const editorTitle =
    document.getElementById("editorTitle");

const recipeTitle =
    document.getElementById("recipeTitle");

const recipeCuisine =
    document.getElementById("recipeCuisine");

const recipeFolder =
    document.getElementById("recipeFolder");

const ingredients =
    document.getElementById("ingredients");

const instructions =
    document.getElementById("instructions");

const recipeNotes =
    document.getElementById("recipeNotes");

const saveEditor =
    document.getElementById("saveEditor");

const cancelEditor =
    document.getElementById("cancelEditor");

const editorError =
    document.getElementById("editorError");

const recipeView =
    document.getElementById("recipeView");

const closeRecipe =
    document.getElementById("closeRecipe");

const viewTitle =
    document.getElementById("viewTitle");

const viewCategory =
    document.getElementById("viewCategory");

const viewIngredients =
    document.getElementById("viewIngredients");

const viewInstructions =
    document.getElementById("viewInstructions");

const viewNotes =
    document.getElementById("viewNotes");

const manager =
    document.getElementById("manager");

const managerTitle =
    document.getElementById("managerTitle");

const managerDescription =
    document.getElementById(
        "managerDescription"
    );

const managerInput =
    document.getElementById(
        "managerInput"
    );

const managerSelect =
    document.getElementById(
        "managerSelect"
    );

const managerError =
    document.getElementById(
        "managerError"
    );

const managerConfirm =
    document.getElementById(
        "managerConfirm"
    );

const managerCancel =
    document.getElementById(
        "managerCancel"
    );


/* =========================================================
   STORAGE
   ========================================================= */

function saveData() {

    localStorage.setItem(
        RECIPES_KEY,
        JSON.stringify(recipes)
    );

    localStorage.setItem(
        FOLDERS_KEY,
        JSON.stringify(folders)
    );

    localStorage.setItem(
        CUISINES_KEY,
        JSON.stringify(cuisines)
    );
}


/* =========================================================
   SCANNER BUTTON
   ========================================================= */

if (scanBtn) {

    scanBtn.addEventListener(
        "click",
        () => {

            ownerScanning = false;

            if (recipeImage) {
                recipeImage.click();
            }

        }
    );

}


if (ownerScan) {

    ownerScan.addEventListener(
        "click",
        () => {

            ownerScanning = true;

            if (ownerImage) {
                ownerImage.click();
            }

        }
    );

}


/* =========================================================
   PHOTO SELECTED
   ========================================================= */

if (recipeImage) {

    recipeImage.addEventListener(
        "change",
        () => {

            if (
                !recipeImage.files ||
                !recipeImage.files[0]
            ) {
                return;
            }

            pendingImage =
                recipeImage.files[0];

            if (photoCheck) {

                photoCheck.classList.remove(
                    "hidden"
                );

            }

        }
    );

}


if (ownerImage) {

    ownerImage.addEventListener(
        "change",
        () => {

            if (
                !ownerImage.files ||
                !ownerImage.files[0]
            ) {
                return;
            }

            pendingImage =
                ownerImage.files[0];

            if (photoCheck) {

                photoCheck.classList.remove(
                    "hidden"
                );

            }

        }
    );

}


/* =========================================================
   RETAKE
   ========================================================= */

if (retakePhoto) {

    retakePhoto.onclick =
        () => {

            if (photoCheck) {

                photoCheck.classList.add(
                    "hidden"
                );

            }

            if (ownerScanning) {

                ownerImage?.click();

            } else {

                recipeImage?.click();

            }

        };

}


/* =========================================================
   USE PHOTO
   ========================================================= */

if (usePhoto) {

    usePhoto.onclick =
        async () => {

            if (photoCheck) {

                photoCheck.classList.add(
                    "hidden"
                );

            }

            await scanRecipe();

        };

}


/* =========================================================
   SCAN RECIPE
   ========================================================= */

async function scanRecipe() {

    if (!pendingImage) {

        setStatus(
            "Please choose a photo first."
        );

        return;

    }

    try {

        setStatus(
            "📸 Preparing image..."
        );

        const image =
            await loadImage(
                pendingImage
            );

        const canvas =
            prepareImage(
                image
            );

        setStatus(
            "🔎 Reading recipe..."
        );

        const result =
            await Tesseract.recognize(
                canvas,
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
                                        message.progress *
                                        100
                                    );

                                setStatus(
                                    `🔎 Reading recipe ${percent}%`
                                );

                            }

                        }
                }
            );

        const text =
            cleanText(
                result.data.text
            );

        if (!text) {

            setStatus(
                "❌ I couldn't read the recipe. Try a clearer photo."
            );

            return;

        }

        const parsed =
            parseRecipe(
                text
            );

        /*
         * THIS IS THE IMPORTANT PART:
         *
         * We put the ingredients,
         * instructions and notes
         * into their actual fields.
         */

        openEditor({
            id: null,

            title: "",

            cuisine:
                "General",

            folder:
                autoSort(
                    text
                ),

            ingredients:
                parsed.ingredients,

            instructions:
                parsed.instructions,

            notes:
                parsed.notes

        });

        setStatus(
            "✅ Recipe organized!"
        );

    } catch (error) {

        console.error(
            error
        );

        setStatus(
            "❌ Something went wrong while reading the recipe."
        );

    }

}


/* =========================================================
   LOAD IMAGE
   ========================================================= */

function loadImage(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();

            reader.onload =
                event => {

                    const image =
                        new Image();

                    image.onload =
                        () => resolve(
                            image
                        );

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
        2200;

    const maxHeight =
        3000;

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

    const imageData =
        ctx.getImageData(
            0,
            0,
            width,
            height
        );

    const data =
        imageData.data;

    for (
        let i = 0;
        i < data.length;
        i += 4
    ) {

        let gray =
            0.299 * data[i] +
            0.587 * data[i + 1] +
            0.114 * data[i + 2];

        gray =
            (gray - 128) *
            1.4 +
            128;

        gray =
            Math.max(
                0,
                Math.min(
                    255,
                    gray
                )
            );

        data[i] =
            gray;

        data[i + 1] =
            gray;

        data[i + 2] =
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

function cleanText(
    text
) {

    return text
        .normalize(
            "NFKC"
        )
        .replace(
            /[\u0000-\u001F\u007F]/g,
            ""
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
                line
                    .replace(
                        /\s+/g,
                        " "
                    )
                    .trim()
        )
        .filter(
            line =>
                line.length > 0
        )
        .join("\n");

}


/* =========================================================
   RECIPE PARSER
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

    const ingredientLines = [];
    const instructionLines = [];
    const noteLines = [];

    for (
        let line of lines
    ) {

        const lower =
            line.toLowerCase();

        /*
         * Section headings
         */

        if (
            /^(ingredients?|what you need)\s*:?\s*$/i
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
         * Remove common OCR numbering
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


        /*
         * Put text into the correct section.
         */

        if (
            section ===
            "ingredients"
        ) {

            ingredientLines.push(
                line
            );

        } else if (
            section ===
            "instructions"
        ) {

            instructionLines.push(
                line
            );

        } else if (
            section ===
            "notes"
        ) {

            noteLines.push(
                line
            );

        } else {

            /*
             * If the recipe doesn't have
             * headings, intelligently guess.
             */

            if (
                looksLikeIngredient(
                    line
                )
            ) {

                ingredientLines.push(
                    line
                );

            } else {

                instructionLines.push(
                    line
                );

            }

        }

    }

    return {

        ingredients:
            unique(
                ingredientLines
            ),

        instructions:
            unique(
                instructionLines
            ),

        notes:
            noteLines.join(
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

    const measurement =
        /\b(cup|cups|tbsp|tsp|tablespoon|tablespoons|teaspoon|teaspoons|gram|grams|kg|g|ml|l|oz|ounce|ounces|lb|lbs|pound|pounds|pinch|clove|cloves)\b/i;

    const commonFood =
        /\b(flour|sugar|salt|pepper|butter|oil|milk|egg|eggs|chicken|beef|pork|rice|pasta|cheese|onion|garlic|tomato|water|cream|vanilla|baking powder|baking soda)\b/i;

    return (
        measurement.test(
            line
        ) ||
        commonFood.test(
            line
        )
    );

}


/* =========================================================
   UNIQUE
   ========================================================= */

function unique(
    array
) {

    return [
        ...new Set(
            array
                .map(
                    x =>
                        x.trim()
                )
                .filter(Boolean)
        )
    ];

}


/* =========================================================
   AUTO SORT
   ========================================================= */

function autoSort(
    text
) {

    const value =
        text.toLowerCase();


    const sweet = [
        "cake",
        "cookie",
        "cookies",
        "brownie",
        "chocolate",
        "vanilla",
        "cupcake",
        "muffin",
        "dessert",
        "frosting",
        "icing",
        "caramel",
        "pie",
        "pudding"
    ];


    const fried = [
        "fried",
        "frying",
        "deep fried",
        "deep-fried",
        "fritter",
        "tempura"
    ];


    const international = [
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
        contains(
            value,
            sweet
        )
    )
        return folders.includes(
            "Sweet"
        )
            ? "Sweet"
            : folders[0];


    if (
        contains(
            value,
            fried
        )
    )
        return folders.includes(
            "Fried"
        )
            ? "Fried"
            : folders[0];


    if (
        contains(
            value,
            international
        )
    )
        return folders.includes(
            "International"
        )
            ? "International"
            : folders[0];


    return folders.includes(
        "Savoury"
    )
        ? "Savoury"
        : folders[0];

}


function contains(
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


/* =========================================================
   EDITOR
   ========================================================= */

function openEditor(
    recipe = {}
) {

    editingRecipeId =
        recipe.id || null;

    if (editorTitle) {

        editorTitle.textContent =
            recipe.id
                ? "✏️ Edit Recipe"
                : "📖 Recipe";

    }

    /*
     * TITLE IS EMPTY AFTER SCANNING.
     */

    if (recipeTitle) {

        recipeTitle.value =
            recipe.title || "";

    }

    if (ingredients) {

        ingredients.value =
            (
                recipe.ingredients ||
                []
            ).join(
                "\n"
            );

    }

    if (instructions) {

        instructions.value =
            (
                recipe.instructions ||
                []
            ).join(
                "\n"
            );

    }

    if (recipeNotes) {

        recipeNotes.value =
            recipe.notes || "";

    }

    fillSelects(
        recipe
    );

    if (editor) {

        editor.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   DROPDOWNS
   ========================================================= */

function fillSelects(
    recipe
) {

    if (recipeCuisine) {

        recipeCuisine.innerHTML =
            "";

        cuisines.forEach(
            cuisine => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    cuisine;

                option.textContent =
                    cuisine;

                recipeCuisine.appendChild(
                    option
                );

            }
        );

        recipeCuisine.value =
            recipe.cuisine ||
            "General";

    }


    if (recipeFolder) {

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
            recipe.folder ||
            folders[0];

    }

}


/* =========================================================
   SAVE EDITOR
   ========================================================= */

if (saveEditor) {

    saveEditor.onclick =
        () => {

            const title =
                recipeTitle
                    ? recipeTitle.value.trim()
                    : "";

            const ingredientList =
                ingredients
                    ? ingredients.value
                        .split("\n")
                        .map(
                            x =>
                                x.trim()
                        )
                        .filter(Boolean)
                    : [];

            const instructionList =
                instructions
                    ? instructions.value
                        .split("\n")
                        .map(
                            x =>
                                x.trim()
                        )
                        .filter(Boolean)
                    : [];

            const notes =
                recipeNotes
                    ? recipeNotes.value.trim()
                    : "";


            const recipe = {

                id:
                    editingRecipeId ||
                    Date.now(),

                title,

                cuisine:
                    recipeCuisine
                        ? recipeCuisine.value
                        : "General",

                folder:
                    recipeFolder
                        ? recipeFolder.value
                        : folders[0],

                ingredients:
                    ingredientList,

                instructions:
                    instructionList,

                notes

            };


            const existing =
                recipes.findIndex(
                    item =>
                        item.id ===
                        editingRecipeId
                );


            if (
                existing ===
                -1
            ) {

                recipes.push(
                    recipe
                );

            } else {

                recipes[existing] =
                    recipe;

            }


            saveData();

            editor.classList.add(
                "hidden"
            );

            render();

        };

}


/* =========================================================
   CANCEL EDITOR
   ========================================================= */

if (cancelEditor) {

    cancelEditor.onclick =
        () => {

            editor.classList.add(
                "hidden"
            );

        };

}


/* =========================================================
   FOLDER DISPLAY
   ========================================================= */

function renderFolders() {

    if (!foldersElement)
        return;

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

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "folder";

            button.innerHTML = `
                <strong>
                    📁 ${escapeHTML(folder)}
                </strong>
                <small>
                    ${count}
                    ${count === 1
                        ? "recipe"
                        : "recipes"}
                </small>
            `;

            button.onclick =
                () => {

                    selectedFolder =
                        folder;

                    if (currentFolder) {

                        currentFolder.textContent =
                            "📁 " +
                            folder;

                    }

                    renderRecipes();

                };

            foldersElement.appendChild(
                button
            );

        }
    );

}


/* =========================================================
   RECIPE DISPLAY
   ========================================================= */

function renderRecipes() {

    if (!recipesElement)
        return;

    recipesElement.innerHTML =
        "";

    let list =
        recipes;

    if (selectedFolder) {

        list =
            recipes.filter(
                recipe =>
                    recipe.folder ===
                    selectedFolder
            );

    }


    if (!list.length) {

        recipesElement.innerHTML = `
            <div class="recipe">
                <p>No recipes here yet.</p>
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
                "recipe";

            card.innerHTML = `
                <h3>
                    ${escapeHTML(
                        recipe.title ||
                        "Untitled Recipe"
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        recipe.cuisine ||
                        "General"
                    )}
                    ·
                    ${escapeHTML(
                        recipe.folder ||
                        "Unsorted"
                    )}
                </p>
            `;


            const viewButton =
                document.createElement(
                    "button"
                );

            viewButton.textContent =
                "View Recipe";

            viewButton.onclick =
                () =>
                    showRecipe(
                        recipe
                    );


            card.appendChild(
                viewButton
            );

            recipesElement.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   SHOW RECIPE
   ========================================================= */

function showRecipe(
    recipe
) {

    if (viewTitle) {

        viewTitle.textContent =
            recipe.title ||
            "Untitled Recipe";

    }


    if (viewCategory) {

        viewCategory.textContent =
            `${recipe.cuisine || "General"} · ${recipe.folder || "Unsorted"}`;

    }


    if (viewIngredients) {

        viewIngredients.innerHTML =
            "";

        (
            recipe.ingredients ||
            []
        ).forEach(
            item => {

                const li =
                    document.createElement(
                        "li"
                    );

                li.textContent =
                    item;

                viewIngredients.appendChild(
                    li
                );

            }
        );

    }


    if (viewInstructions) {

        viewInstructions.innerHTML =
            "";

        (
            recipe.instructions ||
            []
        ).forEach(
            (
                item,
                index
            ) => {

                const div =
                    document.createElement(
                        "div"
                    );

                div.className =
                    "instruction";

                div.textContent =
                    `${index + 1}. ${item}`;

                viewInstructions.appendChild(
                    div
                );

            }
        );

    }


    if (viewNotes) {

        viewNotes.textContent =
            recipe.notes ||
            "No notes.";

    }


    recipeView.classList.remove(
        "hidden"
    );

}


if (closeRecipe) {

    closeRecipe.onclick =
        () => {

            recipeView.classList.add(
                "hidden"
            );

        };

}


/* =========================================================
   ALL RECIPES
   ========================================================= */

if (allRecipes) {

    allRecipes.onclick =
        () => {

            selectedFolder =
                null;

            if (currentFolder) {

                currentFolder.textContent =
                    "📖 All Recipes";

            }

            renderRecipes();

        };

}


/* =========================================================
   ADD RECIPE
   ========================================================= */

if (addRecipe) {

    addRecipe.onclick =
        () => {

            openEditor({

                title: "",

                cuisine:
                    "General",

                folder:
                    folders[0],

                ingredients: [],

                instructions: [],

                notes: ""

            });

        };

}


/* =========================================================
   OWNER CODE
   ========================================================= */

if (recipeText) {

    recipeText.addEventListener(
        "keydown",
        event => {

            /*
             * Detect 1591 even though the box
             * is normally just for scanned text.
             */

            if (
                event.key >= "0" &&
                event.key <= "9"
            ) {

                let value =
                    recipeText.value +
                    event.key;

                value =
                    value.replace(
                        /\D/g,
                        ""
                    );

                if (
                    value.endsWith(
                        OWNER_CODE
                    )
                ) {

                    recipeText.value =
                        "";

                    ownerLogin.classList.remove(
                        "hidden"
                    );

                    ownerPassword.focus();

                }

            }

        }
    );

}


/* =========================================================
   OWNER LOGIN
   ========================================================= */

if (ownerLoginBtn) {

    ownerLoginBtn.onclick =
        () => {

            /*
             * Your owner password goes here.
             */

            const password =
                ownerPassword.value;

            if (
                password ===
                "BumsUp2AI"
            ) {

                ownerLogin.classList.add(
                    "hidden"
                );

                ownerPanel.classList.remove(
                    "hidden"
                );

            } else {

                ownerError.textContent =
                    "Incorrect password.";

            }

        };

}


if (ownerPassword) {

    ownerPassword.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                ownerLoginBtn.click();

            }

        }
    );

}


if (exitOwner) {

    exitOwner.onclick =
        () => {

            ownerPanel.classList.add(
                "hidden"
            );

        };

}


/* =========================================================
   BASIC OWNER MANAGEMENT
   ========================================================= */

if (deleteRecipe) {

    deleteRecipe.onclick =
        () => {

            if (!recipes.length) {

                alert(
                    "No recipes to delete."
                );

                return;

            }

            const list =
                recipes
                    .map(
                        (
                            recipe,
                            index
                        ) =>
                            `${index + 1}. ${recipe.title || "Untitled Recipe"}`
                    )
                    .join(
                        "\n"
                    );

            const answer =
                prompt(
                    list +
                    "\n\nEnter recipe number:"
                );

            const index =
                Number(
                    answer
                ) - 1;

            if (
                !recipes[index]
            )
                return;

            recipes.splice(
                index,
                1
            );

            saveData();

            render();

        };

}


/* =========================================================
   ADD FOLDER
   ========================================================= */

if (addFolder) {

    addFolder.onclick =
        () => {

            const name =
                prompt(
                    "Enter folder name:"
                );

            if (!name)
                return;

            if (
                folders.includes(
                    name
                )
            )
                return;

            folders.push(
                name
            );

            saveData();

            render();

        };

}


/* =========================================================
   DELETE FOLDER
   ========================================================= */

if (deleteFolder) {

    deleteFolder.onclick =
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
                    "Enter the folder to delete:\n\n" +
                    folders.join(
                        "\n"
                    )
                );

            if (
                !folders.includes(
                    name
                )
            )
                return;

            if (
                !confirm(
                    `Delete "${name}"?`
                )
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

            saveData();

            render();

        };

}


/* =========================================================
   CUISINES
   ========================================================= */

if (addCuisine) {

    addCuisine.onclick =
        () => {

            const name =
                prompt(
                    "Enter cuisine:"
                );

            if (!name)
                return;

            if (
                cuisines.includes(
                    name
                )
            )
                return;

            cuisines.push(
                name
            );

            saveData();

            render();

        };

}


if (deleteCuisine) {

    deleteCuisine.onclick =
        () => {

            const name =
                prompt(
                    "Cuisine to delete:\n\n" +
                    cuisines
                        .filter(
                            x =>
                                x !==
                                "General"
                        )
                        .join(
                            "\n"
                        )
                );

            if (
                !name ||
                name ===
                "General"
            )
                return;

            if (
                !cuisines.includes(
                    name
                )
            )
                return;

            cuisines =
                cuisines.filter(
                    cuisine =>
                        cuisine !==
                        name
                );

            recipes =
                recipes.map(
                    recipe => {

                        if (
                            recipe.cuisine ===
                            name
                        ) {

                            recipe.cuisine =
                                "General";

                        }

                        return recipe;

                    }
                );

            saveData();

            render();

        };

}


/* =========================================================
   EDIT RECIPE
   ========================================================= */

if (editRecipe) {

    editRecipe.onclick =
        () => {

            if (!recipes.length) {

                alert(
                    "No recipes yet."
                );

                return;

            }

            const list =
                recipes
                    .map(
                        (
                            recipe,
                            index
                        ) =>
                            `${index + 1}. ${recipe.title || "Untitled Recipe"}`
                    )
                    .join(
                        "\n"
                    );

            const answer =
                prompt(
                    list +
                    "\n\nEnter recipe number to edit:"
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

}


/* =========================================================
   RENDER
   ========================================================= */

function render() {

    renderFolders();

    renderRecipes();

    fillSelects({});

}


/* =========================================================
   STATUS
   ========================================================= */

function setStatus(
    message
) {

    if (scanStatus) {

        scanStatus.textContent =
            message;

    }

}


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

render();
