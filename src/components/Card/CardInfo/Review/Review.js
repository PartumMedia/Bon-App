import React from "react";
import style from "./Review.module.scss";

const review = props => {
  return (
    <div className={style.Review}>
      <h6 className={style.Name}>
        {props.info.author_name}
        {props.info.author}
      </h6>
      <div className={style.Rating}>{displayStars(props)}</div>
      <div className={style.Comment}>
        <p>
          {props.info.text}
          {props.info.comment}
        </p>
      </div>
    </div>
  );
};

const displayStars = props => {
  switch (props.info.rating) {
    case 1: {
      return (
        <div className={style.Star}>
          <i className="fa fa-star" />
        </div>
      );
    }
    case 2: {
      return (
        <div className={style.Star}>
          <i className="fa fa-star" />
          <i className="fa fa-star" />
        </div>
      );
    }
    case 3: {
      return (
        <div className={style.Star}>
          <i className="fa fa-star" />
          <i className="fa fa-star" />
          <i className="fa fa-star" />
        </div>
      );
    }
    case 4: {
      return (
        <div className={style.Star}>
          <i className="fa fa-star" />
          <i className="fa fa-star" />
          <i className="fa fa-star" />
          <i className="fa fa-star" />
        </div>
      );
    }
    case 5: {
      return (
        <div className={style.Star}>
          <i className="fa fa-star" />
          <i className="fa fa-star" />
          <i className="fa fa-star" />
          <i className="fa fa-star" />
          <i className="fa fa-star" />
        </div>
      );
    }

    default: {
      return null;
    }
  }
};

export default review;
