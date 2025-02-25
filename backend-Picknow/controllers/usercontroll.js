import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail from "../middelware/sendmail.js";

// New User Registration
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, contact } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User email already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000);

        // Create new user
        user = new User({ 
            name, 
            email, 
            password: hashedPassword, 
            contact,
            isVerified: false 
        });
        await user.save();

        // Generate activation token
        const activationToken = jwt.sign({ userId: user._id, otp }, process.env.ACTIVATION_SECRET, { expiresIn: "30s" });

        // Send OTP email
        const message = `Please verify your account using this OTP: ${otp}`;
        await sendMail(email, "Welcome to PICKNOW", message);

        return res.status(200).json({
            message: "OTP sent to your email",
            activationToken,
        });
    } catch (error) {
        console.error("Error during user registration:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Verify OTP
export const verifyUser = async (req, res) => {
    try {
        const { otp } = req.body;
        
        if (!req.headers.authorization) {
            return res.status(401).json({ message: "Authorization token is missing" });
        }
        
        const activationToken = req.headers.authorization.split(" ")[1];
        
        if (!activationToken) {
            return res.status(401).json({ message: "Invalid authorization token format" });
        }

        // Verify the activation token
        let decoded;
        try {
            decoded = jwt.verify(activationToken, process.env.ACTIVATION_SECRET);
        } catch (err) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Check OTP
        if (parseInt(decoded.otp, 10) !== parseInt(otp, 10)) {
            return res.status(400).json({ message: "Incorrect OTP" });
        }

        // Find and verify the user
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isVerified = true;
        await user.save();

        return res.status(200).json({ message: "User verification successful" });
    } catch (error) {
        console.error("Error during OTP verification:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Login User
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login attempt for email:", email);

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found");
            return res.status(400).json({ message: "Invalid credentials" });
        }

        console.log("User verification status:", user.isVerified);

        // Check if user is verified
        if (!user.isVerified) {
            console.log("User not verified");
            return res.status(400).json({ message: "Please verify your account first" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Invalid password");
            return res.status(400).json({ message: "Invalid credentials" });
        }

        console.log("Login successful");

        // Generate token
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "15d" });

        // Exclude password from response
        const { password: _, ...userDetails } = user.toObject();

        return res.status(200).json({
            message: `Welcome ${user.name}`,
            token,
            user: userDetails,
        });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// User Profile
export const myProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Change Password
export const changePassword = async (req, res) => {
    try {
        const { password } = req.body;

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });

        return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Update User
export const updateUser = async (req, res) => {
    try {
        const { name, email, contact } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { name, email, contact },
            { new: true }
        ).select("-password");

        return res.status(200).json({
            message: "User details updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error updating user details:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Resend OTP
export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if user is already verified
        if (user.isVerified) {
            return res.status(400).json({ message: "User is already verified" });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        const activationToken = jwt.sign({ userId: user._id, otp }, process.env.ACTIVATION_SECRET, { expiresIn: "5m" });

        // Send email
        const message = `Your new verification OTP is: ${otp}\nThis OTP will expire in 5 minutes.`;
        await sendMail(email, "Account Verification - PICKNOW", message);

        return res.status(200).json({
            message: "New OTP sent to your email",
            activationToken,
        });
    } catch (error) {
        console.error("Error during OTP resend:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate reset token
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        const resetTokenExpiry = new Date(Date.now() + 30 * 60000); // 30 minutes

        // Save reset token and expiry to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        // Send reset token email
        const message = `Your password reset code is: ${resetToken}\nThis code will expire in 30 minutes.`;
        await sendMail(email, "Password Reset Request - PICKNOW", message);

        return res.status(200).json({
            message: "Password reset instructions sent to your email"
        });
    } catch (error) {
        console.error("Error in forgot password:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Reset Password
export const resetPassword = async (req, res) => {
    try {
        const { email, resetToken, newPassword } = req.body;

        // Find user by email and valid reset token
        const user = await User.findOne({
            email,
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ 
                message: "Invalid or expired reset token" 
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token fields
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        return res.status(200).json({ 
            message: "Password reset successful" 
        });
    } catch (error) {
        console.error("Error in reset password:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
