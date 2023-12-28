# ShareX Integration (Custom Uploader) 
> **NEW:** 0tr.me Custom Domains now work with ShareX.

You can use ShareX to automatically share any screenshots you take on your PC to 0tr.me which copies the sharing link straight to your clipboard.
Keep in mind any limits displayed on 0tr.me apply to the custom uploader too.
## What you need to do

![Example GIF so you don't have to read directions](https://i.imgur.com/2yaZn0T.gif)

1. Download the `0tr-cu.sxcu` file from this directory & move it to Desktop
2. Double click to open the file and select "Yes" at the popup
3. Take a test screenshot to ensure everything works (`CTRL + PrtScn`)
4. Once done, `0tr.me/i/xxx.png` should be copied to your clipboard

## Custom domain?
1. Download the `0tr-cu.sxcu` file from this directory & open it in a text editor
2. Edit this line to include your custom URL, as such:
```json
"RequestURL": "https://0tr.me/upload?xURl=example.com"
```
3. It's important you only include your domain name as shown. We'll add `https://` behind the final link so you can copy & paste it anywhere.
4. Save your file and now follow steps from **What you need to do**.