// src/Dashboard.jsx
import { logout } from "../services/Api";
import { useNavigate, Link } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:flex flex-col">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-blue-600">Uptime Monitor</h2>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-3">
          <Link to="/" className="block text-gray-700 hover:text-blue-600">
            Dashboard
          </Link>
          <Link to="/monitors" className="block text-gray-700 hover:text-blue-600">
            Monitors
            </Link>
          <Link to="/alerts" className="block text-gray-700 hover:text-blue-600">
            Alerts
          </Link>
          <Link to="/settings" className="block text-gray-700 hover:text-blue-600">
            Settings
          </Link>
        </nav>
        <div className="px-6 py-4 border-t">
          <button
            className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
            onClick={() => {
                logout();
                navigate("/login");
            }}
            >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <span className="text-gray-600">Welcome back 👋</span>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-4 shadow rounded-lg">
            <h3 className="text-gray-500 text-sm">Monitors</h3>
            <p className="text-2xl font-bold text-gray-800">12</p>
          </div>
          <div className="bg-white p-4 shadow rounded-lg">
            <h3 className="text-gray-500 text-sm">Uptime (last 24h)</h3>
            <p className="text-2xl font-bold text-green-600">99.9%</p>
          </div>
          <div className="bg-white p-4 shadow rounded-lg">
            <h3 className="text-gray-500 text-sm">Incidents</h3>
            <p className="text-2xl font-bold text-red-500">2</p>
          </div>
        </div>

        {/* Recent Monitors Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Recent Monitors</h2>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
              <tr>
                <th className="px-4 py-2">Website</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Last Check</th>
                <th className="px-4 py-2">Uptime</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-4 py-2">example.com</td>
                <td className="px-4 py-2 text-green-600 font-semibold">Up</td>
                <td className="px-4 py-2">5 min ago</td>
                <td className="px-4 py-2">100%</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-2">api.myapp.com</td>
                <td className="px-4 py-2 text-red-500 font-semibold">Down</td>
                <td className="px-4 py-2">2 min ago</td>
                <td className="px-4 py-2">97%</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-2">shop.io</td>
                <td className="px-4 py-2 text-green-600 font-semibold">Up</td>
                <td className="px-4 py-2">10 min ago</td>
                <td className="px-4 py-2">99.8%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
