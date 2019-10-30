import React, { Component } from "react";
import style from "./CreateReview.module.scss";
import Axios from "axios";

class createReview extends Component {
  state = {
    restaurantId: this.props.info.info._id,
    author: "",
    rating: 1,
    comment: "",
    loading: false
  };

  loaderHandler() {
    if (this.state.loading) {
      return <div className={style.Loader}>Loading...</div>;
    } else {
      return null;
    }
  }

  submitHandler = e => {
    e.preventDefault();

    this.setState({
      rating: Number(this.state.rating)
    });

    Axios.post("/restaurants/reviews", this.state)
      .then(res => {
        console.log(res);
        this.setState({
          loading: true
        });

        setTimeout(() => {
          this.setState({
            author: "",
            rating: 1,
            comment: "",
            loading: false
          });
        }, 3000);
      })
      .catch(error => {
        console.log(error);
      });
    this.props.reviewAdded();
  };

  changeHandler = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };
  render() {
    const { author, comment, rating } = this.state;
    return (
      <div className={style.CreateReview}>
        {this.loaderHandler()}
        <hr />
        <form onSubmit={this.submitHandler} id="form">
          <input
            type="text"
            value={author}
            name="author"
            placeholder="Your Name..."
            className={style.Name}
            onChange={this.changeHandler}
            required
          />
          <textarea
            type="text"
            value={comment}
            name="comment"
            placeholder="Your Thoughts..."
            className={style.Body}
            onChange={this.changeHandler}
            maxLength="280"
            required
          />

          <select name="rating" onChange={this.changeHandler} value={rating}>
            <option value="1">1 Star</option>
            <option value="2">2 Stars</option>
            <option value="3">3 Stars</option>
            <option value="4">4 Stars</option>
            <option value="5">5 Stars</option>
          </select>

          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

export default createReview;
