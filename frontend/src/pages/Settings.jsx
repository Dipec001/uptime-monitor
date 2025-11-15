import React, { useState, useRef, useEffect } from "react";

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    email: "steve@example.com",
    timezone: "GMT+01:00 (Europe/Berlin)",
  });
  
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [dodgeCount, setDodgeCount] = useState(0);
  const [isPositioned, setIsPositioned] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [canDodge, setCanDodge] = useState(true);
  const buttonRef = useRef(null);
  const containerRef = useRef(null);
  const lastDodgeTime = useRef(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    console.log("Saving:", formData);
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      console.log("Deleting account...");
    }
  };

  const handleMouseMove = (e) => {
    if (isMobile || !buttonRef.current || !containerRef.current || dodgeCount >= 10) return;

    const now = Date.now();
    if (now - lastDodgeTime.current < 400) return;

    const button = buttonRef.current.getBoundingClientRect();
    const container = containerRef.current.getBoundingClientRect();
    
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    const buttonCenterX = button.left + button.width / 2;
    const buttonCenterY = button.top + button.height / 2;
    
    const distance = Math.sqrt(
      Math.pow(mouseX - buttonCenterX, 2) + Math.pow(mouseY - buttonCenterY, 2)
    );
    
    const triggerDistance = 130;
    
    if (distance < triggerDistance) {
      lastDodgeTime.current = now;
      
      const angle = Math.random() * 2 * Math.PI;
      const moveDistance = 200;
      
      let newX = buttonPosition.x + Math.cos(angle) * moveDistance;
      let newY = buttonPosition.y + Math.sin(angle) * moveDistance;
      
      const maxX = container.width - button.width - 40;
      const maxY = container.height - button.height - 40;
      
      newX = Math.max(-100, Math.min(newX, maxX));
      newY = Math.max(-50, Math.min(newY, maxY));
      
      setButtonPosition({ x: newX, y: newY });
      setDodgeCount(prev => prev + 1);
      setIsPositioned(true);
    }
  };

  return (
    <div className="min-h-screen -m-6 p-6 bg-gray-900">
      <div className="max-w-2xl">
        <h2 className="text-xl font-semibold text-white mb-6">
          Edit your basic info
        </h2>

        <div className="mb-4">
          <label className="block text-gray-300 text-sm mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Enter your email"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-300 text-sm mb-2">Time Zone</label>
          <select
            name="timezone"
            value={formData.timezone}
            onChange={handleInputChange}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
          >
            <option value="GMT+01:00 (Europe/Berlin)">
              (GMT+01:00) Europe/Berlin
            </option>
            <option value="GMT+00:00 (Europe/London)">
              (GMT+00:00) Europe/London
            </option>
            <option value="GMT-05:00 (America/New_York)">
              (GMT-05:00) America/New York
            </option>
            <option value="GMT-08:00 (America/Los_Angeles)">
              (GMT-08:00) America/Los Angeles
            </option>
            <option value="GMT+01:00 (Africa/Lagos)">
              (GMT+01:00) Africa/Lagos
            </option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium mb-8"
        >
          Save
        </button>

        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-white mb-2">
            Delete account
          </h3>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed">
            When you ask to delete your account, AliveChecklist will send a
            confirmation email. Clicking the link in that email will permanently
            delete your account, monitors, logs, and all settings. Once deleted,
            nothing can be recovered.
          </p>
          
          {dodgeCount > 0 && dodgeCount < 10 && !isMobile && (
            <p className="text-yellow-400 text-sm mb-2 animate-pulse">
              🏃 Nice try! The button has dodged you {dodgeCount} time{dodgeCount > 1 ? 's' : ''}...
            </p>
          )}
          
          {dodgeCount >= 10 && !isMobile && (
            <p className="text-green-400 text-sm mb-2 font-semibold">
              🎉 Okay, you're persistent! You've earned the right to delete. Button will stay put now.
            </p>
          )}

          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="relative min-h-[150px]"
          >
            <button
              ref={buttonRef}
              onClick={handleDeleteAccount}
              style={{
                transform: isPositioned && dodgeCount < 10 && !isMobile
                  ? `translate(${buttonPosition.x}px, ${buttonPosition.y}px)`
                  : 'none',
                transition: dodgeCount < 10 && !isMobile ? 'transform 0.3s ease-out' : 'none',
              }}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium cursor-pointer relative overflow-hidden"
            >
              {dodgeCount >= 10 && !isMobile ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="text-2xl animate-bounce" style={{ animationDuration: '0.5s' }}>
                    😢
                  </span>
                  <span className="text-2xl relative inline-block">
                    <span className="absolute inset-0 animate-pulse" style={{ animationDuration: '1s' }}>💔</span>
                    <span>💔</span>
                  </span>
                  <span className="text-2xl" style={{ 
                    animation: 'shake 0.5s infinite',
                    display: 'inline-block'
                  }}>
                    💔
                  </span>
                  <style>{`
                    @keyframes shake {
                      0%, 100% { transform: translateX(0) rotate(0deg); }
                      25% { transform: translateX(-3px) rotate(-5deg); }
                      75% { transform: translateX(3px) rotate(5deg); }
                    }
                  `}</style>
                </span>
              ) : (
                'Delete Account'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}