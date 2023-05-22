const router = require('express').Router();
const { validateAgainstSchema, extractValidFields } = require('../lib/validation');
const { requireAuthentication, authenticate } = require('../lib/auth');

const { reviews } = require('./reviews');
const { photos } = require('./photos');

const db = require('../lib/connections');

exports.router = router;

/*
 * Schema describing required/optional fields of a business object.
 */
const businessSchema = {
  ownerId: { required: true },
  name: { required: true },
  address: { required: true },
  city: { required: true },
  state: { required: true },
  zip: { required: true },
  phone: { required: true },
  category: { required: true },
  subcategory: { required: true },
  website: { required: false },
  email: { required: false }
};

async function getBusinessesCount() {
  const [results] = await db.query(
    "SELECT COUNT(*) AS count FROM businesses"
  );
}

async function getBusinessesPage(page) {
  const count = await getBusinessesCount();

  const numPerPage = 10;
  const lastPage = Math.ceil(count / numPerPage);
  page = page > lastPage ? lastPage : page;
  page = page < 1 ? 1 : page;

  const offset = (page - 1) * numPerPage;

  const [results] = await db.query(
    'SELECT * FROM businesses ORDER BY id LIMIT ?, ?',
    [offset, numPerPage]
  );

  const links = {};
  if (page < lastPage) {
    links.nextPage = `/businesses?page=${page + 1}`;
    links.lastPage = `/businesses?page=${lastPage}`;
  }
  if (page > 1) {
    links.prevPage = `/businesses?page=${page - 1}`;
    links.firstPage = '/businesses?page=1';
  }

  /*
   * Generate HATEOAS links for surrounding pages.
   */
  return {
    businesses: results,
    pageNumber: page,
    totalPages: lastPage,
    pageSize: numPerPage,
    totalCount: count,
    links: links
  };
}

async function insertNewBusiness(business) {
  const validatedBusinesses = extractValidFields(
    business,
    businessSchema
  );

  const [result] = await db.query(
    'INSERT INTO businesses SET ?',
    validatedBusinesses
  );

  return result.insertId;
}

async function getBusinessById(businessId) {
  const [results] = await db.query(
    'SELECT * FROM businesses WHERE id = ?',
    [businessId]
  );

  return results[0];
}

async function updateBusinessById(businessId, business) {
  const validatedBusinesses = extractValidFields(
    business,
    businessSchema
  );

  const [result] = await db.query(
    'UPDATE businesses SET ? WHERE id = ?',
    [validatedBusinesses, businessId]
  );

  return result.affectedRows > 0;
}

async function deleteBusinessById(businessId) {
  const [result] = await db.query(
    'DELETE FROM businesses WHERE id = ?',
    [businessId]
  );
  return result.affectedRows > 0;
}

async function getOwnerFromBusiness(businessId) {
  const [result] = await db.query(
    'SELECT ownerId FROM businesses WHERE id = ?',
    [businessId]
  )

  return result[0].ownerId;
}

/*
 * Route to return a list of businesses.
 */
router.get('/', async function (req, res) {
  /*
   * Compute page number based on optional query string parameter `page`.
   */
  let page = parseInt(req.query.page) || 1;

  try {
    /*
    *  Build page from database query
    */
    const businessPage = await getBusinessesPage(page);
    res.status(200).json(businessPage);
  } catch (err) {
    res.status(500).json({
      error: "Error fetching businesses list. Try again later."
    })
  }
});

/*
 * Route to create a new business.
 */
router.post('/', requireAuthentication, async function (req, res, next) {
  try {
    if (authenticate(req.body.ownerId, req)) {
      console.log(req.body);
      const id = await insertNewBusiness(req.body);
      res.status(201).json({
        id: id,
        links: {
          business: `/businesses/${id}`
        }
      });
    } else {
      res.status(403).json({
        error: "Unable to insert business into db."
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      error: "Unable to insert business into db."
    });
  }
});

/*
 * Route to fetch info about a specific business.
 */
router.get('/:businessid', async function (req, res, next) {
  const businessid = parseInt(req.params.businessid);
  try {
    const business = await getBusinessById(businessid);
    if (business) {
      res.status(200).json(business);
    } else {
      next();
    }
  } catch (err) {
    res.status(500).json({
      error: "Unable to retrieve business."
    });
  }
});

/*
 * Route to replace data for a business.
 */
router.put('/:businessid', requireAuthentication, async function (req, res, next) {
  const businessid = parseInt(req.params.businessid);

  try {
    ownerId = await getOwnerFromBusiness(businessid);
    if (authenticate(ownerId, req)) {
      const updateStatus = await updateBusinessById(businessid, req.body);
      if (updateStatus) {
        res.status(200).json({
          links: {
            business: `/businesses/${businessid}`
          }
        })
      } else {
        next();
      }
    } else {
      res.status(403).json({
        error: "Unauthorized to perform this action."
      });
    }
  } catch (err) {
    res.status(500).json({
      error: "Unable to update business."
    });
  }
});

/*
 * Route to delete a business.
 */
router.delete('/:businessid', requireAuthentication, async function (req, res, next) {
  const businessid = parseInt(req.params.businessid);
  try {
    ownerId = await getOwnerFromBusiness(businessid);
    if (authenticate(ownerId, req)) {
      deleteStatus = await deleteBusinessById(businessid);
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
      error: "Unable to delete business."
    })
  }
});
