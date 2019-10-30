import React, { Component } from "react";
import style from "./CardInfo.module.scss";
import Review from "./Review/Review";
import CreateReview from "./CreateReview/CreateReview";
import Axios from "axios";

class CardInfo extends Component {
  state = {
    restaurantId: this.props.info._id,
    reviews: this.props.info.reviews
  };

  updateReviewsHandler = () => {
    setTimeout(() => {
      Axios.get("/restaurants/reviews")
        .then(res => {
          res.data.forEach(restaurant => {
            if (restaurant._id === this.state.restaurantId) {
              this.setState({
                reviews: restaurant.reviews
              });
            }
          });
        })
        .catch(error => {
          console.log(error);
        });
    }, 3000);
  };

  render() {
    return (
      <div className={style.Container}>
        <div className={style.CardInfo}>
          <div className={style.Exit} onClick={this.props.closeWindow}>
            <i className="fa fa-times-circle" />
          </div>
          <h1>{this.props.info.name}</h1>
          <div className={style.Contact}>
            <div>
              <i className="fa fa-phone" />
              <span>{this.props.info.phone}</span>
            </div>
            <div>
              <i className="fa fa-map-marker" />
              <span>{this.props.info.address}</span>
            </div>
            <div>
              <i className="fa fa-envelope-square" />
              <span>{this.props.info.website}</span>
            </div>

            <hr />
          </div>
          <div className={style.Reviews}>
            <h3>Reviews</h3>
            {this.state.reviews !== undefined
              ? this.state.reviews.map((comment, i) => (
                  <Review key={i} info={comment} />
                ))
              : null}

            {this.props.info.place ? null : (
              <CreateReview
                info={this.props}
                reviewAdded={this.updateReviewsHandler}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default CardInfo;
