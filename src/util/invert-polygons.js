const rewind = require('@mapbox/geojson-rewind');

const root = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        [[180, 90], [-180, 90], [-180, -90], [180, -90], [180, 90]]
      ]
    }
  }]
}; 

function invertPolygons(geojson) {
  const rewound = rewind(geojson);
  rewound.features.forEach(f => {
    const { type } = f.geometry;
    if (type === 'Polygon') {
      root.features[0].geometry.coordinates.push(f.geometry.coordinates[0]);
    }
  });

  return root;
}

module.exports = invertPolygons;
