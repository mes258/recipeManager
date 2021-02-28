const express = require('express')
var fs = require('fs');
const app = express();
const port = 8000;
var path = require('path')
var http = require('http').createServer(app);
var sio = require('socket.io');
var io = sio(http);


var ITEM_FILE_PATH = './public/itemList.json';
var RECIPE_FILE_PATH = './public/recipeList.json';
var INGREDIENT_SECTION_PATH = './public/ingredientSections.json';
var ASSUMED_INGREDIENT_PATH = './public/assumedIngredients.json';


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/client/script.js', function (req, res) {
  res.sendFile(__dirname + '/client/script.js');
});

app.get('/client/socketScript.js', function (req, res) {
  res.sendFile(__dirname + '/client/socketScript.js');
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static('node_modules'));


var items = require(ITEM_FILE_PATH);
var recipes = require(RECIPE_FILE_PATH);
var ingredientSections;
var assumedIngredients = require(ASSUMED_INGREDIENT_PATH);
try {
  ingredientSections = require(INGREDIENT_SECTION_PATH);
} catch (e) {
  if (e.toString().includes("Unexpected token [ in JSON")) {
    var fileText = "a";
    fs.readFile(INGREDIENT_SECTION_PATH, (err, data) => {
      if (err) throw err;
      fileText = data.toString();
      var temp1 = fileText.replace(/\]\]\[/g, "],[");
      var temp2 = temp1.replace(/\]\[\[/g, "],[");
      ingredientSections = temp2;

      fs.writeFile(INGREDIENT_SECTION_PATH, ingredientSections, function (err) {
        if (err) return console.log(err);
      });
    });
  } else {
    throw e;
  }
}

io.on('connection', function (socket) {
  socket.on("getLists", function () {
    socket.emit("updateItemList", items);
    socket.emit("updateRecipeList", recipes);
    socket.emit("updateIngredientSections", ingredientSections);
    socket.emit("updateAssumedIngredients", assumedIngredients);
  });

  socket.on("newItem", function (item) {
    items.push(item)
    fs.writeFile(ITEM_FILE_PATH, JSON.stringify(items), function (err) {
      if (err) return console.log(err);
    });
  });

  socket.on("newRecipe", function (recipe) {
    recipes.push(recipe)
    fs.writeFile(RECIPE_FILE_PATH, JSON.stringify(recipes), function (err) {
      if (err) return console.log(err);
    });
  });

  socket.on("newIngredientSection", function (ingSec) {
    ingredientSections.push(ingSec)
    fs.writeFile(INGREDIENT_SECTION_PATH, JSON.stringify(ingredientSections), function (err) {
      if (err) return console.log(err);
    });
  });

  socket.on("newAssumedIngredient", function (ing) {
    assumedIngredients.push(ing)
    fs.writeFile(ASSUMED_INGREDIENT_PATH, JSON.stringify(assumedIngredients), function (err) {
      if (err) return console.log(err);
    });
  });
});


http.listen(8000, function () {
  console.log('listening on localhost:8000');
});