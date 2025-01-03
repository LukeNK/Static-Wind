const fs = require('fs'),
    path = require('path'),
    execSync = require('child_process').execSync,
    pug = require('pug'),
    minify = require('html-minifier').minify;

const argv = process.argv.slice(2),
    cPath = path.join('..', '.Static-Wind.json'); // build config

let config = JSON.parse(fs.readFileSync(cPath, 'utf-8'));

const buildPath = path.join('..', config.buildPath || 'build'),
    vPath = path.join('..', config.buildVersion || 'VERSION'); // version path
    releaseItems = config.releaseItems,
    languages = config.languages;
config.buildPath = buildPath; // re-apply to pass to build scripts
config.minify =
    config.minify
    || {
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        removeComments: true,
    };

if (!fs.existsSync('build.js')) {
    console.error('Script did not invoked at Static-Wind folder');
    process.exit(1);
}

// dealing with version
if (!fs.existsSync(vPath))
    fs.writeFileSync(vPath, '0.0', 'utf-8'); // create placeholder

let version = fs.readFileSync(vPath, 'utf-8').split('.');
if (argv[0] === 'R') {
    console.log('Release flag, increasing version');
    let curYear = new Date().getFullYear().toString().slice(2);
    if (~~version[0] != ~~curYear)
        version[1] = 0; // new year, new code
    version[1] = ((~~version[1]) + 1).toString().padStart(3, '0')

    // save to config, indicating this is a release
    config.release = version.join('.');
    fs.writeFileSync(vPath, config.release)

    console.log('Executing Git')
    console.log(execSync('git pull', { encoding: 'utf-8' }));
}

console.log('Cleaning ' + buildPath)
if (fs.existsSync(buildPath))
    for (const item of fs.readdirSync(buildPath)) {
        if (
            item == '.git'
            || item == 'VERSION'
        ) continue;
        fs.rmSync(path.join(buildPath, item), { recursive: true, force: true })
    }

if (typeof(config?.masterTranslation) == 'string') {
    console.log('Master translation folder specified');
    let dirName = path.join('../', config.masterTranslation);
    config.masterTranslation = {};
    for (const lang of languages)
        config.masterTranslation[lang] =
            JSON.parse(fs.readFileSync(
                path.join(dirName, lang + '.json'),
                'utf-8'
            ))
}

let buildScript = '';
if (config.buildScript) {
    buildScript = path.join('../', config.buildScript)
    if (fs.existsSync(buildScript)) {
        console.log('Build script exists');
        buildScript = require(buildScript);
    }
}

console.log('Copy release items')
releaseItems.forEach((item, key) => {
    fs.cpSync(
        path.join('../', item),
        path.join(buildPath, item),
        { recursive: true }
    );
});

if (buildScript?.onBuild) buildScript.onBuild(config);

console.log('Build release items');
for (let key in releaseItems) {
    let item = releaseItems[key];

    let file = path.join(buildPath, item);

    if (fs.statSync(file).isDirectory())
        if (fs.existsSync(path.join(file, 'index.html')))
            continue; // skip but still keep in sitemap
        else if (fs.existsSync(path.join(file, 'index.pug')))
            file = path.join(file, 'index.pug') // change to Pug to build
        else {
            releaseItems[key] = ''; //remove from sitemap
            continue
        }
    else if (path.extname(file) == '.pug')
        releaseItems[key] = '' // remove from sitemap because it is a file, not an URL

    // load document using fs to cache the file
    let document = pug.compile(
        fs.readFileSync(file, 'utf-8'),
        {basedir: '../'}
    );

    // remove original pug file
    fs.rmSync(file);

    // change file extention name
    file = file.split('.');
    file[file.length - 1] = 'html';
    file = file.join('.');

    if (path.extname(item)) {
        // is a file, no translation, still proceed to copy the content down
        console.warn(`- ${item} no translation available`);
        fs.writeFileSync(
            file,
            minify(document({
                ...config.masterTranslation,
                config: config
            }), config.minify),
            'utf-8'
        );
        continue
    }

    if (buildScript?.onTranslationBuild)
        buildScript.onTranslationBuild(item, config);

    for (const lang of languages) {
        // translation file
        let transFile = path.join(path.dirname(file), lang + '.json');
        if (!fs.existsSync(transFile)) {
            console.warn(`- ${item} ${lang} translation is not available`)
            continue;
        }
        let trans = JSON.parse(fs.readFileSync(
                transFile,
                'utf-8'
            ))
        trans = { ...config.masterTranslation[lang], ...trans };

        // insert language code
        trans.lang_code = lang;

        // translation pageURL does not exit, specify as the default directory
        if (!trans.pageURL) trans.pageURL = item;

        let outputDir = path.join(buildPath, trans.pageURL); // output directory
        if (
            file != outputDir // if the current folder is not the original folder
            && !fs.existsSync(outputDir) // and the folder does not exist
        ) {
            fs.mkdirSync(outputDir)
            releaseItems.push(trans.pageURL); // add to copy to release
        }

        fs.writeFileSync(
            path.join(outputDir, 'index.html'),
            minify(document({
                ...trans,
                config: config
            }), config.minify),
            'utf-8'
        );

        fs.rmSync(transFile); // remove from build
    }
}

if (config.sitemap) {
    let sitemap = path.join(
            buildPath,
            config.sitemapPath || 'sitemap.txt' // user specified or default
        ),
        out = '';
    console.log('Generating sitemap at ' + sitemap)
    for (let item of releaseItems) {
        if (item.startsWith('/')) item = item.slice(1); // remove absolute path
        if (item) {
            // if items exists and is allowed in sitemap
            out += config.sitemap + item;
            if (!path.extname(item)) out += '/'; // directory
            out += '\n';
        }
    }
    fs.writeFileSync(sitemap, out, 'utf-8')
}

if (buildScript?.onBuildComplete) buildScript.onBuildComplete(config);

if (!config.release) {
    console.log('No release flag, build completed');
    process.exit(0);
}

console.log('Git add ' + buildPath);
console.log(execSync(`cd ${buildPath} && git add .`, { encoding: 'utf-8' }));

console.log('Git commit');
console.log(execSync(
    `cd ${buildPath} && git commit -m "[Auto-commit] v${version.join('.')}"`,
    { encoding: 'utf-8' })
);

console.log('Git push');
console.log(execSync(`cd ${buildPath} && git push`, { encoding: 'utf-8' }));