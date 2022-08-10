const express = require("express");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
	"Mongo-DB-connection-Url"
);

// DB - Items Collection
const itemSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
});
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({ name: "Welcome to your todolist!" });
const item2 = new Item({ name: "Hit the + button to add a new item." });
const item3 = new Item({ name: "<-- Hit this to delete an item." });
const defaultItems = [item1, item2, item3];

// DB - Lists Collection
const listSchema = new mongoose.Schema({
	name:{
		type:String,
		required:true
	},
	items:[itemSchema]
});
const List = mongoose.model("List", listSchema);

// Express
app.get("/", (req, res) => {
	Item.find({}, function (err, foundItems) {
		if (foundItems.length === 0) {
			Item.insertMany(defaultItems, function (err) {
				if (err) {
					console.log(err);
				}
			});
			res.redirect("/");
		} else {
			res.render("list", { listTitle: "Today", newListItems: foundItems });
		}
	});
});

app.post("/", (req, res) => {
	const listName = req.body.list;
	const newItem =req.body.newItem;

	if(listName ==='Today'){
		const addItem = new Item({ name: newItem });
		addItem.save();
		res.redirect("/");
	}else{
		List.findOne({name:listName}, function(err, foundList){
			foundList.items.push({name:newItem});
			foundList.save();
			res.redirect("/"+listName);
		})
	}
	
});

app.post("/delete",(req,res)=>{
const checkedItemId = req.body.itemId;
const listName = req.body.listName;
if(listName === "Today"){
Item.findByIdAndRemove(checkedItemId, function (err) {
	if (!err) {
		console.log("Successfully deleted checked item");
		res.redirect("/");
	}
});
}else{
	List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,results){
		if(!err){
			res.redirect("/"+ listName);
		}
	})
}

});

app.get("/:listName", (req, res) => {
	const listName = _.capitalize(req.params.listName);
	List.findOne({name:listName},function(err,foundList){
		if(!err){
			if(!foundList){
				const newList = new List({ name: listName, items: defaultItems });
				newList.save();
				res.redirect("/" + listName);
			}else{
				res.render("list", {
					listTitle: foundList.name,
					newListItems: foundList.items,
				});
			}
		}
	});
});



let port = process.env.PORT;
if (port == null || port == "") {
	port = 3000;
}
app.listen(port, () => {
	console.log("Server started successfully on port " + port);
});
