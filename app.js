require("dotenv").config()
const express= require("express")
const app = express()
const axios = require("axios")
const path = require("path")
const API_KEY = process.env.API_KEY_APOD
const {engine} = require("express-handlebars")
const PORT = 3000
const hoje = new Date().toISOString().split('T')[0];
const sessentaDiasAtras = new Date();
sessentaDiasAtras.setDate(sessentaDiasAtras.getDate() - 60);
const dataInicio = sessentaDiasAtras.toISOString().split('T')[0];
const API_URL = `https://science.nasa.gov/wp-json/wp/v2/apod-basic?api_key=${API_KEY}&start_date=${dataInicio}&end_date=${hoje}`

app.use(express.urlencoded({extended: true}))

app.engine("handlebars",engine({defaultLayout: "main",
        layoutsDir: path.join(__dirname, "views/layouts"),
    }))
app.set("view engine","handlebars")

app.get("/form",(req,res)=> {
    res.render("formulario")
})

app.post("/form",async (req,res)=> {
    try {
        const astro = req.body.astro
        const response = await axios.get(API_URL)
        let dados = response.data
        const termo = astro.toLowerCase()
        const dadosFiltrados = dados.filter(item => {
            const isInTitle = item.title?.toLowerCase().includes(termo)
            const isImage = item.media_type === "image";

            return isInTitle && isImage
        })
        const dadosFiltrados5 = dadosFiltrados.slice(0,5)
        if (dadosFiltrados5.length >=1) {
            res.render("home", {dadosFiltrados: dadosFiltrados5})
        } else {
            res.render("home", { dadosFiltrados: [], aviso: "Nenhuma imagem encontrada para este astro recente." });
        }

    }
    catch(err) {
        console.log(err)
        res.status(500).json({error: "Erro ao acessar api Nasa"})
    }

})

app.listen(PORT,()=> {
    console.log(`Servidor rodando na porta ${PORT}`)
})
