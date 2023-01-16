//jshint esversion:6

//packages
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



//conection to db 'todolistDB'
mongoose.connect('mongodb://127.0.0.1:27017/todolistDB', { useNewUrlParser: true });


//item Schema
const itemsSchema = new mongoose.Schema({   
  name : String
});

//declare Item 
const Item = mongoose.model('Item', itemsSchema);

//Default items
const item1 = new Item({
name : "Welcome to todo List!"
});

const item2 = new Item({
name : "Hit the + button to add new item"
});

const item3 = new Item({
name : "<-- Hit this to delete item"
});

const defaultItems =[item1, item2, item3];

//custom list schema
const ListSchema = new mongoose.Schema({
  name : String,
  items : [itemsSchema]
});

//declare customList
const List = mongoose.model('List', ListSchema);


//main route
app.get("/", function(req, res) {

Item.find({},function(err, foundItems){ //verificar se existe valores na tabela, se não houver meter os redefinidos

  if(foundItems.length === 0) { // Preencher a lista com os valores default
     Item.insertMany(defaultItems, function(err){ //
       if(err){
        console.log("Something wet wrong, message: "+err);
      }else
      {
        console.log("insertMany success!"); res.redirect("/");
      }
      });
      res.redirect("/");
    }

      else{res.render("list", {listTitle: "Today", newListItems: foundItems})};
  
});
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newPost = new Item({
    name : itemName
   });


  if(listName === 'Today'){
   newPost.save();  
  res.redirect("/");}
  else{
List.findOne({name : listName}, function(err, foundlist){
foundlist.items.push(newPost);
foundlist.save();
res.redirect("/"+ listName);

});

  }
  
  
});

app.post("/delete", function(req, res){

 console.log(req.body.checkbox); //Log item id

 const itemDeleted = req.body.checkbox;
 const listName = req.body.listName;

 if(listName === 'Today'){  
  Item.findByIdAndRemove(itemDeleted,function(err){
  if(!err){
    console.log("Item deleted successfuly!");
    res.redirect("/");
}
 
});
}
else{
  List.findOneAndUpdate({name : listName},{$pull : {items : {_id : itemDeleted}}}, function(err, foundItems){
    if(err){
      console.log("Something went wrong: "+err);
    }else{
      res.redirect("/"+listName);
    }
  });
}


  
});

app.get("/:customListName", function(req,res){
  if (req.params.customListName != "favicon.ico") {
  console.log("Custom List Name: "+ req.params.customListName);
  const cLN = _.capitalize(req.params.customListName);

List.findOne({name:cLN}, function(err, foundList){
if(!err){
  if(!foundList){
   console.log("List not found! Lets Create!");

   const L = new List({
    name : cLN,
    items : defaultItems
  });
    
  L.save();
  res.redirect("/"+ cLN);

  }else{
    console.log("This list exist!");
    res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
  }
}else{
  console.log("Something went wrong on find this list..." + err);
}

});

  }

});








app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
