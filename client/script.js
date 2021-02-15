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

var measurements = [
  "tsp", "Tbsp", "cup", "pint", "quart", "oz.", "pinch", "lb.", "cups", "pints", "quarts"
]

function getSectionDropdown(dropdownId){
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

function init(){
  socket.emit("getLists");
  var itemDropdown = document.getElementById("itemSectionDropdown");
  itemDropdown.innerHTML = getSectionDropdown("newItemSection");
}

socket.on("updateItemList", function(list){
  items = list;
  showItems();
});

socket.on("updateRecipeList", function(list){
  recipes = list;
  showRecipes();
});

socket.on("updateIngredientSections", function(map){
  ingredientSections = new Map(map);
});


function recipe(id, name, url, ingredients){
  this.id = id;
  this.name = name;
  this.url = url;
  this.ingredients = ingredients;
}


function item(id, name, quantity, section){
  this.id = id;
  this.name = name;
  this.section = section;
  this.quantity = quantity;
}

function showItems(){
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

function showRecipes(){
  var recipeTable = document.getElementById('recipeTable');
  recipeTable.innerHTML = "";
  
  // Set up a loop that goes through the items in listItems one at a time
  var numberOfListRecipes = recipes.length;
  var i;

  for (i = 0; i < numberOfListRecipes; ++i) {
      var itemRow = document.createElement('tr');

      var recipeCheckbox = document.createElement('td');
      var tempRecipe = new recipe(recipes[i].id, recipes[i].name, recipes[i].url, recipes[i].ingredients);
      recipeCheckbox.innerHTML = '<input type="checkbox" id="recipeBox' + recipes[i].id + '" onchange=\'recipeBoxChanged(' + JSON.stringify(tempRecipe) + ')\'/>';

      var itemData = document.createElement('td');

      // Add the item text
      //itemData.innerHTML = "<a href=\"" + recipes[i].url + "\">" + recipes[i].name + "</a>";
      itemData.innerHTML = recipes[i].name;

      itemRow.appendChild(recipeCheckbox)
      itemRow.appendChild(itemData);
      recipeTable.appendChild(itemRow);
  }
}

addNewItem.onclick = function(){
  var itemName = document.getElementById("newItem").value;
  if(itemName != ""){
    var alreadyExists = false;
    items.forEach(element => {
      if(element.name == itemName){
        alreadyExists = true;
        alert(element.name + " has already been added.");
      }
    });
    if(!alreadyExists){
      var itemSection = document.getElementById("newItemSection").value;
      document.getElementById("newItem").value = "";
      var newItem = new item(items.length, itemName, 1, itemSection)

      //Need to check the section because an ingredient from a recipe could have already added a section.
      if(ingredientSections.has(newItem.name)){
        if(ingredientSections.get(newItem.name) != newItem.section){
          //Update the section
          alert("Updating the section for " + newItem.name + ". Old Section: " + ingredientSections.get(newItem.name) + "; New section: " + newItem.section + ".");
          socket.emit("newIngredientSection", [newItem.name, newItem.section])
        }else{
          console.log("sections match for ingredient: " + newItem.name);
        }
      }else{
        ingredientSections.set(newItem.name, newItem.section);
        socket.emit("newIngredientSection", [newItem.name, newItem.section])
      }
      

      items.push(newItem)
      showItems()
      socket.emit("newItem", newItem);
    }
  }
}

addNewRecipe.onclick = function(){
  var recipeName = document.getElementById("newRecipeName").value;
  var recipeLink = document.getElementById("newRecipeLink").value;
  if(recipeName != ""){
    var allIng = document.getElementById("newRecipeIng").value;
    var allIngList = allIng.split("\n");
    var newIngredients = [];
    var ingId = 0;
    var recipeId = recipes.length;

    var hasUnknownSection = false;
    (allIngList).forEach(str => {
      var ing = str.trim();
      var sections = ing.split(" ");

      //Remove the last part of the string since it is the price (for budget bytes recipes)
      if(recipeLink.includes("budgetbytes.com")){
        sections.pop();
      }
      

      //values for ingredients 
      var quantity, ingName, section;
      //determine quantity
      if(measurements.includes(sections[1])){
        quantity = sections[0] + " " + sections[1];
        sections.shift();
        sections.shift();
      }else{
        quantity = sections[0];
        sections.shift();
      }

      ingName = sections.join(" ")
      
      section = getItemSection(ingName, recipeId, ingId);
      if(section == "Not Specified"){
        hasUnknownSection = true;
      }

      var newIng = new item(ingId, ingName, quantity, section);
      newIngredients.push(newIng);
      ingId++;
    });

    var newRec = new recipe(recipeId, recipeName, recipeLink, newIngredients);
    console.log(newRec)

    recipes.push(newRec)
    showRecipes()

    if(hasUnknownSection){
      modal.style.display = "block";
    }else{
      socket.emit("newRecipe", newRec);
    }

  }
}

function getItemSection(name, recipeId, ingId){
  if(ingredientSections.has(name)){
    return ingredientSections.get(name);
  }else{
    //This ingredent doesn't have a saved section. 
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

addSection.onclick = function(){
  //modal.style.display = "none";
  var tbl = document.getElementById("modal-table");

  var recipeId = -1;
  while(tbl.children[0] != undefined){
    var tr = tbl.children[0];
    console.log(tr);
    var tds = tr.children;
    console.log(tds);
    var idStrs = tds[1].id.split('-');
    recipeId = idStrs[0];
    var ingId = idStrs[1];

    var pickedSection = tds[1].firstChild.value;
    

    for(var i = 0; i < recipes.length; ++i){
      if(recipes[i].id == recipeId){
        for(var j = 0; j < recipes[i].ingredients.length; j++){
          if(recipes[i].ingredients[j].id == ingId){
            recipes[i].ingredients[j].section = pickedSection;
            //Save new section
            socket.emit("newIngredientSection", [recipes[i].ingredients[j].name, pickedSection])
          }
        }
      }
    }
    tbl.removeChild(tbl.children[0]);
  }

  for(var i = 0; i < recipes.length; ++i){
    if(recipes[i].id == recipeId){
      socket.emit("newRecipe", recipes[i]);
    }
  }

  console.log(recipes);
  //TODO: test this logic, add a way to send an update insead of re-adding the entire var. 
  modal.style.display = "none";
}