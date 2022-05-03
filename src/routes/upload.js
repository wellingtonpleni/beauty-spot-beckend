import express from 'express'
const router = express.Router()
import multer from 'multer'
import * as path from 'path'


//Configurações do Multer (Pasta padrão e como será gravado o nome do arquivo)
const multerStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "./public");
    },
    filename: (req, file, callback) => {
        const ext = file.mimetype.split("/")[1];
        callback(null, `uploads/dogWalker-${file.originalname}-${Date.now()}.${ext}`);
    },
});

// Efetuando filtros dos tipos de arquivo
const multerFilter = (req, file, callback) => {
    let ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
        return callback(new Error('Apenas imagens são aceitas!'))
    }
    else {
        callback(null, true)
    }
}

//Calling the "multer" Function
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
})



/********************************************
* Processo de upload de uma imagem
* POST /
*********************************************/
const uploadSingleImage = upload.single('arquivo')

router.post('/', function (req, res) {

    uploadSingleImage(req, res, function (err) {
        if (err) { //ocorreu algum erro?
            return res.status(400).json({
                status: false,
                message: `Não foi possível efetuar o upload: ${err}`,
            })
        }
        const file = req.file;
        res.status(200).send({
            status: true,
            filename: file.filename,
            mimetype: file.mimetype,
            originalname: file.originalname,
            size: file.size,
            fieldname: file.fieldname
        })

    })
})

export default router


