"use strict";

/* =====================================================
   MEALMIND
   ===================================================== */

const STORAGE_KEY = "mealmind_v3";

let data = loadData();

let currentBook = null;
let currentFolder = null;
let currentRecipe = null;

let currentServing = 4;


/* =====================================================
   STORAGE
   ===================================================== */

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


/* =====================================================
   SCREEN SYSTEM
   ===================================================== */

function showScreen(screenID) {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.add("hidden");

        });

    const screen =
        document.getElementById(screenID);

    if (screen) {
        screen.classList.remove("hidden");
    }
}


function goHome() {

    currentBook = null;
    currentFolder = null;
    currentRecipe = null;

    showScreen("homeScreen");
}


/* =====================================================
   HOME BUTTONS
   ===================================================== */

document.getElementById("makeCookbookBtn")
    .addEventListener("click", () => {

        showScreen("makeScreen");

    });


document.getElementById("joinCookbookBtn")
    .addEventListener("click", () => {

        showScreen("joinScreen");

    });


document.getElementById("publicBooksBtn")
    .addEventListener("click", () => {

        renderPublicBooks();

        showScreen("publicScreen");

    });


document.getElementById("makeBackBtn")
    .addEventListener("click", goHome);


document.getElementById("joinBackBtn")
    .addEventListener("click", goHome);


document.getElementById("publicBackBtn")
    .addEventListener("click", goHome);


document.getElementById("exitBookBtn")
    .addEventListener("click", goHome);


/* =====================================================
   PASSWORD SHOW
   ===================================================== */

document.getElementById("showPassword")
    .addEventListener("change", event => {

        document.getElementById(
            "cookbookPassword"
        ).type =
            event.target.checked
                ? "text"
                : "password";

    });


document.getElementById("joinShowPassword")
    .addEventListener("change", event => {

        document.getElementById(
            "joinPassword"
        ).type =
            event.target.checked
                ? "text"
                : "password";

    });


/* =====================================================
   CREATE COOKBOOK
   ===================================================== */

document.getElementById("createCookbookBtn")
    .addEventListener("click", createCookbook);


function createCookbook() {

    const name =
        document.getElementById(
            "cookbookName"
        ).value.trim();

    const password =
        document.getElementById(
            "cookbookPassword"
        ).value;

    const privacy =
        document.getElementById(
            "cookbookPrivacy"
        ).value;


    if (!name) {

        alert("Enter a cookbook name.");

        return;
    }


    if (password.length < 4) {

        alert(
            "Your cookbook code must be at least 4 characters."
        );

        return;
    }


    const book = {

        id: id(),

        name: name,

        password: password,

        privacy: privacy,

        folders: [
            "Recipes"
        ],

        recipes: []

    };


    data.books.push(book);

    saveData();

    currentBook = book;

    openBook();

}


/* =====================================================
   JOIN
   ===================================================== */

document.getElementById("joinBtn")
    .addEventListener("click", joinBook);


function joinBook() {

    const name =
        document.getElementById(
            "joinName"
        ).value.trim();

    const password =
        document.getElementById(
            "joinPassword"
        ).value;


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

        alert("Wrong cookbook code.");

        return;
    }


    currentBook = book;

    openBook();

}


/* =====================================================
   OPEN BOOK
   ===================================================== */

function openBook() {

    if (!currentBook) return;

    document.getElementById(
        "mainBookName"
    ).textContent =
        currentBook.name;

    currentFolder = null;

    document.getElementById(
        "clearFolderBtn"
    ).classList.add("hidden");

    renderFolders();
    renderRecipes();

    showScreen("mainScreen");

}


/* =====================================================
   FOLDERS
   ===================================================== */

document.getElementById("addFolderBtn")
    .addEventListener("click", addFolder);


function renderFolders() {

    const container =
        document.getElementById("folders");

    container.innerHTML = "";


    currentBook.folders.forEach(folder => {

        const row =
            document.createElement("div");

        row.className = "folder-row";


        const button =
            document.createElement("button");

        button.className = "folder-card";
        button.type = "button";


        const count =
            currentBook.recipes.filter(
                recipe =>
                    recipe.folder === folder
            ).length;


        button.innerHTML = `
            <span>📁</span>
            <strong>${escapeHTML(folder)}</strong>
            <span class="folder-count">
                ${count}
            </span>
        `;


        button.addEventListener(
            "click",
            () => {

                currentFolder = folder;

                document
                    .getElementById(
                        "recipeListTitle"
                    )
                    .textContent =
                    folder;

                document
                    .getElementById(
                        "clearFolderBtn"
                    )
                    .classList.remove(
                        "hidden"
                    );

                renderRecipes();

            }
        );


        const edit =
            document.createElement("button");

        edit.className = "folder-tool";
        edit.textContent = "✏️";

        edit.addEventListener(
            "click",
            () => editFolder(folder)
        );


        const remove =
            document.createElement("button");

        remove.className = "folder-tool danger";
        remove.textContent = "🗑️";

        remove.addEventListener(
            "click",
            () => deleteFolder(folder)
        );


        row.appendChild(button);
        row.appendChild(edit);
        row.appendChild(remove);

        container.appendChild(row);

    });

}


function addFolder() {

    const name =
        prompt("Folder name:");

    if (!name || !name.trim()) return;

    const folder = name.trim();


    if (
        currentBook.folders.some(
            f =>
                f.toLowerCase() ===
                folder.toLowerCase()
        )
    ) {

        alert("That folder already exists.");

        return;
    }


    currentBook.folders.push(folder);

    saveData();

    renderFolders();

}


function editFolder(oldName) {

    const newName =
        prompt(
            "New folder name:",
            oldName
        );


    if (!newName || !newName.trim()) return;

    const name = newName.trim();


    if (name === oldName) return;


    if (
        currentBook.folders.some(
            f =>
                f.toLowerCase() ===
                name.toLowerCase()
        )
    ) {

        alert("That folder already exists.");

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


function deleteFolder(folder) {

    if (currentBook.folders.length <= 1) {

        alert(
            "You need at least one folder."
        );

        return;
    }


    if (
        !confirm(
            `Delete "${folder}"? Recipes inside it will move to Recipes.`
        )
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


/* =====================================================
   CLEAR FOLDER
   ===================================================== */

document.getElementById("clearFolderBtn")
    .addEventListener("click", () => {

        currentFolder = null;

        document.getElementById(
            "recipeListTitle"
        ).textContent = "Recipes";

        document.getElementById(
            "clearFolderBtn"
        ).classList.add("hidden");

        renderRecipes();

    });


/* =====================================================
   RECIPES
   ===================================================== */

function renderRecipes() {

    const container =
        document.getElementById("recipes");

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
        document.getElementById(
            "searchInput"
        ).value
            .trim()
            .toLowerCase();


    if (search) {

        recipes =
            recipes.filter(recipe =>
                (
                    recipe.title +
                    " " +
                    recipe.cuisine
                )
                    .toLowerCase()
                    .includes(search)
            );

    }


    if (!recipes.length) {

        container.innerHTML = `
            <div class="empty">
                🍽️
                <br><br>
                No recipes here yet.
                <br>
                Scan a recipe to add one.
            </div>
        `;

        return;
    }


    recipes.forEach(recipe => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "recipe-list-card";


        button.innerHTML = `
            <div class="recipe-icon">
                🍴
            </div>

            <div class="recipe-list-info">

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

            <span class="arrow">
                ›
            </span>
        `;


        button.addEventListener(
            "click",
            () => openRecipe(recipe)
        );


        container.appendChild(button);

    });

}


/* =====================================================
   SEARCH
   ===================================================== */

document.getElementById("searchInput")
    .addEventListener(
        "input",
        renderRecipes
    );


/* =====================================================
   SCANNER
   ===================================================== */

document.getElementById("scanBtn")
    .addEventListener(
        "click",
        () => {

            document.getElementById(
                "cameraInput"
            ).click();

        }
    );


document.getElementById("cameraInput")
    .addEventListener(
        "change",
        async event => {

            const files =
                Array.from(
                    event.target.files || []
                );


            if (!files.length) return;


            /*
               Maximum 5 recipe pages.
            */

            if (files.length > 5) {

                alert(
                    "You can scan up to 5 pages at once."
                );

            }


            const pages =
                files.slice(0, 5);


            await scanPages(pages);


            event.target.value = "";

        }
    );


document.getElementById("cancelScanBtn")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "scannerOverlay"
                )
                .classList.add(
                    "hidden"
                );

        }
    );


async function scanPages(files) {

    if (!currentBook) return;


    const overlay =
        document.getElementById(
            "scannerOverlay"
        );

    const status =
        document.getElementById(
            "scannerStatus"
        );

    const progress =
        document.getElementById(
            "scannerProgress"
        );


    overlay.classList.remove("hidden");


    let allText = [];


    try {

        for (
            let i = 0;
            i < files.length;
            i++
        ) {

            status.textContent =
                `Reading page ${i + 1} of ${files.length}...`;

            progress.style.width =
                `${(i / files.length) * 100}%`;


            const result =
                await Tesseract.recognize(
                    files[i],
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

                                progress.style.width =
                                    `${(
                                        (
                                            i +
                                            message.progress
                                        ) /
                                        files.length
                                    ) * 100}%`;

                                status.textContent =
                                    `Reading page ${i + 1} of ${files.length}... ${percent}%`;

                            }

                        }
                    }
                );


            allText.push(
                result.data.text
            );

        }


        progress.style.width = "100%";

        status.textContent =
            "Organizing recipe...";


        const recipe =
            parseRecipe(
                allText.join("\n")
            );


        recipe.id = id();

        recipe.folder =
            currentFolder ||
            "Recipes";

        recipe.pages =
            files.length;


        currentBook.recipes.push(recipe);


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


        setTimeout(() => {

            overlay.classList.add("hidden");

            renderFolders();
            renderRecipes();

            openRecipe(recipe);

        }, 400);


    } catch (error) {

        console.error(
            "Scanner failed:",
            error
        );

        overlay.classList.add("hidden");

        alert(
            "The scanner couldn't read the image. Try a clearer photo."
        );

    }

}


/* =====================================================
   RECIPE PARSER
   ===================================================== */

function parseRecipe(text) {

    const lines =
        text
            .split(/\r?\n/)
            .map(cleanLine)
            .filter(Boolean);


    let title = "";

    let cuisine = "";

    let servings = 4;

    let ingredients = [];

    let instructions = [];

    let notes = "";


    let section = "unknown";


    const ingredientHeader =
        /^(ingredients?|what you need)$/i;

    const instructionHeader =
        /^(instructions?|directions?|method|preparation|steps?)$/i;

    const notesHeader =
        /^(notes?|tips?)$/i;


    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        const line = lines[i];

        const lower =
            line.toLowerCase();


        if (
            ingredientHeader.test(line)
        ) {

            section = "ingredients";
            continue;

        }


        if (
            instructionHeader.test(line)
        ) {

            section = "instructions";
            continue;

        }


        if (
            notesHeader.test(line)
        ) {

            section = "notes";
            continue;

        }


        if (
            !title &&
            i < 6 &&
            line.length >= 3 &&
            !isIngredient(line)
        ) {

            title = line;

            continue;

        }


        const servingMatch =
            line.match(
                /serves?\s*:?\s*(\d+)/i
            );


        if (servingMatch) {

            servings =
                Number(
                    servingMatch[1]
                );

            continue;

        }


        if (
            section === "ingredients"
        ) {

            ingredients.push(
                removeBullet(line)
            );

            continue;

        }


        if (
            section === "instructions"
        ) {

            instructions.push(
                removeStepNumber(line)
            );

            continue;

        }


        if (
            section === "notes"
        ) {

            notes +=
                (notes ? " " : "") +
                line;

        }

    }


    /*
       If the recipe headings weren't
       detected, make a best effort split.
    */

    if (
        ingredients.length === 0 ||
        instructions.length === 0
    ) {

        const split =
            smartSplit(lines);


        if (!ingredients.length) {

            ingredients =
                split.ingredients;

        }


        if (!instructions.length) {

            instructions =
                split.instructions;

        }

    }


    /*
       Remove obvious non-recipe text.
    */

    ingredients =
        ingredients.filter(
            line =>
                !isHeading(line)
        );


    instructions =
        instructions.filter(
            line =>
                !isHeading(line)
        );


    if (!title) {

        title = "Scanned Recipe";

    }


    return {

        title,

        cuisine,

        servings,

        ingredients,

        instructions,

        notes

    };

}


/* =====================================================
   TEXT CLEANING
   ===================================================== */

function cleanLine(line) {

    return line
        .replace(/\s+/g, " ")
        .trim();

}


function removeBullet(line) {

    return line
        .replace(
            /^[•●▪◦*-]\s*/,
            ""
        )
        .replace(
            /^\d+[.)]\s*/,
            ""
        )
        .trim();

}


function removeStepNumber(line) {

    return line
        .replace(
            /^\d+[.)]\s*/,
            ""
        )
        .replace(
            /^[•●▪◦*-]\s*/,
            ""
        )
        .trim();

}


function isIngredient(line) {

    return /\b(
        cup|cups|
        tbsp|tablespoon|tablespoons|
        tsp|teaspoon|teaspoons|
        oz|ounce|ounces|
        lb|lbs|pound|pounds|
        gram|grams|g|
        kg|kilogram|kilograms|
        ml|milliliter|milliliters|
        l|liter|liters
    )\b/i.test(line);

}


function isInstruction(line) {

    return /^(add|mix|stir|bake|cook|heat|combine|place|pour|remove|serve|chop|slice|preheat|whisk|fold|boil|simmer|season|transfer|let|allow|cover|drain|cut|blend|roast|fry|grill|cool)\b/i
        .test(line);

}


function isHeading(line) {

    return /^(ingredients?|instructions?|directions?|method|preparation|steps?|notes?|tips?)$/i
        .test(line);

}


/* =====================================================
   SMART SPLIT
   ===================================================== */

function smartSplit(lines) {

    const ingredients = [];
    const instructions = [];

    let foundInstructions = false;


    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        const line = lines[i];


        if (isInstruction(line)) {

            foundInstructions = true;

        }


        if (foundInstructions) {

            instructions.push(
                removeStepNumber(line)
            );

        } else if (isIngredient(line)) {

            ingredients.push(
                removeBullet(line)
            );

        }

    }


    /*
       If OCR didn't recognize units,
       use a reasonable page split.
    */

    if (
        ingredients.length < 2 &&
        lines.length >= 6
    ) {

        const start =
            Math.max(1, Math.floor(
                lines.length * .2
            ));

        const middle =
            Math.floor(
                lines.length * .55
            );


        return {

            ingredients:
                lines
                    .slice(start, middle)
                    .map(removeBullet),

            instructions:
                lines
                    .slice(middle)
                    .map(removeStepNumber)

        };

    }


    return {
        ingredients,
        instructions
    };

}


/* =====================================================
   OPEN RECIPE
   ===================================================== */

function openRecipe(recipe) {

    currentRecipe = recipe;

    currentServing =
        Number(recipe.servings) || 4;


    document.getElementById(
        "recipeTitle"
    ).textContent =
        recipe.title || "Untitled Recipe";


    document.getElementById(
        "recipeCuisine"
    ).textContent =
        recipe.cuisine || "";


    document.getElementById(
        "servingNumber"
    ).textContent =
        currentServing;


    renderRecipe();


    showScreen("recipeScreen");

}


/* =====================================================
   RECIPE DISPLAY
   ===================================================== */

function renderRecipe() {

    if (!currentRecipe) return;


    document.getElementById(
        "servingNumber"
    ).textContent =
        currentServing;


    const original =
        Number(
            currentRecipe.servings
        ) || 4;


    const multiplier =
        currentServing / original;


    const ingredients =
        document.getElementById(
            "ingredientList"
        );


    ingredients.innerHTML = "";


    currentRecipe.ingredients
        .forEach(ingredient => {

            const li =
                document.createElement("li");

            li.textContent =
                scaleIngredient(
                    ingredient,
                    multiplier
                );

            ingredients.appendChild(li);

        });


    const instructions =
        document.getElementById(
            "instructionList"
        );


    instructions.innerHTML = "";


    currentRecipe.instructions
        .forEach(instruction => {

            const li =
                document.createElement("li");

            li.textContent =
                instruction;

            instructions.appendChild(li);

        });


    const notesSection =
        document.getElementById(
            "notesSection"
        );


    if (currentRecipe.notes) {

        notesSection.classList.remove(
            "hidden"
        );

        document.getElementById(
            "recipeNotes"
        ).textContent =
            currentRecipe.notes;

    } else {

        notesSection.classList.add(
            "hidden"
        );

    }


    renderPageCount();

}


/* =====================================================
   SERVINGS
   ===================================================== */

document.getElementById("servingMinus")
    .addEventListener("click", () => {

        currentServing =
            Math.max(
                1,
                currentServing - 1
            );

        renderRecipe();

    });


document.getElementById("servingPlus")
    .addEventListener("click", () => {

        currentServing++;

        renderRecipe();

    });


/* =====================================================
   INGREDIENT CALCULATOR
   ===================================================== */

function scaleIngredient(
    ingredient,
    multiplier
) {

    if (multiplier === 1) {
        return ingredient;
    }


    const match =
        ingredient.match(
            /^(\d+(?:\.\d+)?|\d+\s*\/\s*\d+|½|⅓|⅔|¼|¾|⅛|⅜|⅝|⅞)\b/
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


    return (
        formatAmount(
            amount * multiplier
        ) +
        ingredient.slice(
            match[0].length
        )
    );

}


function parseAmount(value) {

    const fractions = {

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


    if (
        fractions[value] !== undefined
    ) {

        return fractions[value];

    }


    if (value.includes("/")) {

        const parts =
            value
                .split("/")
                .map(Number);


        if (
            parts.length === 2 &&
            parts[1] !== 0
        ) {

            return parts[0] / parts[1];

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
            ) < .025
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


/* =====================================================
   BACK FROM RECIPE
   ===================================================== */

document.getElementById("recipeBackBtn")
    .addEventListener("click", () => {

        showScreen("mainScreen");

        renderFolders();
        renderRecipes();

    });


/* =====================================================
   DELETE RECIPE
   ===================================================== */

document.getElementById("deleteRecipeBtn")
    .addEventListener(
        "click",
        deleteRecipe
    );


function deleteRecipe() {

    if (!currentRecipe) return;


    const okay =
        confirm(
            `Delete "${currentRecipe.title}"?`
        );


    if (!okay) return;


    currentBook.recipes =
        currentBook.recipes.filter(
            recipe =>
                recipe.id !==
                currentRecipe.id
        );


    saveData();


    currentRecipe = null;

    showScreen("mainScreen");

    renderFolders();
    renderRecipes();

}


/* =====================================================
   EDIT RECIPE
   ===================================================== */

document.getElementById("editRecipeBtn")
    .addEventListener(
        "click",
        openEditor
    );


function openEditor() {

    if (!currentRecipe) return;


    document.getElementById(
        "editTitle"
    ).value =
        currentRecipe.title || "";


    document.getElementById(
        "editCuisine"
    ).value =
        currentRecipe.cuisine || "";


    document.getElementById(
        "editServings"
    ).value =
        currentRecipe.servings || 4;


    document.getElementById(
        "editIngredients"
    ).value =
        currentRecipe.ingredients.join("\n");


    document.getElementById(
        "editInstructions"
    ).value =
        currentRecipe.instructions.join("\n");


    document.getElementById(
        "editNotes"
    ).value =
        currentRecipe.notes || "";


    document.getElementById(
        "editModal"
    ).classList.remove("hidden");

}


/* =====================================================
   SAVE EDIT
   ===================================================== */

document.getElementById("saveEditBtn")
    .addEventListener(
        "click",
        saveEdit
    );


function saveEdit() {

    if (!currentRecipe) return;


    currentRecipe.title =
        document.getElementById(
            "editTitle"
        ).value.trim() ||
        "Untitled Recipe";


    currentRecipe.cuisine =
        document.getElementById(
            "editCuisine"
        ).value.trim();


    currentRecipe.servings =
        Math.max(
            1,
            Number(
                document.getElementById(
                    "editServings"
                ).value
            ) || 4
        );


    currentRecipe.ingredients =
        document.getElementById(
            "editIngredients"
        ).value
            .split("\n")
            .map(x => x.trim())
            .filter(Boolean);


    currentRecipe.instructions =
        document.getElementById(
            "editInstructions"
        ).value
            .split("\n")
            .map(x => x.trim())
            .filter(Boolean);


    currentRecipe.notes =
        document.getElementById(
            "editNotes"
        ).value.trim();


    saveData();


    document.getElementById(
        "editModal"
    ).classList.add("hidden");


    currentServing =
        currentRecipe.servings;


    openRecipe(currentRecipe);

}


/* =====================================================
   CANCEL EDIT
   ===================================================== */

document.getElementById("cancelEditBtn")
    .addEventListener(
        "click",
        () => {

            document.getElementById(
                "editModal"
            ).classList.add("hidden");

        }
    );


/* =====================================================
   PUBLIC BOOKS
   ===================================================== */

function renderPublicBooks() {

    const container =
        document.getElementById(
            "publicBooksList"
        );


    container.innerHTML = "";


    const books =
        data.books.filter(
            book =>
                book.privacy === "public"
        );


    if (!books.length) {

        container.innerHTML = `
            <div class="empty">
                📚
                <br><br>
                No public cookbooks yet.
            </div>
        `;

        return;
    }


    books.forEach(book => {

        const button =
            document.createElement("button");

        button.className =
            "big-button";

        button.textContent =
            `📖 ${book.name}`;


        button.addEventListener(
            "click",
            () => {

                /*
                   Public books don't need
                   the code to view them.
                */

                currentBook = book;

                openBook();

            }
        );


        container.appendChild(button);

    });

}


/* =====================================================
   RECIPE PAGE SYSTEM
   ===================================================== */

function renderPageCount() {

    const container =
        document.getElementById(
            "recipePages"
        );


    container.innerHTML = "";


    const pages =
        Math.min(
            5,
            Math.max(
                1,
                Number(
                    currentRecipe.pages
                ) || 1
            )
        );


    for (
        let i = 1;
        i <= pages;
        i++
    ) {

        const span =
            document.createElement("span");

        span.className = "page-dot";

        span.textContent =
            `Page ${i}`;


        container.appendChild(span);

    }

}


/* =====================================================
   ESCAPE HTML
   ===================================================== */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =====================================================
   START
   ===================================================== */

showScreen("homeScreen");
