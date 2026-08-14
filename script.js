/* =========================================
   MEALMIND - CLEAN RECIPE SCANNER
========================================= */

let ownerLoggedIn = false;
let pendingImage = null;
let pendingOwnerScan = false;


/* =========================================
   ELEMENTS
========================================= */

const scanButton = document.getElementById("scanButton");
const recipeImage = document.getElementById("recipeImage");
const recipeText = document.getElementById("recipeText");
const saveRecipeButton = document.getElementById("saveRecipeButton");
const status = document.getElementById("status");

const photoCheck = document.getElementById("photoCheck");
const photoWarnings = document.getElementById("photoWarnings");
const usePhotoButton = document.getElementById("usePhotoButton");
const retakeButton = document.getElementById("retakeButton");

const reviewScreen = document.getElementById("reviewScreen");
const reviewText = document.getElementById("reviewText");
const acceptScanButton = document.getElementById("acceptScanButton");
const reviewRetakeButton = document.getElementById("reviewRetakeButton");

const downloadScreen = document.getElementById("downloadScreen");
const closeDownload = document.getElementById("closeDownload");

const ownerLogin = document.getElementById("ownerLogin");
const ownerCode = document.getElementById("ownerCode");
const ownerButton = document.getElementById("ownerButton");
const ownerStatus = document.getElementById("ownerStatus");

const ownerPanel = document.getElementById("ownerPanel");
const closeOwner = document.getElementById("closeOwner");
const ownerRecipeImage = document.getElementById("ownerRecipeImage");
const ownerScanButton = document.getElementById("ownerScanButton");
const ownerScanStatus = document.getElementById("ownerScanStatus");

const savedRecipes = document.getElementById("savedRecipes");
const folderTitle = document.getElementById("folderTitle");
const allRecipesButton = document.getElementById("allRecipesButton");

const countSweet = document.getElementById("countSweet");
const countSavoury = document.getElementById("countSavoury");
const countFried = document.getElementById("countFried");
const countInternational = document.getElementById("countInternational");

const recipeDetails = document.getElementById("recipeDetails");
const closeRecipe = document.getElementById("closeRecipe");
const detailTitle = document.getElementById("detailTitle");
const detailCategory = document.getElementById("detailCategory");
const detailIngredients = document.getElementById("detailIngredients");
const detailText = document.getElementById("detailText");


/* =========================================
   PUBLIC SCANNER
========================================= */

scanButton.addEventListener("click", function () {

    if (getPublicScanCount() >= 2) {
        downloadScreen.hidden = false;
        return;
    }

    recipeImage.value = "";
    recipeImage.click();

});


recipeImage.addEventListener("change", async function () {

    const file = recipeImage.files[0];

    if (!file) return;

    pendingImage = file;
    pendingOwnerScan = false;

    await inspectPhoto(file);

});


/* =========================================
   OWNER SCANNER
========================================= */

ownerScanButton.addEventListener("click", function () {

    if (!ownerLoggedIn) {
        ownerPanel.hidden = true;
        ownerLogin.hidden = false;
        return;
    }

    ownerRecipeImage.value = "";
    ownerRecipeImage.click();

});


ownerRecipeImage.addEventListener("change", async function () {

    const file = ownerRecipeImage.files[0];

    if (!file) return;

    pendingImage = file;
    pendingOwnerScan = true;

    await inspectPhoto(file);

});


/* =========================================
   PHOTO CHECK
========================================= */

async function inspectPhoto(file) {

    photoWarnings.innerHTML = "";

    const warnings = [];

    try {

        const image = await loadImage(file);

        if (image.width < 900 || image.height < 900) {

            warnings.push(
                "The photo resolution is low. Try moving closer to the recipe."
            );

        }

        const ratio = image.width / image.height;

        if (ratio > 3 || ratio < 0.33) {

            warnings.push(
                "The page may not be completely in frame."
            );

        }

        const quality = analyzeImageQuality(image);

        if (quality.dark) {

            warnings.push(
                "The photo looks dark. Try better lighting."
            );

        }

        if (quality.lowContrast) {

            warnings.push(
                "The text may be difficult to separate from the background."
            );

        }

        if (quality.edgeRisk) {

            warnings.push(
                "For best results, keep the recipe flat and take the photo straight above it."
            );

        }

        if (warnings.length > 0) {

            showPhotoWarnings(warnings);
            photoCheck.hidden = false;

        } else {

            await runOCR(file);

        }

    } catch (error) {

        console.error(error);
        await runOCR(file);

    }

}


/* =========================================
   LOAD IMAGE
========================================= */

function loadImage(file) {

    return new Promise(function (resolve, reject) {

        const url = URL.createObjectURL(file);

        const image = new Image();

        image.onload = function () {

            URL.revokeObjectURL(url);
            resolve(image);

        };

        image.onerror = reject;

        image.src = url;

    });

}


/* =========================================
   IMAGE QUALITY
========================================= */

function analyzeImageQuality(image) {

    const canvas = document.createElement("canvas");

    const maxSize = 500;

    const scale = Math.min(
        1,
        maxSize / Math.max(image.width, image.height)
    );

    canvas.width = Math.max(
        1,
        Math.round(image.width * scale)
    );

    canvas.height = Math.max(
        1,
        Math.round(image.height * scale)
    );

    const ctx = canvas.getContext("2d");

    ctx.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
    );

    const data = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
    ).data;

    let brightness = 0;
    let brightnessSquared = 0;

    const pixels = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const gray =
            0.299 * r +
            0.587 * g +
            0.114 * b;

        brightness += gray;
        brightnessSquared += gray * gray;

    }

    const average = brightness / pixels;

    const variance =
        (brightnessSquared / pixels) -
        (average * average);

    const contrast =
        Math.sqrt(Math.max(0, variance));

    return {

        dark: average < 55,

        lowContrast: contrast < 25,

        edgeRisk:
            average < 75 ||
            contrast < 35

    };

}


/* =========================================
   PHOTO WARNINGS
========================================= */

function showPhotoWarnings(warnings) {

    photoWarnings.innerHTML = "";

    const box = document.createElement("div");

    box.className = "warning-box";

    const title = document.createElement("strong");

    title.textContent =
        "⚠️ This photo may be difficult to read";

    box.appendChild(title);

    warnings.forEach(function (warning) {

        const p = document.createElement("p");

        p.textContent = "• " + warning;

        box.appendChild(p);

    });

    photoWarnings.appendChild(box);

}


/* =========================================
   USE PHOTO
========================================= */

usePhotoButton.addEventListener("click", async function () {

    photoCheck.hidden = true;

    if (pendingImage) {
        await runOCR(pendingImage);
    }

});


/* =========================================
   RETAKE
========================================= */

retakeButton.addEventListener("click", function () {

    photoCheck.hidden = true;

    if (pendingOwnerScan) {

        ownerRecipeImage.value = "";
        ownerRecipeImage.click();

    } else {

        recipeImage.value = "";
        recipeImage.click();

    }

});


/* =========================================
   OCR
========================================= */

async function runOCR(file) {

    if (pendingOwnerScan) {

        ownerScanStatus.textContent =
            "🔍 Preparing recipe...";

    } else {

        status.textContent =
            "🔍 Preparing recipe...";

    }

    try {

        const processed =
            await preprocessImage(file);

        const result =
            await Tesseract.recognize(
                processed,
                "eng",
                {

                    logger: function (info) {

                        if (
                            info.status ===
                            "recognizing text"
                        ) {

                            const percent =
                                Math.round(
                                    info.progress * 100
                                );

                            const message =
                                "🔍 Reading recipe... " +
                                percent +
                                "%";

                            if (pendingOwnerScan) {

                                ownerScanStatus.textContent =
                                    message;

                            } else {

                                status.textContent =
                                    message;

                            }

                        }

                    }

                }
            );


        const cleaned =
            cleanOCRText(
                result.data.text
            );


        if (!cleaned) {

            throw new Error(
                "No readable text found."
            );

        }


        /*
            NEW:
            Convert the raw OCR into
            a clean recipe layout.
        */

        const formatted =
            createCleanRecipe(
                cleaned
            );


        reviewText.value =
            formatted;


        reviewScreen.hidden =
            false;


        if (pendingOwnerScan) {

            ownerScanStatus.textContent =
                "✏️ Review your recipe.";

        } else {

            status.textContent =
                "✏️ Review your recipe.";

        }

    } catch (error) {

        console.error(error);

        const message =
            "❌ I couldn't read that photo. Try a clearer, flatter photo.";

        if (pendingOwnerScan) {

            ownerScanStatus.textContent =
                message;

        } else {

            status.textContent =
                message;

        }

    }

}


/* =========================================
   IMAGE PREPROCESSING
========================================= */

async function preprocessImage(file) {

    const image =
        await loadImage(file);

    const canvas =
        document.createElement("canvas");

    const maxDimension = 2400;

    const scale =
        Math.min(
            1,
            maxDimension /
            Math.max(
                image.width,
                image.height
            )
        );

    canvas.width =
        Math.round(
            image.width * scale
        );

    canvas.height =
        Math.round(
            image.height * scale
        );

    const ctx =
        canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.filter =
        "contrast(1.12) brightness(1.04)";

    ctx.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
    );

    return new Promise(function (resolve) {

        canvas.toBlob(
            function (blob) {

                resolve(blob);

            },
            "image/jpeg",
            0.95
        );

    });

}


/* =========================================
   OCR CLEANUP
========================================= */

function cleanOCRText(text) {

    let cleaned = text;

    cleaned =
        cleaned.replace(
            /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,
            ""
        );

    cleaned =
        cleaned.replace(
            /[░▒▓█■□]{1,}/g,
            ""
        );

    cleaned =
        cleaned.replace(
            /\|{2,}/g,
            " "
        );

    cleaned =
        cleaned.replace(
            /[–—−]/g,
            "-"
        );

    cleaned =
        cleaned.replace(
            /[“”]/g,
            '"'
        );

    cleaned =
        cleaned.replace(
            /[‘’]/g,
            "'"
        );

    cleaned =
        cleaned.replace(
            /[ \t]+/g,
            " "
        );

    cleaned =
        cleaned
            .split("\n")
            .map(
                line => line.trim()
            )
            .filter(
                line => line.length > 0
            )
            .join("\n");

    return cleaned.trim();

}


/* =========================================
   ⭐ NEW CLEAN RECIPE FORMAT
========================================= */

function createCleanRecipe(text) {

    const lines =
        text
            .split("\n")
            .map(
                line => line.trim()
            )
            .filter(
                line => line.length > 0
            );


    if (!lines.length) {
        return "";
    }


    /*
        Find sections.
    */

    let ingredientStart = -1;
    let instructionStart = -1;


    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        const lower =
            lines[i].toLowerCase();


        if (
            ingredientStart === -1 &&
            (
                lower.includes("ingredient")
            )
        ) {

            ingredientStart = i;

        }


        if (
            instructionStart === -1 &&
            (
                lower.includes("instruction") ||
                lower.includes("direction") ||
                lower === "method" ||
                lower === "steps"
            )
        ) {

            instructionStart = i;

        }

    }


    /*
        First line becomes title.
    */

    let title =
        cleanTitle(
            lines[0]
        );


    /*
        If the first line looks like
        "Ingredients", find a better title.
    */

    if (
        title.toLowerCase().includes("ingredient")
    ) {

        title =
            "Untitled Recipe";

    }


    const ingredients = [];

    const instructions = [];


    /*
        Extract ingredients.
    */

    if (ingredientStart !== -1) {

        const end =
            instructionStart !== -1
                ? instructionStart
                : lines.length;


        for (
            let i = ingredientStart + 1;
            i < end;
            i++
        ) {

            const line =
                cleanIngredientLine(
                    lines[i]
                );


            if (
                line &&
                !isSectionHeading(line)
            ) {

                ingredients.push(line);

            }

        }

    }


    /*
        Extract instructions.
    */

    if (instructionStart !== -1) {

        for (
            let i = instructionStart + 1;
            i < lines.length;
            i++
        ) {

            let line =
                lines[i].trim();


            if (!line) continue;


            line =
                line.replace(
                    /^[-•●▪◦○]\s*/,
                    ""
                );


            line =
                line.replace(
                    /^\d+[\.\)]\s*/,
                    ""
                );


            if (
                line.length > 2
            ) {

                instructions.push(line);

            }

        }

    }


    /*
        If OCR didn't detect an
        Ingredients heading, look for
        lines that look like ingredients.
    */

    if (
        ingredients.length === 0
    ) {

        for (
            let i = 1;
            i < lines.length;
            i++
        ) {

            if (
                looksLikeIngredient(
                    lines[i]
                )
            ) {

                ingredients.push(
                    cleanIngredientLine(
                        lines[i]
                    )
                );

            }

        }

    }


    /*
        If there was no Instructions heading,
        keep remaining text as instructions.
    */

    if (
        instructions.length === 0
    ) {

        const start =
            ingredientStart !== -1
                ? ingredientStart + 1
                : 1;


        for (
            let i = start;
            i < lines.length;
            i++
        ) {

            if (
                looksLikeInstruction(
                    lines[i]
                )
            ) {

                instructions.push(
                    lines[i]
                        .replace(
                            /^\d+[\.\)]\s*/,
                            ""
                        )
                        .trim()
                );

            }

        }

    }


    /*
        Build the clean recipe.
    */

    let output =
        "🍴 " + title;


    output +=
        "\n\n🥕 INGREDIENTS";


    if (
        ingredients.length
    ) {

        ingredients.forEach(
            function (ingredient) {

                output +=
                    "\n• " +
                    ingredient;

            }
        );

    } else {

        output +=
            "\n• Review and add ingredients";

    }


    output +=
        "\n\n👨‍🍳 INSTRUCTIONS";


    if (
        instructions.length
    ) {

        instructions.forEach(
            function (instruction, index) {

                output +=
                    "\n" +
                    (index + 1) +
                    ". " +
                    instruction;

            }
        );

    } else {

        output +=
            "\n1. Review and add instructions.";

    }


    return output;

}


/* =========================================
   TITLE CLEANUP
========================================= */

function cleanTitle(title) {

    return title
        .replace(
            /^[^A-Za-z0-9À-ÿ]+/,
            ""
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim()
        .slice(0, 100);

}


/* =========================================
   INGREDIENT LINE
========================================= */

function cleanIngredientLine(line) {

    return line
        .replace(
            /^[-•●▪◦○]\s*/,
            ""
        )
        .replace(
            /^\d+[\.\)]\s*/,
            ""
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


/* =========================================
   INGREDIENT DETECTION
========================================= */

function looksLikeIngredient(line) {

    const lower =
        line.toLowerCase();


    /*
        Measurements are a strong
        ingredient signal.
    */

    const measurementPattern =
        /\b\d+([\/.]\d+)?\s*(cups?|tbsp|tsp|teaspoons?|tablespoons?|oz|ounces?|lb|lbs|pounds?|g|kg|ml|l)\b/i;


    if (
        measurementPattern.test(line)
    ) {

        return true;

    }


    const ingredientWords = [

        "chicken",
        "beef",
        "pork",
        "turkey",
        "flour",
        "sugar",
        "salt",
        "pepper",
        "butter",
        "oil",
        "milk",
        "cream",
        "cheese",
        "egg",
        "eggs",
        "onion",
        "garlic",
        "tomato",
        "potato",
        "rice",
        "pasta",
        "water",
        "vanilla",
        "chocolate",
        "cinnamon"

    ];


    return ingredientWords.some(
        word =>
            lower.includes(word)
    );

}


/* =========================================
   INSTRUCTION DETECTION
========================================= */

function looksLikeInstruction(line) {

    const lower =
        line.toLowerCase();


    const actionWords = [

        "mix",
        "stir",
        "cook",
        "bake",
        "boil",
        "fry",
        "heat",
        "add",
        "combine",
        "place",
        "pour",
        "remove",
        "serve",
        "whisk",
        "chop",
        "slice",
        "preheat",
        "refrigerate",
        "cool"

    ];


    return actionWords.some(
        word =>
            lower.startsWith(word + " ") ||
            lower === word
    );

}


/* =========================================
   SECTION HEADING
========================================= */

function isSectionHeading(line) {

    const lower =
        line.toLowerCase().trim();


    return (

        lower.includes("ingredient") ||
        lower.includes("instruction") ||
        lower.includes("direction") ||
        lower === "method" ||
        lower === "steps"

    );

}


/* =========================================
   REVIEW
========================================= */

acceptScanButton.addEventListener(
    "click",
    function () {

        const text =
            reviewText.value.trim();


        if (!text) return;


        recipeText.value =
            text;


        reviewScreen.hidden =
            true;


        if (pendingOwnerScan) {

            saveOwnerRecipe(text);

        } else {

            status.textContent =
                "✅ Recipe cleaned and ready to save.";

        }

    }
);


reviewRetakeButton.addEventListener(
    "click",
    function () {

        reviewScreen.hidden = true;

        if (pendingOwnerScan) {

            ownerRecipeImage.value = "";
            ownerRecipeImage.click();

        } else {

            recipeImage.value = "";
            recipeImage.click();

        }

    }
);


/* =========================================
   PUBLIC SAVE
========================================= */

saveRecipeButton.addEventListener(
    "click",
    function () {

        const text =
            recipeText.value.trim();


        if (!text) {

            status.textContent =
                "❌ There is no recipe to save.";

            return;

        }


        const count =
            getPublicScanCount();


        if (count >= 2) {

            downloadScreen.hidden =
                false;

            return;

        }


        saveRecipe(text);


        setPublicScanCount(
            count + 1
        );


        recipeText.value = "";


        status.textContent =
            "✅ Recipe saved!";

    }
);


/* =========================================
   OWNER SAVE
========================================= */

function saveOwnerRecipe(text) {

    saveRecipe(text);

    recipeText.value = "";

    ownerScanStatus.textContent =
        "✅ Recipe saved!";

    updateFolderCounts();

    showAllRecipes();

}


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
            new Date().toLocaleString()

    };


    recipes.push(recipe);


    localStorage.setItem(
        "mealmindRecipes",
        JSON.stringify(recipes)
    );


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


    if (!lines.length) {
        return "Untitled Recipe";
    }


    let title =
        lines[0]
            .replace(
                /^[^A-Za-z0-9À-ÿ]+/,
                ""
            );


    /*
        Remove our emoji if it remains.
    */

    title =
        title.replace(
            /^🍴\s*/,
            ""
        );


    return (
        title.slice(0, 100) ||
        "Untitled Recipe"
    );

}


/* =========================================
   CATEGORY
========================================= */

function detectCategory(text) {

    const lower =
        text.toLowerCase();

    const categories = [];


    if (
        lower.includes("cake") ||
        lower.includes("cookie") ||
        lower.includes("brownie") ||
        lower.includes("chocolate") ||
        lower.includes("dessert") ||
        lower.includes("icing") ||
        lower.includes("frosting") ||
        lower.includes("candy") ||
        lower.includes("pie")
    ) {

        categories.push("Sweet");

    }


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
        lower.includes("cheese")
    ) {

        categories.push("Savoury");

    }


    if (
        lower.includes("fried") ||
        lower.includes("frying") ||
        lower.includes("deep fry") ||
        lower.includes("deep-fry") ||
        lower.includes("pan fry") ||
        lower.includes("pan-fry")
    ) {

        categories.push("Fried");

    }


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
        lower.includes("risotto")
    ) {

        categories.push("International");

    }


    if (!categories.length) {

        categories.push("Savoury");

    }


    return categories;

}


/* =========================================
   INGREDIENTS FROM CLEAN TEXT
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

    let inside = false;


    lines.forEach(function (line) {

        const lower =
            line.toLowerCase();


        if (
            lower.includes("ingredients")
        ) {

            inside = true;
            return;

        }


        if (
            lower.includes("instructions") ||
            lower.includes("directions") ||
            lower.includes("method")
        ) {

            inside = false;
            return;

        }


        if (inside) {

            const cleaned =
                line
                    .replace(
                        /^•\s*/,
                        ""
                    )
                    .trim();


            if (cleaned) {

                ingredients.push(
                    cleaned
                );

            }

        }

    });


    return ingredients;

}


/* =========================================
   OWNER CODE
========================================= */

let ownerTyping = "";


recipeText.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            if (
                ownerTyping === "1591"
            ) {

                event.preventDefault();

                ownerTyping = "";

                recipeText.value = "";

                ownerLogin.hidden = false;

                ownerCode.value = "";

                ownerStatus.textContent = "";

                setTimeout(
                    () => ownerCode.focus(),
                    50
                );

                return;

            }

            ownerTyping = "";

            return;

        }


        if (
            /^[0-9]$/.test(event.key)
        ) {

            ownerTyping += event.key;

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
   OWNER LOGIN
========================================= */

ownerButton.addEventListener(
    "click",
    function () {

        if (
            ownerCode.value.trim() ===
            "BumsUp2AI"
        ) {

            ownerLoggedIn = true;

            ownerLogin.hidden = true;

            ownerPanel.hidden = false;

            updateFolderCounts();

            showAllRecipes();

        } else {

            ownerStatus.textContent =
                "❌ Incorrect owner code.";

        }

    }
);


/* =========================================
   FOLDERS
========================================= */

document
    .querySelectorAll(".folder")
    .forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                if (!ownerLoggedIn) return;

                const folder =
                    button.dataset.folder;

                folderTitle.textContent =
                    "📂 " + folder;

                const recipes =
                    getRecipes();


                const filtered =
                    recipes.filter(
                        recipe =>
                            Array.isArray(
                                recipe.category
                            ) &&
                            recipe.category.includes(
                                folder
                            )
                    );


                displayRecipes(
                    filtered
                );

            }
        );

    });


/* =========================================
   ALL RECIPES
========================================= */

allRecipesButton.addEventListener(
    "click",
    showAllRecipes
);


function showAllRecipes() {

    if (!ownerLoggedIn) return;

    folderTitle.textContent =
        "📖 All Recipes";

    displayRecipes(
        getRecipes()
    );

}


/* =========================================
   COUNTS
========================================= */

function updateFolderCounts() {

    const recipes =
        getRecipes();

    let sweet = 0;
    let savoury = 0;
    let fried = 0;
    let international = 0;


    recipes.forEach(function (recipe) {

        const categories =
            Array.isArray(
                recipe.category
            )
                ? recipe.category
                : [];


        if (
            categories.includes("Sweet")
        ) sweet++;


        if (
            categories.includes("Savoury")
        ) savoury++;


        if (
            categories.includes("Fried")
        ) fried++;


        if (
            categories.includes("International")
        ) international++;

    });


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

function displayRecipes(recipes) {

    savedRecipes.innerHTML = "";


    if (!recipes.length) {

        const empty =
            document.createElement("div");

        empty.className =
            "empty-recipes";

        empty.textContent =
            "No recipes here yet.";

        savedRecipes.appendChild(
            empty
        );

        return;

    }


    recipes.forEach(function (recipe) {

        const card =
            document.createElement("div");

        card.className =
            "recipe-card";


        const title =
            document.createElement("h3");

        title.textContent =
            recipe.name ||
            "Untitled Recipe";


        const category =
            document.createElement("p");

        category.className =
            "recipe-category";

        category.textContent =
            Array.isArray(
                recipe.category
            )
                ? recipe.category.join(" • ")
                : "Savoury";


        card.appendChild(title);

        card.appendChild(category);


        card.addEventListener(
            "click",
            function () {

                openRecipe(recipe);

            }
        );


        savedRecipes.appendChild(
            card
        );

    });

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
            ? recipe.category.join(" • ")
            : "";


    detailIngredients.innerHTML = "";


    const ingredients =
        Array.isArray(
            recipe.ingredients
        )
            ? recipe.ingredients
            : [];


    if (!ingredients.length) {

        const li =
            document.createElement("li");

        li.textContent =
            "No ingredients were separated.";

        detailIngredients.appendChild(
            li
        );

    } else {

        ingredients.forEach(
            function (ingredient) {

                const li =
                    document.createElement("li");

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

        recipeDetails.hidden = true;

    }
);


/* =========================================
   LOG OUT
========================================= */

closeOwner.addEventListener(
    "click",
    function () {

        ownerLoggedIn = false;

        ownerPanel.hidden = true;

        ownerLogin.hidden = true;

        ownerScanStatus.textContent = "";

    }
);


/* =========================================
   DOWNLOAD SCREEN
========================================= */

closeDownload.addEventListener(
    "click",
    function () {

        downloadScreen.hidden = true;

    }
);


/* =========================================
   STORAGE
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

    } catch {

        return [];

    }

}


/* =========================================
   PUBLIC SCAN COUNT
========================================= */

function getPublicScanCount() {

    const value =
        Number(
            localStorage.getItem(
                "mealmindPublicScanCount"
            )
        );


    return Number.isFinite(value)
        ? value
        : 0;

}


function setPublicScanCount(number) {

    localStorage.setItem(
        "mealmindPublicScanCount",
        String(number)
    );

}


/* =========================================
   START
========================================= */

ownerLoggedIn = false;

ownerPanel.hidden = true;
ownerLogin.hidden = true;
photoCheck.hidden = true;
reviewScreen.hidden = true;
downloadScreen.hidden = true;
recipeDetails.hidden = true;

updateFolderCounts();
