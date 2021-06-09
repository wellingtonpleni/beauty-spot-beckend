// API REST das Categorias
import express from 'express'
import {connectToDatabase} from '../utils/mongodb.js'
const router = express.Router()
const nomeCollection = "estados"

/*****************************
 * GET /categorias/
 * Listar todas as categorias
 ****************************/

router.get("/", async(req, res) => {
    const { db } = await connectToDatabase();
    db.collection(nomeCollection).find({}).toArray((err, docs) => {
      if (err) {
        res.status(400).json(err) //bad request
      } else {
        res.status(200).json(docs) //retorna o documento
      }
  
    })
})

export default router