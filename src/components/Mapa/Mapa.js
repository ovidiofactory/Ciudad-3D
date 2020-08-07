import React, { Component, useState, useEffect } from "react";
import { connect } from "react-redux";
import { renderToString } from "react-dom/server";
import MapaInteractivoGL from "../../utils/MapaInteractivoGL";
import FeatureInfo from "../FeatureInfo/FeatureInfo";
import Buscador from "../Buscador/Buscador";
import { updateMap, initMap } from "../../store/actions";
import imgCapaBasePrincipal from "../../img/capabase_1.png";
import imgCapaBaseSecundaria from "../../img/capabase_2.png";
import LogoutButton from '../LogoutButton/LogoutButton';
import { useSelector, useDispatch } from 'react-redux'
import "./styles.css";

const Mapa = (props) => {
  const map = useSelector(state => state.map.mapaGL);
  const dispatch = useDispatch()
  const [capabasePrincipal, setCapabasePrincipal] = useState(true)
  const { logged, updateMapAction, initMapAction } = props;
  const toogleBaseLayer = () => {
    map.toggleBaseLayer();
    setCapabasePrincipal(!capabasePrincipal);
  };

  const onFeatureClick = (lngLat, feature) => {
    map
      .getFeatureProps(feature.properties.Id)
      .then(res => res.json())
      .then(props => {
        const contenido = renderToString(<FeatureInfo props={props} />);
        map.addPopup(lngLat, contenido);
      })
      .catch(err => {
        console.error(err);
      });
  };

  useEffect(() => {
    if (!map) {
      setTimeout(() => {
        const instanciaMap = new MapaInteractivoGL({
          onFeatureClick
        });

        //dispatch de la accion para guardar la instancia en el store
        dispatch(updateMap(instanciaMap))

        //agrego las capas prendidas por default
        dispatch(initMap())
      }, 500);
    }
  }, [map, dispatch])

  return (
    <div id="map">
      <div className="topMenu">
        <Buscador />
        {logged ? <LogoutButton /> : null}
      </div>
      <div className="bottomMenu" onClick={toogleBaseLayer}>
        <div
          className="minimap-layer"
          style={{
            backgroundImage: !capabasePrincipal
              ? `url(${imgCapaBasePrincipal})`
              : `url(${imgCapaBaseSecundaria})`
          }}
        >
          <div className="minimap-title-container">
            <div className="minimap-title">
              {!capabasePrincipal ? "Modo Oscuro" : "Modo Claro"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Mapa;
