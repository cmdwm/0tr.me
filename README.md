<div align="center">
<img src="https://user-images.githubusercontent.com/70700766/227785476-b52f0810-25e8-438f-a8d5-239ead0eb6e9.png" alt="0tr.me logo" width="100">
<h1>0tr.me</h1>
<p>URL shortener and file host compatible with ShareX & monetized with Stripe</p>
<video width="320" height="240" controls>
  <source src="https://github.com/cmdwm/0tr.me/raw/main/demo-video.mp4" type="video/mp4">
</video>
</div>

***
#### Current features + more
- URL shortening with pre-generated slugs + custom slugs
- Publicly decode slugs and show the long URL behind them
- File hosting with directory clear every 12 hours to save resources
- Support for custom domains via DNS `A` record
- Monetized with [EthicalAds](https://ethicalads.io) & [Stripe](https://stripe.com) to support user payments
- Custom ShareX uploader integration (see `./ShareX/`)
- Custom GitHub analytics showing all contributors on home page
***
#### Upcoming features
- [ ] Add section that shows all monetary contributors (via Stripe API)
- [ ] Keep monetary contributor uploaded files forever (waive 12hr limit)
- [ ] Better error handling, especially at the root

#### Currently working on
- [x] Add more ways to monetize the site without asking for static donations
- [x] Grow the userbase without spending tons on Google Ads, etc

See something on this list that you can add? Make a pull request and you'll be listed on our homepage forever!

## Self Hosting
While I don't plan on providing support for self-hosting, I can tell you some basic things to get you started. This project is programmed in Node (obviously), with Express.js to serve content and qjson-db to store slugs. 

Just clone this GitHub repo, and download all the prerequisites. You can find them in `package.json`.  

You can spin up a free host on [Replit ⠕](https://replit.com) or [🎏 Glitch](https://glitch.com).

### The .env file

The .env file has a few simple keys in them. You can rename these to suite your infrastructure better. Stripe information can be found at [dashboard.stripe.com](https://dashboard.stripe.com)

`wave` - Gradient information for wave gradient on home page, not required

`stripeApi` - Stripe.com API key for payments

`stripePriceId` - Stripe Price ID for Custom URL slug payments

I'm not going to include that in this project, but you can simply grab the code by viewing the source at [https://0tr.me](https://0tr.me). 

## Reporting bugs
It would be great if you could not only report bugs you find (by opening an issue), but create a pull request that helps solve it too. If you contribute, you'll be listed on the homepage forever. 

## License
This project essentially has a do whatever you want license. You can copy code, host this locally, or steal it with or without credit (even though it is greatly appreciated to linkback to my [website](https://willm.xyz)). Please note any `cdn.glitch.global` files are subject to copyright by their lawful owner. 

[![buy me a coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-FFDD00.svg?style=for-the-badge&logo=Buy-Me-A-Coffee&logoColor=black  'buy me a coffee')](https://bmc.xyz/willymuffin) [![cashapp](https://img.shields.io/badge/Cash%20App-00C244.svg?style=for-the-badge&logo=Cash-App&logoColor=white 'cashapp')](https://cash.app/$willmccrudden) 