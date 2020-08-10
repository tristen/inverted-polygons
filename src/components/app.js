import React from 'react'
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext, DropTarget } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'
import { saveAs } from 'file-saver'
import invertPolygons from '../util/invert-polygons'
import bbox from '@turf/bbox'

const DEFAULT_HELP = 'Drag and drop GeoJSON containing polygons on the map.';

class App extends React.PureComponent {
  mapContainer = null;

  constructor(props) {
    super(props);
    this.state = {
      geojson: null,
      helpText: DEFAULT_HELP
    };
  }

  componentDidMount() {
    window.mapboxgl.accessToken = 'pk.eyJ1IjoidHJpc3RlbiIsImEiOiJjanZhZjlrd3EwanpoNDN0ZHhsbDFvd2F2In0.0pfXaCB-i3h6VLEIPSDaXw';
    this.map = new window.mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [5, 34],
      zoom: 1.5,
      hash: true
    });
  }

  setMapContainer = el => this.mapContainer = el;

  onDownload = () => {
    const blob = new Blob([
      JSON.stringify(this.state.geojson, null, 2)
    ], {
      type: 'text/plain;charset=utf-8'
    });

    saveAs(blob, 'inverted.geojson');
  };

  onClear = () => {
    this.setState({
      geojson: null,
      helpText: DEFAULT_HELP
    }, () => {
      this.map.removeLayer('inverted-poly-fill');
      this.map.removeLayer('inverted-poly-line');
      this.map.removeSource('geojson');
    });
  };

  onUpload = files => {
    this.setState({
      helpText: (
        <span className="loading loading--s loading--dark" />
      )
    });

    const reader = new FileReader();
    reader.addEventListener('load', d => {
      let parsed;
      let result;

      try {
        parsed = JSON.parse(d.target.result);
        result = invertPolygons(parsed);
        bbox(parsed);
      } catch(e) {
        this.setState({
          helpText: e.message
        });
      }

      this.setState({
        geojson: result,
        helpText: 'Download, drag more, or press clear to start over'
      }, () => {
        if (this.map.getSource('geojson')) {
          this.map.getSource('geojson').setData(result);
        } else {
          this.map.addSource('geojson', {
            type: 'geojson',
            data: result
          });

          this.map.addLayer({
            id: 'inverted-poly-fill',
            type: 'fill',
            source: 'geojson',
            paint: {
              'fill-color': 'hsla(229, 96%, 62%, 0.52)'
            }
          });

          this.map.addLayer({
            id: 'inverted-poly-line',
            type: 'line',
            source: 'geojson',
            paint: {
              'line-color': 'hsl(229, 96%, 62%)'
            }
          });
        }

        if (bbox(parsed)) {
          this.map.fitBounds(bbox(parsed), {
            easing: () => 1
          });
        }
      });
    });

    reader.readAsText(files[0]);
  };

  render() {
    const { helpText, geojson } = this.state;
    const { connectDropTarget, isOver } = this.props;

    return connectDropTarget(
      <div>
        <div className="flex-parent flex-parent--end-cross flex-parent--center-main absolute top right bottom left">
          <div className="bg-darken75 py6 px6 flex-child mb24 z1 txt-s txt-bold flex-parent flex-parent--center-cross round-full hmin30">
            <div className="flex-child color-white inline-block round-l-full px12">
              {helpText}
            </div>

            <div className="flex-parent">
              {geojson && <button className="flex-child btn btn--gray px24 round-l" onClick={this.onClear}>
                Clear
              </button>}
              <button className={`${geojson ? 'round-r-full' : 'round-full'} flex-child btn btn--green px24`} onClick={this.onDownload}>
                Download
              </button>
            </div>
          </div>
        </div>

        {isOver && <div className="bg-darken25 fixed left right top bottom events-none z5" />}
        <div ref={this.setMapContainer} className="absolute top right left bottom" />
      </div>
    );
  }
}

const dropTarget = {
  drop: (props, monitor, component) =>
    component.onUpload(monitor.getItem().files)
};

const withDragDrop = DropTarget(
  NativeTypes.FILE,
  dropTarget,
  (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  })
);

export default DragDropContext(HTML5Backend)(withDragDrop(App));
