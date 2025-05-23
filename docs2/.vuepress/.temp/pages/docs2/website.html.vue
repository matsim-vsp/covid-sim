<template><div><h1 id="covid-episim-website" tabindex="-1"><a class="header-anchor" href="#covid-episim-website"><span>COVID Episim Website</span></a></h1>
<img src="https://github.com/matsim-vsp/covid-sim/raw/master/src/assets/images/readme-banner.jpg" alt="EpiSim" width="100%">
<p>This repo contains the visualization website for MATSim/EpiSim, available at <a href="https://covid-sim.info" target="_blank" rel="noopener noreferrer">covid-sim.info</a>. See that website for information on the use of MATSim for COVID-19 disease propagation, given various measures for combating its spread.</p>
<p>This README details build instructions for the website itself.</p>
<h2 id="project-pre-requisites" tabindex="-1"><a class="header-anchor" href="#project-pre-requisites"><span>Project pre-requisites</span></a></h2>
<p>The site uses npm and yarn, and was developed using VS Code.</p>
<ul>
<li>You should install VS Code, npm, and yarn first.</li>
<li>All code is TypeScript and shall remain so.</li>
</ul>
<p>The following VS Code plugins are used:</p>
<ul>
<li>Prettier to force code style consistencey</li>
<li>Vetur, for Vuejs support. This site is a <a href="https://vuejs.org" target="_blank" rel="noopener noreferrer">Vue</a> SPA.</li>
<li>Shader languages support</li>
</ul>
<h2 id="foundational-technologies" tabindex="-1"><a class="header-anchor" href="#foundational-technologies"><span>Foundational technologies</span></a></h2>
<p>You will need to know this tech in order to hack on this website:</p>
<ul>
<li><a href="https://typescriptlang.org" target="_blank" rel="noopener noreferrer">TypeScript</a> - typesafe JavaScript</li>
<li><a href="https://vuejs.org" target="_blank" rel="noopener noreferrer">Vue</a> - the glue that connects UI elements to code. Similar to React but lightweight and awesome</li>
<li><a href="https://threejs.org" target="_blank" rel="noopener noreferrer">ThreeJS</a> - WebGL library for the fancy animations.</li>
<li><a href="https://pugjs.org" target="_blank" rel="noopener noreferrer">Pug</a> - the template language used in Vue files. Pug uses Python-style indentation instead of open/close XML tags, which makes it far easier to read than bare HTML.</li>
</ul>
<h2 id="first-time-install" tabindex="-1"><a class="header-anchor" href="#first-time-install"><span>First time install</span></a></h2>
<p>One line fetches everything from the npm database:</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">yarn install</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h2 id="development-commands" tabindex="-1"><a class="header-anchor" href="#development-commands"><span>Development Commands</span></a></h2>
<h3 id="compiling-and-hot-reloads-during-development" tabindex="-1"><a class="header-anchor" href="#compiling-and-hot-reloads-during-development"><span>Compiling and hot-reloads during development</span></a></h3>
<p>This command runs a local server with hot reload for testing, usually listens on http://localhost:8080</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">yarn serve</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h3 id="compiles-and-minifies-for-production" tabindex="-1"><a class="header-anchor" href="#compiles-and-minifies-for-production"><span>Compiles and minifies for production</span></a></h3>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">yarn build</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h3 id="run-your-unit-tests" tabindex="-1"><a class="header-anchor" href="#run-your-unit-tests"><span>Run your unit tests</span></a></h3>
<p>Well... I have not written tests but the infrastructure is there to use <code v-pre>jest</code>.</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">yarn test:unit</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><h3 id="pushing-to-the-live-site" tabindex="-1"><a class="header-anchor" href="#pushing-to-the-live-site"><span>Pushing to the live site</span></a></h3>
<p>Travis-CI is configured to automatically build the site with <strong>every push to master</strong>, so don't push to master until you are ready for your code to go live.</p>
<ul>
<li>Travis config is in <code v-pre>.travis.yml</code></li>
</ul>
<h3 id="issues" tabindex="-1"><a class="header-anchor" href="#issues"><span>Issues</span></a></h3>
<p>I (kn) need to fix the npm version on something older.  The command is</p>
<div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre v-pre><code><span class="line">nvm use --lts</span>
<span class="line"></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div></div></div><p>Needed to install <code v-pre>nvm</code> to make this work.  Can't remember how I did that; possibly through macports.</p>
<h2 id="project-layout" tabindex="-1"><a class="header-anchor" href="#project-layout"><span>Project Layout</span></a></h2>
<ul>
<li><code v-pre>/src</code>: all TypeScript and Vue files go here</li>
<li><code v-pre>/src/assets</code>: images, .csvs, etc that get packaged by webpack</li>
<li><code v-pre>/src/components</code>: shared Vue components go here</li>
<li><code v-pre>/src/HomeIndex.vue</code>: the front page. Add new thumbnails for pages or other content here.</li>
<li><code v-pre>/src/runs</code>: Each page has its own folder under the <code v-pre>/src/runs</code> folder.
<ul>
<li>Connect up your new pages by adding a new folder here, and also adding a new URL to <code v-pre>/src/router.ts</code>. Anyone who knows the URL can then see the page. When you are ready for the public to also find it, add a link to <code v-pre>/src/components/TopBar.vue</code> and to the homepage.</li>
<li>Each run should use a <code v-pre>readme.md</code> file under <code v-pre>/src/assets</code> so that researchers can add notes without having to learn the build system.</li>
</ul>
</li>
<li><code v-pre>/scripts</code>: Python scripts go here, which are used for preprocessing EpiSim results</li>
<li><code v-pre>/public</code>: large .zip files, project notes, etc go in public. These files are pushed as-is by webpack; i.e. they are not packaged in any way</li>
</ul>
<h2 id="thank-you" tabindex="-1"><a class="header-anchor" href="#thank-you"><span>Thank you!</span></a></h2>
<p>Good luck and thanks for the help! -- <a href="https://github.com/billyc" target="_blank" rel="noopener noreferrer">Billy</a></p>
</div></template>


