import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { ArrowRight, Info } from "lucide-react";
import { cn } from "../../lib/utils";

export default function SeatSelectionMap() {
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [seats, setSeats] = useState([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterType = searchParams.get('type');

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/bookings/public-workspaces/");
        if (res.ok) {
          const data = await res.json();
          setSeats(data);
        }
      } catch (err) {
        console.error("Failed to fetch seats", err);
      }
    };
    fetchSeats();
  }, []);

  // Responsive grid logic
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const containerWidth = Math.min(windowWidth - 64, 1152); 

  let libCols = 3;
  let dedCols = 2;

  if (filterType === 'library') {
    libCols = Math.max(3, Math.floor((containerWidth - 60) / 95));
  } else if (filterType === 'dedicated') {
    dedCols = Math.max(2, Math.floor((containerWidth - 300) / 120));
  } else {
    if (windowWidth >= 1280) {
      libCols = 5;
      dedCols = 3;
    } else if (windowWidth >= 1024) {
      libCols = 4;
      dedCols = 2;
    } else {
      libCols = 3;
      dedCols = 2;
    }
  }

  const libRectX = 20;
  const libRectWidth = Math.max(300, (libCols - 1) * 95 + 90);
  
  const dedRectX = filterType === 'dedicated' ? 20 : (libRectX + libRectWidth + 30);
  const dedRectWidth = Math.max(300, dedCols * 120);
  
  const cabinRectX = dedRectX + dedRectWidth + 30;
  const cabinRectWidth = 250;

  const totalMapWidth = filterType === 'library' 
    ? libRectWidth + 40 
    : cabinRectX + cabinRectWidth + 20;

  // Separate and map seats with coordinates
  const librarySeats = seats.filter(s => s.name.startsWith('L-')).map((seat, i) => ({
    id: seat.name,
    type: "library",
    status: seat.is_available ? "available" : "occupied",
    x: libRectX + 20 + (i % libCols) * 95,
    y: 80 + Math.floor(i / libCols) * 80,
  }));

  const dedicatedDesks = seats.filter(s => s.name.startsWith('D-')).map((seat, i) => ({
    id: seat.name,
    type: "dedicated",
    subType: "dedicated-desk",
    status: seat.is_available ? "available" : "occupied",
    x: dedRectX + 30 + (i % dedCols) * 120,
    y: 80 + Math.floor(i / dedCols) * 100,
  }));

  const privateCabins = seats.filter(s => s.name.startsWith('P-') || s.name.startsWith('C-')).map((seat, i) => ({
    id: seat.name,
    type: "dedicated",
    subType: "private-cabin",
    status: seat.is_available ? "available" : "occupied",
    x: cabinRectX + 85,
    y: 80 + i * 100,
  }));

  const dedicatedSeats = [...dedicatedDesks, ...privateCabins];

  const allSeats = [...librarySeats, ...dedicatedSeats].filter(seat => 
    filterType ? seat.type === filterType : true
  );

  const maxLibraryHeight = Math.max(360, 60 + Math.ceil(librarySeats.length / libCols) * 80);
  const maxDedicatedHeight = Math.max(360, 40 + Math.ceil(dedicatedDesks.length / dedCols) * 100);
  const maxCabinHeight = Math.max(360, 40 + privateCabins.length * 100);
  const maxTotalHeight = Math.max(
    (!filterType || filterType === 'library') ? maxLibraryHeight : 0,
    (!filterType || filterType === 'dedicated') ? Math.max(maxDedicatedHeight, maxCabinHeight) : 0
  ) + 40;

  const handleSeatClick = (seat) => {
    if (seat.status === "available") {
      setSelectedSeat(seat.id === selectedSeat ? null : seat.id);
    }
  };

  const getSeatColor = (status, isSelected) => {
    if (isSelected) return "fill-primary stroke-primary-dark";
    if (status === "occupied")
      return "fill-border-main stroke-border-main opacity-50 cursor-not-allowed";
    if (status === "reserved")
      return "fill-warning/50 stroke-warning cursor-not-allowed";
    return "fill-surface stroke-border-main hover:stroke-primary cursor-pointer hover:fill-primary/10";
  };

  const availableCount = allSeats.filter(s => s.status === 'available').length;

  return (
    <div className="min-h-screen bg-background flex flex-col pt-16">
      {/* Header */}
      <div className="bg-surface border-b border-border-main px-4 py-6">
        <div className="container mx-auto max-w-6xl flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold mb-2">Select Your Workspace</h1>
            <div className="flex flex-wrap gap-4 text-sm text-text-main/70">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-border-main bg-surface" />{" "}
                Available
              </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary" /> Selected
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-border-main/50" /> Occupied
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-warning/50" /> Reserved
            </div>
          </div>
          </div>
          <div>
            {filterType === 'dedicated' ? (
              <div className="flex gap-2">
                <Badge variant="success" className="text-xs md:text-sm px-2 py-1 shadow-sm border-success/20">
                  {dedicatedDesks.filter(s => s.status === 'available').length} Desks Available
                </Badge>
                <Badge variant="success" className="text-xs md:text-sm px-2 py-1 shadow-sm border-success/20">
                  {privateCabins.filter(s => s.status === 'available').length} Cabins Available
                </Badge>
              </div>
            ) : (
              <Badge variant="success" className="text-sm px-3 py-1 shadow-sm">
                {availableCount} Seats Available
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start bg-background">
        <div className="relative bg-surface rounded-3xl border border-border-main shadow-sm p-4 md:p-8 overflow-x-auto overflow-y-hidden min-w-full flex justify-start md:justify-center touch-pan-x">
          <svg 
            width="100%"
            style={{ minWidth: `${totalMapWidth}px` }}
            height={maxTotalHeight} 
            viewBox={`0 0 ${totalMapWidth} ${maxTotalHeight}`}
            className="select-none"
          >
            {/* Zones */}
            {(!filterType || filterType === 'library') && (
              <>
                <rect
                  x={libRectX}
                  y="20"
                  width={libRectWidth}
                  height={maxLibraryHeight}
                  rx="16"
                  fill="var(--color-primary)"
                  fillOpacity="0.03"
                  stroke="var(--color-primary)"
                  strokeOpacity="0.2"
                  strokeWidth="2"
                  strokeDasharray="8 8"
                />
                <text
                  x={libRectX + libRectWidth / 2}
                  y="50"
                  textAnchor="middle"
                  className="fill-primary font-bold text-lg opacity-50"
                >
                  Library Zone (Silent)
                </text>
              </>
            )}

            {(!filterType || filterType === 'dedicated') && (
              <>
                {/* Dedicated Desks Zone */}
                <rect
                  x={dedRectX}
                  y="20"
                  width={dedRectWidth}
                  height={maxDedicatedHeight}
                  rx="16"
                  fill="var(--color-secondary)"
                  fillOpacity="0.03"
                  stroke="var(--color-secondary)"
                  strokeOpacity="0.2"
                  strokeWidth="2"
                  strokeDasharray="8 8"
                />
                <text x={dedRectX + dedRectWidth / 2} y="45" textAnchor="middle" className="fill-secondary font-bold text-sm opacity-50">
                  Dedicated Desks
                </text>

                {/* Private Cabins Zone */}
                <rect
                  x={cabinRectX}
                  y="20"
                  width={cabinRectWidth}
                  height={maxCabinHeight}
                  rx="16"
                  fill="var(--color-secondary)"
                  fillOpacity="0.03"
                  stroke="var(--color-secondary)"
                  strokeOpacity="0.3"
                  strokeWidth="2"
                  strokeDasharray="8 8"
                />
                <text x={cabinRectX + cabinRectWidth / 2} y="45" textAnchor="middle" className="fill-secondary font-bold text-sm opacity-50">
                  Private Cabins
                </text>
              </>
            )}

            {/* Render Seats */}
            {allSeats.map((seat) => (
              <g
                key={seat.id}
                transform={`translate(${seat.x}, ${seat.y})`}
                onClick={() => handleSeatClick(seat)}
                className="transition-all duration-300"
              >
                {seat.type === "library" ? (
                  // Library desk design
                  <rect
                    width="50"
                    height="50"
                    rx="12"
                    className={cn(
                      "transition-colors duration-200 stroke-2",
                      getSeatColor(seat.status, selectedSeat === seat.id),
                    )}
                  />
                ) : seat.subType === "private-cabin" ? (
                  // Private Cabin design
                  <rect
                    width="80"
                    height="60"
                    rx="8"
                    className={cn(
                      "transition-colors duration-200 stroke-2",
                      getSeatColor(seat.status, selectedSeat === seat.id),
                    )}
                  />
                ) : (
                  // Dedicated Desk design
                  <rect
                    width="60"
                    height="50"
                    rx="6"
                    className={cn(
                      "transition-colors duration-200 stroke-2",
                      getSeatColor(seat.status, selectedSeat === seat.id),
                    )}
                  />
                )}
                <text
                  x={seat.subType === "private-cabin" ? 40 : seat.type === "library" ? 25 : 30}
                  y={seat.subType === "private-cabin" ? 35 : 30}
                  textAnchor="middle"
                  className="text-xs font-semibold fill-text-main pointer-events-none"
                >
                  {seat.id}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: selectedSeat ? 0 : 100 }}
        className="fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-xl border-t border-border-main p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50"
      >
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div>
            <p className="text-text-main/70 text-sm">Selected Workspace</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">{selectedSeat}</span>
              <Badge variant="success">Available</Badge>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center text-sm text-text-main/70 mr-4">
              <Info className="w-4 h-4 mr-1.5" />
              You can change this later
            </div>
            <Button
              size="lg"
              className="px-8 rounded-full shadow-lg shadow-primary/20"
              onClick={() => {
                const seatType = selectedSeat?.startsWith('L') 
                  ? 'library' 
                  : selectedSeat?.startsWith('D') 
                    ? 'dedicated-desk' 
                    : 'dedicated-private';
                navigate(`/pricing?plan=${seatType}&seat=${selectedSeat}`);
              }}
            >
              Continue to Plans <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Monitor,
//   Armchair,
//   DoorClosed,
//   Coffee,
//   ChevronRight,
//   X,
// } from "lucide-react";
// import { Button } from "../components/ui/Button";
// import { Badge } from "../components/ui/Badge";
// import { cn } from "../lib/utils";

// // Mock Data for Seats (Library Zone)
// const generateSeats = (prefix, count, occupiedIndices) => {
//   return Array.from({ length: count }).map((_, i) => ({
//     id: `${prefix}-${i + 1}`,
//     label: `${prefix}-${i + 1}`,
//     status: occupiedIndices.includes(i) ? "occupied" : "available",
//     type: "standard",
//   }));
// };

// const librarySeats = [
//   ...generateSeats("L1", 12, [2, 5, 8]),
//   ...generateSeats("L2", 12, [0, 1, 10]),
//   ...generateSeats("L3", 12, [4, 6, 7, 11]),
// ];

// export default function SeatSelectionMap() {
//   const [selectedSeat, setSelectedSeat] = useState(null);
//   const navigate = useNavigate();

//   const handleSeatClick = (seat) => {
//     if (seat.status === "occupied") return;

//     if (selectedSeat?.id === seat.id) {
//       setSelectedSeat(null); // Deselect
//     } else {
//       setSelectedSeat(seat);
//     }
//   };

//   const handleProceed = () => {
//     if (selectedSeat) {
//       navigate(`/pricing?plan=library&seat=${selectedSeat.id}`);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col relative pb-32">
//       {/* Header */}
//       <div className="bg-white border-b px-6 py-8 sm:px-12">
//         <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">
//               Select Your Seat
//             </h1>
//             <p className="text-gray-500 mt-1">
//               Choose an available seat for your Library Pass.
//             </p>
//           </div>
//           <div className="flex gap-4 items-center text-sm font-medium bg-gray-100 p-2 rounded-lg">
//             <div className="flex items-center gap-2">
//               <div className="w-4 h-4 rounded-full bg-blue-100 border border-blue-500"></div>
//               <span className="text-gray-700">Available</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-4 h-4 rounded-full bg-gray-200 border border-gray-400"></div>
//               <span className="text-gray-700">Occupied</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-4 h-4 rounded-full bg-blue-600 border border-blue-700 shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
//               <span className="text-gray-700">Selected</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Floor Plan */}
//       <div className="flex-1 overflow-auto p-6 flex justify-center items-start pt-12">
//         <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-5xl w-full">
//           <div className="flex items-center justify-between mb-8 pb-4 border-b">
//             <div className="flex items-center gap-2 text-gray-400 font-semibold uppercase tracking-wider text-sm">
//               <DoorClosed size={20} /> Entrance
//             </div>
//             <div className="flex items-center gap-2 text-gray-400 font-semibold uppercase tracking-wider text-sm">
//               Coffee Area <Coffee size={20} />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-16 justify-items-center">
//             {/* Group seats into tables of 4 */}
//             {Array.from({ length: librarySeats.length / 4 }).map(
//               (_, tableIndex) => {
//                 const tableSeats = librarySeats.slice(
//                   tableIndex * 4,
//                   tableIndex * 4 + 4,
//                 );
//                 return (
//                   <div
//                     key={tableIndex}
//                     className="relative flex flex-col items-center gap-4"
//                   >
//                     {/* Table visual */}
//                     <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-16 bg-amber-100 rounded-md border border-amber-200 shadow-inner z-0"></div>

//                     {/* Top seats */}
//                     <div className="flex gap-8 z-10">
//                       {[tableSeats[0], tableSeats[1]].map((seat) => (
//                         <button
//                           key={seat.id}
//                           onClick={() => handleSeatClick(seat)}
//                           disabled={seat.status === "occupied"}
//                           className={cn(
//                             "w-12 h-12 rounded-t-xl rounded-b-md flex items-center justify-center text-xs font-bold transition-all duration-200",
//                             seat.status === "occupied"
//                               ? "bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed opacity-70"
//                               : selectedSeat?.id === seat.id
//                                 ? "bg-blue-600 text-white shadow-lg ring-2 ring-blue-400 ring-offset-2 transform -translate-y-1"
//                                 : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 hover:shadow-md cursor-pointer",
//                           )}
//                         >
//                           {seat.label}
//                         </button>
//                       ))}
//                     </div>

//                     {/* Bottom seats */}
//                     <div className="flex gap-8 z-10 mt-4">
//                       {[tableSeats[2], tableSeats[3]].map((seat) => (
//                         <button
//                           key={seat.id}
//                           onClick={() => handleSeatClick(seat)}
//                           disabled={seat.status === "occupied"}
//                           className={cn(
//                             "w-12 h-12 rounded-b-xl rounded-t-md flex items-center justify-center text-xs font-bold transition-all duration-200",
//                             seat.status === "occupied"
//                               ? "bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed opacity-70"
//                               : selectedSeat?.id === seat.id
//                                 ? "bg-blue-600 text-white shadow-lg ring-2 ring-blue-400 ring-offset-2 transform translate-y-1"
//                                 : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 hover:shadow-md cursor-pointer",
//                           )}
//                         >
//                           {seat.label}
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 );
//               },
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Floating Action Bar (FAB) */}
//       <div
//         className={cn(
//           "fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transform transition-transform duration-300 z-50",
//           selectedSeat ? "translate-y-0" : "translate-y-full",
//         )}
//       >
//         <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
//           <div className="flex items-center gap-4">
//             <div className="bg-blue-100 p-3 rounded-full text-blue-600">
//               <Armchair size={24} />
//             </div>
//             <div>
//               <p className="text-sm text-gray-500 font-medium">Selected Seat</p>
//               <p className="text-lg font-bold text-gray-900 flex items-center gap-2">
//                 {selectedSeat?.label}
//                 <Badge variant="success" className="text-[10px] uppercase">
//                   Available
//                 </Badge>
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center gap-3 w-full sm:w-auto">
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={() => setSelectedSeat(null)}
//               className="hidden sm:flex rounded-full text-gray-400 hover:text-gray-600"
//             >
//               <X size={20} />
//             </Button>
//             <Button
//               size="lg"
//               className="w-full sm:w-auto text-base font-semibold px-8"
//               onClick={handleProceed}
//             >
//               Proceed to Pricing <ChevronRight className="ml-2 h-5 w-5" />
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
