import React, { Component } from "react";
import style from "./AddRestaurant.module.scss";
import axios from "axios";

class AddRestaurant extends Component {
  state = {
    name: "",
    address: "",
    cuisine: "",
    price: "",
    website: "",
    phone: "",
    rating: 1,
    lat: this.props.restaurantCoords.lat,
    long: this.props.restaurantCoords.long
  };

  closeWindowHandler = () => {
    this.props.closeWindow();
    this.props.restaurantAdded();
  };

  submitHandler = e => {
    e.preventDefault();

    axios
      .post("/restaurants", this.state)
      .then(res => {
        console.log(res);
      })
      .catch(error => {
        console.log(error);
      });

    this.props.update();
    this.props.restaurantAdded();
  };

  changeHandler = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  render() {
    const { name, address, website, phone } = this.state;
    return (
      <div className={style.Container}>
        <div className={style.AddRestaurant}>
          <div className={style.Exit} onClick={this.closeWindowHandler}>
            <i className="fa fa-times-circle" />
          </div>
          <h1>Add A Restaurant</h1>

          <form id="create-restaurant" onSubmit={this.submitHandler}>
            <input
              type="Text"
              placeholder="Restaurant Name..."
              name="name"
              value={name}
              onChange={this.changeHandler}
              className={style.Input}
              required
            />
            <input
              type="Text"
              placeholder="Address..."
              name="address"
              value={address}
              onChange={this.changeHandler}
              className={style.Input}
              required
            />
            <input
              type="tel"
              pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
              placeholder="Telephone..."
              name="phone"
              value={phone}
              onChange={this.changeHandler}
              className={style.Input}
              required
            />
            <input
              type="text"
              placeholder="Website..."
              name="website"
              value={website}
              onChange={this.changeHandler}
              className={style.Input}
            />

            <input type="submit" value="submit" className={style.Submit} />
          </form>
        </div>
      </div>
    );
  }
}

export default AddRestaurant;
