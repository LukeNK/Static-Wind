const fs = require('fs'),
    path = require('path'),
    execSync = require('child_process').execSync,
    jsdom = require("jsdom");
const { JSDOM } = jsdom;

const argv = process.argv.slice(2),
    cPath = path.join('Static-Wind', 'config.json'), // build config
    vPath = path.join('Static-Wind', 'VERSION'), // version path OF THE WEBSITE
    buildPath = path.join('Static-Wind', 'build');

if (!fs.existsSync(vPath)) fs.writeFileSync(vPath, '0.0', 'utf-8'); // create placeholder

let version = fs.readFileSync(vPath, 'utf-8').split('.');
let config = JSON.parse(fs.readFileSync(cPath, 'utf-8'));

const releaseItems = config.releaseItems,
    languages = config.languages;

if (!fs.existsSync(path.join('Static-Wind', 'build.js'))) {
    console.error('Not at root folder');
    process.exit(1);
}

if (argv[0] === 'R') {
    console.log('Release flag, increasing version');
    let curYear = new Date().getFullYear().toString().slice(2);
    if (version[0] != curYear) version[1] = 0; // new year, new code
    version[1] = ((~~version[1]) + 1).toString().padStart(3, '0')
    fs.writeFileSync(
        vPath,
        version.join('.')
    )

    console.log('Executing Git')
    console.log(execSync('git pull', { encoding: 'utf-8' }));
}

console.log('Cleaning ' + buildPath)
if (fs.existsSync(buildPath))
    fs.rmSync(buildPath, { recursive: true, force: true })
fs.mkdirSync(buildPath, { recursive: true });

if (typeof(config?.masterTranslation) == 'string') {
    console.log('\nMaster translation folder specified');
    let dirName = config.masterTranslation;
    config.masterTranslation = {};
    for (const lang of languages)
        config.masterTranslation[lang] =
            JSON.parse(fs.readFileSync(
                path.join(dirName, lang + '.json'),
                'utf-8'
            ))
}

console.log('\nCopy and build files');
releaseItems.forEach(item => { // no need to afraid of array length change
    console.log(item)

    // only copy root folder/ files
    if (path.basename(item) === item)
        fs.cpSync(item, path.join(buildPath, item), { recursive: true });
    else
        console.log('- sub-folder')

    let file = path.join(buildPath, item);
    if (fs.statSync(item).isDirectory())
        file = path.join(file, 'index.html')

    if (!fs.existsSync(file)) return console.log('- index.html not available')
    if (path.extname(file) !== '.html') return; // not an HTML object to build

    console.log('- is/contains a HTML file')

    // replace comp to static element
    let dom = new JSDOM(fs.readFileSync(file, 'utf-8'));
    dom.window.document.querySelectorAll('[html-src]').forEach(elm => {
        elm.innerHTML =
            fs.readFileSync(path.join(
                './',
                elm.getAttribute('html-src')
            )) + elm.innerHTML;
        elm.removeAttribute('html-src');
    });

    if (path.extname(item))
        // is a file, no translation, still proceed to copy the content down
        return fs.writeFileSync(
            file,
            dom.window.document.documentElement.outerHTML,
            'utf-8'
        )

    console.log('- load translation')
    for (const lang of languages) {
        let data = dom.window.document.documentElement.outerHTML;

        // translation file
        let transPath = path.join(path.dirname(file), lang + '.json');
        if (!fs.existsSync(transPath)) {
            console.log('- ' + lang + ' translation is not available')
            continue;
        }
        let trans = JSON.parse(fs.readFileSync(
                transPath,
                'utf-8'
            ))

        // insert language code
        trans.lang_code = lang;

        for (const key of Object.keys(trans)) {
            if (['URL'].includes(key)) continue; // skip certain key
            data = data.replace(new RegExp(key, 'g'), trans[key])
        }

        if (config.masterTranslation)
            for (const key of Object.keys(config.masterTranslation[lang]))
                data = data.replace(
                    new RegExp(key, 'g'),
                    config.masterTranslation[lang][key]
                )

        if (lang != 'en') {
            fs.mkdirSync(path.join(buildPath, trans.URL)); // default URL lang is English
            releaseItems.push(trans.URL); // add to copy to release
        }
        fs.writeFileSync(
            path.join(buildPath, trans.URL, 'index.html'),
            data,
            'utf-8'
        );

        fs.rmSync(transPath); // remove from build
    }
});

if (argv[0] !== 'R') {
    console.log('\nNo release flag, build completed');
    process.exit(0);
}

console.log('\nChange branch');
console.log(execSync('git checkout Release', { encoding: 'utf-8' }));

console.log('Removing and moving files');
releaseItems.forEach(item => {
    console.log('Removing and moving ' + item);
    fs.rmSync(item, { recursive: true, force: true })
    fs.renameSync(path.join(buildPath, item), item, { recursive: true });
});

console.log('\nGit add all changes');
console.log(execSync('git add .', { encoding: 'utf-8' }));

console.log('Git commit');
console.log(execSync(
    `git commit -m "[Auto-commit->Release] v${version.join('.')}"`,
    { encoding: 'utf-8' })
);

console.log('Git push');
console.log(execSync('git push', { encoding: 'utf-8' }));

console.log('Git return to main branch');
console.log(execSync('git checkout main', { encoding: 'utf-8' }));