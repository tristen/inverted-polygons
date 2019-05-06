#!/usr/bin/env node

const invertPolygons = require('../src/util/invert-polygons');

const HELP =
`
  Provide GeoJSON from stdin and get back GeoJSON with polygons inverted.
  Usage
    $ cat polygons.geojson | invertedPolygons > polygons-inverted.geojson
`;

let rawInput = '';
process.stdin.on('readable', () => {
  const chunk = process.stdin.read();
  if (chunk !== null) {
    rawInput += chunk;
  }
});

process.stdin.on('end', () => {
  const geojson = invertPolygons(JSON.parse(rawInput));
  if (!geojson) exit();
  process.stdout.write(`${JSON.stringify(geojson)}\n`);
});

function exit() {
  process.stdout.write(HELP);
  process.exit();
}
