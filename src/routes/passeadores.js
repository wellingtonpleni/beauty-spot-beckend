// API REST dos passeadores
import express from 'express'
import { connectToDatabase } from '../utils/mongodb.js'
import { check, validationResult } from 'express-validator'

const router = express.Router()
const nomeCollection = 'passeadores'
const { db, ObjectId } = await connectToDatabase()

/**********************************************
 * Validações
 * 
 **********************************************/
const validaPasseador = [
  check('nome', 'Nome do Passeador é obrigatório').not().isEmpty(),
  check('estrelas', 'A nota média deve ser um número').isNumeric()
]


/**********************************************
 * GET /passeadores/
 * Lista todos os passeadores
 **********************************************/
router.get("/", async (req, res) => {
  try {
    db.collection(nomeCollection).find({}).toArray((err, docs) => {
      if (err) {
        res.status(400).json(err) //bad request
      } else {
        res.status(200).json(docs) //retorna os documentos
      }
    })
  } catch (err) {
    res.status(500).json({ "error": err.message })
  }
})

/**********************************************
 * GET /passeadores/:id
 * Lista o passeador através do id
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
 * GET /passeadores/nome/:nome
 * Lista o passeador através de parte do seu nome
 **********************************************/
router.get("/nome/:nome", async (req, res) => {
  try {
    db.collection(nomeCollection).find({ nome: {$regex: req.params.nome, $options: "i"} }).toArray((err, docs) => {
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
 * POST /passeadores/
 * Inclui um novo passeador
 **********************************************/
router.post('/', validaPasseador, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json(({
      errors: errors.array()
    }))
  } else {
    await db.collection(nomeCollection)
      .insertOne(req.body)
      .then(result => res.status(201).send(result)) //retorna o ID do documento inserido)
      .catch(err => res.status(400).json(err))
  }
})

/**********************************************
 * PUT /passeadores/:id
 * Alterar um passeador pelo ID
 **********************************************/
 router.put('/:id', validaPasseador, async (req, res) => {
    const schemaErrors = validationResult(req)
    if (!schemaErrors.isEmpty()) {
      return res.status(403).json(({
        errors: schemaErrors.array() //retorna um Forbidden
      }))
    } else {
      await db.collection(nomeCollection)
        .updateOne({ '_id': { $eq: ObjectId(req.params.id) } },
          { $set: req.body }
        )
        .then(result => res.status(202).send(result))
        .catch(err => res.status(400).json(err))
    }
  })

/**********************************************
 * DELETE /passeadores/
 * Apaga um passeador pelo ID
 **********************************************/
router.delete('/:id', async (req, res) => {
  await db.collection(nomeCollection)
    .deleteOne({ "_id": { $eq: ObjectId(req.params.id) } })
    .then(result => res.status(202).send(result))
    .catch(err => res.status(400).json(err))
})

export default router