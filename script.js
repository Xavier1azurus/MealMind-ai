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
  JSON.stringify([
    "General"
  ])
);

let editingRecipeId = null;

let pendingImage = null;
let ownerScanning = false;

let selectedFolder = null;


/* =========================
   ELEMENTS
========================= */

const scanBtn =
  document.getElementById("scanBtn");

const recipeImage =
  document.getElementById("recipeImage");

const recipeText =
  document.getElementById("recipeText");

const scanStatus =
  document.getElementById("scanStatus");

const saveMainRecipe =
  document.getElementById("saveMainRecipe");

const photoCheck =
  document.getElementById("photoCheck");

const usePhoto =
  document.getElementById("usePhoto");

const retakePhoto =
  document.getElementById("retakePhoto");

const reviewBox =
  document.getElementById("reviewBox");

const reviewText =
  document.getElementById("reviewText");

const acceptRecipe =
  document.getElementById("acceptRecipe");

const reviewRetake =
  document.getElementById("reviewRetake");

const ownerLogin =
  document.getElementById("ownerLogin");

const ownerPassword =
  document.getElementById("ownerPassword");

const ownerLoginBtn =
  document.getElementById("ownerLoginBtn");

const ownerError =
  document.getElementById("ownerError");

const ownerPanel =
  document.getElementById("ownerPanel");

const exitOwner =
  document.getElementById("exitOwner");

const ownerScan =
  document.getElementById("ownerScan");

const ownerImage =
  document.getElementById("ownerImage");

const addRecipe =
  document.getElementById("addRecipe");

const addFolder =
  document.getElementById("addFolder");

const deleteFolder =
  document.getElementById("deleteFolder");

const addCuisine =
  document.getElementById("addCuisine");

const deleteCuisine =
  document.getElementById("deleteCuisine");

const editRecipe =
  document.getElementById("editRecipe");

const deleteRecipe =
  document.getElementById("deleteRecipe");

const foldersElement =
  document.getElementById("folders");

const recipesElement =
  document.getElementById("recipes");

const currentFolder =
  document.getElementById("currentFolder");

const allRecipes =
  document.getElementById("allRecipes");

const editor =
  document.getElementById("editor");

const editorTitle =
  document.getElementById("editorTitle");

const recipeTitle =
  document.getElementById("recipeTitle");

const recipeCuisine =
  document.getElementById("recipeCuisine");

const recipeFolder =
  document.getElementById("recipeFolder");

const ingredients =
  document.getElementById("ingredients");

const instructions =
  document.getElementById("instructions");

const editorError =
  document.getElementById("editorError");

const saveEditor =
  document.getElementById("saveEditor");

const cancelEditor =
  document.getElementById("cancelEditor");

const recipeView =
  document.getElementById("recipeView");

const closeRecipe =
  document.getElementById("closeRecipe");

const viewTitle =
  document.getElementById("viewTitle");

const viewCategory =
  document.getElementById("viewCategory");

const viewIngredients =
  document.getElementById("viewIngredients");

const viewInstructions =
  document.getElementById("viewInstructions");

const manager =
  document.getElementById("manager");

const managerTitle =
  document.getElementById("managerTitle");

const managerDescription =
  document.getElementById("managerDescription");

const managerInput =
  document.getElementById("managerInput");

const managerSelect =
  document.getElementById("managerSelect");

const managerError =
  document.getElementById("managerError");

const managerConfirm =
  document.getElementById("managerConfirm");

const managerCancel =
  document.getElementById("managerCancel");

let managerMode = "";


/* =========================
   SAVE DATA
========================= */

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


/* =========================
   MAIN SCANNER
========================= */

scanBtn.onclick = () => {

  recipeImage.value = "";

  recipeImage.click();

};


recipeImage.onchange = () => {

  if (!recipeImage.files.length)
    return;

  pendingImage =
    recipeImage.files[0];

  ownerScanning = false;

  photoCheck.classList.remove("hidden");

};


retakePhoto.onclick = () => {

  photoCheck.classList.add("hidden");

  if (ownerScanning)
    ownerImage.click();
  else
    recipeImage.click();

};


usePhoto.onclick = async () => {

  photoCheck.classList.add("hidden");

  await scanImage();

};


async function scanImage() {

  if (!pendingImage)
    return;

  scanStatus.textContent =
    "🔍 Reading recipe...";

  try {

    const result =
      await Tesseract.recognize(
        pendingImage,
        "eng",
        {
          logger: data => {

            if (
              data.status ===
              "recognizing text"
            ) {

              scanStatus.textContent =
                "🔍 Reading recipe " +
                Math.round(
                  data.progress * 100
                ) +
                "%";

            }

          }
        }
      );

    const cleaned =
      cleanText(result.data.text);

    if (!cleaned) {

      scanStatus.textContent =
        "❌ No recipe text found.";

      return;

    }

    reviewText.value =
      formatRecipe(cleaned);

    reviewBox.classList.remove(
      "hidden"
    );

  } catch (error) {

    console.error(error);

    scanStatus.textContent =
      "❌ Couldn't read the photo. Try a clearer photo.";

  }

}


/* =========================
   CLEAN OCR
========================= */

function cleanText(text) {

  return text

    .replace(
      /[\u0000-\u001F\u007F]/g,
      ""
    )

    .replace(
      /[░▒▓█■□]+/g,
      ""
    )

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
    )

    .split("\n")

    .map(
      line =>
        line
          .replace(/\s+/g, " ")
          .trim()
    )

    .filter(Boolean)

    .join("\n")

    .trim();

}


/* =========================
   FORMAT RECIPE
========================= */

function formatRecipe(text) {

  const lines =
    text
      .split("\n")
      .map(x => x.trim())
      .filter(Boolean);

  if (!lines.length)
    return "";

  let title =
    lines[0];

  let ingredientStart = -1;
  let instructionStart = -1;

  lines.forEach(
    (line, index) => {

      const lower =
        line.toLowerCase();

      if (
        ingredientStart === -1 &&
        lower.includes("ingredient")
      ) {

        ingredientStart =
          index;

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

        instructionStart =
          index;

      }

    }
  );


  const ingredientList = [];
  const instructionList = [];


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

      let line =
        lines[i]
          .replace(
            /^[-•●]\s*/,
            ""
          )
          .replace(
            /^\d+[.)]\s*/,
            ""
          );

      if (line)
        ingredientList.push(line);

    }

  }


  if (instructionStart !== -1) {

    for (
      let i = instructionStart + 1;
      i < lines.length;
      i++
    ) {

      let line =
        lines[i]
          .replace(
            /^\d+[.)]\s*/,
            ""
          )
          .replace(
            /^[-•●]\s*/,
            ""
          );

      if (line)
        instructionList.push(line);

    }

  }


  return [

    "🍴 " + title,

    "",

    "🥕 INGREDIENTS",

    ...(ingredientList.length
      ? ingredientList.map(
          x => "• " + x
        )
      : [
          "• Add ingredients here"
        ]),

    "",

    "👨‍🍳 INSTRUCTIONS",

    ...(instructionList.length
      ? instructionList.map(
          (x, i) =>
            `${i + 1}. ${x}`
        )
      : [
          "1. Add instructions here"
        ])

  ].join("\n");

}


/* =========================
   ACCEPT SCAN
========================= */

acceptRecipe.onclick = () => {

  const text =
    reviewText.value.trim();

  if (!text)
    return;

  reviewBox.classList.add(
    "hidden"
  );

  recipeText.value = text;

  if (ownerScanning) {

    openEditorFromScan(text);

  } else {

    scanStatus.textContent =
      "✅ Recipe cleaned. Review it and press Save Recipe.";

  }

};


reviewRetake.onclick = () => {

  reviewBox.classList.add(
    "hidden"
  );

  if (ownerScanning)
    ownerImage.click();
  else
    recipeImage.click();

};


/* =========================
   SAVE MAIN RECIPE
========================= */

saveMainRecipe.onclick = () => {

  const text =
    recipeText.value.trim();

  if (!text) {

    scanStatus.textContent =
      "❌ Scan a recipe first.";

    return;

  }

  const parsed =
    parseRecipe(text);

  if (!parsed.title) {

    scanStatus.textContent =
      "❌ Recipe title is required.";

    return;

  }

  recipes.push({

    id: Date.now(),

    title: parsed.title,

    cuisine: "General",

    folder:
      folders[0],

    ingredients:
      parsed.ingredients,

    instructions:
      parsed.instructions

  });

  saveData();

  recipeText.value = "";

  scanStatus.textContent =
    "✅ Recipe saved!";

};


/* =========================
   OWNER CODE
========================= */

let codeBuffer = "";


recipeText.addEventListener(
  "keydown",
  event => {

    if (
      event.key >= "0" &&
      event.key <= "9"
    ) {

      codeBuffer += event.key;

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


/* =========================
   OWNER LOGIN
========================= */

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


exitOwner.onclick = () => {

  ownerPanel.classList.add(
    "hidden"
  );

};


/* =========================
   OWNER SCANNER
========================= */

ownerScan.onclick = () => {

  ownerImage.value = "";

  ownerImage.click();

};


ownerImage.onchange = () => {

  if (!ownerImage.files.length)
    return;

  pendingImage =
    ownerImage.files[0];

  ownerScanning = true;

  photoCheck.classList.remove(
    "hidden"
  );

};


/* =========================
   PARSE RECIPE
========================= */

function parseRecipe(text) {

  const lines =
    text
      .split("\n")
      .map(x => x.trim())
      .filter(Boolean);

  let title =
    lines[0]
      ?.replace(/^🍴\s*/, "")
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
      lower.includes("ingredients")
    ) {

      section = "ingredients";
      continue;

    }


    if (
      lower.includes("instructions") ||
      lower.includes("directions") ||
      lower === "method" ||
      lower === "steps"
    ) {

      section = "instructions";
      continue;

    }


    if (
      section === "ingredients"
    ) {

      const value =
        line
          .replace(
            /^•\s*/,
            ""
          )
          .replace(
            /^\d+[.)]\s*/,
            ""
          )
          .trim();

      if (value)
        ingredients.push(value);

    }


    if (
      section === "instructions"
    ) {

      const value =
        line
          .replace(
            /^\d+[.)]\s*/,
            ""
          )
          .trim();

      if (value)
        instructions.push(value);

    }

  }


  return {

    title,

    ingredients,

    instructions

  };

}


/* =========================
   OWNER RENDER
========================= */

function renderEverything() {

  renderFolders();

  renderRecipes();

  fillEditorSelects();

}


/* =========================
   FOLDERS
========================= */

function renderFolders() {

  foldersElement.innerHTML = "";

  folders.forEach(folder => {

    const count =
      recipes.filter(
        recipe =>
          recipe.folder === folder
      ).length;

    const button =
      document.createElement(
        "button"
      );

    button.className =
      "folder";

    button.innerHTML = `
      <strong>📁 ${escapeHTML(folder)}</strong>
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

  });

}


/* =========================
   RECIPES
========================= */

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


  list.forEach(recipe => {

    const card =
      document.createElement(
        "div"
      );

    card.className =
      "recipe";


    card.innerHTML = `
      <h4>
        ${escapeHTML(recipe.title)}
      </h4>

      <p>
        ${escapeHTML(recipe.cuisine)}
        •
        ${escapeHTML(recipe.folder)}
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
            r => r.id !== recipe.id
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

  });

}


allRecipes.onclick = () => {

  selectedFolder = null;

  currentFolder.textContent =
    "📖 All Recipes";

  renderRecipes();

};


/* =========================
   RECIPE VIEW
========================= */

function showRecipe(recipe) {

  viewTitle.textContent =
    recipe.title;

  viewCategory.textContent =
    `${recipe.cuisine} • ${recipe.folder}`;

  viewIngredients.innerHTML = "";

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
        (x, i) =>
          `${i + 1}. ${x}`
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


/* =========================
   ADD / EDIT RECIPE
========================= */

addRecipe.onclick = () => {

  openEditor();

};


editRecipe.onclick = () => {

  if (!recipes.length) {

    alert("There are no recipes yet.");

    return;

  }

  const number =
    prompt(
      recipes
        .map(
          (r, i) =>
            `${i + 1}. ${r.title}`
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


function openEditor(recipe = null) {

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


function openEditorFromScan(text) {

  const parsed =
    parseRecipe(text);

  openEditor({

    title:
      parsed.title,

    cuisine:
      "General",

    folder:
      folders[0],

    ingredients:
      parsed.ingredients,

    instructions:
      parsed.instructions

  });

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


  /* TITLE IS MANDATORY */

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
        .map(x => x.trim())
        .filter(Boolean),

    instructions:
      instructions.value
        .split("\n")
        .map(x => x.trim())
        .filter(Boolean)

  };


  const index =
    recipes.findIndex(
      r =>
        r.id ===
        editingRecipeId
    );


  if (index === -1) {

    recipes.push(recipe);

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


/* =========================
   DELETE RECIPE
========================= */

deleteRecipe.onclick = () => {

  if (!recipes.length) {

    alert("There are no recipes.");

    return;

  }


  const list =
    recipes
      .map(
        (r, i) =>
          `${i + 1}. ${r.title}`
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


/* =========================
   FOLDERS
========================= */

addFolder.onclick = () => {

  openManager(
    "addFolder"
  );

};


deleteFolder.onclick = () => {

  openManager(
    "deleteFolder"
  );

};


/* =========================
   CUISINES
========================= */

addCuisine.onclick = () => {

  openManager(
    "addCuisine"
  );

};


deleteCuisine.onclick = () => {

  openManager(
    "deleteCuisine"
  );

};


/* =========================
   MANAGER
========================= */

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
      "Recipes inside the folder will NOT be deleted.";

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
      "Recipes using this cuisine will be changed to General.";

    populateManagerSelect(
      cuisines.filter(
        x =>
          x !== "General"
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

    folders.push(value);

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

    cuisines.push(value);

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
        f =>
          f !== folder
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
        c =>
          c !== cuisine
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


/* =========================
   SECURITY / DISPLAY
========================= */

function escapeHTML(
  value
) {

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


/* =========================
   START
========================= */

renderEverything();
