# CarbonCount 🌍

A free travel carbon tracker that takes accessibility seriously. Log your trips, see how much CO₂ they produce, plan lower-carbon routes, and flag trips where an accessibility barrier (like a broken elevator or missing ramp) pushed you toward a higher-carbon choice.

Made by Samaira.

## Pages

| Page | What it does |
|------|--------------|
| `index.html` | Home: overview, quick estimator, travel mode comparison, UN goals |
| `about.html` | What the app does, the problem it solves, FAQ |
| `log.html` | Daily Log: log trips, weekly trend, goal, barrier report, CSV export |
| `route.html` | Route Planner: compare driving, cycling, walking and transit on a map |
| `profile.html` | Your bio, accessibility needs, preferences, points and badges |

## Features

- Dark mode and a site search in the nav bar
- Accessibility panel: text size, high contrast, underlined links, reduce motion, readable font, extra text spacing, and Read Aloud
- Help Chat that answers common questions (keyword matching, not AI)
- Everything is saved in your own browser (localStorage). Nothing is sent to a server, except that the Route Planner looks up places and routes using free OpenStreetMap services.

## Try it

No installing or building needed. Download the code (green **Code** button → **Download ZIP**), unzip it, and open `index.html` in your browser.

## Built with

Plain HTML, CSS and JavaScript. The map uses [Leaflet](https://leafletjs.com/) with [OpenStreetMap](https://www.openstreetmap.org/) data, routes come from [OSRM](https://project-osrm.org/), and place search uses [Nominatim](https://nominatim.org/).

## Copying this project

You're welcome to copy, change and share it. See [LICENSE](LICENSE) (MIT).
