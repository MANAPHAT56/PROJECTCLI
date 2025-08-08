const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const router = express.Router();
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
router.post('/google', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;
       console.log("subId: "+googleId);
    // สร้าง JWT ของเรา
    const ourToken = jwt.sign({ googleId, email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ accessToken: ourToken, user: { name, email } });
  } catch (err) {
    res.status(401).json({ error: 'Google token invalid' });
  }
});

module.exports = router;
