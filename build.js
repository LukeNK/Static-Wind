const fs = require('fs'),
    path = require('path'),
    execSync = require('child_process').execSync,
    { JSDOM } = require("jsdom"),
    minify = require('html-minifier').minify;

const argv = process.argv.slice(2),
    cPath = 'config.json', // build config
    vPath = 'VERSION', // version path OF THE WEBSITE
    buildPath = 'build';

if (!fs.existsSync(vPath))
    fs.writeFileSync(vPath, '0.0', 'utf-8'); // create placeholder

let version = fs.readFileSync(vPath, 'utf-8').split('.');
let config = JSON.parse(fs.readFileSync(cPath, 'utf-8'));

const releaseItems = config.releaseItems,
    languages = config.languages;
config.minify =
    config.minify
    || {
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        removeComments: true,
    }

if (!fs.existsSync('build.js')) {
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
    for (const item of fs.readdirSync(buildPath)) {
        if (
            item == '.git'
            || releaseItems.includes(item) // if it is for release, only edit
        ) continue;
        fs.rmSync(path.join(buildPath, item), { recursive: true, force: true })
    }

if (typeof(config?.masterTranslation) == 'string') {
    console.log('\nMaster translation folder specified');
    let dirName = path.join('../', config.masterTranslation);
    config.masterTranslation = {};
    for (const lang of languages)
        config.masterTranslation[lang] =
            JSON.parse(fs.readFileSync(
                path.join(dirName, lang + '.json'),
                'utf-8'
            ))
}

console.log('\nCopy and build files');
releaseItems.forEach((item, key) => {
    console.log(item);

    let itemPath = path.join('../', item),
        file = path.join(buildPath, item);

    // only copy root folder or files
    if (path.basename(item) === item)
        fs.cpSync(itemPath, path.join(buildPath, item), { recursive: true });
    else
        console.log('- sub-folder')

    if (fs.statSync(itemPath).isDirectory())
        file = path.join(file, 'index.html')

    if (
        !fs.existsSync(file)
        || path.extname(file) !== '.html'
    ) {
        releaseItems[key] = '';
        return console.log('- not an HTML object to build')
    };

    console.log('- is/contains a HTML file')

    // replace comp to static element
    let dom = new JSDOM(fs.readFileSync(file, 'utf-8'));
    dom.window.document.querySelectorAll('[html-src]')
    .forEach(elm => {
        elm.innerHTML =
            fs.readFileSync(path.join(
                '../',
                elm.getAttribute('html-src')
            ))
            + elm.innerHTML;
        elm.removeAttribute('html-src');
    });

    // remove preview script if exists
    dom.window.document.querySelector('script[src="/Static-Wind/preview.js"]')
    ?.remove();

    if (path.extname(item))
        // is a file, no translation, still proceed to copy the content down
        return fs.writeFileSync(
            file,
            minify(dom.window.document.documentElement.outerHTML, config.minify),
            'utf-8'
        )

    console.log('- load translations');
    for (const lang of languages) {
        let data = dom.window.document.documentElement.outerHTML;

        // translation file
        let transFile = path.join(path.dirname(file), lang + '.json');
        if (!fs.existsSync(transFile)) {
            console.log('- ' + lang + ' translation is not available')
            continue;
        }
        let trans = JSON.parse(fs.readFileSync(
                transFile,
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

        // translation URL does not exit, specify as the default directory
        if (!trans.URL) trans.URL = item;

        let outputDir = path.join(buildPath, trans.URL); // output directory
        if (
            file != outputDir // if the current folder is not the original folder
            && !fs.existsSync(outputDir) // and the folder does not exist
        ) {
            fs.mkdirSync(outputDir)
            releaseItems.push(trans.URL); // add to copy to release
        }

        fs.writeFileSync(
            path.join(outputDir, 'index.html'),
            minify(data, config.minify),
            'utf-8'
        );

        fs.rmSync(transFile); // remove from build
    }
});

if (config.sitemap) {
    let sitemap = path.join(
            buildPath,
            config.sitemapPath || 'sitemap.txt' // user specified or default
        ),
        out = '';
    console.log('\nGenerating sitemap at ' + sitemap)
    for (const item of releaseItems)
        if (item) // if items exists and is allowed in sitemap
            out += config.sitemap + item + '\n';
    fs.writeFileSync(sitemap, out, 'utf-8')
}

if (argv[0] !== 'R') {
    console.log('\nNo release flag, build completed');
    process.exit(0);
}

console.log('\nGit add all changes');
console.log(execSync('cd build && git add .', { encoding: 'utf-8' }));

console.log('Git commit');
console.log(execSync(
    `cd build && git commit -m "[Auto-commit] v${version.join('.')}"`,
    { encoding: 'utf-8' })
);

console.log('Git push');
console.log(execSync('cd build && git push', { encoding: 'utf-8' }));