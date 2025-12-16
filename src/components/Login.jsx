import React, { useState, useContext, useEffect } from "react"; // Import useEffect
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { loginFunction } from "../api/Login";

// import background from "../assets/images/background.webp"; // Uncomment if you use this
import logo from "../assets/images/nagpur-metro-logo.png";
import puneMetro from "../assets/images/PuneMetro.png"; // Uncomment if you use this
import thaneMetro from "../assets/images/ThaneMetro.png"; // Uncomment if you use this
import userIcon from "../assets/images/user.png";
import Password from "../assets/images/password.png";
import closeEye from "../assets/images/closeEye.png";
import openEye from "../assets/images/openEye.png";
import logosection from "../assets/images/cloud_server_img.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Correctly initialize as boolean
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false); // Initialize rememberMe state

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Effect to load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");

    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true); // Set rememberMe to true if credentials were found
    }
  }, []); // Empty dependency array means this runs only once on mount

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setErrorMessage(""); // Clear any previous error messages

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    try {
      const data = await loginFunction(email.trim(), password.trim());

      // Check if login was successful based on the API response structure
      if (!data || !data.success) {
        setErrorMessage(data?.message || "Login failed. Please check your username and password.");
        return;
      }

      // Handle "Remember me" functionality
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email.trim());
        localStorage.setItem("rememberedPassword", password.trim());
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }

      // Prepare user data for AuthContext
      const userData = {
        name: data.Name,
        password: data.Password,
        role: data.Role,
        id: data.id,
        email: data.Email,
        mobile: data.Mobile,
        designation: data.Designation,
        department: data.Department,
        location: data.Loaction, // Note: "Loaction" appears to be a typo; consider changing to "Location" if it's consistently misspelled in your API.
        message: data.message,
        IsHeadofDepartment: data.IsHeadofDepartment,
      };

      login(userData); // Update the AuthContext with logged-in user data

      // Navigate based on the user's role
      switch (data.Role) {
        case "Admin":
          navigate("/AdminDashboardLayout");
          break;
        case "Helpdesk Eng":
          navigate("/OperatorDashboardLayout"); // Added leading slash for absolute path
          break;
        case "Engineer":
          navigate("/EngineerDashboardLayout"); 
          break;
        case "User":
          navigate("/UserDashboardLayout"); // Added leading slash for absolute path
      }
    } catch (err) {
      console.error("Login API error:", err); // Log the detailed error for debugging
      setErrorMessage("An unexpected error occurred during login. Please try again.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Segoe UI', sans-serif",
        background: "#4B8DBA"
      }}
    >
      <div className="container ">
        <div className="row d-flex p-3 bg-white w-100 w-md-100 w-lg-50 shadow align-items-center">

          <div className="col-12 col-md-6 order-2 order-md-1 text-center mb-3 mb-md-0">
            <img className="img-fluid"
              src={logosection}
              alt="Cloud Server Illustration" // Improved alt text
            />
          </div>
          {/* Login Form Section */}
          <div className="col-12 col-md-6 order-1 order-md-2">
            <form className="p-3 text-center" onSubmit={handleLogin}>
              {/* IT Help Desk Title */}
              <h2 className="pb-5 pt-md-3"
                style={{ marginTop: "10px", color: "#933700", fontWeight: 600, fontSize: "30px", textAlign: "center" }}
              >
                IT Help Desk
              </h2>

              {/* Email Input */}
              <div className="input-container" style={{ position: "relative", border: "1px solid #ddd" }}>
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

              {/* Password Input with Toggle */}
              <div className="input-container" style={{ position: "relative", border: "1px solid #ddd" }}>
                <img src={Password} alt="lock icon" className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-label="Password"
                  style={{
                    width: "100%",
                    paddingLeft: "40px",
                    paddingRight: "40px",
                  }}
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

              {/* Remember Me and Forgot Password */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "14px",
                  marginBottom: "20px",
                  marginTop: "10px", 
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
                  style={{ color: "#ff7a00", cursor: "pointer", paddingTop: "0px" }} // Removed excess padding-top
                  onClick={() => navigate("/ForgotPassword")} 
                >
                  Forgot password?
                </span>
              </div>

              {errorMessage && (
                <p style={{ color: "red", textAlign: "center" }}>{errorMessage}</p>
              )}

              {/* Sign In Button */}
              <button
                type="submit"
                style={{
                  width: "100%",
                  background: "linear-gradient(to right, #4682B4, #6bace1ff)",
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
      </div>
    </div>
  );
};

export default Login;