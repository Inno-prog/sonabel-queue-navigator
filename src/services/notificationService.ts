
import { Notification } from '../types';

class NotificationService {
  private notifications: Notification[] = [];

  envoyerNotification(message: string, destinataire: string, type: string = 'info'): void {
    const notification: Notification = {
      message,
      destinataire,
      type
    };
    
    this.notifications.push(notification);
    console.log(`Notification envoyée à ${destinataire}: ${message}`);
    
    // Simuler l'envoi de notification (toast, email, etc.)
    this.afficherNotification(notification);
  }

  private afficherNotification(notification: Notification): void {
    // Ici on pourrait intégrer avec un système de toast ou push notifications
    if (typeof window !== 'undefined') {
      // Affichage simple pour la démo
      setTimeout(() => {
        alert(`${notification.type.toUpperCase()}: ${notification.message}`);
      }, 100);
    }
  }

  getNotifications(destinataire?: string): Notification[] {
    if (destinataire) {
      return this.notifications.filter(n => n.destinataire === destinataire);
    }
    return this.notifications;
  }
}

export const notificationService = new NotificationService();
