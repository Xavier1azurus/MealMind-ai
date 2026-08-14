/* =========================================================
   MEALMIND - COMPLETE SCRIPT
   Better recipe recognition - NO API REQUIRED
   ========================================================= */

const OWNER_PASSWORD = "BumsUp2AI";
const OWNER_CODE = "1591";

const RECIPES_KEY = "mealmind_recipes";
const FOLDERS_KEY = "mealmind_folders";
const CUISINES_KEY = "mealmind_cuisines";

let recipes = JSON.parse(
  localStorage.getItem(RECIPES_KEY) || "[]"
);

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
const editorError = document.getElementById("editorError");
const saveEditor = document.getElementById("saveEditor");
const cancelEditor = document.getElementById("cancelEditor");

const recipeView = document.getElementById("recipeView");
const closeRecipe = document.getElementById("closeRecipe");
const viewTitle = document.getElementById("viewTitle");
const viewCategory = document.getElementById("viewCategory");
const viewIngredients = document.getElementById("viewIngredients");
const viewInstructions = document.getElementById("viewInstructions");

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
   IMAGE SCANNER
   ========================================================= */

scanBtn.onclick = () => {
  recipeImage.value = "";
  recipeImage.click();
};


recipeImage.onchange = () => {

  if (!recipeImage.files.length) return;

  pendingImage = recipeImage.files[0];
  ownerScanning = false;

  photoCheck.classList.remove("hidden");
};


ownerScan.onclick = () => {

  ownerImage.value = "";
  ownerImage.click();

};


ownerImage.onchange = () => {

  if (!ownerImage.files.length) return;

  pendingImage = ownerImage.files[0];
  ownerScanning = true;

  photoCheck.classList.remove("hidden");
};


retakePhoto.onclick = () => {

  photoCheck.classList.add("hidden");

  if (ownerScanning) {
    ownerImage.click();
  } else {
    recipeImage.click();
  }

};


usePhoto.onclick = async () => {

  photoCheck.classList.add("hidden");

  await startBetterScan();

};


reviewRetake.onclick = () => {

  reviewBox.classList.add("hidden");

  if (ownerScanning) {
    ownerImage.click();
  } else {
    recipeImage.click();
  }

};


/* =========================================================
   BETTER SCANNER
   ========================================================= */

async function startBetterScan() {

  if (!pendingImage) return;

  setScanStatus(
    "📸 Preparing your photo..."
  );

  try {

    /*
      STEP 1:
      Load the image.
    */

    const image =
      await loadImage(pendingImage);


    /*
      STEP 2:
      Resize very large images.
      This prevents OCR from having to process
      unnecessarily huge pictures.
    */

    const resizedCanvas =
      resizeForOCR(image);


    /*
      STEP 3:
      Create a cleaned black/white version.
    */

    const processedCanvas =
      improveRecipeImage(
        resizedCanvas
      );


    /*
      STEP 4:
      OCR the processed image.
    */

    setScanStatus(
      "🔎 Reading the recipe..."
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


    /*
      STEP 5:
      Clean the OCR result.
    */

    const cleaned =
      cleanOCRText(
        result.data.text
      );


    if (!cleaned) {

      setScanStatus(
        "❌ I couldn't find readable text. Try a clearer photo."
      );

      return;

    }


    /*
      STEP 6:
      Turn the text into a cleaner recipe layout.
    */

    const formatted =
      formatRecipe(
        cleaned
      );


    /*
      STEP 7:
      Show the user the result before saving.
    */

    reviewText.value =
      formatted;

    reviewBox.classList.remove(
      "hidden"
    );

    setScanStatus(
      "✅ Recipe recognized!"
    );


  } catch (error) {

    console.error(
      "Scanner error:",
      error
    );

    setScanStatus(
      "❌ Something went wrong. Try another photo."
    );

  }

}


/* =========================================================
   LOAD IMAGE
   ========================================================= */

function loadImage(file) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();

      reader.onload = event => {

        const image =
          new Image();

        image.onload = () =>
          resolve(image);

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
   RESIZE IMAGE
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
   IMAGE PROCESSING
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


  /*
    Convert to grayscale and improve contrast.
  */

  for (
    let i = 0;
    i < data.length;
    i += 4
  ) {

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];


    /*
      Human-readable luminance.
    */

    let gray =
      0.299 * r +
      0.587 * g +
      0.114 * b;


    /*
      Contrast enhancement.
    */

    gray =
      ((gray - 128) * 1.45) +
      128;


    /*
      Slight brightness correction.
    */

    gray += 5;


    /*
      Keep values valid.
    */

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


  /*
    Create a second canvas for
    cleaner thresholding.
  */

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


  /*
    Turn very light gray into white
    and dark text into black.
  */

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

      /*
        Keep middle shades readable.
      */

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
    text
      .normalize("NFKC");


  /*
    Remove control characters.
  */

  result =
    result.replace(
      /[\u0000-\u001F\u007F]/g,
      ""
    );


  /*
    Remove common OCR garbage.
  */

  result =
    result.replace(
      /[░▒▓█■□◆◇]+/g,
      ""
    );


  /*
    Fix common punctuation.
  */

  result =
    result
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[–—−]/g, "-");


  /*
    Clean whitespace.
  */

  const lines =
    result
      .split("\n")
      .map(line => {

        return line
          .replace(
            /\s+/g,
            " "
          )
          .trim();

      })
      .filter(
        line =>
          line.length > 0
      );


  /*
    Remove lines that are almost
    entirely OCR symbols.
  */

  const useful =
    lines.filter(line => {

      const letters =
        (
          line.match(
            /[A-Za-z0-9]/g
          ) || []
        ).length;

      return letters >= 2;

    });


  return useful.join("\n");

}


/* =========================================================
   RECIPE FORMATTER
   ========================================================= */

function formatRecipe(text) {

  const lines =
    text
      .split("\n")
      .map(
        line =>
          line.trim()
      )
      .filter(Boolean);


  if (!lines.length)
    return "";


  let title =
    findBestTitle(lines);


  let ingredientStart =
    -1;

  let instructionStart =
    -1;


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


  const ingredientList =
    [];

  const instructionList =
    [];


  /*
    Ingredients.
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

      const cleaned =
        cleanIngredientLine(
          lines[i]
        );


      if (cleaned)
        ingredientList.push(
          cleaned
        );

    }

  } else {

    /*
      If OCR didn't detect the heading,
      try to recognize ingredient-like lines.
    */

    for (
      const line of lines.slice(1)
    ) {

      if (
        looksLikeIngredient(line)
      ) {

        ingredientList.push(
          cleanIngredientLine(
            line
          )
        );

      }

    }

  }


  /*
    Instructions.
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

      const cleaned =
        cleanInstructionLine(
          lines[i]
        );


      if (cleaned)
        instructionList.push(
          cleaned
        );

    }

  }


  /*
    If no explicit instruction heading
    was found, use remaining lines.
  */

  if (
    !instructionList.length &&
    instructionStart === -1
  ) {

    let startIndex =
      Math.max(
        1,
        ingredientStart + 1
      );


    for (
      let i =
        startIndex;
      i < lines.length;
      i++
    ) {

      const line =
        lines[i];


      if (
        !ingredientList.includes(
          cleanIngredientLine(line)
        )
      ) {

        const cleaned =
          cleanInstructionLine(
            line
          );


        if (cleaned)
          instructionList.push(
            cleaned
          );

      }

    }

  }


  /*
    Remove duplicate ingredients.
  */

  const uniqueIngredients =
    [...new Set(
      ingredientList
    )];


  const uniqueInstructions =
    [...new Set(
      instructionList
    )];


  return [

    "🍴 " + title,

    "",

    "🥕 INGREDIENTS",

    ...(uniqueIngredients.length
      ? uniqueIngredients.map(
          item =>
            "• " + item
        )
      : [
          "• Add ingredients here"
        ]),

    "",

    "👨‍🍳 INSTRUCTIONS",

    ...(uniqueInstructions.length
      ? uniqueInstructions.map(
          (item, index) =>
            `${index + 1}. ${item}`
        )
      : [
          "1. Add instructions here"
        ])

  ].join("\n");

}


/* =========================================================
   TITLE DETECTION
   ========================================================= */

function findBestTitle(lines) {

  /*
    Look at the first few lines and
    avoid choosing obvious headings.
  */

  for (
    let i = 0;
    i < Math.min(
      lines.length,
      5
    );
    i++
  ) {

    const line =
      lines[i]
        .trim();


    const lower =
      line.toLowerCase();


    if (!line)
      continue;


    if (
      isIngredientHeading(
        lower
      )
    )
      continue;


    if (
      isInstructionHeading(
        lower
      )
    )
      continue;


    /*
      Ignore lines that are only numbers.
    */

    if (
      /^[\d\s.,:/-]+$/.test(
        line
      )
    )
      continue;


    return cleanTitle(line);

  }


  return "Scanned Recipe";

}


function cleanTitle(title) {

  return title

    .replace(
      /^[•●■□▪]+/,
      ""
    )

    .replace(
      /^recipe\s*[:\-]?\s*/i,
      ""
    )

    .replace(
      /\s+/g,
      " "
    )

    .trim();

}


/* =========================================================
   HEADING DETECTION
   ========================================================= */

function isIngredientHeading(
  text
) {

  return (
    text === "ingredients" ||
    text === "ingredient" ||
    text.startsWith(
      "ingredients:"
    )
  );

}


function isInstructionHeading(
  text
) {

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


/* =========================================================
   INGREDIENT CLEANING
   ========================================================= */

function cleanIngredientLine(
  line
) {

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
      /^\[[ xX]\]\s*/,
      ""
    )

    .replace(
      /\s+/g,
      " "
    )

    .trim();

}


function looksLikeIngredient(
  line
) {

  const lower =
    line.toLowerCase();


  /*
    Common measurements.
  */

  const measurement =
    /\b(cup|cups|tbsp|tsp|tablespoon|tablespoons|teaspoon|teaspoons|gram|grams|kg|g|ml|l|oz|ounce|ounces|lb|lbs|pound|pounds|pinch|clove|cloves)\b/i;


  /*
    Ingredient-like lines often
    contain a quantity.
  */

  const number =
    /\b\d+([\/.]\d+)?\b/;


  const commonFood =
    /\b(flour|sugar|salt|pepper|butter|oil|milk|egg|eggs|chicken|beef|pork|rice|pasta|cheese|onion|garlic|tomato|water|cream|vanilla)\b/i;


  return (
    measurement.test(line) ||
    (
      number.test(line) &&
      commonFood.test(lower)
    )
  );

}


/* =========================================================
   INSTRUCTION CLEANING
   ========================================================= */

function cleanInstructionLine(
  line
) {

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


/* =========================================================
   SCAN STATUS
   ========================================================= */

function setScanStatus(
  message
) {

  if (scanStatus)
    scanStatus.textContent =
      message;

}


/* =========================================================
   MAIN SAVE
   ========================================================= */

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
    parseRecipe(text);


  if (!parsed.title) {

    setScanStatus(
      "❌ A recipe title is required."
    );

    return;

  }


  recipes.push({

    id: Date.now(),

    title:
      parsed.title,

    cuisine:
      "General",

    folder:
      folders[0] ||
      "Unsorted",

    ingredients:
      parsed.ingredients,

    instructions:
      parsed.instructions

  });


  saveData();

  recipeText.value = "";

  setScanStatus(
    "✅ Recipe saved!"
  );

};


/* =========================================================
   PARSE RECIPE
   ========================================================= */

function parseRecipe(text) {

  const lines =
    text
      .split("\n")
      .map(
        x => x.trim()
      )
      .filter(Boolean);


  let title =
    lines[0]
      ?.replace(
        /^🍴\s*/,
        ""
      )
      .trim() || "";


  const ingredients = [];
  const instructions = [];


  let section = "";


  for (
    const line of lines.slice(1)
  ) {

    const lower =
      line.toLowerCase();


    if (
      isIngredientHeading(
        lower
      )
    ) {

      section =
        "ingredients";

      continue;

    }


    if (
      isInstructionHeading(
        lower
      )
    ) {

      section =
        "instructions";

      continue;

    }


    if (
      section ===
      "ingredients"
    ) {

      const value =
        cleanIngredientLine(
          line
        );


      if (value)
        ingredients.push(
          value
        );

    }


    if (
      section ===
      "instructions"
    ) {

      const value =
        cleanInstructionLine(
          line
        );


      if (value)
        instructions.push(
          value
        );

    }

  }


  return {

    title,

    ingredients,

    instructions

  };

}


/* =========================================================
   OWNER CODE
   ========================================================= */

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

      ownerLogin.classList.remove(
        "hidden"
      );

      ownerPassword.value = "";

      ownerError.textContent = "";

      ownerPassword.focus();

    }

  }
);


/* =========================================================
   OWNER LOGIN
   ========================================================= */

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


exitOwner.onclick = () => {

  ownerPanel.classList.add(
    "hidden"
  );

};


/* =========================================================
   OWNER SCAN ACCEPT
   ========================================================= */

acceptRecipe.onclick = () => {

  const text =
    reviewText.value.trim();


  if (!text)
    return;


  reviewBox.classList.add(
    "hidden"
  );


  if (ownerScanning) {

    openEditorFromScan(
      text
    );

  } else {

    recipeText.value =
      text;

    setScanStatus(
      "✅ Recipe cleaned. Review it and press Save Recipe."
    );

  }

};


/* =========================================================
   OWNER EDITOR
   ========================================================= */

function openEditorFromScan(
  text
) {

  const parsed =
    parseRecipe(text);


  openEditor({

    title:
      parsed.title,

    cuisine:
      "General",

    folder:
      folders[0] ||
      "Unsorted",

    ingredients:
      parsed.ingredients,

    instructions:
      parsed.instructions

  });

}


/* =========================================================
   OWNER RENDER
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

        currentFolder.textContent =
          "📁 " + folder;

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
            recipe.title
          )}
        </h4>

        <p>
          ${escapeHTML(
            recipe.cuisine
          )}
          •
          ${escapeHTML(
            recipe.folder
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
            `Delete "${recipe.title}"?`
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


      card.appendChild(view);
      card.appendChild(edit);
      card.appendChild(del);

      recipesElement.appendChild(
        card
      );

    }
  );

}


allRecipes.onclick = () => {

  selectedFolder = null;

  currentFolder.textContent =
    "📖 All Recipes";

  renderRecipes();

};


/* =========================================================
   RECIPE VIEW
   ========================================================= */

function showRecipe(recipe) {

  viewTitle.textContent =
    recipe.title;


  viewCategory.textContent =
    `${recipe.cuisine} • ${recipe.folder}`;


  viewIngredients.innerHTML =
    "";


  recipe.ingredients.forEach(
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


  viewInstructions.textContent =
    recipe.instructions
      .map(
        (item, index) =>
          `${index + 1}. ${item}`
      )
      .join("\n");


  recipeView.classList.remove(
    "hidden"
  );

}


closeRecipe.onclick = () => {

  recipeView.classList.add(
    "hidden"
  );

};


/* =========================================================
   EDITOR
   ========================================================= */

addRecipe.onclick = () => {

  openEditor();

};


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
            `${index + 1}. ${recipe.title}`
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


function openEditor(
  recipe = null
) {

  editingRecipeId =
    recipe?.id || null;


  editorTitle.textContent =
    recipe
      ? "✏️ Edit Recipe"
      : "➕ Add Recipe";


  recipeTitle.value =
    recipe?.title || "";


  ingredients.value =
    recipe?.ingredients?.join(
      "\n"
    ) || "";


  instructions.value =
    recipe?.instructions?.join(
      "\n"
    ) || "";


  fillEditorSelects(
    recipe
  );


  editorError.textContent =
    "";


  editor.classList.remove(
    "hidden"
  );

}


function fillEditorSelects(
  recipe = null
) {

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


  if (recipe) {

    recipeCuisine.value =
      recipe.cuisine;

    recipeFolder.value =
      recipe.folder;

  }

}


saveEditor.onclick = () => {

  const title =
    recipeTitle.value.trim();


  if (!title) {

    editorError.textContent =
      "⚠️ Recipe title is required.";

    return;

  }


  const recipe = {

    id:
      editingRecipeId ||
      Date.now(),

    title,

    cuisine:
      recipeCuisine.value,

    folder:
      recipeFolder.value,

    ingredients:
      ingredients.value
        .split("\n")
        .map(
          x => x.trim()
        )
        .filter(Boolean),

    instructions:
      instructions.value
        .split("\n")
        .map(
          x => x.trim()
        )
        .filter(Boolean)

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

  editor.classList.add(
    "hidden"
  );

  renderEverything();

};


cancelEditor.onclick = () => {

  editor.classList.add(
    "hidden"
  );

};


/* =========================================================
   DELETE RECIPE
   ========================================================= */

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
          `${index + 1}. ${recipe.title}`
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
      `Delete "${recipes[index].title}"?`
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


/* =========================================================
   FOLDER / CUISINE MANAGERS
   ========================================================= */

addFolder.onclick = () =>
  openManager("addFolder");


deleteFolder.onclick = () =>
  openManager("deleteFolder");


addCuisine.onclick = () =>
  openManager("addCuisine");


deleteCuisine.onclick = () =>
  openManager("deleteCuisine");


function openManager(mode) {

  managerMode =
    mode;

  managerError.textContent =
    "";

  managerInput.value =
    "";

  managerInput.classList.add(
    "hidden"
  );

  managerSelect.classList.add(
    "hidden"
  );


  if (
    mode === "addFolder"
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
    mode === "deleteFolder"
  ) {

    managerTitle.textContent =
      "🗑️ Delete Folder";

    managerDescription.textContent =
      "Recipes will not be deleted.";

    populateManagerSelect(
      folders
    );

  }


  if (
    mode === "addCuisine"
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
    mode === "deleteCuisine"
  ) {

    managerTitle.textContent =
      "🗑️ Delete Cuisine";

    managerDescription.textContent =
      "Affected recipes will become General.";

    populateManagerSelect(
      cuisines.filter(
        cuisine =>
          cuisine !== "General"
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


managerConfirm.onclick = () => {

  const value =
    managerInput.value.trim();


  if (
    managerMode ===
    "addFolder"
  ) {

    if (!value)
      return showManagerError(
        "Enter a folder name."
      );


    if (
      folders.includes(value)
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
      cuisines.includes(value)
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
      !confirm(
        `Delete the "${folder}" folder?`
      )
    )
      return;


    folders =
      folders.filter(
        item =>
          item !== folder
      );


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
                folders[0] ||
                "Unsorted"
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
          item !== cuisine
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


function showManagerError(
  message
) {

  managerError.textContent =
    "⚠️ " + message;

}


managerCancel.onclick = () => {

  manager.classList.add(
    "hidden"
  );

};


/* =========================================================
   HTML SAFETY
   ========================================================= */

function escapeHTML(value) {

  return String(value)

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
