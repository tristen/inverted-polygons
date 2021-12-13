const rewind = require('@mapbox/geojson-rewind');
const flatten = require('geojson-flatten');

const root = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[[180, 90], [-180, 90], [-180, -90], [180, -90], [180, 90]]]
      }
    }
  ]
};

function invertPolygons(geojson) {
  const rewound = rewind(flatten.default(geojson));

  try {
    flatten.default(geojson);
  } catch (error) {
    console.log('eerror!', error);
  }

  rewound.features.forEach(f => {
    const { type } = f.geometry;
    if (type === 'Polygon') {
      root.features[0].geometry.coordinates.push(f.geometry.coordinates[0]);
    }
  });

  return root;
}

module.exports = invertPolygons;
