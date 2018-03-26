const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser')
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI);


app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));

app.listen(PORT, error => {
    error
    ? console.error(error)
    : console.info(`🌎\nListening on port ${PORT}. Visit http://localhost:${PORT}/ in your browser.`);
});
