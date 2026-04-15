import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import axios from "axios";
import "../styles/auth.css";
const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const BASE_URL = "https://workasana-backend-khaki.vercel.app/auth/login";
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  //used spread operator concept
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
      console.log("Full response", res.data);

      //
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      console.log("If it is working:", localStorage.getItem("user"));

      setMessage("Login successful. Redirecting to Dashboard");
      setIsError(false);

      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
      setIsError(true);
      console.log("Login Error", error);
    }
  };
  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-box">
        <h2>Workasana Login</h2>
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
        <button type="submit">Login</button>
        <p>
          Don’t have an account? <Link to="/signup">Signup</Link>
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

export default Login;
