import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

import { apiFetch } from '../../lib/api';

export default function AdminPlansPage({ category = 'library' }) {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editSeats, setEditSeats] = useState('');
  const [error, setError] = useState(null);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('access');
      const res = await apiFetch('http://localhost:8000/api/bookings/admin-plans/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSavePrice = async (id) => {
    setError(null);
    const planToEdit = plans.find(p => p.id === id);
    if (!planToEdit) return;

    const numPrice = parseFloat(editPrice);
    if (isNaN(numPrice) || numPrice < 0) {
      setError("Please enter a valid positive price.");
      return;
    }

    const maxPrice = planToEdit.workspace_type === 'library' ? 5000 : 30000;
    if (numPrice > maxPrice) {
      setError(`Price for ${planToEdit.workspace_type} cannot exceed ₹${maxPrice.toLocaleString('en-IN')}.`);
      return;
    }

    try {
      const token = localStorage.getItem('access');
      const res = await apiFetch(`http://localhost:8000/api/bookings/admin-plans/${id}/`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          monthly_price: editPrice,
          total_seats: editSeats
        })
      });
      if (res.ok) {
        setEditingPlan(null);
        fetchPlans();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter by category
  const filteredPlans = plans.filter(plan => {
    if (category === 'library') {
      return plan.workspace_type === 'library';
    } else {
      return plan.workspace_type !== 'library';
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {category === 'library' ? 'Library Plans' : 'Coworking Plans'}
        </h1>
        <p className="text-sm text-text-main/50">Manage subscription packages and their base monthly prices.</p>
      </div>

      <Card className="bg-surface border-border-main">
        <CardHeader>
          <CardTitle className="text-lg">Subscription Packages</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center">Loading plans...</div>
          ) : (
            <div className="space-y-4">
              {filteredPlans.map((plan) => (
                <div key={plan.id} className="p-4 border border-border-main rounded-lg bg-black/5 dark:bg-white/[0.02] flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-text-main">{plan.name}</h3>
                      <Badge variant="outline" className="text-[10px] py-0">{plan.workspace_type.toUpperCase()}</Badge>
                      {!plan.is_active && <Badge variant="destructive" className="text-[10px] py-0 bg-red-500/20 text-red-500">Inactive</Badge>}
                    </div>
                    <p className="text-sm text-text-main/50">{plan.description}</p>
                  </div>
                  
                    <div className="flex items-center gap-4">
                    {editingPlan === plan.id ? (
                      <div className="flex flex-col items-end gap-2">
                        {error && <p className="text-xs text-red-500 mr-2">{error}</p>}
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-text-main/50 uppercase tracking-wider">Price (₹)</label>
                            <Input 
                              type="number" 
                              value={editPrice} 
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-24 h-9 bg-black/5 dark:bg-black/20 border-border-main"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-text-main/50 uppercase tracking-wider">Total Seats</label>
                          <Input 
                            type="number" 
                            value={editSeats} 
                            onChange={(e) => setEditSeats(e.target.value)}
                            className="w-20 h-9 bg-black/5 dark:bg-black/20 border-border-main"
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                          <Button size="sm" onClick={() => handleSavePrice(plan.id)}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => { setEditingPlan(null); setError(null); }}>Cancel</Button>
                        </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold">₹{parseFloat(plan.monthly_price).toLocaleString('en-IN')}</p>
                          <p className="text-[10px] text-text-main/40 uppercase tracking-wider">Per Month</p>
                        </div>
                        <div className="text-right border-l border-border-main pl-4">
                          <p className="text-lg font-bold">{plan.total_seats}</p>
                          <p className="text-[10px] text-text-main/40 uppercase tracking-wider">Capacity</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => { 
                          setEditingPlan(plan.id); 
                          setEditPrice(plan.monthly_price); 
                          setEditSeats(plan.total_seats);
                          setError(null);
                        }}>
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
