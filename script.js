/* =========================================================
   MEALMIND
   Complete JavaScript
========================================================= */


/* =========================================================
   DATA
========================================================= */

let currentBook = null;
let currentRecipe = null;
let currentFolder = "";
let currentScanFiles = [];
let selectedPageCount = 0;

const MOONPLUG_API =
    "https://innovation-latinas-separately-accounting.trycloudflare.com";


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY =
    "mealmind_books";


function getBooks() {

    try {

        return JSON.parse(
            localStorage.getItem(
                STORAGE_KEY
            )
        ) || [];

    } catch (error) {

        return [];

    }

}


function saveBooks(books) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(books)
    );

}


function saveData() {

    saveBooks(
        getBooks()
    );

}


/* =========================================================
   IDs
========================================================= */

function makeID() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}


/* =========================================================
   SCREEN SYSTEM
========================================================= */

function showScreen(id) {

    document
        .querySelectorAll(".screen")
        .forEach(function(screen) {

            screen.classList.add(
                "hidden"
            );

        });


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

function goHome() {

    currentBook = null;
    currentRecipe = null;

    showScreen(
        "homeScreen"
    );

}


function setupHomeButtons() {

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


                case "home":

                    goHome();

                    break;


                case "make-cookbook":

                    showScreen(
                        "makeScreen"
                    );

                    break;


                case "create-cookbook":

                    createCookbook();

                    break;


                case "join-cookbook":

                    showScreen(
                        "joinScreen"
                    );

                    break;


                case "join":

                    joinCookbook();

                    break;


                case "public-books":

                    renderPublicCookbooks();

                    showScreen(
                        "publicScreen"
                    );

                    break;


                case "exit-book":

                    currentBook = null;

                    currentRecipe = null;

                    currentFolder = "";

                    showScreen(
                        "homeScreen"
                    );

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


                case "settings":

                    showSettings();

                    break;


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

function createCookbook() {

    const nameInput =
        document.getElementById(
            "cookbookName"
        );


    const passwordInput =
        document.getElementById(
            "cookbookPassword"
        );


    const privacyInput =
        document.getElementById(
            "cookbookPrivacy"
        );


    if (!nameInput) {
        return;
    }


    const name =
        nameInput.value.trim();


    const password =
        passwordInput
            ? passwordInput.value
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


    if (password.length < 4) {

        alert(
            "Your cookbook code must be at least 4 characters."
        );

        return;

    }


    const books =
        getBooks();


    const duplicate =
        books.some(
            function(book) {

                return (
                    book.name &&
                    book.name.toLowerCase() ===
                    name.toLowerCase()
                );

            }
        );


    if (duplicate) {

        alert(
            "A cookbook with that name already exists."
        );

        return;

    }


    const book = {

        id:
            makeID(),

        name:
            name,

        password:
            password,

        privacy:
            privacy,

        folders:
            [],

        recipes:
            [],

        members:
            []

    };


    books.push(
        book
    );


    saveBooks(
        books
    );


    openCookbook(
        book
    );

}


/* =========================================================
   JOIN COOKBOOK
========================================================= */

function joinCookbook() {

    const nameInput =
        document.getElementById(
            "joinName"
        );


    const passwordInput =
        document.getElementById(
            "joinPassword"
        );


    const name =
        nameInput
            ? nameInput.value.trim()
            : "";


    const password =
        passwordInput
            ? passwordInput.value
            : "";


    if (!name || !password) {

        alert(
            "Enter the cookbook name and code."
        );

        return;

    }


    const books =
        getBooks();


    const book =
        books.find(
            function(item) {

                return (
                    item.name &&
                    item.name.toLowerCase() ===
                    name.toLowerCase() &&
                    item.password ===
                    password
                );

            }
        );


    if (!book) {

        alert(
            "Cookbook not found or the code is incorrect."
        );

        return;

    }


    openCookbook(
        book
    );

}


/* =========================================================
   OPEN COOKBOOK
========================================================= */

function openCookbook(book) {

    currentBook =
        book;


    normalizeBook(
        currentBook
    );


    const title =
        document.getElementById(
            "mainBookName"
        );


    if (title) {

        title.textContent =
            currentBook.name;

    }


    currentFolder = "";


    renderFolders();

    renderRecipes();


    showScreen(
        "mainScreen"
    );

}


/* =========================================================
   NORMALIZE BOOK
========================================================= */

function normalizeBook(book) {

    if (!book) {
        return;
    }


    if (
        !Array.isArray(
            book.folders
        )
    ) {

        book.folders = [];

    }


    if (
        !Array.isArray(
            book.recipes
        )
    ) {

        book.recipes = [];

    }


    if (
        !Array.isArray(
            book.members
        )
    ) {

        book.members = [];

    }


    if (!book.privacy) {

        book.privacy =
            "private";

    }

}


/* =========================================================
   SAVE CURRENT BOOK
========================================================= */

function saveCurrentBook() {

    if (!currentBook) {
        return;
    }


    normalizeBook(
        currentBook
    );


    const books =
        getBooks();


    const index =
        books.findIndex(
            function(book) {

                return (
                    book.id ===
                    currentBook.id
                );

            }
        );


    if (index === -1) {

        books.push(
            currentBook
        );

    } else {

        books[index] =
            currentBook;

    }


    saveBooks(
        books
    );

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


    if (!currentBook) {
        return;
    }


    normalizeBook(
        currentBook
    );


    currentBook.folders.forEach(
        function(folder) {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "folder-card";


            button.textContent =
                "📁 " +
                folder.name;


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


function createFolder() {

    if (!currentBook) {

        alert(
            "Open a cookbook first."
        );

        return;

    }


    const name =
        prompt(
            "Folder name:"
        );


    if (!name) {
        return;
    }


    const cleanName =
        name.trim();


    if (!cleanName) {
        return;
    }


    currentBook.folders.push({

        id:
            makeID(),

        name:
            cleanName

    });


    saveCurrentBook();

    renderFolders();

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
        currentBook.recipes;


    if (currentFolder) {

        recipes =
            recipes.filter(
                function(recipe) {

                    return (
                        recipe.folderId ===
                        currentFolder
                    );

                }
            );

    }


    if (recipes.length === 0) {

        container.innerHTML =
            "<p>No recipes here yet.</p>";

        return;

    }


    recipes.forEach(
        function(recipe) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "recipe-card";


            const title =
                recipe.title ||
                "Untitled Recipe";


            card.textContent =
                "🍴 " +
                title;


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
   PAGE COUNT + CAMERA SCANNER
========================================================= */

function openPageCountModal() {

    const modal =
        document.getElementById(
            "pageCountModal"
        );


    if (!modal) {

        createPageCountModal();

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

                    buttons.forEach(
                        function(other) {

                            other.classList.remove(
                                "selected"
                            );

                        }
                    );


                    button.classList.add(
                        "selected"
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


    currentScanFiles =
        [];


    closePageCountModal();


    showScreen(
        "scannerScreen"
    );


    clearRecipeImagePreviews();


    updateSelectedPageText();


    updateScanButtonState();


    setTimeout(
        function() {

            openCameraForNextPage();

        },
        150
    );

}


function confirmPageCount() {

    const selected =
        document.querySelector(
            "#pageCount [data-pages].selected"
        );


    if (!selected) {

        alert(
            "Please choose how many pages you want to scan."
        );

        return;

    }


    selectPageCount(
        Number(
            selected.getAttribute(
                "data-pages"
            )
        )
    );

}


function createPageCountModal() {

    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "pageCountModal";


    modal.className =
        "modal show";


    modal.innerHTML = `

        <div class="modalCard">

            <button
                class="modalClose"
                type="button"
                onclick="closePageCountModal()"
            >
                ×
            </button>

            <h2>
                How many pages?
            </h2>

            <p>
                Choose between 1 and 5 pages.
            </p>

            <div
                id="pageCount"
                class="pageCountOptions"
            >

                <button
                    type="button"
                    data-pages="1"
                >
                    1
                </button>

                <button
                    type="button"
                    data-pages="2"
                >
                    2
                </button>

                <button
                    type="button"
                    data-pages="3"
                >
                    3
                </button>

                <button
                    type="button"
                    data-pages="4"
                >
                    4
                </button>

                <button
                    type="button"
                    data-pages="5"
                >
                    5
                </button>

            </div>

            <button
                id="confirmPageCount"
                class="primaryButton fullButton"
                type="button"
            >
                Continue
            </button>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    setupPageCountButtons();


    const confirmButton =
        document.getElementById(
            "confirmPageCount"
        );


    if (confirmButton) {

        confirmButton.onclick =
            confirmPageCount;

    }

}


function updateSelectedPageText() {

    let status =
        document.getElementById(
            "selectedPages"
        );


    if (!status) {

        status =
            document.createElement(
                "p"
            );


        status.id =
            "selectedPages";


        status.style.margin =
            "10px 0";


        status.style.color =
            "#999";


        const scanner =
            document.querySelector(
                ".scannerPage"
            );


        const images =
            document.getElementById(
                "recipeImages"
            );


        if (scanner) {

            if (images) {

                scanner.insertBefore(
                    status,
                    images
                );

            } else {

                scanner.appendChild(
                    status
                );

            }

        }

    }


    if (
        selectedPageCount === 0
    ) {

        status.textContent =
            "Choose how many pages you want to scan.";

        return;

    }


    if (
        currentScanFiles.length === 0
    ) {

        status.textContent =
            selectedPageCount === 1
                ? "Ready for page 1 of 1."
                : `Ready for page 1 of ${selectedPageCount}.`;

        return;

    }


    if (
        currentScanFiles.length <
        selectedPageCount
    ) {

        const nextPage =
            currentScanFiles.length + 1;


        status.textContent =
            `${currentScanFiles.length} of ${selectedPageCount} pages captured. ` +
            `Ready for page ${nextPage}.`;

        return;

    }


    status.textContent =
        `✓ ${selectedPageCount} of ${selectedPageCount} pages captured. ` +
        "Ready to scan.";

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


        /*
         * One photo at a time.
         *
         * This is intentional.
         *
         * 1 page:
         * camera → page 1
         *
         * 3 pages:
         * camera → page 1
         * camera → page 2
         * camera → page 3
         */

        input.multiple =
            false;


        /*
         * Ask mobile browsers
         * for the rear camera.
         */

        input.setAttribute(
            "capture",
            "environment"
        );


        input.style.display =
            "none";


        document.body.appendChild(
            input
        );


        input.addEventListener(
            "change",
            handleScannerPhoto
        );

    }


    input.value =
        "";


    input.multiple =
        false;


    input.setAttribute(
        "capture",
        "environment"
    );


    return input;

}


/* =========================================================
   OPEN CAMERA
========================================================= */

function openCameraForNextPage() {

    if (
        selectedPageCount === 0
    ) {

        return;

    }


    if (
        currentScanFiles.length >=
        selectedPageCount
    ) {

        updateSelectedPageText();

        updateScanButtonState();

        return;

    }


    const input =
        createScannerInput();


    input.value =
        "";


    updateSelectedPageText();


    input.click();

}


/* =========================================================
   PHOTO CAPTURED
========================================================= */

function handleScannerPhoto(event) {

    const input =
        event.target;


    const files =
        Array.from(
            input.files || []
        );


    /*
     * User cancelled
     * the camera/file picker.
     */

    if (
        files.length === 0
    ) {

        updateSelectedPageText();

        return;

    }


    const photo =
        files[0];


    if (
        currentScanFiles.length >=
        selectedPageCount
    ) {

        input.value =
            "";

        return;

    }


    currentScanFiles.push(
        photo
    );


    showSelectedImages(
        currentScanFiles
    );


    input.value =
        "";


    updateSelectedPageText();


    updateScanButtonState();


    /*
     * More pages are needed.
     */

    if (
        currentScanFiles.length <
        selectedPageCount
    ) {

        const nextPage =
            currentScanFiles.length + 1;


        setTimeout(
            function() {

                const continueScan =
                    confirm(
                        `Page ${currentScanFiles.length} of ${selectedPageCount} captured.\n\n` +
                        `Take page ${nextPage} now?`
                    );


                if (continueScan) {

                    openCameraForNextPage();

                } else {

                    updateSelectedPageText();

                    updateScanButtonState();

                }

            },
            150
        );


        return;

    }


    updateSelectedPageText();

    updateScanButtonState();

}


/* =========================================================
   SCANNER SETUP
========================================================= */

function setupScanner() {

    createScannerInput();


    const openPageButton =
        document.getElementById(
            "openPageCount"
        );


    if (openPageButton) {

        openPageButton.onclick =
            function() {

                openPageCountModal();

            };

    }


    const confirmButton =
        document.getElementById(
            "confirmPageCount"
        );


    if (confirmButton) {

        confirmButton.onclick =
            function() {

                confirmPageCount();

            };

    }


    let nextPageButton =
        document.getElementById(
            "chooseRecipePages"
        );


    if (!nextPageButton) {

        nextPageButton =
            document.createElement(
                "button"
            );


        nextPageButton.id =
            "chooseRecipePages";


        nextPageButton.type =
            "button";


        nextPageButton.className =
            "secondaryButton fullButton";


        nextPageButton.textContent =
            "📷 Take Next Page";


        const scanner =
            document.querySelector(
                ".scannerPage"
            );


        const startButton =
            document.getElementById(
                "startScan"
            );


        if (
            scanner &&
            startButton
        ) {

            scanner.insertBefore(
                nextPageButton,
                startButton
            );

        }

    }


    if (nextPageButton) {

        nextPageButton.onclick =
            function() {

                openCameraForNextPage();

            };


        nextPageButton.style.display =
            "none";

    }


    updateScanButtonState();

}


/* =========================================================
   UPDATE SCAN BUTTON
========================================================= */

function updateScanButtonState() {

    const startButton =
        document.getElementById(
            "startScan"
        );


    const nextPageButton =
        document.getElementById(
            "chooseRecipePages"
        );


    const complete =
        selectedPageCount > 0 &&
        currentScanFiles.length ===
        selectedPageCount;


    if (startButton) {

        startButton.disabled =
            !complete;


        startButton.style.opacity =
            complete
                ? "1"
                : "0.5";


        startButton.style.pointerEvents =
            complete
                ? "auto"
                : "none";

    }


    if (nextPageButton) {

        const needsMore =
            selectedPageCount > 0 &&
            currentScanFiles.length <
            selectedPageCount;


        nextPageButton.style.display =
            needsMore
                ? "block"
                : "none";

    }

}


/* =========================================================
   PHOTO PREVIEWS
========================================================= */

function clearRecipeImagePreviews() {

    const container =
        document.getElementById(
            "recipeImages"
        );


    if (container) {

        container.innerHTML =
            "";

    }

}


function showSelectedImages(files) {

    const container =
        document.getElementById(
            "recipeImages"
        );


    if (!container) {

        updateScanButtonState();

        return;

    }


    container.innerHTML =
        "";


    files.forEach(
        function(file, index) {

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "recipeImagePreview";


            const image =
                document.createElement(
                    "img"
                );


            image.alt =
                `Recipe page ${index + 1}`;


            image.style.maxWidth =
                "100%";


            image.style.borderRadius =
                "12px";


            image.style.display =
                "block";


            const label =
                document.createElement(
                    "div"
                );


            label.textContent =
                `Page ${index + 1}`;


            label.style.marginTop =
                "5px";


            label.style.fontSize =
                "13px";


            label.style.color =
                "#999";


            const reader =
                new FileReader();


            reader.onload =
                function(event) {

                    image.src =
                        event.target.result;

                };


            reader.readAsDataURL(
                file
            );


            wrapper.appendChild(
                image
            );


            wrapper.appendChild(
                label
            );


            container.appendChild(
                wrapper
            );

        }
    );


    updateScanButtonState();

}


/* =========================================================
   CANCEL SCAN
========================================================= */

function cancelScan() {

    currentScanFiles =
        [];


    selectedPageCount =
        0;


    const input =
        document.getElementById(
            "scannerInput"
        );


    if (input) {

        input.value =
            "";

    }


    clearRecipeImagePreviews();

    hideScannerStatus();


    updateScanButtonState();


    showScreen(
        "mainScreen"
    );

}


/* =========================================================
   START SCAN
========================================================= */

async function startScan() {

    if (
        selectedPageCount === 0
    ) {

        alert(
            "Please choose how many pages you want to scan first."
        );

        return;

    }


    if (
        currentScanFiles.length !==
        selectedPageCount
    ) {

        const remaining =
            selectedPageCount -
            currentScanFiles.length;


        alert(
            `Please capture ${remaining} more page` +
            (remaining === 1 ? "" : "s") +
            " before scanning."
        );


        openCameraForNextPage();


        return;

    }


    const files =
        currentScanFiles.slice();


    showScannerStatus(
        "Reading your recipe pages..."
    );


    try {

        const results =
            [];


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


        /*
         * Put every page into ONE OCR document.
         * MoonPlug receives all pages together.
         */

        const combinedText =
            results
                .map(
                    function(text, index) {

                        return (
                            `--- PAGE ${index + 1} ---\n` +
                            text
                        );

                    }
                )
                .join(
                    "\n\n"
                );


        updateScannerProgress(
            "MoonPlug is organizing the recipe..."
        );


        const recipe =
            await organizeRecipeWithMoonPlug(
                combinedText
            );


        hideScannerStatus();


        openRecipeEditor(
            recipe
        );


    } catch (error) {

        console.error(
            "Scan error:",
            error
        );


        hideScannerStatus();


        alert(
            error &&
            error.message
                ? error.message
                : "MealMind couldn't read the recipe."
        );

    }

}


/* =========================================================
   MOONPLUG RECIPE AI
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
            MOONPLUG_API +
            "/api/recipe/parse",
            {

                method:
                    "POST",

                headers:
                    {
                        "Content-Type":
                            "application/json"
                    },

                body:
                    JSON.stringify(
                        {
                            text:
                                ocrText
                        }
                    )

            }
        );


    let data;


    try {

        data =
            await response.json();

    } catch (error) {

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
                ? data.recipe.title.trim()
                : "",

        cuisine:
            typeof data.recipe.cuisine ===
            "string"
                ? data.recipe.cuisine.trim()
                : "",

        servings:
            typeof data.recipe.servings ===
            "string"
                ? data.recipe.servings.trim()
                : "",

        ingredients:
            Array.isArray(
                data.recipe.ingredients
            )
                ? data.recipe.ingredients
                : [],

        instructions:
            Array.isArray(
                data.recipe.instructions
            )
                ? data.recipe.instructions
                : [],

        notes:
            typeof data.recipe.notes ===
            "string"
                ? data.recipe.notes.trim()
                : ""

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


    try {

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
                                        ) *
                                        100
                                    );


                                updateScannerProgress(
                                    "Reading recipe... " +
                                    percent +
                                    "%"
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


        if (
            text.trim().length ===
            0
        ) {

            throw new Error(
                "No text was detected."
            );

        }


        return text;


    } catch (error) {

        console.error(
            "OCR error:",
            error
        );


        throw error;

    }

}


/* =========================================================
   OCR TEXT CLEANING
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


/* =========================================================
   TITLE CLEANING
========================================================= */

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


/* =========================================================
   TITLE VALIDATION
========================================================= */

function isValidRecipeTitle(title) {

    if (!title) {
        return false;
    }


    return /^[a-zA-Z0-9\s.'\/]+$/.test(
        title
    );

}


/* =========================================================
   CLEAN LIST
========================================================= */

function cleanRecipeList(items) {

    if (
        !Array.isArray(
            items
        )
    ) {

        return [];

    }


    return items

        .map(
            function(item) {

                return cleanRecipeText(
                    item
                );

            }
        )

        .filter(
            function(item) {

                return (
                    item.length > 0
                );

            }
        );

}


/* =========================================================
   RECIPE EDITOR
========================================================= */

function openRecipeEditor(recipe) {

    currentRecipe =
        recipe;


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

        createRecipeEditor();

        return;

    }


    fillRecipeEditor();

}


/* =========================================================
   CREATE EDITOR IF NEEDED
========================================================= */

function createRecipeEditor() {

    let modal =
        document.getElementById(
            "editorModal"
        );


    if (!modal) {

        modal =
            document.createElement(
                "div"
            );


        modal.id =
            "editorModal";


        modal.className =
            "overlay";


        document.body.appendChild(
            modal
        );

    }


    modal.innerHTML = `

        <div class="editor-box">

            <h2>
                Edit & Save Recipe
            </h2>

            <label>
                Recipe Title
            </label>

            <input
                id="recipeTitle"
                type="text"
                placeholder="Enter recipe title"
            >

            <label>
                Ingredients
            </label>

            <textarea
                id="recipeIngredients"
                rows="8"
            ></textarea>

            <label>
                Instructions
            </label>

            <textarea
                id="recipeInstructions"
                rows="8"
            ></textarea>

            <label>
                📁 Save to folder
            </label>

            <select
                id="recipeFolder"
            >

                <option value="">
                    No Folder
                </option>

            </select>

            <div class="editor-buttons">

                <button
                    type="button"
                    onclick="saveEditedRecipe()"
                >
                    Save Recipe
                </button>

                <button
                    type="button"
                    onclick="closeRecipeEditor()"
                >
                    Cancel
                </button>

            </div>

        </div>

    `;


    fillRecipeEditor();

}


/* =========================================================
   FILL EDITOR
========================================================= */

function fillRecipeEditor() {

    const modal =
        document.getElementById(
            "editorModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "hidden"
    );


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


    if (titleInput) {

        titleInput.value =
            currentRecipe &&
            currentRecipe.title
                ? currentRecipe.title
                : "";

    }


    if (ingredientsInput) {

        ingredientsInput.value =
            currentRecipe &&
            Array.isArray(
                currentRecipe.ingredients
            )
                ? currentRecipe.ingredients.join(
                    "\n"
                )
                : "";

    }


    if (instructionsInput) {

        instructionsInput.value =
            currentRecipe &&
            Array.isArray(
                currentRecipe.instructions
            )
                ? currentRecipe.instructions.join(
                    "\n"
                )
                : "";

    }


    if (folderInput) {

        folderInput.innerHTML = `

            <option value="">
                No Folder
            </option>

        `;


        if (
            currentBook &&
            Array.isArray(
                currentBook.folders
            )
        ) {

            currentBook.folders.forEach(
                function(folder) {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        folder.id;


                    option.textContent =
                        folder.name;


                    if (
                        currentRecipe &&
                        currentRecipe.folderId ===
                        folder.id
                    ) {

                        option.selected =
                            true;

                    }


                    folderInput.appendChild(
                        option
                    );

                }
            );

        }

    }

}


/* =========================================================
   SAVE EDITED RECIPE
========================================================= */

function saveEditedRecipe() {

    if (!currentBook) {

        alert(
            "Open a cookbook first."
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
            ? titleInput.value.trim()
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


        if (titleInput) {

            titleInput.focus();

        }


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

        title:
            cleanRecipeTitle(
                title
            ),

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

        ingredients:
            cleanRecipeList(
                ingredients
            ),

        instructions:
            cleanRecipeList(
                instructions
            ),

        notes:
            currentRecipe &&
            currentRecipe.notes
                ? cleanRecipeText(
                    currentRecipe.notes
                )
                : "",

        folderId:
            folderId,

        pages:
            currentScanFiles.length

    };


    const existingIndex =
        currentBook.recipes.findIndex(
            function(item) {

                return (
                    currentRecipe &&
                    item.id ===
                    currentRecipe.id
                );

            }
        );


    if (
        existingIndex >= 0
    ) {

        currentBook.recipes[
            existingIndex
        ] =
            recipe;

    } else {

        currentBook.recipes.push(
            recipe
        );

    }


    currentRecipe =
        recipe;


    saveBooks(
        getBooks().map(
            function(book) {

                return (
                    book.id ===
                    currentBook.id
                )
                    ? currentBook
                    : book;

            }
        )
    );


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

}


/* =========================================================
   OPEN SAVED RECIPE
========================================================= */

function openRecipe(recipe) {

    currentRecipe =
        recipe;


    const viewer =
        document.getElementById(
            "recipeViewer"
        );


    if (!viewer) {

        return;

    }


    viewer.innerHTML = `

        <div class="recipe-view-box">

            <h2>
                ${escapeHTML(
                    recipe.title ||
                    "Untitled Recipe"
                )}
            </h2>

            <h3>
                Ingredients
            </h3>

            <ul>

                ${(
                    recipe.ingredients ||
                    []
                )
                .map(
                    function(item) {

                        return `
                            <li>
                                ${escapeHTML(item)}
                            </li>
                        `;

                    }
                )
                .join("")}

            </ul>

            <h3>
                Instructions
            </h3>

            <ol>

                ${(
                    recipe.instructions ||
                    []
                )
                .map(
                    function(item) {

                        return `
                            <li>
                                ${escapeHTML(item)}
                            </li>
                        `;

                    }
                )
                .join("")}

            </ol>

            <button
                onclick="closeRecipeViewer()"
            >
                Close
            </button>

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

    }

}


/* =========================================================
   PUBLIC COOKBOOKS
========================================================= */

function renderPublicCookbooks() {

    const container =
        document.getElementById(
            "publicCookbooks"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    const books =
        getBooks();


    const publicBooks =
        books.filter(
            function(book) {

                return (
                    book.privacy ===
                    "public"
                );

            }
        );


    if (
        publicBooks.length ===
        0
    ) {

        container.innerHTML =
            "<p>No public cookbooks yet.</p>";

        return;

    }


    publicBooks.forEach(
        function(book) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "recipe-card";


            card.innerHTML = `

                <h3>
                    ${escapeHTML(
                        book.name
                    )}
                </h3>

                <p>
                    ${
                        Array.isArray(
                            book.recipes
                        )
                            ? book.recipes.length
                            : 0
                    }
                    recipes
                </p>

            `;


            card.addEventListener(
                "click",
                function() {

                    openCookbook(
                        book
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
   SETTINGS
========================================================= */

function showSettings() {

    if (!currentBook) {

        alert(
            "Open a cookbook first."
        );

        return;

    }


    const code =
        currentBook.password ||
        "Not available";


    const members =
        currentBook.members ||
        [];


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
   PASSWORD SHOW / HIDE
========================================================= */

function setupPasswordToggles() {

    const createPassword =
        document.getElementById(
            "showCreatePassword"
        );


    const createInput =
        document.getElementById(
            "cookbookPassword"
        );


    if (
        createPassword &&
        createInput
    ) {

        createPassword.addEventListener(
            "change",
            function() {

                createInput.type =
                    this.checked
                        ? "text"
                        : "password";

            }
        );

    }


    const joinPassword =
        document.getElementById(
            "showJoinPassword"
        );


    const joinInput =
        document.getElementById(
            "joinPassword"
        );


    if (
        joinPassword &&
        joinInput
    ) {

        joinPassword.addEventListener(
            "change",
            function() {

                joinInput.type =
                    this.checked
                        ? "text"
                        : "password";

            }
        );

    }

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


            const cards =
                document.querySelectorAll(
                    ".recipe-card"
                );


            cards.forEach(
                function(card) {

                    const text =
                        card.textContent
                            .toLowerCase();


                    card.style.display =
                        !query ||
                        text.includes(
                            query
                        )
                            ? ""
                            : "none";

                }
            );

        }
    );

}


/* =========================================================
   HTML ESCAPE
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


    const progress =
        document.getElementById(
            "scannerProgress"
        );


    if (progress) {

        progress.textContent =
            message;

    }

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
   INITIALIZE
========================================================= */

function initializeMealMind() {

    setupHomeButtons();

    setupScanner();

    setupPasswordToggles();

    setupSearch();


    showScreen(
        "homeScreen"
    );

}


document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializeMealMind();

    }
);
