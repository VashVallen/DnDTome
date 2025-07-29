# Adventurer's Tome

**Adventurer's Tome** is a lightweight, offline‑friendly web application for managing Dungeons & Dragons character sheets.

The app has been designed to evoke the feeling of turning the pages of an ancient tome.  It works on both desktop and mobile devices (thanks to Progressive Web App support) and can be shared simply by distributing the folder or hosting it with any static file provider (e.g. GitHub Pages or Netlify).  Characters are stored locally in your browser and can be exported/imported as JSON for easy backup or sharing.

## Features

* **Create, edit and delete characters** – each character has fields for basic information (name, class, race, level, background, alignment), ability scores (STR, DEX, CON, INT, WIS, CHA), hit points, armour class and speed.
* **Dynamic spells and inventory** – add as many spells or items as you need.  Each entry can store a name, a level/quantity and a description.
* **Offline support** – a service worker caches the application assets so it continues to work without an internet connection once loaded.
* **Cross‑platform** – the app runs in your browser on desktop or mobile.  It can be installed as a home‑screen app thanks to the included manifest and PWA setup.
* **Export/Import** – export a single character to a JSON file and import characters back into the app.  This makes it easy to share sheets with your players or back them up.

## Running locally

1. Download or clone this repository into a folder of your choosing.
2. Open `index.html` in your browser to start using the app.  On modern browsers you can also choose *Add to Home Screen* to install it like a native app.

If you want to serve the site from a custom domain or share it with others, host the contents of the `dnd-tome-app` directory on any static hosting service (for example [GitHub Pages](https://pages.github.com) or [Netlify](https://www.netlify.com)).

## File overview

* `index.html` – markup defining the layout of the app.
* `style.css` – styles that give the parchment and book feel.  You can tweak these colours or fonts to your taste.
* `script.js` – all of the application logic.  This file handles creating characters, manipulating the form, saving to local storage, exporting and importing characters and registering the service worker.
* `manifest.json` – metadata used by browsers when installing the app as a Progressive Web App (PWA).
* `sw.js` – a simple service worker which pre‑caches the application assets so the app continues to work offline.
* `icon-192x192.png`, `icon-512x512.png` – icons used by the manifest for PWA installation.  These were generated specifically for this project.

## License

This project is released into the public domain.  Feel free to modify and share it with your friends and players.