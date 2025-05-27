
import { Statistiques, Ticket } from '../types';
import { ticketService } from './ticketService';

class StatistiquesService {
  calculer(periode: string = 'jour'): Statistiques {
    const tickets = ticketService.getAllTickets();
    const maintenant = new Date();
    
    let ticketsPeriode: Ticket[] = [];
    
    switch (periode) {
      case 'jour':
        ticketsPeriode = tickets.filter(t => {
          const diff = maintenant.getTime() - t.dateCreation.getTime();
          return diff < 24 * 60 * 60 * 1000; // 24 heures
        });
        break;
      case 'semaine':
        ticketsPeriode = tickets.filter(t => {
          const diff = maintenant.getTime() - t.dateCreation.getTime();
          return diff < 7 * 24 * 60 * 60 * 1000; // 7 jours
        });
        break;
      default:
        ticketsPeriode = tickets;
    }

    const tempsAttenteMoyen = this.calculerTempsAttenteMoyen(ticketsPeriode);

    return {
      nbTickets: ticketsPeriode.length,
      tempsAttente: tempsAttenteMoyen,
      periode
    };
  }

  private calculerTempsAttenteMoyen(tickets: Ticket[]): number {
    if (tickets.length === 0) return 0;
    
    const ticketsTraites = tickets.filter(t => t.statut === 'TERMINE');
    if (ticketsTraites.length === 0) return 0;

    // Simulation du temps d'attente (en minutes)
    const tempsTotal = ticketsTraites.reduce((total, ticket) => {
      // Simuler un temps d'attente basé sur l'heure de création
      const tempsAttente = Math.random() * 30 + 5; // Entre 5 et 35 minutes
      return total + tempsAttente;
    }, 0);

    return Math.round(tempsTotal / ticketsTraites.length);
  }
}

export const statistiquesService = new StatistiquesService();
