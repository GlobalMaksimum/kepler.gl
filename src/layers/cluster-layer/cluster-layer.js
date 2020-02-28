// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import AggregationLayer from '../aggregation-layer';
import {ScatterplotLayer} from 'deck.gl';

import DeckGLClusterLayer from 'deckgl-layers/cluster-layer/cluster-layer';
import {CHANNEL_SCALES} from 'constants/default-settings';
import ClusterLayerIcon from './cluster-layer-icon';

export const clusterVisConfigs = {
  opacity: 'opacity',
  clusterRadius: 'clusterRadius',
  colorRange: 'colorRange',
  radiusRange: 'clusterRadiusRange',
  colorAggregation: 'aggregation'
};

export default class ClusterLayer extends AggregationLayer {
  constructor(props) {
    super(props);
    this.registerVisConfig(clusterVisConfigs);
  }

  get type() {
    return 'cluster';
  }

  get layerIcon() {
    return ClusterLayerIcon;
  }

  get visualChannels() {
    return {
      color: {
        aggregation: 'colorAggregation',
        channelScaleType: CHANNEL_SCALES.colorAggr,
        defaultMeasure: 'Point Count',
        domain: 'colorDomain',
        field: 'colorField',
        key: 'color',
        property: 'color',
        range: 'colorRange',
        scale: 'colorScale'
      }
    };
  }

  renderLayer({
    data,
    idx,
    objectHovered,
    mapState,
    interaction,
    layerCallbacks
  }) {
    const {visConfig} = this.config;

    return [
      new DeckGLClusterLayer({
        ...data,
        id: this.id,
        idx,
        radiusScale: 1,
        radiusRange: visConfig.radiusRange,
        clusterRadius: visConfig.clusterRadius,
        colorRange: this.getColorRange(visConfig.colorRange),
        colorScale: this.config.colorScale,
        pickable: true,
        autoHighlight: true,
        highlightColor: this.config.highlightColor,
        opacity: visConfig.opacity,
        zoom: mapState.zoom,

        // parameters
        parameters: {depthTest: mapState.dragRotate},

        // call back from layer after calculate clusters
        onSetColorDomain: layerCallbacks.onSetLayerDomain
      }),
      // hover layer
      ...(this.isLayerHovered(objectHovered)
      ? [
          new ScatterplotLayer({
            id: `${this.id}-hovered`,
            data: [objectHovered.object],
            getFillColor: this.config.highlightColor,
            getRadius: d => d.radius,
            radiusScale: 1,
            pickable: false
          })
        ]
      : [])
    ];
  }
}
