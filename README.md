# Yama CMS - Nuxt 3 starter example

This is a starter/example Nuxt 3 repository, configured to interface with Yama CMS.

Yama CMS will write .md files to ./content, we use the `@nuxt/content` module to read and transforms your Markdown, JSON, YAML and CSV files through a MongoDB-like API. [Follow this guide](https://content.nuxt.com/get-started/installation) to get an introduction.

Once you've wired up your repository with Yama CMS, delete the `./content/pages/` and `./content/posts/` files and update the configuration to match your needs.

---

## Installation and usage

You can either run this repository directly if you have the node.js tooling installed; or you can use [Earthly](https://docs.yama-cms.com/docs/guide/build-deploy-earthly) (think Dockerfiles + Makefiles) to run the needed tools inside containers.

Running directly (to install, see [Node.js's Downloads](https://nodejs.org/en/download) or [Installing via package manager](https://nodejs.org/en/download/package-manager)):
```bash
npm install
npm run dev
```
Running via Earthly (to install, see [Earthly's Get Started](https://earthly.dev/get-earthly)):
```bash
earthly --push +update
earthly +dev
```
For more information on how to use Earthly, see [our YamaCMS specific documentation](https://docs.yama-cms.com/docs/guide/build-deploy-earthly/) or [the official Earthly documentation](https://docs.earthly.dev/basics).


***

## Editing this README

When you're ready to make this README your own, just edit this file. If you need inspiration, see [makeareadme.com](https://www.makeareadme.com/) for templates and ideas.
