# Static Wind
A static webpage generator specifically for GitHub Page.

## How it works?
First, it copies all of the files in the current branch to `Static-Wind/build`, which is an ignored folder. Then, it switches to the Release branch, where it resolves all `html-src`. A simple `replaceAll()` Regex will then be performed to replace all keys in the translation file with its content`. After that, it commits and pushes. This is why the Release branch should be your GitHub page deploy branch.

## How to set up it?
Fork this repo, then set up `Static-Wind/config.json`. Start to build your page with a set structure by the script:
- `pageEnglishURL`
    - `index.html`: this file will contain the layout and translation keys
    - `en.json`: basic English interpretation of the key
    - `<land_code>.json`: translation of the language

Another feature of this script is the `html-src` attribute, where you put the attribute's property as the source file of the HTML. Then the script will simply fetch the content of the HTML file, then **prepend** innerHTML with the content. This is useful for repetitive elements like the head element, navigation bar, or footer.

However, you need to build the webpage to see it in action. To circumvent this, `Static-Wind/preview.js` provides a script that will fetch the content for you at hand. The problem now lies in the part that you need to have a static server to bypass CORS.

## Reasons you DON'T want to use this script
If you can come up with a reason that specifically addresses your problem, usually it is better than using Static Wind. Static Wind was created as a one-size-fit-all solution, hence reducing the need to learn multiple frameworks or libraries to work; however, at the same time it has some specific requirements: it must be on GitHub, the attribute must be named `html-src`, and so on. These are weirdly specific but at the same time general, so it might not be suitable for you in that case.

I assume when you already hopped on GitHub and are reading this, you are probably fairly competent in coding. However, as a precaution, I must say this: having an intermediate understanding of HTML-CSS-JavaScript and Node JS is a **must** when using Static Wind. It ain't holding your hand. The alternatives include, but are not limited to Pug, Markdown, and WordPress.

This project exposes the developer to the bare bones of everything and offers few features. This makes customizing the source code, depending on your usage, is a must. If you get over the scope of Static Wind, you will need to program a custom script after Static Wind to accomplish the missing feature. If that is not what you want, it is absolutely recommended for you to choose other frameworks or libraries.

## Reasons I made Static Wind and why you might want to use it
Personally, I enjoy the hand-code power that was given by coding in plain HTML-CSS-JS. This script simply reduces the pain of copy-pasting code elements and helps with organizing translations by setting out the layout. The absolute control without having to go through interfaces is what inspired this project.