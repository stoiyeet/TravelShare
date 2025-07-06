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
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    loadGroups();
    loadUsers();
    loadColors();
  }, [loadGroups]);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const users = await getAllUsers();
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

  const getUsedColors = () => Object.values(memberColors);
  
  const hexToRGBA = (hex, alpha = 1) => {
  const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};


  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const membersWithColors = [
      {
        user: user.username,
        color: memberColors[user.username]
      },
      ...selectedMembers.map(username => ({
        user: username,
        color: memberColors[username]
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

    const membersWithColors = selectedMembers
      .map(username => ({
        user: username,
        color: memberColors[username]
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
    const memberUsernames = group.members
      .map(member => member.username);

    setSelectedMembers(memberUsernames);

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
    setOpenDropdown(null);
  };

  const handleColorSelect = (username, color) => {
    // Add user to selected members with the chosen color
    setSelectedMembers(prev => {
      if (!prev.includes(username)) {
        return [...prev, username];
      }
      return prev;
    });

    // Set the color for this user
    setMemberColors(prev => ({
      ...prev,
      [username]: color
    }));

    // Close the dropdown
    setOpenDropdown(null);
  };

const handleRemoveMember = (username) => {
  setSelectedMembers(prev => prev.filter(member => member !== username));

  setMemberColors(prev => {
    const updated = { ...prev };
    if (username !== user.username) {
      delete updated[username];
    }
    return updated;
  });
};


  const updateMemberColor = (username, color) => {
    const usedColors = Object.entries(memberColors)
      .filter(([key]) => key !== username)
      .map(([_, val]) => val);

    if (usedColors.includes(color)) return; // Prevent duplicate

    setMemberColors(prev => ({
      ...prev,
      [username]: color
    }));
  };

  const filteredUsers = allUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvailableColorsForUser = (username) => {
    const usedColors = getUsedColors();
    return availableColors.filter(color => !usedColors.includes(color));
  };

  useEffect(() => {
    if (showCreateForm && !memberColors[user.username]) {
      // Set a default color for the creator
      const firstAvailableColor = availableColors.find(color => !getUsedColors().includes(color)) || availableColors[0];
      setMemberColors(prev => ({
        ...prev,
        [user.username]: firstAvailableColor
      }));
    }
  }, [showCreateForm, user.username, availableColors]);

  if (isLoading || usersLoading) return <Spinner />;

  return (
    <div className={styles.groupList}>
      <div className={styles.header}>
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

      {(showCreateForm || showEditForm) && (
        <form
          className={styles.groupForm}
          onSubmit={showCreateForm ? handleCreateGroup : handleEditGroup}
        >
          <h4>{showCreateForm ? "Create New Group" : "Edit Group"}</h4>
          <input
            type="text"
            placeholder="Group name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            required
          />

          <div className={styles.creatorSection}>
            <h5>You (Group Creator):</h5>
            <div className={styles.memberOption} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                className={styles.userDropdownTrigger}
                onClick={() => setOpenDropdown(openDropdown === user.username ? null : user.username)}
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}
              >
                <span
                  className={styles.colorDot}
                  style={{ backgroundColor: memberColors[user.username] || "#000" }}
                ></span>
                <span>{user.username}</span>
                <span className={styles.dropdownArrow}>
                  {openDropdown === user.username ? '▲' : '▼'}
                </span>
              </div>
              {openDropdown === user.username && (
                <div className={styles.colorDropdown} style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '5px'
                }}>
                  {availableColors
                    .filter(color => !getUsedColors().includes(color) || memberColors[user.username] === color)
                    .map(color => (
                      <div
                        key={color}
                        className={styles.colorSwatchOption}
                        style={{
                          backgroundColor: color,
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          border: memberColors[user.username] === color ? '2px solid #333' : '2px solid #ddd'
                        }}
                        onClick={() => {
                          updateMemberColor(user.username, color);
                          setOpenDropdown(null);
                        }}
                        title={`Select your color`}
                      ></div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.memberSelection}>
            <h5>{showCreateForm ? "Add Members" : "Edit Members"}:</h5>
                      <input
              type="text"
              placeholder="Search users to add..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            {selectedMembers.length > 0 && (
            <button
              type="button"
              className={styles.clearSelectionBtn}
              onClick={() => {
                setSelectedMembers([]);
                setMemberColors((prev) => {
                  const updated = { ...prev };
                  Object.keys(updated).forEach((key) => {
                    if (key !== user.username) delete updated[key]; // preserve creator color
                  });
                  return updated;
                });
              }}
            >
              ✖ Clear Selection
            </button>
          )}

            <div className={styles.userListScrollContainer}>
              {filteredUsers.map((user) => {
              const isSelected = selectedMembers.includes(user.username);

              return isSelected ? (
                <div key={user.username} className={styles.selectedMemberItem} style={{ background: `${hexToRGBA(memberColors[user.username] || "#000", 0.2)}` }}

>
                  {user.username}
                  <div className={styles.colorOptions}>
                    {availableColors
                      .filter(color => !getUsedColors().includes(color) || memberColors[user.username] === color)
                      .map(color => (
                        <div
                          key={color}
                          className={styles.colorSwatch}
                          style={{ backgroundColor: color }}
                          onClick={() => updateMemberColor(user.username, color)}
                        ></div>
                      ))}
                  </div>
                  <button
                    type="button"
                    className={styles.removeMemberBtn}
                    onClick={() => handleRemoveMember(user.username)}
                    title="Remove member"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div key={user.username} className={styles.userItem}>
                  <div 
                    className={styles.userDropdownTrigger}
                    onClick={() => setOpenDropdown(openDropdown === user.username ? null : user.username)}
                  >
                    <span className={styles.userName}>{user.username}</span>
                    <span className={styles.dropdownArrow}>
                      {openDropdown === user.username ? '▲' : '▼'}
                    </span>
                  </div>

                  {openDropdown === user.username && (
                    <div className={styles.colorDropdown}>
                      {getAvailableColorsForUser(user.username).length > 0 ? (
                        getAvailableColorsForUser(user.username).map(color => (
                          <div
                            key={color}
                            className={styles.colorSwatchOption}
                            style={{ backgroundColor: color }}
                            onClick={() => handleColorSelect(user.username, color)}
                            title={`Select ${user.username} with this color`}
                          ></div>
                        ))
                      ) : (
                        <div className={styles.noColorsMessage}>No colors available</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            </div>
          </div>

          <div className={styles.formButtons}>
            <Button type="primary">{showCreateForm ? "Create" : "Update"}</Button>
            <Button type="back" onClick={resetForm}>Cancel</Button>
          </div>
        </form>
      )}

      {groups.length === 0 && !showCreateForm ? (
        <Message message="Create your first group to start sharing your travels 🤗" />
      ) : (
        <div className={styles.groups}>
          {groups.map((group) => (
            <div
              key={group.id}
              className={`${styles.groupItem} ${activeGroup?.id === group.id ? styles.active : ""}`}
            >
              <div
                className={styles.groupInfo}
                onClick={() => setActiveGroup(group)}
              >
                <h4>{group.name}</h4>
                <p>{group.members.length} members</p>
                <div className={styles.members}>
                  {group.members.map((member) => {
                    const memberUsername = typeof member === "string" ? member : member.username;
                    const memberColor = typeof member === "string" ? "#000" : member.color;

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