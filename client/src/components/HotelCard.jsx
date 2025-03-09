import { Link } from "react-router-dom";

const HotelCard = ({ hotel }) => {
  return (
    <div className="hotel-card">
      <img src={`/images/${hotel.image}`} alt={hotel.name} />
      <h3>{hotel.name}</h3>
      <p>{hotel.location}</p>

      <Link to={`/book/${hotel.id}`} className="book-button">
        Book Now (${hotel.price}/night)
      </Link>
    </div>
  );
};

export default HotelCard;
