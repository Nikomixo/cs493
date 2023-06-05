/*
 * API sub-router for businesses collection endpoints.
 */
const crypto = require('crypto');

const { Router } = require('express');

const { validateAgainstSchema } = require('../lib/validation')
const {
  PhotoSchema,
  insertNewPhoto,
  getPhotoById,
  removeUploadedFile
} = require('../models/photo')

const router = Router()

const multer = require('multer');

const imageTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png'
}

const upload = multer({
  storage: multer.diskStorage({
    destination: `${__dirname}/uploads`,
    filename: (req, file, callback) => {
      const filename = crypto.pseudoRandomBytes(16).toString('hex');
      const extension = imageTypes[file.mimetype];
      callback(null, `${filename}.${extension}`);
    }
  }),
  fileFilter: (req, file, callback) => {
    callback(null, !!imageTypes[file.mimetype]);
  }
});

/*
 * POST /photos - Route to create a new photo.
 */
router.post(
  '/',
  upload.single('image'),
  (err, req, res, next) => {
    console.log(err);
    res.status(500).send({
      err: "An error occurred. Try again later."
    });
  },
  async (req, res) => {
    console.log(req.file);
    if (validateAgainstSchema(req.body, PhotoSchema) && req.file) {
      console.log("Validated!");
      try {
        const photo = {
          contentType: req.file.mimetype,
          filename: req.file.filename,
          path: req.file.path,
          businessId: req.body.businessId
        };

        const id = await insertNewPhoto(photo)
        await removeUploadedFile(req.file)
        res.status(201).send({
          id: id,
          links: {
            photo: `/media/images/${photo.filename}`,
            business: `/businesses/${req.body.businessId}`
          }
        })
      } catch (err) {
        console.error(err)
        res.status(500).send({
          error: "Error inserting photo into DB.  Please try again later."
        })
      }
    } else {
      res.status(400).send({
        error: "Request body is not a valid photo object"
      })
    }
  }
)

/*
 * GET /photos/{id} - Route to fetch info about a specific photo.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const photo = await getPhotoById(req.params.id)
    if (photo) {
      const responseBody = {
        _id: photo._id,
        url: `/media/images/${photo.filename}`,
        contentType: photo.metadata.contentType,
        businessId: photo.metadata.businessId
      };

      res.status(200).send(responseBody)
    } else {
      next()
    }
  } catch (err) {
    console.error(err)
    res.status(500).send({
      error: "Unable to fetch photo.  Please try again later."
    })
  }
})

module.exports = router
