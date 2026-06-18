export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'admin';
  course: string | null;
  avatar: string | null;
  created_at: string;
}

export interface Video {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  url: string;
  thumbnail: string | null;
  duration_seconds: number | null;
  is_active: boolean;
  order: number;
  created_by: number;
}

export interface MapPoint {
  id: number;
  name: string;
  description: string | null;
  type: 'quiet_zone' | 'rest_point' | 'building' | 'service';
  latitude: number;
  longitude: number;
  floor: string | null;
  is_active: boolean;
  created_by: number;
}

export interface EmailTemplate {
  id: number;
  title: string;
  category: 'professor' | 'group' | 'coordination' | 'other';
  subject: string;
  body: string;
  is_active: boolean;
  order: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export interface DashboardStats {
  total_users: number;
  total_videos: number;
  total_map_points: number;
  total_email_templates: number;
  recent_users: User[];
}
