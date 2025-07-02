import { useState, useEffect } from "react";
import { useGroups } from "../contexts/GroupsContext";
import { getAllUsers } from "../services/userService";
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

  const [allUsers, setAllUsers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    loadGroups();
    loadUsers();
  }, [loadGroups]);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const users = await getAllUsers();
      // Set default color to #000 for all users
      const usersWithDefaultColor = users.map(user => ({
        ...user,
        color: user.color || "#000"
      }));
      setAllUsers(usersWithDefaultColor);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    createGroup({
      name: newGroupName,
      members: selectedMembers,
    });

    setNewGroupName("");
    setSelectedMembers([]);
    setShowCreateForm(false);
  };

  const handleEditGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    updateGroup(showEditForm, {
      name: newGroupName,
      members: selectedMembers,
    });

    setNewGroupName("");
    setSelectedMembers([]);
    setShowEditForm(null);
  };

  const handleDeleteGroup = (groupId) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      deleteGroup(groupId);
    }
  };

  const startEdit = (group) => {
    setNewGroupName(group.name);
    setSelectedMembers(group.members);
    setShowEditForm(group.id);
    setShowCreateForm(false);
  };

  const cancelEdit = () => {
    setNewGroupName("");
    setSelectedMembers([]);
    setShowEditForm(null);
    setShowCreateForm(false);
  };

  const toggleMemberSelection = (username) => {
    setSelectedMembers(prev =>
      prev.includes(username)
        ? prev.filter(member => member !== username)
        : [...prev, username]
    );
  };

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
          <div className={styles.memberSelection}>
            <h5>Select Members:</h5>
            {allUsers.map((user) => (
              <label key={user.username} className={styles.memberOption}>
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(user.username)}
                  onChange={() => toggleMemberSelection(user.username)}
                />
                <span
                  className={styles.colorDot}
                  style={{ backgroundColor: user.color }}
                ></span>
                {user.username}
              </label>
            ))}
          </div>
          <div className={styles.formButtons}>
            <Button type="primary">Create</Button>
            <Button type="back" onClick={cancelEdit}>
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
          <div className={styles.memberSelection}>
            <h5>Select Members:</h5>
            {allUsers.map((user) => (
              <label key={user.username} className={styles.memberOption}>
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(user.username)}
                  onChange={() => toggleMemberSelection(user.username)}
                />
                <span
                  className={styles.colorDot}
                  style={{ backgroundColor: user.color }}
                ></span>
                {user.username}
              </label>
            ))}
          </div>
          <div className={styles.formButtons}>
            <Button type="primary">Update</Button>
            <Button type="back" onClick={cancelEdit}>
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
                  {group.members.map((memberUsername) => {
                    const user = allUsers.find(u => u.username === memberUsername);
                    return (
                      <span
                        key={memberUsername}
                        className={styles.member}
                        style={{ backgroundColor: user?.color || "#000" }}
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
