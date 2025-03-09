import { Link } from "react-router-dom";
import axios from "axios";

const Header = () => {
  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:3000/users/logout",
        {},
        {
          withCredentials: true,
        }
      );
      localStorage.removeItem("user");
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <header className="header">
      <nav>
        <Link to="/">Hotels</Link>
        <Link to="/register">Register</Link>
        <Link to="/login">Login</Link>
        <button onClick={logout}>Logout</button>
      </nav>
    </header>
  );
};

export default Header;
