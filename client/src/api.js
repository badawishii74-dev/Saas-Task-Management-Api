const BASE_URL = '/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const handleResponse = async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Something went wrong');
    return data;
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const registerUser = (name, email, password, mobile, gender) =>
    fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, email, password, mobile, gender }),
    }).then(handleResponse);

export const verifyOtp = (userId, otp) =>
    fetch(`${BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId, otp }),
    }).then(handleResponse);

export const resendOtp = (userId) =>
    fetch(`${BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId }),
    }).then(handleResponse);

export const loginUser = (email, password) =>
    fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
    }).then(handleResponse);

export const forgotPassword = (email) =>
    fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email }),
    }).then(handleResponse);

export const resetPassword = (userId, otp, newPassword) =>
    fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId, otp, newPassword }),
    }).then(handleResponse);

// ─── TASKS ────────────────────────────────────────────────────────────────────

export const fetchTasks = () =>
    fetch(`${BASE_URL}/tasks`, { headers: getHeaders() }).then(handleResponse);

export const fetchTaskById = (id) =>
    fetch(`${BASE_URL}/tasks/${id}`, { headers: getHeaders() }).then(handleResponse);

export const createTask = (fields) =>
    fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(fields),
    }).then(handleResponse);

export const updateTask = (id, fields) =>
    fetch(`${BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(fields),
    }).then(handleResponse);

export const updateTaskStatus = (id, status) =>
    fetch(`${BASE_URL}/tasks/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
    }).then(handleResponse);

export const deleteTask = (id) =>
    fetch(`${BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    }).then(handleResponse);

export const fetchOverdueTasks = () =>
    fetch(`${BASE_URL}/tasks/overdue`, { headers: getHeaders() }).then(handleResponse);

export const filterTasks = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${BASE_URL}/tasks/filter?${query}`, { headers: getHeaders() }).then(handleResponse);
};

// ─── TEAMS ────────────────────────────────────────────────────────────────────

export const createTeam = (name, description, type) =>
    fetch(`${BASE_URL}/teams`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, description, type }),
    }).then(handleResponse);

export const fetchTeams = () =>
    fetch(`${BASE_URL}/teams`, { headers: getHeaders() }).then(handleResponse);

export const fetchTeamById = (teamId) =>
    fetch(`${BASE_URL}/teams/${teamId}`, { headers: getHeaders() }).then(handleResponse);

export const requestToJoin = (teamId) =>
    fetch(`${BASE_URL}/teams/${teamId}/request-to-join`, {
        method: 'POST',
        headers: getHeaders(),
    }).then(handleResponse);

export const handleJoinRequest = (teamId, userId, action) =>
    fetch(`${BASE_URL}/teams/${teamId}/join-requests`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId, action }),
    }).then(handleResponse);

export const inviteUser = (teamId, userId) =>
    fetch(`${BASE_URL}/teams/${teamId}/invite`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId }),
    }).then(handleResponse);

export const fetchTeamMembers = (teamId) =>
    fetch(`${BASE_URL}/teams/${teamId}/members`, { headers: getHeaders() }).then(handleResponse);

export const handleInvitation = (teamId, action) =>
    fetch(`${BASE_URL}/teams/${teamId}/invitations`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ action }),
    }).then(handleResponse);

export const removeMember = (teamId, userId) =>
    fetch(`${BASE_URL}/teams/${teamId}/members/${userId}`, {
        method: 'DELETE',
        headers: getHeaders(),
    }).then(handleResponse);

export const leaveTeam = (teamId) =>
    fetch(`${BASE_URL}/teams/${teamId}/leave`, {
        method: 'POST',
        headers: getHeaders(),
    }).then(handleResponse);

// ─── COMMENTS ─────────────────────────────────────────────────────────────────

export const createComment = (taskId, text) =>
    fetch(`${BASE_URL}/comments/${taskId}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ text }),
    }).then(handleResponse);

export const fetchTaskComments = (taskId) =>
    fetch(`${BASE_URL}/comments/${taskId}`, { headers: getHeaders() }).then(handleResponse);

export const updateComment = (commentId, text) =>
    fetch(`${BASE_URL}/comments/${commentId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ text }),
    }).then(handleResponse);

export const deleteComment = (commentId) =>
    fetch(`${BASE_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: getHeaders(),
    }).then(handleResponse);

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export const fetchNotifications = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${BASE_URL}/notifications?${query}`, { headers: getHeaders() }).then(handleResponse);
};

export const fetchUnreadCount = () =>
    fetch(`${BASE_URL}/notifications/unread-count`, { headers: getHeaders() }).then(handleResponse);

export const markNotificationRead = (id) =>
    fetch(`${BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: getHeaders(),
    }).then(handleResponse);

export const markAllNotificationsRead = () =>
    fetch(`${BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: getHeaders(),
    }).then(handleResponse);

export const deleteNotification = (id) =>
    fetch(`${BASE_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    }).then(handleResponse);

export const deleteAllNotifications = () =>
    fetch(`${BASE_URL}/notifications`, {
        method: 'DELETE',
        headers: getHeaders(),
    }).then(handleResponse);

// ─── ACTIVITIES ───────────────────────────────────────────────────────────────

export const fetchTaskActivity = (taskId) =>
    fetch(`${BASE_URL}/activities/task/${taskId}`, { headers: getHeaders() }).then(handleResponse);

export const fetchUserActivity = (userId) =>
    fetch(`${BASE_URL}/activities/user/${userId}`, { headers: getHeaders() }).then(handleResponse);

export const fetchRecentActivities = () =>
    fetch(`${BASE_URL}/activities/recent`, { headers: getHeaders() }).then(handleResponse);

// ─── ADMIN ────────────────────────────────────────────────────────────────────

export const fetchDashboardStats = () =>
    fetch(`${BASE_URL}/admin/dashboard`, { headers: getHeaders() }).then(handleResponse);

export const fetchAllUsers = () =>
    fetch(`${BASE_URL}/admin/users`, { headers: getHeaders() }).then(handleResponse);

export const fetchAllTeamsAdmin = () =>
    fetch(`${BASE_URL}/admin/teams`, { headers: getHeaders() }).then(handleResponse);

export const fetchUserTasksAdmin = (userId) =>
    fetch(`${BASE_URL}/admin/users/${userId}/tasks`, { headers: getHeaders() }).then(handleResponse);

export const fetchUserCreatedTasks = (userId) =>
    fetch(`${BASE_URL}/admin/users/${userId}/created-tasks`, { headers: getHeaders() }).then(handleResponse);

export const fetchTeamTasksAdmin = (teamId) =>
    fetch(`${BASE_URL}/admin/teams/${teamId}/tasks`, { headers: getHeaders() }).then(handleResponse);

export const fetchPersonalTasksAdmin = () =>
    fetch(`${BASE_URL}/admin/tasks/personal`, { headers: getHeaders() }).then(handleResponse);

export const fetchAllTeamTasksAdmin = () =>
    fetch(`${BASE_URL}/admin/tasks/team`, { headers: getHeaders() }).then(handleResponse);

export const fetchTasksByStatus = (status) =>
    fetch(`${BASE_URL}/admin/tasks/status/${status}`, { headers: getHeaders() }).then(handleResponse);

export const updateUserInfo = (userId, fields) =>
    fetch(`${BASE_URL}/admin/users/${userId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(fields),
    }).then(handleResponse);

export const updateTaskAdmin = (taskId, fields) =>
    fetch(`${BASE_URL}/admin/tasks/${taskId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(fields),
    }).then(handleResponse);

export const updateTeamAdmin = (teamId, fields) =>
    fetch(`${BASE_URL}/admin/teams/${teamId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(fields),
    }).then(handleResponse);

export const deleteUserAdmin = (userId) =>
    fetch(`${BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getHeaders(),
    }).then(handleResponse);

export const deleteTaskAdmin = (taskId) =>
    fetch(`${BASE_URL}/admin/tasks/${taskId}`, {
        method: 'DELETE',
        headers: getHeaders(),
    }).then(handleResponse);

export const deleteTeamAdmin = (teamId) =>
    fetch(`${BASE_URL}/admin/teams/${teamId}`, {
        method: 'DELETE',
        headers: getHeaders(),
    }).then(handleResponse);
