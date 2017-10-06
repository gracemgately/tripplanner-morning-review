const router = require("express").Router();
const Hotel = require("../models").Hotel;
const Restaurant = require("../models").Restaurant;
const Activity = require("../models").Activity;
const Itinerary = require("../models").Itinerary;

router.get("/", (req, res, next) => {
  Promise.all([
    Hotel.findAll({ include: [{ all: true }] }),
    Restaurant.findAll({ include: [{ all: true }] }),
    Activity.findAll({ include: [{ all: true }] })
  ])
    .then(([hotels, restaurants, activities]) => {
      res.json({
        hotels,
        restaurants,
        activities
      });
    })
    .catch(next);
});

//PROVIDING THE PARTICULAR ITINERARY
router.get("/itineraries/:id", (req, res, next) => {
  Itinerary.findById(req.params.id, {
    include: [{ all: true, nested: true }]
  })
    .then((itinerary) => {
      res.json(itinerary);
    })
    .catch(next);
});

//POSTING A NEW ITINERARY
router.post("/itineraries", (req, res, next) => {
    const { hotels, activities, restaurants } = req.body;

    const hotelIds = (JSON.parse(hotels)).map(hotel => hotel.id);
    const activityIds = (JSON.parse(activities)).map(activity => activity.id);
    const restaurantIds = (JSON.parse(restaurants)).map(restaurant => restaurant.id);

    Itinerary.create({})
    .then(itinerary => {

      return Promise.all([
        itinerary.addHotel(hotelIds),
        itinerary.addRestaurant(restaurantIds),
        itinerary.addActivity(activityIds)
      ])
      //THESE THINGS COME FROM THE JOIN TABLES
      .then(([[hotels], [restaurants], [activities]]) => {
        const joinTableInstances = [];

        if (hotels) joinTableInstances.push(hotels);
        if (restaurants) joinTableInstances.push(restaurants);
        if (activities) joinTableInstances.push(activities);

        return joinTableInstances;
      })

    })
    .then(results => {
      res.json(results[0][0].itineraryId);
    })
    .catch(next);
});

module.exports = router;
