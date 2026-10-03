/* =========================================================
   MEALMIND
   COMPLETE COOKBOOK + SCANNER JAVASCRIPT
   GitHub Pages frontend
========================================================= */


/* =========================================================
   API
========================================================= */

const MEALMIND_API =
    "https://innovation-latinas-separately-accounting.trycloudflare.com";


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "mealmind_books";
const CURRENT_BOOK_KEY = "mealmind_current_book";
const CURRENT_USER_KEY = "mealmind_current_user";


/* =========================================================
   APP STATE
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
        Math.random().toString(36).slice(2, 10)
    );
}


function getBooks() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return [];
        }

        const books = JSON.parse(saved);

        return Array.isArray(books) ? books : [];
    } catch (error) {
        console.error("Could not load cookbooks:", error);
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
        return null;
    }

    if (!Array.isArray(book.members)) {
        book.members = [];
    }

    if (!Array.isArray(book.folders)) {
        book.folders = [];
    }

    if (!Array.isArray(book.recipes)) {
        book.recipes = [];
    }

    if (!book.code) {
        book.code = "";
    }

    if (!book.privacy) {
        book.privacy = "private";
    }

    if (!book.name) {
        book.name = "My Cookbook";
    }

    if (!book.ownerName) {
        book.ownerName = "";
    }

    return book;
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

function showScreen(id) {
    document
        .querySelectorAll(".screen")
        .forEach(screen => {
            screen.classList.remove("active");
            screen.classList.add("hidden");
        });

    const screen = document.getElementById(id);

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
   BUTTON ACTION SYSTEM
========================================================= */

function setupActions() {
    document.addEventListener("click", event => {
        const button = event.target.closest("[data-action]");

        if (!button) {
            return;
        }

        const action =
            button.getAttribute("data-action");

        switch (action) {

            case "home":
                goHome();
                break;


            case "make-cookbook":
                resetCreateForm();
                showScreen("makeScreen");
                break;


            case "create-cookbook":
                createCookbook();
                break;


            case "join-cookbook":
                resetJoinForm();
                showScreen("joinScreen");
                break;


            case "join":
                joinCookbook();
                break;


            case "open-books":
                openBooks();
                break;


            case "main-home":
                currentFolder = "";
                renderFolders();
                renderRecipes();
                break;


            case "exit-book":
                leaveCookbook();
                break;


            case "scan":
                openPageCountModal();
                break;


            case "cancel-scan":
                cancelScan();
                break;


            case "start-scan":
                startScan();
                break;


            case "open-page-count":
                openPageCountModal();
                break;


            case "close-page-count":
                closePageCountModal();
                break;


            case "confirm-page-count":
                confirmPageCount();
                break;


            case "add-folder":
                createFolder();
                break;


            case "save-recipe":
                saveEditedRecipe();
                break;


            case "cancel-edit":
                closeRecipeEditor();
                break;


            case "close-recipe":
                closeRecipeViewer();
                break;


            case "edit-recipe":
                editCurrentRecipe();
                break;


            case "delete-recipe":
                deleteCurrentRecipe();
                break;


            case "settings":
                showSettings();
                break;


            case "public-books":
                showPublicBooks();
                break;
        }
    });
}


/* =========================================================
   CREATE COOKBOOK
========================================================= */

function resetCreateForm() {
    const name =
        document.getElementById("cookbookName");

    const owner =
        document.getElementById("cookbookOwnerName");

    const code =
        document.getElementById("cookbookCode");

    const privacy =
        document.getElementById("cookbookPrivacy");

    if (name) {
        name.value = "";
    }

    if (owner) {
        owner.value = "";
    }

    if (code) {
        code.value = "";
    }

    if (privacy) {
        privacy.value = "private";
    }
}


function cleanCookbookCode(value) {
    return String(value || "")
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9_-]/g, "");
}


function createCookbook() {
    const nameInput =
        document.getElementById("cookbookName");

    const ownerInput =
        document.getElementById("cookbookOwnerName");

    const codeInput =
        document.getElementById("cookbookCode");

    const privacyInput =
        document.getElementById("cookbookPrivacy");

    const name =
        nameInput
            ? nameInput.value.trim()
            : "";

    const owner =
        ownerInput
            ? ownerInput.value.trim()
            : "";

    const code =
        codeInput
            ? cleanCookbookCode(codeInput.value)
            : "";

    const privacy =
        privacyInput
            ? privacyInput.value
            : "private";


    if (!name) {
        alert("Please enter a cookbook name.");
        return;
    }


    if (!owner) {
        alert("Please enter your name.");
        return;
    }


    if (code.length < 4) {
        alert(
            "Your cookbook code must be at least 4 characters."
        );
        return;
    }


    const books = getBooks();

    const duplicate = books.some(
        book =>
            cleanCookbookCode(book.code) === code
    );


    if (duplicate) {
        alert(
            "That cookbook code is already being used. Choose another one."
        );
        return;
    }


    const now =
        new Date().toISOString();


    const book = {
        id: makeID(),

        name,

        code,

        privacy:
            privacy === "public"
                ? "public"
                : "private",

        ownerName: owner,

        createdAt: now,

        updatedAt: now,

        members: [
            {
                id: makeID(),
                name: owner,
                joinedAt: now
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
        document.getElementById("joinCode");

    const name =
        document.getElementById("joinName");

    if (code) {
        code.value = "";
    }

    if (name) {
        name.value = "";
    }
}


function joinCookbook() {
    const codeInput =
        document.getElementById("joinCode");

    const nameInput =
        document.getElementById("joinName");


    const code =
        codeInput
            ? cleanCookbookCode(codeInput.value)
            : "";


    const name =
        nameInput
            ? nameInput.value.trim()
            : "";


    if (!code) {
        alert("Please enter the cookbook code.");
        return;
    }


    if (!name) {
        alert("Please enter your name.");
        return;
    }


    const books = getBooks();


    const book =
        books.find(
            item =>
                cleanCookbookCode(item.code) === code
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
                String(member.name || "")
                    .toLowerCase() ===
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


    book.updatedAt =
        new Date().toISOString();


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
        document.getElementById("mainBookName");

    if (title) {
        title.textContent = book.name;
    }


    renderFolders();
    renderRecipes();

    showScreen("mainScreen");
}


function openBooks() {
    if (!currentBook) {
        alert(
            "You do not have a cookbook open yet."
        );
        return;
    }

    renderFolders();
    renderRecipes();

    showScreen("mainScreen");
}


function leaveCookbook() {
    currentBook = null;
    currentRecipe = null;
    currentFolder = "";

    localStorage.removeItem(
        CURRENT_BOOK_KEY
    );

    localStorage.removeItem(
        CURRENT_USER_KEY
    );

    goHome();
}


/* =========================================================
   FOLDERS
========================================================= */

function cleanFolderName(name) {
    return String(name || "")
        .replace(/[^a-zA-Z0-9\s.'\/_-]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}


function createFolder() {
    if (!currentBook) {
        alert("Please open a cookbook first.");
        return;
    }


    const input =
        prompt(
            "What would you like to name the folder?"
        );


    if (!input) {
        return;
    }


    const name =
        cleanFolderName(input);


    if (!name) {
        alert("Please enter a valid folder name.");
        return;
    }


    normalizeBook(currentBook);


    const exists =
        currentBook.folders.some(
            folder =>
                folder.name.toLowerCase() ===
                name.toLowerCase()
        );


    if (exists) {
        alert("That folder already exists.");
        return;
    }


    currentBook.folders.push({
        id: makeID(),
        name
    });


    currentBook.updatedAt =
        new Date().toISOString();


    saveCurrentBook();

    renderFolders();

    populateRecipeFolderPicker();
}


function editFolder(folderId) {
    if (!currentBook) {
        return;
    }


    const folder =
        currentBook.folders.find(
            item => item.id === folderId
        );


    if (!folder) {
        return;
    }


    const newName =
        prompt(
            "Rename folder:",
            folder.name
        );


    if (!newName) {
        return;
    }


    const cleaned =
        cleanFolderName(newName);


    if (!cleaned) {
        return;
    }


    folder.name = cleaned;

    currentBook.updatedAt =
        new Date().toISOString();

    saveCurrentBook();

    renderFolders();

    renderRecipes();

    populateRecipeFolderPicker();
}


function deleteFolder(folderId) {
    if (!currentBook) {
        return;
    }


    const folder =
        currentBook.folders.find(
            item => item.id === folderId
        );


    if (!folder) {
        return;
    }


    const confirmed =
        confirm(
            `Delete the folder "${folder.name}"? Recipes inside it will be moved to All Recipes.`
        );


    if (!confirmed) {
        return;
    }


    currentBook.recipes.forEach(
        recipe => {
            if (recipe.folderId === folderId) {
                recipe.folderId = "";
            }
        }
    );


    currentBook.folders =
        currentBook.folders.filter(
            item => item.id !== folderId
        );


    if (currentFolder === folderId) {
        currentFolder = "";
    }


    saveCurrentBook();

    renderFolders();

    renderRecipes();

    populateRecipeFolderPicker();
}


function renderFolders() {
    const container =
        document.getElementById("folders");


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!currentBook) {
        return;
    }


    normalizeBook(currentBook);


    const allButton =
        document.createElement("button");


    allButton.className = "folder";

    allButton.textContent = "🍴 All";


    if (!currentFolder) {
        allButton.style.background =
            "var(--accent, #ffffff)";

        allButton.style.color =
            "#151515";
    }


    allButton.addEventListener(
        "click",
        () => {
            currentFolder = "";

            renderFolders();
            renderRecipes();
        }
    );


    container.appendChild(allButton);


    currentBook.folders.forEach(
        folder => {

            const wrapper =
                document.createElement("div");

            wrapper.style.display = "inline-flex";
            wrapper.style.alignItems = "center";
            wrapper.style.gap = "4px";


            const button =
                document.createElement("button");


            button.className = "folder";


            const count =
                currentBook.recipes.filter(
                    recipe =>
                        recipe.folderId ===
                        folder.id
                ).length;


            button.textContent =
                `📁 ${folder.name} (${count})`;


            if (
                currentFolder ===
                folder.id
            ) {
                button.style.background =
                    "var(--accent, #ffffff)";

                button.style.color =
                    "#151515";
            }


            button.addEventListener(
                "click",
                () => {
                    currentFolder =
                        folder.id;

                    renderFolders();
                    renderRecipes();
                }
            );


            const edit =
                document.createElement("button");

            edit.type = "button";
            edit.textContent = "✏️";
            edit.title = "Rename folder";
            edit.style.background = "transparent";
            edit.style.border = "0";
            edit.style.cursor = "pointer";


            edit.addEventListener(
                "click",
                event => {
                    event.stopPropagation();
                    editFolder(folder.id);
                }
            );


            const remove =
                document.createElement("button");

            remove.type = "button";
            remove.textContent = "🗑️";
            remove.title = "Delete folder";
            remove.style.background = "transparent";
            remove.style.border = "0";
            remove.style.cursor = "pointer";


            remove.addEventListener(
                "click",
                event => {
                    event.stopPropagation();
                    deleteFolder(folder.id);
                }
            );


            wrapper.appendChild(button);
            wrapper.appendChild(edit);
            wrapper.appendChild(remove);

            container.appendChild(wrapper);
        }
    );
}


/* =========================================================
   RECIPE FOLDER PICKER
========================================================= */

function populateRecipeFolderPicker() {
    const select =
        document.getElementById("recipeFolder");


    if (!select) {
        return;
    }


    select.innerHTML = "";


    const none =
        document.createElement("option");


    none.value = "";
    none.textContent = "No Folder";


    select.appendChild(none);


    if (!currentBook) {
        return;
    }


    normalizeBook(currentBook);


    currentBook.folders.forEach(
        folder => {

            const option =
                document.createElement("option");


            option.value =
                folder.id;


            option.textContent =
                `📁 ${folder.name}`;


            select.appendChild(option);
        }
    );
}


/* =========================================================
   RECIPES
========================================================= */

function renderRecipes() {
    const container =
        document.getElementById("recipes");


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!currentBook) {
        return;
    }


    normalizeBook(currentBook);


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


    if (!recipes.length) {
        const empty =
            document.createElement("div");


        empty.style.gridColumn = "1 / -1";
        empty.style.padding = "30px 10px";
        empty.style.textAlign = "center";
        empty.style.color = "#777";


        empty.textContent =
            currentFolder
                ? "No recipes in this folder yet."
                : "No recipes here yet.";


        container.appendChild(empty);

        return;
    }


    recipes.forEach(recipe => {

        const card =
            document.createElement("div");


        card.className = "recipeCard";


        const title =
            recipe.title ||
            "Untitled Recipe";


        const ingredientCount =
            Array.isArray(recipe.ingredients)
                ? recipe.ingredients.length
                : 0;


        const instructionCount =
            Array.isArray(recipe.instructions)
                ? recipe.instructions.length
                : 0;


        card.innerHTML = `
            <div style="
                font-size:28px;
                margin-bottom:8px;
            ">
                🍴
            </div>

            <h3>
                ${escapeHTML(title)}
            </h3>

            <p>
                ${ingredientCount}
                ingredient${ingredientCount === 1 ? "" : "s"}
            </p>

            <p>
                ${instructionCount}
                step${instructionCount === 1 ? "" : "s"}
            </p>
        `;


        card.addEventListener(
            "click",
            () => openRecipe(recipe)
        );


        container.appendChild(card);
    });
}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {
    const input =
        document.getElementById("searchInput");


    if (!input) {
        return;
    }


    input.addEventListener(
        "input",
        () => {

            const query =
                input.value
                    .trim()
                    .toLowerCase();


            if (!currentBook) {
                return;
            }


            const cards =
                document.querySelectorAll(
                    "#recipes .recipeCard"
                );


            cards.forEach(card => {

                const text =
                    card.textContent
                        .toLowerCase();


                card.style.display =
                    !query ||
                    text.includes(query)
                        ? ""
                        : "none";
            });
        }
    );
}


/* =========================================================
   PAGE COUNT
========================================================= */

function openPageCountModal() {
    const modal =
        document.getElementById("pageCountModal");


    if (!modal) {
        return;
    }


    modal.classList.remove("hidden");
    modal.classList.add("show");


    setupPageCountButtons();
}


function closePageCountModal() {
    const modal =
        document.getElementById("pageCountModal");


    if (!modal) {
        return;
    }


    modal.classList.add("hidden");
    modal.classList.remove("show");
}


function setupPageCountButtons() {
    const container =
        document.getElementById("pageCount");


    if (!container) {
        return;
    }


    const buttons =
        container.querySelectorAll("[data-pages]");


    buttons.forEach(button => {

        button.onclick = () => {

            const count =
                Number(
                    button.getAttribute("data-pages")
                );


            selectPageCount(count);
        };
    });
}


function selectPageCount(count) {
    count = Number(count);


    if (
        !Number.isInteger(count) ||
        count < 1 ||
        count > 5
    ) {
        return;
    }


    selectedPageCount = count;

    currentScanFiles = [];


    closePageCountModal();

    showScreen("scannerScreen");


    createScannerInput();

    updateSelectedPageText();


    const images =
        document.getElementById("recipeImages");


    if (images) {
        images.innerHTML = "";
    }


    const input =
        document.getElementById("scannerInput");


    if (input) {
        input.value = "";
    }
}


function confirmPageCount() {
    const pageInput =
        document.getElementById("pageCount");


    if (!pageInput) {
        return;
    }


    const selected =
        pageInput.querySelector(
            "[data-pages].selected"
        );


    if (selected) {
        selectPageCount(
            Number(
                selected.getAttribute("data-pages")
            )
        );

        return;
    }


    const value =
        Number(pageInput.value);


    if (
        Number.isInteger(value) &&
        value >= 1 &&
        value <= 5
    ) {
        selectPageCount(value);
        return;
    }


    alert("Please choose between 1 and 5 pages.");
}


function updateSelectedPageText() {
    let text =
        document.getElementById("selectedPages");


    if (!text) {
        text =
            document.createElement("p");

        text.id = "selectedPages";

        text.style.color = "#999";
        text.style.margin = "10px 0";


        const scanner =
            document.querySelector(".scannerPage");


        if (scanner) {

            const images =
                scanner.querySelector("#recipeImages");


            if (images) {
                scanner.insertBefore(
                    text,
                    images
                );
            } else {
                scanner.appendChild(text);
            }
        }
    }


    if (!text) {
        return;
    }


    if (currentScanFiles.length) {

        text.textContent =
            currentScanFiles.length === 1
                ? "1 page selected."
                : `${currentScanFiles.length} pages selected.`;

        return;
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
        document.getElementById("scannerInput");


    if (!input) {
        input =
            document.createElement("input");


        input.id = "scannerInput";
        input.type = "file";
        input.accept = "image/*";
        input.multiple = true;
        input.style.display = "none";


        document.body.appendChild(input);


        input.addEventListener(
            "change",
            handleScannerFiles
        );
    }


    input.multiple = true;
}


function setupScanner() {
    createScannerInput();


    const chooseButton =
        document.getElementById(
            "chooseRecipePages"
        );


    if (chooseButton) {

        chooseButton.addEventListener(
            "click",
            () => {

                if (!selectedPageCount) {
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
            }
        );
    }
}


function handleScannerFiles(event) {
    const files =
        Array.from(
            event.target.files || []
        );


    if (!selectedPageCount) {
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


        event.target.value = "";

        currentScanFiles = [];

        updateSelectedPageText();

        return;
    }


    currentScanFiles = files;


    updateSelectedPageText();

    showSelectedImages(files);
}


function showSelectedImages(files) {
    const container =
        document.getElementById("recipeImages");


    if (!container) {
        return;
    }


    container.innerHTML = "";


    files.forEach(
        (file, index) => {

            const wrapper =
                document.createElement("div");


            wrapper.style.position = "relative";


            const img =
                document.createElement("img");


            img.alt =
                `Recipe page ${index + 1}`;


            img.style.maxWidth = "100%";
            img.style.display = "block";


            const reader =
                new FileReader();


            reader.onload =
                event => {

                    img.src =
                        event.target.result;
                };


            reader.readAsDataURL(file);


            wrapper.appendChild(img);

            container.appendChild(wrapper);
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
        document.getElementById("scannerInput");


    const files =
        currentScanFiles.length
            ? currentScanFiles
            : (
                input &&
                input.files
                    ? Array.from(input.files)
                    : []
            );


    if (!files.length) {
        alert(
            "Please choose your recipe photos first."
        );

        return;
    }


    if (
        selectedPageCount &&
        files.length !== selectedPageCount
    ) {
        alert(
            `Please select exactly ${selectedPageCount} page(s).`
        );

        return;
    }


    isScanning = true;

    currentScanFiles = files;


    showScannerStatus(
        "Reading recipe pages..."
    );


    try {

        const OCRResults = [];


        for (
            let i = 0;
            i < files.length;
            i++
        ) {

            updateScannerProgress(
                `Reading page ${i + 1} of ${files.length}...`
            );


            const text =
                await runOCR(files[i]);


            if (text && text.trim()) {
                OCRResults.push(text);
            }
        }


        const combinedText =
            OCRResults.join("\n");


        if (!combinedText.trim()) {
            throw new Error(
                "No recipe text was detected."
            );
        }


        updateScannerProgress(
            "MealMind AI is organizing the recipe..."
        );


        const recipe =
            await organizeRecipeWithMoonPlug(
                combinedText
            );


        recipe.id = makeID();

        recipe.folderId = "";

        recipe.pages =
            files.length;

        recipe.createdAt =
            new Date().toISOString();


        recipe.updatedAt =
            new Date().toISOString();


        hideScannerStatus();


        openRecipeEditor(recipe);


    } catch (error) {

        console.error(
            "MealMind scanner error:",
            error
        );


        showScannerStatus(
            "Something went wrong."
        );


        const message =
            error &&
            error.message
                ? error.message
                : "The recipe could not be scanned.";


        alert(message);


    } finally {

        isScanning = false;
    }
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
            "Tesseract OCR is not loaded. Make sure the Tesseract script is included in index.html."
        );
    }


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
   MEALMIND AI RECIPE ORGANIZER
========================================================= */

async function organizeRecipeWithMoonPlug(ocrText) {
    if (
        !ocrText ||
        !ocrText.trim()
    ) {
        throw new Error(
            "MealMind AI received no recipe text."
        );
    }


    updateScannerProgress(
        "MealMind AI is understanding the recipe..."
    );


    let response;


    try {

        response =
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

    } catch (error) {

        throw new Error(
            "MealMind could not connect to the AI server."
        );
    }


    let data;


    try {

        data =
            await response.json();

    } catch (error) {

        throw new Error(
            "MealMind AI returned an invalid response."
        );
    }


    if (
        !response.ok ||
        !data ||
        !data.success
    ) {
        throw new Error(
            data &&
            data.error
                ? data.error
                : "MealMind AI could not organize the recipe."
        );
    }


    if (!data.recipe) {
        throw new Error(
            "MealMind AI did not return a recipe."
        );
    }


    const recipe =
        data.recipe;


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
   RECIPE CLEANING
   Allowed special characters:
   / . '
========================================================= */

function cleanRecipeText(text) {
    if (
        text === null ||
        text === undefined
    ) {
        return "";
    }


    return String(text)
        .replace(/�/g, "")
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


function cleanRecipeTitle(title) {
    if (
        title === null ||
        title === undefined
    ) {
        return "";
    }


    return String(title)
        .replace(/�/g, "")
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
    if (!Array.isArray(items)) {
        return [];
    }


    return items
        .map(item =>
            cleanRecipeText(item)
        )
        .filter(Boolean);
}


/* =========================================================
   RECIPE EDITOR
========================================================= */

function openRecipeEditor(recipe) {
    currentRecipe =
        recipe || {
            id: makeID(),
            title: "",
            cuisine: "",
            servings: "",
            ingredients: [],
            instructions: [],
            notes: "",
            folderId: ""
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


    currentRecipe.cuisine =
        cleanRecipeText(
            currentRecipe.cuisine || ""
        );


    currentRecipe.servings =
        cleanRecipeText(
            currentRecipe.servings || ""
        );


    currentRecipe.notes =
        cleanRecipeText(
            currentRecipe.notes || ""
        );


    const modal =
        document.getElementById(
            "editorModal"
        );


    if (!modal) {
        alert(
            "The recipe editor was not found in index.html."
        );

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


    const folder =
        document.getElementById(
            "recipeFolder"
        );


    const cuisine =
        document.getElementById(
            "recipeCuisine"
        );


    const servings =
        document.getElementById(
            "recipeServings"
        );


    const notes =
        document.getElementById(
            "recipeNotes"
        );


    if (title) {
        title.value =
            currentRecipe.title || "";
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


    if (cuisine) {
        cuisine.value =
            currentRecipe.cuisine || "";
    }


    if (servings) {
        servings.value =
            currentRecipe.servings || "";
    }


    if (notes) {
        notes.value =
            currentRecipe.notes || "";
    }


    populateRecipeFolderPicker();


    if (folder) {
        folder.value =
            currentRecipe.folderId || "";
    }
}


/* =========================================================
   RECIPE TITLE VALIDATION
========================================================= */

function isValidRecipeTitle(title) {
    return /^[a-zA-Z0-9\s.'\/]+$/.test(
        String(title || "").trim()
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


    if (!currentRecipe) {
        alert(
            "There is no recipe being edited."
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


    const cuisineInput =
        document.getElementById(
            "recipeCuisine"
        );


    const servingsInput =
        document.getElementById(
            "recipeServings"
        );


    const notesInput =
        document.getElementById(
            "recipeNotes"
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


    if (!isValidRecipeTitle(title)) {
        alert(
            "The title can only contain letters, numbers, spaces, /, . and '."
        );

        return;
    }


    const ingredients =
        ingredientsInput
            ? ingredientsInput.value
                .split("\n")
                .map(line =>
                    cleanRecipeText(line)
                )
                .filter(Boolean)
            : [];


    const instructions =
        instructionsInput
            ? instructionsInput.value
                .split("\n")
                .map(line =>
                    cleanRecipeText(line)
                )
                .filter(Boolean)
            : [];


    const folderId =
        folderInput
            ? folderInput.value
            : "";


    const cuisine =
        cuisineInput
            ? cleanRecipeText(
                cuisineInput.value
            )
            : cleanRecipeText(
                currentRecipe.cuisine || ""
            );


    const servings =
        servingsInput
            ? cleanRecipeText(
                servingsInput.value
            )
            : cleanRecipeText(
                currentRecipe.servings || ""
            );


    const notes =
        notesInput
            ? cleanRecipeText(
                notesInput.value
            )
            : cleanRecipeText(
                currentRecipe.notes || ""
            );


    const recipe = {

        id:
            currentRecipe.id ||
            makeID(),

        title,

        cuisine,

        servings,

        ingredients,

        instructions,

        notes,

        folderId,

        pages:
            currentRecipe.pages ||
            currentScanFiles.length ||
            0,

        createdAt:
            currentRecipe.createdAt ||
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()
    };


    normalizeBook(currentBook);


    const index =
        currentBook.recipes.findIndex(
            item =>
                item.id === recipe.id
        );


    if (index >= 0) {
        currentBook.recipes[index] =
            recipe;
    } else {
        currentBook.recipes.push(
            recipe
        );
    }


    currentBook.updatedAt =
        new Date().toISOString();


    currentRecipe = recipe;


    saveCurrentBook();


    closeRecipeEditor();


    renderFolders();
    renderRecipes();


    alert("Recipe saved!");
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


    currentRecipe = null;

    currentScanFiles = [];
}


/* =========================================================
   RECIPE VIEWER
========================================================= */

function openRecipe(recipe) {
    if (!recipe) {
        return;
    }


    currentRecipe = recipe;


    const viewer =
        document.getElementById(
            "recipeViewer"
        );


    if (!viewer) {
        return;
    }


    const ingredients =
        Array.isArray(recipe.ingredients)
            ? recipe.ingredients
            : [];


    const instructions =
        Array.isArray(recipe.instructions)
            ? recipe.instructions
            : [];


    viewer.innerHTML = `

        <div class="modalCard largeModal">

            <button
                class="modalClose"
                data-action="close-recipe"
                type="button"
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
                    recipe.cuisine
                        ? `
                            <p>
                                ${escapeHTML(
                                    recipe.cuisine
                                )}
                            </p>
                        `
                        : ""
                }


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


                ${
                    ingredients.length
                        ? `
                            <ul>
                                ${
                                    ingredients
                                        .map(
                                            item =>
                                                `
                                                    <li>
                                                        ${escapeHTML(item)}
                                                    </li>
                                                `
                                        )
                                        .join("")
                                }
                            </ul>
                        `
                        : `
                            <p>
                                No ingredients added.
                            </p>
                        `
                }


                <h3>
                    Instructions
                </h3>


                ${
                    instructions.length
                        ? `
                            <ol>
                                ${
                                    instructions
                                        .map(
                                            item =>
                                                `
                                                    <li>
                                                        ${escapeHTML(item)}
                                                    </li>
                                                `
                                        )
                                        .join("")
                                }
                            </ol>
                        `
                        : `
                            <p>
                                No instructions added.
                            </p>
                        `
                }


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


                <div style="
                    display:flex;
                    gap:10px;
                    flex-wrap:wrap;
                    margin-top:20px;
                ">

                    <button
                        type="button"
                        data-action="edit-recipe"
                    >
                        Edit Recipe
                    </button>


                    <button
                        type="button"
                        data-action="delete-recipe"
                    >
                        Delete Recipe
                    </button>

                </div>

            </div>

        </div>
    `;


    viewer.classList.remove(
        "hidden"
    );
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

        viewer.innerHTML = "";
    }


    currentRecipe = null;
}


/* =========================================================
   EDIT CURRENT RECIPE
========================================================= */

function editCurrentRecipe() {
    if (!currentRecipe) {
        return;
    }


    const recipe =
        currentRecipe;


    closeRecipeViewer();


    openRecipeEditor(
        {
            ...recipe,

            ingredients:
                Array.isArray(recipe.ingredients)
                    ? [...recipe.ingredients]
                    : [],

            instructions:
                Array.isArray(recipe.instructions)
                    ? [...recipe.instructions]
                    : []
        }
    );
}


/* =========================================================
   DELETE CURRENT RECIPE
========================================================= */

function deleteCurrentRecipe() {
    if (
        !currentBook ||
        !currentRecipe
    ) {
        return;
    }


    const title =
        currentRecipe.title ||
        "this recipe";


    const confirmed =
        confirm(
            `Delete "${title}"?`
        );


    if (!confirmed) {
        return;
    }


    currentBook.recipes =
        currentBook.recipes.filter(
            recipe =>
                recipe.id !==
                currentRecipe.id
        );


    currentBook.updatedAt =
        new Date().toISOString();


    saveCurrentBook();


    closeRecipeViewer();


    renderFolders();
    renderRecipes();
}


/* =========================================================
   SCANNER STATUS
========================================================= */

function showScannerStatus(message) {
    const status =
        document.getElementById(
            "scannerStatus"
        );


    if (status) {
        status.classList.remove(
            "hidden"
        );
    }


    updateScannerProgress(message);
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
    if (isScanning) {
        return;
    }


    currentScanFiles = [];

    selectedPageCount = 0;


    const input =
        document.getElementById(
            "scannerInput"
        );


    if (input) {
        input.value = "";
    }


    const images =
        document.getElementById(
            "recipeImages"
        );


    if (images) {
        images.innerHTML = "";
    }


    hideScannerStatus();

    updateSelectedPageText();


    if (currentBook) {
        showScreen("mainScreen");
    } else {
        showScreen("homeScreen");
    }
}


/* =========================================================
   SETTINGS
========================================================= */

function showSettings() {
    if (!currentBook) {
        showScreen("homeScreen");
        return;
    }


    const settingsScreen =
        document.getElementById(
            "settingsScreen"
        );


    if (!settingsScreen) {

        alert(
            "MealMind Settings\n\n" +
            `Cookbook: ${currentBook.name}\n\n` +
            `Code: ${currentBook.code}\n\n` +
            `Privacy: ${currentBook.privacy}\n\n` +
            `Members: ${currentBook.members.length}`
        );

        return;
    }


    populateSettingsScreen();

    showScreen("settingsScreen");
}


function populateSettingsScreen() {
    if (!currentBook) {
        return;
    }


    const possibleIDs = {

        bookName: [
            "settingsBookName",
            "settingsCookbookName"
        ],

        bookCode: [
            "settingsBookCode",
            "settingsCookbookCode"
        ],

        owner: [
            "settingsOwner",
            "settingsOwnerName"
        ],

        members: [
            "settingsMembers",
            "settingsMemberCount"
        ],

        privacy: [
            "settingsPrivacy",
            "settingsCookbookPrivacy"
        ]
    };


    setFirstElementText(
        possibleIDs.bookName,
        currentBook.name
    );


    setFirstElementText(
        possibleIDs.bookCode,
        currentBook.code
    );


    setFirstElementText(
        possibleIDs.owner,
        currentBook.ownerName
    );


    setFirstElementText(
        possibleIDs.members,
        String(
            currentBook.members.length
        )
    );


    setFirstElementText(
        possibleIDs.privacy,
        currentBook.privacy
    );
}


function setFirstElementText(
    ids,
    value
) {
    for (const id of ids) {

        const element =
            document.getElementById(id);


        if (element) {
            element.textContent =
                value ?? "";

            if (
                "value" in element &&
                element.tagName !== "SELECT"
            ) {
                element.value =
                    value ?? "";
            }

            return;
        }
    }
}


/* =========================================================
   PUBLIC COOKBOOKS
========================================================= */

function showPublicBooks() {
    const screen =
        document.getElementById(
            "publicScreen"
        );


    if (!screen) {
        alert(
            "Public cookbook screen was not found."
        );

        return;
    }


    renderPublicCookbooks();

    showScreen("publicScreen");
}


function renderPublicCookbooks() {
    const container =
        document.getElementById(
            "publicBooks"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const publicBooks =
        getBooks()
            .filter(
                book =>
                    book.privacy === "public"
            );


    if (!publicBooks.length) {

        const empty =
            document.createElement("p");


        empty.textContent =
            "No public cookbooks have been created on this device yet.";


        container.appendChild(empty);

        return;
    }


    publicBooks.forEach(book => {

        normalizeBook(book);


        const card =
            document.createElement("div");


        card.className =
            "cookbookCard";


        card.innerHTML = `
            <h3>
                ${escapeHTML(book.name)}
            </h3>

            <p>
                Made by
                ${escapeHTML(book.ownerName)}
            </p>

            <p>
                ${book.recipes.length}
                recipe${book.recipes.length === 1 ? "" : "s"}
            </p>
        `;


        card.addEventListener(
            "click",
            () => {

                const code =
                    prompt(
                        "Enter this cookbook's code to join:"
                    );


                if (
                    cleanCookbookCode(code) !==
                    cleanCookbookCode(book.code)
                ) {
                    alert(
                        "Incorrect cookbook code."
                    );

                    return;
                }


                const name =
                    prompt(
                        "What is your name?"
                    );


                if (!name) {
                    return;
                }


                joinPublicBook(
                    book,
                    name
                );
            }
        );


        container.appendChild(card);
    });
}


function joinPublicBook(
    book,
    name
) {
    normalizeBook(book);


    const alreadyMember =
        book.members.some(
            member =>
                String(member.name || "")
                    .toLowerCase() ===
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


    saveBooks(
        getBooks().map(
            item =>
                item.id === book.id
                    ? book
                    : item
        )
    );


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
   STARTUP
========================================================= */

function initializeMealMind() {

    setupActions();

    setupScanner();

    setupSearch();


    showScreen("homeScreen");


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
            normalizeBook(savedBook);
        }
    }
}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeMealMind
);
