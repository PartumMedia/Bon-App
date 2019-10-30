import React, { Fragment, Component } from "react";
import style from "./Card.module.scss";
import StreetView from "./StreetView/StreetView";
import Axios from "axios";

class Card extends Component {
  state = {
    rating: null,
    name: null
  };

  componentDidMount() {
    if (this.props.restaurant.reviews !== undefined) {
      console.log("hey");
      this.setAverageRatingHandler();
    }
  }

  displayAverageRatingHandler = () => {
    switch (true) {
      case this.state.rating === 1: {
        return (
          <Fragment>
            <span>
              <i className="fa fa-star" />
            </span>
          </Fragment>
        );
      }

      case this.state.rating === 2: {
        return (
          <Fragment>
            <span>
              <i className="fa fa-star" />
            </span>
            <span>
              <i className="fa fa-star" />
            </span>
          </Fragment>
        );
      }

      case this.state.rating === 3: {
        return (
          <Fragment>
            <span>
              <i className="fa fa-star" />
            </span>
            <span>
              <i className="fa fa-star" />
            </span>
            <span>
              <i className="fa fa-star" />
            </span>
          </Fragment>
        );
      }

      case this.state.rating === 4: {
        return (
          <Fragment>
            <span>
              <i className="fa fa-star" />
            </span>
            <span>
              <i className="fa fa-star" />
            </span>
            <span>
              <i className="fa fa-star" />
            </span>
            <span>
              <i className="fa fa-star" />
            </span>
          </Fragment>
        );
      }

      case this.state.rating === 5: {
        return (
          <Fragment>
            <span>
              <i className="fa fa-star" />
            </span>
            <span>
              <i className="fa fa-star" />
            </span>
            <span>
              <i className="fa fa-star" />
            </span>
            <span>
              <i className="fa fa-star" />
            </span>
            <span>
              <i className="fa fa-star" />
            </span>
          </Fragment>
        );
      }

      default: {
        return null;
      }
    }
  };

  setAverageRatingHandler = () => {
    let comments = this.props.restaurant.reviews;
    if (this.props.restaurant.reviews.length === 0) {
      return;
    }

    let stars = comments.map(comment => {
      return comment.rating;
    });

    let sumStars = [];
    if (stars.length > 0) {
      sumStars = stars.reduce((previous, current) => {
        return (current += previous);
      });
    }

    let avgStars = Math.floor(sumStars / stars.length);
    let rating = Math.floor(this.props.restaurant.rating);

    if (this.props.restaurant.place === undefined) {
      Axios({
        method: "put",
        url: "/restaurants/rating",
        headers: {},
        data: {
          _id: this.props.restaurant._id,
          rating: avgStars
        }
      })
        .then(res => {
          console.log(res);
        })
        .catch(error => {
          console.log(error);
        });
    }

    // 5 hollow stars
    switch (true) {
      case avgStars <= 1 || rating <= 1:
        this.setState({
          rating: 1
        });
        break;
      case (avgStars === 2 && avgStars <= 3) || (rating === 2 && rating <= 3):
        this.setState({
          rating: 2
        });
        break;
      case (avgStars === 3 && avgStars <= 4) || (rating === 3 && rating <= 4):
        this.setState({
          rating: 3
        });
        break;
      case (avgStars === 4 && avgStars <= 5) || (rating === 4 && rating <= 5):
        this.setState({
          rating: 4
        });
        break;
      case avgStars === 5 || rating === 5:
        this.setState({
          rating: 5
        });
        break;

      default: {
        return null;
      }
    }
  };
  render() {
    return (
      <div className={style.Card} onClick={this.props.click}>
        <div className={style.CardImage} />
        <div className={style.Name}>{this.props.restaurant.name}</div>
        <div className={style.Body}>
          <div className={style.Image}>
            <StreetView info={this.props} />
          </div>
          <div className={style.Rating}>
            {/* If any information is missing from Places API, display the following text ''so and so not provided */}
            {this.props.restaurant.reviews !== undefined &&
            this.props.restaurant.reviews.length > 0 ? (
              <span>{this.displayAverageRatingHandler()}</span>
            ) : (
              <p>
                <span>Not yet rated</span>
              </p>
            )}

            {this.props.restaurant.phone !== undefined &&
            this.props.restaurant.phone ? (
              <p>
                <i className="fa fa-phone" /> {this.props.restaurant.phone}
              </p>
            ) : (
              <p>
                <span>No Phone number Provided</span>
              </p>
            )}

            {this.props.restaurant.phone && this.props.restaurant.website ? (
              <p>
                <a
                  className={style.Website}
                  href={this.props.restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa fa-envelope-square" />
                  Visit Website
                </a>
              </p>
            ) : (
              <p>
                <span>No Website Provided</span>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Card;
