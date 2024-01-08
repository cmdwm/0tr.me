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
app.use('/email-submit', apiLimiter)
app.use('/upload', apiLimiter)
/* SPONSOR, PULL REQUEST START */
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
    return `<li style="margin: 0; color: black !important;"><a href="https://github.com/${contributor.login}">` + contributor.login.replace('cmdwm', 'cmdwm 🛠️') + `</a></li>`;
  }).join(' ');
  
  // Log the single string containing all contributor names
  db.set('contributors', `<ul>` + contributorNames + `</ul>`);
});

request('https://ghs.vercel.app/sponsors/cmdwm', (error, response, body) => {
  if (error) {
    console.log(error);
  } else {
    try {
 const data = JSON.parse(body);
    const sponsorNames = data.sponsors.map(sponsor => `<li style="margin: 0;"><a href="https://github.com/${sponsor.handle}">` + sponsor.handle + `</a></li>`);
    const fullText = '<ul>' + sponsorNames.join(' ') + '</ul>';
    db.set('ghSponsors', fullText)
    } catch(e) {
      console.log(e)
      db.set('ghSponsors', `<ul><li style="margin: 0; color: black !important">No sponsors yet 😢<br><a href=""</li></ul>`)
      // There was an error fetching sponsors. We're working to resolve this.
    }
  }
});
/* SPONSOR, PULL REQUEST END */

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
  limits: { fileSize: 25 * 1024 * 1024 }, // limit file size to 25MB
  fileFilter: function (req, file, cb) {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif']; // add any additional allowed mime types
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true); // accept the file
    } else {
      cb(new Error('Only image files are allowed.')); // reject the file
    }
  }
});

app.get('/favicon.ico', function(req, res) {
  res.sendFile(__dirname + '/0tr.png')
})

app.get('/contact', function(req, res) {
  res.render('contact')
})


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
if(!db.get(slug) && session.payment_status == 'paid') {
  db.set(slug, url)
  res.send(`<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="UTF-8"><title>checkout | otter</title><style>body{font-family:Arial,sans-serif}</style></head><body><h1>Thanks for your support.<br><code>${slug}</code> now redirects to <code>${url}</h1></body></html>`)
} else if(session.payment_status == 'unpaid') {
  res.send(`There was an issue processing your payment. If you were charged, it will drop off your bank statement soon. `)
} else {
  const refund = await stripe.refunds.create({
  payment_intent: session.payment_intent,
  amount: 40, // keep 10c for fee, user agrees to this at checkout
  reason: 'Slug' + slug + ' not available, for some reason.'
})

  console.log(refund)
  res.send(`<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="UTF-8"><title>checkout | otter</title><style>body{font-family:Arial,sans-serif}</style></head><body><h1>We're sorry.<br><code>${slug}</code> was claimed quickly while you were checking out. Your transaction was refunded.</h1></body></html>`)
  
}
  } catch(e) {
    res.send('Error: ' + e + ` <br>Just email hi@willm.xyz and I'll look into this/give you a refund if it was a payment issue.`)
  }

})
let urlCount
function formatNumber(num) {
    return num >= 1e6 ? (num / 1e6).toFixed(1) + 'M' : num >= 1e3 ? (num / 1e3).toFixed(1) + 'K' : num.toString();
}



app.get('/', (req, res) => {
  fs.readFile('storage.json', 'utf8', (err, data) => {
      if (err) return console.error("Error reading file:", err);

      try {
          const urls = new Set(Object.keys(JSON.parse(data)));
          urlCount = Math.ceil(urls.size / 2)
      } catch (error) {
          console.error("Error parsing JSON:", error);
      }
  });

  db.set('viewCount', db.get('viewCount') + 1)
  var contributors = db.get('contributors')
  var sponsors = db.get('ghSponsors')
    res.render('index', {
     'contributors': contributors,
    'sponsors': sponsors,
    'urls': formatNumber(urlCount + 1000),
    'views':formatNumber(db.get('viewCount') + 119512),
    'images': formatNumber(Number(db.get('uploadCount')) + 63)
    });
});

app.get('/i/:file', function(req, res) {
  db.set('viewCount', db.get('viewCount') + 1)
  const filePath = __dirname + '/uploads/' + req.params.file;
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, function(err) {
    if (err) {
      console.error(err);
      //res.redirect('/');
      res.sendFile(__dirname + '/image_file.png')
    } else {
      res.sendFile(filePath);
    }
  });
});

app.post('/upload', upload.single('file'), function(req, res) {
  db.set('uploadCount', Number(db.get('uploadCount')) + 1)
let shareUrl
if(!req.query.xUrl) {
  shareUrl = 'https://0tr.me'
} else {
  shareUrl = 'https://' + req.query.xUrl
}

  
  if(!req.file) return res.send('No file/valid image type given. Try again.')
  var m = req.file.mimetype
 // if(!m || m !== 'image/png' || m !== 'image/jpg' || m !== 'image/jpg' || m !== 'image/jpeg' || m !== 'image/gif') return
   const { filename, mimetype, path } = req.file;
  
  // Return file information in response
  res.redirect(shareUrl + `/i/${filename}`)
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



app.get('/qr', function(req, res) {
  var id = req.query.id;
  res.setHeader('Content-Disposition', `attachment; filename="qr-${id}.png"`);


//  res.redirect('https://quickchart.io/qr?text=https%3A%2F%2F0tr.me%2F${id}&light=5aa6c4&dark=ffffff&margin=0&size=200¢erImageUrl=https%3A%2F%2Fi.imgur.com%2Fcjub6gt.png')
request(`https://quickchart.io/qr?text=https%3A%2F%2F0tr.me%2F${id}&size=200&centerImageUrl=https%3A%2F%2Fi.imgur.com%2Fcjub6gt.png`).pipe(res)
  
  //or we could pipe it with the non-pretty request('https://api.qrserver.com/v1/create-qr-code/?size=150x1500&data=https://0tr.me/' + id).pipe(res);

})

app.get('/submit', function(req, res) {
  db.set('viewCount', db.get('viewCount') + 1)
  var slug = randomstring(7);
  var url = req.query.url
  var views = db.get(slug.views)
  if(!url) return res.send('No Long URL specified. Try again.')
if(url.includes('0tr.me/')) return res.render('submit', {
  slug: url.replace('0tr.me/', '').replace('http://', '').replace('https://', ''),
  url: url,
  views: db.get(slug.views)
})
  try {
    if(db.get(url)) return res.render('submit', { slug: db.get(url), url: url, views: views })
db.set(url, slug) //backward compatibility
  db.set(slug, url)
  db.set(slug.views, 0)
    res.render('submit', {
      slug: slug,
      url: url,
      views: views
    })
  } catch {
    res.send('wah')
  }
})

app.get('/submit', function(req, res) {
  var slug = randomstring(7);
  var url = req.query.url

  if(!url || url.includes('0tr.me/') || url.includes('is-rocket.science/')) return res.send(`Please try again by sending a long URL in the subject line of your E-mail.`)
  
  try {
    if(db.get(url)) return res.send(`https://0tr.me/${db.get(url)}`)
db.set(url, slug) //backward compatibility
  db.set(slug, url)
   res.send(`${url} is now ${slug}`)
  } catch {
   res.send(`There was an issue.`)
  }
})

app.get('/undefined', function(req, res) {
 res.sendFile(__dirname + '/short_url.png')
})

app.get('/:id', function(req, res) {
  db.set('viewCount', db.get('viewCount') + 1)
  try {
    db.set(req.params.id.views, db.get(req.params.id.views) + 1)
    res.redirect(db.get(req.params.id))
  } catch {
    res.send('Short URL was not found.')
  }
})

// Schedule cron job to clear uploads directory every 12 hours
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
