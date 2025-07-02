import { useMemo } from "react";
import { useCities } from "../contexts/CitiesContext";
import { useGroups } from "../contexts/GroupsContext";

export function useFilteredCities() {
  const { cities, isLoading, currentCity, error, getCity, createCity, deleteCity, updateCity, fetchCities } = useCities();
  const { activeGroup } = useGroups();

  const filteredCities = useMemo(() => {
    if (!activeGroup || !activeGroup.members || activeGroup.members.length === 0) {
      return cities;
    }

    let shortenedCities = cities.filter(city => {
      // Check if any of the city's owners are in the active group
      if (!city.owners || city.owners.length === 0) {
        return false;
      }

      const memberUsernames = activeGroup.members.map(member => member.username);

      return city.owners.some(owner => 
        memberUsernames.includes(owner.username)
      );
    });
    return shortenedCities;
  }, [cities, activeGroup]);

  return {
    cities: filteredCities,
    allCities: cities, // Keep reference to all cities
    isLoading,
    currentCity,
    error,
    getCity,
    createCity,
    deleteCity,
    updateCity,
    fetchCities,
    activeGroup,
  };
}
