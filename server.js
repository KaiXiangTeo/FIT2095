let express = require('express')
const mongodb = require("mongodb");
// const morgan = require('morgan');
let bodyParser = require('body-parser')

let app = express()

app.use(express.static("public/img"))
app.use(express.static("views"))
// app.use(morgan('common'));

app.use(bodyParser.urlencoded({
    extended: false
}))

app.use(bodyParser.json()) //tells the system that you want json to be used.

app.engine("html", require('ejs').renderFile);
app.set('view engine', "html");

//Configure MongoDB
const MongoClient = mongodb.MongoClient;

// Connection URL
const url = "mongodb://localhost:27017/";

//reference to the database (i.e. collection)
let db;
//Connect to mongoDB server
MongoClient.connect(url, {
        useNewUrlParser: true
    },
    function (err, client) {
        if (err) {
            console.log("Err  ", err);
        } else {
            console.log("Connected successfully to server");
            db = client.db("fit2095db");
        }
    });

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html")
});

//add new task
app.get("/newtask", function (req, res) {
    res.sendFile(__dirname + "/views/newTask.html")
});

app.post('/addtask', function (req, res) {
    let taskDetails = {
        TaskId : Math.round(Math.random()*1000),
        TaskName: req.body.TaskName,
        TaskAssign: req.body.TaskAssign,
        TaskDue: req.body.TaskDue,
        TaskStatus: req.body.TaskStatus,
        TaskDesc: req.body.TaskDesc }
    
    console.log(req.body);
    db.collection('tasklist').insertOne(taskDetails);
    res.redirect('/listTask'); 
   
})

//list task
app.get('/listtask', function (req, res) {
    db.collection('tasklist').find({}).toArray(function (err, data) {
        res.render('listTask.html', {
            tasks: data
        });
    });
});

//update tasks
app.get('/updateTask', function (req, res) {
    res.sendFile(__dirname + '/views/updateTask.html');
});

app.post('/updatetaskdata', function (req, res) {
    let taskDetails = req.body;
    let filter = {TaskId: parseInt(req.body.utaskid)};
    let theUpdate = {
        $set: {
            TaskStatus: req.body.taskStatus,
        }
    };
    db.collection('tasklist').updateOne(filter, theUpdate);
    res.redirect('/listTask'); 
})

//delete task 
app.get('/deleteTask', function (req, res) {
    res.sendFile(__dirname + '/views/deleteTask.html');
});
//POST request: receive the user's name and do the delete operation 
app.post('/deletetask', function (req, res) {
    // let userDetails = req.body;
    let filter = {
        TaskId: parseInt(req.body.TaskId)
    };
    db.collection('tasklist').deleteOne(filter);
    res.redirect("/listTask");
    // res.redirect('/getusers'); // redirect the client to list users page
});

//delete all task
app.get('/deleteAll', function (req, res) {
    res.sendFile(__dirname + '/views/deleteAll.html');
});
//POST request: receive the user's name and do the delete operation 
app.post('/deleteAllTask', function (req, res) {
    if (req.body.selection == "true"){
        db.collection('tasklist').deleteMany({});
        res.redirect("/listTask");
    }
    else{
        res.redirect("/");
    }
});


// extra task: find all tasks which have ID value between two numbers A and B.
app.get('/findtasks/:query1/:query2', function (req, res) {
    let filter1 = parseInt(req.params.query1);
    let filter2 = parseInt(req.params.query2);
    
    db.collection("tasklist").find({$and:[{TaskId:{$gte:filter1}},{TaskId:{$lte:filter2}}]}).toArray(function(err,result){
            console.log(result);
        res.render('findtasks.html', { tasks: result});
        });
    });


app.listen(8080);