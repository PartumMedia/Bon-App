import React, { Component } from "react";
import style from "./App.module.scss";
import AppMap from "./components/Map/Map";
import Filter from "./components/Filter/Filter";
import Card from "./components/Card/Card";
import Footer from "./components/Footer/Footer";
import CardInfo from "./components/Card/CardInfo/CardInfo";
import AddRestaurant from "./components/AddRestaurant/AddRestaurant";
import Axios from "axios";

class App extends Component {
  state = {
    latPos: 51.897869, // Latitude position of user
    longPos: -8.47109, // Longitude position of user
    restaurants: [], // Array of all restaurants (database and Places API)
    visibleRestaurants: [], //Restaurants visible on the map at any given time
    filteredRestaurants: [], //Restaurants visible when filter is applied
    restaurantMarkers: [], //Markers for all visible restaurants
    showCardInfo: false, // Whether to show card info or not
    cardInfo: null, // Information for each card
    map: null, // Only sets map when position has been established
    restaurantCoords: {
      lat: null,
      long: null
    }, // Coordinates of each restaurant
    mapLoaded: false, // Whether or not themap has loaded
    createRestaurant: false, // Whether the add restaurant window is open or not
    restaurantAdded: false, // Is set to true when a restaurant is added
    markerAdded: false, // Same as above
    placesFetched: false, // Checks whether or not restaurants were fetched from google places
    restaurantsFetched: false, // Checks whether or not restaurants were fetched from database
    restaurantsInitialized: false, // Checks whether or not restaurants have been initialized on the map
    clicked: 0, // Checks amounts of clicked (for filter)
    filtered: false, // Whether or not the filter options have been used
    reset: false, // The X of the filter options
    loading: false, // A check for a loader for the cards when filtered.
    noResults: false
  };

  componentDidMount() {
    // Data fetching here
    this.getRestaurantsHandler(); // Fetching restaurants from database
    // this.getUserPositionHandler(); // Calling the geolocation API
  }

  componentDidUpdate() {
    // Is used after render to perform dom operations after data has been fetched
    this.getMapHandler(); //
  }

  // Fetch user location from navigator
  // getUserPositionHandler() {
  //   if (navigator.geolocation) {
  //     return navigator.geolocation.getCurrentPosition(
  //       this.setUserPositionHandler,
  //       this.getErrorHandler,
  //       { maximumAge: 60000, timeout: 5000, enableHighAccuracy: true }
  //     );
  //   }
  // }

  // Set user position using coordinates provided by navigator
  setUserPositionHandler = position => {
    this.setState({
      latPos: position.coords.latitude,
      longPos: position.coords.longitude
    });
  };

  // If navigator times-out
  getUserPositionErrorHandler = () => {
    return console.log("Error Occurred...");
  };

  closeCardInfoHandler = () => {
    if (this.state.showCardInfo) {
      this.setState({
        showCardInfo: false
      });
    }
  };

  closeCreateRestaurantHandler = () => {
    if (this.state.createRestaurant) {
      this.setState({
        createRestaurant: false
      });
    }
  };

  //Renders restaurant information card
  showCardInfoHandler = () => {
    if (this.state.showCardInfo === true) {
      return <CardInfo />;
    }
  };

  // Sets the restaurant information in card
  setCardInfoHandler = restaurant => {
    this.setState({
      cardInfo: restaurant,
      showCardInfo: true
    });
  };

  // Initialize and update map
  getMapHandler = () => {
    let visibleRestaurants = []; //Visible restaurants on map at any given time
    let restaurantMarkers = []; // Markers for visible restaurants;
    let restaurantSet; // Creates a set of unique restaraurants (stops duplicate restaurants from being created)
    let uniqueVisibleRestaurants; // Once Set is created, they are returned back to array here.

    if (
      // Map will load if conditions are met
      this.state.mapLoaded === false &&
      this.state.restaurants.length > 0 &&
      this.state.latPos !== null &&
      this.state.longPos !== null
    ) {
      this.setState({
        map: (
          <AppMap
            center={{ lat: this.state.latPos, long: this.state.longPos }}
            onMapLoad={map => {
              // Create Marker for user position
              var marker = new window.google.maps.Marker({
                position: { lat: this.state.latPos, lng: this.state.longPos },
                map: map,
                icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                title: "You"
              });

              setTimeout(() => {
                this.setState({
                  // set the original restaurants that were rendered. Useful for the filter options
                  originalRestaurants: visibleRestaurants,
                  originalMarkers: restaurantMarkers
                });

                setInterval(() => {
                  // Checking whether or not the condition is true every 100 milliseconds
                  if (this.state.reset === true) {
                    this.state.originalMarkers.forEach(marker => {
                      // Resetting markers on map when filter options are reset
                      marker.setMap(map);
                    });

                    this.setState({
                      // resetting state
                      reset: false
                    });
                  }
                }, 100);
              }, 3000);

              // Search for restaurants around area
              this.nearbySearch(map);

              // Initialize Map, Markers, Restaurants
              window.google.maps.event.addListener(map, "tilesloaded", () => {
                setTimeout(() => {
                  //Using set time out to allow time for information to be fetched from Places and database.
                  if (
                    this.state.restaurantsInitialized === false &&
                    this.state.placesFetched === true
                  ) {
                    // Initialize restaurants and set markers
                    this.setState({
                      restaurants: [
                        ...this.state.finalPlaces,
                        ...this.state.restaurants
                      ],
                      restaurantsInitialized: true
                    });

                    this.state.restaurants.forEach(restaurant => {
                      this.setState(prevState => ({
                        //set state to be the current state + new state.
                        restaurantMarkers: [
                          ...prevState.restaurantMarkers,
                          this.getMarkersHandler(restaurant, map)
                        ]
                      }));
                    });
                  }

                  this.state.restaurantMarkers.forEach(marker => {
                    restaurantMarkers.push(marker);
                  });

                  // Returns the lat/lng bounds of the current viewport allowing us to search for and display restaurants
                  let bounds = map.getBounds();

                  this.state.restaurantMarkers.forEach(marker => {
                    //For each marker
                    this.state.restaurants.forEach(restaurant => {
                      //For each restaurant
                      visibleRestaurants.forEach((restaurant, i) => {
                        //For each visible restaurant
                        if (
                          restaurant._id === marker.id &&
                          bounds.contains(marker.getPosition()) === false
                        ) {
                          // If not visible, remove
                          visibleRestaurants.splice(i, 1);
                        }
                      });

                      if (
                        restaurant._id === marker.id &&
                        bounds.contains(marker.getPosition()) === true
                      ) {
                        // if visible, add
                        visibleRestaurants.push(restaurant);
                      }
                    });
                  });

                  // Stopping any duplicate restaurants from being created
                  restaurantSet = new Set(visibleRestaurants);
                  // Taking Set and reverting back to array
                  uniqueVisibleRestaurants = [...restaurantSet];

                  // Resetting state
                  this.setState({
                    visibleRestaurants: uniqueVisibleRestaurants,
                    originalRestaurants: uniqueVisibleRestaurants
                  });
                }, 3000);
              });

              // Update Map when interaction occurs. ie: user drags map, restaurant gets added.
              setTimeout(() => {
                window.google.maps.event.addListener(map, "idle", () => {
                  let bounds = map.getBounds();

                  this.state.restaurantMarkers.forEach(marker => {
                    this.state.restaurants.forEach(restaurant => {
                      visibleRestaurants.forEach((restaurant, i) => {
                        if (
                          restaurant._id === marker.id &&
                          bounds.contains(marker.getPosition()) === false
                        ) {
                          visibleRestaurants.splice(i, 1);
                        }
                      });

                      if (
                        restaurant._id === marker.id &&
                        bounds.contains(marker.getPosition()) === true
                      ) {
                        visibleRestaurants.push(restaurant);
                      }
                    });
                  });

                  restaurantSet = new Set(visibleRestaurants);
                  uniqueVisibleRestaurants = [...restaurantSet];

                  this.setState({
                    visibleRestaurants: uniqueVisibleRestaurants
                  });
                });

                setInterval(() => {
                  //Checking to see if restaurant has been added.
                  if (this.state.restaurantAdded) this.getRestaurantsHandler();
                }, 1);

                setInterval(() => {
                  if (
                    //If restaurant has been added, add restaurant to state array and render.
                    this.state.markerAdded === false &&
                    this.state.restaurantAdded === true
                  ) {
                    this.state.restaurants.forEach(restaurant => {
                      this.setState(prevState => ({
                        restaurantMarkers: [
                          ...prevState.restaurantMarkers,
                          this.getMarkersHandler(restaurant, map)
                        ],
                        markerAdded: true,
                        restaurantAdded: false
                      }));
                    });
                  }

                  visibleRestaurants = [];
                }, 5000);

                setInterval(() => {
                  this.setState({
                    markerAdded: false
                  });
                }, 3500);
              }, 3000);

              window.google.maps.event.addListener(map, "click", event => {
                // Trigger 'add restaurant' window, grabbing coordinates and setting state.
                this.setState({
                  restaurantCoords: {
                    lat: event.latLng.lat(),
                    long: event.latLng.lng()
                  },
                  createRestaurant: true
                });

                if (this.state.createRestaurant) {
                  // Resetting markers so a new one may be added without causing duplicates.
                  this.resetMarkers();
                }
              });

              return marker;
            }}
          />
        ),
        mapLoaded: true
      });
    }
  };

  // Get places information
  nearbySearch = map => {
    // Using the google PlaceService
    let placeService = new window.google.maps.places.PlacesService(map); // Instantiating the placeService
    let places = []; // Array of places fetched
    let placesInfo = []; // Information of fetched places
    let finalPlaces = []; // Modified array setting all information needed
    let finalPlace = {}; // Object for each modified place
    let search = {
      // Defining a search radius
      bounds: map.getBounds(), // Getting bounds of viewport
      location: { lat: this.state.latPos, lng: this.state.longPos }, // Setting the location from which to start our radius search
      radius: 1000, // Setting radius of 1 km
      types: ["restaurant", "food"] // Searching for places with a description item of 'restaurant' or 'food'
    };

    placeService.nearbySearch(search, (res, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        // If no errors have occured in our search
        res.forEach(result => {
          // For each result of the response, push result into our array.
          places.push(result);
        });

        places.forEach(place => {
          // Setting template for details we want to retrive using the getDetails API
          let details = {
            fields: [
              "formatted_address",
              "formatted_phone_number",
              "geometry",
              "name",
              "place_id",
              "price_level",
              "rating",
              "reviews",
              "website"
            ],
            placeId: place.place_id
          };
          placeService.getDetails(details, (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              // If no errors with place query push info into our array
              placesInfo.push(place);

              // Create a new object with the information we were sent and add it to our array.
              finalPlaces.push(
                (finalPlace = {
                  place: place.place_id,
                  _id: place.place_id,
                  address: place.formatted_address,
                  lat: place.geometry.location.lat(),
                  long: place.geometry.location.lng(),
                  price: place.price_level,
                  rating: place.rating,
                  reviews: place.reviews,
                  website: place.website,
                  name: place.name,
                  phone: place.formatted_phone_number
                })
              );
              // Set our state
              this.setState({
                finalPlaces: finalPlaces,
                placesFetched: true
              });
            }
          });
        });
      } else if (
        status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS
      ) {
        this.setState({
          noResults: true
        });
      }
    });
  };

  // Reset conditions after restaurant has successfully been added to database
  restaurantAddedHandler = () => {
    this.setState({
      restaurantCoords: {
        lat: null,
        long: null
      },
      createRestaurant: false,
      restaurantAdded: true
    });
  };

  // Set final restaurant Array
  setRestaurants = () => {
    // Grabs restaurants from database and from places and merges them into one array.
    this.setState({
      restaurants: [...this.state.finalPlaces, ...this.state.restaurants],
      restaurantsInitialized: true
    });
  };

  // Fetch restaurants from backend
  getRestaurantsHandler = () => {
    // Using axios to fetch our restaurants from the backend
    Axios.get("/restaurants").then(res => {
      if (res.status === 200) {
        this.setState({
          restaurants: res.data,
          restaurantsFetched: true
        });

        if (this.state.restaurantsInitialized) {
          this.setState({
            restaurants: [...this.state.finalPlaces, ...this.state.restaurants]
          });
        }
      }
    });
  };

  // Reset markers on map to display new locations
  resetMarkers = () => {
    // Resetting markers for when a new restaurant is added (stops duplicate markers from being created)
    this.state.restaurantMarkers.forEach(marker => {
      marker.setMap(null);
    });
    this.setState({
      restaurantMarkers: []
    });
  };

  // Get location of markers / create markers
  getMarkersHandler(restaurant, map) {
    //Grab position of restaurant and assign it to corresponding marker -> render marker
    let marker = new window.google.maps.Marker({
      position: {
        lat: restaurant.lat,
        lng: restaurant.long
      },
      map: map,
      id: restaurant._id,
      icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
    });

    return marker;
  }

  // Loader for cards if filter option has been triggered
  cardLoaderHandler() {
    if (this.state.loading) {
      return (
        <div className={style.cardLoaderContainer}>
          <div className={style.CardLoader}>Loading...</div>
        </div>
      );
    } else {
      return null;
    }
  }

  // Filter option handler
  filterRatings = star => {
    // Setting variables for data manipulation and not breaking state
    let visibleRestaurants = this.state.visibleRestaurants;
    let restaurantMarkers = this.state.restaurantMarkers;
    let restRating = {
      _id: "",
      rating: undefined
    };

    // looping through visible restaurants array and grabbing id + rating of each restaurant
    let ratings = this.state.visibleRestaurants.map(restaurant => {
      return (restRating = {
        _id: restaurant._id,
        rating: Math.floor(restaurant.rating)
      });
    });

    // Using filter() on ratings array to return and push restaurants into ratings1 with 1 star
    let ratings1 = ratings.filter(index => {
      if (index.rating < 2) {
        return (restRating = {
          _id: index._id,
          rating: index
        });
      }
      return null;
    });

    let ratings2 = ratings.filter(index => {
      if (index.rating === 2) {
        return (restRating = {
          _id: index._id,
          rating: index
        });
      }
      return null;
    });

    let ratings3 = ratings.filter(index => {
      if (index.rating === 3) {
        return (restRating = {
          _id: index._id,
          rating: index
        });
      }
      return null;
    });

    let ratings4 = ratings.filter(index => {
      if (index.rating === 4) {
        return (restRating = {
          _id: index._id,
          rating: index
        });
      }
      return null;
    });

    let ratings5 = ratings.filter(index => {
      if (index.rating === 5) {
        return (restRating = {
          _id: index._id,
          rating: index
        });
      }
      return null;
    });

    // Setting variables
    let sortedMarkers = [];
    let sortedRestaurants = [];

    let removedMarkers = [];
    let removedRestaurants = [];

    // Using setTimeout so conditions can be reset allowing unlimited filtering
    setTimeout(() => {
      switch (true) {
        // If the 1 star button has been pressed
        case star === 1 && this.state.filtered === false: {
          // Comparing arrays and pushing restaurants with 1 star into new array for data manipulation.
          ratings1.forEach(rating => {
            visibleRestaurants.forEach(restaurant => {
              if (rating._id === restaurant._id) {
                sortedRestaurants.push(restaurant);
              }
            });
            // Grabbing all restaurants that were not added to sortedRestaurants array
            // Used to reset back to our original restaurants
            visibleRestaurants.forEach(restaurant => {
              if (rating._id !== restaurant._id) {
                removedRestaurants.push(restaurant);
              }
            });

            // Same as above but for restaurant markers
            restaurantMarkers.forEach((marker, i) => {
              if (marker.id === rating._id) {
                sortedMarkers.push(marker);
              }
            });

            restaurantMarkers.forEach((marker, i) => {
              if (marker.id !== rating._id) {
                removedMarkers.push(marker);
              }
            });
          });

          // Using Set to stop duplicate restaurants / markers from being created
          let removedRestaurantSet = new Set(removedRestaurants);
          removedRestaurants = [...removedRestaurantSet];
          let removedMarkerSet = new Set(removedMarkers);
          removedMarkers = [...removedMarkerSet];

          restaurantMarkers.forEach(marker => {
            if (!sortedMarkers.includes(marker)) {
              marker.setMap(null);
            }

            if (!sortedMarkers.includes(marker)) {
              removedMarkers.push(marker);
            }
          });

          // Setting state
          this.setState({
            filteredRestaurants: sortedRestaurants,
            restaurantMarkers: sortedMarkers,
            visibleRestaurants: sortedRestaurants,
            filtered: true,
            clicked: this.state.clicked + 1,
            loading: false
          });

          // Used to show X in filter options and resetting back to original state
          if (this.state.clicked > 1) {
            this.setState({
              visibleRestaurants: this.state.originalRestaurants,
              restaurantMarkers: this.state.originalMarkers,
              clicked: 0,
              reset: true
            });
          }
          break;
        }
        case star === 2 && this.state.filtered === false: {
          ratings2.forEach(rating => {
            visibleRestaurants.forEach(restaurant => {
              if (rating._id === restaurant._id) {
                sortedRestaurants.push(restaurant);
              }
            });

            visibleRestaurants.forEach(restaurant => {
              if (rating._id !== restaurant._id) {
                removedRestaurants.push(restaurant);
              }
            });

            restaurantMarkers.forEach((marker, i) => {
              if (marker.id === rating._id) {
                sortedMarkers.push(marker);
              }
            });

            restaurantMarkers.forEach((marker, i) => {
              if (marker.id !== rating._id) {
                removedMarkers.push(marker);
              }
            });
          });

          let removedRestaurantSet = new Set(removedRestaurants);
          removedRestaurants = [...removedRestaurantSet];
          let removedMarkerSet = new Set(removedMarkers);
          removedMarkers = [...removedMarkerSet];

          restaurantMarkers.forEach(marker => {
            if (!sortedMarkers.includes(marker)) {
              marker.setMap(null);
            }

            if (!sortedMarkers.includes(marker)) {
              removedMarkers.push(marker);
            }
          });

          this.setState({
            filteredRestaurants: sortedRestaurants,
            restaurantMarkers: sortedMarkers,
            visibleRestaurants: sortedRestaurants,
            filtered: true,
            clicked: this.state.clicked + 1,
            loading: false
          });

          if (this.state.clicked > 1) {
            this.setState({
              visibleRestaurants: this.state.originalRestaurants,
              restaurantMarkers: this.state.originalMarkers,
              clicked: 0,
              reset: true
            });
          }
          break;
        }
        case star === 3 && this.state.filtered === false: {
          ratings3.forEach(rating => {
            visibleRestaurants.forEach(restaurant => {
              if (rating._id === restaurant._id) {
                sortedRestaurants.push(restaurant);
              }
            });

            visibleRestaurants.forEach(restaurant => {
              if (rating._id !== restaurant._id) {
                removedRestaurants.push(restaurant);
              }
            });

            restaurantMarkers.forEach((marker, i) => {
              if (marker.id === rating._id) {
                sortedMarkers.push(marker);
              }
            });

            restaurantMarkers.forEach((marker, i) => {
              if (marker.id !== rating._id) {
                removedMarkers.push(marker);
              }
            });
          });

          let removedRestaurantSet = new Set(removedRestaurants);
          removedRestaurants = [...removedRestaurantSet];
          let removedMarkerSet = new Set(removedMarkers);
          removedMarkers = [...removedMarkerSet];

          restaurantMarkers.forEach(marker => {
            if (!sortedMarkers.includes(marker)) {
              marker.setMap(null);
            }

            if (!sortedMarkers.includes(marker)) {
              removedMarkers.push(marker);
            }
          });

          this.setState({
            filteredRestaurants: sortedRestaurants,
            restaurantMarkers: sortedMarkers,
            visibleRestaurants: sortedRestaurants,
            filtered: true,
            clicked: this.state.clicked + 1,
            loading: false
          });

          if (this.state.clicked > 1) {
            this.setState({
              visibleRestaurants: this.state.originalRestaurants,
              restaurantMarkers: this.state.originalMarkers,
              clicked: 0,
              reset: true
            });
          }
          break;
        }
        case star === 4 && this.state.filtered === false: {
          ratings4.forEach(rating => {
            visibleRestaurants.forEach(restaurant => {
              if (rating._id === restaurant._id) {
                sortedRestaurants.push(restaurant);
              }
            });

            visibleRestaurants.forEach(restaurant => {
              if (rating._id !== restaurant._id) {
                removedRestaurants.push(restaurant);
              }
            });

            restaurantMarkers.forEach((marker, i) => {
              if (marker.id === rating._id) {
                sortedMarkers.push(marker);
              }
            });

            restaurantMarkers.forEach((marker, i) => {
              if (marker.id !== rating._id) {
                removedMarkers.push(marker);
              }
            });
          });

          let removedRestaurantSet = new Set(removedRestaurants);
          removedRestaurants = [...removedRestaurantSet];
          let removedMarkerSet = new Set(removedMarkers);
          removedMarkers = [...removedMarkerSet];

          restaurantMarkers.forEach(marker => {
            if (!sortedMarkers.includes(marker)) {
              marker.setMap(null);
            }

            if (!sortedMarkers.includes(marker)) {
              removedMarkers.push(marker);
            }
          });

          this.setState({
            filteredRestaurants: sortedRestaurants,
            restaurantMarkers: sortedMarkers,
            visibleRestaurants: sortedRestaurants,
            filtered: true,
            clicked: this.state.clicked + 1,
            loading: false
          });

          if (this.state.clicked > 1) {
            this.setState({
              visibleRestaurants: this.state.originalRestaurants,
              restaurantMarkers: this.state.originalMarkers,
              clicked: 0,
              reset: true
            });
          }
          break;
        }
        case star === 5 && this.state.filtered === false: {
          ratings5.forEach(rating => {
            visibleRestaurants.forEach(restaurant => {
              if (rating._id === restaurant._id) {
                sortedRestaurants.push(restaurant);
              }
            });

            visibleRestaurants.forEach(restaurant => {
              if (rating._id !== restaurant._id) {
                removedRestaurants.push(restaurant);
              }
            });

            restaurantMarkers.forEach((marker, i) => {
              if (marker.id === rating._id) {
                sortedMarkers.push(marker);
              }
            });

            restaurantMarkers.forEach((marker, i) => {
              if (marker.id !== rating._id) {
                removedMarkers.push(marker);
              }
            });
          });

          let removedRestaurantSet = new Set(removedRestaurants);
          removedRestaurants = [...removedRestaurantSet];
          let removedMarkerSet = new Set(removedMarkers);
          removedMarkers = [...removedMarkerSet];

          restaurantMarkers.forEach(marker => {
            if (!sortedMarkers.includes(marker)) {
              marker.setMap(null);
            }

            if (!sortedMarkers.includes(marker)) {
              removedMarkers.push(marker);
            }
          });

          this.setState({
            filteredRestaurants: sortedRestaurants,
            restaurantMarkers: sortedMarkers,
            visibleRestaurants: sortedRestaurants,
            filtered: true,
            clicked: this.state.clicked + 1,
            loading: false
          });

          if (this.state.clicked > 1) {
            this.setState({
              visibleRestaurants: this.state.originalRestaurants,
              restaurantMarkers: this.state.originalMarkers,
              clicked: 0,
              reset: true
            });
          }
          break;
        }

        default: {
          return null;
        }
      }
      setTimeout(() => {
        // Used for displaying X in filter option
        this.setState({
          filtered: false
        });
      }, 500);
    }, 1000);

    // Used to show loading spinner
    this.setState(prevState => ({
      loading: !prevState.loading
    }));
  };

  // Handler for loading screen
  loadingScreenHandler = () => {
    let init = style.Loading;
    let fade = `${style.Loading} ' ' ${style.Fade}`;
    if (this.state.restaurantsInitialized) {
      return (
        <div className={fade} id={style.Remove}>
          <div className={style.Logo}></div>
        </div>
      );
    } else {
      return (
        <div className={init}>
          <div className={style.LoaderContainer}>
            <div className={style.Logo}></div>

            <div className={style.TextContainer}>
              <span className={style.Text}>Loading</span>
              <div className={style.Loader}></div>
            </div>
          </div>
        </div>
      );
    }
  };

  render() {
    return (
      <div className={style.App}>
        {/* If no results are available (ie: in the middle of the ocean), a screen will appear displaying the following */}
        {this.state.noResults === true ? (
          <div className={style.NoResults}>
            <p>No results found for your location</p>
          </div>
        ) : null}
        {this.loadingScreenHandler()}
        {this.cardLoaderHandler()}
        <div className={style.AppContainer}>
          <div className={style.Map} onClick={this.createRestaurant}>
            {this.state.map}
          </div>

          <div className={style.List}>
            <Filter
              filterRatings={this.filterRatings}
              clicked={this.state.clicked}
            />

            {this.state.visibleRestaurants.map(restaurant => (
              <Card
                key={restaurant._id}
                restaurant={restaurant}
                click={() => this.setCardInfoHandler(restaurant)}
              />
            ))}
          </div>
        </div>
        {this.state.showCardInfo ? (
          <CardInfo
            info={this.state.cardInfo}
            closeWindow={this.closeCardInfoHandler}
          />
        ) : null}

        {this.state.createRestaurant ? (
          <AddRestaurant
            restaurantCoords={this.state.restaurantCoords}
            update={this.getRestaurantsHandler}
            restaurantAdded={this.restaurantAddedHandler}
            closeWindow={this.closeCreateRestaurantHandler}
          />
        ) : null}
        <div className={style.Push}></div>
        <Footer />
      </div>
    );
  }
}

export default App;
