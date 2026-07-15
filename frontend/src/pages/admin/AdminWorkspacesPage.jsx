import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

import { apiFetch } from '../../lib/api';

export default function AdminWorkspacesPage() {
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkspaces = async () => {
    try {
      const token = localStorage.getItem('access');
      const res = await apiFetch('http://localhost:8000/api/bookings/admin-workspaces/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const toggleAvailability = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('access');
      const res = await apiFetch(`http://localhost:8000/api/bookings/admin-workspaces/${id}/`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_available: !currentStatus })
      });
      if (res.ok) {
        fetchWorkspaces();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Workspaces & Seats</h1>
        <p className="text-sm text-text-main/50">Manage availability of desks, library seats, and cabins.</p>
      </div>

      <Card className="bg-surface border-border-main">
        <CardHeader>
          <CardTitle className="text-lg">All Seats</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-text-main/50 uppercase border-b border-border-main bg-black/5 dark:bg-white/[0.02]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Seat ID</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {workspaces.map((ws) => (
                    <tr key={ws.id} className="border-b border-border-main hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-medium">{ws.name}</td>
                      <td className="px-4 py-3 text-text-main/70 capitalize">{ws.workspace_type}</td>
                      <td className="px-4 py-3">
                        {ws.is_available ? (
                          <Badge variant="success" className="bg-success/20 text-success border-success/20">Available</Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-red-500/20 text-red-500 border-red-500/20">Booked</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => toggleAvailability(ws.id, ws.is_available)}
                          className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                        >
                          Mark as {ws.is_available ? 'Booked' : 'Available'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {workspaces.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-text-main/50">No workspaces found. Wait for users to book seats.</td>
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
