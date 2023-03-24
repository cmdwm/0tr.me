const express = require('express');
const app = express();
const rateLimit = require('express-rate-limit')
var randomstring = require("random-string-gen");
const qjson = require("qjson-db");
const fetch = require('node-fetch')
const db = new qjson(__dirname + "/storage.json");

const wave = process.env.wave
app.set('view engine', 'ejs');
app.use('/static',express.static(__dirname + '/views/static'));

const apiLimiter = rateLimit({
	windowMs: 5 * 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, 
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Apply the rate limiting middleware to API calls only
app.use('/submit', apiLimiter)

var request = require('request');
var options = {
  'method': 'GET',
  'url': 'https://api.github.com/repos/cmdwm/0tr.me/contributors',
  'headers': {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
  }
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);
  
  var contributors = JSON.parse(body);
  
  // Concatenate the login names of all contributors into a single string
  var contributorNames = contributors.map(function(contributor) {
    return `<li><a href="${contributor.login}">` + contributor.login + `</a></li>`;
  }).join('<br>');
  
  // Log the single string containing all contributor names
  db.set('contributors', `<ul>` + contributorNames + `</ul>`);
});





app.get('/', (req, res) => {
  var contributors = db.get('contributors')
    res.render('index', {
     'contributors': contributors
    });
});

app.get('/decode', function(req, res) {
  try {
    res.send(db.get(req.query.slug))
  } catch {
    res.send("The slug doesn't exist. Try again.")
  }
})

app.get('/submit', function(req, res) {
  var slug = randomstring(7);
  var url = req.query.url

  if(!url) return res.send('No Long URL specified. Try again.')
if(url.includes('0tr.me/') || url.includes('is-rocket.science/')) return res.send('You can\'t shorten an already-short URL! Try again.')
  try {
    if(db.get(url)) return res.render('submit', { slug: db.get(url), url: url })
db.set(url, slug) //backward compatibility
  db.set(slug, url)
    res.render('submit', {
      slug: slug,
      url: url
    })
  } catch {
    res.send('wah')
  }
})

app.get('/undefined', function(req, res) {
  res.redirect('/')
})

app.get('/:id', function(req, res) {
  try {
    res.redirect(db.get(req.params.id))
  } catch {
    res.send('Short URL was not found.')
  }
})

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
