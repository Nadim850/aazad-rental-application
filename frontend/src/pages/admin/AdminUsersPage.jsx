import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('access');
        const res = await fetch('http://localhost:8000/api/accounts/users/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users Management</h1>
        <p className="text-sm text-text-main/50">Manage registered users and their subscriptions.</p>
      </div>

      <Card className="bg-surface border-border-main">
        <CardHeader>
          <CardTitle className="text-lg">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-text-main/50 uppercase border-b border-border-main bg-black/5 dark:bg-white/[0.02]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border-main hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-medium">{user.first_name} {user.last_name}</td>
                      <td className="px-4 py-3 text-text-main/70">{user.email}</td>
                      <td className="px-4 py-3 text-text-main/70">{user.phone_number || '-'}</td>
                      <td className="px-4 py-3">
                        {user.is_superuser ? (
                          <Badge variant="primary" className="bg-primary/20 text-primary border-primary/20">Admin</Badge>
                        ) : (
                          <Badge variant="outline" className="border-border-main text-text-main/60">User</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-text-main/50">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
