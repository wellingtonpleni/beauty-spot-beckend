// API REST dos usuários
import express from 'express'
import { connectToDatabase } from '../utils/mongodb.js'
import { check, validationResult } from 'express-validator'

const router = express.Router()
const nomeCollection = 'usuarios'
const { db, ObjectId } = await connectToDatabase()

/**********************************************
 * Validações
 * 
 **********************************************/
const validaUsuario = [
  check('nome')
    .not().isEmpty().trim().withMessage('É obrigatório informar o nome do usuário')
    .isAlpha('pt-BR', { ignore: ' ' }).withMessage('O nome do usuário deve conter apenas texto')
    .isLength({ min: 3 }).withMessage('O nome do usuário é muito curto. Informe ao menos 3 caracteres')
    .isLength({ max: 100 }).withMessage('O nome do usuário é muito longo. Informe no máximo 100 caracteres'),
  check('email')
    .not().isEmpty().trim().withMessage('É obrigatório informar o email do usuário')
    .isEmail().withMessage('O email do usuário deve ser válido')
    .custom((value, {req}) => {
      return db.collection(nomeCollection).find({ email: { $eq: value } }).toArray()
        .then((email) => {
          if (email.length && !req.params.id) {
            return Promise.reject(`O email ${value} já está informado em outro usuário`)
          }
        })
    }),
  check('senha')
    .not().isEmpty().trim().withMessage('É obrigatório informar a senha do usuário')
    .isLength({ min: 6 }).withMessage('A senha deve conter no mínimo 6 caracteres')
    .isStrongPassword({
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
      minNumbers: 1
    }).withMessage('A senha informada não é segura. Ela deve conter ao menos 1 letra maiúscula, 1 número e 1 símbolo '),
  check('ativo')
    .not().isString().withMessage('O valor informado para o campo ativo não pode ser um texto')
    .not().isInt().withMessage('O valor informado para o campo ativo não pode ser um número')
    .isBoolean().withMessage('O valor informado para o campo ativo deve ser um booleano (True ou False)'),
  check('tipo')
    .not().isEmpty().trim().withMessage('É obrigatório informar o tipo do usuário')
    .isIn(['Admin', 'Cliente', 'Profissional']).withMessage('O tipo informado deve ser Admin, Cliente ou Profissional'),
  check('avatar')
    .isURL().withMessage('O endereço do avatar deve ser uma URL válida')
]


/**********************************************
 * GET /api/usuarios/
 * Lista todos os usuários do sistema
 **********************************************/
router.get("/", async (req, res) => {
  try {
    db.collection(nomeCollection).find({}, { senha: 0 }).toArray((err, docs) => {
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
 * GET /api/usuarios/:id
 * Lista o usuário através do id
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

/**********************************************************
 * GET /api/usuarios/nome/:filtro
 * Lista o usuário através de parte do seu nome ou e-mail
 **********************************************************/
router.get("/nome/:filtro", async (req, res) => {
  try {
    db.collection(nomeCollection).find({
      $or:
      [
       {nome: { $regex: req.params.filtro, $options: "i" } },
       {email: { $regex: req.params.filtro, $options: "i" } }
      ]
      }).toArray((err, docs) => {
      if (err) {
        res.status(400).json(err) //bad request
      } else {
        res.status(200).json(docs) //retorna o documento
      }
    })
  } catch (err) {
    res.status(500).json({ "errors": err.message })
  }
})

/**********************************************
 * POST /estudantes/
 * Inclui um novo estudante
 **********************************************/
router.post('/', validaUsuario, async (req, res) => {
  const email = req.body.email
  const schemaErrors = validationResult(req)
  if (!schemaErrors.isEmpty()) {
    return res.status(403).json(({
      errors: schemaErrors.array() //retorna um Forbidden
    }))
  } else {
    //Iremos definir o avatar a partir da API ui-avatars
    req.body.avatar= `https://ui-avatars.com/api/?background=3700B3&color=FFFFFF&name=${req.body.nome.replace(/ /g,'+')}`
    await db.collection(nomeCollection)
      .insertOne(req.body)
      .then(result => res.status(201).send(result)) //retorna o ID do documento inserido)
      .catch(err => res.status(400).json(err))
  }
})

/**********************************************
 * PUT /estudantes/:id
 * Alterar um estudante pelo ID
 **********************************************/
router.put('/:id', validaUsuario, async (req, res) => {
  const schemaErrors = validationResult(req)
  if (!schemaErrors.isEmpty()) {
    return res.status(403).json(({
      errors: schemaErrors.array() //retorna um Forbidden
    }))
  } else {
    const estudanteInput = req.body
    await db.collection(nomeCollection)
      .updateOne({ "_id": { $eq: ObjectId(req.params.id) } }, 
      {$set: estudanteInput}
      )
      .then(result => res.status(202).send(result))
      .catch(err => res.status(400).json(err))
  }
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