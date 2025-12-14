import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.100:4005';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (phoneNumber: string, password: string) =>
    apiClient.post('/api/auth/login', { phoneNumber, password }),

  register: (name: string, email: string, password: string) =>
    apiClient.post('/api/auth/register', { name, email, password }),

  getProfile: () =>
    apiClient.get('/api/auth/profile'),

  updateProfile: (data: { name?: string; email?: string }) =>
    apiClient.put('/api/auth/profile', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.put('/api/auth/change-password', { currentPassword, newPassword }),
};

// Users APIs
export const usersAPI = {
  getAll: () =>
    apiClient.get('/api/users'),

  getById: (id: string) =>
    apiClient.get(`/api/users/${id}`),

  update: (id: string, data: {
    name?: string;
    phoneNumber?: string;
    role?: 'user' | 'admin';
    points?: number;
  }) =>
    apiClient.put(`/api/users/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/api/users/${id}`),

  getPoints: (id: string) =>
    apiClient.get(`/api/users/${id}/points`),

  getLeaderboard: (limit?: number) =>
    apiClient.get(`/api/users/leaderboard${limit ? `?limit=${limit}` : ''}`),
};

// Categories APIs
export const categoriesAPI = {
  getAll: () =>
    apiClient.get('/api/categories'),

  getById: (id: string) =>
    apiClient.get(`/api/categories/${id}`),

  create: (data: { name: string }) =>
    apiClient.post('/api/categories', data),

  update: (id: string, data: { name?: string }) =>
    apiClient.put(`/api/categories/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/api/categories/${id}`),
};

// Articles APIs
export const articlesAPI = {
  getAll: () =>
    apiClient.get('/api/articles'),

  getById: (id: string) =>
    apiClient.get(`/api/articles/${id}`),

  getByCategory: (categoryId: string) =>
    apiClient.get(`/api/articles/category/${categoryId}`),

  create: (data: {
    title: string;
    content: string;
    categoryId: string;
    author: string;
    source: string
  }) =>
    apiClient.post('/api/articles', data),

  update: (id: string, data: {
    title?: string;
    content?: string;
    categoryId?: string;
    author?: string;
    source?: string
  }) =>
    apiClient.put(`/api/articles/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/api/articles/${id}`),

  markAsRead: (id: string) =>
    apiClient.post(`/api/articles/${id}/read`),
};

// Surveys APIs
export const surveysAPI = {
  getAll: () =>
    apiClient.get('/api/surveys'),

  getById: (id: string) =>
    apiClient.get(`/api/surveys/${id}`),

  getByArticleId: (articleId: string) =>
    apiClient.get(`/api/surveys/article/${articleId}`),

  create: (data: {
    title: string;
    articleId: string;
    questions: Array<{
      questionText: string;
      options: Array<{ optionText: string; isCorrect: boolean }>;
    }>;
  }) =>
    apiClient.post('/api/surveys', data),

  update: (id: string, data: {
    title?: string;
    articleId?: string;
    questions?: Array<{
      questionText: string;
      options: Array<{ optionText: string; isCorrect: boolean }>;
    }>;
  }) =>
    apiClient.put(`/api/surveys/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/api/surveys/${id}`),

  submit: (id: string, answers: Array<{ questionId: string; optionId: string }>) =>
    apiClient.post(`/api/surveys/${id}/submit`, { answers }),
};

// Games APIs
export const gamesAPI = {
  getAll: (type?: string) =>
    apiClient.get(`/api/games${type ? `?type=${type}` : ''}`),

  getById: (id: string) =>
    apiClient.get(`/api/games/${id}`),

  create: (data: {
    type: 'crossword' | 'puzzle';
    title: string;
    content: any;
    educationalMessage?: string;
    pointsReward?: number;
  } | FormData) => {
    // Check if data is FormData (for puzzle with image upload)
    if (data instanceof FormData) {
      return apiClient.post('/api/games', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return apiClient.post('/api/games', data);
  },

  update: (id: string, data: {
    type?: 'crossword' | 'puzzle';
    title?: string;
    content?: any;
    educationalMessage?: string;
    pointsReward?: number;
  } | FormData) => {
    // Check if data is FormData (for puzzle with image upload)
    if (data instanceof FormData) {
      return apiClient.put(`/api/games/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return apiClient.put(`/api/games/${id}`, data);
  },

  delete: (id: string) =>
    apiClient.delete(`/api/games/${id}`),

  complete: (id: string) =>
    apiClient.post(`/api/games/${id}/complete`),

  getUserHistory: () =>
    apiClient.get('/api/games/user/history'),
};

// Polls APIs
export const pollsAPI = {
  getAll: () =>
    apiClient.get('/api/polls'),

  getById: (id: string) =>
    apiClient.get(`/api/polls/${id}`),

  create: (data: {
    title: string;
    description?: string;
    pointsReward?: number;
    startDate?: string;
    expiryDate?: string;
    options: string[];
  }) =>
    apiClient.post('/api/polls', data),

  update: (id: string, data: {
    title?: string;
    description?: string;
    pointsReward?: number;
    startDate?: string;
    expiryDate?: string;
    options?: string[];
  }) =>
    apiClient.put(`/api/polls/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/api/polls/${id}`),

  vote: (id: string, optionId: string) =>
    apiClient.post(`/api/polls/${id}/vote`, { optionId }),

  getResults: (id: string) =>
    apiClient.get(`/api/polls/${id}/results`),
};

// Discussion Sessions APIs
export const discussionsAPI = {
  // Get all sessions (with optional filter for upcoming sessions)
  getAll: (upcoming?: boolean) =>
    apiClient.get(`/api/discussions${upcoming ? '?upcoming=true' : ''}`),

  // Get session by ID
  getById: (id: string) =>
    apiClient.get(`/api/discussions/${id}`),

  // Create new session
  create: (data: {
    title: string;
    description?: string;
    dateTime: string;
    meetLink?: string;
    pointsReward?: number;
  }) =>
    apiClient.post('/api/discussions', data),

  // Update session
  update: (id: string, data: {
    title?: string;
    description?: string;
    dateTime?: string;
    meetLink?: string;
    pointsReward?: number;
  }) =>
    apiClient.put(`/api/discussions/${id}`, data),

  // Delete session
  delete: (id: string) =>
    apiClient.delete(`/api/discussions/${id}`),

  // Mark attendance (user attends the session)
  attend: (id: string) =>
    apiClient.post(`/api/discussions/${id}/attend`),

  // Get attendees list (admin only)
  getAttendees: (id: string) =>
    apiClient.get(`/api/discussions/${id}/attendees`),

  // Add or update Google Meet link (admin only)
  addMeetLink: (id: string, meetLink: string) =>
    apiClient.post(`/api/discussions/${id}/meet-link`, { meetLink }),

  // Get Google Meet link
  getMeetLink: (id: string) =>
    apiClient.get(`/api/discussions/${id}/meet-link`),

  // Session Poll APIs
  // Create poll for session (admin only)
  createPoll: (id: string, data: {
    title: string;
    options: string[];
    endDate: string;
    pointsReward?: number;
  }) =>
    apiClient.post(`/api/discussions/${id}/poll`, data),

  // Get session poll
  getPoll: (id: string) =>
    apiClient.get(`/api/discussions/${id}/poll`),

  // Vote in session poll
  votePoll: (id: string, optionId: string) =>
    apiClient.post(`/api/discussions/${id}/poll/vote`, { optionId }),

  // Get poll results
  getPollResults: (id: string) =>
    apiClient.get(`/api/discussions/${id}/poll/results`),
};

export default apiClient;
