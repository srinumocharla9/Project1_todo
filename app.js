const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require("mongoose");
main().catch(err=> console.log(err));
const Date = require(__dirname + "/date.js");

const app = express();
app.set("view engine",'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("Public"));

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/todoListDB");
    //item Schema 
    const itemSchema = {
        name : String,
    }
    //item model
    const Item_model = mongoose.model("Item",itemSchema);

    //NewList Schema 
    const listSchema = {
        name : String,
        items :[itemSchema],
    }

    //ListModel
    const List_model = mongoose.model("list_item",listSchema);

    const item1 = new Item_model({
        name :"Reading Book",
    });
    const item2 = new Item_model({
        name : "Take Breaks",
    });
    const item3 = new Item_model({
        name : "enough Sleep",
    });

    const defaultItems = [item1,item2,item3];

    app.get("/",function(req,res){
        const day = Date.getDate();
        Item_model.find().then((foundItems) => {
            if(foundItems.length === 0){
                Item_model.insertMany(defaultItems);
                res.redirect("/");
            }
            else{
                res.render("list",{listTitle:day,newitems:foundItems});
            }
        })
    })
    //adding new items to list
    app.post("/", function(req,res){
        const listname = req.body.list;
        //const day = Date.getDay()+",";
        
        addItem = new Item_model({
            name : req.body.add_item,
        })

        if(listname === "Today"){
            console.log("Hey! , It same day man");
            addItem.save();
            res.redirect("/");  
        }
        else{
            const Checking_listName = async(listname) => {
                try{
                    const result = await List_model.findOne({name : listname}).exec();
                    if(result){
                        result.items.push(addItem);
                        result.save()
                        res.redirect("/"+listname);
                    }
                }
                catch(err){
                    console.log(err);
                }
            }
            Checking_listName(listname);
        } 
    });

    //Deleting item using Id
    app.post("/delete",function(req,res){
        deleteItem_id = req.body.Checkbox;
        console.log(deleteItem_id);
        const listname = req.body.listName;
        //const day = Date.getDate()
        console.log(listname);
        if (listname == "Today") {
            deleteCheckedItem();
          } else {
        
            deleteCustomItem();
          }

          async function deleteCheckedItem() {
            await Item_model.deleteOne({ _id: deleteItem_id });
            res.redirect("/");
          }

          async function deleteCustomItem() {
            await List_model.findOneAndUpdate(
              { name: listname },
              { $pull: { items: { _id: deleteItem_id } } }
            );
            res.redirect("/" + listname);
          }
        });
            /*
       const deleteDocument = async(_id) => {
        try{
            
            /*result = await Item_model.findOneAndUpdate({name : listname },
                {$pull : {items : {_id : _id}}},
                {new : true});
            console.log(result);
            res.redirect("/");
            

            
        }
        catch (err){
            console.log(err);
        }
    }
    deleteDocument(String(deleteItem_id));
     
    
      
    })
    */

    //Adding custom Lists
    app.get("/:ListName",function(req,res){
        const customListName = req.params.ListName

         //checking for available lists
         const Checking_listName = async(List_name) =>{
            try{
                const result = await List_model.findOne({name : List_name}).exec();
                if(result){
                    console.log("entered if item found");
                  return  res.render("list",{listTitle:result.name,newitems:result.items});
                }
                else{
                    console.log("entered becuase item not found");
                    const newItem_list = new List_model({
                        name : customListName,
                        items: defaultItems,
                    })
                    newItem_list.save();
                   return  res.redirect("/"+ customListName);
                }
            }
            catch(err){
                console.log(err);
            }
        }
        Checking_listName(customListName);
    })


app.listen(3000,function(){
    console.log("The server is logged on Port : 3000");
})


