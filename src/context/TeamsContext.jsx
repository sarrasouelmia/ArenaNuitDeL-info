import React, { createContext, useState, useContext, useEffect } from 'react';


const TeamsContext = createContext();

export const useTeams = () => {
  const context = useContext(TeamsContext);
  if (!context) {
    throw new Error('useTeams must be used within a TeamsProvider');
  }
  return context;
};

export const TeamsProvider = ({ children }) => {
  
  const [isLoading, setIsLoading] = useState(false);

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simuler un chargement
      setTimeout(() => {
        setTeams(mockData.teams);
        setEvents(mockData.events);
        setIsLoading(false);
      }, 500);
    };

    loadData();
  }, []);

  // Ajouter une équipe
  const addTeam = (teamData) => {
    const newTeam = {
      ...teamData,
      id: teams.length + 1,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    setTeams([...teams, newTeam]);
    
    // Ajouter un événement
    const newEvent = {
      id: events.length + 1,
      type: 'team',
      team: teamData.name,
      action: 'created',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: 'Admin',
      details: 'Nouvelle équipe créée'
    };
    setEvents([newEvent, ...events]);
    
    return newTeam;
  };

  // Mettre à jour une équipe
  const updateTeam = (id, updates) => {
    const updatedTeams = teams.map(team => 
      team.id === id ? { ...team, ...updates } : team
    );
    setTeams(updatedTeams);
    
    // Ajouter un événement
    const team = teams.find(t => t.id === id);
    if (team) {
      const newEvent = {
        id: events.length + 1,
        type: 'team',
        team: team.name,
        action: 'updated',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: 'Admin',
        details: 'Équipe mise à jour'
      };
      setEvents([newEvent, ...events]);
    }
  };

  // Supprimer une équipe
  const deleteTeam = (id) => {
    const teamToDelete = teams.find(t => t.id === id);
    const updatedTeams = teams.filter(team => team.id !== id);
    setTeams(updatedTeams);
    
    // Ajouter un événement
    if (teamToDelete) {
      const newEvent = {
        id: events.length + 1,
        type: 'team',
        team: teamToDelete.name,
        action: 'deleted',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: 'Admin',
        details: 'Équipe supprimée'
      };
      setEvents([newEvent, ...events]);
    }
  };

  // Ajouter des points
  const addPoints = (teamId, points, challenge = 'General', comment = '') => {
    const updatedTeams = teams.map(team => 
      team.id === teamId 
        ? { 
            ...team, 
            score: team.score + points,
            lastUpdate: new Date().toISOString()
          }
        : team
    );
    setTeams(updatedTeams);
    
    const team = teams.find(t => t.id === teamId);
    if (team) {
      const newEvent = {
        id: events.length + 1,
        type: 'score',
        team: team.name,
        points: points,
        challenge: challenge,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: 'Admin',
        details: comment || `+${points} points pour ${challenge}`
      };
      setEvents([newEvent, ...events]);
    }
  };

  // Obtenir une équipe par ID
  const getTeamById = (id) => {
    return teams.find(team => team.id === id);
  };

  // Obtenir les événements par équipe
  const getTeamEvents = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return [];
    return events.filter(event => event.team === team.name);
  };

  // Obtenir le classement
  const getRanking = () => {
    return [...teams].sort((a, b) => b.score - a.score);
  };

  // Statistiques globales
  const getStats = () => {
    const totalTeams = teams.length;
    const totalPoints = teams.reduce((sum, team) => sum + team.score, 0);
    const totalMembers = teams.reduce((sum, team) => sum + team.members.length, 0);
    const averageScore = Math.round(totalPoints / totalTeams);
    const activeTeams = teams.filter(t => t.status === 'active').length;

    return {
      totalTeams,
      totalPoints,
      totalMembers,
      averageScore,
      activeTeams,
      totalEvents: events.length
    };
  };

  const value = {
    teams,
    events,
    isLoading,
    addTeam,
    updateTeam,
    deleteTeam,
    addPoints,
    getTeamById,
    getTeamEvents,
    getRanking,
    getStats
  };

  return (
    <TeamsContext.Provider value={value}>
      {children}
    </TeamsContext.Provider>
  );
};