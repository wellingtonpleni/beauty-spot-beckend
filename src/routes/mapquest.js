import express from 'express'
import fetch from 'node-fetch'

import { config } from 'dotenv'
config() // carrega as variáveis definidas no .env
const { MAP_QUEST_API_KEY } = process.env


const router = express.Router()

/*****************************************************************************
 * GET /api/mapquest/geo-reverse
 * Retorna o endereço/localização a partir da latitude e longitude informados
  ****************************************************************************/
router.get('/geo-reverse', async (req, res) => {
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

/*****************************************************************************
 * GET /api/mapquest/geo
 * Retorna a latitude e longitude a partir de um endereço/localização informado
  ****************************************************************************/
router.get('/geo', async (req, res) => {
  const {localizacao} = req.query
  try {
    let url = `http://www.mapquestapi.com/geocoding/v1/address?key=${MAP_QUEST_API_KEY}&location=${localizacao},BR`

    const endereco = await fetch(url)
    const dadosEndereco = await endereco.json()
    res.status(200).json(dadosEndereco.results[0])
  } catch (err) {
    res.status(500).json({
      errors: [
        {
          value: `${err.message}`,
          msg: 'Erro ao obter a latitude e longitude na API MapQuest',
          param: '/'
        }
      ]
    })
  }
})

export default router