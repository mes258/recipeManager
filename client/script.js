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
  "tsp", "Tbsp", "cup", "pint", "quart", "oz."
]

init();

function init(){
  socket.emit("getLists");
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
          socket.emit("newIngredientSection", [[newItem.name, newItem.section]])
        }else{
          console.log("sections match for ingredient: " + newItem.name);
        }
      }else{
        ingredientSections.set(newItem.name, newItem.section);
        socket.emit("newIngredientSection", [[newItem.name, newItem.section]])
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
    (allIngList).forEach(str => {
      var ing = str.trim();
      var sections = ing.split(" ");
      sections.pop();

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
      recipeId = recipes.length;
      section = getItemSection(ingName, recipeId, ingId);

      var newIng = new item(ingId, ingName, quantity, section);
      newIngredients.push(newIng);
      ingId++;
    });

    var newRec = new recipe(recipeId, recipeName, recipeLink, newIngredients);
    console.log(newRec)

    recipes.push(newRec)
    showRecipes()
    socket.emit("newRecipe", newRec);

  }
}

tstbtn.onclick = function(){
  var sec = getItemSection("test1");
  console.log(sec);
}

var newSection = "INVALID"
function getItemSection(name, recipeId, ingId){
  if(ingredientSections.has(name)){
    return ingredientSections.get(name);
  }else{
    var model_table = document.getElementById("modal-table");
    var model_table_row = document.createElement('tr');

    var ingName = document.createElement('td');
    ingName.innerHTML = name;
    var ingSecPicker = document.createElement('td');
    //TODO: store the dropdown as a const and use same list everywhere
    ingSecPicker.innerHTML = '<select id="sectionPicker'+ recipeId + '-' + ingId + '"> \
          <option value="Dairy">Dairy</option>\
          <option value="Bakery">Bakery</option>\
          <option value="Dry Goods">Dry Goods</option>\
          <option value="Canned Goods">Canned Goods</option>\
          <option value="Meat">Meat</option>\
          <option value="Beverages">Beverages</option>\
          <option value="Produce">Produce</option>\
          <option value="Frozen">Frozen</option>\
          <option value="Household Goods">Household Goods</option>\
          <option value="Health and Beauty">Health and Beauty</option>\
          <option value="Other">Other</option>\
        </select>';
    
    ingSecPicker.id = recipeId + "-" + ingId;
    //modal.style.display = "block";

    model_table_row.appendChild(ingName);
    model_table_row.appendChild(ingSecPicker);

    model_table.appendChild(model_table_row)

    return "Not Specified";
  }

}

addSection.onclick = function(){
  //modal.style.display = "none";
  var tbl = document.getElementById(model_table);
  while(tbl.hasChildNodes){
    var tr = tbl.firstChild();
    var tds = tr.children;
    var name = tds[0].value;
    var idStrs = tds[1].id.split('-');
    var recipeId = idStrs[0];
    var ingId = idStrs[0];

    var pickedSection = tds[1].firstChild.value;

    for(var i = 0; i < recipes.length; ++i){
      if(recipes[i].id == recipeId){
        for(var j = 0; j < recipes[i].ingredients.length; j++){
          recipes[i].ingredients[j].section = pickedSection;
        }
      }
    }//TODO: test this logic, add a way to send an update insead of re-adding the entire var. 

  }
  newSection = sectionName;
  modal.style.display = "none";
}