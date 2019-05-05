#!/usr/bin/env node

const meow = require('meow');
const invertPolygons = require('../src/util/invert-polygons');

const cli = meow(
  `
  Provide GeoJSON from stdin and get back GeoJSON with polygons inverted.
  Usage
    $ cat polygons.geojson | invertedPolygons > polygons-inverted.geojson
`
);

let rawInput = '';
process.stdin.on('readable', () => {
  const chunk = process.stdin.read();
  if (!chunk) exit();
  rawInput += chunk;
});

process.stdin.on('end', () => {
  const geojson = invertPolygons(rawInput);
  if (!geojson) exit();
  process.stdout.write(`${JSON.stringify(geojson, null, 2)}\n`);
});

function exit() {
  process.stdout.write(cli.showHelp());
  process.exit();
}
