#wpbackup2html

## What it is
This is a small node application for converting Wordpress backup files to functional local HTML websites. This was created for use after [1 More Castle](http://1morecastle.com) shut down as a way to give contributors their posts in a format they could use.


## What it isn't
This is not currently a foolproof exporter. Paragraph tags are not added, captions get mangled, and anything in square brackets are not going to be formatted correctly. That being said, if you're interested in adding support, send a pull request.

##Usage
`node app.js -f myWordpressBackup.xml`

## How to customize
If you'd like to change how the generated site is structured and styled, check out the the `/assets/` directory. The two CSS files get copied over, and the EJS files are templates for the home page and post pages. If you'd like more attributes passed through, you can add them in `/lib/createsite.js` in the `createPage` function.