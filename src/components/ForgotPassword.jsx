import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyOtpFunction } from "../api/VerifyOtp";
import { verifyEmailFunction } from "../api/VerifyEmail";

import background from "../assets/images/background.png";
// import logo from "../assets/images/nagpur-metro-logo.png";
// import puneMetro from "../assets/images/PuneMetro.png";
// import thaneMetro from "../assets/images/ThaneMetro.png";
import userIcon from "../assets/images/username.png";
import passwordIcon from "../assets/images/password.png";
import closeEye from "../assets/images/closeEye.png";
import openEye from "../assets/images/openEye.png";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = email, 2 = otp, 3 = password
  const [Email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const payload = { Email: Email.trim() }; // Only email
    const res = await verifyEmailFunction(payload); // Uses /ForgetPassword

    if (
      !res ||
      !res.message ||
      res.message.toLowerCase().includes("otp") === false
    ) {
      setErrorMessage(res.message || "Could not send OTP");
      return;
    }

    console.log("OTP API response:", res);
    setStep(2);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const payload = {
      Email: Email.trim(),
      OTP: otp.trim(),
      Password: "",
    };

    const res = await verifyOtpFunction(payload);

    if (!res.success) {
      setErrorMessage(res.message || "Invalid OTP");
      return;
    }

    setStep(3);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const payload = {
      Email: Email.trim(),
      OTP: otp.trim(),
      Password: password.trim(),
    };

    const res = await verifyOtpFunction(payload);

    if (!res.success) {
      setErrorMessage(res.message || "Failed to reset password");
      return;
    }

    alert("Password reset successfully!");
    navigate("/login");
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
        

        <h4
          style={{
            textAlign: "center",
            color: "#933700",
            marginBottom: "20px",
          }}
        >
          Forgot Password
        </h4>

        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <div style={{ marginBottom: "20px", position: "relative" }}>
             <span>Email:</span>
              <input
                type="email"
                value={Email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: "100%", paddingLeft: "40px", height:"50px"}}
              />
            </div>
            <button type="submit" className="submit-button">
              Send OTP
            </button>
          </form>
        )}

        {/* Step 2 & 3: OTP and Password */}
        {(step === 2 || step === 3) && (
          <form onSubmit={step === 2 ? handleOtpSubmit : handlePasswordReset}>
            {/* OTP Field */}
            <div style={{ marginBottom: "20px", position: "relative" }}>
              <span>Enter OTP</span>
              <input
                type="number"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                style={{ width: "100%", paddingLeft: "40px" , height:"50px" }}
              />
            </div>

            {/* Password Field (only in step 3) */}
            {step === 3 && (
              <div style={{ position: "relative", marginBottom: "20px" }}>
                <span>Enter Password</span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    paddingLeft: "40px",
                    paddingRight: "40px",
                    height:"50px"
                  }}
                />
                <img
                  src={showPassword ? openEye : closeEye}
                  alt="toggle visibility"
                  onClick={togglePasswordVisibility}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "70%",
                    transform: "translateY(-50%)",
                    height: "20px",
                    cursor: "pointer",
                  }}
                />
              </div>
            )}

            <button type="submit" className="submit-button">
              {step === 2 ? "Verify OTP" : "Reset Password"}
            </button>
          </form>
        )}

        {/* Error Message */}
        {errorMessage && (
          <p style={{ color: "red", textAlign: "center", marginTop: "10px" }}>
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
