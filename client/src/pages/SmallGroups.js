import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { smallGroupsService } from '../services/api';
import './SmallGroups.css';

const SmallGroups = () => {
  const [allGroups, setAllGroups] = useState([]);
  const [myGroupIds, setMyGroupIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [view, setView] = useState('my-groups'); // 'my-groups' or 'all-groups'

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const userId = userData.id;

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [allRes, myRes] = await Promise.all([
        smallGroupsService.getAll(),
        userId ? smallGroupsService.getMyGroups(userId) : Promise.resolve({ success: true, data: [] }),
      ]);

      if (allRes.success) {
        setAllGroups(allRes.data || []);
      }

      if (myRes.success) {
        const ids = new Set((myRes.data || []).map(m => m.small_groups?.id).filter(Boolean));
        setMyGroupIds(ids);
      }
    } catch (error) {
      console.error('Error loading small groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (groupId) => {
    if (!userId) {
      alert('Please log in again to join a group.');
      return;
    }
    if (actionLoading[groupId]) return;
    setActionLoading(prev => ({ ...prev, [groupId]: true }));
    try {
      const res = await smallGroupsService.join(groupId, userId);
      if (res.success) {
        setMyGroupIds(prev => new Set([...prev, groupId]));
        // Refresh to get updated member counts
        await loadData();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to join group';
      alert(msg);
    } finally {
      setActionLoading(prev => ({ ...prev, [groupId]: false }));
    }
  };

  const handleLeave = async (groupId) => {
    if (actionLoading[groupId]) return;
    if (!window.confirm('Are you sure you want to leave this group?')) return;
    setActionLoading(prev => ({ ...prev, [groupId]: true }));
    try {
      const res = await smallGroupsService.leave(groupId, userId);
      if (res.success) {
        setMyGroupIds(prev => {
          const updated = new Set(prev);
          updated.delete(groupId);
          return updated;
        });
        setSelectedGroup(null);
        await loadData();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to leave group';
      alert(msg);
    } finally {
      setActionLoading(prev => ({ ...prev, [groupId]: false }));
    }
  };

  const handleViewDetails = (group) => {
    setSelectedGroup(selectedGroup?.id === group.id ? null : group);
  };

  const myGroups = allGroups.filter(g => myGroupIds.has(g.id));
  const availableGroups = allGroups.filter(g => !myGroupIds.has(g.id));

  const formatMeetingTime = (meetingTime) => {
    if (!meetingTime) return 'TBD';
    return meetingTime;
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="main-content">
          <div className="loading">Loading small groups...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="main-content">
        <header className="dashboard-header">
          <h1><i className="fas fa-users"></i> Small Groups</h1>
          <p>Connect, grow, and fellowship with your church family</p>
        </header>

        {/* View Toggle */}
        <div className="sg-view-toggle">
          <button
            className={`sg-toggle-btn ${view === 'my-groups' ? 'active' : ''}`}
            onClick={() => setView('my-groups')}
          >
            <i className="fas fa-user-check"></i> My Groups ({myGroups.length})
          </button>
          <button
            className={`sg-toggle-btn ${view === 'all-groups' ? 'active' : ''}`}
            onClick={() => setView('all-groups')}
          >
            <i className="fas fa-globe"></i> Browse All Groups ({allGroups.length})
          </button>
        </div>

        {/* My Groups View */}
        {view === 'my-groups' && (
          <div className="sg-section">
            {myGroups.length > 0 ? (
              <div className="sg-grid">
                {myGroups.map(group => (
                  <div key={group.id} className="sg-card my-group">
                    <div className="sg-card-badge">Member</div>
                    <h3>{group.name}</h3>
                    <p className="sg-description">{group.description}</p>
                    <div className="sg-details">
                      <p><i className="fas fa-user-tie"></i> Leader: {group.leader}</p>
                      <p><i className="fas fa-clock"></i> {formatMeetingTime(group.meeting_time)}</p>
                      <p><i className="fas fa-users"></i> {group.member_count} member{group.member_count !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="sg-card-actions">
                      <button
                        className="sg-btn sg-btn-details"
                        onClick={() => handleViewDetails(group)}
                      >
                        {selectedGroup?.id === group.id ? 'Hide Members' : 'View Members'}
                      </button>
                      <button
                        className="sg-btn sg-btn-leave"
                        onClick={() => handleLeave(group.id)}
                        disabled={actionLoading[group.id]}
                      >
                        {actionLoading[group.id] ? 'Leaving...' : 'Leave Group'}
                      </button>
                    </div>

                    {/* Members List */}
                    {selectedGroup?.id === group.id && (
                      <div className="sg-members-list">
                        <h4><i className="fas fa-user-friends"></i> Group Members</h4>
                        {group.small_group_members && group.small_group_members.length > 0 ? (
                          <ul>
                            {group.small_group_members.map(member => (
                              <li key={member.id}>
                                <span className="sg-member-name">
                                  <i className="fas fa-user"></i> {member.users?.username || 'Unknown'}
                                </span>
                                <span className="sg-member-email">{member.users?.email || ''}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="sg-no-members">No members yet</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="sg-empty">
                <i className="fas fa-users-slash"></i>
                <h3>You haven't joined any groups yet</h3>
                <p>Browse available groups and join one to start connecting!</p>
                <button className="sg-btn sg-btn-primary" onClick={() => setView('all-groups')}>
                  Browse Groups
                </button>
              </div>
            )}
          </div>
        )}

        {/* All Groups View */}
        {view === 'all-groups' && (
          <div className="sg-section">
            {allGroups.length > 0 ? (
              <div className="sg-grid">
                {availableGroups.length > 0 && (
                  <>
                    <h3 className="sg-section-title">Available Groups</h3>
                    {availableGroups.map(group => (
                      <div key={group.id} className="sg-card">
                        <h3>{group.name}</h3>
                        <p className="sg-description">{group.description}</p>
                        <div className="sg-details">
                          <p><i className="fas fa-user-tie"></i> Leader: {group.leader}</p>
                          <p><i className="fas fa-clock"></i> {formatMeetingTime(group.meeting_time)}</p>
                          <p><i className="fas fa-users"></i> {group.member_count} member{group.member_count !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="sg-card-actions">
                          <button
                            className="sg-btn sg-btn-join"
                            onClick={() => handleJoin(group.id)}
                            disabled={actionLoading[group.id]}
                          >
                            {actionLoading[group.id] ? 'Joining...' : 'Join Group'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {myGroups.length > 0 && (
                  <>
                    <h3 className="sg-section-title sg-joined-title">Groups You've Joined</h3>
                    {myGroups.map(group => (
                      <div key={group.id} className="sg-card my-group">
                        <div className="sg-card-badge">Member</div>
                        <h3>{group.name}</h3>
                        <p className="sg-description">{group.description}</p>
                        <div className="sg-details">
                          <p><i className="fas fa-user-tie"></i> Leader: {group.leader}</p>
                          <p><i className="fas fa-clock"></i> {formatMeetingTime(group.meeting_time)}</p>
                          <p><i className="fas fa-users"></i> {group.member_count} member{group.member_count !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="sg-card-actions">
                          <span className="sg-joined-label"><i className="fas fa-check-circle"></i> Joined</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {allGroups.length === 0 && (
                  <div className="sg-empty">
                    <i className="fas fa-users-slash"></i>
                    <h3>No groups available</h3>
                    <p>Check back later for new small groups.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="sg-empty">
                <i className="fas fa-users-slash"></i>
                <h3>No groups available</h3>
                <p>Check back later for new small groups.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default SmallGroups;
