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


/* OWNER */

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

const ownerPanel =
    document.getElementById(
        "ownerPanel"
    );

const closeOwner =
    document.getElementById(
        "closeOwner"
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



/* =========================
   SCANNER
========================= */


scanButton.addEventListener(
    "click",
    function() {

        recipeImage.click();

    }
);


recipeImage.addEventListener(
    "change",
    async function() {

        const file =
            recipeImage.files[0];

        if (!file) {

            return;

        }


        status.textContent =
            "🔍 Reading recipe...";

        recipeText.value = "";


        try {

            const result =
                await Tesseract.recognize(

                    file,

                    "eng",

                    {

                        logger:
                        function(info) {

                            if (
                                info.status ===
                                "recognizing text"
                            ) {

                                const percent =
                                    Math.round(
                                        info.progress *
                                        100
                                    );

                                status.textContent =
                                    "🔍 Reading recipe... "
                                    + percent
                                    + "%";

                            }

                        }

                    }

                );


            recipeText.value =
                result.data.text;


            status.textContent =
                "✅ Recipe scanned!";


        }

        catch(error) {

            console.error(error);

            status.textContent =
                "❌ Scanner error.";

        }

    }
);



/* =========================
   SECRET OWNER CODE
========================= */


let ownerTyping = "";


recipeText.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter"
        ) {

            if (
                ownerTyping ===
                "1591"
            ) {

                event.preventDefault();

                recipeText.value = "";

                ownerTyping = "";

                ownerLogin.hidden =
                    false;

                ownerCode.value = "";

                ownerStatus.textContent =
                    "";

                ownerCode.focus();

                return;

            }


            ownerTyping = "";

            return;

        }


        if (
            /^[0-9]$/.test(
                event.key
            )
        ) {

            ownerTyping +=
                event.key;


            if (
                ownerTyping.length >
                4
            ) {

                ownerTyping =
                    ownerTyping.slice(-4);

            }

        }

    }
);



/* =========================
   SAVE RECIPE
========================= */


saveRecipeButton.addEventListener(
    "click",
    function() {

        const text =
            recipeText.value.trim();


        if (!text) {

            status.textContent =
                "❌ No recipe to save.";

            return;

        }


        const name =
            getRecipeName(text);


        const category =
            detectCategory(text);


        const ingredients =
            getIngredients(text);


        const recipes =
            JSON.parse(
                localStorage.getItem(
                    "mealmindRecipes"
                ) || "[]"
            );


        recipes.push({

            name: name,

            category: category,

            ingredients:
                ingredients,

            text: text,

            date:
                new Date()
                .toLocaleString()

        });


        localStorage.setItem(

            "mealmindRecipes",

            JSON.stringify(
                recipes
            )

        );


        recipeText.value = "";


        status.textContent =
            "✅ Recipe saved!";

    }
);



/* =========================
   RECIPE NAME
========================= */


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
        lines.length > 0
    ) {

        return lines[0];

    }


    return "Untitled Recipe";

}



/* =========================
   CATEGORY
========================= */


function detectCategory(text) {

    const lower =
        text.toLowerCase();


    const categories = [];


    if (
        lower.includes("cake") ||
        lower.includes("cookie") ||
        lower.includes("brownie") ||
        lower.includes("chocolate") ||
        lower.includes("sugar") ||
        lower.includes("dessert")
    ) {

        categories.push(
            "Sweet"
        );

    }


    if (
        lower.includes("chicken") ||
        lower.includes("beef") ||
        lower.includes("pasta") ||
        lower.includes("soup") ||
        lower.includes("salad") ||
        lower.includes("rice")
    ) {

        categories.push(
            "Savoury"
        );

    }


    if (
        lower.includes("fried") ||
        lower.includes("fry") ||
        lower.includes("deep-fry")
    ) {

        categories.push(
            "Fried"
        );

    }


    if (
        lower.includes("taco") ||
        lower.includes("curry") ||
        lower.includes("sushi") ||
        lower.includes("ramen") ||
        lower.includes("pizza") ||
        lower.includes("pasta")
    ) {

        categories.push(
            "International"
        );

    }


    if (
        categories.length === 0
    ) {

        categories.push(
            "Savoury"
        );

    }


    return categories;

}



/* =========================
   INGREDIENTS
========================= */


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


    for (
        let i = 1;
        i < lines.length;
        i++
    ) {

        const line =
            lines[i];


        if (
            line.length < 100
        ) {

            ingredients.push(
                line
            );

        }


        if (
            ingredients.length >= 15
        ) {

            break;

        }

    }


    return ingredients;

}



/* =========================
   OWNER LOGIN
========================= */


ownerButton.addEventListener(
    "click",
    function() {

        if (
            ownerCode.value ===
            "BumsUp2AI"
        ) {

            ownerLogin.hidden =
                true;

            ownerPanel.hidden =
                false;

            showAllRecipes();

        }

        else {

            ownerStatus.textContent =
                "❌ Incorrect owner code.";

        }

    }
);



/* =========================
   SHOW ALL RECIPES
========================= */


function showAllRecipes() {

    folderTitle.textContent =
        "📖 All Recipes";


    const recipes =
        getRecipes();


    displayRecipes(
        recipes
    );

}



/* =========================
   FOLDERS
========================= */


document
    .querySelectorAll(".folder")
    .forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    const folder =
                        button.dataset.folder;


                    folderTitle.textContent =
                        folder;


                    const recipes =
                        getRecipes();


                    const filtered =
                        recipes.filter(
                            recipe =>
                                recipe.category
                                    .includes(
                                        folder
                                    )
                        );


                    displayRecipes(
                        filtered
                    );

                }
            );

        }
    );



/* =========================
   DISPLAY RECIPES
========================= */


function displayRecipes(
    recipes
) {

    savedRecipes.innerHTML =
        "";


    if (
        recipes.length === 0
    ) {

        savedRecipes.innerHTML =
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
                document.createElement(
                    "h3"
                );


            title.textContent =
                recipe.name;


            const category =
                document.createElement(
                    "p"
                );


            category.className =
                "recipe-category";


            category.textContent =
                recipe.category.join(
                    " • "
                );


            card.appendChild(
                title
            );


            card.appendChild(
                category
            );


            card.addEventListener(
                "click",
                function() {

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



/* =========================
   OPEN RECIPE
========================= */


function openRecipe(
    recipe
) {

    detailTitle.textContent =
        recipe.name;


    detailCategory.textContent =
        recipe.category.join(
            " • "
        );


    detailIngredients.innerHTML =
        "";


    recipe.ingredients.forEach(
        function(ingredient) {

            const li =
                document.createElement(
                    "li"
                );


            li.textContent =
                ingredient;


            detailIngredients
                .appendChild(
                    li
                );

        }
    );


    detailText.textContent =
        recipe.text;


    recipeDetails.hidden =
        false;

}



/* =========================
   CLOSE RECIPE
========================= */


closeRecipe.addEventListener(
    "click",
    function() {

        recipeDetails.hidden =
            true;

    }
);



/* =========================
   CLOSE OWNER
========================= */


closeOwner.addEventListener(
    "click",
    function() {

        ownerPanel.hidden =
            true;

    }
);



/* =========================
   GET SAVED RECIPES
========================= */


function getRecipes() {

    return JSON.parse(

        localStorage.getItem(
            "mealmindRecipes"
        ) || "[]"

    );

}
