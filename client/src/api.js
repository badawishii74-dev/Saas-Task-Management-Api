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

// Auth
export const registerUser = (name, email, password) =>
    fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, email, password }),
    }).then(handleResponse);

export const loginUser = (email, password) =>
    fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
    }).then(handleResponse);

// Tasks
export const fetchTasks = () =>
    fetch(`${BASE_URL}/tasks`, { headers: getHeaders() }).then(handleResponse);

export const fetchTaskById = (id) =>
    fetch(`${BASE_URL}/tasks/${id}`, { headers: getHeaders() }).then(handleResponse);

export const createTask = (title, description) =>
    fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ title, description }),
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
