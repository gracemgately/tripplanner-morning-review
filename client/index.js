const mapboxgl = require("mapbox-gl");
const api = require("./api");
const buildMarker = require("./marker.js");

/*
 * App State
 */

const state = {
  attractions: {},
  selectedAttractions: [],
  itinerary: {}
};

/*
  * Instantiate the Map
  */

mapboxgl.accessToken = "YOUR TOKEN HERE";

const fullstackCoords = [-74.009, 40.705] // NY
// const fullstackCoords = [-87.6320523, 41.8881084] // CHI

const map = new mapboxgl.Map({
  container: "map",
  center: fullstackCoords,
  zoom: 12, // starting zoom
  style: "mapbox://styles/mapbox/streets-v10" // mapbox has lots of different map styles available.
});

/*
  * Populate the list of attractions
  */

api.fetchAttractions().then(attractions => {
    state.attractions = attractions;
    const { hotels, restaurants, activities } = attractions;
    hotels.forEach(hotel => makeOption(hotel, "hotels-choices"));
    restaurants.forEach(restaurant => makeOption(restaurant, "restaurants-choices"));
    activities.forEach(activity => makeOption(activity, "activities-choices"));
});


//READING THE HASH LOCATION & FETCHING INFORMATION
if (window.location.hash) {
  const itinId = window.location.hash.slice(1);


  api.fetchItinerary(itinId).then(itinerary => {
    return state.itinerary = itinerary
  }).then( ({ hotels, restaurants, activities }) => {
    hotels.forEach(hotel => buildAttractionAssets('hotels', hotel));
    restaurants.forEach(restaurant => buildAttractionAssets('restaurants', restaurant));
    activities.forEach(activity => buildAttractionAssets('activities', activity));
  });


};

//BUILDING THE SAVE BUTTON
const buildSaveBtn = () => {
  const saveButton = document.createElement('button');
  saveButton.className = "save-btn";
  saveButton.append('SAVE');
  saveButton.addEventListener('click', () => {
    postNewItinerary();
  })
  
  const itineraryPanel = document.getElementById('itinerary');
  itineraryPanel.append(saveButton);
};

buildSaveBtn();


//POSTING NEW ITINERARIES BY CLICKING SAVE BUTTON
const postNewItinerary = () => {
  const itinHotels = [];
  const itinRestaurants = [];
  const itinActivities = [];

  state.selectedAttractions.forEach(attraction => {
    if (attraction.category === 'restaurants') itinRestaurants.push(attraction);
    if (attraction.category === 'activities') itinActivities.push(attraction);
    if (attraction.category === 'hotels') itinHotels.push(attraction);
  });

  api.postItinerary(itinHotels, itinActivities, itinRestaurants)
  .then(response => {
    //console.log('response from api.postItinerary', response);
    window.location.hash = '#' + response.toString();
  })

};


const makeOption = (attraction, selector) => {
  const option = new Option(attraction.name, attraction.id); // makes a new option tag
  const select = document.getElementById(selector);
  select.add(option);
};

/*
  * Attach Event Listeners
  */

// what to do when the `+` button next to a `select` is clicked
["hotels", "restaurants", "activities"].forEach(attractionType => {
  document
    .getElementById(`${attractionType}-add`)
    .addEventListener("click", () => handleAddAttraction(attractionType));
});

// Create attraction assets (itinerary item, delete button & marker)
const handleAddAttraction = attractionType => {
  const select = document.getElementById(`${attractionType}-choices`);
  const selectedId = select.value;


  // Find the correct attraction given the category and ID
  const selectedAttraction = state.attractions[attractionType].find(
    attraction => +attraction.id === +selectedId
  );

  // If this attraction is already on state, return
  if (state.selectedAttractions.find(attraction => attraction.id === +selectedId && attraction.category === attractionType))
    return;

  //Build and add attraction
  buildAttractionAssets(attractionType, selectedAttraction);
  
};

const buildAttractionAssets = (category, attraction) => {
  
  // Create the Elements that will be inserted in the dom
  const removeButton = document.createElement("button");
  removeButton.className = "remove-btn";
  removeButton.append("x");

  const itineraryItem = document.createElement("li");
  itineraryItem.className = "itinerary-item";
  itineraryItem.append(attraction.name, removeButton);

  // Create the marker
  const marker = buildMarker(category, attraction.place.location);

  // Adds the attraction to the application state
  state.selectedAttractions.push({ id: attraction.id, category });

  //ADD TO DOM
  document.getElementById(`${category}-list`).append(itineraryItem);
  marker.addTo(map);

  // Animate the map
  map.flyTo({ center: attraction.place.location, zoom: 15 });

  removeButton.addEventListener("click", function remove() {
    // Stop listening for the event
    removeButton.removeEventListener("click", remove);

    // Remove the current attrction from the application state
    state.selectedAttractions = state.selectedAttractions.filter(
      selected => selected.id !== attraction.id || selected.category !== category
    );

    // Remove attraction's elements from the dom & Map
    itineraryItem.remove();
    marker.remove();

    console.log('state', state);

    // Animate map to default position & zoom.
    map.flyTo({ center: [-74.0, 40.731], zoom: 12.3 });
  });
};
