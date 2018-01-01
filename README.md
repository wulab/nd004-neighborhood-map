# Project: Neighborhood Map

![screenshot](https://user-images.githubusercontent.com/592709/34465750-fd9f6928-eeee-11e7-94ac-bcaac64aaa8d.png)

> A single page application featuring a map of my neighborhood

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [License](#license)

## Install

Clone this repository:

    $ git clone https://github.com/wulab/nd004-neighborhood-map.git

You need to have Google Maps API Key set in `index.html` file. See [Get API
Key](https://developers.google.com/maps/documentation/javascript/get-api-key)
for instructions.

Also, you need Foursquare Client ID and Client Secret set in
`js/app.js` file. See [Getting
Started](https://developer.foursquare.com/docs/api/getting-started) for
instructions.

## Usage

Change directory to `nd004-neighborhood-map` and start a web server:

    $ cd nd004-neighborhood-map
    $ python -m SimpleHTTPServer 8000       # Python 2
    $ python -m http.server 8000            # Python 3

Using a browser, go to `http://localhost:8000` and you'll see example slides.

## License

[MIT © Weera Wu.](LICENSE)
