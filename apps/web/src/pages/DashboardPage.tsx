import { useAuth } from "../auth/useAuth";

export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>Logged in as: {user?.email}</p>

      <button
        onClick={async () => {
          await logout();
          // RequireAuth will redirect to /login
        }}
      >
        Logout
      </button>
    </div>
  );
}