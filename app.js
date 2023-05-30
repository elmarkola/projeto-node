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
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require("./models/Categoria")
const Categoria = mongoose.model("categorias")
const usuarios=require("./routes/usuario")
const passport = require('passport')
require("./config/auth")(passport)

//CONFIGURACOES
    //sessao
    app.use(session({
        secret: "cursodenode",
        ressave: true,
        saveUninitialized: true
    }))

    app.use(passport.initialize())
    app.use(passport.session())

    app.use(flash())
    //midleware
    app.use((req,res,next)=>{
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null;

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
        Postagem.find().lean().populate("categoria").sort({data:"desc"}).then((postagens)=>{
            res.render("index",{postagens : postagens})
        }).catch((err)=>{
            req.flash("error_msg","erro ao exibir postagens")
            res.redirect("/404")
        })
    })

    app.get("/categorias",(req,res)=>{

            Categoria.find().lean().sort({date:'asc'}).then((categorias)=>{
                res.render("categorias/index", {categorias:categorias})
            }).catch((err)=>{
                req.flash("error_msg", "erro ao listar categorias")
                res.redirect("/")
            })

    })

    app.get("/categorias/:slug",(req,res)=>{
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria)=>{
            if(categoria){
                Postagem.find({categoria: categoria._id}).lean().then((postagens)=>{
                res.render("categorias/postagens",{postagens:postagens,categoria:categoria})
                }).catch((err)=>{
                    req.flash("error_msg","categoria nao existe")
                    res.redirect("/")
                })
                
            }
            else{
                req.flash("error_msg","categoria nao existe")
                res.redirect("/")
            }
        }).catch((err)=>{
            req.flash("error_msg","houve um erro")
            res.redirect("/")
        })
    })

    app.get("/postagem/:slug",(req,res)=>{
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem)=>{
            if(postagem){
                res.render("postagem/index",{postagem:postagem})
            }
            else{
                req.flash("error_msg","postagem nao existe")
                res.redirect("/")
            }
        }).catch((err)=>{
            req.flash("error_msg","houve um erro")
            res.redirect("/")
        })
    })

    app.get("/404",(req,res)=>{
        res.send("erro 404")
    })
    
    app.use("/admin",admin);
    app.use('/usuarios',usuarios)

//OUTROS
const PORT = 8089
app.listen(PORT,()=>{
    console.log('servidor rodando na porta ${PORT}')
})