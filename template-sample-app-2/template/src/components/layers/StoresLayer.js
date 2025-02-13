import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CartoLayer, colorCategories } from '@deck.gl/carto';
import { useCartoLayerProps } from '@carto/react-api';
import { selectSourceById, updateLayer } from '@carto/react-redux';
import htmlForFeature from 'utils/htmlForFeature';
import rgbToHex from 'utils/rgbToHex';
import { LEGEND_TYPES } from '@carto/react-ui';

export const STORES_LAYER_ID = 'storesLayer';

const OTHERS_COLOR = { Others: [17, 165, 121] };

export const CATEGORY_COLORS = {
  Supermarket: [80, 20, 85],
  'Discount Store': [128, 186, 90],
  Hypermarket: [231, 63, 116],
  Drugstore: [242, 183, 1],
  'Department Store': [57, 105, 172],
  ...OTHERS_COLOR,
};

const DATA = Object.entries(CATEGORY_COLORS).map((elem) => {
  return { color: rgbToHex(elem[1]), label: elem[0] };
});

const layerConfig = {
  title: 'Store types',
  visible: true,
  legend: {
    attr: 'storetype',
    type: LEGEND_TYPES.CATEGORY,
    labels: DATA.map((data) => data.label),
    colors: DATA.map((data) => data.color),
  },
};

function StoresLayer() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { storesLayer } = useSelector((state) => state.carto.layers);
  const source = useSelector((state) => selectSourceById(state, storesLayer?.source));
  const cartoLayerProps = useCartoLayerProps({ source });

  if (storesLayer && source) {
    return new CartoLayer({
      ...cartoLayerProps,
      id: STORES_LAYER_ID,
      stroked: true,
      pointRadiusUnits: 'pixels',
      lineWidthUnits: 'pixels',
      pickable: true,
      visible: storesLayer.visible,
      getFillColor: colorCategories({
        attr: layerConfig.legend.attr,
        domain: Object.keys(CATEGORY_COLORS),
        colors: Object.values(CATEGORY_COLORS),
        othersColor: OTHERS_COLOR.Others,
      }),
      getLineColor: [0, 0, 0],
      getRadius: (info) =>
        info.properties.store_id === storesLayer.selectedStore ? 6 : 3,
      getLineWidth: (info) =>
        info.properties.store_id === storesLayer.selectedStore ? 2 : 0,
      onDataLoad: () => {
        dispatch(
          updateLayer({
            id: STORES_LAYER_ID,
            layerAttributes: { ...layerConfig },
          })
        );
      },
      onHover: (info) => {
        if (info?.object) {
          info.object = {
            html: htmlForFeature({
              title: `Store ${info.object.properties.store_id}`,
              feature: info.object,
              formatter: {
                type: 'currency',
                columns: ['revenue'],
              },
              includeColumns: ['revenue'],
              showColumnName: false,
            }),
          };
        }
      },
      onClick: (info) => {
        if (info?.object) {
          navigate(`/stores/${info.object.properties.store_id}`);
        }
      },
      updateTriggers: {
        getRadius: { selectedStore: storesLayer.selectedStore },
        getLineWidth: { selectedStore: storesLayer.selectedStore },
        ...cartoLayerProps.updateTriggers,
      },
    });
  }
}

export default StoresLayer;
