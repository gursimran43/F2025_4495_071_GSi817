const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: any[];
}

interface AuthData {
    user: {
        id: string;
        email: string;
        name?: string;
        onboardingComplete?: boolean;
        lastLogin?: Date;
    };
    token: string;
}

interface OnboardingData {
    name: string;
    email: string;
    profession: string;
    experience: string;
    industry: string;
    goals: string;
    timeline: string;
    currentSkills: string;
    learningStyle: string;
    weeklyHours: string;
    motivation: string;
}

interface Task {
    _id?: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
    estimatedDuration?: string;
    percentage?: number;
    completed?: boolean;
    aiGenerated?: boolean;
}

interface Recommendation {
    _id?: string;
    title: string;
    description: string;
    type: 'course' | 'project' | 'certification' | 'network';
    relevance: string;
    aiGenerated?: boolean;
    dismissed?: boolean;
    clicked?: boolean;
    generatedAt?: Date;
}

interface Experience {
    company: string;
    position: string;
    duration: string;
    description: string;
}

interface Education {
    school: string;
    degree: string;
    year: string;
}

interface Resume {
    _id?: string;
    personalInfo: {
        name: string;
        email: string;
        phone?: string;
        location?: string;
        summary?: string;
    };
    experiences: Experience[];
    education: Education[];
    skills: string;
    template: 'modern' | 'classic' | 'creative';
    isPublic?: boolean;
}

class ApiService {
    private getHeaders(includeAuth = false): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (includeAuth) {
            const token = localStorage.getItem('token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    async signup(email: string, password: string, name?: string): Promise<ApiResponse<AuthData>> {
        const response = await fetch(`${API_URL}/api/auth/signup`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ email, password, name }),
        });

        return response.json();
    }

    async login(email: string, password: string): Promise<ApiResponse<AuthData>> {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ email, password }),
        });

        return response.json();
    }

    async verifyOtp(data: {
        email: string;
        password: string;
        name?: string;
        phoneNumber: string;
        firebaseToken: string;
        mode: 'signup' | 'login';
    }): Promise<ApiResponse<AuthData>> {
        const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });

        return response.json();
    }

    async getMe(): Promise<ApiResponse<{ user: AuthData['user'] }>> {
        const response = await fetch(`${API_URL}/api/auth/me`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        return response.json();
    }

    async updateProfile(data: { name?: string; onboardingComplete?: boolean }): Promise<ApiResponse<{ user: AuthData['user'] }>> {
        const response = await fetch(`${API_URL}/api/auth/profile`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify(data),
        });

        return response.json();
    }

    // Onboarding APIs
    async saveOnboarding(data: Partial<OnboardingData>): Promise<ApiResponse<{ onboarding: OnboardingData }>> {
        const response = await fetch(`${API_URL}/api/onboarding`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(data),
        });

        return response.json();
    }

    async getOnboarding(): Promise<ApiResponse<{ onboarding: OnboardingData }>> {
        const response = await fetch(`${API_URL}/api/onboarding`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        return response.json();
    }

    async completeOnboarding(data: OnboardingData): Promise<ApiResponse<{
        onboarding: OnboardingData;
        tasks: Task[];
        recommendations: Recommendation[];
        stats: any;
    }>> {
        const response = await fetch(`${API_URL}/api/onboarding/complete`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(data),
        });

        return response.json();
    }

    // Task APIs
    async getTasks(filters?: { completed?: boolean; priority?: string; category?: string }): Promise<ApiResponse<{
        tasks: Task[];
        stats: {
            total: number;
            completed: number;
            pending: number;
            completionRate: number;
            priorityStats: { high: number; medium: number; low: number };
        };
    }>> {
        const queryParams = new URLSearchParams();
        if (filters?.completed !== undefined) queryParams.append('completed', String(filters.completed));
        if (filters?.priority) queryParams.append('priority', filters.priority);
        if (filters?.category) queryParams.append('category', filters.category);

        const url = queryParams.toString()
            ? `${API_URL}/api/tasks?${queryParams}`
            : `${API_URL}/api/tasks`;

        const response = await fetch(url, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        return response.json();
    }

    async getTask(id: string): Promise<ApiResponse<{ task: Task }>> {
        const response = await fetch(`${API_URL}/api/tasks/${id}`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        return response.json();
    }

    async createTask(task: Omit<Task, '_id'>): Promise<ApiResponse<{ task: Task }>> {
        const response = await fetch(`${API_URL}/api/tasks`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(task),
        });

        return response.json();
    }

    async updateTask(id: string, updates: Partial<Task>): Promise<ApiResponse<{ task: Task }>> {
        const response = await fetch(`${API_URL}/api/tasks/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify(updates),
        });

        return response.json();
    }

    async updateTaskProgress(id: string, percentage: number): Promise<ApiResponse<{ task: Task }>> {
        const response = await fetch(`${API_URL}/api/tasks/${id}/progress`, {
            method: 'PATCH',
            headers: this.getHeaders(true),
            body: JSON.stringify({ percentage }),
        });

        return response.json();
    }

    async toggleTaskCompletion(id: string): Promise<ApiResponse<{ task: Task }>> {
        const response = await fetch(`${API_URL}/api/tasks/${id}/toggle`, {
            method: 'PATCH',
            headers: this.getHeaders(true),
        });

        return response.json();
    }

    async toggleSubtaskCompletion(taskId: string, subtaskIndex: number): Promise<ApiResponse<{ task: Task }>> {
        const response = await fetch(`${API_URL}/api/tasks/${taskId}/subtasks/${subtaskIndex}/toggle`, {
            method: 'PATCH',
            headers: this.getHeaders(true),
        });

        return response.json();
    }

    async deleteTask(id: string): Promise<ApiResponse<void>> {
        const response = await fetch(`${API_URL}/api/tasks/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        });

        return response.json();
    }

    async enhanceTask(id: string): Promise<ApiResponse<{ task: Task }>> {
        const response = await fetch(`${API_URL}/api/tasks/${id}/enhance`, {
            method: 'PATCH',
            headers: this.getHeaders(true),
        });

        return response.json();
    }

    async getTaskCategories(): Promise<ApiResponse<{ categories: string[] }>> {
        const response = await fetch(`${API_URL}/api/tasks/categories`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        return response.json();
    }

    // Recommendation APIs
    async getRecommendations(filters?: { type?: string; dismissed?: boolean }): Promise<ApiResponse<{
        recommendations: Recommendation[];
        stats: {
            total: number;
            byType: { course: number; project: number; certification: number; network: number };
            dismissed: number;
            clicked: number;
        };
    }>> {
        const queryParams = new URLSearchParams();
        if (filters?.type) queryParams.append('type', filters.type);
        if (filters?.dismissed !== undefined) queryParams.append('dismissed', String(filters.dismissed));

        const url = queryParams.toString()
            ? `${API_URL}/api/recommendations?${queryParams}`
            : `${API_URL}/api/recommendations`;

        const response = await fetch(url, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        return response.json();
    }

    async getRecommendation(id: string): Promise<ApiResponse<{ recommendation: Recommendation }>> {
        const response = await fetch(`${API_URL}/api/recommendations/${id}`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        return response.json();
    }

    async createRecommendation(data: Omit<Recommendation, '_id' | 'aiGenerated' | 'dismissed' | 'clicked'>): Promise<ApiResponse<{ recommendation: Recommendation }>> {
        const response = await fetch(`${API_URL}/api/recommendations`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(data),
        });

        return response.json();
    }

    async clickRecommendation(id: string): Promise<ApiResponse<{ recommendation: Recommendation }>> {
        const response = await fetch(`${API_URL}/api/recommendations/${id}/click`, {
            method: 'PATCH',
            headers: this.getHeaders(true),
        });

        return response.json();
    }

    async dismissRecommendation(id: string): Promise<ApiResponse<{ recommendation: Recommendation }>> {
        const response = await fetch(`${API_URL}/api/recommendations/${id}/dismiss`, {
            method: 'PATCH',
            headers: this.getHeaders(true),
        });

        return response.json();
    }

    async deleteRecommendation(id: string): Promise<ApiResponse<void>> {
        const response = await fetch(`${API_URL}/api/recommendations/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        });

        return response.json();
    }

    // Resume APIs
    async getResumes(): Promise<ApiResponse<{ resumes: Resume[]; count: number }>> {
        const response = await fetch(`${API_URL}/api/resumes`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        return response.json();
    }

    async getResume(id: string): Promise<ApiResponse<{ resume: Resume }>> {
        const response = await fetch(`${API_URL}/api/resumes/${id}`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        return response.json();
    }

    async createResume(data: Omit<Resume, '_id'>): Promise<ApiResponse<{ resume: Resume }>> {
        const response = await fetch(`${API_URL}/api/resumes`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(data),
        });

        return response.json();
    }

    async updateResume(id: string, data: Partial<Resume>): Promise<ApiResponse<{ resume: Resume }>> {
        const response = await fetch(`${API_URL}/api/resumes/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify(data),
        });

        return response.json();
    }

    async deleteResume(id: string): Promise<ApiResponse<void>> {
        const response = await fetch(`${API_URL}/api/resumes/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        });

        return response.json();
    }

    async toggleResumePublic(id: string): Promise<ApiResponse<{ resume: Resume }>> {
        const response = await fetch(`${API_URL}/api/resumes/${id}/toggle-public`, {
            method: 'PATCH',
            headers: this.getHeaders(true),
        });

        return response.json();
    }

    async generateResumeWithAI(): Promise<ApiResponse<{ resumeContent: Omit<Resume, '_id' | 'template'> }>> {
        const response = await fetch(`${API_URL}/api/resumes/generate-ai`, {
            method: 'POST',
            headers: this.getHeaders(true),
        });

        return response.json();
    }

    async enhanceResumeWithAI(resumeData: {
        personalInfo: Resume['personalInfo'];
        experiences: Experience[];
        education: Education[];
        skills: string;
        jobDescription: string;
    }): Promise<ApiResponse<{ enhancedResume: Omit<Resume, '_id' | 'template'> }>> {
        const response = await fetch(`${API_URL}/api/resumes/enhance-ai`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(resumeData),
        });

        return response.json();
    }

    // Analytics
    async getAnalytics(): Promise<ApiResponse<{
        overview: {
            totalTasks: number;
            completedTasks: number;
            pendingTasks: number;
            completionRate: number;
            currentStreak: number;
        };
        progressData: Array<{
            month: string;
            progress: number;
            tasksCompleted: number;
            hoursSpent: number;
        }>;
        weeklyActivity: Array<{
            day: string;
            hours: number;
            tasks: number;
        }>;
        categoryData: Array<{
            name: string;
            value: number;
        }>;
        skillsData: Array<{
            skill: string;
            current: number;
            target: number;
        }>;
    }>> {
        const response = await fetch(`${API_URL}/api/analytics`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        return response.json();
    }

    // Interview APIs
    async checkInterviewAvailability(): Promise<ApiResponse<{
        canStartInterview: boolean;
        completedTasksCount: number;
        message: string;
    }>> {
        const response = await fetch(`${API_URL}/api/interview/check-availability`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        return response.json();
    }

    async startInterview(): Promise<ApiResponse<{
        sessionId: string;
        questions: Array<{
            question: string;
            type: 'mcq' | 'short';
            options?: string[];
            category: string;
            relatedTask: string;
        }>;
    }>> {
        const response = await fetch(`${API_URL}/api/interview/start`, {
            method: 'POST',
            headers: this.getHeaders(true),
        });

        return response.json();
    }

    async submitInterviewAnswers(sessionId: string, answers: Array<{
        questionIndex: number;
        userAnswer: string;
    }>): Promise<ApiResponse<{
        sessionId: string;
        totalScore: number;
        answers: Array<{
            questionIndex: number;
            userAnswer: string;
            isCorrect: boolean;
            score: number;
            feedback: string;
        }>;
        questions: Array<{
            question: string;
            type: 'mcq' | 'short';
            options?: string[];
            correctAnswer?: string;
            expectedKeywords?: string[];
            category: string;
            relatedTask: string;
        }>;
    }>> {
        const response = await fetch(`${API_URL}/api/interview/${sessionId}/submit`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify({ answers }),
        });

        return response.json();
    }

    async getInterviewHistory(): Promise<ApiResponse<{
        sessions: Array<{
            id: string;
            status: 'in_progress' | 'completed';
            totalScore?: number;
            questionCount: number;
            completedAt?: Date;
            createdAt: Date;
        }>;
        stats: {
            totalAttempts: number;
            completedAttempts: number;
            averageScore: number;
            bestScore: number;
        };
    }>> {
        const response = await fetch(`${API_URL}/api/interview/history`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        return response.json();
    }

    async getInterviewResults(sessionId: string): Promise<ApiResponse<{
        session: {
            id: string;
            status: 'in_progress' | 'completed';
            totalScore?: number;
            completedAt?: Date;
            questions: Array<{
                question: string;
                type: 'mcq' | 'short';
                options?: string[];
                correctAnswer?: string;
                expectedKeywords?: string[];
                category: string;
                relatedTask: string;
            }>;
            answers: Array<{
                questionIndex: number;
                userAnswer: string;
                isCorrect: boolean;
                score: number;
                feedback: string;
            }>;
        };
    }>> {
        const response = await fetch(`${API_URL}/api/interview/${sessionId}/results`, {
            method: 'GET',
            headers: this.getHeaders(true),
        });

        return response.json();
    }
}

export const api = new ApiService();
export type { ApiResponse, AuthData, OnboardingData, Task, Recommendation, Resume, Experience, Education };
