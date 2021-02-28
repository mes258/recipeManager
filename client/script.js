var itemListFile = document.getElementById("itemListFile");
var recipieListFile = document.getElementById("recipieListFile");
var addNewRecipe = document.getElementById("addNewRecipe");
var addNewItem = document.getElementById("addNewItem");
var modal = document.getElementById("myModal");
var tstbtn = document.getElementById("testButton");
var sectionPicker = document.getElementById("sectionPicker");
var addSection = document.getElementById("addSection");


var recipes = []
var items = []
var ingredientSections = new Map();
var itemSectionInfo = {};

var measurements = [
  "tsp", "Tbsp",
  "cup", "cups", "pint", "pints", "quart", "quarts", "gal", "gallon", "gallons",
  "oz.", "oz",
  "lb.", "lb",
  "kg.", "kg",
  "g.", "gram", "grams",
  "pinch", "pinches",
  "slice", "slices",
  "loaf", "loaves",
  "clove", "cloves",
  "bunch", "bunches",
  "handful", "handful"
]

function getSectionDropdown(dropdownId) {
  return '<select id="' + dropdownId + '"> \
    <option value="Dairy">Dairy</option>\
    <option value="Bakery">Bakery</option>\
    <option value="Dry Goods">Dry Goods</option>\
    <option value="Canned Goods">Canned Goods</option>\
    <option value="Condiments and Spices">Condiments and Spices</option>\
    <option value="Meat">Meat</option>\
    <option value="Beverages">Beverages</option>\
    <option value="Produce">Produce</option>\
    <option value="Frozen">Frozen</option>\
    <option value="Household Goods">Household Goods</option>\
    <option value="Health and Beauty">Health and Beauty</option>\
    <option value="Other">Other</option>\
  </select>';
}

init();

function init() {
  socket.emit("getLists");
  var itemDropdown = document.getElementById("itemSectionDropdown");
  itemDropdown.innerHTML = getSectionDropdown("newItemSection");

}

socket.on("updateItemList", function (list) {
  items = list;
  //itemSectionInfo = sortItemsBySections(items);
  showItems();
});

socket.on("updateRecipeList", function (list) {
  recipes = list;
  showRecipes();
});

socket.on("updateIngredientSections", function (map) {
  ingredientSections = new Map(map);
});


function recipe(id, name, url, ingredients) {
  this.id = id;
  this.name = name;
  this.url = url;
  this.ingredients = ingredients;
}


function item(id, name, quantity, section, measurement = "unit") {
  this.id = id;
  this.name = name;
  this.section = section;
  this.quantity = quantity;
  this.measurement = measurement;
}

function showItems() {
  var itemTable = document.getElementById('itemTable');
  itemTable.innerHTML = "";

  // Set up a loop that goes through the items in listItems one at a time
  var numberOfListItems = items.length;
  var i;

  for (i = 0; i < numberOfListItems; ++i) {
    var itemRow = document.createElement('tr');

    var itemCheckbox = document.createElement('td');
    var tempItem = new item(items[i].id, items[i].name, items[i].quantity, items[i].section);
    itemCheckbox.innerHTML = '<input type="checkbox" id="itemBox' + items[i].id + '" onchange=\'itemBoxChanged(' + JSON.stringify(tempItem) + ')\'/>';

    var itemData = document.createElement('td');

    // Add the item text
    itemData.innerHTML = items[i].name;

    itemRow.appendChild(itemCheckbox);
    itemRow.appendChild(itemData);
    itemTable.appendChild(itemRow);
  }
}

function showRecipes() {
  var recipeTable = document.getElementById('recipeTable');
  recipeTable.innerHTML = "";

  // Set up a loop that goes through the items in listItems one at a time
  var numberOfListRecipes = recipes.length;
  var i;

  for (i = 0; i < numberOfListRecipes; ++i) {
    var itemRow = document.createElement('tr');

    var recipeCheckbox = document.createElement('td');

    //One time update: 
    for (var j = 0; j < recipes[i].ingredients.length; j++) {
      if (recipes[i].ingredients[j].measurement == undefined) {
        console.log(recipes[i].ingredients[j])
      }
    }


    var tempRecipe = new recipe(recipes[i].id, recipes[i].name, recipes[i].url, recipes[i].ingredients);
    recipeCheckbox.innerHTML = '<input type="checkbox" id="recipeBox' + recipes[i].id + '" onchange=\'recipeBoxChanged(' + JSON.stringify(tempRecipe) + ')\'/>';

    var itemData = document.createElement('td');

    // Add the item text
    itemData.innerHTML = "<a href=\"" + recipes[i].url + "\" target=\"_blank\">" + recipes[i].name + "</a>";

    itemRow.appendChild(recipeCheckbox)
    itemRow.appendChild(itemData);
    recipeTable.appendChild(itemRow);
  }
}

addNewItem.onclick = function () {
  var itemName = document.getElementById("newItem").value;
  if (itemName != "") {
    var alreadyExists = false;
    items.forEach(element => {
      if (element.name == itemName) {
        alreadyExists = true;
        alert(element.name + " has already been added.");
      }
    });
    if (!alreadyExists) {
      var itemSection = document.getElementById("newItemSection").value;
      document.getElementById("newItem").value = "";
      var newItem = new item(items.length, itemName, 1, itemSection)

      //Need to check the section because an ingredient from a recipe could have already added a section.
      if (ingredientSections.has(newItem.name)) {
        if (ingredientSections.get(newItem.name) != newItem.section) {
          //Update the section
          alert("Updating the section for " + newItem.name + ". Old Section: " + ingredientSections.get(newItem.name) + "; New section: " + newItem.section + ".");
          socket.emit("newIngredientSection", [newItem.name, newItem.section])
        } else {
          console.log("sections match for ingredient: " + newItem.name);
        }
      } else {
        ingredientSections.set(newItem.name, newItem.section);
        socket.emit("newIngredientSection", [newItem.name, newItem.section])
      }


      items.push(newItem)
      showItems()
      socket.emit("newItem", newItem);
    }
  }
}

var blackPepperNames = ["Freshly cracked black pepper", "freshly cracked black pepper", "freshly cracked pepper", "Freshly cracked pepper", "salt & pepper", "salt and pepper"];

addNewRecipe.onclick = function () {
  var recipeName = document.getElementById("newRecipeName").value;
  var recipeLink = document.getElementById("newRecipeLink").value;
  if (recipeName != "") {
    var allIng = document.getElementById("newRecipeIng").value;
    var allIngList = allIng.split("\n");
    var newIngredients = [];
    var ingId = 0;
    var recipeId = recipes.length;

    var hasUnknownSection = false;
    for (var i = 0; i < allIngList.length; i++) {
      var str = allIngList[i];
      var ing = str.trim();
      //check for casual mentions of salt and pepper
      if (ing.includes("pepper") && !(ing.charAt[0] <= '9' && ing.charAt[0] >= '0')) {
        if (ing.includes("salt")) {
          console.log("salt")
          allIngList.push("1 pinch salt (0.02)");
        }
        blackPepperNames.forEach(name => {
          if (ing.includes(name)) {
            ing = "1 pinch fresh black pepper (0.05)";
          }
        });
      }
      var sections = ing.split(" ");

      //Remove the last part of the string since it is the price (for budget bytes recipes)
      if (recipeLink.includes("budgetbytes.com")) {
        sections.pop();
      }


      //values for ingredients 
      var quantity, measurement, ingName, section;

      var recipeQuantity = sections[0];
      //determine quantity
      if (measurements.includes(sections[1])) {
        //eg: 3 tsp butter
        quantity = parseValue(recipeQuantity);
        measurement = sections[1];
        sections.shift();
        sections.shift();
      } else {
        //eg: 3 red onions
        quantity = parseValue(recipeQuantity);
        measurement = "unit";
        sections.shift();
      }

      ingName = sections.join(" ")

      while (quantity == -1) {
        quantity = parseValue(prompt(" We are having trouble determining the quantity of " + ingName + ". \n The quantity from the recipe is: " + recipeQuantity + ". \n Please enter the numeric quantity below: ", "1"));
      }

      section = getItemSection(ingName, recipeId, ingId);
      if (section == "Not Specified") {
        hasUnknownSection = true;
      }

      var newIng = new item(ingId, ingName, quantity, section, measurement);
      newIngredients.push(newIng);
      ingId++;
    }

    var newRec = new recipe(recipeId, recipeName, recipeLink, newIngredients);

    recipes.push(newRec)
    showRecipes()

    if (hasUnknownSection) {
      modal.style.display = "block";
    } else {
      socket.emit("newRecipe", newRec);
    }

  }
}

function getItemSection(name, recipeId, ingId) {
  if (ingredientSections.has(name)) {
    return ingredientSections.get(name);
  } else {
    //This ingredent doesn't have a saved section so add it to the model that shows after all ingredients are processed.
    var model_table = document.getElementById("modal-table");
    var model_table_row = document.createElement('tr');

    var ingName = document.createElement('td');
    ingName.innerHTML = name;
    var ingSecPicker = document.createElement('td');
    //TODO: store the dropdown as a const and use same list everywhere
    ingSecPicker.innerHTML = getSectionDropdown("sectionPicker" + recipeId + "-" + ingId);

    ingSecPicker.id = recipeId + "-" + ingId;

    model_table_row.appendChild(ingName);
    model_table_row.appendChild(ingSecPicker);

    model_table.appendChild(model_table_row)

    return "Not Specified";
  }

}

addSection.onclick = function () {
  //modal.style.display = "none";
  var tbl = document.getElementById("modal-table");

  var recipeId = -1;
  while (tbl.children[0] != undefined) {
    var tr = tbl.children[0];
    console.log(tr);
    var tds = tr.children;
    console.log(tds);
    var idStrs = tds[1].id.split('-');
    recipeId = idStrs[0];
    var ingId = idStrs[1];

    var pickedSection = tds[1].firstChild.value;


    for (var i = 0; i < recipes.length; ++i) {
      if (recipes[i].id == recipeId) {
        for (var j = 0; j < recipes[i].ingredients.length; j++) {
          if (recipes[i].ingredients[j].id == ingId) {
            recipes[i].ingredients[j].section = pickedSection;
            //Save new section
            socket.emit("newIngredientSection", [recipes[i].ingredients[j].name, pickedSection])
            ingredientSections.set(recipes[i].ingredients[j].name, pickedSection);
          }
        }
      }
    }
    tbl.removeChild(tbl.children[0]);
  }

  for (var i = 0; i < recipes.length; ++i) {
    if (recipes[i].id == recipeId) {
      socket.emit("newRecipe", recipes[i]);
    }
  }

  console.log(recipes);
  //TODO: test this logic, add a way to send an update insead of re-adding the entire var. 
  modal.style.display = "none";
}

//Util functions: 
//Convert from "1/2" or "7/8" to 0.5 and 0.875, etc
function parseValue(strVal) {
  if (strVal == null || strVal == undefined) {
    return -1;
  }
  if (strVal.includes("/")) {
    var fractionVals = strVal.split("/");
    var val = parseFloat(fractionVals[0]) / parseFloat(fractionVals[1]);
    return val;
  }
  var parsedFloat = parseFloat(strVal);
  if (isNaN(parsedFloat)) {
    return -1;
  } else {
    return parsedFloat;
  }
}


//Not in use right now. 
function sortItemsBySections(ingList) {
  //TODO: format by sections, combine ingredients
  //first sort by sections: 
  var sortedBySection = {};
  sections = [];
  for (var i = 0; i < ingList.length; ++i) {
    var ing = ingList[i];
    if (sortedBySection[ing.section] != undefined) {
      sortedBySection[ing.section].push(ing);
    } else {
      sortedBySection[ing.section] = [];
      sortedBySection[ing.section].push(ing);
      sections.push(ing.section);
    }
  }
  console.log(sortedBySection);
  console.log(sections)
  return { "sortedBySection": sortedBySection, "sections": sections };
}
