/* This code is intended to work in the way of a node Module due to the server structure it was created for*/

var express = require('express')
var request = require('request')
const e2 = express();
e2.set('trust proxy', true)


e2.get('/', (req, res) => {
res.sendFile(__dirname + '/help.html')
});
e2.get('/:id', (req, res) => { //URLs
  res.redirect('https://0tr.me/' + req.params.id)
});

e2.get('/i/:id', (req, res) => { //Images
    request('https://0tr.me/i/' + req.params.id).pipe(res);
  
  });

  e2.get('*', (req, res) => { //404 or if someone does /e/t/c
    res.sendFile(__dirname + '/help.html')
    });

module.exports = { e2 };