# COVID Episim Website

<img src="https://github.com/matsim-vsp/covid-sim/raw/master/src/assets/images/v3-thumb.png" alt="EpiSim" width="100%" height="5rem">

This repo contains the visualization website for MATSim/EpiSim, available at https://matsim-vsp.github.io/covid-sim. See that website for information on the use of MATSim for COVID-19 disease propagation, given various measures for combating its spread.

This README details build instructions for the website itself.

## Project pre-requisites

The site uses npm and yarn, and was developed using VS Code.

- You should install VS Code, npm, and yarn first.
- All code is TypeScript and shall remain so.

The following VS Code plugins are used:

- Prettier to force code style consistencey
- Vetur, for Vuejs support. This site is a [Vue](https://vuejs.org) SPA.
- Shader languages support

## First time install

One line fetches everything from the npm database:

```
yarn install
```

## Development Commands

### Compiling and hot-reloads during development

This command runs a local server with hot reload for testing, usually listens on http://localhost:8080

```
yarn serve
```

### Compiles and minifies for production

```
yarn build
```

### Run your unit tests

Well... I have not written tests but the infrastructure is there to use `jest`.

```
yarn test:unit
```

### Pushing to the live site

Travis-CI is configured to automatically build the site with **every push to master**, so don't push to master until you are ready for your code to go live.

- Travis config is in `.travis.yml`

## Project Layout

- `/src`: all TypeScript and Vue files go here
- `/src/assets`: images, .csvs, etc that get packaged by webpack
- `/src/components`: shared Vue components go here
- `/src/HomeIndex.vue`: Is the front page. Add new thumbnails for pages or other content here.
- `/runs`: Each page has its own folder under the `/runs` folder.
  - Connect up your new pages by adding a new folder here, and also adding a new URL to `/router.ts` -- and probably also to `/components/TopBar.vue` if you want the page on the top navvar.
  - Each run should use a `readme.md` file under `/src/assets` so that researchers can add notes without having to learn the build system.
- `/scripts`: Python scripts go here, which are used for preprocessing EpiSim results
- `/public`: large .zip files, project notes, etc go in public. These files are pushed as-is by webpack; i.e. they are not packaged in any way

Good luck and thanks for the help! -- [Billy](https://github.com/billyc)
