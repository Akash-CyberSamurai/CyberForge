export interface Container {
  id: string;
  name: string;
  image_name: string;
  status: string;
  vnc_url?: string;
  ssh_command?: string;
  created_at: string;
  last_activity: string;
  cpu_usage?: number;
  memory_usage_mb?: number;
}

export interface ContainerImage {
  id: string;
  name: string;
  description: string;
  category: string;
  cpu_limit: number;
  memory_limit_mb: number;
  storage_limit_gb: number;
}
