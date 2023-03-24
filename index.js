const express = require('express');
const app = express();
const rateLimit = require('express-rate-limit')
var randomstring = require("random-string-gen");
const qjson = require("qjson-db");
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

app.get('/', (req, res) => {
  
    res.render('index', {
     'example': 'test'
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
