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


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}!`)
// });

// app.get('/socket.io/socket.io.js', function(req, res){
//   res.sendFile(__dirname + '/node_modules/socket.io/client-dist/socket.io.js');
// });

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
var ingredientSections
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
    console.log(items);
    socket.emit("updateItemList", items);
    socket.emit("updateRecipeList", recipes);
    socket.emit("updateIngredientSections", ingredientSections);
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
});


http.listen(8000, function () {
  console.log('listening on localhost:8000');
});