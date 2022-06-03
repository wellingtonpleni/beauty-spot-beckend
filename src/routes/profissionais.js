// API REST dos profissionais
import express from 'express'
import { connectToDatabase } from '../utils/mongodb.js'
import { check, validationResult } from 'express-validator'

const router = express.Router()
const nomeCollection = 'profissionais'
const { db, ObjectId } = await connectToDatabase()

/**********************************************
 * Validações
 * 
 **********************************************/
const validaProfissional = [
    check('nome', 'Nome do Profissional é obrigatório').not().isEmpty(),
    check('estrelas', 'A nota média deve ser um número').isNumeric()
]


/**********************************************
 * GET /profissionais
 * Lista todos os profissionais
 **********************************************/
 router.get('/', async (req, res) => {
    /* 
     #swagger.tags = ['Prestadores']
     #swagger.description = 'Endpoint para obter todos os Profissionais de Serviço do sistema.' 
     */
    try {
      db.collection(nomeCollection).find({}, {
        projection: { senha: false }
      }).sort({ nome: 1 }).toArray((err, docs) => {
        if (!err) {
          /* 
          #swagger.responses[200] = { 
       schema: { "$ref": "#/definitions/Prestadores" },
       description: "Listagem dos profissionais de serviço obtida com sucesso" } 
       */
          res.status(200).json(docs)
        }
      })
    } catch (err) {
      /* 
         #swagger.responses[500] = { 
      schema: { "$ref": "#/definitions/Erro" },
      description: "Erro ao obter a listagem dos profissionais" } 
      */
      res.status(500).json({
        errors: [
          {
            value: `${err.message}`,
            msg: 'Erro ao obter a listagem dos profissionais',
            param: '/'
          }
        ]
      })
    }
  })

/**********************************************
 * GET /profissionais/:id
 **********************************************/
router.get("/:id", async (req, res) => {
    /* #swagger.tags = ['Profissionais']
    #swagger.description = 'Endpoint que retorna os dados do profissional filtrando pelo id' 
    */
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
 * GET /profissionais/nome/:nome
 **********************************************/
router.get("/nome/:nome", async (req, res) => {
    /* #swagger.tags = ['Profissionais']
      #swagger.description = 'Endpoint que retorna os dados do profissional filtrando por parte do nome' 
      */
    try {
        db.collection(nomeCollection).find({ nome: { $regex: req.params.nome, $options: "i" } }).toArray((err, docs) => {
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
 * POST /profissionais/
 * Inclui um novo profissional
 **********************************************/
router.post('/', validaProfissional, async (req, res) => {
    /* #swagger.tags = ['Profissionais']
      #swagger.description = 'Endpoint que inclui um novo profissional' 
      */
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
 * PUT /profissional
 * Alterar um profissional pelo ID
 **********************************************/
router.put('/', validaProfissional, async (req, res) => {
    /* #swagger.tags = ['Profissionais']
      #swagger.description = 'Endpoint que permite alterar os dados do profissional pelo id' 
      */
    const schemaErrors = validationResult(req)
    if (!schemaErrors.isEmpty()) {
        return res.status(403).json(({
            errors: schemaErrors.array() //retorna um Forbidden
        }))
    } else {
        await db.collection(nomeCollection)
            .updateOne({ '_id': { $eq: ObjectId(req.body._id) } },
                { $set: req.body }
            )
            .then(result => res.status(202).send(result))
            .catch(err => res.status(400).json(err))
    }
})

/**********************************************
 * DELETE /profissional/
 **********************************************/
router.delete('/:id', async (req, res) => {
    /* #swagger.tags = ['Profissionais']
      #swagger.description = 'Endpoint que permite excluir um passeador filtrando pelo id' 
      */
    await db.collection(nomeCollection)
        .deleteOne({ "_id": { $eq: ObjectId(req.params.id) } })
        .then(result => res.status(202).send(result))
        .catch(err => res.status(400).json(err))
})

export default router