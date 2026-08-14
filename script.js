const scanButton = document.getElementById("scanButton");
const recipeImage = document.getElementById("recipeImage");
const recipeText = document.getElementById("recipeText");
const status = document.getElementById("status");

scanButton.addEventListener("click", function () {
    recipeImage.click();
});

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
                        const percent = Math.round(info.progress * 100);

                        status.textContent =
                            "🔍 Reading recipe... " + percent + "%";
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
const ownerCode = document.getElementById("ownerCode");
const ownerButton = document.getElementById("ownerButton");
const ownerPanel = document.getElementById("ownerPanel");
const ownerStatus = document.getElementById("ownerStatus");

ownerButton.addEventListener("click", function () {

    if (ownerCode.value === "BumsUp2AI") {

        ownerPanel.hidden = false;
        ownerStatus.textContent = "✅ Owner access granted.";

    } else {

        ownerPanel.hidden = true;
        ownerStatus.textContent = "❌ Incorrect code.";

    }

});
const ownerLogin = document.getElementById("ownerLogin");
const ownerCode = document.getElementById("ownerCode");
const ownerButton = document.getElementById("ownerButton");
const ownerStatus = document.getElementById("ownerStatus");

let escPressed = false;

document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {
        escPressed = true;
    }

    if (event.code === "Space" && escPressed) {
        ownerLogin.hidden = false;
        ownerCode.focus();
    }
});

document.addEventListener("keyup", function(event) {

    if (event.key === "Escape") {
        escPressed = false;
    }
});

ownerButton.addEventListener("click", function() {

    if (ownerCode.value === "BumsUp2AI") {
        ownerStatus.textContent = "✅ Owner access granted!";
    } else {
        ownerStatus.textContent = "❌ Incorrect code.";
    }

});
