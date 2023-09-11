import express from "express";
import bodyParser from "body-parser";
import mongoose, { Schema } from "mongoose";
import _ from "lodash";
const app = express();



const Items = ["Eat", "Sleep", "Repeat"];
const Work = ["Code", "Code", "Repeat"];

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://raghu3:bU2Tw1o9D0JOUYv4@cluster0.yfvaety.mongodb.net/todoListDB", {useNewUrlParser: true});

const itemSchema = {
    name: String
}

const listSchema = {
    name: String,
    items: [itemSchema]
}

const Item = mongoose.model("Item", itemSchema);

const item1 = {
    name: "Welcome to this App."
}

const item2 = {
    name: "Add a new task below!"
}

const item3 = {
    name: "<-- Click to Delete Task"
}

const defaultItems = [item1, item2, item3];

const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {
    res.redirect("/today");
})

app.get("/:customName", (req, res) => {
    const customName = _.capitalize(req.params.customName);
    console.log("get->" + customName);
    if(customName == "Contact") {
        res.render("contact");
    }else if(customName == "About") {
        res.render("about");
    }
    else
    List.findOne({name: customName}).then((foundList) => {
        if(!foundList) {
            const list = new List ({
                name: customName,
                items: defaultItems
            });
            list.save();
            res.redirect("/"+customName);
        }else {
            // console.log("Name -> "+ foundList.name);
            if(foundList.items.length == 0) {
                foundList.items.push(item1);
                foundList.items.push(item2);
                foundList.items.push(item3);
                foundList.save();
            }
            res.render("list", {listName: foundList.name, items: foundList.items});
        }
    })
})

app.post("/", (req, res) => {
    const curListName = req.body.listName;
    console.log(curListName);
    const newTask = req.body.newItem;

    const item = new Item({
        name: newTask
    });
    List.findOne({name: curListName}).then((foundList) => {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+curListName);
    })
})

app.post("/create", (req, res) => {
    const listToCreate = req.body.listToCreate;
    console.log(listToCreate);
    res.redirect("/"+listToCreate);
})

app.post("/delete", (req, res) => {
    const curListName = _.capitalize(req.body.listName);
    const delItemId = req.body.delItemId;
    console.log("del -> "+ curListName);
    List.findOne({name: curListName}).then((foundList) => {
        foundList.items.pull({_id: delItemId});
        foundList.save();
        res.redirect("/"+curListName);
    })
})







app.listen(3000, () => {
    console.log("Server is running on port 3000.");
})