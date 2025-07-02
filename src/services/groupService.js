const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9000";

// Get all groups for the authenticated user
export async function getAllGroups() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/groups`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching groups:", error);
    throw error;
  }
}

// Create a new group
export async function createGroup(groupData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/groups`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(groupData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error creating group:", error);
    throw error;
  }
}

// Update a group
export async function updateGroup(groupId, updateData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error updating group:", error);
    throw error;
  }
}

// Delete a group
export async function deleteGroup(groupId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error deleting group:", error);
    throw error;
  }
}

// Get a specific group
export async function getGroup(groupId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching group:", error);
    throw error;
  }
}
