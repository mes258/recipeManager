var itemListFile = document.getElementById("itemListFile");
var recipieListFile = document.getElementById("recipieListFile");
var addNewRecipe = document.getElementById("addNewRecipe");
var addNewItem = document.getElementById("addNewItem");
var addNewAssumedIng = document.getElementById("showAssumedIngModal");
var newRecipeIngModal = document.getElementById("newRecipeIngsModal");
var assumedIngModal = document.getElementById("assumedIngModal");
var tstbtn = document.getElementById("testButton");
var sectionPicker = document.getElementById("sectionPicker");
var addSection = document.getElementById("addSection");
var addAssumedIngs = document.getElementById("addAssumedIngs");


var recipes = []
var items = []
var ingredientSections = new Map();
var itemSectionInfo = {};
var assumedIngredients = {};

var measurements = [
  "tsp", "Tbsp", "teaspoons", "teaspoon", "tablespoons", "tablespoon", "tbs", "TBS",
  "cup", "cups", "pint", "pints", "quart", "quarts", "gal", "gallon", "gallons",
  "oz.", "oz",
  "lb.", "lb", "lbs.", "lbs",
  "kg.", "kg",
  "g.", "gram", "grams",
  "pinch", "pinches",
  "slice", "slices",
  "loaf", "loaves",
  "clove", "cloves",
  "bunch", "bunches",
  "handful", "handful",
  "box", "boxes"
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
  //var itemDropdown = document.getElementById("itemSectionDropdown");
  //itemDropdown.innerHTML = getSectionDropdown("newItemSection");

}

socket.on("updateItemList", function (list) {
  items = list;
  //itemSectionInfo = sortItemsBySections(items);
  //showItems();
});

socket.on("updateRecipeList", function (list) {
  recipes = list;
  var numberOfListRecipes = recipes.length;
  var i;
  for (i = 0; i < numberOfListRecipes; ++i) {
    if (!recipes[i].hasOwnProperty('type')) {
      recipes[i].type = "Dinner";
    }
    if (!recipes[i].hasOwnProperty('myaRating')) {
      recipes[i].myaRating = 0;
    }
    if (!recipes[i].hasOwnProperty('michaelRating')) {
      recipes[i].michaelRating = 0;
    }
    if (!recipes[i].hasOwnProperty('notes')) {
      recipes[i].notes = "";
    }
  }
  showRecipes();
});

socket.on("updateIngredientSections", function (map) {
  ingredientSections = new Map(map);
});

// socket.on("updateAssumedIngredients", function (list) {
//   assumedIngredients = list;

//   var tbl = document.getElementById("assumedIngModalTable");
//   assumedIngredients.forEach(ing => {
//     var model_table_row = document.createElement('tr');
//     var ingName = document.createElement('td');
//     //var deleteButton = document.createElement('td');

//     ingName.innerHTML = ing.name;

//     //deleteButton.innerHTML = "<button id='deleteAssumedIng' onClick='deleteAssumedIngs(" + ing.id + ")'>Remove from List</button>"

//     model_table_row.appendChild(ingName);
//     //model_table_row.appendChild(deleteButton);
//     tbl.appendChild(model_table_row);
//   });
//   updateExportButtons();
// });

// function updateExportButtons() {
//   var buttonDiv = document.getElementById("downloadButtons");
//   while (buttonDiv.children[0] != undefined) {
//     buttonDiv.removeChild(buttonDiv.children[0])
//   }
//   var btn1 = document.createElement("div");
//   console.log(JSON.stringify(assumedIngredients))
//   btn1.innerHTML = '<button id="listTxt" onclick=\'downloadList("txt", ' + JSON.stringify(assumedIngredients) + ')\'>Download List as .txt</button>';

//   var btn2 = document.createElement("div");
//   btn2.innerHTML = '<button id="listMd" onclick=\'downloadList("md", ' + JSON.stringify(assumedIngredients) + ')\'>Download List as .md</button>';

//   buttonDiv.appendChild(btn1);
//   buttonDiv.appendChild(btn2);

// }

function recipe(id, name, url, type, myaRating, michaelRating, notes, ingredients) {
  this.id = id;
  this.name = name;
  this.url = url;
  this.type = type;
  this.myaRating = myaRating;
  this.michaelRating = michaelRating;
  this.notes = notes;
  this.ingredients = ingredients;
}


function item(id, name, quantity, section, measurement = "unit") {
  this.id = id;
  this.name = name;
  this.section = section;
  this.quantity = quantity;
  this.measurement = measurement;
}

// function showItems() {
//   var itemTable = document.getElementById('itemTable');
//   itemTable.innerHTML = "";

//   // Set up a loop that goes through the items in listItems one at a time
//   var numberOfListItems = items.length;
//   var i;

//   for (i = 0; i < numberOfListItems; ++i) {
//     var itemRow = document.createElement('tr');

//     var itemCheckbox = document.createElement('td');
//     var tempItem = new item(items[i].id, items[i].name, items[i].quantity, items[i].section);
//     itemCheckbox.innerHTML = '<input type="checkbox" id="itemBox' + items[i].id + '" onchange=\'itemBoxChanged(' + JSON.stringify(tempItem) + ')\'/>';

//     var itemData = document.createElement('td');

//     // Add the item text
//     itemData.innerHTML = items[i].name;

//     itemRow.appendChild(itemCheckbox);
//     itemRow.appendChild(itemData);
//     itemTable.appendChild(itemRow);
//   }
// }

function showRecipes() {
  var recipeTable = document.getElementById('recipeTableList');
  recipeTable.innerHTML = "";

  // Set up a loop that goes through the items in listItems one at a time
  var numberOfListRecipes = recipes.length;
  var i;

  for (i = 0; i < numberOfListRecipes; ++i) {
    var itemRow = document.createElement('tr');

    // Remove the checkbox for now. Will bring it back when full ingredient list aggregation is supported
    // var recipeCheckbox = document.createElement('td');

    //One time update: 
    // for (var j = 0; j < recipes[i].ingredients.length; j++) {
    //   if (recipes[i].ingredients[j].measurement == undefined) {
    //     console.log(recipes[i].ingredients[j])
    //   }
    // }

    //var tempRecipe = new recipe(recipes[i].id, recipes[i].name, recipes[i].url, recipes[i].ingredients);
    //recipeCheckbox.innerHTML = '<input type="checkbox" id="recipeBox' + recipes[i].id + '" onchange=\'recipeBoxChanged(' + JSON.stringify(tempRecipe) + ')\'/>';

    //Populate the table
    var nameData = document.createElement('td');
    nameData.innerHTML = "<a href=\"" + recipes[i].url + "\" target=\"_blank\">" + recipes[i].name + "</a>";

    var typeData = document.createElement('td');
    typeData.innerHTML = recipes[i].type;

    var myaData = document.createElement('td');
    myaData.innerHTML = recipes[i].myaRating;

    var michaelData = document.createElement('td');
    michaelData.innerHTML = recipes[i].michaelRating;

    var notesData = document.createElement('td');
    notesData.innerHTML = recipes[i].notes;


    //itemRow.appendChild(recipeCheckbox)
    itemRow.appendChild(nameData);
    itemRow.appendChild(typeData);
    itemRow.appendChild(myaData);
    itemRow.appendChild(michaelData);
    itemRow.appendChild(notesData);

    recipeTable.appendChild(itemRow);
  }
}

// addNewItem.onclick = function () {
//   var itemName = document.getElementById("newItem").value;
//   if (itemName != "") {
//     var alreadyExists = false;
//     items.forEach(element => {
//       if (element.name == itemName) {
//         alreadyExists = true;
//         alert(element.name + " has already been added.");
//       }
//     });
//     if (!alreadyExists) {
//       var itemSection = document.getElementById("newItemSection").value;
//       document.getElementById("newItem").value = "";
//       var newItem = new item(items.length, itemName, 1, itemSection)

//       //Need to check the section because an ingredient from a recipe could have already added a section.
//       if (ingredientSections.has(newItem.name)) {
//         if (ingredientSections.get(newItem.name) != newItem.section) {
//           //Update the section
//           alert("Updating the section for " + newItem.name + ". Old Section: " + ingredientSections.get(newItem.name) + "; New section: " + newItem.section + ".");
//           socket.emit("newIngredientSection", [newItem.name, newItem.section])
//         } else {
//           console.log("sections match for ingredient: " + newItem.name);
//         }
//       } else {
//         ingredientSections.set(newItem.name, newItem.section);
//         socket.emit("newIngredientSection", [newItem.name, newItem.section])
//       }


//       items.push(newItem)
//       showItems()
//       socket.emit("newItem", newItem);
//     }
//   }
// }

var blackPepperNames = ["Freshly cracked black pepper", "freshly cracked black pepper", "freshly cracked pepper", "Freshly cracked pepper", "salt & pepper", "salt and pepper"];

addNewRecipe.onclick = function () {
  var recipeName = document.getElementById("newRecipeName").value;
  var recipeLink = document.getElementById("newRecipeLink").value;
  var recipeType = document.getElementById("newRecipeType").value;
  var myaRating = document.getElementById("newRecipeMya").value;
  var michaelRating = document.getElementById("newRecipeMichael").value;
  var notes = document.getElementById("newRecipeNotes").value;
  if (recipeName != "") {
    var allIng = document.getElementById("newRecipeIng").value;
    var allIngList = allIng.split("\n");
    var newIngredients = [];
    var ingId = 0;
    var recipeId = recipes.length;

    var hasUnknownSection = false;
    for (var i = 0; i < allIngList.length; i++) {
      var str = allIngList[i];
      str = str.replace("*", "");
      var ing = str.trim();
      //check for casual mentions of salt and pepper
      if (ing.toLowerCase().includes("pepper") && !(ing.charAt[0] <= '9' && ing.charAt[0] >= '0')) {
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

    var newRec = new recipe(recipeId, recipeName, recipeLink, recipeType, myaRating, michaelRating, notes, newIngredients);

    recipes.push(newRec)
    showRecipes()

    if (hasUnknownSection) {
      newRecipeIngModal.style.display = "block";
    } else {
      socket.emit("newRecipe", newRec);
    }

  }

  document.getElementById("newRecipeName").value = "";
  document.getElementById("newRecipeLink").value = "";
  document.getElementById("newRecipeIng").value = "";
  document.getElementById("newRecipeMya").value = "";
  document.getElementById("newRecipeMichael").value = "";
  document.getElementById("newRecipeNotes").value = "";
}

// addNewAssumedIng.onclick = function () {
//   assumedIngModal.style.display = "block";
// }

addAssumedIngs.onclick = function () {
  assumedIngModal.style.display = "none";
  var list = document.getElementById("newAssumedIngList").value;
  var items = list.split(",");
  var tbl = document.getElementById("assumedIngModalTable");
  items.forEach(ing => {
    ing = ing.trim();
    var assumedIng = { "id": assumedIngredients.length, "name": ing }
    assumedIngredients.push(assumedIng);
    socket.emit("newAssumedIngredient", assumedIng);

    var model_table_row = document.createElement('tr');
    var ingName = document.createElement('td');
    ingName.innerHTML = ing;

    model_table_row.appendChild(ingName);
    tbl.appendChild(model_table_row);

  });
  document.getElementById("newAssumedIngList").value = "";
  updateExportButtons();
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
    var tds = tr.children;
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
  newRecipeIngModal.style.display = "none";
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

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

span.onclick = function () {
  assumedIngModal.style.display = "none";
}


/* 
table-sort-js
Author: Lee Wannacott
Licence: MIT License Copyright (c) 2021 Lee Wannacott 
    
GitHub Repository: https://github.com/LeeWannacott/table-sort-js
npm package: https://www.npmjs.com/package/table-sort-js
Demo: https://leewannacott.github.io/Portfolio/#/GitHub
Install:
Frontend: <script src="https://leewannacott.github.io/table-sort-js/table-sort.js"></script> or
Download this file and add <script src="table-sort.js"></script> to your HTML 
Backend: npm install table-sort-js and use require("../node_modules/table-sort-js/table-sort.js") 
Instructions:
  Add class="table-sort" to tables you'd like to make sortable
  Click on the table headers to sort them.
*/

function tableSortJs(testingTableSortJS = false, domDocumentWindow = document) {
  function getHTMLTables() {
    if (testingTableSortJS === true) {
      const getTagTable = domDocumentWindow.getElementsByTagName("table");
      return [getTagTable];
    } else {
      const getTagTable = document.getElementsByTagName("table");
      return [getTagTable];
    }
  }

  const [getTagTable] = getHTMLTables();
  const columnIndexAndTableRow = {};
  const fileSizeColumnTextAndRow = {};
  for (let table of getTagTable) {
    if (table.classList.contains("table-sort")) {
      makeTableSortable(table);
    }
  }

  function makeTableSortable(sortableTable) {
    let createTableHead;
    let tableBody;
    if (sortableTable.getElementsByTagName("thead").length === 0) {
      if (testingTableSortJS === true) {
        createTableHead = domDocumentWindow.createElement("thead");
      } else {
        createTableHead = document.createElement("thead");
      }
      createTableHead.appendChild(sortableTable.rows[0]);
      sortableTable.insertBefore(createTableHead, sortableTable.firstChild);
      if (sortableTable.querySelectorAll("tbody").length > 1) {
        tableBody = sortableTable.querySelectorAll("tbody")[1];
      } else {
        tableBody = sortableTable.querySelector("tbody");
      }
    } else {
      tableBody = sortableTable.querySelector("tbody");
    }

    const tableHead = sortableTable.querySelector("thead");
    const tableHeadHeaders = tableHead.querySelectorAll("th");
    tableHead.style.cursor = "pointer";

    for (let [columnIndex, th] of tableHeadHeaders.entries()) {
      makeEachColumnSortable(th, columnIndex, tableBody, sortableTable);
    }
  }

  function makeEachColumnSortable(th, columnIndex, tableBody, sortableTable) {
    let desc = th.classList.contains("order-by-desc");
    let tableArrows = sortableTable.classList.contains("table-arrows");
    const arrowUp = " ▲";
    const arrowDown = " ▼";

    if (desc && tableArrows) {
      th.insertAdjacentText("beforeend", arrowDown);
    } else if (tableArrows) {
      th.insertAdjacentText("beforeend", arrowUp);
    }

    function sortDataAttributes(tableRows, columnData) {
      for (let [i, tr] of tableRows.entries()) {
        const dataAttributeTd = tr.querySelectorAll("td").item(columnIndex)
          .dataset.sort;
        columnData.push(`${dataAttributeTd}#${i}`);
        columnIndexAndTableRow[columnData[i]] = tr.innerHTML;
      }
    }

    function sortFileSize(tableRows, columnData) {
      const numberWithUnitType =
        /[.0-9]+(\s?B|\s?KB|\s?KiB|\s?MB|\s?MiB|\s?GB|\s?GiB|T\s?B|\s?TiB)/i;
      const unitType =
        /(\s?B|\s?KB|\s?KiB|\s?MB|\s?MiB|\s?GB|G\s?iB|\s?TB|\s?TiB)/i;
      const fileSizes = {
        Kibibyte: 1024,
        Mebibyte: 1.049e6,
        Gibibyte: 1.074e9,
        Tebibyte: 1.1e12,
        Pebibyte: 1.126e15,
        Kilobyte: 1000,
        Megabyte: 1e6,
        Gigabyte: 1e9,
        Terabyte: 1e12,
      };
      function removeUnitTypeConvertToBytes(fileSizeTd, _replace) {
        fileSizeTd = fileSizeTd.replace(unitType, "");
        fileSizeTd = fileSizeTd.replace(
          fileSizeTd,
          fileSizeTd * fileSizes[_replace]
        );
        return fileSizeTd;
      }
      for (let [i, tr] of tableRows.entries()) {
        let fileSizeTd = tr
          .querySelectorAll("td")
          .item(columnIndex).textContent;
        if (fileSizeTd.match(numberWithUnitType)) {
          if (fileSizeTd.match(/\s?KB/i)) {
            fileSizeTd = removeUnitTypeConvertToBytes(fileSizeTd, "Kilobyte");
            columnData.push(`${fileSizeTd}#${i}`);
          } else if (fileSizeTd.match(/\s?KiB/i)) {
            fileSizeTd = removeUnitTypeConvertToBytes(fileSizeTd, "Kibibyte");
            columnData.push(`${fileSizeTd}#${i}`);
          } else if (fileSizeTd.match(/\s?MB/i)) {
            fileSizeTd = removeUnitTypeConvertToBytes(fileSizeTd, "Megabyte");
            columnData.push(`${fileSizeTd}#${i}`);
          } else if (fileSizeTd.match(/\s?MiB/i)) {
            fileSizeTd = removeUnitTypeConvertToBytes(fileSizeTd, "Mebibyte");
            columnData.push(`${fileSizeTd}#${i}`);
          } else if (fileSizeTd.match(/\s?GB/i)) {
            fileSizeTd = removeUnitTypeConvertToBytes(fileSizeTd, "Gigabyte");
            columnData.push(`${fileSizeTd}#${i}`);
          } else if (fileSizeTd.match(/\s?GiB/i)) {
            fileSizeTd = removeUnitTypeConvertToBytes(fileSizeTd, "Gibibyte");
            columnData.push(`${fileSizeTd}#${i}`);
          } else if (fileSizeTd.match(/\s?TB/i)) {
            fileSizeTd = removeUnitTypeConvertToBytes(fileSizeTd, "Terabyte");
            columnData.push(`${fileSizeTd}#${i}`);
          } else if (fileSizeTd.match(/\s?TiB/i)) {
            fileSizeTd = removeUnitTypeConvertToBytes(fileSizeTd, "Tebibyte");
            columnData.push(`${fileSizeTd}#${i}`);
          } else if (fileSizeTd.match(/\s?B/i)) {
            fileSizeTd = fileSizeTd.replace(unitType, "");
            columnData.push(`${fileSizeTd}#${i}`);
          }
        } else {
          columnData.push(`!X!Y!Z!#${i}`);
        }
      }
    }

    let timesClickedColumn = 0;
    let columnIndexesClicked = [];

    function rememberSort(timesClickedColumn, columnIndexesClicked) {
      columnIndexesClicked.push(columnIndex);
      if (timesClickedColumn === 1 && columnIndexesClicked.length > 1) {
        const lastColumnClicked =
          columnIndexesClicked[columnIndexesClicked.length - 1];
        const secondLastColumnClicked =
          columnIndexesClicked[columnIndexesClicked.length - 2];
        if (lastColumnClicked !== secondLastColumnClicked) {
          timesClickedColumn = 0;
          columnIndexesClicked.shift();
        }
      }
    }

    function getTableData(tableRows, columnData, isFileSize, isDataAttribute) {
      for (let [i, tr] of tableRows.entries()) {
        // inner text for column we click on
        let tdTextContent = tr
          .querySelectorAll("td")
          .item(columnIndex).textContent;
        if (tdTextContent.length === 0) {
          tdTextContent = "";
        }
        if (tdTextContent.trim() !== "") {
          if (isFileSize) {
            fileSizeColumnTextAndRow[columnData[i]] = tr.innerHTML;
          }
          if (!isFileSize && !isDataAttribute) {
            columnData.push(`${tdTextContent}#${i}`);
            columnIndexAndTableRow[`${tdTextContent}#${i}`] = tr.innerHTML;
          }
        } else {
          // Fill in blank table cells dict key with filler value.
          columnData.push(`!X!Y!Z!#${i}`);
          columnIndexAndTableRow[`!X!Y!Z!#${i}`] = tr.innerHTML;
        }
      }

      function naturalSortAescending(a, b) {
        if (a.includes("X!Y!Z!#")) {
          return 1;
        } else if (b.includes("X!Y!Z!#")) {
          return -1;
        } else {
          return a.localeCompare(
            b,
            navigator.languages[0] || navigator.language,
            { numeric: true, ignorePunctuation: true }
          );
        }
      }

      function naturalSortDescending(a, b) {
        return naturalSortAescending(b, a);
      }

      function clearArrows(arrowUp = "▲", arrowDown = "▼") {
        th.innerText = th.innerText.replace(arrowUp, "");
        th.innerText = th.innerText.replace(arrowDown, "");
      }

      // Sort naturally; default aescending unless th contains 'order-by-desc'
      // as className.
      if (columnData[0] === undefined) {
        return;
      }

      if (timesClickedColumn === 1) {
        if (desc) {
          if (tableArrows) {
            clearArrows(arrowUp, arrowDown);
            th.insertAdjacentText("beforeend", arrowDown);
          }
          columnData.sort(naturalSortDescending, {
            numeric: true,
            ignorePunctuation: true,
          });
        } else {
          if (tableArrows) {
            clearArrows(arrowUp, arrowDown);
            th.insertAdjacentText("beforeend", arrowUp);
          }
          columnData.sort(naturalSortAescending);
        }
      } else if (timesClickedColumn === 2) {
        timesClickedColumn = 0;
        if (desc) {
          if (tableArrows) {
            clearArrows(arrowUp, arrowDown);
            th.insertAdjacentText("beforeend", arrowUp);
          }
          columnData.sort(naturalSortAescending, {
            numeric: true,
            ignorePunctuation: true,
          });
        } else {
          if (tableArrows) {
            clearArrows(arrowUp, arrowDown);
            th.insertAdjacentText("beforeend", arrowDown);
          }
          columnData.sort(naturalSortDescending);
        }
      }
    }

    function updateTable(tableRows, columnData, isFileSize) {
      for (let [i, tr] of tableRows.entries()) {
        if (isFileSize) {
          tr.innerHTML = fileSizeColumnTextAndRow[columnData[i]];
          let fileSizeInBytesHTML = tr
            .querySelectorAll("td")
            .item(columnIndex).innerHTML;
          let fileSizeInBytesText = tr
            .querySelectorAll("td")
            .item(columnIndex).textContent;
          const fileSizes = {
            Kibibyte: 1024,
            Mebibyte: 1.049e6,
            Gibibyte: 1.074e9,
            Tebibyte: 1.1e12,
            Pebibyte: 1.126e15,
          };
          // Remove the unique identifyer for duplicate values(#number).
          columnData[i] = columnData[i].replace(/#[0-9]*/, "");
          if (columnData[i] < fileSizes.Kibibyte) {
            fileSizeInBytesHTML = fileSizeInBytesHTML.replace(
              fileSizeInBytesText,
              `${parseFloat(columnData[i]).toFixed(2)} B`
            );
          } else if (
            columnData[i] >= fileSizes.Kibibyte &&
            columnData[i] < fileSizes.Mebibyte
          ) {
            fileSizeInBytesHTML = fileSizeInBytesHTML.replace(
              fileSizeInBytesText,
              `${(columnData[i] / fileSizes.Kibibyte).toFixed(2)} KiB`
            );
          } else if (
            columnData[i] >= fileSizes.Mebibyte &&
            columnData[i] < fileSizes.Gibibyte
          ) {
            fileSizeInBytesHTML = fileSizeInBytesHTML.replace(
              fileSizeInBytesText,
              `${(columnData[i] / fileSizes.Mebibyte).toFixed(2)} MiB`
            );
          } else if (
            columnData[i] >= fileSizes.Gibibyte &&
            columnData[i] < fileSizes.Tebibyte
          ) {
            fileSizeInBytesHTML = fileSizeInBytesHTML.replace(
              fileSizeInBytesText,
              `${(columnData[i] / fileSizes.Gibibyte).toFixed(2)} GiB`
            );
          } else if (
            columnData[i] >= fileSizes.Tebibyte &&
            columnData[i] < fileSizes.Pebibyte
          ) {
            fileSizeInBytesHTML = fileSizeInBytesHTML.replace(
              fileSizeInBytesText,
              `${(columnData[i] / fileSizes.Tebibyte).toFixed(2)} TiB`
            );
          } else {
            fileSizeInBytesHTML = fileSizeInBytesHTML.replace(
              fileSizeInBytesText,
              "NaN"
            );
          }
          tr.querySelectorAll("td").item(columnIndex).innerHTML =
            fileSizeInBytesHTML;
        } else if (!isFileSize) {
          tr.innerHTML = columnIndexAndTableRow[columnData[i]];
        }
      }
    }

    th.addEventListener("click", function () {
      const columnData = [];
      // To make it work even if there is a tr with display: none; in the table, only the tr that is currently displayed is subject to sorting.
      const visibleTableRows = Array.prototype.filter.call(
        tableBody.querySelectorAll("tr"),
        (tr) => {
          return tr.style.display !== "none";
        }
      );

      let isDataAttribute = th.classList.contains("data-sort");
      // Check if using data-sort attribute; if so sort by value of data-sort
      // attribute.
      if (isDataAttribute) {
        sortDataAttributes(visibleTableRows, columnData);
      }

      let isFileSize = th.classList.contains("file-size");
      // Handle filesize sorting (e.g KB, MB, GB, TB) - Turns data into KiB.
      if (isFileSize) {
        sortFileSize(visibleTableRows, columnData);
      }

      // Checking if user has clicked different column from the first column if
      // yes reset times clicked.
      let isRememberSort = sortableTable.classList.contains("remember-sort");
      if (!isRememberSort) {
        rememberSort(timesClickedColumn, columnIndexesClicked);
      }

      timesClickedColumn += 1;

      getTableData(visibleTableRows, columnData, isFileSize, isDataAttribute);
      updateTable(visibleTableRows, columnData, isFileSize);
    });
  }
}

if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  tableSortJs();
} else if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", tableSortJs, false);
}
if (typeof module == "object") {
  module.exports = tableSortJs;
}


