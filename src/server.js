import express from 'express'
import cors from 'cors'
const app = express();
const port = 4000

app.use(cors()) //Habilita o CORS-Cross-origin resource sharing
app.use('/favicon.ico', express.static('public/favicon.ico')) //Configura o favicon
app.disable('x-powered-by') //Removendo o x-powered-by por segurança

import rotasStudent from './routes/students.js'
//Rotas das Categorias
app.use("/students", rotasStudent)

//Definimos a nossa rota default
app.get('/', (req, res) => {
  res.status(200).json({
      mensagem: 'API 100% funcional!👏',
      versao: '1.0.1'
  })
})

app.listen(port, function () {
  console.log(`🚀 Servidor rodando na porta ${port}`)
})

