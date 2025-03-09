import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Confirmation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [confirmationDetails, setConfirmationDetails] = useState(null);

  useEffect(() => {
    // Validate state data exists
    if (!state || !state.hotel) {
      navigate("/", { replace: true });
      return;
    }

    // Generate a random confirmation code
    const generateConfirmationCode = () => {
      return Math.random().toString(36).substring(2, 10).toUpperCase();
    };

    setConfirmationDetails({
      ...state,
      confirmationCode: generateConfirmationCode(),
      timestamp: new Date().toLocaleString(),
    });
  }, [state, navigate]);

  if (!confirmationDetails) {
    return <div className="loading">Loading confirmation details...</div>;
  }

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <div className="confirmation-header">
          <h2>🎉 Success!</h2>
          <p className="confirmation-code">
            Confirmation Code:{" "}
            <strong>{confirmationDetails.confirmationCode}</strong>
          </p>
        </div>

        <div className="confirmation-details">
          {confirmationDetails.type === "booking" ? (
            <>
              <p>
                Your booking at <strong>{confirmationDetails.hotel}</strong> is
                confirmed!
              </p>
              <p>
                Booking ID: <strong>{confirmationDetails.bookingId}</strong>
              </p>
              <p>Please complete web check-in before your arrival.</p>
            </>
          ) : (
            <>
              <h3>Check-in Confirmed</h3>
              <p>
                Web check-in completed for{" "}
                <strong>{confirmationDetails.guests}</strong> guests at{" "}
                <strong>{confirmationDetails.hotel}</strong>
              </p>
              <div className="stay-details">
                <p>
                  <strong>Check-in:</strong>{" "}
                  {new Date(confirmationDetails.checkIn).toLocaleDateString()}
                </p>
                <p>
                  <strong>Check-out:</strong>{" "}
                  {new Date(confirmationDetails.checkOut).toLocaleDateString()}
                </p>
                <p>
                  <strong>Total Amount:</strong> $
                  {confirmationDetails.totalCost}
                </p>
              </div>
              <p className="success-message">Have a pleasant stay!</p>
            </>
          )}

          <p className="timestamp">
            Confirmed on: {confirmationDetails.timestamp}
          </p>
        </div>

        <div className="confirmation-actions">
          <button onClick={() => navigate("/")}>Return Home</button>
          <button onClick={() => window.print()}>Print Confirmation</button>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
