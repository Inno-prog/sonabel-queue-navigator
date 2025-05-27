
import React, { useState, useEffect } from 'react';
import { User, Ticket, Client } from '../types';
import { ticketService } from '../services/ticketService';
import { geolocalisationService } from '../services/geolocalisationService';
import { notificationService } from '../services/notificationService';
import { statistiquesService } from '../services/statistiquesService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export const TicketApp: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [fileAttente, setFileAttente] = useState<Ticket[]>([]);
  const [userForm, setUserForm] = useState({ nom: '', email: '', role: 'client' as const });
  const { toast } = useToast();

  useEffect(() => {
    // Actualiser la file d'attente périodiquement
    const interval = setInterval(() => {
      setFileAttente(ticketService.consulterFileAttente());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = () => {
    if (!userForm.nom || !userForm.email) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    const user: User = {
      id: `user_${Date.now()}`,
      nom: userForm.nom,
      email: userForm.email,
      role: userForm.role
    };

    setCurrentUser(user);
    toast({
      title: "Connexion réussie",
      description: `Bienvenue ${user.nom} (${user.role})`
    });
  };

  const handleReserverTicket = async () => {
    if (!currentUser) return;

    const client: Client = {
      id: currentUser.id,
      nom: currentUser.nom,
      email: currentUser.email
    };

    try {
      // Demander la géolocalisation
      await geolocalisationService.envoyerLocalisation(client.id);
      
      // Créer le ticket
      const ticket = ticketService.reserverTicket(client);
      setTickets(prev => [...prev, ticket]);
      setFileAttente(ticketService.consulterFileAttente());
      
      // Envoyer notification
      notificationService.envoyerNotification(
        `Votre ticket ${ticket.numero} a été créé. Position dans la file: ${fileAttente.length + 1}`,
        client.email,
        'success'
      );

      toast({
        title: "Ticket réservé",
        description: `Ticket ${ticket.numero} créé avec succès`
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'obtenir votre localisation",
        variant: "destructive"
      });
    }
  };

  const handleAppelerTicket = (numeroTicket: string) => {
    const success = ticketService.appelNumeroTicket(numeroTicket);
    if (success) {
      setFileAttente(ticketService.consulterFileAttente());
      notificationService.envoyerNotification(
        `Votre ticket ${numeroTicket} est maintenant appelé`,
        'client', 
        'info'
      );
      toast({
        title: "Ticket appelé",
        description: `Ticket ${numeroTicket} en cours de traitement`
      });
    }
  };

  const renderStats = () => {
    const stats = statistiquesService.calculer('jour');
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statistiques du jour</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nombre de tickets</p>
              <p className="text-2xl font-bold">{stats.nbTickets}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Temps d'attente moyen</p>
              <p className="text-2xl font-bold">{stats.tempsAttente} min</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Connexion au Système de Tickets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                value={userForm.nom}
                onChange={(e) => setUserForm(prev => ({ ...prev, nom: e.target.value }))}
                placeholder="Votre nom"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Votre email"
              />
            </div>
            <div>
              <Label htmlFor="role">Rôle</Label>
              <select
                id="role"
                value={userForm.role}
                onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value as any }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="client">Client</option>
                <option value="agent">Agent</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
            <Button onClick={handleLogin} className="w-full">
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Système de Gestion de Tickets</h1>
              <p className="text-gray-600">Connecté en tant que: {currentUser.nom} ({currentUser.role})</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setCurrentUser(null)}
            >
              Déconnexion
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interface Client */}
          {currentUser.role === 'client' && (
            <Card>
              <CardHeader>
                <CardTitle>Réserver un Ticket</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={handleReserverTicket} className="w-full">
                  Réserver un nouveau ticket
                </Button>
                
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Mes tickets</h3>
                  {tickets.filter(t => t.clientId === currentUser.id).map(ticket => (
                    <div key={ticket.numero} className="p-2 bg-gray-100 rounded mb-2">
                      <p className="font-medium">{ticket.numero}</p>
                      <p className="text-sm text-gray-600">Statut: {ticket.statut}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interface Agent */}
          {currentUser.role === 'agent' && (
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-2">File d'attente</h3>
                {fileAttente.map(ticket => (
                  <div key={ticket.numero} className="p-2 bg-blue-100 rounded mb-2 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{ticket.numero}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(ticket.dateCreation).toLocaleTimeString()}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleAppelerTicket(ticket.numero)}
                    >
                      Appeler
                    </Button>
                  </div>
                ))}
                {fileAttente.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Aucun ticket en attente</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* File d'attente globale */}
          <Card>
            <CardHeader>
              <CardTitle>File d'Attente Actuelle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {fileAttente.slice(0, 5).map((ticket, index) => (
                  <div key={ticket.numero} className="p-2 bg-yellow-100 rounded">
                    <p className="font-medium">#{index + 1} - {ticket.numero}</p>
                    <p className="text-sm text-gray-600">
                      Créé à {new Date(ticket.dateCreation).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
                {fileAttente.length === 0 && (
                  <p className="text-gray-500 text-center py-4">File d'attente vide</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Statistiques (pour Admin) */}
          {currentUser.role === 'admin' && renderStats()}
        </div>
      </div>
    </div>
  );
};
