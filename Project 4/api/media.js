const { Router } = require('express');
const router = Router();

const {
    getImageDownloadStreamByFilename
} = require('../models/photo')

router.get('/images/:filename', (req, res, next) => {
    getImageDownloadStreamByFilename(req.params.filename)
        .on('file', (file) => {
            res.status(200).type(file.metadata.contentType);
        })
        .on('error', (err) => {
            if (err.code === 'ENOENT') {
                next();
            } else {
                next(err);
            }
        })
        .pipe(res);
});

module.exports = router