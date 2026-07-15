export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  created_at: string;
};

export type AuthCredentials = {
  email: string;
  password: string;
};
