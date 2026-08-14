/* =========================================================
   MEALMIND
   Scanner + Owner Panel + Auto Sorting + Notes
   NO API REQUIRED
   ========================================================= */

const OWNER_PASSWORD = "BumsUp2AI";
const OWNER_CODE = "1591";

const RECIPES_KEY = "mealmind_recipes";
const FOLDERS_KEY = "mealmind_folders";
const CUISINES_KEY = "mealmind_cuisines";

let recipes = JSON.parse(localStorage.getItem(RECIPES_KEY) || "[]");

let folders = JSON.parse(
  localStorage.getItem(FOLDERS_KEY) ||
  JSON.stringify([
    "Sweet",
    "Savoury",
    "Fried",
    "International"
  ])
);

let cuisines = JSON.parse(
  localStorage.getItem(CUISINES_KEY) ||
  JSON.stringify(["General"])
);

let editingRecipeId = null;
let pendingImage = null;
let ownerScanning = false;
let selectedFolder = null;
let codeBuffer = "";
let managerMode = "";


/* =========================================================
   ELEMENTS
   ========================================================= */

const scanBtn = document.getElementById("scanBtn");
const recipeImage = document.getElementById("recipeImage");
const recipeText = document.getElementById("recipeText");
const scanStatus = document.getElementById("scanStatus");
const saveMainRecipe = document.getElementById("saveMainRecipe");

const photoCheck = document.getElementById("photoCheck");
const usePhoto = document.getElementById("usePhoto");
const retakePhoto = document.getElementById("retakePhoto");

const reviewBox = document.getElementById("reviewBox");
const reviewText = document.getElementById("reviewText");
const acceptRecipe = document.getElementById("acceptRecipe");
const reviewRetake = document.getElementById("reviewRetake");

const ownerLogin = document.getElementById("ownerLogin");
const ownerPassword = document.getElementById("ownerPassword");
const ownerLoginBtn = document.getElementById("ownerLoginBtn");
const ownerError = document.getElementById("ownerError");

const ownerPanel = document.getElementById("ownerPanel");
const exitOwner = document.getElementById("exitOwner");

const ownerScan = document.getElementById("ownerScan");
const ownerImage = document.getElementById("ownerImage");

const addRecipe = document.getElementById("addRecipe");
const addFolder = document.getElementById("addFolder");
const deleteFolder = document.getElementById("deleteFolder");
const addCuisine = document.getElementById("addCuisine");
const deleteCuisine = document.getElementById("deleteCuisine");
const editRecipe = document.getElementById("editRecipe");
const deleteRecipe = document.getElementById("deleteRecipe");

const foldersElement = document.getElementById("folders");
const recipesElement = document.getElementById("recipes");
const currentFolder = document.getElementById("currentFolder");
const allRecipes = document.getElementById("allRecipes");

const editor = document.getElementById("editor");
const editorTitle = document.getElementById("editorTitle");
const recipeTitle = document.getElementById("recipeTitle");
const recipeCuisine = document.getElementById("recipeCuisine");
const recipeFolder = document.getElementById("recipeFolder");
const ingredients = document.getElementById("ingredients");
const instructions = document.getElementById("instructions");

/*
   NEW NOTES ELEMENT.

   If your HTML has:
   <textarea id="recipeNotes"></textarea>

   this will automatically connect to it.
*/
const recipeNotes =
  document.getElementById("recipeNotes");

const editorError = document.getElementById("editorError");
const saveEditor = document.getElementById("saveEditor");
const cancelEditor = document.getElementById("cancelEditor");

const recipeView = document.getElementById("recipeView");
const closeRecipe = document.getElementById("closeRecipe");
const viewTitle = document.getElementById("viewTitle");
const viewCategory = document.getElementById("viewCategory");
const viewIngredients = document.getElementById("viewIngredients");
const viewInstructions = document.getElementById("viewInstructions");

/*
   Optional notes display.
*/
const viewNotes =
  document.getElementById("viewNotes");

const manager = document.getElementById("manager");
const managerTitle = document.getElementById("managerTitle");
const managerDescription = document.getElementById("managerDescription");
const managerInput = document.getElementById("managerInput");
const managerSelect = document.getElementById("managerSelect");
const managerError = document.getElementById("managerError");
const managerConfirm = document.getElementById("managerConfirm");
const managerCancel = document.getElementById("managerCancel");


/* =========================================================
   STORAGE
   ========================================================= */

function saveData() {

  localStorage.setItem(
    RECIPES_KEY,
    JSON.stringify(recipes)
  );

  localStorage.setItem(
    FOLDERS_KEY,
    JSON.stringify(folders)
  );

  localStorage.setItem(
    CUISINES_KEY,
    JSON.stringify(cuisines)
  );
}


/* =========================================================
   SCANNER
   ========================================================= */

if (scanBtn) {

  scanBtn.onclick = () => {

    if (recipeImage) {
      recipeImage.value = "";
      recipeImage.click();
    }

  };

}


if (recipeImage) {

  recipeImage.onchange = () => {

    if (!recipeImage.files.length) return;

    pendingImage = recipeImage.files[0];
    ownerScanning = false;

    if (photoCheck) {
      photoCheck.classList.remove("hidden");
    }

  };

}


if (ownerScan) {

  ownerScan.onclick = () => {

    if (ownerImage) {
      ownerImage.value = "";
      ownerImage.click();
    }

  };

}


if (ownerImage) {

  ownerImage.onchange = () => {

    if (!ownerImage.files.length) return;

    pendingImage = ownerImage.files[0];
    ownerScanning = true;

    if (photoCheck) {
      photoCheck.classList.remove("hidden");
    }

  };

}


if (retakePhoto) {

  retakePhoto.onclick = () => {

    if (photoCheck) {
      photoCheck.classList.add("hidden");
    }

    if (ownerScanning) {

      if (ownerImage) {
        ownerImage.click();
      }

    } else {

      if (recipeImage) {
        recipeImage.click();
      }

    }

  };

}


if (usePhoto) {

  usePhoto.onclick = async () => {

    if (photoCheck) {
      photoCheck.classList.add("hidden");
    }

    await startBetterScan();

  };

}


if (reviewRetake) {

  reviewRetake.onclick = () => {

    if (reviewBox) {
      reviewBox.classList.add("hidden");
    }

    if (ownerScanning) {

      if (ownerImage) {
        ownerImage.click();
      }

    } else {

      if (recipeImage) {
        recipeImage.click();
      }

    }

  };

}


/* =========================================================
   BETTER IMAGE SCANNER
   ========================================================= */

async function startBetterScan() {

  if (!pendingImage) return;

  setScanStatus(
    "📸 Preparing your photo..."
  );

  try {

    const image =
      await loadImage(pendingImage);

    const resizedCanvas =
      resizeForOCR(image);

    const processedCanvas =
      improveRecipeImage(
        resizedCanvas
      );

    setScanStatus(
      "🔎 Reading your recipe..."
    );

    const result =
      await Tesseract.recognize(
        processedCanvas,
        "eng",
        {
          logger: progress => {

            if (
              progress.status ===
              "recognizing text"
            ) {

              const percent =
                Math.round(
                  progress.progress * 100
                );

              setScanStatus(
                `🔎 Reading recipe ${percent}%`
              );

            }

          }
        }
      );

    const cleaned =
      cleanOCRText(
        result.data.text
      );

    if (!cleaned) {

      setScanStatus(
        "❌ I couldn't read the recipe. Try a clearer photo."
      );

      return;

    }

    /*
       IMPORTANT:
       We now DON'T automatically create
       a title from the first OCR line.

       The title stays EMPTY.
    */

    const formatted =
      formatRecipeWithoutTitle(
        cleaned
      );

    if (reviewText) {
      reviewText.value =
        formatted;
    }

    if (reviewBox) {
      reviewBox.classList.remove(
        "hidden"
      );
    }

    setScanStatus(
      "✅ Recipe recognized!"
    );

  } catch (error) {

    console.error(
      "Scanner error:",
      error
    );

    setScanStatus(
      "❌ Scanner error. Try another photo."
    );

  }

}


/* =========================================================
   IMAGE LOADING
   ========================================================= */

function loadImage(file) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();

      reader.onload =
        event => {

          const image =
            new Image();

          image.onload =
            () => resolve(image);

          image.onerror =
            reject;

          image.src =
            event.target.result;

        };

      reader.onerror =
        reject;

      reader.readAsDataURL(file);

    }
  );

}


/* =========================================================
   IMAGE RESIZE
   ========================================================= */

function resizeForOCR(image) {

  const MAX_WIDTH = 2200;
  const MAX_HEIGHT = 3000;

  let width =
    image.naturalWidth;

  let height =
    image.naturalHeight;

  const scale =
    Math.min(
      1,
      MAX_WIDTH / width,
      MAX_HEIGHT / height
    );

  width =
    Math.round(
      width * scale
    );

  height =
    Math.round(
      height * scale
    );

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    width;

  canvas.height =
    height;

  const ctx =
    canvas.getContext(
      "2d",
      {
        willReadFrequently: true
      }
    );

  ctx.drawImage(
    image,
    0,
    0,
    width,
    height
  );

  return canvas;

}


/* =========================================================
   IMAGE ENHANCEMENT
   ========================================================= */

function improveRecipeImage(canvas) {

  const ctx =
    canvas.getContext(
      "2d",
      {
        willReadFrequently: true
      }
    );

  const imageData =
    ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

  const data =
    imageData.data;

  for (
    let i = 0;
    i < data.length;
    i += 4
  ) {

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    let gray =
      0.299 * r +
      0.587 * g +
      0.114 * b;

    gray =
      ((gray - 128) * 1.45) +
      128;

    gray += 5;

    gray =
      Math.max(
        0,
        Math.min(
          255,
          gray
        )
      );

    data[i] =
      gray;

    data[i + 1] =
      gray;

    data[i + 2] =
      gray;

  }

  ctx.putImageData(
    imageData,
    0,
    0
  );

  const output =
    document.createElement(
      "canvas"
    );

  output.width =
    canvas.width;

  output.height =
    canvas.height;

  const outCtx =
    output.getContext(
      "2d",
      {
        willReadFrequently: true
      }
    );

  outCtx.drawImage(
    canvas,
    0,
    0
  );

  const outData =
    outCtx.getImageData(
      0,
      0,
      output.width,
      output.height
    );

  const pixels =
    outData.data;

  for (
    let i = 0;
    i < pixels.length;
    i += 4
  ) {

    const value =
      pixels[i];

    if (value > 205) {

      pixels[i] = 255;
      pixels[i + 1] = 255;
      pixels[i + 2] = 255;

    } else if (value < 105) {

      pixels[i] = 0;
      pixels[i + 1] = 0;
      pixels[i + 2] = 0;

    } else {

      const adjusted =
        value < 155
          ? 35
          : 235;

      pixels[i] =
        adjusted;

      pixels[i + 1] =
        adjusted;

      pixels[i + 2] =
        adjusted;

    }

  }

  outCtx.putImageData(
    outData,
    0,
    0
  );

  return output;

}


/* =========================================================
   OCR CLEANING
   ========================================================= */

function cleanOCRText(text) {

  if (!text) return "";

  let result =
    text.normalize(
      "NFKC"
    );

  result =
    result.replace(
      /[\u0000-\u001F\u007F]/g,
      ""
    );

  result =
    result.replace(
      /[░▒▓█■□◆◇]+/g,
      ""
    );

  result =
    result
      .replace(
        /[“”]/g,
        '"'
      )
      .replace(
        /[‘’]/g,
        "'"
      )
      .replace(
        /[–—−]/g,
        "-"
      );

  const lines =
    result
      .split("\n")
      .map(
        line =>
          line
            .replace(
              /\s+/g,
              " "
            )
            .trim()
      )
      .filter(Boolean);

  return lines
    .filter(line => {

      const letters =
        (
          line.match(
            /[A-Za-z0-9]/g
          ) || []
        ).length;

      return letters >= 2;

    })
    .join("\n");

}


/* =========================================================
   FORMAT SCANNED RECIPE
   TITLE IS INTENTIONALLY EMPTY
   ========================================================= */

function formatRecipeWithoutTitle(
  text
) {

  const lines =
    text
      .split("\n")
      .map(
        line =>
          line.trim()
      )
      .filter(Boolean);

  let ingredientStart = -1;
  let instructionStart = -1;

  lines.forEach(
    (line, index) => {

      const lower =
        line.toLowerCase();

      if (
        ingredientStart === -1 &&
        isIngredientHeading(
          lower
        )
      ) {

        ingredientStart =
          index;

      }

      if (
        instructionStart === -1 &&
        isInstructionHeading(
          lower
        )
      ) {

        instructionStart =
          index;

      }

    }
  );

  const ingredientList = [];
  const instructionList = [];

  /*
     INGREDIENTS
  */

  if (
    ingredientStart !== -1
  ) {

    const end =
      instructionStart !== -1
        ? instructionStart
        : lines.length;

    for (
      let i =
        ingredientStart + 1;
      i < end;
      i++
    ) {

      const item =
        cleanIngredientLine(
          lines[i]
        );

      if (item)
        ingredientList.push(
          item
        );

    }

  } else {

    /*
       If there is no Ingredients heading,
       detect ingredient-looking lines.
    */

    lines.forEach(
      line => {

        if (
          looksLikeIngredient(
            line
          )
        ) {

          ingredientList.push(
            cleanIngredientLine(
              line
            )
          );

        }

      }
    );

  }


  /*
     INSTRUCTIONS
  */

  if (
    instructionStart !== -1
  ) {

    for (
      let i =
        instructionStart + 1;
      i < lines.length;
      i++
    ) {

      const item =
        cleanInstructionLine(
          lines[i]
        );

      if (item)
        instructionList.push(
          item
        );

    }

  }


  /*
     If instructions weren't explicitly
     labelled, find lines that aren't
     ingredient lines.
  */

  if (
    instructionList.length === 0
  ) {

    let start =
      instructionStart !== -1
        ? instructionStart + 1
        : 0;

    for (
      let i = start;
      i < lines.length;
      i++
    ) {

      const line =
        lines[i];

      if (
        isIngredientHeading(
          line.toLowerCase()
        )
      )
        continue;

      if (
        isInstructionHeading(
          line.toLowerCase()
        )
      )
        continue;

      if (
        looksLikeIngredient(
          line
        )
      )
        continue;

      const item =
        cleanInstructionLine(
          line
        );

      if (
        item &&
        item.length > 5
      ) {

        instructionList.push(
          item
        );

      }

    }

  }


  const uniqueIngredients =
    [
      ...new Set(
        ingredientList
      )
    ];

  const uniqueInstructions =
    [
      ...new Set(
        instructionList
      )
    ];


  /*
     NO TITLE.
  */

  return [

    "TITLE:",

    "",

    "INGREDIENTS:",

    ...(
      uniqueIngredients.length
        ? uniqueIngredients.map(
            x => "• " + x
          )
        : [
            "•"
          ]
    ),

    "",

    "INSTRUCTIONS:",

    ...(
      uniqueInstructions.length
        ? uniqueInstructions.map(
            (x, i) =>
              `${i + 1}. ${x}`
          )
        : [
            "1."
          ]
    ),

    "",

    "NOTES:",

    ""

  ].join("\n");

}


/* =========================================================
   DETECTION
   ========================================================= */

function isIngredientHeading(text) {

  return (
    text === "ingredients" ||
    text === "ingredient" ||
    text.startsWith(
      "ingredients:"
    )
  );

}


function isInstructionHeading(text) {

  return (
    text === "instructions" ||
    text === "instruction" ||
    text === "directions" ||
    text === "direction" ||
    text === "method" ||
    text === "steps" ||
    text === "preparation" ||
    text === "preparations"
  );

}


function cleanIngredientLine(line) {

  return line
    .replace(
      /^[•●▪■□*-]+\s*/,
      ""
    )
    .replace(
      /^\d+[.)]\s*/,
      ""
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}


function cleanInstructionLine(line) {

  return line
    .replace(
      /^\d+[.)]\s*/,
      ""
    )
    .replace(
      /^[•●▪■□*-]+\s*/,
      ""
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}


function looksLikeIngredient(line) {

  const measurement =
    /\b(cup|cups|tbsp|tsp|tablespoon|tablespoons|teaspoon|teaspoons|gram|grams|kg|g|ml|l|oz|ounce|ounces|lb|lbs|pound|pounds|pinch|clove|cloves)\b/i;

  const number =
    /\b\d+([\/.]\d+)?\b/;

  const food =
    /\b(flour|sugar|salt|pepper|butter|oil|milk|egg|eggs|chicken|beef|pork|rice|pasta|cheese|onion|garlic|tomato|water|cream|vanilla)\b/i;

  return (
    measurement.test(line) ||
    (
      number.test(line) &&
      food.test(line)
    )
  );

}


/* =========================================================
   MAIN RECIPE SAVE
   ========================================================= */

if (saveMainRecipe) {

  saveMainRecipe.onclick = () => {

    const text =
      recipeText.value.trim();

    if (!text) {

      setScanStatus(
        "❌ Scan a recipe first."
      );

      return;

    }

    const parsed =
      parseScannedRecipe(
        text
      );

    /*
       User asked for title to be empty.
       So title will stay empty until
       they type one themselves.
    */

    const folder =
      autoSortFolder(
        "",
        parsed.ingredients,
        parsed.instructions
      );

    recipes.push({

      id:
        Date.now(),

      title:
        "",

      cuisine:
        "General",

      folder,

      ingredients:
        parsed.ingredients,

      instructions:
        parsed.instructions,

      notes:
        ""

    });

    saveData();

    recipeText.value = "";

    setScanStatus(
      `✅ Saved to ${folder}!`
    );

    renderEverything();

  };

}


/* =========================================================
   PARSE SCANNED TEXT
   ========================================================= */

function parseScannedRecipe(text) {

  const lines =
    text
      .split("\n")
      .map(
        x =>
          x
            .replace(
              /^TITLE:\s*/i,
              ""
            )
            .trim()
      )
      .filter(Boolean);

  const ingredientsList = [];
  const instructionsList = [];

  let section = "";

  for (
    const line of lines
  ) {

    const lower =
      line.toLowerCase();

    if (
      lower === "ingredients:" ||
      lower === "ingredients"
    ) {

      section =
        "ingredients";

      continue;

    }

    if (
      lower === "instructions:" ||
      lower === "instructions"
    ) {

      section =
        "instructions";

      continue;

    }

    if (
      lower === "notes:" ||
      lower === "notes"
    ) {

      section =
        "notes";

      continue;

    }

    if (
      section ===
      "ingredients"
    ) {

      const item =
        cleanIngredientLine(
          line
        );

      if (item)
        ingredientsList.push(
          item
        );

    }

    if (
      section ===
      "instructions"
    ) {

      const item =
        cleanInstructionLine(
          line
        );

      if (item)
        instructionsList.push(
          item
        );

    }

  }

  return {

    title: "",

    ingredients:
      [
        ...new Set(
          ingredientsList
        )
      ],

    instructions:
      [
        ...new Set(
          instructionsList
        )
      ]

  };

}


/* =========================================================
   AUTO SORT
   ========================================================= */

function autoSortFolder(
  title,
  ingredientList,
  instructionList
) {

  const text = (
    title +
    " " +
    ingredientList.join(" ") +
    " " +
    instructionList.join(" ")
  ).toLowerCase();


  /*
     SWEET
  */

  const sweetWords = [
    "cake",
    "cookie",
    "cookies",
    "brownie",
    "brownies",
    "chocolate",
    "vanilla",
    "cupcake",
    "cupcakes",
    "muffin",
    "muffins",
    "dessert",
    "icing",
    "frosting",
    "sugar",
    "caramel",
    "candy",
    "pie",
    "pudding"
  ];


  /*
     FRIED
  */

  const friedWords = [
    "fried",
    "fry",
    "frying",
    "deep fry",
    "deep-fried",
    "crispy",
    "fritter",
    "tempura"
  ];


  /*
     SAVOURY
  */

  const savouryWords = [
    "chicken",
    "beef",
    "pork",
    "steak",
    "burger",
    "sausage",
    "bacon",
    "fish",
    "salmon",
    "shrimp",
    "prawn",
    "potato",
    "rice",
    "pasta",
    "soup",
    "sandwich",
    "cheese",
    "garlic",
    "onion",
    "tomato"
  ];


  /*
     INTERNATIONAL
  */

  const internationalWords = [
    "taco",
    "tacos",
    "curry",
    "sushi",
    "ramen",
    "pizza",
    "pad thai",
    "lasagna",
    "lasagne",
    "burrito",
    "enchilada",
    "teriyaki",
    "quesadilla"
  ];


  /*
     Check existing folders first.
  */

  if (
    containsAny(
      text,
      sweetWords
    ) &&
    folders.includes(
      "Sweet"
    )
  ) {

    return "Sweet";

  }


  if (
    containsAny(
      text,
      friedWords
    ) &&
    folders.includes(
      "Fried"
    )
  ) {

    return "Fried";

  }


  if (
    containsAny(
      text,
      internationalWords
    ) &&
    folders.includes(
      "International"
    )
  ) {

    return "International";

  }


  if (
    containsAny(
      text,
      savouryWords
    ) &&
    folders.includes(
      "Savoury"
    )
  ) {

    return "Savoury";

  }


  /*
     If no category is detected,
     use the first folder.
  */

  return (
    folders[0] ||
    "Unsorted"
  );

}


function containsAny(
  text,
  words
) {

  return words.some(
    word =>
      text.includes(
        word
      )
  );

}


/* =========================================================
   REVIEW ACCEPT
   ========================================================= */

if (acceptRecipe) {

  acceptRecipe.onclick = () => {

    const text =
      reviewText.value.trim();

    if (!text)
      return;

    if (reviewBox) {
      reviewBox.classList.add(
        "hidden"
      );
    }

    /*
       Owner gets the full editor.
    */

    if (ownerScanning) {

      openEditorFromScan(
        text
      );

      return;

    }

    /*
       Normal user gets cleaned
       recipe text.
    */

    recipeText.value =
      text;

    setScanStatus(
      "✅ Recipe cleaned. Add a title before saving."
    );

  };

}


/* =========================================================
   OWNER CODE
   ========================================================= */

if (recipeText) {

  recipeText.addEventListener(
    "keydown",
    event => {

      if (
        event.key >= "0" &&
        event.key <= "9"
      ) {

        codeBuffer +=
          event.key;

        codeBuffer =
          codeBuffer.slice(
            -OWNER_CODE.length
          );

      }

      if (
        event.key === "Enter" &&
        codeBuffer === OWNER_CODE
      ) {

        event.preventDefault();

        codeBuffer = "";

        if (ownerLogin) {

          ownerLogin.classList.remove(
            "hidden"
          );

        }

        if (ownerPassword) {
          ownerPassword.value = "";
          ownerPassword.focus();
        }

        if (ownerError) {
          ownerError.textContent = "";
        }

      }

    }
  );

}


/* =========================================================
   OWNER LOGIN
   ========================================================= */

if (ownerLoginBtn) {

  ownerLoginBtn.onclick = () => {

    if (
      ownerPassword.value ===
      OWNER_PASSWORD
    ) {

      ownerLogin.classList.add(
        "hidden"
      );

      ownerPanel.classList.remove(
        "hidden"
      );

      renderEverything();

    } else {

      ownerError.textContent =
        "❌ Incorrect owner password.";

    }

  };

}


if (ownerPassword) {

  ownerPassword.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter"
      ) {

        ownerLoginBtn.click();

      }

    }
  );

}


if (exitOwner) {

  exitOwner.onclick = () => {

    ownerPanel.classList.add(
      "hidden"
    );

  };

}


/* =========================================================
   OWNER EDITOR FROM SCAN
   ========================================================= */

function openEditorFromScan(
  text
) {

  const parsed =
    parseScannedRecipe(
      text
    );

  openEditor({

    id: null,

    /*
       TITLE IS EMPTY.
    */
    title: "",

    cuisine:
      "General",

    folder:
      autoSortFolder(
        "",
        parsed.ingredients,
        parsed.instructions
      ),

    ingredients:
      parsed.ingredients,

    instructions:
      parsed.instructions,

    notes:
      ""

  });

}


/* =========================================================
   RENDER EVERYTHING
   ========================================================= */

function renderEverything() {

  renderFolders();

  renderRecipes();

  fillEditorSelects();

}


/* =========================================================
   FOLDERS
   ========================================================= */

function renderFolders() {

  if (!foldersElement)
    return;

  foldersElement.innerHTML = "";

  folders.forEach(
    folder => {

      const count =
        recipes.filter(
          recipe =>
            recipe.folder ===
            folder
        ).length;

      const button =
        document.createElement(
          "button"
        );

      button.className =
        "folder";

      button.innerHTML = `
        <strong>
          📁 ${escapeHTML(folder)}
        </strong>

        <small>
          ${count}
          ${count === 1
            ? "recipe"
            : "recipes"}
        </small>
      `;

      button.onclick = () => {

        selectedFolder =
          folder;

        if (currentFolder) {

          currentFolder.textContent =
            "📁 " + folder;

        }

        renderRecipes();

      };

      foldersElement.appendChild(
        button
      );

    }
  );

}


/* =========================================================
   RECIPES
   ========================================================= */

function renderRecipes() {

  if (!recipesElement)
    return;

  recipesElement.innerHTML = "";

  let list =
    recipes;

  if (selectedFolder) {

    list =
      recipes.filter(
        recipe =>
          recipe.folder ===
          selectedFolder
      );

  }

  if (!list.length) {

    recipesElement.innerHTML = `
      <div class="recipe">
        <p>No recipes here yet.</p>
      </div>
    `;

    return;

  }

  list.forEach(
    recipe => {

      const card =
        document.createElement(
          "div"
        );

      card.className =
        "recipe";

      card.innerHTML = `
        <h4>
          ${escapeHTML(
            recipe.title ||
            "Untitled Recipe"
          )}
        </h4>

        <p>
          ${escapeHTML(
            recipe.cuisine ||
            "General"
          )}
          •
          ${escapeHTML(
            recipe.folder ||
            "Unsorted"
          )}
        </p>
      `;

      const view =
        document.createElement(
          "button"
        );

      view.textContent =
        "View";

      view.onclick = () =>
        showRecipe(recipe);

      const edit =
        document.createElement(
          "button"
        );

      edit.textContent =
        "Edit";

      edit.onclick = () =>
        openEditor(recipe);

      const del =
        document.createElement(
          "button"
        );

      del.textContent =
        "Delete";

      del.className =
        "delete";

      del.onclick = () => {

        if (
          confirm(
            `Delete "${recipe.title || "Untitled Recipe"}"?`
          )
        ) {

          recipes =
            recipes.filter(
              r =>
                r.id !==
                recipe.id
            );

          saveData();

          renderEverything();

        }

      };

      card.appendChild(
        view
      );

      card.appendChild(
        edit
      );

      card.appendChild(
        del
      );

      recipesElement.appendChild(
        card
      );

    }
  );

}


if (allRecipes) {

  allRecipes.onclick = () => {

    selectedFolder = null;

    if (currentFolder) {

      currentFolder.textContent =
        "📖 All Recipes";

    }

    renderRecipes();

  };

}


/* =========================================================
   VIEW RECIPE
   ========================================================= */

function showRecipe(recipe) {

  if (viewTitle) {

    viewTitle.textContent =
      recipe.title ||
      "Untitled Recipe";

  }

  if (viewCategory) {

    viewCategory.textContent =
      `${recipe.cuisine || "General"} • ${recipe.folder || "Unsorted"}`;

  }

  if (viewIngredients) {

    viewIngredients.innerHTML = "";

    (
      recipe.ingredients ||
      []
    ).forEach(
      ingredient => {

        const li =
          document.createElement(
            "li"
          );

        li.textContent =
          ingredient;

        viewIngredients.appendChild(
          li
        );

      }
    );

  }

  if (viewInstructions) {

    viewInstructions.textContent =
      (
        recipe.instructions ||
        []
      )
      .map(
        (item, index) =>
          `${index + 1}. ${item}`
      )
      .join("\n");

  }

  /*
     Notes.
  */

  if (viewNotes) {

    viewNotes.textContent =
      recipe.notes ||
      "No notes.";

  }

  if (recipeView) {

    recipeView.classList.remove(
      "hidden"
    );

  }

}


if (closeRecipe) {

  closeRecipe.onclick = () => {

    recipeView.classList.add(
      "hidden"
    );

  };

}


/* =========================================================
   ADD / EDIT RECIPE
   ========================================================= */

if (addRecipe) {

  addRecipe.onclick = () => {

    openEditor();

  };

}


if (editRecipe) {

  editRecipe.onclick = () => {

    if (!recipes.length) {

      alert(
        "There are no recipes yet."
      );

      return;

    }

    const number =
      prompt(
        recipes
          .map(
            (recipe, index) =>
              `${index + 1}. ${recipe.title || "Untitled Recipe"}`
          )
          .join("\n") +
        "\n\nEnter recipe number:"
      );

    const index =
      Number(number) - 1;

    if (
      !Number.isInteger(index) ||
      !recipes[index]
    )
      return;

    openEditor(
      recipes[index]
    );

  };

}


function openEditor(
  recipe = null
) {

  editingRecipeId =
    recipe?.id || null;

  if (editorTitle) {

    editorTitle.textContent =
      recipe
        ? "✏️ Edit Recipe"
        : "➕ Add Recipe";

  }

  /*
     TITLE CAN BE EMPTY.
  */

  if (recipeTitle) {

    recipeTitle.value =
      recipe?.title || "";

  }

  if (ingredients) {

    ingredients.value =
      recipe?.ingredients?.join(
        "\n"
      ) || "";

  }

  if (instructions) {

    instructions.value =
      recipe?.instructions?.join(
        "\n"
      ) || "";

  }

  /*
     NOTES.
  */

  if (recipeNotes) {

    recipeNotes.value =
      recipe?.notes || "";

  }

  fillEditorSelects(
    recipe
  );

  if (editorError) {

    editorError.textContent =
      "";

  }

  if (editor) {

    editor.classList.remove(
      "hidden"
    );

  }

}


/* =========================================================
   EDITOR DROPDOWNS
   ========================================================= */

function fillEditorSelects(
  recipe = null
) {

  if (recipeCuisine) {

    recipeCuisine.innerHTML =
      "";

    cuisines.forEach(
      cuisine => {

        const option =
          document.createElement(
            "option"
          );

        option.value =
          cuisine;

        option.textContent =
          cuisine;

        recipeCuisine.appendChild(
          option
        );

      }
    );

  }

  if (recipeFolder) {

    recipeFolder.innerHTML =
      "";

    folders.forEach(
      folder => {

        const option =
          document.createElement(
            "option"
          );

        option.value =
          folder;

        option.textContent =
          folder;

        recipeFolder.appendChild(
          option
        );

      }
    );

  }

  if (recipe) {

    if (recipeCuisine)
      recipeCuisine.value =
        recipe.cuisine ||
        "General";

    if (recipeFolder)
      recipeFolder.value =
        recipe.folder ||
        folders[0];

  }

}


/* =========================================================
   SAVE EDITOR
   ========================================================= */

if (saveEditor) {

  saveEditor.onclick = () => {

    /*
       Title is optional now.
    */

    const title =
      recipeTitle
        ? recipeTitle.value.trim()
        : "";

    const ingredientList =
      ingredients
        ? ingredients.value
            .split("\n")
            .map(
              x => x.trim()
            )
            .filter(Boolean)
        : [];

    const instructionList =
      instructions
        ? instructions.value
            .split("\n")
            .map(
              x => x.trim()
            )
            .filter(Boolean)
        : [];

    const notes =
      recipeNotes
        ? recipeNotes.value.trim()
        : "";

    /*
       AUTO SORT.
       If the user hasn't manually changed
       the folder from the default, sort it.
    */

    let folder =
      recipeFolder
        ? recipeFolder.value
        : folders[0];

    const autoFolder =
      autoSortFolder(
        title,
        ingredientList,
        instructionList
      );

    /*
       For new recipes, automatically sort.
    */

    if (!editingRecipeId) {

      folder =
        autoFolder;

    }

    const recipe = {

      id:
        editingRecipeId ||
        Date.now(),

      title,

      cuisine:
        recipeCuisine
          ? recipeCuisine.value
          : "General",

      folder,

      ingredients:
        ingredientList,

      instructions:
        instructionList,

      notes

    };

    const index =
      recipes.findIndex(
        r =>
          r.id ===
          editingRecipeId
      );

    if (index === -1) {

      recipes.push(
        recipe
      );

    } else {

      recipes[index] =
        recipe;

    }

    saveData();

    if (editor) {

      editor.classList.add(
        "hidden"
      );

    }

    renderEverything();

  };

}


if (cancelEditor) {

  cancelEditor.onclick = () => {

    editor.classList.add(
      "hidden"
    );

  };

}


/* =========================================================
   DELETE RECIPE
   ========================================================= */

if (deleteRecipe) {

  deleteRecipe.onclick = () => {

    if (!recipes.length) {

      alert(
        "There are no recipes."
      );

      return;

    }

    const list =
      recipes
        .map(
          (recipe, index) =>
            `${index + 1}. ${recipe.title || "Untitled Recipe"}`
        )
        .join("\n");

    const answer =
      prompt(
        list +
        "\n\nEnter recipe number to delete:"
      );

    const index =
      Number(answer) - 1;

    if (
      !Number.isInteger(index) ||
      !recipes[index]
    )
      return;

    if (
      confirm(
        `Delete "${recipes[index].title || "Untitled Recipe"}"?`
      )
    ) {

      recipes.splice(
        index,
        1
      );

      saveData();

      renderEverything();

    }

  };

}


/* =========================================================
   FOLDER / CUISINE MANAGEMENT
   ========================================================= */

if (addFolder) {

  addFolder.onclick = () =>
    openManager(
      "addFolder"
    );

}

if (deleteFolder) {

  deleteFolder.onclick = () =>
    openManager(
      "deleteFolder"
    );

}

if (addCuisine) {

  addCuisine.onclick = () =>
    openManager(
      "addCuisine"
    );

}

if (deleteCuisine) {

  deleteCuisine.onclick = () =>
    openManager(
      "deleteCuisine"
    );

}


function openManager(
  mode
) {

  managerMode =
    mode;

  if (managerError)
    managerError.textContent = "";

  if (managerInput) {

    managerInput.value = "";

    managerInput.classList.add(
      "hidden"
    );

  }

  if (managerSelect) {

    managerSelect.classList.add(
      "hidden"
    );

  }

  if (
    mode ===
    "addFolder"
  ) {

    managerTitle.textContent =
      "📁 Add Folder";

    managerDescription.textContent =
      "Create a new recipe folder.";

    managerInput.classList.remove(
      "hidden"
    );

    managerInput.placeholder =
      "Folder name";

  }

  if (
    mode ===
    "deleteFolder"
  ) {

    managerTitle.textContent =
      "🗑️ Delete Folder";

    managerDescription.textContent =
      "Recipes will be moved to another folder.";

    populateManagerSelect(
      folders
    );

  }

  if (
    mode ===
    "addCuisine"
  ) {

    managerTitle.textContent =
      "🌎 Add Cuisine";

    managerDescription.textContent =
      "Create a new cuisine.";

    managerInput.classList.remove(
      "hidden"
    );

    managerInput.placeholder =
      "Cuisine name";

  }

  if (
    mode ===
    "deleteCuisine"
  ) {

    managerTitle.textContent =
      "🗑️ Delete Cuisine";

    managerDescription.textContent =
      "Recipes will become General.";

    populateManagerSelect(
      cuisines.filter(
        cuisine =>
          cuisine !==
          "General"
      )
    );

  }

  manager.classList.remove(
    "hidden"
  );

}


function populateManagerSelect(
  list
) {

  if (!managerSelect)
    return;

  managerSelect.innerHTML =
    "";

  list.forEach(
    item => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        item;

      option.textContent =
        item;

      managerSelect.appendChild(
        option
      );

    }
  );

  managerSelect.classList.remove(
    "hidden"
  );

}


if (managerConfirm) {

  managerConfirm.onclick = () => {

    const value =
      managerInput
        ? managerInput.value.trim()
        : "";

    if (
      managerMode ===
      "addFolder"
    ) {

      if (!value)
        return showManagerError(
          "Enter a folder name."
        );

      if (
        folders.includes(
          value
        )
      )
        return showManagerError(
          "That folder already exists."
        );

      folders.push(
        value
      );

    }

    if (
      managerMode ===
      "addCuisine"
    ) {

      if (!value)
        return showManagerError(
          "Enter a cuisine name."
        );

      if (
        cuisines.includes(
          value
        )
      )
        return showManagerError(
          "That cuisine already exists."
        );

      cuisines.push(
        value
      );

    }

    if (
      managerMode ===
      "deleteFolder"
    ) {

      const folder =
        managerSelect.value;

      if (!folder)
        return;

      if (
        folders.length <= 1
      ) {

        return showManagerError(
          "You need at least one folder."
        );

      }

      if (
        !confirm(
          `Delete the "${folder}" folder?`
        )
      )
        return;

      folders =
        folders.filter(
          item =>
            item !==
            folder
        );

      const replacement =
        folders[0];

      recipes =
        recipes.map(
          recipe => {

            if (
              recipe.folder ===
              folder
            ) {

              return {
                ...recipe,
                folder:
                  replacement
              };

            }

            return recipe;

          }
        );

    }

    if (
      managerMode ===
      "deleteCuisine"
    ) {

      const cuisine =
        managerSelect.value;

      if (!cuisine)
        return;

      if (
        !confirm(
          `Delete the "${cuisine}" cuisine?`
        )
      )
        return;

      cuisines =
        cuisines.filter(
          item =>
            item !==
            cuisine
        );

      recipes =
        recipes.map(
          recipe => {

            if (
              recipe.cuisine ===
              cuisine
            ) {

              return {
                ...recipe,
                cuisine:
                  "General"
              };

            }

            return recipe;

          }
        );

    }

    saveData();

    manager.classList.add(
      "hidden"
    );

    renderEverything();

  };

}


function showManagerError(
  message
) {

  if (managerError) {

    managerError.textContent =
      "⚠️ " + message;

  }

}


if (managerCancel) {

  managerCancel.onclick = () => {

    manager.classList.add(
      "hidden"
    );

  };

}


/* =========================================================
   STATUS
   ========================================================= */

function setScanStatus(
  message
) {

  if (scanStatus) {

    scanStatus.textContent =
      message;

  }

}


/* =========================================================
   HTML SAFETY
   ========================================================= */

function escapeHTML(
  value
) {

  return String(
    value
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
   START
   ========================================================= */

renderEverything();

