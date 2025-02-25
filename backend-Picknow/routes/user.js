import express from "express";
import {
    loginUser,
    myProfile,
    registerUser,
    verifyUser,
    updateUser,
    changePassword,
    resendOtp,
    forgotPassword,
    resetPassword,

} from "../controllers/usercontroll.js";

import { isAuth } from "../middelware/isAuth.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/user/register", registerUser);
router.post("/user/verify", verifyUser);
router.post("/user/login", loginUser);
router.post("/user/resend-otp", resendOtp);
router.post("/user/forgot-password", forgotPassword);
router.post("/user/reset-password", resetPassword);

// Protected routes (require authentication)
router.get("/user/profile", isAuth, myProfile);
router.put("/user/update", isAuth, updateUser);
router.put("/user/change-password", isAuth, changePassword);


export default router;
