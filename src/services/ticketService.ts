
import { Ticket, Client } from '../types';

class TicketService {
  private tickets: Ticket[] = [];
  private ticketCounter = 1;

  genererNumero(): string {
    const numero = `T${this.ticketCounter.toString().padStart(4, '0')}`;
    this.ticketCounter++;
    return numero;
  }

  reserverTicket(client: Client): Ticket {
    const ticket: Ticket = {
      numero: this.genererNumero(),
      dateCreation: new Date(),
      statut: 'EN_ATTENTE',
      clientId: client.id
    };
    
    this.tickets.push(ticket);
    console.log(`Ticket ${ticket.numero} réservé pour ${client.nom}`);
    return ticket;
  }

  consulterFileAttente(): Ticket[] {
    return this.tickets.filter(t => t.statut === 'EN_ATTENTE');
  }

  appelNumeroTicket(numero: string): boolean {
    const ticket = this.tickets.find(t => t.numero === numero);
    if (ticket && ticket.statut === 'EN_ATTENTE') {
      ticket.statut = 'EN_COURS';
      return true;
    }
    return false;
  }

  getTicketsByClient(clientId: string): Ticket[] {
    return this.tickets.filter(t => t.clientId === clientId);
  }

  getAllTickets(): Ticket[] {
    return this.tickets;
  }
}

export const ticketService = new TicketService();
