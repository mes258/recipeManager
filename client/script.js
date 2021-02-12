var itemListFile = document.getElementById("itemListFile"); 
var recipieListFile = document.getElementById("recipieListFile"); 
var addNewRecipe = document.getElementById("addNewRecipe");
var addNewItem = document.getElementById("addNewItem");

var recipes = []
var items = []

var measurements = [
  "tsp", "Tbsp", "cup", "pint", "quart", "oz."
]

init();

function init(){
  socket.emit("getLists");
}

socket.on("updateItemList", function(list){
  items = list;
  console.log(items);
  showItems();
});

socket.on("updateRecipeList", function(list){
  recipes = list;
  showRecipes();
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
    var itemSection = document.getElementById("newItemSection").value;
    document.getElementById("newItem").value = "";
    var newItem = new item(items.length, itemName, 1, itemSection)
    
    items.push(newItem)
    showItems()
    socket.emit("newItem", newItem);
  }
}

addNewRecipe.onclick = function(){
  var recipeName = document.getElementById("newRecipeName").value;
  var recipeLink = document.getElementById("newRecipeLink").value;
  if(recipeName != ""){
    var allIng = document.getElementById("newRecipeIng").value;
    var allIngList = allIng.split("\n");
    var newIngredients = [];
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

      section = getItemSelection(ingName);

      var newIng = new item(-1, ingName, quantity, section);
      newIngredients.push(newIng);
    });

    var newRec = new recipe(recipes.length, recipeName, recipeLink, newIngredients);
    console.log(newRec)

    recipes.push(newRec)
    showRecipes()
    socket.emit("newRecipe", newRec);

  }
}

function getItemSelection(name){
  return "Other";
}