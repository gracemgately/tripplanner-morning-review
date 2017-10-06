const fetchAttractions = () =>
  fetch("/api")
    .then(result => result.json())
    .catch(err => console.error(err));

//FETCHING AN ITINERARY
const fetchItinerary = (id) =>
  fetch(`/api/itineraries/${id}`)
    .then(itinerary => itinerary.json())
    .catch(err => console.error(err));

//POSTING AN ITINERARY
const postItinerary = (chosenHotels, chosenActivities, chosenRestaurants) =>
  fetch('/api/itineraries', {

    headers: {
      'Content-Type': 'application/json'
    },

    method: 'post',
    body: JSON.stringify({
      hotels: JSON.stringify(chosenHotels),
      restaurants: JSON.stringify(chosenRestaurants),
      activities: JSON.stringify(chosenActivities)
    })
  })
    .then(result => result.json())
    .catch(err => console.error(err));

module.exports = {
  fetchAttractions,
  fetchItinerary,
  postItinerary
};
