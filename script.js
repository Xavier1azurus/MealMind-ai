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
