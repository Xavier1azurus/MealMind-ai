
"use strict";

/* =========================================================
   MEALMIND
   Simple mobile/iPad version
========================================================= */

const STORAGE_KEY = "mealmind_data_v3";

let data = loadData();

let currentBook = null;
let currentFolder = null;
let currentRecipe = null;
let currentServings = 4;


/* =========================================================
   STORAGE
========================================================= */

function loadData() {

    try {

        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {

            const parsed = JSON.parse(saved);

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


function id() {

    return Date.now().toString(36) +
        Math.random().toString(36).slice(2);
}


/* =========================================================
   SCREEN CONTROL
========================================================= */

function show(idName) {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.add("hidden");

        });

    const screen =
        document.getElementById(idName);

    if (screen) {

        screen.classList.remove("hidden");

    }
}


function home() {

    currentBook = null;
    currentFolder = null;

    closeRecipe();

    show("homeScreen");
}


/* =========================================================
   BASIC BUTTONS
========================================================= */

document.getElementById("makeBookBtn")
    .addEventListener("click", () => {

        show("createScreen");

    });


document.getElementById("joinBookBtn")
    .addEventListener("click", () => {

        show("joinScreen");

    });


document.getElementById("createBackBtn")
    .addEventListener("click", home);


document.getElementById("joinBackBtn")
    .addEventListener("click", home);


/* =========================================================
   CREATE COOKBOOK
========================================================= */

document.getElementById("createBtn")
    .addEventListener("click", createBook);


function createBook() {

    const name =
        document.getElementById("bookName")
            .value.trim();

    const password =
        document.getElementById("bookPassword")
            .value;

    if (!name) {

        alert("Please enter a cookbook name.");
        return;

    }

    if (password.length < 4) {

        alert("Your cookbook code needs at least 4 characters.");
        return;

    }

    const book = {

        id: id(),

        name: name,

        password: password,

        privacy: "private",

        folders: ["Recipes"],

        recipes: []

    };

    data.books.push(book);

    saveData();

    currentBook = book;

    document.getElementById("bookName").value = "";
    document.getElementById("bookPassword").value = "";

    openBook();
}


/* =========================================================
   JOIN COOKBOOK
========================================================= */

document.getElementById("joinBtn")
    .addEventListener("click", joinBook);


function joinBook() {

    const name =
        document.getElementById("joinName")
            .value.trim()
            .toLowerCase();

    const password =
        document.getElementById("joinPassword")
            .value;

    const book =
        data.books.find(item =>
            item.name.toLowerCase() === name
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

    openBook();
}


/* =========================================================
   OPEN BOOK
========================================================= */

function openBook() {

    if (!currentBook) return;

    document.getElementById("bookTitle")
        .textContent = currentBook.name;

    show("bookScreen");

    currentFolder = null;

    renderFolders();
    renderRecipes();
}


/* =========================================================
   EXIT
========================================================= */

document.getElementById("exitBtn")
    .addEventListener("click", home);


/* =========================================================
   ADD FOLDER
========================================================= */

document.getElementById("addFolderBtn")
    .addEventListener("click", addFolder);


function addFolder() {

    if (!currentBook) return;

    const name =
        prompt("Folder name:");

    if (!name || !name.trim()) return;

    const folder =
        name.trim();

    const exists =
        currentBook.folders.some(
            f => f.toLowerCase() === folder.toLowerCase()
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
   RENDER FOLDERS
========================================================= */

function renderFolders() {

    const box =
        document.getElementById("folders");

    box.innerHTML = "";

    if (!currentBook) return;

    currentBook.folders.forEach(folder => {

        const row =
            document.createElement("div");

        row.className = "folderRow";


        const button =
            document.createElement("button");

        button.className = "folderButton";
        button.type = "button";

        button.innerHTML = `
            <span class="folderIcon">📁</span>
            <span class="folderName"></span>
            <span class="folderCount"></span>
        `;

        button.querySelector(".folderName")
            .textContent = folder;


        const count =
            currentBook.recipes.filter(
                recipe => recipe.folder === folder
            ).length;

        button.querySelector(".folderCount")
            .textContent =
                `${count} ${count === 1 ? "recipe" : "recipes"}`;


        button.addEventListener("click", () => {

            currentFolder = folder;

            renderFolders();
            renderRecipes();

        });


        const edit =
            document.createElement("button");

        edit.className = "smallButton";
        edit.textContent = "✏️";

        edit.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                renameFolder(folder);

            }
        );


        const remove =
            document.createElement("button");

        remove.className =
            "smallButton danger";

        remove.textContent = "🗑️";

        remove.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                removeFolder(folder);

            }
        );


        row.appendChild(button);
        row.appendChild(edit);
        row.appendChild(remove);

        box.appendChild(row);

    });
}


/* =========================================================
   RENAME FOLDER
========================================================= */

function renameFolder(oldName) {

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

function removeFolder(folder) {

    if (currentBook.folders.length <= 1) {

        alert("You need at least one folder.");
        return;

    }

    const recipes =
        currentBook.recipes.filter(
            recipe => recipe.folder === folder
        );

    if (
        !confirm(
            `Delete "${folder}"? ${recipes.length} recipe(s) will move to Recipes.`
        )
    ) {
        return;
    }

    if (!currentBook.folders.includes("Recipes")) {

        currentBook.folders.unshift("Recipes");

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
   SEARCH
========================================================= */

document.getElementById("searchInput")
    .addEventListener("input", renderRecipes);


/* =========================================================
   RENDER RECIPES
========================================================= */

function renderRecipes() {

    const box =
        document.getElementById("recipes");

    box.innerHTML = "";

    if (!currentBook) return;

    let recipes =
        [...currentBook.recipes];


    if (currentFolder) {

        recipes =
            recipes.filter(
                recipe =>
                    recipe.folder === currentFolder
            );

    }


    const search =
        document.getElementById("searchInput")
            .value
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

        box.innerHTML = `
            <div class="empty">
                🍽️
                <p>No recipes here yet.</p>
            </div>
        `;

        return;

    }


    recipes.forEach(recipe => {

        const button =
            document.createElement("button");

        button.type = "button";
        button.className = "recipeCard";


        button.innerHTML = `
            <div class="recipeIcon">🍴</div>

            <div class="recipeInfo">
                <strong></strong>
                <span></span>
            </div>

            <div class="arrow">›</div>
        `;


        button.querySelector("strong")
            .textContent =
                recipe.title || "Untitled Recipe";


        button.querySelector("span")
            .textContent =
                recipe.cuisine || "Recipe";


        button.addEventListener(
            "click",
            () => openRecipe(recipe)
        );


        box.appendChild(button);

    });
}


/* =========================================================
   SCANNER
========================================================= */

document.getElementById("scanBtn")
    .addEventListener("click", () => {

        if (!currentBook) {

            alert("Open a cookbook first.");
            return;

        }

        document.getElementById("cameraInput").click();

    });


document.getElementById("cameraInput")
    .addEventListener("change", async event => {

        const file =
            event.target.files[0];

        if (!file) return;

        await scanImage(file);

        event.target.value = "";

    });


async function scanImage(file) {

    showScanner("Reading your recipe...");


    try {

        if (!window.Tesseract) {

            throw new Error("OCR unavailable.");

        }


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

                            showScanner(
                                `Reading recipe... ${percent}%`
                            );

                        }

                    }
                }
            );


        const text =
            result.data.text;


        const recipe =
            parseRecipe(text);


        recipe.id = id();

        recipe.folder =
            currentFolder || "Recipes";

        recipe.pages = 1;


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


        hideScanner();

        renderFolders();
        renderRecipes();

        openRecipe(recipe);


    } catch (error) {

        console.error(error);

        hideScanner();

        alert(
            "I couldn't read that image. Try taking a clearer photo with the whole recipe visible."
        );

    }
}


/* =========================================================
   RECIPE PARSER
========================================================= */

function parseRecipe(text) {

    const lines =
        text
            .split(/\r?\n/)
            .map(line =>
                line
                    .replace(/\s+/g, " ")
                    .trim()
            )
            .filter(Boolean);


    let title = "";
    let cuisine = "";

    const ingredients = [];
    const instructions = [];

    let section = "none";


    const ingredientHeader =
        /^(ingredients?|what you need)$/i;

    const instructionHeader =
        /^(instructions?|directions?|method|preparation|steps|how to make)$/i;


    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        const line = lines[i];

        if (ingredientHeader.test(line)) {

            section = "ingredients";
            continue;

        }

        if (instructionHeader.test(line)) {

            section = "instructions";
            continue;

        }


        if (!title && i < 5) {

            if (
                line.length >= 3 &&
                line.length <= 80 &&
                !looksLikeIngredient(line) &&
                !looksLikeInstruction(line)
            ) {

                title = cleanLine(line);
                continue;

            }

        }


        if (section === "ingredients") {

            if (!looksLikeInstruction(line)) {

                ingredients.push(
                    cleanLine(line)
                );

            }

            continue;

        }


        if (section === "instructions") {

            instructions.push(
                cleanInstruction(line)
            );

        }

    }


    /*
       If headings weren't recognized,
       try a fallback split.
    */

    if (
        ingredients.length === 0 ||
        instructions.length === 0
    ) {

        const fallback =
            fallbackSplit(lines);


        if (!ingredients.length) {

            ingredients.push(
                ...fallback.ingredients
            );

        }

        if (!instructions.length) {

            instructions.push(
                ...fallback.instructions
            );

        }

    }


    /*
       Never put the scan's entire text
       into the title.
    */

    if (!title) {

        title = "Scanned Recipe";

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


function cleanLine(line) {

    return line
        .replace(/^[•●▪◦*-]\s*/, "")
        .replace(/^\d+[.)]\s*/, "")
        .trim();
}


function cleanInstruction(line) {

    return line
        .replace(/^\d+[.)]\s*/, "")
        .replace(/^[•●▪◦*-]\s*/, "")
        .trim();
}


function looksLikeIngredient(line) {

    return /^\s*(\d+(?:\.\d+)?|\d+\/\d+|[½⅓⅔¼¾⅛⅜⅝⅞])\s*/.test(line);
}


function looksLikeInstruction(line) {

    return /^(add|mix|stir|bake|cook|heat|combine|place|pour|remove|serve|chop|slice|preheat|whisk|fold|boil|simmer|let|allow|season|transfer)\b/i.test(line);
}


function fallbackSplit(lines) {

    const ingredients = [];
    const instructions = [];

    let instructionsStarted = false;


    lines.forEach(line => {

        if (looksLikeInstruction(line)) {

            instructionsStarted = true;

        }


        if (instructionsStarted) {

            instructions.push(
                cleanInstruction(line)
            );

        } else if (
            looksLikeIngredient(line)
        ) {

            ingredients.push(
                cleanLine(line)
            );

        }

    });


    if (
        ingredients.length < 2 &&
        lines.length > 5
    ) {

        const start =
            titleLikelyIndex(lines);

        const split =
            Math.ceil(
                (lines.length - start) * .5
            ) + start;


        return {

            ingredients:
                lines
                    .slice(start, split)
                    .map(cleanLine),

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


function titleLikelyIndex(lines) {

    return lines.length > 0 ? 1 : 0;

}


/* =========================================================
   RECIPE VIEW
========================================================= */

function openRecipe(recipe) {

    currentRecipe = recipe;

    currentServings =
        Number(recipe.servings) || 4;


    document.getElementById("recipeTitle")
        .textContent =
            recipe.title || "Untitled Recipe";


    document.getElementById("recipeCuisine")
        .textContent =
            recipe.cuisine || "";


    document.getElementById("servingNumber")
        .textContent =
            currentServings;


    renderIngredients();
    renderInstructions();


    const notes =
        document.getElementById("recipeNotes");

    const notesSection =
        document.getElementById("notesSection");


    if (recipe.notes) {

        notes.textContent = recipe.notes;
        notesSection.classList.remove("hidden");

    } else {

        notes.textContent = "";
        notesSection.classList.add("hidden");

    }


    document.getElementById("recipeModal")
        .classList.remove("hidden");
}


document.getElementById("closeRecipeBtn")
    .addEventListener("click", closeRecipe);


function closeRecipe() {

    document.getElementById("recipeModal")
        .classList.add("hidden");

    currentRecipe = null;
}


/* =========================================================
   INGREDIENT CALCULATOR
========================================================= */

document.getElementById("minusServing")
    .addEventListener("click", () => {

        if (currentServings > 1) {

            currentServings--;

            document.getElementById(
                "servingNumber"
            ).textContent = currentServings;

            renderIngredients();

        }

    });


document.getElementById("plusServing")
    .addEventListener("click", () => {

        currentServings++;

        document.getElementById(
            "servingNumber"
        ).textContent = currentServings;

        renderIngredients();

    });


function renderIngredients() {

    if (!currentRecipe) return;

    const list =
        document.getElementById("ingredientList");

    list.innerHTML = "";


    const original =
        Number(currentRecipe.servings) || 4;

    const multiplier =
        currentServings / original;


    currentRecipe.ingredients.forEach(
        ingredient => {

            const li =
                document.createElement("li");

            li.textContent =
                scaleIngredient(
                    ingredient,
                    multiplier
                );

            list.appendChild(li);

        }
    );
}


function renderInstructions() {

    if (!currentRecipe) return;

    const list =
        document.getElementById("instructionList");

    list.innerHTML = "";


    currentRecipe.instructions.forEach(
        instruction => {

            const li =
                document.createElement("li");

            li.textContent = instruction;

            list.appendChild(li);

        }
    );
}


function scaleIngredient(text, multiplier) {

    if (multiplier === 1) {

        return text;

    }


    const match =
        text.match(
            /^(\d+(?:\.\d+)?|\d+\/\d+|½|⅓|⅔|¼|¾|⅛|⅜|⅝|⅞)(\s+)/
        );


    if (!match) {

        return text;

    }


    const amount =
        parseAmount(match[1]);


    if (amount === null) {

        return text;

    }


    return formatAmount(
        amount * multiplier
    ) + match[2] +
    text.slice(match[0].length);
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


    if (fractions[value] !== undefined) {

        return fractions[value];

    }


    if (value.includes("/")) {

        const parts = value.split("/");

        const a = Number(parts[0]);
        const b = Number(parts[1]);

        if (b) return a / b;

    }


    const number = Number(value);

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


    for (const [value, symbol] of fractions) {

        if (
            Math.abs(decimal - value) < .03
        ) {

            return whole
                ? `${whole} ${symbol}`
                : symbol;

        }

    }


    if (
        Math.abs(
            number - Math.round(number)
        ) < .01
    ) {

        return String(Math.round(number));

    }


    return String(
        Math.round(number * 100) / 100
    );
}


/* =========================================================
   EDIT RECIPE
========================================================= */

document.getElementById("editRecipeBtn")
    .addEventListener("click", openEditor);


function openEditor() {

    if (!currentRecipe) return;


    document.getElementById("editTitle")
        .value =
            currentRecipe.title || "";


    document.getElementById("editCuisine")
        .value =
            currentRecipe.cuisine || "";


    document.getElementById("editServings")
        .value =
            currentRecipe.servings || 4;


    document.getElementById("editIngredients")
        .value =
            currentRecipe.ingredients.join("\n");


    document.getElementById("editInstructions")
        .value =
            currentRecipe.instructions.join("\n");


    document.getElementById("editNotes")
        .value =
            currentRecipe.notes || "";


    document.getElementById("editModal")
        .classList.remove("hidden");
}


/* =========================================================
   SAVE RECIPE
========================================================= */

document.getElementById("saveRecipeBtn")
    .addEventListener("click", saveRecipe);


function saveRecipe() {

    if (!currentRecipe) return;


    currentRecipe.title =
        document.getElementById("editTitle")
            .value.trim() ||
        "Untitled Recipe";


    currentRecipe.cuisine =
        document.getElementById("editCuisine")
            .value.trim();


    currentRecipe.servings =
        Math.max(
            1,
            Number(
                document.getElementById("editServings")
                    .value
            ) || 4
        );


    currentRecipe.ingredients =
        document.getElementById("editIngredients")
            .value
            .split("\n")
            .map(x => x.trim())
            .filter(Boolean);


    currentRecipe.instructions =
        document.getElementById("editInstructions")
            .value
            .split("\n")
            .map(x => x.trim())
            .filter(Boolean);


    currentRecipe.notes =
        document.getElementById("editNotes")
            .value.trim();


    saveData();

    document.getElementById("editModal")
        .classList.add("hidden");


    currentServings =
        currentRecipe.servings;


    openRecipe(currentRecipe);

    renderRecipes();

    renderFolders();
}


/* =========================================================
   CANCEL EDIT
========================================================= */

document.getElementById("cancelEditBtn")
    .addEventListener("click", () => {

        document.getElementById("editModal")
            .classList.add("hidden");

    });


/* =========================================================
   DELETE RECIPE
========================================================= */

document.getElementById("deleteRecipeBtn")
    .addEventListener("click", deleteRecipe);


function deleteRecipe() {

    if (!currentRecipe || !currentBook) return;


    const name =
        currentRecipe.title ||
        "this recipe";


    if (!confirm(`Delete "${name}"?`)) {

        return;

    }


    currentBook.recipes =
        currentBook.recipes.filter(
            recipe =>
                recipe.id !== currentRecipe.id
        );


    saveData();

    closeRecipe();

    renderRecipes();
    renderFolders();
}


/* =========================================================
   SCANNER STATUS
========================================================= */

function showScanner(message) {

    let status =
        document.getElementById("scannerStatus");


    if (!status) {

        status =
            document.createElement("div");

        status.id = "scannerStatus";

        status.innerHTML = `
            <div class="statusBox">
                <div style="font-size:35px">📷</div>
                <p id="scannerMessage"></p>
            </div>
        `;

        document.body.appendChild(status);

    }


    document.getElementById("scannerMessage")
        .textContent = message;
}


function hideScanner() {

    document.getElementById("scannerStatus")
        ?.remove();
}


/* =========================================================
   STARTUP
========================================================= */

function startup() {

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


            if (!recipe.servings) {

                recipe.servings = 4;

            }


            if (recipe.notes === undefined) {

                recipe.notes = "";

            }

        });

    });


    saveData();

}


startup();


