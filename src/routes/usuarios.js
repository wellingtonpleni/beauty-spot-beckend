// API REST dos usuários
import express from 'express'
import { connectToDatabase } from '../utils/mongodb.js'
import { check, validationResult } from 'express-validator'
//JWT
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

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
    .custom((value, { req }) => {
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
    .default(true)
    .not().isString().withMessage('O valor informado para o campo ativo não pode ser um texto')
    .not().isInt().withMessage('O valor informado para o campo ativo não pode ser um número')
    .isBoolean().withMessage('O valor informado para o campo ativo deve ser um booleano (True ou False)'),
  check('tipo')
    .default('Cliente')
    .not().isEmpty().trim().withMessage('É obrigatório informar o tipo do usuário')
    .isIn(['Admin', 'Cliente', 'Profissional']).withMessage('O tipo informado deve ser Admin, Cliente ou Profissional'),
  check('avatar')
    .default('https://ui-avatars.com/api/?background=3700B3&color=FFFFFF&name=Dog+Walker')
    .isURL().withMessage('O endereço do avatar deve ser uma URL válida')
]


/**********************************************
 * GET /api/usuarios/
 * Lista todos os usuários do sistema
 **********************************************/
router.get('/', async (req, res) => {
  try {
    db.collection(nomeCollection).find({}, {
      projection: { senha: false }
    }).sort({ nome: 1 }).toArray((err, docs) => {
      if (!err) { res.status(200).json(docs) }
    })
  } catch (err) {
    res.status(500).json({
      errors: [
        {
          value: `${err.message}`,
          msg: 'Erro ao obter os usuários',
          param: '/'
        }
      ]
    })
  }
})

/**********************************************
 * GET /api/usuarios/:id
 * Lista o usuário através do id
 **********************************************/
router.get('/:id', async (req, res) => {
  try {
    db.collection(nomeCollection).find({ '_id': { $eq: ObjectId(req.params.id) } }, {
      projection: { senha: false }
    }).limit(1).toArray((err, docs) => {
      if (!err) { res.status(200).json(docs) }
    })
  } catch (err) {
    res.status(500).json({
      errors: [
        {
          value: `${err.message}`,
          msg: 'Erro ao obter o usuário pelo id',
          param: '/'
        }
      ]
    })
  }
})

/**********************************************************
 * GET /api/usuarios/nome/:filtro
 * Lista o usuário através de parte do seu nome ou e-mail
 **********************************************************/
router.get('/nome/:filtro', async (req, res) => {
  try {
    db.collection(nomeCollection).find({
      $or:
        [
          { nome: { $regex: req.params.filtro, $options: 'i' } },
          { email: { $regex: req.params.filtro, $options: 'i' } }
        ]
    }, {
      projection: { senha: false }
    }).limit(10).sort({ nome: 1 }).toArray((err, docs) => {
      if (!err) {
        res.status(200).json(docs) //retorna o documento
      }
    })
  } catch (err) {
    res.status(500).json({
      errors: [
        {
          value: `${err.message}`,
          msg: 'Erro ao obter o usuário pelo nome',
          param: '/'
        }
      ]
    })
  }
})

/**********************************************
 * POST /estudantes/
 * Inclui um novo estudante
 **********************************************/
router.post('/', validaUsuario, async (req, res) => {
  //Verificando os erros
  const schemaErrors = validationResult(req)
  if (!schemaErrors.isEmpty()) {
    return res.status(403).json(({
      errors: schemaErrors.array() //retorna um Forbidden
    }))
  } else {
    //Iremos definir o avatar a partir da API ui-avatars
    req.body.avatar = `https://ui-avatars.com/api/?background=3700B3&color=FFFFFF&name=${req.body.nome.replace(/ /g, '+')}`
    //Faremos a criptografia da senha
    const salt = await bcrypt.genSalt(10) //impede que uma mesma senha tenha resultados iguais
    req.body.senha = await bcrypt.hash(req.body.senha, salt)
    //Iremos salvar o registro
    await db.collection(nomeCollection)
      .insertOne(req.body)
      .then(result => res.status(201).send(result)) //retorna o ID do documento inserido
      .catch(err => res.status(400).json(err))      //caso dê erro, retornamos o bad request
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
    await db.collection(nomeCollection)
      .updateOne({ '_id': { $eq: ObjectId(req.params.id) } },
        { $set: req.body }
      )
      .then(result => res.status(202).send(result))
      .catch(err => res.status(400).json(err))
  }
})

/**********************************************
 * DELETE /estudantes/:id
 * Apaga um estudante pelo ID
 **********************************************/
router.delete('/:id', async (req, res) => {
  await db.collection(nomeCollection)
    .deleteOne({ '_id': { $eq: ObjectId(req.params.id) } })
    .then(result => res.status(202).send(result))
    .catch(err => res.status(400).json(err))
})

/**********************************************
 * POST /estudantes/login
 * Efetua o login do usuário e retorna um token
 **********************************************/

const validaLogin = [
  check('email')
    .not().isEmpty().trim().withMessage('É obrigatório informar o email do usuário para o login')
    .isEmail().withMessage('O email para validar o login deve ser válido'),
  check('senha')
    .not().isEmpty().trim().withMessage('É obrigatório informar a senha do usuário para o login')
    .isLength({ min: 6 }).withMessage('A senha deve conter no mínimo 6 caracteres')
]

router.post('/login', validaLogin,
  async (req, res) => {
    const schemaErrors = validationResult(req)
    if (!schemaErrors.isEmpty()) {
      return res.status(403).json(({
        errors: schemaErrors.array() //retorna um Forbidden
      }))
    }

    const { email, senha } = req.body
    try {
      //Iremos localizar o usuário através do e-mal informado
      let usuario = await db.collection(nomeCollection).find({ email }).limit(1).toArray()
      //Se o array estiver vazio, é que o email não está cadastrado
      if (!usuario.length)
        return res.status(404).json({
          errors: [
            {
              value: `${email}`,
              msg: 'Não há nenhum usuário cadastrado com o email informado',
              param: 'email'
            }
          ]
        })
      const isMatch = await bcrypt.compare(senha, usuario[0].senha)
      if (!isMatch)
        return res.status(403).json({
          errors: [
            {
              value: '',
              msg: 'A senha informada está incorreta',
              param: 'senha'
            }
          ]
        })

      const payload = {
        usuario: {
          id: usuario[0]._id,
          nome: usuario[0].nome,
          tipo: usuario[0].tipo
        }
      }
      
      jwt.sign(
        payload,
        process.env.SECRET_KEY,
        {
          expiresIn: process.env.EXPIRES_IN
        },
        (err, token) => {
          if (err) throw err
          setTokenCookie(res, token)
          res.status(200).json({
            access_token: token
          })

        }
      )
    } catch (e) {
      console.error(e)
      res.status(500).json({
        errors: [
          {
            value: `${err.message}`,
            msg: 'Erro ao gerar o token',
            param: 'token'
          }
        ]
      })
    }
  }
)

/**********************************************
 * POST /estudantes/token
 * Verifica se o token informado é válido
 **********************************************/

router.post('/token', async (req, res) => {
  try {
    // O token é enviado junto com a requisição
    //const { access_token } = req.body
    console.log(req.cookies)
    const access_token = req.cookies.refreshToken;
    
    const decoded = jwt.verify(access_token, process.env.SECRET_KEY)
    const usuarioToken = decoded.usuario
    try {
      res.status(200).json({
        access_token: access_token,
        usuario: usuarioToken
      })
    } catch (err) {
      res.status(500).send({
        errors: [
          {
            value: `${err.message}`,
            msg: 'Erro ao gerar o token',
            param: 'token'
          }
        ]
      })
    }
  } catch (e) {
    res.send({
      errors: [
        {
          value: `${e.message}`,
          msg: 'Erro ao validar os dados do usuário logado',
          param: 'token'
        }
      ]
    })
  }
})

function setTokenCookie(res, token)
{
    // create http only cookie with refresh token that expires in 1 days
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 24*60*60*1000)
    }
    res.cookie('refreshToken', token, cookieOptions);
}

export default router