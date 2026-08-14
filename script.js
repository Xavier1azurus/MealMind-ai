const scanButton =
    document.getElementById("scanButton");

const recipeImage =
    document.getElementById("recipeImage");

const recipeText =
    document.getElementById("recipeText");

const status =
    document.getElementById("status");

const saveRecipeButton =
    document.getElementById("saveRecipeButton");


/* =========================
   OWNER ELEMENTS
========================= */

const ownerLogin =
    document.getElementById("ownerLogin");

const ownerCode =
    document.getElementById("ownerCode");

const ownerButton =
    document.getElementById("ownerButton");

const ownerStatus =
    document.getElementById("ownerStatus");

const ownerPanel =
    document.getElementById("ownerPanel");

const savedRecipes =
    document.getElementById("savedRecipes");

const closeOwner =
    document.getElementById("closeOwner");


/* =========================
   CAMERA / SCANNER
========================= */

scanButton.addEventListener("click", function () {

    /*
       Normal users pressing this button
       get the camera/photo picker.
    */

    recipeImage.click();

});


recipeImage.addEventListener(
    "change",
    async function () {

        const file =
            recipeImage.files[0];

        if (!file) {
            return;
        }

        status.textContent =
            "🔍 Reading your recipe...";

        recipeText.value = "";

        try {

            const result =
                await Tesseract.recognize(
                    file,
                    "eng",
                    {
                        logger: function(info) {

                            if (
                                info.status ===
                                "recognizing text"
                            ) {

                                const percent =
                                    Math.round(
                                        info.progress * 100
                                    );

                                status.textContent =
                                    "🔍 Reading recipe... " +
                                    percent +
                                    "%";
                            }

                        }
                    }
                );


            recipeText.value =
                result.data.text;

            status.textContent =
                "✅ Recipe scanned!";


        } catch (error) {

            console.error(error);

            status.textContent =
                "❌ Scanner error.";

        }

    }
);


/* =========================
   HIDDEN OWNER TRIGGER
========================= */

/*
   User types 1591 into the
   recipe scanner box and
   presses ENTER.
*/

recipeText.addEventListener(
    "keydown",
    function(event) {

        if (event.key !== "Enter") {
            return;
        }


        const code =
            recipeText.value.trim();


        if (code === "1591") {

            event.preventDefault();

            recipeText.value = "";

            ownerLogin.hidden = false;

            ownerCode.value = "";

            ownerStatus.textContent = "";

            ownerCode.focus();

        }

    }
);


/* =========================
   SAVE RECIPE
========================= */

saveRecipeButton.addEventListener(
    "click",
    function() {

        const recipe =
            recipeText.value.trim();

        if (!recipe) {

            status.textContent =
                "❌ There is no recipe to save.";

            return;
        }


        const recipes =
            JSON.parse(
                localStorage.getItem(
                    "mealmindRecipes"
                ) || "[]"
            );


        recipes.push({
            text: recipe,

            date:
                new Date().toLocaleString()
        });


        localStorage.setItem(
            "mealmindRecipes",
            JSON.stringify(recipes)
        );


        status.textContent =
            "✅ Recipe saved!";

    }
);


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

            ownerLogin.hidden = true;

            ownerPanel.hidden = false;

            loadSavedRecipes();

        } else {

            ownerStatus.textContent =
                "❌ Incorrect owner code.";

        }

    }
);


/* =========================
   LOAD SAVED RECIPES
========================= */

function loadSavedRecipes() {

    const recipes =
        JSON.parse(
            localStorage.getItem(
                "mealmindRecipes"
            ) || "[]"
        );


    savedRecipes.innerHTML = "";


    if (recipes.length === 0) {

        savedRecipes.innerHTML =
            "<p>No recipes have been saved yet.</p>";

        return;

    }


    recipes.forEach(
        function(recipe, index) {

            const recipeBox =
                document.createElement("div");

            recipeBox.className =
                "saved-recipe";


            recipeBox.innerHTML = `
                <h3>Recipe ${index + 1}</h3>
                <p>${escapeHTML(recipe.text)}</p>
                <small>Saved: ${recipe.date}</small>
            `;


            savedRecipes.appendChild(
                recipeBox
            );

        }
    );

}


/* =========================
   SECURITY HELPER
========================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* =========================
   CLOSE OWNER PANEL
========================= */

closeOwner.addEventListener(
    "click",
    function() {

        ownerPanel.hidden = true;

    }
);
