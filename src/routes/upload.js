import express from 'express'
const router = express.Router()
import multer from 'multer'

//Definindo os filtros dos tipos de arquivo
const fileFilter = (req, file, cb) => {
    if ((file.mimetype).includes('jpeg') || 
        (file.mimetype).includes('png')  || 
        (file.mimetype).includes('jpg')) {
        cb(null, true);
    } else {
        cb(null, false);

    }

};

//Definindo a pasta padrão
const upload = multer({
    dest: './public/uploads',
    fileFilter: fileFilter
})



/********************************************
* Processo de upload de uma imagem
* POST /
*********************************************/
router.post('/', upload.array('file'),
    async (req, res) => {
        console.log(`Arquivos recebidos: ${req.files.length}`)
        const statusUpload = req.files.length > 0 ? true : false
        res.send({
            upload: statusUpload,
            files: req.files
        })
    })

export default router