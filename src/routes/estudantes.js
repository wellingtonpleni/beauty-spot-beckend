// API REST dos estudantes
import express from 'express'
import { connectToDatabase } from '../utils/mongodb.js'

const router = express.Router()
const nomeCollection = 'estudantes'
const { db, ObjectId } = await connectToDatabase()

/**********************************************
 * GET /estudantes/
 * Lista todos os estudantes
 **********************************************/
router.get("/", async (req, res) => {
  try {
    db.collection(nomeCollection).find({}).toArray((err, docs) => {
      if (err) {
        res.status(400).json(err) //bad request
      } else {
        res.status(200).json(docs) //retorna o documento
      }
    })
  } catch (err) {
    res.status(500).json({ "error": err.message })
  }
})

/**********************************************
 * GET /estudantes/:id
 * Lista o estudante através do id
 **********************************************/
 router.get("/:id", async (req, res) => {
  try {
    db.collection(nomeCollection).find({ "_id": { $eq: ObjectId(req.params.id) } }).toArray((err, docs) => {
      if (err) {
        res.status(400).json(err) //bad request
      } else {
        res.status(200).json(docs) //retorna o documento
      }
    })
  } catch (err) {
    res.status(500).json({ "error": err.message })
  }
}) 

/**********************************************
 * POST /estudantes/
 * Inclui um novo estudante
 **********************************************/
router.post('/', async (req, res) => {
await db.collection(nomeCollection)
      .insertOne(req.body)
      .then(result => res.status(201).send(result)) //retorna o ID do documento inserido)
      .catch(err => res.status(400).json(err)) 
})

/**********************************************
 * PUT /estudantes/
 * Alterar um estudante pelo ID
 **********************************************/
 router.put('/', async (req, res) => {
  const estudanteInput = req.body
  await db.collection(nomeCollection)
        .updateOne({ "_id": { $eq: ObjectId(req.body._id) } }, {$set:
          { 
          nome: estudanteInput.nome, 
          anoGraduação: estudanteInput.anoGraduação,
          tipo: estudanteInput.tipo,
          notaMédia: estudanteInput.notaMédia,
          endereço: {
            logradouro: estudanteInput.endereço.logradouro,
            municipio: estudanteInput.endereço.municipio
           }
          }
        },
          {returnNewDocument:true})
        .then(result => res.status(202).send(result)) 
        .catch(err => res.status(400).json(err)) 
  })

/**********************************************
 * DELETE /estudantes/
 * Apaga um estudante pelo ID
 **********************************************/
 router.delete('/:id', async (req, res) => {
  await db.collection(nomeCollection)
        .deleteOne({ "_id": { $eq: ObjectId(req.params.id) } })
        .then(result => res.status(202).send(result)) 
        .catch(err => res.status(400).json(err)) 
  })

export default router