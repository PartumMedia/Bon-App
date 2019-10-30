import React, { Component } from "react";
import style from "./Map.module.scss";
class Map extends Component {
  componentDidMount() {
    const map = new window.google.maps.Map(document.getElementById("map"), {
      center: { lat: this.props.center.lat, lng: this.props.center.long },
      zoom: 15
    });

    this.props.onMapLoad(map);
  }

  render() {
    return <div className={style.Map} id="map" />;
  }
}

export default Map;
