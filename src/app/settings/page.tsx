'use client';

import { useState } from 'react';

interface OAuthService {
  name: string;
  connected: boolean;
  lastSync: string;
  canDisconnect: boolean;
}

export default function SettingsPage() {
  const [oauthServices, setOauthServices] = useState<OAuthService[]>([
    { name: 'Google Calendar', connected: true, lastSync: '5 min ago', canDisconnect: true },
    { name: 'WHOOP Fitness', connected: true, lastSync: '1h ago', canDisconnect: true },
    { name: 'Todoist', connected: true, lastSync: '30 min ago', canDisconnect: true },
    { name: 'Obsidian Vault', connected: true, lastSync: '2 min ago', canDisconnect: false },
  ]);

  const [dashboardPassword, setDashboardPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cacheDuration, setCacheDuration] = useState('4h');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSync = (serviceName: string) => {
    setOauthServices(prev => prev.map((s) => s.name === serviceName ? { ...s, lastSync: 'just now', connected: true } : s));
  };

  const handleDisconnect = (serviceName: string) => {
    setOauthServices(prev => prev.map((s) => s.name === serviceName ? { ...s, connected: false } : s));
  };

  const handleChangePassword = () => {
    if (dashboardPassword.length < 8) { alert('Password must be at least 8 characters'); return; }
    localStorage.setItem('ares_dashboard_password', dashboardPassword);
    alert('Password updated');
    setDashboardPassword('');
  };

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-headline text-5xl font-black uppercase tracking-[0.05em] text-on-surface-bright mb-2">
          SYSTEM <span className="text-primary drop-shadow-[0_0_8px_rgba(255,23,68,0.4)]">CONFIG</span>
        </h1>
        <p className="text-on-surface/40 font-mono text-[10px] uppercase tracking-[0.3em]">
          OPERATOR_PREFERENCES // <span className="text-primary">AUTH_LEVEL_MAX</span>
        </p>
      </div>

      {/* Data Links */}
      <section>
        <h2 className="font-mono font-bold uppercase tracking-[0.3em] text-xs border-l-2 border-primary pl-4 text-on-surface/60 mb-6">
          DATA_LINKS
        </h2>
        <div className="space-y-2">
          {oauthServices.map((service) => (
            <div key={service.name} className="bg-surface-0 border border-outline p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="font-mono font-bold uppercase tracking-widest text-[11px] text-on-surface">
                  {service.name.toUpperCase().replace(/\s+/g, '_')}
                </div>
                {service.connected && (
                  <div className="font-mono text-[9px] text-on-surface/30 tracking-widest mt-1">
                    LAST_SYNC: {service.lastSync}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest font-bold ${
                  service.connected ? 'text-clinical-mint' : 'text-primary'
                }`}>
                  <span className={`inline-block w-1.5 h-1.5 ${service.connected ? 'bg-clinical-mint clinical-glow' : 'bg-primary pip-glow'}`} />
                  {service.connected ? 'LINKED' : 'OFFLINE'}
                </span>
                <button
                  onClick={() => handleSync(service.name)}
                  className="px-4 py-2 border border-primary/30 text-primary font-mono font-bold text-[9px] uppercase tracking-widest hover:bg-primary/10 transition-all"
                >
                  {service.connected ? 'SYNC' : 'CONNECT'}
                </button>
                {service.connected && service.canDisconnect && (
                  <button
                    onClick={() => handleDisconnect(service.name)}
                    aria-label={`Disconnect ${service.name}`}
                    className="px-4 py-2 border border-on-surface/10 text-on-surface/30 font-mono font-bold text-[9px] uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all"
                  >
                    DISCONNECT
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Security */}
      <section>
        <h2 className="font-mono font-bold uppercase tracking-[0.3em] text-xs border-l-2 border-primary pl-4 text-on-surface/60 mb-6">
          SECURITY
        </h2>
        <div className="bg-surface-0 border border-outline p-6 space-y-4">
          <div className="flex gap-2">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="NEW_PASSPHRASE (MIN 8 CHARS)"
              value={dashboardPassword}
              onChange={(e) => setDashboardPassword(e.target.value)}
              className="flex-1 bg-background border-0 border-b-2 border-outline text-on-surface font-mono text-[11px] uppercase tracking-widest px-4 py-3 focus:border-primary focus:outline-none focus:shadow-[0_2px_8px_rgba(255,23,68,0.3)] transition-all placeholder:text-on-surface/20"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="px-4 py-2 border border-outline text-on-surface/40 font-mono font-bold text-[9px] uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all"
            >
              {showPassword ? 'HIDE' : 'SHOW'}
            </button>
          </div>
          <button
            onClick={handleChangePassword}
            disabled={dashboardPassword.length < 8}
            className="px-6 py-3 bg-primary text-black font-headline font-black text-[10px] uppercase tracking-[0.2em] disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_25px_rgba(255,23,68,0.7)] transition-all"
          >
            UPDATE_PASSPHRASE
          </button>
        </div>
      </section>

      {/* Preferences */}
      <section>
        <h2 className="font-mono font-bold uppercase tracking-[0.3em] text-xs border-l-2 border-primary pl-4 text-on-surface/60 mb-6">
          PREFERENCES
        </h2>
        <div className="bg-surface-0 border border-outline p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface/60">CACHE_DURATION</span>
            <div className="flex gap-1">
              {['1h', '4h', '24h'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setCacheDuration(opt)}
                  className={`px-5 py-2 font-mono font-bold text-[10px] uppercase tracking-widest transition-all ${
                    cacheDuration === opt
                      ? 'bg-primary text-black shadow-[0_0_15px_rgba(255,23,68,0.4)]'
                      : 'border border-outline text-on-surface/40 hover:border-primary/30 hover:text-primary'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface/60">NOTIFICATIONS</span>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              role="switch"
              aria-checked={notificationsEnabled}
              aria-label="Toggle notifications"
              className={`px-6 py-2 font-mono font-bold text-[10px] uppercase tracking-widest transition-all ${
                notificationsEnabled
                  ? 'bg-clinical-mint/20 text-clinical-mint border border-clinical-mint/30'
                  : 'border border-outline text-on-surface/40'
              }`}
            >
              {notificationsEnabled ? 'ACTIVE' : 'DISABLED'}
            </button>
          </div>
        </div>
      </section>

      {/* Diagnostics */}
      <section>
        <h2 className="font-mono font-bold uppercase tracking-[0.3em] text-xs border-l-2 border-primary pl-4 text-on-surface/60 mb-6">
          DIAGNOSTICS
        </h2>
        <div className="bg-surface-0 border border-outline p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="font-mono text-[10px] text-on-surface/40 uppercase tracking-widest">
            SYS_UPDATE: {new Date().toLocaleTimeString()}
          </div>
          <button
            onClick={() => { localStorage.clear(); alert('Cache cleared'); window.location.reload(); }}
            className="px-6 py-3 border-2 border-primary/30 text-primary font-headline font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary/10 transition-all"
          >
            PURGE_ALL_CACHE
          </button>
        </div>
      </section>
    </div>
  );
}
