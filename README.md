# Static Wind
A static webpage generator specifically for GitHub Page.

## How it works?
First, it copies all of the files in the current branch to `Static-Wind/build`, which is an ignored folder. Then, it switches to the Release branch, where it resolves all `html-src`. A simple `replaceAll()` Regex will then be performed to replace all keys in the translation file with its content. After that, it commits and pushes. This is why the Release branch should be your GitHub page deploy branch.

## How to set up it?
Git ignore the folder `Static-Wind`, then clone Static Wind into that folder. Start to build your page with a set structure by the script:
- `pageEnglishURL`
    - `index.html`: this file will contain the layout and translation keys
    - `en.json`: basic English interpretation of the key
    - `<lang_code>.json`: translation of the language

There are two options to view your webpage from here:
- Build the webpage with `npm run build`, which then the result will be in the Git-ignored folder `Static-Wind/build`; or
- Create a static server to serve the content with `npm run servePreview`, which then will serve the files with live update. This reduces the need to re-build everytime you need to change the content. The reason a static server is required is to by-pass CORS, so you can use other options and not limited to `npm run servePreview`. This also requires you to provide `Static-Wind/preview.js` at the end of every HTML file that you wish to preview.

## Features
### `html-src` attribute
This attribute simply specifies the path to the inner HTML that the user wishes to put it. For example, if the value is `a.html`, the script will fetch the content of `a.html` then **prepend** to the element's `innerHTML` value.

*Please noted that `Static-Wind/preview.js` is known to have problems with nested `html-src` due to its asycn nature.*

### Translations
After setting up `Static-Wind/config.json` (with example from `Static-Wind/!config.json`), you can now set up translation of each folder. Basic structure of a translation file `<lang_code>.json` (noted that this files must be in the same level as the `index.html` file that you want this translation to applied to.):
```json
{
    "URL": "The folder/URL of this translation that you want people to access",

    "a_translation_key": "This key will be replaced with this string."
}
```

There is also a special key called `lang_code`, which Static Wind will automatically replaced with the language code it is treating. This is useful for HTML's `lang` attribute.

## Reasons you DON'T want to use this script
If you can come up with a reason that specifically addresses your problem, usually it is better than using Static Wind. Static Wind was created as a one-size-fit-all solution, hence reducing the need to learn multiple frameworks or libraries to work; however, at the same time it has some specific requirements: it must be on GitHub, the attribute must be named `html-src`, and so on. These are weirdly specific but at the same time general, so it might not be suitable for you in that case.

I assume when you already hopped on GitHub and are reading this, you are probably fairly competent in coding. However, as a precaution, I must say this: having an intermediate understanding of HTML-CSS-JavaScript and Node JS is a **must** when using Static Wind. It ain't holding your hand. The alternatives include, but are not limited to Pug, Markdown, and WordPress.

This project exposes the developer to the bare bones of everything and offers very few features. This makes customizing the source code, depending on your usage, is a must. If you get over the scope of Static Wind, you will need to program a custom script after Static Wind to accomplish the missing feature. If that is not what you want, it is absolutely recommended for you to choose other frameworks or libraries.

## Reasons I made Static Wind and why you might want to use it
Personally, I enjoy the hand-code power that was given by coding in plain HTML-CSS-JS. This script simply reduces the pain of copy-pasting code elements and helps with organizing translations by setting out the layout. The absolute control without having to go through interfaces is what inspired this project.

This script was built as a way to utilizes the file system as a method of control. This reduces the need to code, but in return requires absolute control with the file system. This is much enjoyable as finding the correct file, to me, is much easier than finding the correct line to edit in a long script.