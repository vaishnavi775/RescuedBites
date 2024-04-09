const Notification = require('../models/notification');

class NotificationService {
    static async sendNotification(senderId, recipientId, message) {
        try {
            const notification = new Notification({
                sender: senderId,
                recipient: recipientId,
                message: message,
                timestamp: Date.now(), 
                status: 'unread' 
            });
            await notification.save();
            return notification;
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    }
    static async getUnreadNotificationCount(userId) {
        try {
            const unreadCount = await Notification.countDocuments({ recipient: userId, status: 'unread' });
            return unreadCount;
        } catch (error) {
            console.error('Error getting unread notification count:', error);
            throw error;
        }
    }
}


module.exports = NotificationService;
