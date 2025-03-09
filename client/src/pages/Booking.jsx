import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Booking = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dates, setDates] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
  });

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        setLoading(true);
        // Updated to use backend API
        const response = await axios.get(
          `http://localhost:3000/api/hotels/${hotelId}`
        );
        setHotel(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load hotel information. Please try again.");
        console.error("Error fetching hotel:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [hotelId]);

  const handleBooking = async (e) => {
    e.preventDefault();

    try {
      // Calculate total nights and cost
      const checkInDate = new Date(dates.checkIn);
      const checkOutDate = new Date(dates.checkOut);
      const totalNights = Math.ceil(
        (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
      );

      if (totalNights <= 0) {
        throw new Error("Check-out date must be after check-in date");
      }

      const totalCost = hotel.price * totalNights;

      // Create booking via API
      const response = await axios.post(
        "http://localhost:3000/api/bookings",
        {
          hotelId: parseInt(hotelId),
          checkIn: dates.checkIn,
          checkOut: dates.checkOut,
          guestCount: parseInt(dates.guests),
        },
        { withCredentials: true }
      );

      // Navigate to check-in page with booking data
      navigate("/checkin", {
        state: {
          bookingId: response.data.id,
          hotel: hotel.name,
          checkIn: dates.checkIn,
          checkOut: dates.checkOut,
          guests: parseInt(dates.guests),
          totalCost,
        },
      });
    } catch (err) {
      // Handle different error types
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to create booking";
      setError(errorMsg);
      console.error("Booking error:", err);
    }
  };

  if (loading)
    return <div className="loading">Loading hotel information...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!hotel) return <div className="error-message">Hotel not found</div>;

  return (
    <div className="booking-container">
      <h2>Book {hotel.name}</h2>
      <div className="hotel-info">
        <img src={`/images/${hotel.image || "default.jpg"}`} alt={hotel.name} />
        <div className="hotel-details">
          <p>
            <strong>Location:</strong> {hotel.location}
          </p>
          <p>
            <strong>Price per night:</strong> ${hotel.price}
          </p>
          {hotel.amenities && (
            <p>
              <strong>Amenities:</strong> {hotel.amenities.join(", ")}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleBooking}>
        <div className="form-group">
          <label htmlFor="checkIn">Check-in Date</label>
          <input
            id="checkIn"
            type="date"
            required
            min={new Date().toISOString().split("T")[0]}
            value={dates.checkIn}
            onChange={(e) => setDates({ ...dates, checkIn: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="checkOut">Check-out Date</label>
          <input
            id="checkOut"
            type="date"
            required
            min={dates.checkIn || new Date().toISOString().split("T")[0]}
            value={dates.checkOut}
            onChange={(e) => setDates({ ...dates, checkOut: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="guests">Number of Guests</label>
          <input
            id="guests"
            type="number"
            min="1"
            max="10"
            value={dates.guests}
            onChange={(e) =>
              setDates({ ...dates, guests: parseInt(e.target.value) || 1 })
            }
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Confirm Booking"}
        </button>
      </form>
    </div>
  );
};

export default Booking;
