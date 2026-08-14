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


// ============================
// NORMAL RECIPE SCANNER
// ============================

scanButton.addEventListener("click", () => {
    recipeImage.click();
});


recipeImage.addEventListener("change", async () => {

    const file = recipeImage.files[0];

    if (!file) return;

    status.textContent = "🔍 Reading recipe...";
    recipeText.value = "";

    try {

        const result = await Tesseract.recognize(
            file,
            "eng",
            {
                logger: info => {

                    if (info.status === "recognizing text") {

                        const percent =
                            Math.round(info.progress * 100);

                        status.textContent =
                            `🔍 Reading recipe... ${percent}%`;
                    }
                }
            }
        );

        recipeText.value = result.data.text;

        status.textContent = "✅ Recipe scanned!";

    } catch (error) {

        console.error(error);

        status.textContent = "❌ Scanner error.";

    }
});


// ============================
// SECRET OWNER CODE
// ============================

let ownerTyping = "";


recipeText.addEventListener("keydown", (event) => {

    // Ignore the Enter key until we check the code
    if (event.key === "Enter") {

        if (ownerTyping === "1591") {

            event.preventDefault();

            openOwnerLogin();

            ownerTyping = "";

            return;
        }

        ownerTyping = "";

        return;
    }


    // Only watch number keys
    if (/^[0-9]$/.test(event.key)) {

        ownerTyping += event.key;

        // Keep only the last 4 numbers
        if (ownerTyping.length > 4) {
            ownerTyping = ownerTyping.slice(-4);
        }

    }

});


// ============================
// OWNER LOGIN
// ============================

function openOwnerLogin() {

    ownerLogin.hidden = false;

    ownerCode.value = "";

    ownerStatus.textContent = "";

    ownerCode.focus();
}


ownerButton.addEventListener("click", () => {

    if (ownerCode.value === "BumsUp2AI") {

        ownerLogin.hidden = true;

        ownerPanel.hidden = false;

        loadSavedRecipes();

    } else {

        ownerStatus.textContent =
            "❌ Incorrect owner code.";

    }

});


// ============================
// SAVE RECIPE
// ============================

document
    .getElementById("saveRecipeButton")
    .addEventListener("click", () => {

        const recipe = recipeText.value.trim();

        if (!recipe) {

            status.textContent =
                "❌ There is no recipe to save.";

            return;
        }

        const recipes = JSON.parse(
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

        status.textContent = "✅ Recipe saved!";

    });


// ============================
// OWNER RECIPE LIST
// ============================

function loadSavedRecipes() {

    const recipes = JSON.parse(
        localStorage.getItem("mealmindRecipes") || "[]"
    );

    savedRecipes.innerHTML = "";

    if (recipes.length === 0) {

        savedRecipes.innerHTML =
            "<p>No saved recipes yet.</p>";

        return;
    }

    recipes.forEach((recipe, index) => {

        const box = document.createElement("div");

        box.className = "saved-recipe";

        box.innerHTML = `
            <h3>Recipe ${index + 1}</h3>
            <p></p>
            <small></small>
        `;

        box.querySelector("p").textContent =
            recipe.text;

        box.querySelector("small").textContent =
            "Saved: " + recipe.date;

        savedRecipes.appendChild(box);

    });
}


// ============================
// CLOSE OWNER PANEL
// ============================

closeOwner.addEventListener("click", () => {

    ownerPanel.hidden = true;

});
