const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem= mongoose.model("postagens")

router.get('/',(req,res)=>{
res.render("admin/index")
})

router.get('/categorias',(req,res)=>{
    Categoria.find().lean().sort({date:'asc'}).then((categorias)=>{
        res.render("admin/categorias", {categorias:categorias})
    }).catch((err)=>{
        req.flash("error_msg", "erro ao listar categorias")
        res.redirect("/admin")
    })

})

router.get('/categorias/add',(req,res)=>{
    res.render("admin/addcategorias")
})

router.post("/categorias/nova", (req,res) =>{
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome==null){
        erros.push({texto: "nome invalido"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug==null){
        erros.push({texto: "slug invalido"})
    }    
    if(req.body.nome.length<2){
        erros.push({texto: "nome pequeno"})
    }
    if(erros.length>0){
        res.render("admin/addcategorias",{erros: erros})
    }else{   
        const novaCategoria={
            nome:req.body.nome,
            slug:req.body.slug

        }
        new Categoria(novaCategoria).save().then(()=>{
            req.flash("success_msg","categoria criada com sucesso")
            res.redirect("/admin/categorias")
        }).catch((err)=>{
            req.flash("error_msg", "erro ao salvar categoria")
            res.redirect("/admin/categorias")
        })
    }
})


router.get("/categorias/edit/:id",(req,res)=>{
    Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
        res.render("admin/editcategorias", {categoria:categoria})
    }).catch((err)=>{
        req.flash("error_msg", "categoria nao existe")
        res.redirect("/admin/categorias")
    })

})

router.post("/categorias/edit", (req,res)=>{
    Categoria.findOne({_id: req.body.id}).then((categoria)=>{

        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(()=>{
            req.flash("success_msg", "categoria editada!")
            res.redirect("/admin/categorias")
        }).catch((err)=>{
            req.flash("error_msg","nao foi possivel editar")
            res.redirect("/admin/categorias")
        })

    }).catch((err)=>{
        req.flash("error_msg","erro ao editar")
        res.redirect("/admin/categorias")
    })

})

router.post("/categorias/deletar", (req,res)=>{
    Categoria.deleteOne({_id: req.body.id}).then(()=>{
        req.flash("success_msg","deletada com sucesso")
        res.redirect("/admin/categorias")
    }).catch((err)=>{
        req.flash("error_msg","erro ao deletar")
        res.redirect("/admin/categorias")
    })
})

router.get("/postagens",(req,res)=>{

    Postagem.find().lean().populate("categoria").sort({data:'desc'}).then((postagens)=>{
        res.render("admin/postagens",{postagens:postagens})
    }).catch((err)=>{
        req.flash("error_msg","erro ao listas")
        res.redirect("/admin")
    })


})

router.get("/postagens/add",(req,res)=>{
    Categoria.find().lean().then((categorias)=>{
    res.render("admin/addpostagem",{categorias:categorias})
    }).catch((err)=>{
        req.flash("error_msg","erro ao adicionar postagem")
        res.redirect("/admin/postagem")
    })
})

router.post("/postagens/nova", (req,res)=>{
    var erros = []

    if(req.body.categoria=="0"){
    erros.push({texto: "categoria invalida"})
    }
    if(erros.length>0){
        res.render("admin/addpostagem",{erros:erros})
    }
    else{
        const novaPostagem={
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            slug: req.body.slug,
            categoria: req.body.categoria

        }
        new Postagem(novaPostagem).save().then(()=>{
            req.flash("success_msg", "postagem criada")
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            req.flash("error_msg","erro ao criar postagem")
            res.redirect("/admin/postagens")
        })
    }
})

router.get("/postagens/edit/:id",(req,res)=>{

    Postagem.findOne({_id: req.params.id}).lean().then((postagem)=>{
        
        Categoria.find().lean().then((categorias)=>{
            res.render("admin/editpostagens",{categorias:categorias,postagem:postagem})
        }).catch((err)=>{
            req.flash("error_msg","erro ao listar categorias")
            res.redirect("/admin/postagens")
        })

    }).catch((err)=>{
        req.flash("error_msg","erro ao editar postagem")
        res.redirect("/admin/postagens")
    })

})

router.post("/postagens/edit", (req,res)=>{
    Postagem.findOne({_id: req.body.id}).then((postagem)=>{

        postagem.titulo= req.body.titulo
        postagem.slug=req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria    
    
        postagem.save().then(()=>{
            req.flash("success_msg","postagem editada")
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            req.flash("error_msg","erro ao editar")
            res.redirect("/admin/postagens")
        })

    }).catch((err)=>{
        console.log(err)
        req.flash("error_msg","erro ao salvar edicao")
        res.redirect("/admin/postagens")
    })
})

router.get("/postagens/deletar/:id",(req,res)=>{
    Postagem.deleteOne({_id: req.params.id}).then(()=>{
        req.flash("success_msg","postagem deletada")
        res.redirect("/admin/postagens")
    }).catch((err)=>{
        req.flash("error_msg","erro ao deletar")
        res.redirect("/admin/postagens")
    })
})

module.exports = router