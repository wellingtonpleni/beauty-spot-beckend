import express from 'express'
import fetch from 'node-fetch'

import { config } from 'dotenv'
config() // carrega as variáveis definidas no .env
const { MAP_QUEST_API_KEY } = process.env


const router = express.Router()

/**********************************************
 * GET /api/mapquest
 * Retorna o endereço a partir da latitude e longitude informados
 **********************************************/
router.get('/', async (req, res) => {
  const {lat, lng} = req.query
  try {
    let url = `http://www.mapquestapi.com/geocoding/v1/reverse?key=${MAP_QUEST_API_KEY}&location=${lat},${lng}`

    const endereco = await fetch(url)
    const dadosEndereco = await endereco.json()
    res.status(200).json(dadosEndereco.results[0])
  } catch (err) {
    res.status(500).json({
      errors: [
        {
          value: `${err.message}`,
          msg: 'Erro ao obter o endereço na API MapQuest',
          param: '/'
        }
      ]
    })
  }
})

export default router