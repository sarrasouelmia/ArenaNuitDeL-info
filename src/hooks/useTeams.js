import { useTeams } from '../context/TeamsContext';

// Hook personnalisé pour accéder aux données des équipes
export const useTeamData = () => {
  const teamsContext = useTeams();
  
  const getTopTeams = (limit = 3) => {
    return teamsContext.getRanking().slice(0, limit);
  };
  
  const getTeamRank = (teamId) => {
    const ranking = teamsContext.getRanking();
    return ranking.findIndex(team => team.id === teamId) + 1;
  };
  
  const getRecentEvents = (limit = 5) => {
    return teamsContext.events.slice(0, limit);
  };
  
  const searchTeams = (query) => {
    if (!query.trim()) return teamsContext.teams;
    
    return teamsContext.teams.filter(team =>
      team.name.toLowerCase().includes(query.toLowerCase()) ||
      team.members.some(member => 
        member.toLowerCase().includes(query.toLowerCase())
      )
    );
  };
  
  return {
    ...teamsContext,
    getTopTeams,
    getTeamRank,
    getRecentEvents,
    searchTeams
  };
};