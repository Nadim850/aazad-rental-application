import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { FileText, ArrowRight, Download, Eye } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function InvoicesPage() {
  const navigate = useNavigate();
  const { dashboardData } = useOutletContext();
  
  const paymentHistory = dashboardData?.payment_history || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Invoices & Billing</h1>
          <p className="text-text-main/70">View all your past purchases, receipts, and billing history.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>A complete history of your workspace subscriptions and payments.</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border-main text-text-main/60">
                  <tr>
                    <th className="pb-3 font-medium px-4">Invoice #</th>
                    <th className="pb-3 font-medium px-4">Date</th>
                    <th className="pb-3 font-medium px-4">Workspace</th>
                    <th className="pb-3 font-medium px-4">Amount</th>
                    <th className="pb-3 font-medium px-4">Status</th>
                    <th className="pb-3 font-medium px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main/50">
                  {paymentHistory.map((invoice) => {
                    const invoiceNumber = `INV-${1000 + invoice.id}`;
                    const date = new Date(invoice.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    });
                    const amount = parseFloat(invoice.amount_paid || (invoice.workspace.price_per_hour * 8 * 30)).toFixed(2);
                    const workspaceName = invoice.workspace?.name || "Workspace";
                    const workspaceType = invoice.workspace?.workspace_type || "Plan";

                    return (
                      <tr key={invoice.id} className="hover:bg-surface transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="font-medium">{invoiceNumber}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-text-main/70">{date}</td>
                        <td className="py-4 px-4">
                          <p className="font-medium">{workspaceName}</p>
                          <p className="text-xs text-text-main/50 capitalize">{workspaceType}</p>
                          <p className="text-[10px] text-text-main/40 mt-1">
                            {new Date(invoice.start_time).toLocaleDateString()} - {new Date(invoice.end_time).toLocaleDateString()}
                          </p>
                          <p className="text-[10px] text-text-main/40 mt-0.5">
                            Timings: {invoice.access_hours || "9 AM - 9 PM"}
                          </p>
                        </td>
                        <td className="py-4 px-4 font-medium">₹{amount}</td>
                        <td className="py-4 px-4">
                          <Badge variant="success" className="bg-success/10 text-success border-success/20">Paid</Badge>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-transparent"
                            onClick={() => navigate(`/receipt/${invoice.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" /> View Receipt
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-border-main/20 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-text-main/40" />
              </div>
              <h3 className="text-lg font-medium text-text-main mb-2">No Invoices Found</h3>
              <p className="text-text-main/70">You don't have any billing history yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
