//CARREGANDO MODULOS
const express=require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const admin = require("./routes/admin")
const path = require("path")
const mongoose = require('mongoose')
const session = require("express-session")
const flash = require("connect-flash")
const moment = require("moment")
//CONFIGURACOES
    //sessao
    app.use(session({
        secret: "cursodenode",
        ressave: true,
        saveUninitialized: true
    }))
    app.use(flash())
    //midleware
    app.use((req,res,next)=>{
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        next()
    })
    //body parser
    app.use(express.urlencoded({extended:true}))
    app.use(express.json())
    //Handlebars
    app.engine('handlebars',handlebars.engine({defaultLayout:'main',
    helpers: {
        formatDate: (date) => {
             return moment(date).format('DD/MM/YYYY HH:mm')
         }}}))
    app.set("view engine","handlebars");

    //Mongoose
    mongoose.Promise = global.Promise;


mongoose.connect('mongodb://0.0.0.0:27017/aprendendo', 
{useNewUrlParser: true, useUnifiedTopology: true}).then(()=> {
    console.log('MongoDB conectado')
}).catch((err)=> {
    console.log('Erro ao se conectar: ' + err)
})

    //public
    app.use(express.static(path.join(__dirname+ "/public")))

    //ROTAS
    app.get("/",(req,res)=>{
        res.render("index")
    })
    
    app.use("/admin",admin);

//OUTROS
const PORT = 8089
app.listen(PORT,()=>{
    console.log('servidor rodando na porta ${PORT}')
})