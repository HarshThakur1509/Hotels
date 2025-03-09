import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import Hotels from "./pages/Hotels";
import Booking from "./pages/Booking";
import CheckIn from "./pages/CheckIn";
import Confirmation from "./pages/Confirmation";
import Header from "./components/Header";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Hotels />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/book/:hotelId" element={<Booking />} />
        <Route path="/checkin" element={<CheckIn />} />
        <Route path="/confirmation" element={<Confirmation />} />
      </Routes>
    </Router>
  );
}

export default App;
