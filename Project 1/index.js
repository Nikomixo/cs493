var express = require('express');
var app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
//dummy data
var businesses = [
    {
        "id": 0,
        "name": "Pedro's BBQ",
        "street": "YumYum St.",
        "city": "Portland",
        "state": "OR",
        "zip": 97006,
        "phone": "555-231-2381",
        "category": "Restaurant",
        "subcategory": "Texas BBQ"
    },
    {
        "id": 1,
        "name": "DcDonalds",
        "street": "YumYum St.",
        "city": "Portland",
        "state": "OR",
        "zip": 97006,
        "phone": "555-231-2183",
        "category": "Restaurant",
        "subcategory": "Fast Food"
    },
    {
        "id": 2,
        "name": "Flormart",
        "street": "Shoppee St.",
        "city": "Portland",
        "state": "OR",
        "zip": 97006,
        "phone": "555-221-7788",
        "category": "General Market",
        "subcategory": "General Market"
    },
    {
        "id": 3,
        "name": "SpeedLane",
        "street": "Shoppee St.",
        "city": "Portland",
        "state": "OR",
        "zip": 97006,
        "phone": "555-111-1234",
        "category": "Recreation",
        "subcategory": "Go-Kart Track"
    }
];

var photos = [
    {
        "url": "https://media.cnn.com/api/v1/images/stellar/prod/220726123942-mcdonalds-earnings.jpg?c=original",
        "caption": "yummy yummy in my tummy tummy"
    },
    {
        "url": "https://media-cdn.tripadvisor.com/media/photo-s/0a/a4/97/88/chipotle-bend-oregon.jpg",
        "caption": ""
    }
]

var reviews = [
    {
        "user": "Johnny Cash",
        "review": "Wow this place rocks!!",
        "rating": 4.5,
        "price": "$"
    },
    {
        "user": "Negative Nancy",
        "review": "Wow this place sucks!!",
        "rating": 0,
        "price": "$$$"
    },
]

app.get('/', (req, res) => {
    res.status(200).send("Project 1");
})

/*****************************
 *
 *   Business endpoints
 *
 *****************************/

// /businesses = list all businesses (page 1)
// /businesses?page={x} = list all businesses (page x)
app.get('/businesses', (req, res) => {
    var page = parseInt(req.query.page) || 1;

    // how many businesses per page
    const numPerPage = 3;
    var lastPage = Math.ceil(businesses.length / numPerPage);

    // test if 1 < page < lastPage;
    page = page < 1 ? 1 : page;
    page = page > lastPage ? lastPage : page;

    var start = (page - 1) * numPerPage;
    var end = start + numPerPage;

    var pageBusinesses = businesses.slice(start, end);

    var links = {};
    if (page < lastPage) {
        links.nextPage = '/businesses?page=' + (page + 1);
        links.lastPage = '/businesses?page=' + lastPage;
    }
    if (page > 1) {
        links.prevPage = '/businesses?page=' + (page - 1);
        links.firstPage = '/businesses?page=1';
    }

    res.status(200).json({
        pageNumber: page,
        totalPages: lastPage,
        pageSize: numPerPage,
        totalCount: businesses.length,
        businesses: pageBusinesses,
        links: links
    });
})

// /businesses/{id} = return detailed information about business {id}
app.get('/businesses/:id', (req, res, next) => {
    var id = req.params.id;

    if (businesses[id]) {
        res.status(200).send(
            {
                ...businesses[req.params.id],
                'photos': photos,
                'reviews': reviews
            }
        );
    } else {
        next();
    }
})

// adding business via POST 
app.post('/businesses', (req, res) => {

    if (req.body && req.body.name && req.body.street && req.body.city && req.body.state && req.body.zip && req.body.phone && req.body.category && req.body.subcategory) {
        res.status(201).json({
            id: businesses.length - 1,
            links: {
                business: '/businesses/' + (businesses.length - 1)
            }
        })
    } else {
        res.status(400).json({
            err: "Request is missing fields"
        });
    }
})

// updating businesses via PUT
app.put('/businesses/:id', (req, res, next) => {
    var id = req.params.id;

    if (businesses[id]) {
        if (req.body && req.body.name && req.body.street && req.body.city && req.body.state && req.body.zip && req.body.phone && req.body.category && req.body.subcategory) {
            res.status(201).json({
                id: id,
                links: {
                    business: '/businesses/' + id
                }
            })
        } else {
            res.status(400).json({
                err: "Request is missing fields"
            });
        }
    } else {
        next();
    }
})

// deleting business via DELETE
app.delete('/businesses/:id', (req, res, next) => {
    var id = req.params.id;

    if (businesses[id]) {
        res.status(204).end();
    } else {
        next();
    }
})

/*****************************
 *
 *   Review endpoints
 *
 *****************************/

// writing new review via post
app.post('/reviews', (req, res) => {
    if (req.body && req.body.rating && req.body.price && req.body.business_id >= 0) {
        if (businesses[req.body.business_id]) {
            res.status(201).json({
                id: reviews.length,
                links: {
                    reviews: '/reviews/' + (reviews.length - 1)
                }
            })
        } else {
            res.status(400).json({
                err: "Invalid business id"
            })
        }
    } else {
        res.status(400).json({
            err: "Request is missing fields"
        });
    }
})

// editing previous review via put
app.put('/reviews/:id', (req, res, next) => {
    var id = req.params.id;

    if (reviews[id]) {
        if (req.body && req.body.rating && req.body.price && req.body.business_id >= 0) {
            if (businesses[req.body.business_id]) {
                res.status(200).json({
                    id: id,
                    links: {
                        reviews: '/reviews/' + id
                    }
                })
            } else {
                res.status(400).json({
                    err: "Invalid business id"
                })
            }
        } else {
            res.status(400).json({
                err: "Request is missing fields"
            });
        }
    } else {
        next();
    }
})

// deleting previous review via delete
app.delete('/reviews/:id', (req, res, next) => {
    var id = req.params.id;

    if (reviews[id]) {
        res.status(204).end();
    } else {
        next();
    }
})

/*****************************
 *
 *   Photo endpoints
 *
 *****************************/

// uploading new photo with post (caption optional)
app.post('/photos', (req, res) => {
    if (req.body && req.body.url && req.body.business_id >= 0) {
        if (businesses[req.body.business_id]) {
            res.status(201).json({
                id: photos.length,
                links: {
                    reviews: '/photos/' + (photos.length - 1)
                }
            })
        } else {
            res.status(400).json({
                err: "Invalid business id"
            })
        }
    } else {
        res.status(400).json({
            err: "Request is missing fields"
        });
    }
})

// editing previous photo caption via put
app.put('/photos/:id', (req, res, next) => {
    var id = req.params.id;

    if (photos[id]) {
        if (req.body && req.body.caption) {
            res.status(200).json({
                id: id,
                links: {
                    reviews: '/photos/' + id
                }
            })
        } else {
            res.status(400).json({
                err: "Request is missing fields"
            });
        }
    } else {
        next();
    }
})

// deleting previous photos via delete
app.delete('/photos/:id', (req, res, next) => {
    var id = req.params.id;

    if (photos[id]) {
        res.status(204).end();
    } else {
        next();
    }
})

/*****************************
 *
 *   User endpoints
 *
 *****************************/

// list all businesses they own
// same pagination system as above
app.get('/users/:id/businesses', (req, res, next) => {
    if (parseInt(req.params.id) + 1) {
        var id = req.params.id;
        var page = parseInt(req.query.page) || 1;

        // how many businesses per page
        const numPerPage = 3;
        var lastPage = Math.ceil(businesses.length / numPerPage);

        // test if 1 < page < lastPage;
        page = page < 1 ? 1 : page;
        page = page > lastPage ? lastPage : page;

        var start = (page - 1) * numPerPage;
        var end = start + numPerPage;

        var pageBusinesses = businesses.slice(start, end);

        var links = {};
        if (page < lastPage) {
            links.nextPage = '/users/:id/businesses?page=' + (page + 1);
            links.lastPage = '/users/:id/businesses?page=' + lastPage;
        }
        if (page > 1) {
            links.prevPage = '/users/:id/businesses?page=' + (page - 1);
            links.firstPage = '/users/:id/businesses?page=1';
        }

        res.status(200).json({
            userId: id,
            pageNumber: page,
            totalPages: lastPage,
            pageSize: numPerPage,
            totalCount: businesses.length,
            businesses: pageBusinesses,
            links: links
        });
    } else {
        next();
    }
})

// list all reviews they've written
app.get('/users/:id/reviews', (req, res, next) => {
    if (parseInt(req.params.id) + 1) {
        var id = req.params.id;
        var page = parseInt(req.query.page) || 1;

        // how many reviews per page
        const numPerPage = 3;
        var lastPage = Math.ceil(reviews.length / numPerPage);

        // test if 1 < page < lastPage;
        page = page < 1 ? 1 : page;
        page = page > lastPage ? lastPage : page;

        var start = (page - 1) * numPerPage;
        var end = start + numPerPage;

        var pageReviews = reviews.slice(start, end);

        var links = {};
        if (page < lastPage) {
            links.nextPage = '/users/:id/reviews?page=' + (page + 1);
            links.lastPage = '/users/:id/reviews?page=' + lastPage;
        }
        if (page > 1) {
            links.prevPage = '/users/:id/reviews?page=' + (page - 1);
            links.firstPage = '/users/:id/reviews?page=1';
        }

        res.status(200).json({
            userId: id,
            pageNumber: page,
            totalPages: lastPage,
            pageSize: numPerPage,
            totalCount: reviews.length,
            reviews: pageReviews,
            links: links
        });
    } else {
        next();
    }
})

// list all photos they've uploaded
app.get('/users/:id/photos', (req, res, next) => {
    if (parseInt(req.params.id) + 1) {
        var id = req.params.id;
        var page = parseInt(req.query.page) || 1;

        // how many reviews per page
        const numPerPage = 3;
        var lastPage = Math.ceil(photos.length / numPerPage);

        // test if 1 < page < lastPage;
        page = page < 1 ? 1 : page;
        page = page > lastPage ? lastPage : page;

        var start = (page - 1) * numPerPage;
        var end = start + numPerPage;

        var pagePhotos = photos.slice(start, end);

        var links = {};
        if (page < lastPage) {
            links.nextPage = '/users/:id/photos?page=' + (page + 1);
            links.lastPage = '/users/:id/photos?page=' + lastPage;
        }
        if (page > 1) {
            links.prevPage = '/users/:id/photos?page=' + (page - 1);
            links.firstPage = '/users/:id/photos?page=1';
        }

        res.status(200).json({
            userId: id,
            pageNumber: page,
            totalPages: lastPage,
            pageSize: numPerPage,
            totalCount: photos.length,
            photos: pagePhotos,
            links: links
        });
    } else {
        next();
    }
})


app.use('*', (req, res) => {
    res.status(404).send({
        err: "The requested resource does not exist."
    });
})

app.listen(PORT, function () {
    console.log(`Server is listening on port ${PORT}`);
})