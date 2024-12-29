# Static Wind
A static webpage generator specifically for GitHub Page.

## MIGRATING FROM v2 TO v3
Development on the third version major of Static-Wind is on the way (check `major-version` branch). This is a **MAJOR CHANGE** with:
- Removing `html-src` system
- Source file being `.pug`
- Translation will use Pug locals instead of plain-text replace
- Build script **MAY** receive plain HTML instead of a JSDOM object
- `preview.js` will be a server that compiled Pug files
- Encourage to use `git submodule` (for deployment) or `git subtree` (for development)
- Documentation on v3 new features

This message will stay until the complete development of V3 (and subsequently the merge of the `major-version` branch to the `main` branch).

## How it works?
First, it copies all of the files into `/build/` directory. After that, the script will inject translation variables and render the Pug files. A sitemap file will be generated and the script will commit the repository if the `-R` flag is specified.

## How to set up it?
Use `git submodule` (to use one specific Static Wind commit) or `git subtree` (for development) to get Static Wind at your root folder. Start to build your page with a set structure by the script:
- `pageStandardURL`
    - `index.pug`: this file will contain the layout and translation keys
    - `<lang_code>.json`: translation of the language

After that, create a configuration file at the root folder **of the project** with the name `.Static-Wind.json` (an example is available at `!config.json`)

There are two options to view your webpage from here:
- Build the webpage with `npm run build`, which then the result will be in the Git-ignored folder `Static-Wind/build`; or
- Run `Static-Wind/preview.js`, which will start an Express.js server to serve the files with rendered content (from Pug to HTML).

## Features
### Translations
After setting up `.Static-Wind.json` (with example from `Static-Wind/!config.json`), you can now set up translation of each folder. Basic structure of a translation file `<lang_code>.json` (noted that this files must be in the same level as the `index.html` file that you want this translation to applied to.):
```json
{
    "URL": "The folder/URL of this translation that you want people to access",

    "a_translation_key": "This key will be replaced with this string."
}
```

There is also a special key called `lang_code`, which Static Wind will automatically replaced with the language code it is treating. This is useful for HTML's `lang` attribute.

### Build script
You can insert your own functions when the script is building the page.
1. `onBuild(config)`: after the files are copied into the build folder but before starting building individual files.
1. `onTranslationBuild(dom, item, config)`: after the targeting item was built with html-src but before building each individual translation.
1. `onBuildComplete(config)`: after the build is compelte but before releasing (if the release flag is present)

## Reasons you DON'T want to use this script
If you can come up with a reason that specifically addresses your problem, usually it is better than using Static Wind. Static Wind was created as a one-size-fit-all solution, hence reducing the need to learn multiple frameworks or libraries to work; however, at the same time it has some specific requirements: it must be on GitHub, the attribute must be named `html-src`, and so on. These are weirdly specific but at the same time general, so it might not be suitable for you in that case.

I assume when you already hopped on GitHub and are reading this, you are probably fairly competent in coding. However, as a precaution, I must say this: having an intermediate understanding of HTML-CSS-JavaScript and Node JS is a **must** when using Static Wind. It ain't holding your hand. The alternatives include, but are not limited to Pug, Markdown, and WordPress.

This project exposes the developer to the bare bones of everything and offers very few features. This makes customizing the source code, depending on your usage, is a must. If you get over the scope of Static Wind, you will need to program a custom script after Static Wind to accomplish the missing feature. If that is not what you want, it is absolutely recommended for you to choose other frameworks or libraries.

## Reasons I made Static Wind and why you might want to use it
Personally, I enjoy the hand-code power that was given by coding in plain HTML-CSS-JS. This script simply reduces the pain of copy-pasting code elements and helps with organizing translations by setting out the layout. The absolute control without having to go through interfaces is what inspired this project.

This script was built as a way to utilizes the file system as a method of control. This reduces the need to code, but in return requires absolute control with the file system. This is much enjoyable as finding the correct file, to me, is much easier than finding the correct line to edit in a long script.