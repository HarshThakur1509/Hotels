import { useState, useEffect } from "react";
import axios from "axios";
import HotelCard from "../components/HotelCard";

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    location: "",
    minPrice: "",
    maxPrice: "",
  });

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3000/api/hotels");
        setHotels(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching hotels:", err);
        setError("Failed to load hotels. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const applyFilters = () => {
    if (!hotels) return [];

    return hotels.filter((hotel) => {
      // Filter by location
      if (
        filters.location &&
        !hotel.location.toLowerCase().includes(filters.location.toLowerCase())
      ) {
        return false;
      }

      // Filter by min price
      if (filters.minPrice && hotel.price < parseInt(filters.minPrice)) {
        return false;
      }

      // Filter by max price
      if (filters.maxPrice && hotel.price > parseInt(filters.maxPrice)) {
        return false;
      }

      return true;
    });
  };

  const filteredHotels = applyFilters();

  return (
    <div className="hotels-container">
      <h1>Available Hotels</h1>

      <div className="filters-container">
        <h3>Filter Hotels</h3>
        <div className="filters-form">
          <div className="filter-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Filter by city"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="minPrice">Min Price ($)</label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              placeholder="Min price"
              min="0"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="maxPrice">Max Price ($)</label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              placeholder="Max price"
              min="0"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading hotels...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : filteredHotels.length === 0 ? (
        <div className="no-hotels-message">
          <p>No hotels match your filters. Try adjusting your criteria.</p>
          <button
            onClick={() =>
              setFilters({ location: "", minPrice: "", maxPrice: "" })
            }
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="hotels-grid">
          {filteredHotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Hotels;
