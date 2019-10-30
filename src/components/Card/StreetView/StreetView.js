import React from "react";
import style from "./StreetView.module.scss";

const streetView = props => {
  return (
    <div className={style.StreetView}>
      <img
        alt="Restaurant Street View"
        src={`https://maps.googleapis.com/maps/api/streetview?size=400x400&location=${
          props.info.restaurant.lat
        },${props.info.restaurant.long}
        &fov=90&heading=235&pitch=10
        &key=AIzaSyDiZfRQljlgZpuJRFNkL6zXoM7NWpZ-6_4`}
      />
    </div>
  );
};

export default streetView;
