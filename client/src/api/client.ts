import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface FeedPost {
  id: string;
  createdAt: string;
  text: string;
  rationale: string;
  sources: Array<{ title: string; url: string }>;
  score?: number;
}

export interface FeedResponse {
  posts: FeedPost[];
  totalPosts?: number;
  lastPublishedAt?: string | null;
  nextScheduledRun?: string;
  currentPersona?: {
    name: string;
    title: string;
    voice: string;
  };
}

export const fetchAgentFeed = async (agentId?: string): Promise<FeedResponse> => {
  const params = agentId ? { agentId } : {};
  const response = await api.get<FeedResponse>('/agent/feed', { params });
  return response.data;
};

export const initAgent = async (): Promise<{ agentId: string }> => {
  const response = await api.post<{ agentId: string }>('/agent/init');
  return response.data;
};

export const triggerPipelineRun = async (): Promise<any> => {
  const response = await api.post('/pipeline/run');
  return response.data;
};

export const fetchAnalyticsOverview = async (): Promise<any> => {
  try {
    const response = await api.get('/analytics/overview');
    return response.data;
  } catch (e) {
    return null;
  }
};

export default api;
