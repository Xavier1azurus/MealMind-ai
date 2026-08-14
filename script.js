"use strict";

const STORAGE_KEY = "mealmind_v4";

let data = loadData();

let currentBook = null;
let currentFolder = null;

let editingRecipeId = null;
let pendingRecipe = null;

let viewedRecipe = null;
let viewedPage = 1;

let selectedPrivacy = "private";


/* =========================
   DATA
========================= */

function loadData() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return { books: [] };
        }

        const parsed =
            JSON.parse(saved);

        return parsed &&
            Array.isArray(parsed.books)
            ? parsed
            : { books: [] };

    } catch {

        return { books: [] };

    }

}


function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

}


/* =========================
   SCREEN CONTROL
========================= */

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

    document
        .getElementById("mainScreen")
        .classList.add("hidden");

}


function showScreen(id) {

    hideScreens();

    document
        .getElementById(id)
        .classList.remove("hidden");

}


/* =========================
   HOME
========================= */

document
    .getElementById("makeCookbookButton")
    .addEventListener("click", () => {

        showScreen("makeScreen");

    });


document
    .getElementById("joinCookbookButton")
    .addEventListener("click", () => {

        showScreen("joinScreen");

    });


document
    .getElementById("publicBooksButton")
    .addEventListener("click", () => {

        showScreen("publicScreen");

        renderPublicBooks();

    });


/* =========================
   BACK
========================= */

document
    .getElementById("backFromMake")
    .addEventListener("click", goHome);

document
    .getElementById("backFromJoin")
    .addEventListener("click", goHome);

document
    .getElementById("backFromPublic")
    .addEventListener("click", goHome);


function goHome() {

    currentBook = null;
    currentFolder = null;

    hideScreens();

    document
        .getElementById("homeScreen")
        .classList.remove("hidden");

}


/* =========================
   PRIVACY
========================= */

document
    .getElementById("privateButton")
    .addEventListener("click", () => {

        selectedPrivacy = "private";

        document
            .getElementById("privateButton")
            .classList.add("selected");

        document
            .getElementById("publicButton")
            .classList.remove("selected");

    });


document
    .getElementById("publicButton")
    .addEventListener("click", () => {

        selectedPrivacy = "public";

        document
            .getElementById("publicButton")
            .classList.add("selected");

        document
            .getElementById("privateButton")
            .classList.remove("selected");

    });


/* =========================
   PASSWORD
========================= */

document
    .getElementById("showPasswordButton")
    .addEventListener("click", () => {

        togglePassword(
            "cookbookPassword"
        );

    });


document
    .getElementById("showJoinPassword")
    .addEventListener("click", () => {

        togglePassword(
            "joinPassword"
        );

    });


function togglePassword(id) {

    const input =
        document.getElementById(id);

    input.type =
        input.type === "password"
            ? "text"
            : "password";

}


/* =========================
   CREATE COOKBOOK
========================= */

document
    .getElementById("createCookbookButton")
    .addEventListener("click", createCookbook);


function createCookbook() {

    const name =
        document
            .getElementById("cookbookName")
            .value
            .trim();

    const password =
        document
            .getElementById("cookbookPassword")
            .value;

    const error =
        document.getElementById("makeError");


    error.textContent = "";


    if (!name) {

        error.textContent =
            "Please enter a cookbook name.";

        return;

    }


    if (password.length < 4) {

        error.textContent =
            "Password must be at least 4 characters.";

        return;

    }


    currentBook = {

        id: crypto.randomUUID(),

        name,

        privacy: selectedPrivacy,

        password,

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


/* =========================
   JOIN
========================= */

document
    .getElementById("joinButton")
    .addEventListener("click", joinBook);


function joinBook() {

    const name =
        document
            .getElementById("joinName")
            .value
            .trim();

    const password =
        document
            .getElementById("joinPassword")
            .value;

    const error =
        document.getElementById("joinError");


    error.textContent = "";


    const book =
        data.books.find(
            item =>
                item.name.toLowerCase() ===
                name.toLowerCase()
        );


    if (!book) {

        error.textContent =
            "Cookbook not found.";

        return;

    }


    if (
        book.password !== password
    ) {

        error.textContent =
            "Incorrect password.";

        return;

    }


    currentBook = book;

    openBook();

}


/* =========================
   PUBLIC BOOKS
========================= */

function renderPublicBooks() {

    const list =
        document.getElementById(
            "publicBooksList"
        );

    list.innerHTML = "";


    const books =
        data.books.filter(
            book =>
                book.privacy === "public"
        );


    if (!books.length) {

        list.innerHTML =
            `<p style="color:#9298a2">
                No public cookbooks yet.
            </p>`;

        return;

    }


    books.forEach(book => {

        const button =
            document.createElement("button");

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


/* =========================
   OPEN BOOK
========================= */

function openBook() {

    hideScreens();

    document
        .getElementById("mainScreen")
        .classList.remove("hidden");

    document
        .getElementById("mainBookName")
        .textContent =
        currentBook.name;

    document
        .getElementById("privacyBadge")
        .textContent =
        currentBook.privacy === "public"
            ? "🌐 Public"
            : "🔒 Private";

    currentFolder = null;

    document
        .getElementById("searchInput")
        .value = "";

    render();

}


/* =========================
   EXIT
========================= */

document
    .getElementById("exitBookButton")
    .addEventListener("click", goHome);


/* =========================
   SCANNER
========================= */

document
    .getElementById("scanButton")
    .addEventListener("click", () => {

        document
            .getElementById("cameraInput")
            .click();

    });


document
    .getElementById("cameraInput")
    .addEventListener("change", async event => {

        const file =
            event.target.files[0];

        if (!file) return;

        document
            .getElementById("pageCountModal")
            .classList.remove("hidden");

        pendingRecipe =
            await readRecipe(file);

    });


/* =========================
   OCR
========================= */

async function readRecipe(file) {

    const status =
        document.getElementById(
            "scanStatus"
        );

    try {

        status.textContent =
            "📸 Reading recipe...";


        const result =
            await Tesseract.recognize(
                file,
                "eng",
                {
                    logger(message) {

                        if (
                            message.status ===
                            "recognizing text"
                        ) {

                            status.textContent =
                                `🔎 Reading ${
                                    Math.round(
                                        message.progress * 100
                                    )
                                }%`;

                        }

                    }
                }
            );


        const text =
            cleanOCR(
                result.data.text
            );


        status.textContent =
            "✅ Recipe read. Choose pages.";


        return parseRecipe(text);


    } catch (error) {

        console.error(error);

        status.textContent =
            "❌ Could not read recipe.";

        document
            .getElementById("pageCountModal")
            .classList.add("hidden");

        return null;

    }

}


function cleanOCR(text) {

    return text
        .normalize("NFKC")
        .replace(/[░▒▓█■□◆◇]/g, "")
        .replace(/[^\S\r\n]+/g, " ")
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean)
        .join("\n");

}


function parseRecipe(text) {

    const lines =
        text
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean);


    let title = "";

    let section = "";

    const ingredients = [];
    const instructions = [];
    const notes = [];


    for (const original of lines) {

        const lower =
            original.toLowerCase();


        if (
            /^(ingredients?|what you need)\b/
                .test(lower)
        ) {

            section = "ingredients";
            continue;

        }


        if (
            /^(instructions?|directions?|method|steps?)\b/
                .test(lower)
        ) {

            section = "instructions";
            continue;

        }


        if (
            /^(notes?|tips?)\b/
                .test(lower)
        ) {

            section = "notes";
            continue;

        }


        let line =
            original
                .replace(
                    /^[•●▪◦*-]\s*/,
                    ""
                )
                .replace(
                    /^\d+[\.\)]\s*/,
                    ""
                )
                .trim();


        if (!line) continue;


        if (
            !title &&
            !section &&
            line.length <= 80
        ) {

            title = line;
            continue;

        }


        if (section === "ingredients") {

            ingredients.push(line);

        }

        else if (section === "instructions") {

            instructions.push(line);

        }

        else if (section === "notes") {

            notes.push(line);

        }

    }


    return {

        title,

        ingredients:
            [...new Set(ingredients)],

        instructions:
            [...new Set(instructions)],

        notes:
            notes.join(" ")

    };

}


/* =========================
   PAGE COUNT
========================= */

document
    .querySelectorAll("[data-pages]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                if (!pendingRecipe) return;


                const pages =
                    Number(
                        button.dataset.pages
                    );


                pendingRecipe.pages =
                    pages;


                document
                    .getElementById(
                        "pageCountModal"
                    )
                    .classList.add("hidden");


                openEditor(
                    pendingRecipe
                );

            }
        );

    });


/* =========================
   EDITOR
========================= */

function openEditor(recipe) {

    editingRecipeId =
        recipe.id || null;


    document
        .getElementById("recipeTitleInput")
        .value =
        recipe.title || "";


    document
        .getElementById("recipeCuisine")
        .value =
        recipe.cuisine || "";


    document
        .getElementById("recipeIngredients")
        .value =
        (recipe.ingredients || [])
            .join("\n");


    document
        .getElementById("recipeInstructions")
        .value =
        (recipe.instructions || [])
            .join("\n");


    document
        .getElementById("recipeNotes")
        .value =
        recipe.notes || "";


    const folderSelect =
        document.getElementById(
            "recipeFolder"
        );


    folderSelect.innerHTML = "";


    currentBook.folders.forEach(
        folder => {

            const option =
                document.createElement(
                    "option"
                );

            option.value = folder;

            option.textContent = folder;

            folderSelect.appendChild(
                option
            );

        }
    );


    folderSelect.value =
        recipe.folder ||
        currentBook.folders[0];


    document
        .getElementById("editorModal")
        .classList.remove("hidden");

}


/* =========================
   SAVE RECIPE
========================= */

document
    .getElementById("saveRecipeButton")
    .addEventListener(
        "click",
        saveRecipe
    );


function saveRecipe() {

    const title =
        document
            .getElementById("recipeTitleInput")
            .value
            .trim();


    const error =
        document.getElementById(
            "editorError"
        );


    if (!title) {

        error.textContent =
            "Recipe title is required.";

        return;

    }


    error.textContent = "";


    const recipe = {

        id:
            editingRecipeId ||
            crypto.randomUUID(),

        title,

        cuisine:
            document
                .getElementById("recipeCuisine")
                .value
                .trim(),

        folder:
            document
                .getElementById("recipeFolder")
                .value,

        ingredients:
            document
                .getElementById("recipeIngredients")
                .value
                .split("\n")
                .map(x => x.trim())
                .filter(Boolean),

        instructions:
            document
                .getElementById("recipeInstructions")
                .value
                .split("\n")
                .map(x => x.trim())
                .filter(Boolean),

        notes:
            document
                .getElementById("recipeNotes")
                .value
                .trim(),

        pages:
            pendingRecipe?.pages ||
            1

    };


    const index =
        currentBook.recipes.findIndex(
            item =>
                item.id === recipe.id
        );


    if (index === -1) {

        currentBook.recipes.push(recipe);

    } else {

        currentBook.recipes[index] =
            recipe;

    }


    saveCurrentBook();


    document
        .getElementById("editorModal")
        .classList.add("hidden");


    pendingRecipe = null;

    editingRecipeId = null;

    render();

}


/* =========================
   SAVE BOOK
========================= */

function saveCurrentBook() {

    const index =
        data.books.findIndex(
            book =>
                book.id === currentBook.id
        );


    if (index === -1) {

        data.books.push(currentBook);

    } else {

        data.books[index] =
            currentBook;

    }


    saveData();

}


/* =========================
   RENDER
========================= */

function render() {

    renderFolders();

    renderRecipes();

}


function renderFolders() {

    const container =
        document.getElementById("folders");

    container.innerHTML = "";


    currentBook.folders.forEach(
        folder => {

            const count =
                currentBook.recipes.filter(
                    recipe =>
                        recipe.folder === folder
                ).length;


            const button =
                document.createElement("button");


            button.type = "button";

            button.className =
                "folder-card";


            button.innerHTML = `
                <div class="folder-icon">📁</div>
                <strong>${escapeHTML(folder)}</strong>
                <div class="folder-count">
                    ${count}
                    ${count === 1 ? "recipe" : "recipes"}
                </div>
            `;


            button.addEventListener(
                "click",
                () => {

                    currentFolder =
                        folder;

                    document
                        .getElementById(
                            "recipeTitle"
                        )
                        .textContent =
                        "📁 " + folder;

                    renderRecipes();

                }
            );


            container.appendChild(button);

        }
    );

}


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
        document
            .getElementById("searchInput")
            .value
            .toLowerCase()
            .trim();


    if (search) {

        recipes =
            recipes.filter(
                recipe =>
                    recipe.title
                        .toLowerCase()
                        .includes(search)
                    ||
                    recipe.ingredients
                        .join(" ")
                        .toLowerCase()
                        .includes(search)
            );

    }


    document
        .getElementById("recipeCount")
        .textContent =
        `${recipes.length} ${
            recipes.length === 1
                ? "recipe"
                : "recipes"
        }`;


    recipes.forEach(recipe => {

        const card =
            document.createElement("div");

        card.className =
            "recipe-card";


        card.innerHTML = `
            <h3>${escapeHTML(recipe.title)}</h3>

            <div class="recipe-meta">
                ${escapeHTML(recipe.cuisine || "General")}
                ·
                ${escapeHTML(recipe.folder)}
                ·
                ${recipe.pages || 1} page${(recipe.pages || 1) === 1 ? "" : "s"}
            </div>
        `;


        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "recipe-open";

        button.textContent =
            "Open Recipe";


        button.addEventListener(
            "click",
            () => openRecipe(recipe)
        );


        card.appendChild(button);

        container.appendChild(card);

    });

}


/* =========================
   SEARCH
========================= */

document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        renderRecipes
    );


document
    .getElementById("allRecipesButton")
    .addEventListener(
        "click",
        () => {

            currentFolder = null;

            document
                .getElementById("recipeTitle")
                .textContent =
                "📖 All Recipes";

            renderRecipes();

        }
    );


/* =========================
   VIEW RECIPE
========================= */

function openRecipe(recipe) {

    viewedRecipe = recipe;

    viewedPage = 1;


    document
        .getElementById("viewTitle")
        .textContent =
        recipe.title;


    document
        .getElementById("viewCuisine")
        .textContent =
        recipe.cuisine || "";


    const ingredients =
        document.getElementById(
            "viewIngredients"
        );

    ingredients.innerHTML = "";


    recipe.ingredients.forEach(
        item => {

            const li =
                document.createElement("li");

            li.textContent = item;

            ingredients.appendChild(li);

        }
    );


    const instructions =
        document.getElementById(
            "viewInstructions"
        );

    instructions.innerHTML = "";


    recipe.instructions.forEach(
        item => {

            const li =
                document.createElement("li");

            li.textContent = item;

            instructions.appendChild(li);

        }
    );


    document
        .getElementById("viewNotes")
        .textContent =
        recipe.notes || "No notes.";


    document
        .getElementById("recipeModal")
        .classList.remove("hidden");


    updateRecipePage();

}


/* =========================
   RECIPE PAGES
========================= */

function updateRecipePage() {

    const total =
        viewedRecipe.pages || 1;


    document
        .getElementById("viewPage1")
        .classList.add("hidden");

    document
        .getElementById("viewPage2")
        .classList.add("hidden");

    document
        .getElementById("viewPage3")
        .classList.add("hidden");


    if (viewedPage === 1) {

        document
            .getElementById("viewPage1")
            .classList.remove("hidden");

    }

    else if (viewedPage === 2) {

        document
            .getElementById("viewPage2")
            .classList.remove("hidden");

    }

    else {

        document
            .getElementById("viewPage3")
            .classList.remove("hidden");

    }


    document
        .getElementById("pageNumber")
        .textContent =
        `Page ${viewedPage} of ${total}`;


    document
        .getElementById("previousPage")
        .disabled =
        viewedPage <= 1;


    document
        .getElementById("nextPage")
        .disabled =
        viewedPage >= total;

}


document
    .getElementById("previousPage")
    .addEventListener(
        "click",
        () => {

            if (viewedPage > 1) {

                viewedPage--;

                updateRecipePage();

            }

        }
    );


document
    .getElementById("nextPage")
    .addEventListener(
        "click",
        () => {

            const total =
                viewedRecipe.pages || 1;

            if (viewedPage < total) {

                viewedPage++;

                updateRecipePage();

            }

        }
    );


document
    .getElementById("closeRecipe")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("recipeModal")
                .classList.add("hidden");

        }
    );


/* =========================
   FOLDERS
========================= */

document
    .getElementById("makeFolderButton")
    .addEventListener(
        "click",
        () => {

            const name =
                prompt("Folder name:");

            if (!name?.trim()) return;

            const clean =
                name.trim();


            if (
                currentBook.folders.includes(
                    clean
                )
            ) {

                alert("That folder already exists.");

                return;

            }


            currentBook.folders.push(clean);

            saveCurrentBook();

            render();

        }
    );


document
    .getElementById("editFolderButton")
    .addEventListener(
        "click",
        () => {

            const oldName =
                prompt(
                    "Folder to edit:\n\n" +
                    currentBook.folders.join("\n")
                );


            if (
                !currentBook.folders.includes(
                    oldName
                )
            ) return;


            const newName =
                prompt("New folder name:");


            if (!newName?.trim()) return;


            const index =
                currentBook.folders.indexOf(
                    oldName
                );


            currentBook.folders[index] =
                newName.trim();


            currentBook.recipes.forEach(
                recipe => {

                    if (
                        recipe.folder === oldName
                    ) {

                        recipe.folder =
                            newName.trim();

                    }

                }
            );


            saveCurrentBook();

            render();

        }
    );


document
    .getElementById("deleteFolderButton")
    .addEventListener(
        "click",
        () => {

            if (
                currentBook.folders.length <= 1
            ) {

                alert(
                    "You need at least one folder."
                );

                return;

            }


            const name =
                prompt(
                    "Folder to delete:\n\n" +
                    currentBook.folders.join("\n")
                );


            if (
                !currentBook.folders.includes(name)
            ) return;


            if (
                !confirm(
                    `Delete "${name}"?`
                )
            ) return;


            currentBook.folders =
                currentBook.folders.filter(
                    folder =>
                        folder !== name
                );


            const replacement =
                currentBook.folders[0];


            currentBook.recipes.forEach(
                recipe => {

                    if (
                        recipe.folder === name
                    ) {

                        recipe.folder =
                            replacement;

                    }

                }
            );


            currentFolder = null;

            saveCurrentBook();

            render();

        }
    );


/* =========================
   EDIT RECIPE
========================= */

document
    .getElementById("editRecipeButton")
    .addEventListener(
        "click",
        () => {

            if (!currentBook.recipes.length) {

                alert("No recipes yet.");

                return;

            }


            const list =
                currentBook.recipes
                    .map(
                        (recipe, index) =>
                            `${index + 1}. ${recipe.title}`
                    )
                    .join("\n");


            const number =
                Number(
                    prompt(
                        list +
                        "\n\nEnter recipe number:"
                    )
                );


            const recipe =
                currentBook.recipes[
                    number - 1
                ];


            if (!recipe) return;


            pendingRecipe =
                recipe;


            openEditor(recipe);

        }
    );


/* =========================
   DELETE RECIPE
========================= */

document
    .getElementById("deleteRecipeButton")
    .addEventListener(
        "click",
        () => {

            if (!currentBook.recipes.length) {

                alert("No recipes yet.");

                return;

            }


            const list =
                currentBook.recipes
                    .map(
                        (recipe, index) =>
                            `${index + 1}. ${recipe.title}`
                    )
                    .join("\n");


            const number =
                Number(
                    prompt(
                        list +
                        "\n\nEnter recipe number:"
                    )
                );


            const index =
                number - 1;


            if (
                !currentBook.recipes[index]
            ) return;


            if (
                !confirm(
                    `Delete "${currentBook.recipes[index].title}"?`
                )
            ) return;


            currentBook.recipes.splice(
                index,
                1
            );


            saveCurrentBook();

            render();

        }
    );


/* =========================
   CLOSE EDITOR
========================= */

document
    .getElementById("closeEditor")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("editorModal")
                .classList.add("hidden");

        }
    );


/* =========================
   ESCAPE
========================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================
   START
========================= */

/*
 * Always open on the MealMind
 * starter screen.
 */

hideScreens();

document
    .getElementById("homeScreen")
    .classList.remove("hidden");
