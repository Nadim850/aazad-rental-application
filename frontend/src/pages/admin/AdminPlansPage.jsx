import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";

import { apiFetch } from "../../lib/api";

import { toast } from "react-hot-toast";

export default function AdminPlansPage({ category = "library" }) {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [editPrice3M, setEditPrice3M] = useState("");
  const [editPrice6M, setEditPrice6M] = useState("");
  const [editPrice1Y, setEditPrice1Y] = useState("");
  const [editSeats, setEditSeats] = useState("");
  const [editTimings, setEditTimings] = useState("");
  const [error, setError] = useState(null);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem("access");
      const res = await apiFetch(
        `${import.meta.env.VITE_API_URL}/api/bookings/admin-plans/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
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
    const planToEdit = plans.find((p) => p.id === id);
    if (!planToEdit) return;

    const numPrice = parseFloat(editPrice);
    if (isNaN(numPrice) || numPrice < 0) {
      setError("Please enter a valid positive price.");
      toast.error("Invalid price value");
      return;
    }

    const maxPrice = planToEdit.workspace_type === "library" ? 5000 : 30000;
    if (numPrice > maxPrice) {
      setError(
        `Price for ${planToEdit.workspace_type} cannot exceed ₹${maxPrice.toLocaleString("en-IN")}.`,
      );
      toast.error("Price exceeds maximum allowed");
      return;
    }

    const loadingToast = toast.loading("Saving changes...");

    try {
      const token = localStorage.getItem("access");
      const res = await apiFetch(
        `${import.meta.env.VITE_API_URL}/api/bookings/admin-plans/${id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            monthly_price: editPrice,
            price_3_months: editPrice3M || null,
            price_6_months: editPrice6M || null,
            price_1_year: editPrice1Y || null,
            total_seats: editSeats,
            access_hours: editTimings || '9 AM - 9 PM',
          }),
        },
      );
      if (res.ok) {
        setEditingPlan(null);
        toast.success("Plan updated successfully!", { id: loadingToast });
        fetchPlans();
      } else {
        toast.error("Failed to update plan", { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred", { id: loadingToast });
    }
  };

  // Filter by category
  const filteredPlans = plans.filter((plan) => {
    if (category === "library") {
      return plan.workspace_type === "library";
    } else {
      return plan.workspace_type !== "library";
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {category === "library" ? "Library Plans" : "Coworking Plans"}
        </h1>
        <p className="text-sm text-text-main/50">
          Manage subscription packages and their base monthly prices.
        </p>
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
                <div
                  key={plan.id}
                  className={`p-5 border border-border-main rounded-lg bg-black/5 dark:bg-white/[0.02] flex transition-all ${
                    editingPlan === plan.id
                      ? "flex-col items-stretch gap-4 shadow-sm"
                      : "items-center justify-between"
                  }`}
                >
                  <div className={editingPlan === plan.id ? "w-full" : "flex-1"}>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-text-main">
                        {plan.name}
                      </h3>
                      <Badge variant="outline" className="text-[10px] py-0">
                        {plan.workspace_type.toUpperCase()}
                      </Badge>
                      {!plan.is_active && (
                        <Badge
                          variant="destructive"
                          className="text-[10px] py-0 bg-red-500/20 text-red-500"
                        >
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-text-main/50">
                      {plan.description}
                    </p>
                  </div>

                  {editingPlan === plan.id ? (
                    <div className="flex flex-col gap-4 w-full pt-4 border-t border-border-main/20">
                      {error && (
                        <p className="text-sm font-medium text-red-500 bg-red-500/10 p-2 rounded-md border border-red-500/20">{error}</p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-text-main/50 uppercase tracking-wider">
                            Monthly Price
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-main/50 text-sm">₹</span>
                            <Input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="pl-7 bg-black/5 dark:bg-black/20 border-border-main"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-text-main/50 uppercase tracking-wider">
                            3-Mo Price
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-main/50 text-sm">₹</span>
                            <Input
                              type="number"
                              value={editPrice3M || ""}
                              onChange={(e) => setEditPrice3M(e.target.value)}
                              placeholder="Auto"
                              className="pl-7 bg-black/5 dark:bg-black/20 border-border-main"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-text-main/50 uppercase tracking-wider">
                            6-Mo Price
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-main/50 text-sm">₹</span>
                            <Input
                              type="number"
                              value={editPrice6M || ""}
                              onChange={(e) => setEditPrice6M(e.target.value)}
                              placeholder="Auto"
                              className="pl-7 bg-black/5 dark:bg-black/20 border-border-main"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-text-main/50 uppercase tracking-wider">
                            1-Yr Price
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-main/50 text-sm">₹</span>
                            <Input
                              type="number"
                              value={editPrice1Y || ""}
                              onChange={(e) => setEditPrice1Y(e.target.value)}
                              placeholder="Auto"
                              className="pl-7 bg-black/5 dark:bg-black/20 border-border-main"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-text-main/50 uppercase tracking-wider">
                            Total Seats
                          </label>
                          <Input
                            type="number"
                            value={editSeats}
                            onChange={(e) => setEditSeats(e.target.value)}
                            className="bg-black/5 dark:bg-black/20 border-border-main"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-text-main/50 uppercase tracking-wider">
                            Access Hours
                          </label>
                          <Input
                            type="text"
                            value={editTimings}
                            onChange={(e) => setEditTimings(e.target.value)}
                            placeholder="e.g. 9 AM - 9 PM"
                            className="bg-black/5 dark:bg-black/20 border-border-main"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border-main/20">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setEditingPlan(null);
                            setError(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button onClick={() => handleSavePrice(plan.id)}>
                          Save Changes
                        </Button>
                      </div>
                    </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            ₹
                            {parseFloat(plan.monthly_price).toLocaleString(
                              "en-IN",
                            )}
                          </p>
                          <p className="text-[10px] text-text-main/40 uppercase tracking-wider">
                            Per Month
                          </p>
                        </div>
                        <div className="text-right border-l border-border-main pl-4">
                          <p className="text-lg font-bold">
                            {plan.total_seats}
                          </p>
                          <p className="text-[10px] text-text-main/40 uppercase tracking-wider">
                            Capacity
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingPlan(plan.id);
                            setEditPrice(plan.monthly_price);
                            setEditPrice3M(plan.price_3_months || "");
                            setEditPrice6M(plan.price_6_months || "");
                            setEditPrice1Y(plan.price_1_year || "");
                            setEditSeats(plan.total_seats);
                            setEditTimings(plan.access_hours || "");
                            setError(null);
                          }}
                        >
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
