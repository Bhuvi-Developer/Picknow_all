import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../APi/api";
import "../Login/login.css";
import Snackbar from '../common/Snackbar/Snackbar';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    contact: "",
    otp: "",
    newPassword: "",
  });
  const [message, setMessage] = useState("");
  const [activeForm, setActiveForm] = useState("login");
  const [resetStep, setResetStep] = useState(1);
  const [activationToken, setActivationToken] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }

    // Check for activation token when component mounts
    const storedToken = localStorage.getItem("activationToken");
    if (storedToken) {
      setActivationToken(storedToken);
      setActiveForm("verify-otp");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage("");
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showSnackbar = (message, type) => {
    setSnackbar({
      open: true,
      message,
      type
    });
  };

  // Registration Handler
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const { name, email, password, contact } = formData;
      if (!name || !email || !password || !contact) {
        setMessage("All fields are required");
        return;
      }

      const response = await axios.post("/user/register", {
        name,
        email,
        password,
        contact,
      });

      setMessage(response.data.message);
      localStorage.setItem("activationToken", response.data.activationToken);
      localStorage.setItem("userEmail", email);
      setActivationToken(response.data.activationToken);
      setActiveForm("verify-otp");
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    }
  };

  // Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/user/login", {
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setMessage(response.data.message);
      
      // Call onLogin to update the parent component's state
      if (onLogin) {
        onLogin(true);
      }
      navigate("/");
      showSnackbar('Login successful!', 'success');
      // setTimeout(() => {
      //   navigate("/");
      // }, 1000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      setMessage(errorMessage);
      showSnackbar(errorMessage, 'error');

      if (errorMessage === "Please verify your account first") {
        const email = formData.email;
        localStorage.setItem("userEmail", email);
        setActiveForm("verify-otp");
      }
    }
  };

  // OTP Verification Handler
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      if (!formData.otp || formData.otp.length !== 6 || isNaN(formData.otp)) {
        setMessage("Please enter a valid 6-digit OTP");
        return;
      }

      const token = localStorage.getItem("activationToken");
      if (!token) {
        setMessage("Verification token not found. Please register again.");
        setTimeout(() => setActiveForm("register"), 2000);
        return;
      }

      const response = await axios.post(
        "/user/verify",
        { otp: formData.otp },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data.message);
      localStorage.removeItem("activationToken");
      localStorage.removeItem("userEmail");

      setTimeout(() => {
        setActiveForm("login");
        setFormData({
          ...formData,
          otp: "",
        });
      }, 2000);
    } catch (error) {
      if (error.response?.status === 401) {
        setMessage("OTP has expired. Please request a new one.");
      } else {
        setMessage(error.response?.data?.message || "Verification failed");
      }
    }
  };

  // Resend OTP Handler
  const handleResendOTP = async () => {
    try {
      const email = localStorage.getItem("userEmail");
      if (!email) {
        setMessage("Email not found. Please register again.");
        setTimeout(() => setActiveForm("register"), 2000);
        return;
      }

      const response = await axios.post("/user/resend-otp", { email });
      localStorage.setItem("activationToken", response.data.activationToken);
      setActivationToken(response.data.activationToken);
      setMessage("New OTP sent successfully! Please check your email.");
      setFormData({ ...formData, otp: "" });
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to resend OTP");
    }
  };

  // Request Password Reset Handler
  const handleRequestReset = async (e) => {
    e.preventDefault();
    try {
      if (!formData.email) {
        setMessage("Please enter your email address");
        return;
      }

      const response = await axios.post("/user/forgot-password", {
        email: formData.email,
      });

      setMessage(response.data.message);
      setResetStep(2);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to request password reset");
    }
  };

  // Reset Password Handler
  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      if (!formData.email || !formData.otp || !formData.newPassword) {
        setMessage("Please fill in all fields");
        return;
      }

      if (formData.otp.length !== 6 || isNaN(formData.otp)) {
        setMessage("Please enter a valid 6-digit reset code");
        return;
      }

      const response = await axios.post("/user/reset-password", {
        email: formData.email,
        resetToken: formData.otp,
        newPassword: formData.newPassword,
      });

      setMessage(response.data.message);
      setTimeout(() => {
        setActiveForm("login");
        setResetStep(1);
        setFormData({
          name: "",
          email: "",
          password: "",
          contact: "",
          otp: "",
          newPassword: "",
        });
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to reset password");
    }
  };

  const renderRegisterForm = () => (
    <form onSubmit={handleRegister} className="form-container register">
      <h2>Register</h2>
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="contact"
        placeholder="Contact Number"
        value={formData.contact}
        onChange={handleChange}
        required
      />
      <button type="submit">Register</button>
      <div className="auth-links">
        <button type="button" onClick={() => setActiveForm("login")}>
          Already have an account? Login
        </button>
      </div>
    </form>
  );

  const renderVerifyOTPForm = () => (
    <form onSubmit={handleVerifyOTP} className="form-container verify-otp">
      <h2>Verify Your Account</h2>
      <p className="instructions">
        Please enter the 6-digit OTP sent to your email address.
      </p>
      <div className="otp-input-container">
        <input
          type="text"
          name="otp"
          placeholder="Enter 6-digit OTP"
          value={formData.otp}
          onChange={handleChange}
          maxLength={6}
          pattern="[0-9]*"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
        />
      </div>
      <button type="submit">Verify OTP</button>
      <div className="resend-container">
        <p>Didn't receive the OTP?</p>
        <button type="button" onClick={handleResendOTP} className="resend-btn">
          Resend OTP
        </button>
      </div>
    </form>
  );

  const renderForgotPasswordForm = () => {
    if (resetStep === 1) {
      return (
        <form onSubmit={handleRequestReset} className="form-container forgot-password">
          <h2>Forgot Password</h2>
          <p className="instructions">Enter your email to receive a reset code</p>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <button type="submit">Request Reset Code</button>
          <div className="auth-links">
            <button type="button" onClick={() => setActiveForm("login")}>
              Back to Login
            </button>
          </div>
        </form>
      );
    }

    return (
      <form onSubmit={handleResetPassword} className="form-container forgot-password">
        <h2>Reset Password</h2>
        <p className="instructions">Enter the reset code sent to your email</p>
        <input
          type="text"
          name="otp"
          placeholder="6-digit Reset Code"
          value={formData.otp}
          onChange={handleChange}
          maxLength={6}
          pattern="[0-9]*"
          required
        />
        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          value={formData.newPassword}
          onChange={handleChange}
          required
        />
        <button type="submit">Reset Password</button>
        <div className="auth-links">
          <button
            type="button"
            onClick={() => {
              setResetStep(1);
              setFormData({ ...formData, otp: "", newPassword: "" });
            }}
          >
            Request New Code
          </button>
          <button type="button" onClick={() => setActiveForm("login")}>
            Back to Login
          </button>
        </div>
      </form>
    );
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="form-container login">
      <h2>Login</h2>
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <button type="submit">Login</button>
      <div className="auth-links">
        <button type="button" onClick={() => setActiveForm("forgot-password")}>
          Forgot Password?
        </button>
        <button type="button" onClick={() => setActiveForm("register")}>
          New user? Register here
        </button>
      </div>
    </form>
  );

  return (
    <div className="auth-container">
      {activeForm === "login" && renderLoginForm()}
      {activeForm === "register" && renderRegisterForm()}
      {activeForm === "verify-otp" && renderVerifyOTPForm()}
      {activeForm === "forgot-password" && renderForgotPasswordForm()}
      {message && (
        <div
          className={`message ${
            message.includes("success") || message.includes("sent")
              ? "success"
              : "error"
          }`}
        >
          {message}
        </div>
      )}
      <Snackbar
        message={snackbar.message}
        type={snackbar.type}
        isOpen={snackbar.open}
        onClose={handleSnackbarClose}
      />
    </div>
  );
};

export default Login;
