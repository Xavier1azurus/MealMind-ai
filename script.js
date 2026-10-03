/* =========================================================
   MEALMIND
   NEW COOKBOOK-FIRST JAVASCRIPT
========================================================= */


/* =========================================================
   API
========================================================= */

const MOONPLUG_API =
    "https://innovation-latinas-separately-accounting.trycloudflare.com";

const MEALMIND_API =
    MOONPLUG_API;


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "mealmind_books";
const CURRENT_BOOK_KEY = "mealmind_current_book";
const CURRENT_USER_KEY = "mealmind_current_user";


/* =========================================================
   APP DATA
========================================================= */

let currentBook = null;
let currentRecipe = null;
let currentFolder = "";
let currentScanFiles = [];
let selectedPageCount = 0;
let isScanning = false;


/* =========================================================
   BASIC HELPERS
========================================================= */

function makeID() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );

}


function getBooks() {

    try {

        return JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        ) || [];

    } catch {

        return [];

    }

}


function saveBooks(books) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(books)
    );

}


function normalizeBook(book) {

    if (!book) {
        return;
    }

    if (!Array.isArray(book.folders)) {
        book.folders = [];
    }

    if (!Array.isArray(book.recipes)) {
        book.recipes = [];
    }

    if (!Array.isArray(book.members)) {
        book.members = [];
    }

    if (!book.code) {
        book.code = "";
    }

    if (!book.privacy) {
        book.privacy = "private";
    }

}


function saveCurrentBook() {

    if (!currentBook) {
        return;
    }

    normalizeBook(currentBook);

    const books = getBooks();

    const index = books.findIndex(
        book => book.id === currentBook.id
    );

    if (index === -1) {

        books.push(currentBook);

    } else {

        books[index] = currentBook;

    }

    saveBooks(books);

}


/* =========================================================
   SCREEN SYSTEM
========================================================= */

function showScreen(id) {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.remove("active");
            screen.classList.add("hidden");

        });


    const screen =
        document.getElementById(id);


    if (!screen) {
        return;
    }


    screen.classList.remove("hidden");
    screen.classList.add("active");

}


function goHome() {

    currentRecipe = null;
    currentFolder = "";

    showScreen("homeScreen");

}


/* =========================================================
   BUTTON SYSTEM
========================================================= */

function setupActions() {

    document.addEventListener(
        "click",
        function(event) {

            const button =
                event.target.closest(
                    "[data-action]"
                );


            if (!button) {
                return;
            }


            const action =
                button.getAttribute(
                    "data-action"
                );


            switch (action) {


                /* -----------------------------------------
                   HOME
                ----------------------------------------- */

                case "home":

                    goHome();

                    break;


                /* -----------------------------------------
                   CREATE COOKBOOK PAGE
                ----------------------------------------- */

                case "make-cookbook":

                    resetCreateForm();

                    showScreen(
                        "makeScreen"
                    );

                    break;


                /* -----------------------------------------
                   CREATE COOKBOOK
                ----------------------------------------- */

                case "create-cookbook":

                    createCookbook();

                    break;


                /* -----------------------------------------
                   JOIN PAGE
                ----------------------------------------- */

                case "join-cookbook":

                    resetJoinForm();

                    showScreen(
                        "joinScreen"
                    );

                    break;


                /* -----------------------------------------
                   JOIN
                ----------------------------------------- */

                case "join":

                    joinCookbook();

                    break;


                /* -----------------------------------------
                   EXIT
                ----------------------------------------- */

                case "exit-book":

                    leaveCookbook();

                    break;


                /* -----------------------------------------
                   SCAN
                ----------------------------------------- */

                case "scan":

                    openPageCountModal();

                    break;


                case "cancel-scan":

                    cancelScan();

                    break;


                case "start-scan":

                    startScan();

                    break;


                /* -----------------------------------------
                   FOLDERS
                ----------------------------------------- */

                case "add-folder":

                    createFolder();

                    break;


                /* -----------------------------------------
                   RECIPES
                ----------------------------------------- */

                case "save-recipe":

                    saveEditedRecipe();

                    break;


                case "cancel-edit":

                    closeRecipeEditor();

                    break;


                case "close-recipe":

                    closeRecipeViewer();

                    break;


                /* -----------------------------------------
                   BOOKS
                ----------------------------------------- */

                case "open-books":

                    showScreen(
                        "mainScreen"
                    );

                    break;


                case "main-home":

                    currentFolder = "";

                    renderFolders();
                    renderRecipes();

                    break;


                /* -----------------------------------------
                   SETTINGS
                ----------------------------------------- */

                case "settings":

                    showSettings();

                    break;


                /* -----------------------------------------
                   CLOSE PAGE COUNT
                ----------------------------------------- */

                case "close-page-count":

                    closePageCountModal();

                    break;

            }

        }
    );

}


/* =========================================================
   CREATE COOKBOOK
========================================================= */

function resetCreateForm() {

    const name =
        document.getElementById(
            "cookbookName"
        );

    const owner =
        document.getElementById(
            "cookbookOwnerName"
        );

    const code =
        document.getElementById(
            "cookbookCode"
        );


    if (name) {
        name.value = "";
    }

    if (owner) {
        owner.value = "";
    }

    if (code) {
        code.value = "";
    }

}


function cleanCookbookCode(code) {

    return String(code || "")
        .trim()
        .toUpperCase()
        .replace(
            /[^A-Z0-9_-]/g,
            ""
        );

}


function createCookbook() {

    const nameInput =
        document.getElementById(
            "cookbookName"
        );

    const ownerInput =
        document.getElementById(
            "cookbookOwnerName"
        );

    const codeInput =
        document.getElementById(
            "cookbookCode"
        );

    const privacyInput =
        document.getElementById(
            "cookbookPrivacy"
        );


    const name =
        nameInput
            ? nameInput.value.trim()
            : "";


    const owner =
        ownerInput
            ? ownerInput.value.trim()
            : "";


    let code =
        codeInput
            ? cleanCookbookCode(
                codeInput.value
            )
            : "";


    const privacy =
        privacyInput
            ? privacyInput.value
            : "private";


    if (!name) {

        alert(
            "Please enter a cookbook name."
        );

        return;

    }


    if (!owner) {

        alert(
            "Please enter your name."
        );

        return;

    }


    if (code.length < 4) {

        alert(
            "Your cookbook code must be at least 4 characters."
        );

        return;

    }


    const books =
        getBooks();


    const duplicate =
        books.some(
            book =>
                cleanCookbookCode(
                    book.code
                ) === code
        );


    if (duplicate) {

        alert(
            "That cookbook code is already being used. Choose another one."
        );

        return;

    }


    const book = {

        id: makeID(),

        name,

        code,

        privacy,

        ownerName: owner,

        createdAt:
            new Date().toISOString(),

        members: [

            {
                id: makeID(),
                name: owner,
                joinedAt:
                    new Date().toISOString()
            }

        ],

        folders: [],

        recipes: []

    };


    books.push(book);

    saveBooks(books);


    localStorage.setItem(
        CURRENT_BOOK_KEY,
        book.id
    );


    localStorage.setItem(
        CURRENT_USER_KEY,
        owner
    );


    openCookbook(book);

}


/* =========================================================
   JOIN COOKBOOK
========================================================= */

function resetJoinForm() {

    const code =
        document.getElementById(
            "joinCode"
        );

    const name =
        document.getElementById(
            "joinName"
        );


    if (code) {
        code.value = "";
    }

    if (name) {
        name.value = "";
    }

}


function joinCookbook() {

    const codeInput =
        document.getElementById(
            "joinCode"
        );

    const nameInput =
        document.getElementById(
            "joinName"
        );


    const code =
        codeInput
            ? cleanCookbookCode(
                codeInput.value
            )
            : "";


    const name =
        nameInput
            ? nameInput.value.trim()
            : "";


    if (!code) {

        alert(
            "Please enter the cookbook code."
        );

        return;

    }


    if (!name) {

        alert(
            "Please enter your name."
        );

        return;

    }


    const books =
        getBooks();


    const book =
        books.find(
            item =>
                cleanCookbookCode(
                    item.code
                ) === code
        );


    if (!book) {

        alert(
            "Cookbook not found. Check the code and try again."
        );

        return;

    }


    normalizeBook(book);


    const alreadyMember =
        book.members.some(
            member =>
                member.name.toLowerCase() ===
                name.toLowerCase()
        );


    if (!alreadyMember) {

        book.members.push({

            id: makeID(),

            name,

            joinedAt:
                new Date().toISOString()

        });

    }


    saveBooks(books);


    localStorage.setItem(
        CURRENT_BOOK_KEY,
        book.id
    );


    localStorage.setItem(
        CURRENT_USER_KEY,
        name
    );


    openCookbook(book);

}


/* =========================================================
   OPEN COOKBOOK
========================================================= */

function openCookbook(book) {

    if (!book) {
        return;
    }


    normalizeBook(book);


    currentBook = book;

    currentRecipe = null;

    currentFolder = "";


    localStorage.setItem(
        CURRENT_BOOK_KEY,
        book.id
    );


    const title =
        document.getElementById(
            "mainBookName"
        );


    if (title) {

        title.textContent =
            book.name;

    }


    renderFolders();

    renderRecipes();


    showScreen(
        "mainScreen"
    );

}


/* =========================================================
   LEAVE COOKBOOK
========================================================= */

function leaveCookbook() {

    currentBook = null;
    currentRecipe = null;
    currentFolder = "";


    localStorage.removeItem(
        CURRENT_BOOK_KEY
    );


    goHome();

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
        cleanFolderName(name);


    if (!cleaned) {

        alert(
            "Please enter a valid folder name."
        );

        return;

    }


    normalizeBook(
        currentBook
    );


    const exists =
        currentBook.folders.some(
            folder =>
                folder.name.toLowerCase() ===
                cleaned.toLowerCase()
        );


    if (exists) {

        alert(
            "That folder already exists."
        );

        return;

    }


    currentBook.folders.push({

        id: makeID(),

        name: cleaned

    });


    saveCurrentBook();

    renderFolders();

}


function cleanFolderName(name) {

    return String(name || "")
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


    /* ALL RECIPES */

    const allButton =
        document.createElement(
            "button"
        );


    allButton.className =
        "folder";


    allButton.textContent =
        "🍴 All";


    if (!currentFolder) {

        allButton.style.background =
            "var(--accent)";

        allButton.style.color =
            "#151515";

    }


    allButton.addEventListener(
        "click",
        function() {

            currentFolder = "";

            renderFolders();
            renderRecipes();

        }
    );


    container.appendChild(
        allButton
    );


    currentBook.folders.forEach(
        function(folder) {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "folder";


            const count =
                currentBook.recipes.filter(
                    recipe =>
                        recipe.folderId ===
                        folder.id
                ).length;


            button.textContent =
                "📁 " +
                folder.name +
                " " +
                "(" +
                count +
                ")";


            if (
                currentFolder ===
                folder.id
            ) {

                button.style.background =
                    "var(--accent)";

                button.style.color =
                    "#151515";

            }


            button.addEventListener(
                "click",
                function() {

                    currentFolder =
                        folder.id;

                    renderFolders();
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
   RECIPE FOLDER SELECTOR
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


    const none =
        document.createElement(
            "option"
        );


    none.value = "";

    none.textContent =
        "No Folder";


    select.appendChild(
        none
    );


    if (!currentBook) {
        return;
    }


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


    if (!currentBook) {
        return;
    }


    normalizeBook(
        currentBook
    );


    let recipes =
        [...currentBook.recipes];


    if (currentFolder) {

        recipes =
            recipes.filter(
                recipe =>
                    recipe.folderId ===
                    currentFolder
            );

    }


    if (recipes.length === 0) {

        const empty =
            document.createElement(
                "div"
            );


        empty.style.gridColumn =
            "1 / -1";


        empty.style.padding =
            "30px 10px";


        empty.style.textAlign =
            "center";


        empty.style.color =
            "#777";


        empty.textContent =
            "No recipes here yet.";


        container.appendChild(
            empty
        );


        return;

    }


    recipes.forEach(
        function(recipe) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "recipeCard";


            const title =
                recipe.title ||
                "Untitled Recipe";


            const ingredientCount =
                Array.isArray(
                    recipe.ingredients
                )
                    ? recipe.ingredients.length
                    : 0;


            card.innerHTML = `

                <div
                    style="
                        font-size:28px;
                        margin-bottom:8px;
                    "
                >
                    🍴
                </div>

                <h3>
                    ${escapeHTML(title)}
                </h3>

                <p>
                    ${ingredientCount}
                    ingredient${ingredientCount === 1 ? "" : "s"}
                </p>

            `;


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


            if (!currentBook) {
                return;
            }


            const cards =
                document.querySelectorAll(
                    ".recipeCard"
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
   PAGE COUNT
========================================================= */

function openPageCountModal() {

    const modal =
        document.getElementById(
            "pageCountModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "hidden"
    );


    modal.classList.add(
        "show"
    );


    setupPageCountButtons();

}


function closePageCountModal() {

    const modal =
        document.getElementById(
            "pageCountModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "hidden"
    );


    modal.classList.remove(
        "show"
    );

}


function setupPageCountButtons() {

    const container =
        document.getElementById(
            "pageCount"
        );


    if (!container) {
        return;
    }


    const buttons =
        container.querySelectorAll(
            "[data-pages]"
        );


    buttons.forEach(
        function(button) {

            button.onclick =
                function() {

                    const count =
                        Number(
                            button.getAttribute(
                                "data-pages"
                            )
                        );


                    selectPageCount(
                        count
                    );

                };

        }
    );

}


function selectPageCount(count) {

    count =
        Number(count);


    if (
        count < 1 ||
        count > 5
    ) {

        return;

    }


    selectedPageCount =
        count;


    currentScanFiles = [];


    closePageCountModal();


    showScreen(
        "scannerScreen"
    );


    createScannerInput();


    updateSelectedPageText();


    const images =
        document.getElementById(
            "recipeImages"
        );


    if (images) {
        images.innerHTML = "";
    }

}


function updateSelectedPageText() {

    let text =
        document.getElementById(
            "selectedPages"
        );


    if (!text) {

        text =
            document.createElement(
                "p"
            );

        text.id =
            "selectedPages";

        text.style.color =
            "#999";

        text.style.margin =
            "10px 0";

        const scanner =
            document.querySelector(
                ".scannerPage"
            );


        if (scanner) {

            scanner.insertBefore(
                text,
                scanner.querySelector(
                    "#recipeImages"
                )
            );

        }

    }


    text.textContent =
        selectedPageCount === 1
            ? "Choose 1 recipe page."
            : `Choose ${selectedPageCount} recipe pages.`;

}


/* =========================================================
   SCANNER INPUT
========================================================= */

function createScannerInput() {

    let input =
        document.getElementById(
            "scannerInput"
        );


    if (!input) {

        input =
            document.createElement(
                "input"
            );


        input.id =
            "scannerInput";


        input.type =
            "file";


        input.accept =
            "image/*";


        input.multiple =
            true;


        input.style.display =
            "none";


        document.body.appendChild(
            input
        );


        input.addEventListener(
            "change",
            handleScannerFiles
        );

    }


    input.value = "";


    input.multiple = true;

}


/* =========================================================
   SCANNER FILE PICKER
========================================================= */

function setupScanner() {

    createScannerInput();


    const scanner =
        document.querySelector(
            ".scannerPage"
        );


    if (!scanner) {
        return;
    }


    let chooseButton =
        document.getElementById(
            "chooseRecipePages"
        );


    if (!chooseButton) {

        chooseButton =
            document.createElement(
                "button"
            );


        chooseButton.id =
            "chooseRecipePages";


        chooseButton.className =
            "secondaryButton fullButton";


        chooseButton.textContent =
            "📷 Choose Recipe Photos";


        const startButton =
            document.getElementById(
                "startScan"
            );


        if (startButton) {

            scanner.insertBefore(
                chooseButton,
                startButton
            );

        } else {

            scanner.appendChild(
                chooseButton
            );

        }

    }


    chooseButton.onclick =
        function() {

            if (
                selectedPageCount === 0
            ) {

                openPageCountModal();

                return;

            }


            const input =
                document.getElementById(
                    "scannerInput"
                );


            if (input) {
                input.click();
            }

        };

}


function handleScannerFiles(event) {

    const files =
        Array.from(
            event.target.files || []
        );


    if (
        selectedPageCount === 0
    ) {

        alert(
            "Please choose the number of pages first."
        );

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


        event.target.value =
            "";


        return;

    }


    currentScanFiles =
        files;


    updateSelectedPageText();


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


    showSelectedImages(
        files
    );

}


function showSelectedImages(files) {

    const container =
        document.getElementById(
            "recipeImages"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    files.forEach(
        function(file) {

            const reader =
                new FileReader();


            reader.onload =
                function(event) {

                    const img =
                        document.createElement(
                            "img"
                        );


                    img.src =
                        event.target.result;


                    img.alt =
                        "Recipe page";


                    container.appendChild(
                        img
                    );

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =========================================================
   START SCAN
========================================================= */

async function startScan() {

    if (isScanning) {
        return;
    }


    if (!currentBook) {

        alert(
            "Please open a cookbook first."
        );

        return;

    }


    const input =
        document.getElementById(
            "scannerInput"
        );


    const files =
        input &&
        input.files
            ? Array.from(
                input.files
            )
            : currentScanFiles;


    if (!files.length) {

        alert(
            "Please choose your recipe photos first."
        );

        return;

    }


    if (
        selectedPageCount > 0 &&
        files.length !==
        selectedPageCount
    ) {

        alert(
            `Please select exactly ${selectedPageCount} page(s).`
        );

        return;

    }


    isScanning = true;

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
            "MoonPlug is organizing the recipe..."
        );


        const recipe =
            awaitasync function organizeRecipeWithMoonPlug(ocrText) {

    if (!ocrText || !ocrText.trim()) {
        throw new Error(
            "MealMind AI received no recipe text."
        );
    }

    updateScannerProgress(
        "MealMind AI is understanding the recipe..."
    );

    const response = await fetch(
        MEALMIND_API + "/api/recipe/parse",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                text: ocrText
            })
        }
    );

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error(
            "MealMind AI returned an invalid response."
        );
    }

    if (!response.ok || !data.success) {
        throw new Error(
            data.error ||
            "MealMind AI couldn't understand the recipe."
        );
    }

    if (!data.recipe) {
        throw new Error(
            "MealMind AI did not return a recipe."
        );
    }

    const recipe = data.recipe;

    return {

        title:
            cleanRecipeTitle(
                recipe.title || ""
            ),

        cuisine:
            cleanRecipeText(
                recipe.cuisine || ""
            ),

        servings:
            cleanRecipeText(
                recipe.servings || ""
            ),

        ingredients:
            cleanRecipeList(
                recipe.ingredients
            ),

        instructions:
            cleanRecipeList(
                recipe.instructions
            ),

        notes:
            cleanRecipeText(
                recipe.notes || ""
            )

    };
}
/* =========================================================
   OCR
========================================================= */

async function runOCR(file) {

    if (!file) {

        throw new Error(
            "No image was selected."
        );

    }


    if (
        typeof Tesseract ===
        "undefined"
    ) {

        throw new Error(
            "Tesseract OCR is not loaded."
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
                                `Reading recipe... ${percent}%`
                            );

                        }

                    }

            }
        );


    if (
        !result ||
        !result.data
    ) {

        throw new Error(
            "OCR returned no result."
        );

    }


    const text =
        result.data.text ||
        "";


    if (!text.trim()) {

        throw new Error(
            "No text was detected in the recipe photo."
        );

    }


    return text;

}


/* =========================================================
   MOONPLUG RECIPE ORGANIZER
========================================================= */

async function organizeRecipeWithMoonPlug(
    ocrText
) {

    if (
        !ocrText ||
        !ocrText.trim()
    ) {

        throw new Error(
            "There was no OCR text to send to MoonPlug."
        );

    }


    const response =
        await fetch(
            MEALMIND_API +
            "/api/recipe/parse",
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        text: ocrText
                    })

            }
        );


    let data;


    try {

        data =
            await response.json();

    } catch {

        throw new Error(
            "MoonPlug returned an invalid response."
        );

    }


    if (
        !response.ok ||
        !data.success
    ) {

        throw new Error(
            data.error ||
            "MoonPlug could not organize the recipe."
        );

    }


    if (!data.recipe) {

        throw new Error(
            "MoonPlug did not return a recipe."
        );

    }


    return {

        title:
            typeof data.recipe.title ===
            "string"
                ? cleanRecipeTitle(
                    data.recipe.title
                )
                : "",


        cuisine:
            typeof data.recipe.cuisine ===
            "string"
                ? cleanRecipeText(
                    data.recipe.cuisine
                )
                : "",


        servings:
            typeof data.recipe.servings ===
            "string"
                ? cleanRecipeText(
                    data.recipe.servings
                )
                : "",


        ingredients:
            Array.isArray(
                data.recipe.ingredients
            )
                ? cleanRecipeList(
                    data.recipe.ingredients
                )
                : [],


        instructions:
            Array.isArray(
                data.recipe.instructions
            )
                ? cleanRecipeList(
                    data.recipe.instructions
                )
                : [],


        notes:
            typeof data.recipe.notes ===
            "string"
                ? cleanRecipeText(
                    data.recipe.notes
                )
                : ""

    };

}


/* =========================================================
   RECIPE CLEANING
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


function cleanRecipeTitle(title) {

    if (!title) {
        return "";
    }


    return String(title)

        .replace(
            /�/g,
            ""
        )

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


function cleanRecipeList(items) {

    if (
        !Array.isArray(items)
    ) {

        return [];

    }


    return items

        .map(
            item =>
                cleanRecipeText(
                    item
                )
        )

        .filter(
            item =>
                item.length > 0
        );

}


/* =========================================================
   RECIPE EDITOR
========================================================= */

function openRecipeEditor(recipe) {

    currentRecipe =
        recipe || {

            title: "",
            cuisine: "",
            servings: "",
            ingredients: [],
            instructions: [],
            notes: ""

        };


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


    const modal =
        document.getElementById(
            "editorModal"
        );


    if (!modal) {
        return;
    }


    fillRecipeEditor();


    modal.classList.remove(
        "hidden"
    );

}


function fillRecipeEditor() {

    if (!currentRecipe) {
        return;
    }


    const title =
        document.getElementById(
            "recipeTitle"
        );


    const ingredients =
        document.getElementById(
            "recipeIngredients"
        );


    const instructions =
        document.getElementById(
            "recipeInstructions"
        );


    if (title) {

        title.value =
            currentRecipe.title ||
            "";

    }


    if (ingredients) {

        ingredients.value =
            (
                currentRecipe.ingredients ||
                []
            ).join("\n");

    }


    if (instructions) {

        instructions.value =
            (
                currentRecipe.instructions ||
                []
            ).join("\n");

    }


    populateRecipeFolderPicker();


    const folder =
        document.getElementById(
            "recipeFolder"
        );


    if (
        folder &&
        currentRecipe.folderId
    ) {

        folder.value =
            currentRecipe.folderId;

    }

}


/* =========================================================
   RECIPE TITLE VALIDATION
========================================================= */

function isValidRecipeTitle(title) {

    if (!title) {
        return false;
    }


    return /^[a-zA-Z0-9\s.'\/]+$/
        .test(
            title.trim()
        );

}


/* =========================================================
   SAVE RECIPE
========================================================= */

function saveEditedRecipe() {

    if (!currentBook) {

        alert(
            "Please open a cookbook first."
        );

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
            ? cleanRecipeTitle(
                titleInput.value
            )
            : "";


    if (!title) {

        alert(
            "Please enter a recipe title before saving."
        );

        if (titleInput) {
            titleInput.focus();
        }

        return;

    }


    if (
        !isValidRecipeTitle(
            title
        )
    ) {

        alert(
            "The title can only contain letters, numbers, spaces, /, . and '."
        );

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

        title,

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

        ingredients,

        instructions,

        notes:
            currentRecipe &&
            currentRecipe.notes
                ? cleanRecipeText(
                    currentRecipe.notes
                )
                : "",

        folderId,

        pages:
            currentScanFiles.length,

        updatedAt:
            new Date().toISOString()

    };


    normalizeBook(
        currentBook
    );


    const index =
        currentBook.recipes.findIndex(
            item =>
                currentRecipe &&
                item.id ===
                currentRecipe.id
        );


    if (index >= 0) {

        currentBook.recipes[index] =
            recipe;

    } else {

        currentBook.recipes.push(
            recipe
        );

    }


    currentRecipe =
        recipe;


    saveCurrentBook();


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


    currentScanFiles =
        [];

}


/* =========================================================
   OPEN RECIPE
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


    const ingredients =
        Array.isArray(
            recipe.ingredients
        )
            ? recipe.ingredients
            : [];


    const instructions =
        Array.isArray(
            recipe.instructions
        )
            ? recipe.instructions
            : [];


    viewer.innerHTML = `

        <div class="modalCard largeModal">

            <button
                class="modalClose"
                data-action="close-recipe"
            >
                ×
            </button>

            <div id="recipeViewerContent">

                <h2>
                    ${escapeHTML(
                        recipe.title ||
                        "Untitled Recipe"
                    )}
                </h2>

                ${
                    recipe.servings
                        ? `
                            <p>
                                Servings:
                                ${escapeHTML(
                                    recipe.servings
                                )}
                            </p>
                        `
                        : ""
                }

                <h3>
                    Ingredients
                </h3>

                <ul>

                    ${
                        ingredients
                            .map(
                                item =>
                                    `
                                    <li>
                                        ${escapeHTML(
                                            item
                                        )}
                                    </li>
                                    `
                            )
                            .join("")
                    }

                </ul>

                <h3>
                    Instructions
                </h3>

                <ol>

                    ${
                        instructions
                            .map(
                                item =>
                                    `
                                    <li>
                                        ${escapeHTML(
                                            item
                                        )}
                                    </li>
                                    `
                            )
                            .join("")
                    }

                </ol>

                ${
                    recipe.notes
                        ? `
                            <h3>
                                Notes
                            </h3>

                            <p>
                                ${escapeHTML(
                                    recipe.notes
                                )}
                            </p>
                        `
                        : ""
                }

            </div>

        </div>

    `;


    viewer.classList.remove(
        "hidden"
    );


    const closeButton =
        viewer.querySelector(
            '[data-action="close-recipe"]'
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeRecipeViewer
        );

    }

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

        viewer.innerHTML =
            "";

    }


    currentRecipe =
        null;

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


    updateScannerProgress(
        message
    );

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
   CANCEL SCAN
========================================================= */

function cancelScan() {

    currentScanFiles = [];

    selectedPageCount = 0;

    isScanning = false;


    const input =
        document.getElementById(
            "scannerInput"
        );


    if (input) {
        input.value = "";
    }


    hideScannerStatus();


    showScreen(
        "mainScreen"
    );

}


/* =========================================================
   SETTINGS
========================================================= */

function showSettings() {

    if (!currentBook) {
        return;
    }


    const code =
        currentBook.code ||
        "Not available";


    const members =
        currentBook.members || [];


    alert(
        "MealMind Settings\n\n" +
        "Cookbook: " +
        currentBook.name +
        "\n\n" +
        "Cookbook Code: " +
        code +
        "\n\n" +
        "Members: " +
        members.length
    );

}


/* =========================================================
   ESCAPE HTML
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
   STARTUP
========================================================= */

function initializeMealMind() {

    setupActions();

    setupScanner();

    setupSearch();


    /*
     * Make sure the initial screen
     * is always the cookbook login.
     */

    showScreen(
        "homeScreen"
    );


    /*
     * If a cookbook was previously
     * opened on this device, restore it.
     */

    const savedBookID =
        localStorage.getItem(
            CURRENT_BOOK_KEY
        );


    if (savedBookID) {

        const books =
            getBooks();


        const savedBook =
            books.find(
                book =>
                    book.id ===
                    savedBookID
            );


        if (savedBook) {

            /*
             * We intentionally do not
             * automatically open it.
             *
             * The first screen remains
             * the cookbook login screen.
             */

            normalizeBook(
                savedBook
            );

        }

    }

}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializeMealMind();

    }
);
