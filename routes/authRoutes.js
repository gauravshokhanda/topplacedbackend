const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const UserLinked = require("../models/UserLinked"); // Import UserLinked Model
require("dotenv").config();

const router = express.Router();

// ✅ Normal Authentication (Existing)
router.post("/register", registerUser);
router.post("/login", loginUser);

// ✅ LinkedIn Authentication (New)
const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;


router.get("/linkedin", (req, res) => {
  const linkedInAuthURL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=r_liteprofile%20r_emailaddress`;
  res.redirect(linkedInAuthURL);
});



router.get("/linkedin/callback", async (req, res) => {
    const { code } = req.query;
  
    try {
      const tokenResponse = await axios.post("https://www.linkedin.com/oauth/v2/accessToken", null, {
        params: {
          grant_type: "authorization_code",
          code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
  
      const accessToken = tokenResponse.data.access_token;
  
      const profileResponse = await axios.get("https://api.linkedin.com/v2/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
  
      const emailResponse = await axios.get(
        "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
  
      const email = emailResponse.data.elements[0]["handle~"].emailAddress;
      let user = await User.findOne({ email });
  
      if (!user) {
        user = new User({
          linkedinId: profileResponse.data.id,
          name: profileResponse.data.localizedFirstName,
          email,
        });
        await user.save();
      }
  
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  
      // ✅ Redirect back to frontend with token and user data
      res.redirect(`http://localhost:3000/linkedin/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
    } catch (error) {
      res.status(500).json({ message: "Authentication failed." });
    }
  });

module.exports = router;
