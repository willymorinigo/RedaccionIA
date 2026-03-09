export interface Branding {
  logoUrl?: string;
  primaryColor?: string;
  bgColor?: string;
}

export interface User {
  username: string;
  dailyLimit: number;
  usage: number;
  newsroom?: string;
  branding?: Branding;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  icon: string;
  role: string;
  instruction: string;
  rules: string[];
  fields: {
    label: string;
    name: string;
    placeholder: string;
    type: "text" | "textarea" | "select";
    options?: string[];
  }[];
}

export interface TaskResult {
  taskId: string;
  input: any;
  output: string;
  timestamp: number;
}
