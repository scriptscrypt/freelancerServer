const express = require("express")
const app = express()
const User = require("./models/modelUsersReg.js")
const bcrypt = require('bcryptjs')
const session = require('express-session') 

//22Feb2023
//For CSP


const helmet = require('helmet');

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'unsafe-inline'", "'unsafe-eval'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        objectSrc: ["'none'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:"],
        mediaSrc: ["'self'"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: []
    }
}));


//22Feb2023


//For parsing the inputs(input field data) from html to be called by server(res)
const bodyParser = require("body-parser");
// Mongoose - ORM 
const mongoose = require("mongoose");
// const { db } = require("./models/modelUser.js");

// Connect to local database
mongoose.connect("mongodb://localhost/freelancer").then(()=>{
    console.log("Connection to mongodb established")
})  
.catch((err) => console.log(`No connection to DB, Error - ${err}`))

{/* From mongo db */}

// DB_URL = "mongodb+srv://username:password@cluster0.e4k8zoi.mongodb.net/?retryWrites=true&w=majority"

{/* From mongo db */}

app.set("view engine", "ejs")

app.use(express.urlencoded({extended: true}));
app.use(bodyParser.urlencoded({ 
    extended:false
}));

// For setting up middlewares
app.use(session({secret: 'notagoodsecret'}))

//require Login - middleware
const requireLogin = (req,res,next) =>{
    if(!req.session.userId){
        return res.redirect('/login')
    }
    next();
}
app.get("/", (req, res)=>{
    res.render("index")
})

{/*** Registration start ***/}

{/* For register.ejs page */}
app.get("/register", (req, res)=>{
    res.render("register")
})

app.post("/register", async (req, res)=>{
    // res.json(req.body);
    // res.send('Hello from A!')

    // Destructuring the elements from the req.body object
    const { nameUsername, nameEmail, namePassword } = req.body;
    const hash = await bcrypt.hash(namePassword, 16);
    
    // Check if username and email are unique
    if(nameUsername == User.findOne({modelUsername: nameUsername })) res.send("Username Exists already")
    else if(nameEmail == User.findOne({modelEmail: nameEmail })) res.send("Email Exists already")

    //From models folder - modelUser.js file 
    const user = new ColUsers({ 
        modelUsername: nameUsername, 
        modelEmail: nameEmail, 
        modelPassword : hash,
    })
    await user.save();
    
    // req.session.userId = user._id;
    console.log("Saved to DB")
    
    res.redirect('/login')
})

{/*** Registration end ***/}


app.get("/login", (req, res)=>{
    res.render("login")
})

app.post("/login", async (req, res)=>{

    // destructuring the req.body - nameEmail, namePassword coming from frontend / user inputs
    const { nameUsername, nameEmail, namePassword } = req.body;

    // Find if there exist an account for the entered email
    // const serverVarUser = await User.findOne({ nameEmail : `${nameEmail}` });
   
    // const serverVarUser = await User.findOne({ "nameEmail": nameEmail });
    //This is one of the foolish mistake I have done, wasted 2 days for this!
    const serverVarUser = await User.findOne({ modelEmail: nameEmail }, { modelUsername: nameUsername });

    // const serverVarUser = await User.findOne({ modelEmail: nameEmail });
    
    // Write error handling for user not found in DB 
    // using return for stopping execution of all further code 
    if(serverVarUser === null){ return res.redirect("/register") }


    // if(serverVarUser === null){
        //     res.redirect("/register")
    // }
    // const validPassword = bcrypt.compare(namePassword, serverVarUser.modelPassword, function(err, result) {
    
    // Error in comparing - serverVarUser.modelPassword returns first one in the document and failing to search for the input user's emailid 
    bcrypt.compare(namePassword, serverVarUser.modelPassword, function(err, result) {
        
        if (err) { throw (err); }
        // res.send(result)    
        if(result === false){
            res.redirect("/login") 
        }  
        else{ 
            req.session.userId = serverVarUser._id;
            res.redirect("/dashboard")
        }
    });
       
})
 
app.get("/dashboard", (req, res)=>{
    res.render("dashboard")
})
app.get("/logout", (req, res)=>{
    res.render("logout")
})
app.post("/logout", (req, res)=>{
    req.session.destroy();    
    res.redirect("/login");
})

//Just add middleware already defined function - requireLogin
app.get("/route1", requireLogin, (req,res)=>{
    res.send("In route1, - From res.send - This is a protected route - requires login ")
})

app.listen( 3000, ()=>{ console.log(" Connected to server at http://localhost:3000")});