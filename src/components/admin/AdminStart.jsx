import React, { useEffect, useMemo, useState } from "react";
import { color, motion, useSpring, useTransform } from "framer-motion";
import {
  Ticket,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { operatorGetCount } from "../../api/OperatorGetCount";

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#008080"]; // orange, blue, green, teal

// Animated counter
function CountUp({ to, suffix = "" }) {
  const spring = useSpring(0, { stiffness: 80, damping: 20 });
  useEffect(() => {
    spring.set(to);
  }, [to]);
  const rounded = useTransform(spring, (latest) => Math.round(latest));
  const [value, setValue] = useState(0);
  useEffect(() => rounded.on("change", (v) => setValue(v)), [rounded]);
  return (
    <span className="font-semibold text-gray-800">
      {value.toLocaleString()} {suffix}
    </span>
  );
}

export default function TicketDashboard() {
  const [counts, setCounts] = useState({
    TotalPendingcount: 0,
    TotalAsignedcount: 0,
    TotalApprovedcount: 0,
    TotalResolvedcount: 0,
  });

  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await operatorGetCount();
        if (res?.result) {
          setCounts(res.response);
        }
      } catch (error) {
        console.error("Error fetching ticket counts:", error);
      }
    }
    fetchCounts();
  }, []);

  const TOTAL =
    counts.TotalPendingcount +
    counts.TotalAsignedcount +
    counts.TotalApprovedcount +
    counts.TotalResolvedcount;

  const data = useMemo(
    () => [
      { name: "Pending", value: counts.TotalPendingcount },
      { name: "Assigned", value: counts.TotalAsignedcount },
      { name: "Approved", value: counts.TotalApprovedcount },
      { name: "Resolved", value: counts.TotalResolvedcount },
    ],
    [counts]
  );

  function StatCard({ title, value, icon: Icon, pctOfTotal , color}) {
    const pct = Math.min(Math.max(pctOfTotal, 0), 1); // clamp 0..1 for the bar only
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className="group relative rounded-2xl bg-white/70 backdrop-blur shadow-sm ring-1 ring-black/5 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
      //  style={{borderColor: "gray", borderWidth: "0.5px", borderStyle:"solid"}}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl group-hover:bg-gray-50 transition-all" style={{color:color}}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm" style={{color:color}}>{title}</div>
              <div className="text-2xl font-semibold" style={{color:color}}>
                <CountUp to={value} />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 h-2 w-full rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct * 100}% ` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="h-full rounded-full bg-black/80"
          />
        </div>
        {/* <div className="mt-2 text-xs text-gray-500">{Math.round(pct * 100)}% of total</div> */}
      </motion.div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-950" style={{background:"#fff"}}>
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between"></div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-8 row">
        {/* pie chart start */}
        <div className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl col-6">
          {/* <h2 className="text-lg font-medium mb-4">Ticket Overview</h2> */}
          <ResponsiveContainer width="100%" height={600}>
            <PieChart>
              <Pie
                data={data}
                cx="70%"
                cy="50%" // push to bottom for semi-circle
                startAngle={270}
                endAngle={90}
                innerRadius={60}
                outerRadius={250}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
              />
            </PieChart>
          </ResponsiveContainer>
          {/* <div className="mt-4 text-xl font-semibold">Total: {TOTAL}</div> */}
        </div>
        {/* pie chart end */}
        <div className="col-6" 
        style={{ 
          display: "flex" ,
          justifyContent:"center",
          alignItems:"center"
          }} 
          >
          <div className="col-6">
            <StatCard
              icon={Clock}
              title="Raised Tickets"
              value={counts.TotalPendingcount}
              // style={{color:"#008080"}}
              color="#f97316"
            />
            <StatCard
              title="Assigned Tickets"
              value={counts.TotalAsignedcount}
              icon={ClipboardList}
              color="#3b82f6"
            />
          </div>
          {/* <div className="col-3">
            
          </div> */}
          <div className="col-6">
            <StatCard
              title="Approved Tickets"
              value={counts.TotalApprovedcount}
              icon={ClipboardCheck}
              color="#10b981"
            />
            <StatCard
              title="Resolved Tickets"
              value={counts.TotalResolvedcount}
              icon={CheckCircle2}
              className="bg-teal-600 text-white"
              color="#008080"
            />
          </div>
          {/* <div className="col-3">
            
          </div> */}
        </div>

        {/* Right: Half-circle chart */}
      </main>
    </div>
  );
}
