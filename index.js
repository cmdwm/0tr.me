const express = require('express');
const app = express();
const multer = require('multer');
const cron = require('node-cron');
const fs = require('fs');
const stripe = require('stripe')(process.env.stripeApi);
const path = require('path');
const rateLimit = require('express-rate-limit')
var randomstring = require("random-string-gen");
const qjson = require("qjson-db");
var request = require('request');
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
app.use('/upload', apiLimiter)

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
    return `<li style="margin: 0;"><a href="https://github.com/${contributor.login}">` + contributor.login + `</a></li>`;
  }).join(' ');
  
  // Log the single string containing all contributor names
  db.set('contributors', `<ul>` + contributorNames + `</ul>`);
});
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const newName = `${randomstring(7)}${ext}`;
    cb(null, newName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // limit file size to 10MB
});

app.get('/checkout/custom', async function(req, res) {
  try {
    if(!req.query.url && !req.query.slug) return res.send(`Error: No required query. <br>Just email hi@willm.xyz and I'll look into this/give you a refund if it was a payment issue.`)
  if(db.get(req.query.slug)) return res.send(`<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="UTF-8"><title>checkout | otter</title><style>body{font-family:Arial,sans-serif}</style></head><body><h1><code>${req.query.slug}</code> is not availabe. <br>Why don't you try something else?</h1></body></html>`)
  
  const session = await stripe.checkout.sessions.create({
  success_url: 'https://0tr.me/checkout/success?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'https://0tr.me',
  line_items: [
    {price: process.env.stripePriceId, quantity: 1},
  ],
  mode: 'payment',
  allow_promotion_codes: true,
    currency: 'USD',
    submit_type: 'donate',
    metadata: 
      {
        'slug': req.query.slug,
        'url': req.query.url
      }
});

 console.log(session)
  res.redirect(session.url)
   } catch(e) {
    res.send('Error: ' + e + ` <br>Just email hi@willm.xyz and I'll look into this/give you a refund if it was a payment issue.`)
  }
})

app.get('/checkout/success', async function(req, res) {
  try {
  const session = await stripe.checkout.sessions.retrieve(
  req.query.session_id
);

var slug = session.metadata.slug
var url = session.metadata.url  
if(!db.get(slug)) {
  db.set(slug, url)
  res.send(`<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="UTF-8"><title>checkout | otter</title><style>body{font-family:Arial,sans-serif}</style></head><body><h1>Thanks for your support.<br><code>${slug}</code> now redirects to <code>${url}</h1></body></html>`)
} else {
  const refund = await stripe.refunds.create({
  charge: 'ch_3KPeitGfJInaiKt01jnwZOnq',
  amount: 40, // keep the 10 cents as a convience fee, user agrees to this at checkout
  reason: 'Slug' + slug + ' not available, for some reason.'
})

  console.log(refund)
  res.send(`<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="UTF-8"><title>checkout | otter</title><style>body{font-family:Arial,sans-serif}</style></head><body><h1>We're sorry.<br><code>${slug}</code> was claimed quickly while you were checking out. Your transaction was refunded.</h1></body></html>`)
  
}
  } catch(e) {
    res.send('Error: ' + e + ` <br>Just email hi@willm.xyz and I'll look into this/give you a refund if it was a payment issue.`)
  }

})

app.get('/', (req, res) => {
  var contributors = db.get('contributors')
    res.render('index', {
     'contributors': contributors
    });
});

app.get('/i/:file', function(req, res) {
  const filePath = __dirname + '/uploads/' + req.params.file;
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, function(err) {
    if (err) {
      console.error(err);
      res.redirect('/');
    } else {
      res.sendFile(filePath);
    }
  });
});

app.post('/upload', upload.single('file'), function(req, res) {
  if(!req.file) return res.send('No file/valid image type given. Try again.')
   const { filename, mimetype, path } = req.file;
  
  // Return file information in response
  res.redirect(`/i/${filename}`)
});

app.get('/decode', function(req, res) {
  try {
    if(!req.query.slug) return res.send(`You didn't enter a slug. Try again.`)
    if(!db.get(req.query.slug)) return res.send(`The slug doesn't exist. Try again.`)
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

// Schedule cron job to clear uploads directory every minute
cron.schedule('0 */12 * * *', function() {
  // Delete contents of uploads directory
  fs.readdir(__dirname + '/uploads', function(err, files) {
    if (err) {
      console.error(err);
      return;
    }
    for (const file of files) {
      fs.unlinkSync(`uploads/${file}`);
    }
    console.log('Uploads directory cleared!');
  });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
