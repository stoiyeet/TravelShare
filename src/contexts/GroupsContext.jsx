import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";

const GroupsContext = createContext();

const initialState = {
  groups: [],
  activeGroup: null,
  isLoading: false,
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };

    case "groups/loaded":
      return {
        ...state,
        isLoading: false,
        groups: action.payload,
      };

    case "group/created":
      return {
        ...state,
        isLoading: false,
        groups: [...state.groups, action.payload],
      };

    case "group/deleted":
      return {
        ...state,
        isLoading: false,
        groups: state.groups.filter((group) => group.id !== action.payload),
        activeGroup: state.activeGroup?.id === action.payload ? null : state.activeGroup,
      };

    case "group/updated":
      return {
        ...state,
        isLoading: false,
        groups: state.groups.map((group) =>
          group.id === action.payload.id ? action.payload : group
        ),
      };

    case "activeGroup/set":
      return {
        ...state,
        activeGroup: action.payload,
      };

    case "rejected":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    default:
      throw new Error("Unknown action type");
  }
}

function GroupsProvider({ children }) {
  const [{ groups, activeGroup, isLoading, error }, dispatch] = useReducer(
    reducer,
    initialState
  );

  // For now, we'll store groups in localStorage since there's no backend for groups yet
  const loadGroups = useCallback(() => {
    dispatch({ type: "loading" });
    try {
      const storedGroups = localStorage.getItem("groups");
      const groups = storedGroups ? JSON.parse(storedGroups) : [];
      dispatch({ type: "groups/loaded", payload: groups });
      
      // Set first group as active if none is set
      const storedActiveGroup = localStorage.getItem("activeGroup");
      if (storedActiveGroup) {
        const activeGroup = JSON.parse(storedActiveGroup);
        dispatch({ type: "activeGroup/set", payload: activeGroup });
      } else if (groups.length > 0) {
        dispatch({ type: "activeGroup/set", payload: groups[0] });
        localStorage.setItem("activeGroup", JSON.stringify(groups[0]));
      }
    } catch (err) {
      dispatch({
        type: "rejected",
        payload: "There was an error loading groups...",
      });
    }
  }, []);

  // Load groups on mount
  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const createGroup = useCallback((groupData) => {
    dispatch({ type: "loading" });
    try {
      const newGroup = {
        id: Date.now().toString(),
        name: groupData.name,
        members: groupData.members || [],
        createdAt: new Date().toISOString(),
      };

      const storedGroups = localStorage.getItem("groups");
      const groups = storedGroups ? JSON.parse(storedGroups) : [];
      const updatedGroups = [...groups, newGroup];
      
      localStorage.setItem("groups", JSON.stringify(updatedGroups));
      dispatch({ type: "group/created", payload: newGroup });

      // Set as active group if it's the first one
      if (updatedGroups.length === 1) {
        dispatch({ type: "activeGroup/set", payload: newGroup });
        localStorage.setItem("activeGroup", JSON.stringify(newGroup));
      }
    } catch (err) {
      dispatch({
        type: "rejected",
        payload: "There was an error creating the group...",
      });
    }
  }, []);

  const deleteGroup = useCallback((groupId) => {
    dispatch({ type: "loading" });
    try {
      const storedGroups = localStorage.getItem("groups");
      const groups = storedGroups ? JSON.parse(storedGroups) : [];
      const updatedGroups = groups.filter((group) => group.id !== groupId);
      
      localStorage.setItem("groups", JSON.stringify(updatedGroups));
      dispatch({ type: "group/deleted", payload: groupId });

      // Update active group if needed
      const storedActiveGroup = localStorage.getItem("activeGroup");
      if (storedActiveGroup) {
        const activeGroup = JSON.parse(storedActiveGroup);
        if (activeGroup.id === groupId) {
          const newActiveGroup = updatedGroups.length > 0 ? updatedGroups[0] : null;
          dispatch({ type: "activeGroup/set", payload: newActiveGroup });
          if (newActiveGroup) {
            localStorage.setItem("activeGroup", JSON.stringify(newActiveGroup));
          } else {
            localStorage.removeItem("activeGroup");
          }
        }
      }
    } catch (err) {
      dispatch({
        type: "rejected",
        payload: "There was an error deleting the group...",
      });
    }
  }, []);

  const updateGroup = useCallback((groupId, updateData) => {
    dispatch({ type: "loading" });
    try {
      const storedGroups = localStorage.getItem("groups");
      const groups = storedGroups ? JSON.parse(storedGroups) : [];
      const updatedGroups = groups.map((group) =>
        group.id === groupId ? { ...group, ...updateData } : group
      );
      
      localStorage.setItem("groups", JSON.stringify(updatedGroups));
      const updatedGroup = updatedGroups.find((group) => group.id === groupId);
      dispatch({ type: "group/updated", payload: updatedGroup });

      // Update active group if it's the one being updated
      const storedActiveGroup = localStorage.getItem("activeGroup");
      if (storedActiveGroup) {
        const activeGroup = JSON.parse(storedActiveGroup);
        if (activeGroup.id === groupId) {
          dispatch({ type: "activeGroup/set", payload: updatedGroup });
          localStorage.setItem("activeGroup", JSON.stringify(updatedGroup));
        }
      }
    } catch (err) {
      dispatch({
        type: "rejected",
        payload: "There was an error updating the group...",
      });
    }
  }, []);

  const setActiveGroup = useCallback((group) => {
    dispatch({ type: "activeGroup/set", payload: group });
    if (group) {
      localStorage.setItem("activeGroup", JSON.stringify(group));
    } else {
      localStorage.removeItem("activeGroup");
    }
  }, []);

  return (
    <GroupsContext.Provider
      value={{
        groups,
        activeGroup,
        isLoading,
        error,
        loadGroups,
        createGroup,
        deleteGroup,
        updateGroup,
        setActiveGroup,
      }}
    >
      {children}
    </GroupsContext.Provider>
  );
}

function useGroups() {
  const context = useContext(GroupsContext);
  if (!context) {
    throw new Error("useGroups must be used within a GroupsProvider");
  }
  return context;
}

export { GroupsProvider, useGroups };
