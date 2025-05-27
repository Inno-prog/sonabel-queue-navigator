
export interface Client {
  id: string;
  nom: string;
  email: string;
}

export interface Agent {
  id: string;
  nom: string;
  poste: string;
}

export interface Admin {
  id: string;
  privileges: string[];
}

export interface Ticket {
  numero: string;
  dateCreation: Date;
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
  clientId: string;
}

export interface FileAttente {
  tickets: Ticket[];
  statut: boolean;
}

export interface Statistiques {
  nbTickets: number;
  tempsAttente: number;
  periode: string;
}

export interface Notification {
  message: string;
  destinataire: string;
  type: string;
}

export interface SystemeGeolocalisation {
  servicesActifs: string[];
  localisations: Map<string, any>;
}

export interface Horloge {
  heureActuelle: Date;
}

export type UserRole = 'client' | 'agent' | 'admin';

export interface User {
  id: string;
  nom: string;
  email: string;
  role: UserRole;
}
