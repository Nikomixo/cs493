var express = require('express');
var app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.status(200).send("Hello World");
})

app.listen(PORT, function () {
    console.log(`Server is listening on port ${PORT}`);
})