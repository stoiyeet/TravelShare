import { useState, useEffect } from "react";
import { useGroups } from "../contexts/GroupsContext";
import { getAllUsers, getAvailableColours } from "../services/userService";
import { useAuth } from "../contexts/AuthContext";
import Spinner from "./Spinner";
import Message from "./Message";
import Button from "./Button";
import styles from "./GroupList.module.css";

function GroupList() {
  const {
    groups,
    activeGroup,
    isLoading,
    loadGroups,
    createGroup,
    deleteGroup,
    updateGroup,
    setActiveGroup,
  } = useGroups();

  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [memberColors, setMemberColors] = useState({});
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [availableColors, setAvailableColors] = useState([]);
  const [allColors, setAllColors] = useState([]);

  useEffect(() => {
    loadGroups();
    loadUsers();
    loadColors();
  }, [loadGroups]);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const users = await getAllUsers();
      // Filter out current user from the list
      const filteredUsers = users.filter(u => u.username !== user.username);
      setAllUsers(filteredUsers);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadColors = async () => {
    try {
      const colorsResponse = await getAvailableColours();
      setAllColors(colorsResponse.colors);
      setAvailableColors(colorsResponse.colors);
    } catch (error) {
      console.error("Error loading colors:", error);
    }
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    // Prepare members with colors, including the current user
    const membersWithColors = [
      {
        user: user.username,
        color: memberColors[user.username] || availableColors[0] || "#000"
      },
      ...selectedMembers.map(username => ({
        user: username,
        color: memberColors[username] || "#000"
      }))
    ];

    createGroup({
      name: newGroupName,
      members: membersWithColors,
    });

    resetForm();
  };

  const handleEditGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    // Prepare members with colors, ensuring creator stays
    const membersWithColors = selectedMembers
      .filter(username => username !== user.username) // Remove creator from selected list
      .map(username => ({
        user: username,
        color: memberColors[username] || "#000"
      }));

    updateGroup(showEditForm, {
      name: newGroupName,
      members: membersWithColors,
    });

    resetForm();
  };

  const handleDeleteGroup = (groupId) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      deleteGroup(groupId);
    }
  };

  const startEdit = (group) => {
    setNewGroupName(group.name);
    
    // Extract usernames from members (excluding creator)
    const memberUsernames = group.members
      .filter(member => member.username !== user.username)
      .map(member => member.username);
    
    setSelectedMembers(memberUsernames);
    
    // Set up member colors
    const colors = {};
    group.members.forEach(member => {
      colors[member.username] = member.color;
    });
    setMemberColors(colors);
    
    setShowEditForm(group.id);
    setShowCreateForm(false);
  };

  const resetForm = () => {
    setNewGroupName("");
    setSelectedMembers([]);
    setMemberColors({});
    setShowEditForm(null);
    setShowCreateForm(false);
    setSearchTerm("");
  };

  const toggleMemberSelection = (username) => {
    setSelectedMembers(prev => {
      const newSelected = prev.includes(username)
        ? prev.filter(member => member !== username)
        : [...prev, username];
      
      // Set default color for newly selected members
      if (!prev.includes(username) && !memberColors[username]) {
        setMemberColors(prevColors => ({
          ...prevColors,
          [username]: availableColors[0] || "#000"
        }));
      }
      
      return newSelected;
    });
  };

  const updateMemberColor = (username, color) => {
    setMemberColors(prev => ({
      ...prev,
      [username]: color
    }));
  };

  const filteredUsers = allUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Initialize creator color when creating new group
  useEffect(() => {
    if (showCreateForm && !memberColors[user.username]) {
      setMemberColors(prev => ({
        ...prev,
        [user.username]: availableColors[0] || "#000"
      }));
    }
  }, [showCreateForm, user.username, availableColors, memberColors]);

  if (isLoading || usersLoading) return <Spinner />;

  return (
    <div className={styles.groupList}>
      <div className={styles.header}>
        <h3>Groups</h3>
        <Button
          type="primary"
          onClick={() => {
            setShowCreateForm(true);
            setShowEditForm(null);
          }}
        >
          + New Group
        </Button>
      </div>

      {showCreateForm && (
        <form className={styles.groupForm} onSubmit={handleCreateGroup}>
          <h4>Create New Group</h4>
          <input
            type="text"
            placeholder="Group name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            required
          />
          
          {/* Creator section */}
          <div className={styles.creatorSection}>
            <h5>You (Group Creator):</h5>
            <div className={styles.memberOption}>
              <span
                className={styles.colorDot}
                style={{ backgroundColor: memberColors[user.username] || "#000" }}
              ></span>
              {user.username}
              <div className={styles.colorOptions}>
                {availableColors.map(color => (
                  <div
                    key={color}
                    className={styles.colorSwatch}
                    style={{ backgroundColor: color }}
                    onClick={() => updateMemberColor(user.username, color)}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.memberSelection}>
            <h5>Add Members:</h5>
            <input
              type="text"
              placeholder="Search users by username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <div className={styles.usersList}>
              {filteredUsers.map((user) => (
                <div key={user.username} className={styles.userItem}>
                  <label className={styles.memberOption}>
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(user.username)}
                      onChange={() => toggleMemberSelection(user.username)}
                    />
                    <span
                      className={styles.colorDot}
                      style={{ backgroundColor: memberColors[user.username] || "#000" }}
                    ></span>
                    {user.username}
                  </label>
                  {selectedMembers.includes(user.username) && (
                    <div className={styles.colorOptions}>
                      {availableColors.map(color => (
                        <div
                          key={color}
                          className={styles.colorSwatch}
                          style={{ backgroundColor: color }}
                          onClick={() => updateMemberColor(user.username, color)}
                        ></div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.formButtons}>
            <Button type="primary">Create</Button>
            <Button type="back" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {showEditForm && (
        <form className={styles.groupForm} onSubmit={handleEditGroup}>
          <h4>Edit Group</h4>
          <input
            type="text"
            placeholder="Group name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            required
          />
          
          {/* Creator section - non-editable */}
          <div className={styles.creatorSection}>
            <h5>You (Group Creator):</h5>
            <div className={styles.memberOption}>
              <span
                className={styles.colorDot}
                style={{ backgroundColor: memberColors[user.username] || "#000" }}
              ></span>
              {user.username}
              <div className={styles.colorOptions}>
                {availableColors.map(color => (
                  <div
                    key={color}
                    className={styles.colorSwatch}
                    style={{ backgroundColor: color }}
                    onClick={() => updateMemberColor(user.username, color)}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.memberSelection}>
            <h5>Edit Members:</h5>
            <input
              type="text"
              placeholder="Search users by username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <div className={styles.usersList}>
              {filteredUsers.map((user) => (
                <div key={user.username} className={styles.userItem}>
                  <label className={styles.memberOption}>
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(user.username)}
                      onChange={() => toggleMemberSelection(user.username)}
                    />
                    <span
                      className={styles.colorDot}
                      style={{ backgroundColor: memberColors[user.username] || "#000" }}
                    ></span>
                    {user.username}
                  </label>
                  {selectedMembers.includes(user.username) && (
                    <div className={styles.colorOptions}>
                      {availableColors.map(color => (
                        <div
                          key={color}
                          className={styles.colorSwatch}
                          style={{ backgroundColor: color }}
                          onClick={() => updateMemberColor(user.username, color)}
                        ></div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.formButtons}>
            <Button type="primary">Update</Button>
            <Button type="back" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {groups.length === 0 && !showCreateForm ? (
        <Message message="Create your first group to start organizing cities by team members" />
      ) : (
        <div className={styles.groups}>
          {groups.map((group) => (
            <div
              key={group.id}
              className={`${styles.groupItem} ${
                activeGroup?.id === group.id ? styles.active : ""
              }`}
            >
              <div
                className={styles.groupInfo}
                onClick={() => setActiveGroup(group)}
              >
                <h4>{group.name}</h4>
                <p>{group.members.length} members</p>
                <div className={styles.members}>
                  {group.members.map((member) => {
                    const memberUsername = typeof member === 'string' ? member : member.username;
                    const memberColor = typeof member === 'string' ? "#000" : member.color;
                    
                    return (
                      <span
                        key={memberUsername}
                        className={styles.member}
                        style={{ backgroundColor: memberColor }}
                        title={memberUsername}
                      >
                        {memberUsername.charAt(0).toUpperCase()}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className={styles.groupActions}>
                <button
                  className={styles.editBtn}
                  onClick={() => startEdit(group)}
                  title="Edit group"
                >
                  ✏️
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteGroup(group.id)}
                  title="Delete group"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GroupList;