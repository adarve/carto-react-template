---
to: src/components/layers/<%= h.changeCase.pascalCase(name) -%>.js
unless_exists: true
---
import { useSelector } from 'react-redux';
import { CartoLayer } from '@deck.gl/carto';
import { selectSourceById } from '@carto/react-redux';
import { useCartoLayerProps } from '@carto/react-api';
import htmlForFeature from 'utils/htmlForFeature';
<% if(locals.imports){ -%>
<%- imports %>
<% } -%>

export const <%= h.changeCase.constantCase(name) %>_ID = '<%= h.changeCase.camelCase(name) %>';

export default function <%= h.changeCase.pascalCase(name) %>() {
  const { <%= h.changeCase.camelCase(name) %> } = useSelector((state) => state.carto.layers);
  const source = useSelector((state) => selectSourceById(state, <%= h.changeCase.camelCase(name) %>?.source));
  const cartoLayerProps = useCartoLayerProps({ source });

  <% if(locals.props){ -%>
  const props = <%- props %>
  <% } -%>

  if (<%= h.changeCase.camelCase(name) %> && source) {
    return new CartoLayer({
      ...cartoLayerProps,
      id: <%= h.changeCase.constantCase(name) %>_ID,
      getFillColor: [241, 109, 122],
      pointRadiusMinPixels: 2,
      pickable: true,
      onHover: (info) => {
        if (info?.object) {
          info.object = {
            html: htmlForFeature({ feature: info.object }),
            style: {},
          };
        }
      },
      <% if(locals.props){ -%>...props<% } -%>
    });
  }
}
