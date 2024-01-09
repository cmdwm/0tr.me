<div align="center">
<img src="https://user-images.githubusercontent.com/70700766/227785476-b52f0810-25e8-438f-a8d5-239ead0eb6e9.png" alt="0tr.me logo" width="100">
<h1>0tr.me</h1>
<p>Custom domain URL shortener and file host compatible with ShareX & monetized with Stripe</p>
<blockquote>See our <a href="https://building.0tr.me">changelog</a> for product updates</blockquote>

https://github.com/cmdwm/0tr.me/assets/35583237/ea26d9e9-7a00-4ae5-bb4f-6a61453c098d


</div>

***
#### Current features + more
- User dashboard powered by Kinde, allows users to track their own short links and edit/delete them
- Progressive Web App (PWA) on mobile devices + Windows & Mac
- Free integrated [Status Page](https://status.0tr.me) and [Changelog Site](https://building.0tr.me)
- URL shortening with pre-generated slugs + custom slugs
- URL Analytics such as views and generate Pretty QR codes
- Publicly decode slugs and preview the long URL behind them
- File hosting with directory clear every 12 hours to save resources
- Support for custom domains via DNS `CNAME` record
- Monetized with [EthicalAds](https://ethicalads.io) & [Stripe](https://stripe.com) to support user payments
- Custom ShareX uploader integration (see `./ShareX/`)
- Custom GitHub analytics showing all contributors on home page
- Includes section that shows all monetary contributors (via GH Sponsors)
***
#### Upcoming features
Hmm, quite empty. Suggest some on our new [Suggestions](https://building.0tr.me/suggestions) page!

#### Currently working on
- [x] Add more ways to monetize the site without asking for static donations
- [x] Keep monetary contributor uploaded files forever (waive 12hr limit)
- [x] Sanitize SVG formats to strip `<script>` tags

See something on this list that you can add? Make a pull request and you'll be listed on our homepage forever!

## Self Hosting
While I don't plan on providing support for self-hosting, I can tell you some basic things to get you started. This project is programmed in Node (obviously), with Express.js to serve content and qjson-db to store slugs. 

> Interested in using a free custom domain with 0tr.me? See [this section](https://0tr.me/#custom-domain) for instructions.

Just clone this GitHub repo, and download all the prerequisites. You can find them in `package.json`. You can spin up a free host on [Replit ⠕](https://replit.com) or [🎏 Glitch](https://glitch.com). Our main instance of 0tr.me is powered by [⚡️ GalaxyGate](https://galaxygate.net).

* **Important note:** You'll notice our public stats may seem falsely inflated. This is due to us not programatically counting analytics about 9 months after launch. You'll want to remove the inflation when selfhosting for an accurate count.

### The .env file

The .env file has a few simple keys in them. You can rename these to suite your infrastructure better. Stripe information can be found at [dashboard.stripe.com](https://dashboard.stripe.com)

`stripeApi` - Stripe.com API key for payments

`stripePriceId` - Stripe Price ID for Custom URL slug product

`KINDE_SECRET` - Kinde.com Secret Key for user auth

`KINDE_ID` - Kinde.com client ID for user auth

Don't forget to exit test mode when you push this to production 😎

## Reporting bugs
It would be great if you could not only report bugs you find (by opening an issue), but create a pull request that helps solve it too. If you contribute, you'll be listed on the homepage forever. 

## License
This project essentially has a do whatever you want license. You can copy code, host this locally, or steal it with or without credit (even though it is greatly appreciated to linkback to my [website](https://willm.xyz)). Please note any Glitch CDN files are subject to copyright by their lawful owner. 

[![buy me a coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-FFDD00.svg?style=for-the-badge&logo=Buy-Me-A-Coffee&logoColor=black  'buy me a coffee')](https://bmc.xyz/willymuffin) [![cashapp](https://img.shields.io/badge/Cash%20App-00C244.svg?style=for-the-badge&logo=Cash-App&logoColor=white 'cashapp')](https://cash.app/$willmccrudden) 
