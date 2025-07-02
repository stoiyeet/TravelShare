import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import {
  getAllGroups,
  createGroup as createGroupAPI,
  updateGroup as updateGroupAPI,
  deleteGroup as deleteGroupAPI,
} from "../services/groupService";

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

  const loadGroups = useCallback(async () => {
    dispatch({ type: "loading" });
    try {
      const groups = await getAllGroups();
      // Transform the groups to match the expected format
      const transformedGroups = groups.map(group => ({
        id: group._id,
        name: group.name,
        members: group.members.map(member => ({
          username: member.user.username,
          color: member.color,
          userId: member.user._id,
        })),
        createdAt: group.createdAt,
        createdBy: group.createdBy,
      }));
      
      dispatch({ type: "groups/loaded", payload: transformedGroups });
      
      // Set first group as active if none is set
      const storedActiveGroup = localStorage.getItem("activeGroup");
      if (storedActiveGroup) {
        const activeGroup = JSON.parse(storedActiveGroup);
        // Check if the stored active group still exists
        const existingGroup = transformedGroups.find(g => g.id === activeGroup.id);
        if (existingGroup) {
          dispatch({ type: "activeGroup/set", payload: existingGroup });
        } else if (transformedGroups.length > 0) {
          dispatch({ type: "activeGroup/set", payload: transformedGroups[0] });
          localStorage.setItem("activeGroup", JSON.stringify(transformedGroups[0]));
        } else {
          localStorage.removeItem("activeGroup");
        }
      } else if (transformedGroups.length > 0) {
        dispatch({ type: "activeGroup/set", payload: transformedGroups[0] });
        localStorage.setItem("activeGroup", JSON.stringify(transformedGroups[0]));
      }
    } catch (err) {
      console.error("Error loading groups:", err);
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

  const createGroup = useCallback(async (groupData) => {
    dispatch({ type: "loading" });
    try {
      const createdGroup = await createGroupAPI(groupData);
      
      // Transform the created group to match the expected format
      const transformedGroup = {
        id: createdGroup._id,
        name: createdGroup.name,
        members: createdGroup.members.map(member => ({
          username: member.user.username,
          color: member.color,
          userId: member.user._id,
        })),
        createdAt: createdGroup.createdAt,
        createdBy: createdGroup.createdBy,
      };

      dispatch({ type: "group/created", payload: transformedGroup });

      // Set as active group if it's the first one
      if (groups.length === 0) {
        dispatch({ type: "activeGroup/set", payload: transformedGroup });
        localStorage.setItem("activeGroup", JSON.stringify(transformedGroup));
      }
    } catch (err) {
      console.error("Error creating group:", err);
      dispatch({
        type: "rejected",
        payload: "There was an error creating the group...",
      });
    }
  }, [groups.length]);

  const deleteGroup = useCallback(async (groupId) => {
    dispatch({ type: "loading" });
    try {
      await deleteGroupAPI(groupId);
      dispatch({ type: "group/deleted", payload: groupId });

      // Update active group if needed
      if (activeGroup?.id === groupId) {
        const remainingGroups = groups.filter(group => group.id !== groupId);
        const newActiveGroup = remainingGroups.length > 0 ? remainingGroups[0] : null;
        dispatch({ type: "activeGroup/set", payload: newActiveGroup });
        if (newActiveGroup) {
          localStorage.setItem("activeGroup", JSON.stringify(newActiveGroup));
        } else {
          localStorage.removeItem("activeGroup");
        }
      }
    } catch (err) {
      console.error("Error deleting group:", err);
      dispatch({
        type: "rejected",
        payload: "There was an error deleting the group...",
      });
    }
  }, [activeGroup, groups]);

  const updateGroup = useCallback(async (groupId, updateData) => {
    dispatch({ type: "loading" });
    try {
      const updatedGroup = await updateGroupAPI(groupId, updateData);
      
      // Transform the updated group to match the expected format
      const transformedGroup = {
        id: updatedGroup._id,
        name: updatedGroup.name,
        members: updatedGroup.members.map(member => ({
          username: member.user.username,
          color: member.color,
          userId: member.user._id,
        })),
        createdAt: updatedGroup.createdAt,
        createdBy: updatedGroup.createdBy,
      };

      dispatch({ type: "group/updated", payload: transformedGroup });

      // Update active group if it's the one being updated
      if (activeGroup?.id === groupId) {
        dispatch({ type: "activeGroup/set", payload: transformedGroup });
        localStorage.setItem("activeGroup", JSON.stringify(transformedGroup));
      }
    } catch (err) {
      console.error("Error updating group:", err);
      dispatch({
        type: "rejected",
        payload: "There was an error updating the group...",
      });
    }
  }, [activeGroup]);

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
