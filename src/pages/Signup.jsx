import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "../styles/auth.css";
import axios from "axios";
const Signup = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const BASE_URL = "https://workasana-backend-khaki.vercel.app/auth/signup";
  const navigate = useNavigate();

  //used spread operator concept
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(form);
    try {
      const res = await axios.post(BASE_URL, form);
      console.log("Signup Success", res.data);

      setMessage("Signup successful. Redirecting to Login");
      setIsError(false);

      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Signup failed");
      setIsError(true);
      console.log("Signup Error", error);
    }
  };
  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-box">
        <h2>Workasana Signup</h2>
        <input
          type="text"
          name="name"
          placeholder="Enter Name"
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Enter email"
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Enter password"
          onChange={handleChange}
        />
        <button type="submit">Signup</button>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
      <div className="message-box">
        {message && (
          <p className={isError ? "error-msg" : "success-msg"}>{message}</p>
        )}
      </div>
    </div>
  );
};

export default Signup;
