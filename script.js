const scanButton = document.getElementById("scanButton");

const recipeImage = document.getElementById("recipeImage");

const recipeText = document.getElementById("recipeText");

const status = document.getElementById("status");



/* =========================
   RECIPE SCANNER
========================= */


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



/* =========================
   OWNER LOGIN
========================= */


const ownerLogin =
    document.getElementById("ownerLogin");

const ownerCode =
    document.getElementById("ownerCode");

const ownerButton =
    document.getElementById("ownerButton");

const ownerStatus =
    document.getElementById("ownerStatus");


let startX = 0;

let startY = 0;



/* Start touch */

document.addEventListener(
    "touchstart",

    function (event) {

        /* Desktop does nothing */

        if (window.innerWidth > 768) {
            return;
        }


        const touch = event.touches[0];

        startX = touch.clientX;

        startY = touch.clientY;

    },

    {
        passive: true
    }

);



/* End touch */

document.addEventListener(
    "touchend",

    function (event) {

        /* Desktop does nothing */

        if (window.innerWidth > 768) {
            return;
        }


        const touch =
            event.changedTouches[0];


        const endX =
            touch.clientX;


        const endY =
            touch.clientY;


        const screenWidth =
            window.innerWidth;


        const screenHeight =
            window.innerHeight;


        /* Must start near bottom-right */

        const startedNearBottomRight =

            startX >
                screenWidth - 120 &&

            startY >
                screenHeight - 120;


        /* Must move upward */

        const swipedUp =
            startY - endY > 80;


        if (
            startedNearBottomRight &&
            swipedUp
        ) {

            ownerLogin.hidden = false;

            ownerCode.focus();

        }

    }

);



/* Owner login */

ownerButton.addEventListener(
    "click",

    function () {

        if (
            ownerCode.value ===
            "BumsUp2AI"
        ) {

            ownerStatus.textContent =
                "✅ Owner access granted!";

        } else {

            ownerStatus.textContent =
                "❌ Incorrect code.";

        }

    }

);
