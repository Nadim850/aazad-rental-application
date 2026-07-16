import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useSearch } from '../../contexts/SearchContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

import { apiFetch } from '../../lib/api';

export default function AdminWorkspacesPage() {
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { searchQuery } = useSearch();
  const [expandedSections, setExpandedSections] = useState({
    library: true,
    dedicated: true,
    startup: true,
    cabin: true
  });
  
  // New Workspace Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({
    name: '',
    workspace_type: 'dedicated',
    price_per_hour: ''
  });
  const [addError, setAddError] = useState(null);

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

  const toggleSection = (type) => {
    setExpandedSections(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleAddWorkspace = async (e) => {
    e.preventDefault();
    setAddError(null);
    if (!newWorkspace.name || !newWorkspace.price_per_hour) {
      setAddError('Please provide a name and price.');
      return;
    }

    try {
      const token = localStorage.getItem('access');
      const res = await apiFetch('http://localhost:8000/api/bookings/admin-workspaces/', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newWorkspace,
          is_available: true
        })
      });

      if (res.ok) {
        setNewWorkspace({ name: '', workspace_type: 'dedicated', price_per_hour: '' });
        setIsAdding(false);
        fetchWorkspaces();
      } else {
        const data = await res.json();
        setAddError(data.error || 'Failed to create workspace.');
      }
    } catch (err) {
      setAddError('Network error occurred.');
    }
  };

  // Filter workspaces based on search query
  const filteredWorkspaces = workspaces.filter(ws => {
    const q = (searchQuery || '').toLowerCase();
    return ws.name.toLowerCase().includes(q) || 
           ws.workspace_type.toLowerCase().includes(q);
  });

  // Group by type
  const grouped = filteredWorkspaces.reduce((acc, ws) => {
    if (!acc[ws.workspace_type]) acc[ws.workspace_type] = [];
    acc[ws.workspace_type].push(ws);
    return acc;
  }, {});

  const typeDisplayNames = {
    library: "Library",
    dedicated: "Dedicated Desk",
    startup: "Startup Space",
    cabin: "Private Cabin"
  };

  const types = Object.keys(typeDisplayNames);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workspaces & Seats</h1>
          <p className="text-sm text-text-main/50">Manage availability of desks, library seats, and cabins.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "outline" : "primary"}>
          {isAdding ? 'Cancel' : <><Plus size={16} className="mr-2" /> Add New Seat</>}
        </Button>
      </div>

      {isAdding && (
        <Card className="bg-surface border-border-main p-6">
          <h3 className="text-lg font-semibold mb-4">Create New Workspace</h3>
          {addError && (
            <div className="mb-4 p-3 bg-error/10 text-error border border-error/20 rounded text-sm">
              {addError}
            </div>
          )}
          <form onSubmit={handleAddWorkspace} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-text-main/70 mb-1">Seat Name / ID</label>
              <Input 
                placeholder="e.g. DD-12 or Cabin B" 
                value={newWorkspace.name} 
                onChange={e => setNewWorkspace({...newWorkspace, name: e.target.value})} 
                required 
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-text-main/70 mb-1">Type</label>
              <select 
                className="w-full h-10 px-3 rounded-md bg-transparent border border-border-main text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                value={newWorkspace.workspace_type}
                onChange={e => setNewWorkspace({...newWorkspace, workspace_type: e.target.value})}
              >
                <option value="library" className="bg-background text-text-main">Library</option>
                <option value="dedicated" className="bg-background text-text-main">Dedicated Desk</option>
                <option value="startup" className="bg-background text-text-main">Startup Space</option>
                <option value="cabin" className="bg-background text-text-main">Private Cabin</option>
              </select>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-text-main/70 mb-1">Price (₹/hr)</label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={newWorkspace.price_per_hour} 
                onChange={e => setNewWorkspace({...newWorkspace, price_per_hour: e.target.value})} 
                required 
                min="0"
                step="0.01"
              />
            </div>
            <Button type="submit" className="w-full md:w-auto h-10 px-8">Create</Button>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="py-10 text-center">Loading...</div>
      ) : (
        <div className="space-y-6">
          {filteredWorkspaces.length === 0 && !searchQuery ? (
             <Card className="bg-surface border-border-main py-12">
               <div className="text-center text-text-main/50">No workspaces exist yet.</div>
             </Card>
          ) : (
            types.map((type) => {
              const groupSpaces = grouped[type] || [];
              // If user is searching and this group has no matches, hide it. 
              // Otherwise, always show the empty category container.
              if (searchQuery && groupSpaces.length === 0) return null;

              const total = groupSpaces.length;
              const available = groupSpaces.filter(s => s.is_available).length;
              const occupied = total - available;
              const isExpanded = expandedSections[type];

              return (
                <Card key={type} className="bg-surface border-border-main overflow-hidden shadow-sm">
                  <div 
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors"
                    onClick={() => toggleSection(type)}
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-text-main">{typeDisplayNames[type]}</h3>
                      <div className="flex gap-4 mt-2 text-sm text-text-main/70">
                        <span className="flex items-center gap-1">Total: <Badge variant="outline">{total}</Badge></span>
                        <span className="flex items-center gap-1">Available: <Badge variant="success" className="bg-success/10 text-success border-success/20">{available}</Badge></span>
                        <span className="flex items-center gap-1">Occupied: <Badge variant="destructive" className="bg-error/10 text-error border-error/20">{occupied}</Badge></span>
                      </div>
                    </div>
                    <div className="text-text-main/50 bg-black/5 dark:bg-white/5 p-2 rounded-full">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {isExpanded && groupSpaces.length > 0 && (
                    <div className="border-t border-border-main bg-black/5 dark:bg-white/[0.01]">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-text-main/50 uppercase border-b border-border-main">
                            <tr>
                              <th className="px-6 py-4 font-medium">Seat ID</th>
                              <th className="px-6 py-4 font-medium">Status</th>
                              <th className="px-6 py-4 font-medium text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupSpaces.map((ws) => (
                              <tr key={ws.id} className="border-b border-border-main/50 hover:bg-black/5 dark:hover:bg-white/[0.03] transition-colors last:border-0">
                                <td className="px-6 py-4 font-medium">{ws.name}</td>
                                <td className="px-6 py-4">
                                  {ws.is_available ? (
                                    <span className="flex items-center text-success text-xs font-medium"><span className="w-2 h-2 rounded-full bg-success mr-2"></span> Available</span>
                                  ) : (
                                    <span className="flex items-center text-error text-xs font-medium"><span className="w-2 h-2 rounded-full bg-error mr-2"></span> Occupied</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleAvailability(ws.id, ws.is_available);
                                    }}
                                    className="text-xs font-medium text-primary hover:text-primary-dark transition-colors px-3 py-1.5 rounded-md hover:bg-primary/10"
                                  >
                                    Mark as {ws.is_available ? 'Occupied' : 'Available'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  {isExpanded && groupSpaces.length === 0 && (
                    <div className="border-t border-border-main bg-black/5 dark:bg-white/[0.01] p-6 text-center text-sm text-text-main/50">
                      No seats added for this category yet. Use the "Add New Seat" button above.
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
