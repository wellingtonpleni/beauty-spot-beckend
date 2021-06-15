// API REST dos estudantes
import express from 'express'
import mongodb from 'mongodb'
import { MONGODB_URI } from '../utils/mongodb.js'

const { MongoClient } = mongodb
const router = express.Router()
const nomeCollection = 'estudantes'
const client = new MongoClient(MONGODB_URI);

/**********************************************
 * GET /estudantes/
 * Lista todos os estudantes
 **********************************************/
router.get("/", async (req, res) => {
  try {
    await client.connect();
  db.collection(nomeCollection).find({}).toArray((err, docs) => {
    if (err) {
      res.status(400).json(err) //bad request
    } else {
      res.status(200).json(docs) //retorna o documento
    }
  })
} finally {
  await client.close();
}
})

/**********************************************
 * GET /estudantes/:id
 * Lista o estudante através do id
 **********************************************/
router.get("/:id", async (req, res) => {
  db.collection(nomeCollection).find({ "_id": { $eq: ObjectId(req.params.id) } }).toArray((err, docs) => {
    if (err) {
      res.status(400).json(err) //bad request
    } else {
      res.status(200).json(docs) //retorna o documento
    }
  })
})

/**********************************************
 * POST /estudantes/
 * Inclui um novo estudante
 **********************************************/

router.post('/', async (req, res) => {
  let doc = req.body

  db.collection(nomeCollection)
  .insertOne(doc)
  .then(
    mongo => res.status(200).json(mongo.ops[0]), //retorna o documento inserido
    err => res.status(400).json(err) //bad request
  );


  /*db.collection(nomeCollection).insertOne(doc, (err, response) => {
    if(err) {
        console.error(JSON.stringify(err))
        res.status(400).json(err) //bad request
    } else {
      res.status(200).json(response.ops[0]) //retorna o documento inserido
    }*/
});
  
 

export default router