import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const CheckIn = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [guests, setGuests] = useState([{ name: "", aadhaar: "" }]);

  useEffect(() => {
    // Validate state data exists
    if (!state || !state.bookingId || !state.guests) {
      setError("Missing booking information. Please start a new booking.");
      return;
    }

    // Initialize guests array based on guest count from booking
    if (state.guests > 1 && guests.length === 1) {
      setGuests(
        Array(state.guests)
          .fill()
          .map(() => ({ name: "", aadhaar: "" }))
      );
    }
  }, [state, guests.length]);

  const handleGuestChange = (index, field, value) => {
    const updatedGuests = [...guests];
    updatedGuests[index][field] = value;
    setGuests(updatedGuests);
  };

  // const validateAadhaar = (aadhaar) => {
  //   // Validate 12-digit Aadhaar number
  //   return /^\d{12}$/.test(aadhaar);
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Format guest data for API
      const guestData = guests.map((g) => ({
        name: g.name.trim(),
        aadhaar: g.aadhaar,
      }));

      // Send to API
      const response = await fetch("http://localhost:3000/api/guests", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: state.bookingId,
          guests: guestData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Check-in failed");
      }

      // Navigate to confirmation
      navigate("/confirmation", {
        state: {
          type: "checkin",
          bookingId: state.bookingId,
          hotel: state.hotel,
          guests: guests.length,
          checkIn: state.checkIn,
          checkOut: state.checkOut,
          totalCost: state.totalCost,
        },
      });
    } catch (err) {
      setError(err.message || "Failed to complete check-in");
    } finally {
      setLoading(false);
    }
  };

  if (error && !state) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate("/")}>Return to Home</button>
      </div>
    );
  }

  return (
    <div className="checkin-container">
      <h2>Web Check-In for {state?.hotel}</h2>
      <div className="booking-summary">
        <p>
          <strong>Check-in Date:</strong>{" "}
          {state?.checkIn
            ? new Date(state.checkIn).toLocaleDateString()
            : "N/A"}
        </p>
        <p>
          <strong>Check-out Date:</strong>{" "}
          {state?.checkOut
            ? new Date(state.checkOut).toLocaleDateString()
            : "N/A"}
        </p>
        <p>
          <strong>Total Cost:</strong> ${state?.totalCost || "N/A"}
        </p>
      </div>
      <p>Please provide details for {state?.guests} guest(s)</p>

      <form onSubmit={handleSubmit}>
        {guests.map((guest, index) => (
          <div key={index} className="guest-form">
            <h3>Guest {index + 1}</h3>
            <div className="form-group">
              <label htmlFor={`name-${index}`}>Full Name</label>
              <input
                id={`name-${index}`}
                type="text"
                required
                value={guest.name}
                onChange={(e) =>
                  handleGuestChange(index, "name", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor={`aadhaar-${index}`}>Aadhaar Number</label>
              <input
                id={`aadhaar-${index}`}
                type="text"
                required
                pattern="\d{12}"
                title="12-digit Aadhaar number"
                value={guest.aadhaar}
                onChange={(e) =>
                  handleGuestChange(index, "aadhaar", e.target.value)
                }
              />
              <small>Enter 12-digit Aadhaar number without spaces</small>
            </div>
          </div>
        ))}

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Complete Check-In"}
        </button>
      </form>
    </div>
  );
};

export default CheckIn;
