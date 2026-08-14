/* =========================================
   MEALMIND
========================================= */


/*
    IMPORTANT:

    ownerLoggedIn is ONLY a JavaScript variable.

    It is NOT saved in localStorage.

    Therefore:
    - Refresh = logged out
    - Close/reopen = logged out
    - iPad reopening the site = logged out
*/


let ownerLoggedIn = false;


/* =========================================
   ELEMENTS
========================================= */

const scanButton =
    document.getElementById("scanButton");

const recipeImage =
    document.getElementById("recipeImage");

const recipeText =
    document.getElementById("recipeText");

const status =
    document.getElementById("status");

const saveRecipeButton =
    document.getElementById(
        "saveRecipeButton"
    );


/* DOWNLOAD */

const downloadScreen =
    document.getElementById(
        "downloadScreen"
    );

const closeDownload =
    document.getElementById(
        "closeDownload"
    );


/* OWNER LOGIN */

const ownerLogin =
    document.getElementById(
        "ownerLogin"
    );

const ownerCode =
    document.getElementById(
        "ownerCode"
    );

const ownerButton =
    document.getElementById(
        "ownerButton"
    );

const ownerStatus =
    document.getElementById(
        "ownerStatus"
    );


/* OWNER */

const ownerPanel =
    document.getElementById(
        "ownerPanel"
    );

const closeOwner =
    document.getElementById(
        "closeOwner"
    );

const ownerRecipeImage =
    document.getElementById(
        "ownerRecipeImage"
    );

const ownerScanButton =
    document.getElementById(
        "ownerScanButton"
    );

const ownerScanStatus =
    document.getElementById(
        "ownerScanStatus"
    );


/* RECIPES */

const savedRecipes =
    document.getElementById(
        "savedRecipes"
    );

const folderTitle =
    document.getElementById(
        "folderTitle"
    );

const allRecipesButton =
    document.getElementById(
        "allRecipesButton"
    );


/* COUNTS */

const countSweet =
    document.getElementById(
        "countSweet"
    );

const countSavoury =
    document.getElementById(
        "countSavoury"
    );

const countFried =
    document.getElementById(
        "countFried"
    );

const countInternational =
    document.getElementById(
        "countInternational"
    );


/* DETAILS */

const recipeDetails =
    document.getElementById(
        "recipeDetails"
    );

const closeRecipe =
    document.getElementById(
        "closeRecipe"
    );

const detailTitle =
    document.getElementById(
        "detailTitle"
    );

const detailCategory =
    document.getElementById(
        "detailCategory"
    );

const detailIngredients =
    document.getElementById(
        "detailIngredients"
    );

const detailText =
    document.getElementById(
        "detailText"
    );


/* =========================================
   PUBLIC SCANNING
========================================= */

scanButton.addEventListener(
    "click",
    function () {

        /*
            Only the PUBLIC scan count matters here.

            Owner recipes do NOT use up
            the public user's two scans.
        */

        const publicCount =
            getPublicScanCount();


        if (publicCount >= 2) {

            downloadScreen.hidden =
                false;

            return;

        }


        recipeImage.click();

    }
);


/* =========================================
   PUBLIC CAMERA
========================================= */

recipeImage.addEventListener(
    "change",
    async function () {

        const file =
            recipeImage.files[0];


        if (!file) {

            return;

        }


        status.textContent =
            "🔍 Reading recipe...";


        try {

            const text =
                await scanImage(file);


            if (!text) {

                status.textContent =
                    "❌ I couldn't read that recipe.";

                return;

            }


            recipeText.value =
                cleanOCRText(text);


            status.textContent =
                "✅ Recipe scanned!";

        }


        catch (error) {

            console.error(error);

            status.textContent =
                "❌ Scanner error.";

        }

    }
);


/* =========================================
   BETTER OCR
========================================= */

async function scanImage(file) {

    const result =
        await Tesseract.recognize(

            file,

            "eng",

            {

                logger:
                function (info) {

                    if (
                        info.status ===
                        "recognizing text"
                    ) {

                        const percent =
                            Math.round(
                                info.progress * 100
                            );


                        status.textContent =
                            "🔍 Reading recipe... "
                            + percent
                            + "%";

                    }

                }

            }

        );


    return result.data.text;

}


/* =========================================
   CLEAN OCR TEXT
========================================= */

function cleanOCRText(text) {

    let cleaned =
        text;


    /*
        Remove common OCR junk.
    */

    cleaned =
        cleaned.replace(
            /[^\x09\x0A\x0D\x20-\x7EÀ-ÿ]/g,
            ""
        );


    /*
        Replace strange repeated symbols.
    */

    cleaned =
        cleaned.replace(
            /[|]{2,}/g,
            " "
        );


    cleaned =
        cleaned.replace(
            /[_]{3,}/g,
            " "
        );


    cleaned =
        cleaned.replace(
            /[~`^]{2,}/g,
            " "
        );


    /*
        Clean excessive spaces.
    */

    cleaned =
        cleaned.replace(
            /[ \t]+/g,
            " "
        );


    /*
        Remove blank lines at
        the beginning/end.
    */

    cleaned =
        cleaned
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


    return cleaned.trim();

}


/* =========================================
   SECRET OWNER TRIGGER
========================================= */

let ownerTyping = "";


recipeText.addEventListener(
    "keydown",
    function (event) {

        /*
            Secret code:

            1591 + Enter
        */

        if (
            event.key === "Enter"
        ) {

            if (
                ownerTyping === "1591"
            ) {

                event.preventDefault();


                ownerTyping = "";


                recipeText.value = "";


                /*
                    Open login.

                    We do NOT set ownerLoggedIn
                    here. The user still needs
                    the owner password.
                */

                ownerLogin.hidden =
                    false;


                ownerCode.value =
                    "";


                ownerStatus.textContent =
                    "";


                setTimeout(
                    function () {

                        ownerCode.focus();

                    },
                    50
                );


                return;

            }


            ownerTyping = "";

            return;

        }


        /*
            Only track numbers.
        */

        if (
            /^[0-9]$/.test(
                event.key
            )
        ) {

            ownerTyping +=
                event.key;


            /*
                Keep only the last
                four digits.
            */

            if (
                ownerTyping.length > 4
            ) {

                ownerTyping =
                    ownerTyping.slice(-4);

            }

        }

    }
);


/* =========================================
   SAVE PUBLIC RECIPE
========================================= */

saveRecipeButton.addEventListener(
    "click",
    function () {

        const text =
            cleanOCRText(
                recipeText.value.trim()
            );


        if (!text) {

            status.textContent =
                "❌ No recipe to save.";

            return;

        }


        const publicCount =
            getPublicScanCount();


        /*
            Public limit.
        */

        if (
            publicCount >= 2
        ) {

            downloadScreen.hidden =
                false;

            return;

        }


        saveRecipe(text);


        /*
            Increase public count.

            Owner recipes don't change
            this number.
        */

        setPublicScanCount(
            publicCount + 1
        );


        recipeText.value = "";


        status.textContent =
            "✅ Recipe saved!";


    }
);


/* =========================================
   SAVE RECIPE
========================================= */

function saveRecipe(text) {

    const recipes =
        getRecipes();


    const recipe = {

        id:
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2),

        name:
            getRecipeName(text),

        category:
            detectCategory(text),

        ingredients:
            getIngredients(text),

        text:
            text,

        date:
            new Date()
                .toLocaleString()

    };


    recipes.push(recipe);


    localStorage.setItem(

        "mealmindRecipes",

        JSON.stringify(recipes)

    );


    /*
        Update folder numbers
        immediately.
    */

    updateFolderCounts();

}


/* =========================================
   RECIPE NAME
========================================= */

function getRecipeName(text) {

    const lines =
        text
            .split("\n")
            .map(
                line =>
                    line.trim()
            )
            .filter(
                line =>
                    line.length > 0
            );


    if (
        lines.length === 0
    ) {

        return "Untitled Recipe";

    }


    let firstLine =
        lines[0];


    /*
        Remove common OCR junk
        from the title.
    */

    firstLine =
        firstLine.replace(
            /^[^A-Za-zÀ-ÿ0-9]+/,
            ""
        );


    if (
        firstLine.length > 80
    ) {

        firstLine =
            firstLine.slice(
                0,
                80
            );

    }


    return (
        firstLine ||
        "Untitled Recipe"
    );

}


/* =========================================
   CATEGORY DETECTION
========================================= */

function detectCategory(text) {

    const lower =
        text.toLowerCase();


    const categories = [];


    /* SWEET */

    if (

        lower.includes("cake") ||
        lower.includes("cookie") ||
        lower.includes("brownie") ||
        lower.includes("chocolate") ||
        lower.includes("dessert") ||
        lower.includes("icing") ||
        lower.includes("frosting") ||
        lower.includes("candy") ||
        lower.includes("pie") ||
        lower.includes("sugar")

    ) {

        categories.push(
            "Sweet"
        );

    }


    /* SAVOURY */

    if (

        lower.includes("chicken") ||
        lower.includes("beef") ||
        lower.includes("pork") ||
        lower.includes("turkey") ||
        lower.includes("pasta") ||
        lower.includes("soup") ||
        lower.includes("salad") ||
        lower.includes("rice") ||
        lower.includes("potato") ||
        lower.includes("vegetable") ||
        lower.includes("cheese") ||
        lower.includes("sandwich")

    ) {

        categories.push(
            "Savoury"
        );

    }


    /* FRIED */

    if (

        lower.includes("fried") ||
        lower.includes("fry ") ||
        lower.includes("frying") ||
        lower.includes("deep-fry") ||
        lower.includes("deep fry") ||
        lower.includes("pan-fry") ||
        lower.includes("pan fry")

    ) {

        categories.push(
            "Fried"
        );

    }


    /* INTERNATIONAL */

    if (

        lower.includes("taco") ||
        lower.includes("burrito") ||
        lower.includes("curry") ||
        lower.includes("sushi") ||
        lower.includes("ramen") ||
        lower.includes("pizza") ||
        lower.includes("pad thai") ||
        lower.includes("teriyaki") ||
        lower.includes("enchilada") ||
        lower.includes("lasagna") ||
        lower.includes("risotto") ||
        lower.includes("kimchi")

    ) {

        categories.push(
            "International"
        );

    }


    /*
        If nothing was detected,
        put it in Savoury.
    */

    if (
        categories.length === 0
    ) {

        categories.push(
            "Savoury"
        );

    }


    return categories;

}


/* =========================================
   INGREDIENT DETECTION
========================================= */

function getIngredients(text) {

    const lines =
        text
            .split("\n")
            .map(
                line =>
                    line.trim()
            )
            .filter(
                line =>
                    line.length > 0
            );


    const ingredients = [];


    /*
        Look for an Ingredients heading.
    */

    let ingredientStart =
        -1;


    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        const line =
            lines[i].toLowerCase();


        if (
            line.includes("ingredient")
        ) {

            ingredientStart =
                i + 1;

            break;

        }

    }


    /*
        If we found an Ingredients
        heading, use the lines after it.
    */

    if (
        ingredientStart !== -1
    ) {

        for (
            let i = ingredientStart;
            i < lines.length;
            i++
        ) {

            const line =
                lines[i];


            const lower =
                line.toLowerCase();


            /*
                Stop when instructions
                begin.
            */

            if (

                lower.includes("instructions") ||
                lower.includes("directions") ||
                lower.includes("method") ||
                lower === "steps"

            ) {

                break;

            }


            if (
                line.length <= 120
            ) {

                ingredients.push(
                    cleanIngredient(line)
                );

            }


            if (
                ingredients.length >= 30
            ) {

                break;

            }

        }


        return ingredients.filter(
            item =>
                item.length > 0
        );

    }


    /*
        If no Ingredients heading
        was found, make a reasonable
        temporary guess.
    */

    for (
        let i = 1;
        i < lines.length;
        i++
    ) {

        const line =
            lines[i];


        const lower =
            line.toLowerCase();


        if (

            lower.includes("instructions") ||
            lower.includes("directions") ||
            lower.includes("method")

        ) {

            break;

        }


        /*
            Ingredients are usually
            relatively short lines.
        */

        if (
            line.length <= 80
        ) {

            ingredients.push(
                cleanIngredient(line)
            );

        }


        if (
            ingredients.length >= 15
        ) {

            break;

        }

    }


    return ingredients.filter(
        item =>
            item.length > 0
    );

}


/* =========================================
   CLEAN INGREDIENT
========================================= */

function cleanIngredient(text) {

    return text

        .replace(
            /^[•●▪◦○oO]\s*/,
            ""
        )

        .replace(
            /^[-–—]\s*/,
            ""
        )

        .replace(
            /^\d+\.\s*/,
            ""
        )

        .replace(
            /^[^A-Za-z0-9¼½¾⅓⅔⅛⅜⅝⅞]+/,
            ""
        )

        .trim();

}


/* =========================================
   OWNER LOGIN
========================================= */

ownerButton.addEventListener(
    "click",
    function () {

        const code =
            ownerCode.value.trim();


        if (
            code === "BumsUp2AI"
        ) {

            /*
                THIS is the only place
                ownerLoggedIn becomes true.
            */

            ownerLoggedIn = true;


            ownerLogin.hidden =
                true;


            ownerPanel.hidden =
                false;


            ownerCode.value = "";


            ownerStatus.textContent =
                "";


            updateFolderCounts();


            showAllRecipes();

        }

        else {

            ownerStatus.textContent =
                "❌ Incorrect owner code.";

        }

    }
);


/* =========================================
   OWNER SCANNER
========================================= */

ownerScanButton.addEventListener(
    "click",
    function () {

        /*
            Extra protection.

            If somehow the panel is opened
            without logging in, don't scan.
        */

        if (
            !ownerLoggedIn
        ) {

            ownerPanel.hidden =
                true;

            ownerLogin.hidden =
                false;

            return;

        }


        ownerRecipeImage.click();

    }
);


/* =========================================
   OWNER CAMERA
========================================= */

ownerRecipeImage.addEventListener(
    "change",
    async function () {

        const file =
            ownerRecipeImage.files[0];


        if (!file) {

            return;

        }


        ownerScanStatus.textContent =
            "🔍 Reading recipe...";


        try {

            const result =
                await Tesseract.recognize(

                    file,

                    "eng",

                    {

                        logger:
                        function (info) {

                            if (
                                info.status ===
                                "recognizing text"
                            ) {

                                const percent =
                                    Math.round(
                                        info.progress *
                                        100
                                    );


                                ownerScanStatus.textContent =
                                    "🔍 Reading recipe... "
                                    + percent
                                    + "%";

                            }

                        }

                    }

                );


            const cleaned =
                cleanOCRText(
                    result.data.text
                );


            if (!cleaned) {

                ownerScanStatus.textContent =
                    "❌ Couldn't read the recipe.";

                return;

            }


            /*
                Owner recipes are unlimited.
            */

            saveRecipe(cleaned);


            ownerScanStatus.textContent =
                "✅ Recipe saved!";


            updateFolderCounts();


            showAllRecipes();


            /*
                Allow the same image to
                be selected again later.
            */

            ownerRecipeImage.value = "";

        }


        catch (error) {

            console.error(error);


            ownerScanStatus.textContent =
                "❌ Scanner error.";

        }

    }
);


/* =========================================
   SHOW ALL RECIPES
========================================= */

function showAllRecipes() {

    if (
        !ownerLoggedIn
    ) {

        return;

    }


    folderTitle.textContent =
        "📖 All Recipes";


    displayRecipes(
        getRecipes()
    );

}


/* =========================================
   FOLDER BUTTONS
========================================= */

document
    .querySelectorAll(".folder")
    .forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    if (
                        !ownerLoggedIn
                    ) {

                        return;

                    }


                    const folder =
                        button.dataset.folder;


                    folderTitle.textContent =
                        "📂 " + folder;


                    const recipes =
                        getRecipes();


                    const filtered =
                        recipes.filter(
                            function (recipe) {

                                return Array.isArray(
                                    recipe.category
                                ) &&
                                recipe.category.includes(
                                    folder
                                );

                            }
                        );


                    displayRecipes(
                        filtered
                    );

                }
            );

        }
    );


/* =========================================
   ALL RECIPES
========================================= */

allRecipesButton.addEventListener(
    "click",
    function () {

        showAllRecipes();

    }
);


/* =========================================
   UPDATE FOLDER COUNTS
========================================= */

function updateFolderCounts() {

    const recipes =
        getRecipes();


    let sweet = 0;

    let savoury = 0;

    let fried = 0;

    let international = 0;


    recipes.forEach(
        function (recipe) {

            const categories =
                Array.isArray(
                    recipe.category
                )
                    ? recipe.category
                    : [];


            if (
                categories.includes(
                    "Sweet"
                )
            ) {

                sweet++;

            }


            if (
                categories.includes(
                    "Savoury"
                )
            ) {

                savoury++;

            }


            if (
                categories.includes(
                    "Fried"
                )
            ) {

                fried++;

            }


            if (
                categories.includes(
                    "International"
                )
            ) {

                international++;

            }

        }
    );


    countSweet.textContent =
        sweet;


    countSavoury.textContent =
        savoury;


    countFried.textContent =
        fried;


    countInternational.textContent =
        international;

}


/* =========================================
   DISPLAY RECIPES
========================================= */

function displayRecipes(
    recipes
) {

    savedRecipes.innerHTML =
        "";


    if (
        recipes.length === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "empty-recipes";


        empty.textContent =
            "No recipes here yet.";


        savedRecipes.appendChild(
            empty
        );


        return;

    }


    recipes.forEach(
        function (recipe) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "recipe-card";


            const title =
                document.createElement(
                    "h3"
                );


            title.textContent =
                recipe.name ||
                "Untitled Recipe";


            const category =
                document.createElement(
                    "p"
                );


            category.className =
                "recipe-category";


            category.textContent =
                Array.isArray(
                    recipe.category
                )
                    ? recipe.category.join(
                        " • "
                    )
                    : "Savoury";


            card.appendChild(
                title
            );


            card.appendChild(
                category
            );


            card.addEventListener(
                "click",
                function () {

                    openRecipe(
                        recipe
                    );

                }
            );


            savedRecipes.appendChild(
                card
            );

        }
    );

}


/* =========================================
   OPEN RECIPE
========================================= */

function openRecipe(recipe) {

    detailTitle.textContent =
        recipe.name ||
        "Untitled Recipe";


    detailCategory.textContent =
        Array.isArray(
            recipe.category
        )
            ? recipe.category.join(
                " • "
            )
            : "";


    detailIngredients.innerHTML =
        "";


    const ingredients =
        Array.isArray(
            recipe.ingredients
        )
            ? recipe.ingredients
            : [];


    if (
        ingredients.length === 0
    ) {

        const li =
            document.createElement(
                "li"
            );


        li.textContent =
            "Ingredients haven't been separated yet.";


        detailIngredients.appendChild(
            li
        );

    }

    else {

        ingredients.forEach(
            function (ingredient) {

                const li =
                    document.createElement(
                        "li"
                    );


                li.textContent =
                    ingredient;


                detailIngredients.appendChild(
                    li
                );

            }
        );

    }


    detailText.textContent =
        recipe.text || "";


    recipeDetails.hidden =
        false;

}


/* =========================================
   CLOSE RECIPE
========================================= */

closeRecipe.addEventListener(
    "click",
    function () {

        recipeDetails.hidden =
            true;

    }
);


/* =========================================
   LOG OUT
========================================= */

closeOwner.addEventListener(
    "click",
    function () {

        /*
            Completely remove owner access.
        */

        ownerLoggedIn = false;


        ownerPanel.hidden =
            true;


        ownerLogin.hidden =
            true;


        ownerScanStatus.textContent =
            "";


        showMainPage();

    }
);


/* =========================================
   SHOW MAIN PAGE
========================================= */

function showMainPage() {

    window.scrollTo(
        0,
        0
    );

}


/* =========================================
   DOWNLOAD SCREEN
========================================= */

closeDownload.addEventListener(
    "click",
    function () {

        downloadScreen.hidden =
            true;

    }
);


/* =========================================
   GET RECIPES
========================================= */

function getRecipes() {

    try {

        const saved =
            localStorage.getItem(
                "mealmindRecipes"
            );


        if (!saved) {

            return [];

        }


        const recipes =
            JSON.parse(saved);


        return Array.isArray(
            recipes
        )
            ? recipes
            : [];

    }

    catch (error) {

        console.error(error);

        return [];

    }

}


/* =========================================
   PUBLIC SCAN COUNT
========================================= */

function getPublicScanCount() {

    const value =
        localStorage.getItem(
            "mealmindPublicScanCount"
        );


    const number =
        Number(value);


    if (
        Number.isNaN(number)
    ) {

        return 0;

    }


    return number;

}


function setPublicScanCount(
    number
) {

    localStorage.setItem(
        "mealmindPublicScanCount",
        String(number)
    );

}


/* =========================================
   STARTUP
========================================= */

/*
    VERY IMPORTANT:

    We intentionally DO NOT restore
    ownerLoggedIn from localStorage.

    Every page load starts as:

        ownerLoggedIn = false

    So the owner must enter the codes
    again.
*/


ownerLoggedIn = false;


ownerPanel.hidden =
    true;


ownerLogin.hidden =
    true;


recipeDetails.hidden =
    true;


downloadScreen.hidden =
    true;


/*
    We can still update folder
    counts internally.
*/

updateFolderCounts();
