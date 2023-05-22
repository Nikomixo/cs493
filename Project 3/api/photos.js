const router = require('express').Router();
const { validateAgainstSchema, extractValidFields } = require('../lib/validation');
const { requireAuthentication, authenticate } = require('../lib/auth');

const db = require('../lib/connections');

exports.router = router;

/*
 * Schema describing required/optional fields of a photo object.
 */
const photoSchema = {
  userId: { required: true },
  businessId: { required: true },
  caption: { required: false }
};

async function insertNewPhotos(photo) {
  const validatedPhotos = extractValidFields(
    photo,
    photoSchema
  );

  const [result] = await db.query(
    'INSERT INTO photos SET ?',
    validatedPhotos
  );

  return result.insertId;
}

async function getPhotoById(photoid) {
  const [results] = await db.query(
    'SELECT * FROM photos WHERE id = ?',
    [photoid]
  );

  return results[0];
}

async function updatePhotoById(photoid, photo) {
  const validatedPhotos = extractValidFields(
    photo,
    photoSchema
  );
  const [result] = await db.query(
    'UPDATE photos SET ? WHERE id = ?',
    [validatedPhotos, photoid]
  );
  return result.affectedRows > 0;
}

async function deletePhotoById(photoid) {
  const [result] = await db.query(
    'DELETE FROM photos WHERE id = ?',
    [photoid]
  );
  return result.affectedRows > 0;
}

async function getUserFromPhoto(photoid) {
  const [result] = await db.query(
    'SELECT userId FROM photos WHERE id = ?',
    [photoid]
  )

  return result[0].userId;
}

/*
 * Route to create a new photo.
 */
router.post('/', requireAuthentication, async function (req, res, next) {
  try {
    if (authenticate(req.body.userId, req)) {
      const id = await insertNewPhotos(req.body);
      const photo = extractValidFields(req.body, photoSchema);

      res.status(201).json({
        id: id,
        links: {
          photo: `/photos/${id}`,
          business: `/businesses/${photo.businessId}`
        }
      })
    } else {
      res.status(403).json({
        error: "Unable to insert photo into db."
      });
    }
  } catch (err) {
    res.status(400).json({
      error: "Request body is not a valid photo object"
    });
  }
});

/*
 * Route to fetch info about a specific photo.
 */
router.get('/:photoID', async function (req, res, next) {
  const photoid = parseInt(req.params.photoID);
  try {
    const photo = await getPhotoById(photoid);
    if (photo) {
      res.status(200).json(photo);
    } else {
      next();
    }
  } catch (err) {
    res.status(500).json({
      error: "Unable to retrieve photo."
    });
  }
});

/*
 * Route to update a photo.
 */
router.put('/:photoID', requireAuthentication, async function (req, res, next) {
  const photoid = parseInt(req.params.photoID);

  if (validateAgainstSchema(req.body, photoSchema)) {
    /*
      * Make sure the updated photo has the same businessid and userid as
      * the existing photo.
      */
    userId = await getUserFromPhoto(photoid);
    if (authenticate(userId, req)) {
      let updatedPhoto = extractValidFields(req.body, photoSchema);
      let existingPhoto = await getPhotoById(photoid);
      if (updatedPhoto.photoId === existingPhoto.photoId && updatedPhoto.userId === existingPhoto.userId) {
        try {
          updateStatus = await updatePhotoById(photoid, req.body);
          if (updateStatus) {
            res.status(200).json({
              links: {
                photo: `/photos/${photoid}`,
                business: `/businesses/${updatedPhoto.businessId}`
              }
            });
          } else {
            next();
          }
        } catch (err) {
          error: "Unable to update photo."
        }
      } else {
        res.status(403).json({
          error: "Updated photo cannot modify photoid or userid"
        });
      }
    } else {
      res.status(403).json({
        error: "Unauthorized to perform this action."
      });
    }
  } else {
    res.status(400).json({
      error: "Request body is not a valid photo object"
    });
  }
});

/*
 * Route to delete a photo.
 */
router.delete('/:photoID', requireAuthentication, async function (req, res, next) {
  const photoid = parseInt(req.params.photoID);
  try {
    userId = await getUserFromPhoto(photoid);
    if (authenticate(userId, req)) {
      deleteStatus = await deletePhotoById(photoid);
      if (deleteStatus) {
        res.status(204).end();
      } else {
        next();
      }
    } else {
      res.status(403).json({
        error: "Unauthorized to perform this action."
      });
    }
  } catch (err) {
    res.status(500).send({
      error: "Unable to delete photo."
    })
  }
});
