import React, { Component } from "react";
import style from "./FilterOption.module.scss";

class FilterOption extends Component {
  clickHandler = () => {
    this.props.filterRatings(this.props.stars);
  };

  imageHandler = () => {
    let img1 = require("../../../assets/imgs/Star-1.svg");
    let img2 = require("../../../assets/imgs/Star-2.svg");
    let img3 = require("../../../assets/imgs/Star-3.svg");
    let img4 = require("../../../assets/imgs/Star-4.svg");
    let img5 = require("../../../assets/imgs/Star-5.svg");
    let imgExit = require("../../../assets/imgs/Exit.svg");

    if (this.props.clicked === undefined) {
      switch (this.props.stars) {
        case 1: {
          return img1;
        }
        case 2: {
          return img2;
        }
        case 3: {
          return img3;
        }
        case 4: {
          return img4;
        }
        case 5: {
          return img5;
        }

        default: {
          return null;
        }
      }
    }

    if (this.props.clicked >= 1) {
      return imgExit;
    }
  };

  render() {
    return (
      <div className={style.FilterOption} onClick={this.clickHandler}>
        <img src={this.imageHandler()} alt="option"></img>
      </div>
    );
  }
}

export default FilterOption;
