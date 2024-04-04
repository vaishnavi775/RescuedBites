const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
const serviceAccount = require("./path/to/serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Send notification route
router.post("/send-notification", (req, res) => {
  const { userIds, title, body } = req.body;

  // Retrieve device tokens for the specified user IDs from the database
  const deviceTokens = getUserDeviceTokens(userIds);

  // Construct the notification message
  const message = {
    tokens: deviceTokens,
    notification: {
      title: title,
      body: body
    }
  };

  // Send notification to the specified devices
  admin.messaging().sendMulticast(message)
    .then((response) => {
      console.log('Notification sent:', response);
      res.status(200).json({ success: true, message: "Notification sent successfully" });
    })
    .catch((error) => {
      console.error('Error sending notification:', error);
      res.status(500).json({ success: false, message: "Failed to send notification" });
    });
});

// Function to retrieve device tokens for the specified user IDs from the database
function getUserDeviceTokens(userIds) {
  // Implement logic to fetch device tokens from the database based on user IDs
  // Return an array of device tokens
}

module.exports = router;
