// requires
const express = require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require('mongoose');         // Requires mongoose

const _ = require("lodash");

const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.set("view engine","ejs");       // To use ejs
// We create ejs files in views folder

mongoose.connect('mongodb+srv://admin-sohail:sohail05star@cluster0.zysbnqp.mongodb.net/todolistDB');

const itemsSchema= {
    name: String
};

const Item=mongoose.model('Item',itemsSchema);

const listSchema={
    name: String,
    items: [itemsSchema]
};

const List= mongoose.model('List',listSchema);


// routes
app.get("/",function(request,response){
    
    Item.find(function(err,results){
        response.render("list",{title:'Today', newTasks:results});
    })
});

app.post("/",function(request,response){
    const task=request.body.newItem;

    const listName=request.body.list;

    const item=new Item({
        name: task
    });

    if(listName=== "Today"){
        item.save();
        response.redirect('/');
    } else {
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            response.redirect('/'+listName);
        })
    }
})

app.post('/delete',function(request,response){
    const checkedItemId=request.body.checkbox;
    const listName=request.body.listName;

    if(listName==='Today'){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(!err){
                response.redirect('/');
            }
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err,foundList){
            if(!err){
                response.redirect('/'+listName);
            }
        });
    }    
})

app.get('/:customListName',function(request,response){
    const customListName=_.capitalize(request.params.customListName);

    List.findOne({name: customListName}, function(err,foundList){
        if(!err){
            if(!foundList){
                const list=new List({
                    name: customListName,
                    items: []
                });

                list.save();
                response.redirect('/'+customListName);
            } else {
                response.render('list',{title: foundList.name, newTasks: foundList.items})
            }
        }
    })

});

app.get('/about',function(request,response){
    response.render('about');
})

const port=(process.env.PORT || 4500)
app.listen(port,function(){
    console.log(`Running on port ${port}`);
});