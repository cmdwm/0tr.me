# 🦦 0tr.me URL shortener

Hello world! [0tr.me](https://0tr.me) is a free, open source and lightweight URL shortener. It has support for custom domains and decoding short links to expose the long URL behind it. 

## How to self-host it
While I don't plan on providing support for self-hosting, I can tell you some basic things to get you started. This project is programmed in Node (obviously), with Express.js to serve content and qjson-db to store slugs. 

Just clone this GitHub repo, and download all the prerequisites. You can find them in `package.json`. Most hosts download them automatically.

---
![hi](https://img.shields.io/badge/.ENV-ECD53F.svg?style=for-the-badge&logo=dotenv&logoColor=black)
The .env file has one simple key in it, used purely to save space in the project. It contains the SVG information needed for the gradient wave in `views/index.ejs`. 

I'm not going to include that in this project, but you can simply grab the code by viewing the source at [https://0tr.me](https://0tr.me). 

## Reporting bugs
It would be great if you could not only report bugs you find, but create a pull request that helps solve it too. 