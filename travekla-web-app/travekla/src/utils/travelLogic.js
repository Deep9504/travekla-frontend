// This simulates "Season Logic"
const seasonMap = {
  0: ['Manali', 'Gulmarg', 'Auli'], // Jan (Winter)
  1: ['Goa', 'Kerala', 'Rajasthan'], // Feb
  2: ['Rishikesh', 'Mathura'], // Mar
  3: ['Ooty', 'Coorg', 'Darjeeling'], // Apr
  4: ['Leh', 'Spiti', 'Nainital'], // May
  5: ['Ladakh', 'Kasol'], // June
  6: ['Valley of Flowers', 'Udaipur'], // July (Monsoon)
  7: ['Munnar', 'Cherrapunji'], // Aug
  8: ['Ziro', 'Lonavala'], // Sept
  9: ['Kolkata', 'Mysore'], // Oct
  10: ['Pushkar', 'Varanasi'], // Nov
  11: ['Goa', 'Andaman', 'Jaisalmer'] // Dec
};

export const getBestForSeason = () => {
  const currentMonth = new Date().getMonth(); // 0-11
  return seasonMap[currentMonth] || ['Anywhere!'];
};

// Calculate Crowd Level based on active groups
export const getCrowdStats = (destination, allGroups) => {
  // Count how many people are going to this place
  const count = allGroups.filter(g => g.to.toLowerCase() === destination.toLowerCase()).length;
  
  if (count >= 5) return { status: 'Overcrowded', color: 'red', percent: 90 };
  if (count >= 3) return { status: 'Busy', color: 'orange', percent: 60 };
  return { status: 'Serene', color: 'green', percent: 30 };
};