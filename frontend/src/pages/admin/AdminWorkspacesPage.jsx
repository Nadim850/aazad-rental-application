import { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { ChevronDown, ChevronUp, Plus, Minus } from "lucide-react";
import { useSearch } from "../../contexts/SearchContext";
import { Button } from "../../components/ui/Button";

import { apiFetch } from "../../lib/api";
import { API_URL } from "../../config";

import { toast } from "react-hot-toast";

export default function AdminWorkspacesPage({ category = "library" }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { searchQuery } = useSearch();
  const [expandedSections, setExpandedSections] = useState({
    library: true,
    dedicated: true,
    startup: true,
    cabin: true,
  });

  const fetchWorkspaces = async () => {
    try {
      const token = localStorage.getItem("access");
      const res = await apiFetch(`${API_URL}/api/bookings/admin-workspaces/`, {
        headers: { Authorization: `Bearer ${token}` },
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
  }, [category]);

  const toggleSection = (type) => {
    setExpandedSections((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  // Helper functions for counters
  const addSeat = async (type) => {
    const loadingToast = toast.loading("Adding seat...");
    try {
      const token = localStorage.getItem("access");
      const groupSpaces = grouped[type] || [];
      const total = groupSpaces.length;
      const name = `${typeDisplayNames[type]} Seat ${total + 1}`;

      const res = await apiFetch(`${API_URL}/api/bookings/admin-workspaces/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          workspace_type: type,
          price_per_hour: 0,
          is_available: true,
        }),
      });

      if (res.ok) {
        toast.success("Seat added", { id: loadingToast });
        fetchWorkspaces();
      } else {
        toast.error("Failed to add seat", { id: loadingToast });
      }
    } catch (err) {
      toast.error("Network error", { id: loadingToast });
    }
  };

  const removeSeat = async (type) => {
    const groupSpaces = grouped[type] || [];
    if (groupSpaces.length === 0) return;

    const loadingToast = toast.loading("Removing seat...");
    try {
      const token = localStorage.getItem("access");
      // Try to remove an available seat first
      const availableSeats = groupSpaces.filter((s) => s.is_available);
      
      if (availableSeats.length === 0) {
        toast.error("Cannot decrease capacity: all seats are currently occupied.", { id: loadingToast });
        return;
      }
      
      const targetSeat = availableSeats[availableSeats.length - 1];

      const res = await apiFetch(
        `${API_URL}/api/bookings/admin-workspaces/${targetSeat.id}/`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        toast.success("Seat removed", { id: loadingToast });
        fetchWorkspaces();
      } else {
        toast.error("Failed to remove seat", { id: loadingToast });
      }
    } catch (err) {
      toast.error("Network error", { id: loadingToast });
    }
  };

  const increaseOccupied = async (type) => {
    const groupSpaces = grouped[type] || [];
    const availableSeats = groupSpaces.filter((s) => s.is_available);
    if (availableSeats.length === 0) {
      toast.error("No available seats to mark as occupied");
      return;
    }

    const loadingToast = toast.loading("Updating status...");
    try {
      const token = localStorage.getItem("access");
      const targetSeat = availableSeats[0];
      const res = await apiFetch(
        `${API_URL}/api/bookings/admin-workspaces/${targetSeat.id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_available: false }),
        }
      );
      if (res.ok) {
        toast.success("Marked as occupied", { id: loadingToast });
        fetchWorkspaces();
      } else {
        toast.error("Failed to update status", { id: loadingToast });
      }
    } catch (err) {
      toast.error("Network error", { id: loadingToast });
    }
  };

  const decreaseOccupied = async (type) => {
    const groupSpaces = grouped[type] || [];
    const occupiedSeats = groupSpaces.filter((s) => !s.is_available);
    if (occupiedSeats.length === 0) {
      toast.error("No occupied seats to mark as available");
      return;
    }

    const loadingToast = toast.loading("Updating status...");
    try {
      const token = localStorage.getItem("access");
      const targetSeat = occupiedSeats[0];
      const res = await apiFetch(
        `${API_URL}/api/bookings/admin-workspaces/${targetSeat.id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_available: true }),
        }
      );
      if (res.ok) {
        toast.success("Marked as available", { id: loadingToast });
        fetchWorkspaces();
      } else {
        toast.error("Failed to update status", { id: loadingToast });
      }
    } catch (err) {
      toast.error("Network error", { id: loadingToast });
    }
  };

  // Filter workspaces based on search query AND category
  const filteredWorkspaces = workspaces.filter((ws) => {
    const matchesCategory =
      category === "library"
        ? ws.workspace_type === "library"
        : ws.workspace_type !== "library";
    if (!matchesCategory) return false;

    const q = (searchQuery || "").toLowerCase();
    return (
      ws.name.toLowerCase().includes(q) ||
      ws.workspace_type.toLowerCase().includes(q)
    );
  });

  // Group by type
  const grouped = filteredWorkspaces.reduce((acc, ws) => {
    if (!acc[ws.workspace_type]) acc[ws.workspace_type] = [];
    acc[ws.workspace_type].push(ws);
    return acc;
  }, {});

  const typeDisplayNames =
    category === "library"
      ? {
          library: "Library Zone",
        }
      : {
          dedicated: "Dedicated Desk",
          startup: "Startup Space",
          cabin: "Private Cabin",
        };

  const types = Object.keys(typeDisplayNames);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {category === "library"
              ? "Library Management"
              : "Coworking Management"}
          </h1>
          <p className="text-sm text-text-main/50">
            {category === "library"
              ? "Manage availability of library seats and zones."
              : "Manage availability of dedicated desks, cabins, and startup spaces."}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-10 text-center">Loading...</div>
      ) : (
        <div className="space-y-6">
          {types.map((type) => {
            const groupSpaces = grouped[type] || [];
            // If user is searching and this group has no matches, hide it.
            if (searchQuery && groupSpaces.length === 0) return null;

            const total = groupSpaces.length;
            const available = groupSpaces.filter((s) => s.is_available).length;
            const occupied = total - available;
            const isExpanded = expandedSections[type];

            return (
              <Card
                key={type}
                className="bg-surface border-border-main overflow-hidden shadow-sm"
              >
                <div
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors"
                  onClick={() => toggleSection(type)}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-text-main">
                      {typeDisplayNames[type]}
                    </h3>
                    <div className="flex gap-4 mt-2 text-sm text-text-main/70">
                      <span className="flex items-center gap-1">
                        Total: <Badge variant="outline">{total}</Badge>
                      </span>
                      <span className="flex items-center gap-1">
                        Available:{" "}
                        <Badge
                          variant="success"
                          className="bg-success/10 text-success border-success/20"
                        >
                          {available}
                        </Badge>
                      </span>
                      <span className="flex items-center gap-1">
                        Occupied:{" "}
                        <Badge
                          variant="destructive"
                          className="bg-error/10 text-error border-error/20"
                        >
                          {occupied}
                        </Badge>
                      </span>
                    </div>
                  </div>
                  <div className="text-text-main/50 bg-black/5 dark:bg-white/5 p-2 rounded-full">
                    {isExpanded ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border-main bg-black/5 dark:bg-white/[0.01] p-6">
                    {type === "startup" ? (
                      <div className="max-w-sm space-y-6">
                        {total === 0 ? (
                          <div className="text-center py-4 border border-border-main border-dashed rounded-lg">
                            <p className="text-sm text-text-main/50 mb-3">No space initialized</p>
                            <Button onClick={(e) => { e.stopPropagation(); addSeat(type); }} variant="outline">
                              Initialize Space
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center bg-background border border-border-main rounded-lg p-4">
                            <span className="font-medium text-text-main">
                              Status:{" "}
                              <span
                                className={
                                  available > 0 ? "text-success" : "text-error"
                                }
                              >
                                {available > 0 ? "Available" : "Occupied"}
                              </span>
                            </span>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (available > 0) {
                                  increaseOccupied(type);
                                } else {
                                  decreaseOccupied(type);
                                }
                              }}
                              className={
                                available > 0
                                  ? "bg-error hover:bg-error/90 text-white"
                                  : "bg-success hover:bg-success/90 text-white"
                              }
                            >
                              {available > 0
                                ? "Mark as Occupied"
                                : "Mark as Available"}
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="max-w-sm space-y-6">
                        {/* Total Capacity Counter */}
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-text-main">
                            Total {type === "cabin" ? "Cabins" : type === "dedicated" ? "Desks" : "Seats"}
                          </span>
                          <div className="flex items-center gap-4 bg-background border border-border-main rounded-lg p-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSeat(type);
                              }}
                              disabled={total === 0 || available === 0}
                              title={available === 0 ? "Cannot decrease capacity: all seats are occupied" : "Decrease capacity"}
                              className="p-1 text-text-main/70 hover:text-error disabled:opacity-50 transition-colors"
                            >
                              <Minus size={18} />
                            </button>
                            <span className="w-8 text-center font-semibold text-text-main">
                              {total}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addSeat(type);
                              }}
                              className="p-1 text-text-main/70 hover:text-success transition-colors"
                            >
                              <Plus size={18} />
                            </button>
                          </div>
                        </div>

                        {/* Occupied Counter */}
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-text-main">
                            Occupied {type === "cabin" ? "Cabins" : type === "dedicated" ? "Desks" : "Seats"}
                          </span>
                          <div className="flex items-center gap-4 bg-background border border-border-main rounded-lg p-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                decreaseOccupied(type);
                              }}
                              disabled={occupied === 0}
                              className="p-1 text-text-main/70 hover:text-success disabled:opacity-50 transition-colors"
                            >
                              <Minus size={18} />
                            </button>
                            <span className="w-8 text-center font-semibold text-text-main">
                              {occupied}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                increaseOccupied(type);
                              }}
                              disabled={available === 0}
                              className="p-1 text-text-main/70 hover:text-error disabled:opacity-50 transition-colors"
                            >
                              <Plus size={18} />
                            </button>
                          </div>
                        </div>

                        {/* Available Info */}
                        <div className="flex justify-between items-center pt-4 border-t border-border-main/50">
                          <span className="font-medium text-text-main/70">
                            Available {type === "cabin" ? "Cabins" : type === "dedicated" ? "Desks" : "Seats"}
                          </span>
                          <span className="font-bold text-success text-lg">
                            {available}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
