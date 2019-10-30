import React, { Component } from "react";
import style from "./Filter.module.scss";
import FilterOption from "./FilterOption/FilterOption";

class Filter extends Component {
  state = {
    star1: 1,
    star2: 2,
    star3: 3,
    star4: 4,
    star5: 5
  };

  render() {
    return (
      <div>
        {this.props.clicked <= 0 ? (
          <div className={style.Filter}>
            <FilterOption
              filterRatings={this.props.filterRatings}
              stars={this.state.star1}
            />
            <FilterOption
              filterRatings={this.props.filterRatings}
              stars={this.state.star2}
            />
            <FilterOption
              filterRatings={this.props.filterRatings}
              stars={this.state.star3}
            />
            <FilterOption
              filterRatings={this.props.filterRatings}
              stars={this.state.star4}
            />
            <FilterOption
              filterRatings={this.props.filterRatings}
              stars={this.state.star5}
            />
          </div>
        ) : (
          <div className={style.Filter}>
            <FilterOption
              filterRatings={this.props.filterRatings}
              stars={this.state.star1}
              clicked={this.props.clicked}
            />
          </div>
        )}
      </div>
    );
  }
}

export default Filter;
