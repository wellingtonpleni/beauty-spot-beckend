import {connectToDatabase} from './utils/mongodb.js'
import express from 'express'
import cors from 'cors'
const app = express();



app.use(cors()) //enable CORS-Cross-origin resource sharing

const { db, client } = await connectToDatabase();
app.get('/', async function (req, res, next) {



if(client.isConnected()) {
  const produtos = await db
  .collection("estados")
  .find()
console.log(produtos)
 
}
})

app.listen(8085, function () {
  console.log('CORS-enabled web server listening on port 8085')
})

