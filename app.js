const express = require("express");
const app = express();
const date = require(__dirname + "/date.js");

const items = ["Buy Food", "Cook Food"];
const workItems = [];

app.set("view engine", "ejs");
// app.use(express.json());
app.use(express.urlencoded());
app.use(express.static("public"));

app.get("/", (req, res) => {
	let day = date.getDate();
	res.render("list", { listTitle: day, newListItems: items });
});

app.post("/", (req, res) => {
	let item = req.body.newItem;

	if (req.body.list === "Work") {
		workItems.push(item);
		res.redirect("/work");
	} else {
		items.push(item);
		res.redirect("/");
	}
});

app.get("/work", (req, res) => {
	res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.post("/work", (req, res) => {
	let item = res.body.newItem;
	workItems.push(item);
	res.redirect("/work");
});

app.get("/about", (req, res) => {
	res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
	port = 3000;
}

app.listen(port, () => {
	console.log("Server started successfully on port " + port);
});
