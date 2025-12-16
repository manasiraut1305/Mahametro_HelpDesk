import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";
import { loginFunction } from "../api/Login";

import background from "../assets/images/background.png"; 
import logo from "../assets/images/nagpur-metro-logo.png";
import puneMetro from "../assets/images/PuneMetro.png";
import thaneMetro from "../assets/images/ThaneMetro.png";
import userIcon from "../assets/images/username.png";
import Password from "../assets/images/password.png";
import closeEye from "../assets/images/closeEye.png";
import openEye from "../assets/images/openEye.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");

    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    try {
      const data = await loginFunction(email.trim(), password.trim());

      if (!data || !data.success) {
        setErrorMessage(data?.message || "Login failed.");
        return;
      }

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email.trim());
        localStorage.setItem("rememberedPassword", password.trim());
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }

      const userData = {
        name: data.Name,
        password: data.Password,
        role: data.Role,
        id: data.id,
        email: data.Email,
        mobile: data.Mobile,
        designation: data.Designation,
        department: data.Department,
        location: data.Loaction,
        message: data.message,
      };

      login(userData);

      switch (data.Role) {
        case "Admin":
          navigate("/components/admin/AdminDashboard");
          break;
        case "Helpdesk Eng":
          navigate("/components/operator/OperatorDashboard");
          break;
        case "Engineer":
          navigate("/components/engineer/EngineerDashboard");
          break;
        default:
          navigate("/components/user/UserCheckStatus");
      }
    } catch (err) {
      setErrorMessage("An error occurred during login.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.96)",
          padding: "40px",
          borderRadius: "24px",
          maxWidth: "500px",
          width: "100%",
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <img
            src={logo}
            alt="Nagpur Metro Logo"
            style={{ height: "140px", paddingBottom: "20px", paddingTop: "30px" }}
          />
          <img
            src={puneMetro}
            alt="Pune Metro Logo"
            style={{ height: "140px", paddingBottom: "20px", paddingTop: "30px", paddingLeft: "40px" }}
          />
          <img
            src={thaneMetro}
            alt="Thane Metro Logo"
            style={{ height: "150px", paddingBottom: "20px", paddingTop: "30px", paddingLeft: "25px" }}
          />
        </div>

        <div style={{ textAlign: "center", marginBottom: "30px", paddingTop: "20px" }}>
          <h2
            style={{
              marginTop: "10px",
              color: "#933700",
              fontWeight: 600,
              fontSize: "30px",
            }}
          >
            IT Help Desk
          </h2>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "20px", position: "relative", paddingTop: "20px" }}>
            <div className="input-container" style={{ position: "relative" }}>
              <img src={userIcon} alt="user icon" className="input-icon" />
              <input
                type="text"
                placeholder="Username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Username"
                style={{ width: "100%", paddingLeft: "40px" }}
              />
            </div>

            <div className="input-container" style={{ position: "relative" }}>
              <img src={Password} alt="lock icon" className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-label="Password"
                style={{ width: "100%", paddingLeft: "40px", paddingRight: "40px" }}
              />
              <img
                src={showPassword ? openEye : closeEye}
                alt={showPassword ? "Hide password" : "Show password"}
                className="visibility-icon"
                onClick={togglePasswordVisibility}
                role="button"
                tabIndex="0"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    togglePasswordVisibility();
                  }
                }}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  height: "20px",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "14px",
              marginBottom: "20px",
            }}
          >
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ marginRight: "5px" }}
              />
              Remember me
            </label>
            <span
              style={{ color: "#ff7a00", cursor: "pointer", paddingTop: "20px" }}
              onClick={() => navigate("ForgotPassword")}
            >
              Forgot password?
            </span>
          </div>

          {errorMessage && (
            <p style={{ color: "red", textAlign: "center" }}>{errorMessage}</p>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              background: "linear-gradient(to right, #ff7a00, #f7941d)",
              border: "none",
              borderRadius: "10px",
              padding: "12px",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
