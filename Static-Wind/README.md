# Static Wind
A static webpage generator specifically for GitHub Page but in no way affiliate with GitHub Page.

## How it works?
First, it copy all of the files in the current branch to `Static-Wind/build`, which is an ignored folder. Then, it switches to Release branch, where is resolve all `html-src`. A simply `replaceAll()` Regex will then be performed to replace all keys in the translation file with its content`. After that, it make a commit and push. This is why the Release branch should be your GitHub page deploy branch.

## How to set up it?
Fork this repo, then set up `Static-Wind/config.json`. Start to build your page with set structure by the script:
- `pageEnglishURL`
    - `index.html`: this file will contain the layout and translation keys
    - `en.json`: basic English interpretation of the key
    - `<land_code>.json`: translation of the language

Another feature of this script is `html-src`, where if you put the attribute's property as the source file of the HTML. Then the script will simply fetch the content of the HTML file, then **prepend** innerHTML with the content. This is useful for repeative elements like the head element, navigation bar, or the footer.

However, you need to build the webpage to actually see it in action. To circumvent this, `Static-WInd/preview.js` provide a script that will fetch the content for you at hand. The problem now lie on the part that you need to have a static server to by-pass CORS.