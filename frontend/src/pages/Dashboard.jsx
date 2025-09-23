import React, { useEffect, useState } from "react";

function Dashboard() {
  const [status, setStatus] = useState([]);

  useEffect(() => {
    // Example: fetch data from Django later
    setStatus([
      { service: "Website", status: "UP" },
      { service: "API", status: "DOWN" },
    ]);
  }, []);

  return (
    <div>
      <h1>Uptime Monitor</h1>
      <ul>
        {status.map((s, i) => (
          <li key={i}>
            {s.service} → {s.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
