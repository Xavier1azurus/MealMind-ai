const scanButton = document.getElementById("scanButton");
const recipeImage = document.getElementById("recipeImage");
const recipeText = document.getElementById("recipeText");
const status = document.getElementById("status");

const ownerLogin = document.getElementById("ownerLogin");
const ownerCode = document.getElementById("ownerCode");
const ownerButton = document.getElementById("ownerButton");
const ownerStatus = document.getElementById("ownerStatus");

const ownerPanel = document.getElementById("ownerPanel");
const savedRecipes = document.getElementById("savedRecipes");
const closeOwner = document.getElementById("closeOwner");


// ================================
// SCAN RECIPE BUTTON
// ================================

scanButton.addEventListener("click", function () {

    // This ONLY opens the camera/photo picker.
    recipeImage.click();

});


// ================================
// READ PHOTO
// ================================

recipeImage.addEventListener("change", async function () {

    const file = recipeImage.files[0];

    if (!file) {
        return;
    }

    status.textContent = "🔍 Reading your recipe...";
    recipeText.value = "";

    try {

        const result = await Tesseract.recognize(
            file,
            "eng",
            {
                logger: function (info) {

                    if (info.status === "recognizing text") {

                        const percent =
                            Math.round(info.progress * 100);

                        status.textContent =
                            "🔍 Reading recipe... " +
                            percent +
                            "%";
                    }
                }
            }
        );

        recipeText.value = result.data.text;

        status.textContent = "✅ Recipe scanned!";

    } catch (error) {

        console.error(error);

        status.textContent =
            "❌ Something went wrong while scanning.";

    }

});


// ================================
// SECRET OWNER TRIGGER
// ================================

// IMPORTANT:
// This listens ONLY to the Recipe Scanner box.

recipeText.addEventListener("input", function () {

    const typedText = recipeText.value.trim();

    if (typedText === "1591") {

        recipeText.value = "";

        ownerLogin.hidden = false;

        ownerCode.value = "";

        ownerStatus.textContent = "";

        ownerCode.focus();

    }

});
// ================================
// SAVE RECIPE
// ================================

document
    .getElementById("saveRecipeButton")
    .addEventListener("click", function () {

        const recipe =
            recipeText.value.trim();

        if (!recipe) {

            status.textContent =
                "❌ There is no recipe to save.";

            return;
        }

        const recipes =
            JSON.parse(
                localStorage.getItem("mealmindRecipes") || "[]"
            );

        recipes.push({
            text: recipe,
            date: new Date().toLocaleString()
        });

        localStorage.setItem(
            "mealmindRecipes",
            JSON.stringify(recipes)
        );

        status.textContent =
            "✅ Recipe saved!";

    });


// ================================
// OWNER LOGIN
// ================================

ownerButton.addEventListener("click", function () {

    if (ownerCode.value === "BumsUp2AI") {

        ownerLogin.hidden = true;

        ownerPanel.hidden = false;

        loadSavedRecipes();

    } else {

        ownerStatus.textContent =
            "❌ Incorrect owner code.";

    }

});


// ================================
// SHOW SAVED RECIPES
// ================================

function loadSavedRecipes() {

    const recipes =
        JSON.parse(
            localStorage.getItem("mealmindRecipes") || "[]"
        );

    savedRecipes.innerHTML = "";

    if (recipes.length === 0) {

        savedRecipes.innerHTML =
            "<p>No recipes saved yet.</p>";

        return;
    }

    recipes.forEach(function (recipe, index) {

        const box =
            document.createElement("div");

        box.className = "saved-recipe";

        const title =
            document.createElement("h3");

        title.textContent =
            "Recipe " + (index + 1);

        const text =
            document.createElement("p");

        text.textContent =
            recipe.text;

        const date =
            document.createElement("small");

        date.textContent =
            "Saved: " + recipe.date;

        box.appendChild(title);
        box.appendChild(text);
        box.appendChild(date);

        savedRecipes.appendChild(box);

    });

}


// ================================
// CLOSE OWNER PANEL
// ================================

closeOwner.addEventListener("click", function () {

    ownerPanel.hidden = true;

});
