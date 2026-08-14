const STORAGE_KEY = "mealmind_v3";

let data = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "null"
);

let currentBook = null;
let currentFolder = null;
let editingRecipe = null;
let pendingScan = null;
let viewedRecipe = null;
let viewedPage = 1;


/* =========================
   ELEMENTS
========================= */

const homeScreen =
    document.getElementById("homeScreen");

const makeScreen =
    document.getElementById("makeScreen");

const joinScreen =
    document.getElementById("joinScreen");

const publicScreen =
    document.getElementById("publicScreen");

const mainScreen =
    document.getElementById("mainScreen");


/* =========================
   HOME BUTTONS
========================= */

document.getElementById(
    "makeCookbookButton"
).onclick = () => {

    hideScreens();

    makeScreen.classList.remove(
        "hidden"
    );
};


document.getElementById(
    "joinCookbookButton"
).onclick = () => {

    hideScreens();

    joinScreen.classList.remove(
        "hidden"
    );
};


document.getElementById(
    "publicBooksButton"
).onclick = () => {

    hideScreens();

    publicScreen.classList.remove(
        "hidden"
    );

    renderPublicBooks();
};


/* =========================
   BACK BUTTONS
========================= */

document.getElementById(
    "backFromMake"
).onclick = goHome;


document.getElementById(
    "backFromJoin"
).onclick = goHome;


document.getElementById(
    "backFromPublic"
).onclick = goHome;


function goHome() {

    currentBook = null;

    currentFolder = null;

    hideScreens();

    homeScreen.classList.remove(
        "hidden"
    );

}


/*
 * IMPORTANT:
 * Every time the page loads,
 * it starts at Home.
 */

function hideScreens() {

    homeScreen.classList.add(
        "hidden"
    );

    makeScreen.classList.add(
        "hidden"
    );

    joinScreen.classList.add(
        "hidden"
    );

    publicScreen.classList.add(
        "hidden"
    );

    mainScreen.classList.add(
        "hidden"
    );

}


/* =========================
   PRIVACY
========================= */

let privacy =
    "private";


document.getElementById(
    "privateButton"
).onclick = () => {

    privacy = "private";

    document.getElementById(
        "privateButton"
    ).classList.add("selected");

    document.getElementById(
        "publicButton"
    ).classList.remove("selected");

};


document.getElementById(
    "publicButton"
).onclick = () => {

    privacy = "public";

    document.getElementById(
        "publicButton"
    ).classList.add("selected");

    document.getElementById(
        "privateButton"
    ).classList.remove("selected");

};


/* =========================
   SHOW PASSWORD
========================= */

document.getElementById(
    "showPasswordButton"
).onclick = () => {

    const input =
        document.getElementById(
            "cookbookPassword"
        );

    input.type =
        input.type === "password"
            ? "text"
            : "password";

};


document.getElementById(
    "showJoinPassword"
).onclick = () => {

    const input =
        document.getElementById(
            "joinPassword"
        );

    input.type =
        input.type === "password"
            ? "text"
            : "password";

};


/* =========================
   CREATE COOKBOOK
========================= */

document.getElementById(
    "createCookbookButton"
).onclick = () => {

    const name =
        document.getElementById(
            "cookbookName"
        ).value.trim();

    const password =
        document.getElementById(
            "cookbookPassword"
        ).value;


    const error =
        document.getElementById(
            "makeError"
        );


    error.textContent = "";


    if (!name) {

        error.textContent =
            "Enter a cookbook name.";

        return;

    }


    if (
        password.length < 4
    ) {

        error.textContent =
            "Password must be at least 4 characters.";

        return;

    }


    /*
     * Each recipe gets its own page count.
     */

    currentBook = {

        id:
            crypto.randomUUID(),

        name,

        privacy,

        password,

        recipes: [],

        folders: [
            "Sweet",
            "Savoury",
            "Fried",
            "International"
        ]

    };


    saveData();


    openBook();

};


/* =========================
   SAVE
========================= */

function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

}


/* =========================
   OPEN BOOK
========================= */

function openBook() {

    hideScreens();

    mainScreen.classList.remove(
        "hidden"
    );


    document.getElementById(
        "mainBookName"
    ).textContent =
        currentBook.name;


    document.getElementById(
        "privacyBadge"
    ).textContent =
        currentBook.privacy === "public"
            ? "🌐 Public"
            : "🔒 Private";


    render();

}


/* =========================
   EXIT BOOK
========================= */

document.getElementById(
    "exitBookButton"
).onclick = goHome;


/* =========================
   JOIN
========================= */

document.getElementById(
    "joinButton"
).onclick = () => {

    const name =
        document.getElementById(
            "joinName"
        ).value.trim();

    const password =
        document.getElementById(
            "joinPassword"
        ).value;


    const error =
        document.getElementById(
            "joinError"
        );


    error.textContent = "";


    if (!data || !data.books) {

        error.textContent =
            "No cookbooks are available on this device.";

        return;

    }


    const book =
        data.books.find(
            item =>
                item.name === name
        );


    if (!book) {

        error.textContent =
            "Cookbook not found.";

        return;

    }


    if (
        book.privacy === "private" &&
        book.password !== password
    ) {

        error.textContent =
            "Incorrect password.";

        return;

    }


    currentBook =
        book;


    openBook();

};


/* =========================
   PUBLIC BOOKS
========================= */

function renderPublicBooks() {

    const container =
        document.getElementById(
            "publicBooksList"
        );


    container.innerHTML = "";


    if (
        !data ||
        !data.books
    ) {

        container.innerHTML =
            `<p class="muted">
                No public books yet.
            </p>`;

        return;

    }


    const books =
        data.books.filter(
            book =>
                book.privacy ===
                "public"
        );


    if (!books.length) {

        container.innerHTML =
            `<p class="muted">
                No public books yet.
            </p>`;

        return;

    }


    books.forEach(
        book => {

            const item =
                document.createElement(
                    "button"
                );


            item.className =
                "secondary";


            item.textContent =
                `📖 ${book.name}`;


            item.onclick =
                () => {

                    currentBook =
                        book;

                    openBook();

                };


            container.appendChild(
                item
            );

        }
    );

}


/* =========================
   SCANNER
========================= */

document.getElementById(
    "scanButton"
).onclick = () => {

    document.getElementById(
        "cameraInput"
    ).click();

};


document.getElementById(
    "cameraInput"
).onchange =
    async event => {

        const file =
            event.target.files[0];


        if (!file)
            return;


        pendingScan =
            file;


        /*
         * Ask for recipe pages AFTER scanning.
         */

        document.getElementById(
            "pageCountModal"
        ).classList.remove(
            "hidden"
        );


        await scanRecipe(
            file
        );

    };


/* =========================
   OCR
========================= */

async function scanRecipe(
    file
) {

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

                    logger:
                        message => {

                            if (
                                message.status ===
                                "recognizing text"
                            ) {

                                status.textContent =
                                    `🔎 Reading ${Math.round(
                                        message.progress * 100
                                    )}%`;

                            }

                        }

                }
            );


        const text =
            cleanText(
                result.data.text
            );


        pendingScan =
            parseRecipe(
                text
            );


        status.textContent =
            "✅ Recipe scanned. Choose pages.";

    } catch (
        error
    ) {

        console.error(
            error
        );

        status.textContent =
            "❌ Could not read recipe.";

    }

}


/* =========================
   CLEAN OCR
========================= */

function cleanText(
    text
) {

    return text
        .normalize("NFKC")
        .replace(
            /[^\S\r\n]+/g,
            " "
        )
        .replace(
            /[░▒▓█■□◆◇]/g,
            ""
        )
        .split("\n")
        .map(
            line =>
                line.trim()
        )
        .filter(Boolean)
        .join("\n");

}


/* =========================
   PARSE
========================= */

function parseRecipe(
    text
) {

    const lines =
        text
            .split("\n")
            .filter(Boolean);


    let title = "";

    let mode = "";

    const ingredients = [];

    const instructions = [];

    const notes = [];


    for (
        const original of lines
    ) {

        let line =
            original.trim();


        const lower =
            line.toLowerCase();


        if (
            /^(ingredients?|what you need)\b/
                .test(lower)
        ) {

            mode =
                "ingredients";

            continue;

        }


        if (
            /^(instructions?|directions?|method|steps?)\b/
                .test(lower)
        ) {

            mode =
                "instructions";

            continue;

        }


        if (
            /^(notes?|tips?)\b/
                .test(lower)
        ) {

            mode =
                "notes";

            continue;

        }


        line =
            line
                .replace(
                    /^[•●▪◦*-]\s*/,
                    ""
                )
                .replace(
                    /^\d+[\.\)]\s*/,
                    ""
                )
                .trim();


        if (!line)
            continue;


        if (
            !title &&
            !mode &&
            line.length < 80
        ) {

            title =
                line;

            continue;

        }


        if (
            mode ===
            "ingredients"
        ) {

            ingredients.push(
                line
            );

        }

        else if (
            mode ===
            "instructions"
        ) {

            instructions.push(
                line
            );

        }

        else if (
            mode ===
            "notes"
        ) {

            notes.push(
                line
            );

        }

    }


    return {

        title,

        ingredients:
            [...new Set(
                ingredients
            )],

        instructions:
            [...new Set(
                instructions
            )],

        notes:
            notes.join(" ")

    };

}


/* =========================
   PAGE COUNT
========================= */

document.querySelectorAll(
    "[data-pages]"
).forEach(
    button => {

        button.onclick =
            () => {

                const pages =
                    Number(
                        button.dataset.pages
                    );


                document.getElementById(
                    "pageCountModal"
                ).classList.add(
                    "hidden"
                );


                if (
                    !pendingScan
                )
                    return;


                openEditor(
                    pendingScan,
                    pages
                );

            };

    }
);


/* =========================
   EDITOR
========================= */

function openEditor(
    recipe,
    pages = 1
) {

    editingRecipe =
        recipe.id || null;


    recipe.pages =
        pages;


    document.getElementById(
        "recipeTitleInput"
    ).value =
        recipe.title || "";


    document.getElementById(
        "recipeCuisine"
    ).value =
        recipe.cuisine ||
        "General";


    document.getElementById(
        "recipeIngredients"
    ).value =
        (recipe.ingredients || [])
            .join("\n");


    document.getElementById(
        "recipeInstructions"
    ).value =
        (recipe.instructions || [])
            .join("\n");


    document.getElementById(
        "recipeNotes"
    ).value =
        recipe.notes || "";


    const select =
        document.getElementById(
            "recipeFolder"
        );


    select.innerHTML = "";


    currentBook.folders.forEach(
        folder => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                folder;

            option.textContent =
                folder;

            select.appendChild(
                option
            );

        }
    );


    select.value =
        recipe.folder ||
        currentBook.folders[0];


    document.getElementById(
        "editorModal"
    ).classList.remove(
        "hidden"
    );

}


/* =========================
   SAVE RECIPE
========================= */

document.getElementById(
    "saveRecipeButton"
).onclick = () => {

    const title =
        document.getElementById(
            "recipeTitleInput"
        ).value.trim();


    const ingredients =
        document.getElementById(
            "recipeIngredients"
        ).value
        .split("\n")
        .map(
            x => x.trim()
        )
        .filter(Boolean);


    const instructions =
        document.getElementById(
            "recipeInstructions"
        ).value
        .split("\n")
        .map(
            x => x.trim()
        )
        .filter(Boolean);


    const recipe = {

        id:
            editingRecipe ||
            crypto.randomUUID(),

        title,

        folder:
            document.getElementById(
                "recipeFolder"
            ).value,

        cuisine:
            document.getElementById(
                "recipeCuisine"
            ).value.trim(),

        ingredients,

        instructions,

        notes:
            document.getElementById(
                "recipeNotes"
            ).value.trim(),

        pages:
            pendingScan?.pages ||
            1

    };


    const index =
        currentBook.recipes.findIndex(
            item =>
                item.id ===
                recipe.id
        );


    if (
        index === -1
    ) {

        currentBook.recipes.push(
            recipe
        );

    } else {

        currentBook.recipes[index] =
            recipe;

    }


    saveCurrentBook();


    document.getElementById(
        "editorModal"
    ).classList.add(
        "hidden"
    );


    pendingScan =
        null;


    render();

};


/* =========================
   SAVE CURRENT BOOK
========================= */

function saveCurrentBook() {

    if (!data)
        data = {
            books: []
        };


    if (!data.books)
        data.books = [];


    const index =
        data.books.findIndex(
            book =>
                book.id ===
                currentBook.id
        );


    if (
        index === -1
    ) {

        data.books.push(
            currentBook
        );

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


/* =========================
   FOLDERS
========================= */

function renderFolders() {

    const container =
        document.getElementById(
            "folders"
        );


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
                    ${count} ${
                        count === 1
                            ? "recipe"
                            : "recipes"
                    }
                </div>
            `;


            button.onclick =
                () => {

                    currentFolder =
                        folder;

                    document.getElementById(
                        "recipeTitle"
                    ).textContent =
                        "📁 " +
                        folder;

                    renderRecipes();

                };


            container.appendChild(
                button
            );

        }
    );

}


/* =========================
   RECIPES
========================= */

function renderRecipes() {

    const container =
        document.getElementById(
            "recipes"
        );


    container.innerHTML = "";


    let recipes =
        currentBook.recipes;


    if (
        currentFolder
    ) {

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
        .toLowerCase()
        .trim();


    if (
        search
    ) {

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


    document.getElementById(
        "recipeCount"
    ).textContent =
        `${recipes.length} ${
            recipes.length === 1
                ? "recipe"
                : "recipes"
        }`;


    recipes.forEach(
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
                    ·
                    ${recipe.pages || 1} page${
                        (recipe.pages || 1) === 1
                            ? ""
                            : "s"
                    }
                </div>
            `;


            const open =
                document.createElement(
                    "button"
                );


            open.className =
                "recipe-open";


            open.textContent =
                "Open Recipe";


            open.onclick =
                () => openRecipe(
                    recipe
                );


            card.appendChild(
                open
            );


            container.appendChild(
                card
            );

        }
    );

}


/* =========================
   SEARCH
========================= */

document.getElementById(
    "searchInput"
).oninput =
    renderRecipes;


/* =========================
   ALL RECIPES
========================= */

document.getElementById(
    "allRecipesButton"
).onclick = () => {

    currentFolder =
        null;

    document.getElementById(
        "recipeTitle"
    ).textContent =
        "📖 All Recipes";

    renderRecipes();

};


/* =========================
   VIEW RECIPE
========================= */

function openRecipe(
    recipe
) {

    viewedRecipe =
        recipe;

    viewedPage =
        1;


    document.getElementById(
        "viewTitle"
    ).textContent =
        recipe.title;


    document.getElementById(
        "viewCuisine"
    ).textContent =
        recipe.cuisine || "";


    const ingredients =
        document.getElementById(
            "viewIngredients"
        );


    ingredients.innerHTML = "";


    recipe.ingredients.forEach(
        ingredient => {

            const li =
                document.createElement(
                    "li"
                );

            li.textContent =
                ingredient;

            ingredients.appendChild(
                li
            );

        }
    );


    const instructions =
        document.getElementById(
            "viewInstructions"
        );


    instructions.innerHTML = "";


    recipe.instructions.forEach(
        instruction => {

            const li =
                document.createElement(
                    "li"
                );

            li.textContent =
                instruction;

            instructions.appendChild(
                li
            );

        }
    );


    document.getElementById(
        "viewNotes"
    ).textContent =
        recipe.notes ||
        "No notes.";


    document.getElementById(
        "recipeModal"
    ).classList.remove(
        "hidden"
    );


    updateRecipePage();

}


/* =========================
   RECIPE PAGES
========================= */

function updateRecipePage() {

    const total =
        viewedRecipe.pages ||
        1;


    document.getElementById(
        "viewPage1"
    ).classList.add(
        "hidden"
    );

    document.getElementById(
        "viewPage2"
    ).classList.add(
        "hidden"
    );

    document.getElementById(
        "viewPage3"
    ).classList.add(
        "hidden"
    );


    /*
     * Page 1:
     * What You Need
     *
     * Page 2:
     * Instructions
     *
     * Page 3+:
     * Notes
     */


    if (
        viewedPage === 1
    ) {

        document.getElementById(
            "viewPage1"
        ).classList.remove(
            "hidden"
        );

    }


    else if (
        viewedPage === 2
    ) {

        document.getElementById(
            "viewPage2"
        ).classList.remove(
            "hidden"
        );

    }


    else {

        document.getElementById(
            "viewPage3"
        ).classList.remove(
            "hidden"
        );

    }


    document.getElementById(
        "pageNumber"
    ).textContent =
        `Page ${viewedPage} of ${total}`;


    document.getElementById(
        "previousPage"
    ).disabled =
        viewedPage <= 1;


    document.getElementById(
        "nextPage"
    ).disabled =
        viewedPage >= total;

}


document.getElementById(
    "previousPage"
).onclick = () => {

    if (
        viewedPage > 1
    ) {

        viewedPage--;

        updateRecipePage();

    }

};


document.getElementById(
    "nextPage"
).onclick = () => {

    const total =
        viewedRecipe.pages ||
        1;


    if (
        viewedPage < total
    ) {

        viewedPage++;

        updateRecipePage();

    }

};


document.getElementById(
    "closeRecipe"
).onclick = () => {

    document.getElementById(
        "recipeModal"
    ).classList.add(
        "hidden"
    );

};


/* =========================
   MAKE FOLDER
========================= */

document.getElementById(
    "makeFolderButton"
).onclick = () => {

    const name =
        prompt(
            "New folder name:"
        );


    if (
        !name ||
        !name.trim()
    )
        return;


    const clean =
        name.trim();


    if (
        currentBook.folders.includes(
            clean
        )
    ) {

        alert(
            "That folder already exists."
        );

        return;

    }


    currentBook.folders.push(
        clean
    );


    saveCurrentBook();

    render();

};


/* =========================
   EDIT FOLDER
========================= */

document.getElementById(
    "editFolderButton"
).onclick = () => {

    const oldName =
        prompt(
            "Folder to edit:\n\n" +
            currentBook.folders.join("\n")
        );


    if (
        !currentBook.folders.includes(
            oldName
        )
    )
        return;


    const newName =
        prompt(
            "New folder name:"
        );


    if (
        !newName ||
        currentBook.folders.includes(
            newName
        )
    )
        return;


    const index =
        currentBook.folders.indexOf(
            oldName
        );


    currentBook.folders[index] =
        newName;


    currentBook.recipes.forEach(
        recipe => {

            if (
                recipe.folder ===
                oldName
            ) {

                recipe.folder =
                    newName;

            }

        }
    );


    saveCurrentBook();

    render();

};


/* =========================
   DELETE FOLDER
========================= */

document.getElementById(
    "deleteFolderButton"
).onclick = () => {

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
        !currentBook.folders.includes(
            name
        )
    )
        return;


    if (
        !confirm(
            `Delete ${name}?`
        )
    )
        return;


    currentBook.folders =
        currentBook.folders.filter(
            folder =>
                folder !==
                name
        );


    const replacement =
        currentBook.folders[0];


    currentBook.recipes.forEach(
        recipe => {

            if (
                recipe.folder ===
                name
            ) {

                recipe.folder =
                    replacement;

            }

        }
    );


    currentFolder =
        null;


    saveCurrentBook();

    render();

};


/* =========================
   EDIT RECIPE
========================= */

document.getElementById(
    "editRecipeButton"
).onclick = () => {

    if (
        !currentBook.recipes.length
    ) {

        alert(
            "No recipes yet."
        );

        return;

    }


    const list =
        currentBook.recipes
            .map(
                (recipe, i) =>
                    `${i + 1}. ${recipe.title}`
            )
            .join("\n");


    const answer =
        Number(
            prompt(
                list +
                "\n\nRecipe number:"
            )
        ) - 1;


    if (
        !currentBook.recipes[answer]
    )
        return;


    openEditor(
        currentBook.recipes[answer],
        currentBook.recipes[answer].pages || 1
    );

};


/* =========================
   DELETE RECIPE
========================= */

document.getElementById(
    "deleteRecipeButton"
).onclick = () => {

    if (
        !currentBook.recipes.length
    ) {

        alert(
            "No recipes yet."
        );

        return;

    }


    const list =
        currentBook.recipes
            .map(
                (recipe, i) =>
                    `${i + 1}. ${recipe.title}`
            )
            .join("\n");


    const answer =
        Number(
            prompt(
                list +
                "\n\nRecipe number to delete:"
            )
        ) - 1;


    if (
        !currentBook.recipes[answer]
    )
        return;


    if (
        !confirm(
            `Delete "${currentBook.recipes[answer].title}"?`
        )
    )
        return;


    currentBook.recipes.splice(
        answer,
        1
    );


    saveCurrentBook();

    render();

};


/* =========================
   CLOSE EDITOR
========================= */

document.getElementById(
    "closeEditor"
).onclick = () => {

    document.getElementById(
        "editorModal"
    ).classList.add(
        "hidden"
    );

};


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(
    value
) {

    return String(value)
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


/* =========================
   INITIAL DATA
========================= */

if (!data) {

    data = {
        books: []
    };

    saveData();

}


/*
 * ALWAYS START AT HOME.
 */

hideScreens();

homeScreen.classList.remove(
    "hidden"
);
