import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CheckCircle2, Circle, Clock, Mail, Phone, Calendar } from 'lucide-react';
import { useSearch } from '../../contexts/SearchContext';
import { Button } from '../../components/ui/Button';

import { apiFetch } from '../../lib/api';

export default function AdminContactQueriesPage() {
  const [queries, setQueries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { searchQuery } = useSearch();

  const fetchQueries = async () => {
    try {
      const token = localStorage.getItem('access');
      const res = await apiFetch('http://localhost:8000/api/bookings/admin-contact/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQueries(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleResolve = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('access');
      const res = await apiFetch(`http://localhost:8000/api/bookings/admin-contact/${id}/`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_resolved: !currentStatus })
      });
      if (res.ok) {
        fetchQueries();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredQueries = queries.filter(q => {
    const search = (searchQuery || '').toLowerCase();
    return q.name.toLowerCase().includes(search) || 
           q.email.toLowerCase().includes(search) || 
           q.subject.toLowerCase().includes(search);
  });

  const resolvedQueries = filteredQueries.filter(q => q.is_resolved);
  const newQueries = filteredQueries.filter(q => !q.is_resolved);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contact Queries</h1>
        <p className="text-sm text-text-main/50">Manage and respond to user inquiries from the contact page.</p>
      </div>

      {isLoading ? (
        <div className="py-10 text-center">Loading queries...</div>
      ) : (
        <div className="space-y-8">
          
          {/* New Queries */}
          <Card className="bg-surface border-border-main">
            <CardHeader className="border-b border-border-main bg-black/5 dark:bg-white/[0.02]">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Circle size={18} className="text-primary" /> New Inquiries
                </span>
                <Badge variant="primary">{newQueries.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {newQueries.length === 0 ? (
                <div className="py-8 text-center text-text-main/50 text-sm">No new inquiries.</div>
              ) : (
                <div className="divide-y divide-border-main">
                  {newQueries.map(query => (
                    <div key={query.id} className="p-6 transition-colors hover:bg-black/5 dark:hover:bg-white/[0.02]">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-text-main mb-1">{query.subject}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-text-main/60">
                            <span className="flex items-center gap-1.5 font-medium"><Mail size={12} /> {query.name} ({query.email})</span>
                            {query.phone && <span className="flex items-center gap-1.5"><Phone size={12} /> {query.phone}</span>}
                            <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(query.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleResolve(query.id, query.is_resolved)}
                          className="shrink-0"
                        >
                          <CheckCircle2 size={14} className="mr-2 text-success" /> Mark Resolved
                        </Button>
                      </div>
                      <div className="bg-black/5 dark:bg-black/20 p-4 rounded-md border border-border-main/50 text-sm text-text-main/80 whitespace-pre-wrap">
                        {query.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resolved Queries */}
          <Card className="bg-surface border-border-main">
            <CardHeader className="border-b border-border-main bg-black/5 dark:bg-white/[0.02]">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-success" /> Resolved Inquiries
                </span>
                <Badge variant="outline">{resolvedQueries.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {resolvedQueries.length === 0 ? (
                <div className="py-8 text-center text-text-main/50 text-sm">No resolved inquiries yet.</div>
              ) : (
                <div className="divide-y divide-border-main">
                  {resolvedQueries.map(query => (
                    <div key={query.id} className="p-6 transition-colors hover:bg-black/5 dark:hover:bg-white/[0.02] opacity-75 hover:opacity-100">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-text-main mb-1 line-through decoration-text-main/30">{query.subject}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-text-main/60">
                            <span className="flex items-center gap-1.5 font-medium"><Mail size={12} /> {query.name} ({query.email})</span>
                            {query.phone && <span className="flex items-center gap-1.5"><Phone size={12} /> {query.phone}</span>}
                            <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(query.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleResolve(query.id, query.is_resolved)}
                          className="shrink-0 text-text-main/50 hover:text-text-main"
                        >
                          <Clock size={14} className="mr-2" /> Reopen
                        </Button>
                      </div>
                      <div className="bg-black/5 dark:bg-black/20 p-4 rounded-md border border-border-main/50 text-sm text-text-main/70 whitespace-pre-wrap">
                        {query.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}
