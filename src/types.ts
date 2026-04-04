export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  completedLessons: string[];
  totalPoints: number;
  lastActive: string;
}

export interface Lesson {
  id: string;
  title: string;
  category: string;
  content: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}
