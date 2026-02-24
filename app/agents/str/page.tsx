'use client';
import { useState } from 'react';

const TABS = [
  { id: 'dashboard', name: 'Dashboard', icon: '🏠' },
  { id: 'listings', name: 'Listings', icon: '📡' },
  { id: 'bookings', name: 'Bookings', icon: '📅' },
  { id: 'guests', name: 'Guest Flow', icon: '🤝' },
  { id: 'cleaning', name: 'Cleaning & Maint.', icon: '🧹' },
  { id: 'concierge', name: 'AI Concierge', icon: '💬' },
];

const PLATFORMS = [
  { name: 'Airbnb', status: 'active', listings: 2, icon: '🏡' },
  { name: 'VRBO', status: 'active', listings: 2, icon: '🏘️' },
  { name: 'Booking.com', status: 'active', listings: 2, icon: '🅱️' },
  { name: 'Expedia', status: 'active', listings: 2, icon: '✈️' },
  { name: 'TripAdvisor', status: 'active', listings: 2, icon: '🦉' },
  { name: 'Google Vacation Rentals', status: 'active', listings: 2, icon: '🔍' },
  { name: 'Houfy', status: 'active', listings: 2, icon: '🏠' },
  { name: 'Furnished Finder', status: 'active', listings: 2, icon: '🛋️' },
  { name: 'Marriott Homes & Villas', status: 'pending', listings: 0, icon: '🏨' },
  { name: 'Vacasa', status: 'active', listings: 2, icon: '🌴' },
  { name: 'Evolve', status: 'active', listings: 2, icon: '📈' },
  { name: 'Hipcamp', status: 'active', listings: 1, icon: '⛺' },
  { name: 'Glamping Hub', status: 'pending', listings: 0, icon: '🏕️' },
  { name: 'Whimstay', status: 'active', listings: 2, icon: '✨' },
  { name: 'Plum Guide', status: 'pending', listings: 0, icon: '🍑' },
  { name: 'Sonder', status: 'active', listings: 1, icon: '🏙️' },
  { name: 'Hometogo', status: 'active', listings: 2, icon: '🔑' },
  { name: 'Agoda', status: 'active', listings: 2, icon: '🌏' },
  { name: 'Holidu', status: 'active', listings: 2, icon: '☀️' },
  { name: 'FlipKey', status: 'active', listings: 2, icon: '🗝️' },
  { name: 'Homestay.com', status: 'active', listings: 1, icon: '🛏️' },
  { name: 'Direct Website', status: 'active', listings: 2, icon: '🌐' },
];

const PROPERTIES = [
  { name: 'Desert Peak Lodge - Main House', beds: 4, baths: 3, guests: 10, rate: 285, occupancy: 78, rating: 4.9, nextBooking: 'Feb 24', status: 'occupied' },
  { name: 'Desert Peak Lodge - Casita', beds: 2, baths: 1, guests: 4, rate: 165, occupancy: 72, rating: 4.8, nextBooking: 'Feb 28', status: 'available' },
];

const BOOKINGS = [
  { id: 'BK-1001', guest: 'Sarah Mitchell', phone: '(801) 555-3847', property: 'Main House', checkin: '2026-02-20', checkout: '2026-02-24', platform: 'Airbnb', status: 'checked_in', doorCode: '3847', guests: 4, total: 1140, automations: { welcomeText: true, doorCode: true, wifiSent: true, cleanerNotified: true } },
  { id: 'BK-1002', guest: 'James Rodriguez', phone: '(435) 555-9162', property: 'Main House', checkin: '2026-02-24', checkout: '2026-02-28', platform: 'VRBO', status: 'confirmed', doorCode: '9162', guests: 6, total: 1140, automations: { welcomeText: false, doorCode: false, wifiSent: false, cleanerNotified: true } },
  { id: 'BK-1003', guest: 'Emily Chen', phone: '(702) 555-4521', property: 'Casita', checkin: '2026-02-28', checkout: '2026-03-03', platform: 'Booking.com', status: 'confirmed', doorCode: '4521', guests: 2, total: 495, automations: { welcomeText: false, doorCode: false, wifiSent: false, cleanerNotified: true } },
  { id: 'BK-1004', guest: 'Mike Thompson', phone: '(801) 555-7734', property: 'Main House', checkin: '2026-03-05', checkout: '2026-03-08', platform: 'Direct', status: 'pending', doorCode: '7734', guests: 8, total: 855, automations: { welcomeText: false, doorCode: false, wifiSent: false, cleanerNotified: false } },
];

const CLEANING_SCHEDULE = [
  { date: '2026-02-24', time: '11:00 AM', property: 'Main House', cleaner: 'Maria\'s Cleaning Co', status: 'scheduled', trigger: 'BK-1001 checkout', photosUploaded: false },
  { date: '2026-02-28', time: '11:00 AM', property: 'Main House', cleaner: 'Maria\'s Cleaning Co', status: 'scheduled', trigger: 'BK-1002 checkout', photosUploaded: false },
  { date: '2026-03-03', time: '11:00 AM', property: 'Casita', cleaner: 'Maria\'s Cleaning Co', status: 'scheduled', trigger: 'BK-1003 checkout', photosUploaded: false },
];

const LAWN_SCHEDULE = [
  { day: 'Tuesday', time: '8:00 AM', provider: 'Green Valley Landscaping', properties: 'All', status: 'recurring' },
  { day: 'Friday', time: '8:00 AM', provider: 'Green Valley Landscaping', properties: 'All', status: 'recurring' },
];

const GUEST_MESSAGES = [
  { type: 'Booking Confirmed', trigger: 'On reservation', message: 'Welcome to Desert Peak Lodge! 🏔️ We\'re thrilled you chose to stay with us. Your reservation is confirmed for {checkin_date}. We\'ll send you check-in details closer to your arrival. Questions? Just text us anytime!' },
  { type: 'Welcome + Door Code', trigger: '4:00 PM check-in day', message: 'Hi {guest_name}! Your stay at Desert Peak Lodge begins today! 🎉 Your front door code is {door_code} — it\'s active now. Check-in is at 4 PM. Safe travels and we\'ll see you soon!' },
  { type: 'Checked In + WiFi', trigger: 'Door code first used', message: 'Welcome home! 🏡 WiFi: DesertPeak5G | Password: Lodge2026! The thermostat is on the hallway wall, extra towels are in the hall closet. What brings you to our area? We\'d love to help with restaurant and activity recommendations!' },
  { type: 'Mid-Stay Check', trigger: '48hrs after check-in', message: 'Hi {guest_name}! Just checking in — is everything going well? Need any recommendations for restaurants or things to do? We\'re here if you need anything at all! 😊' },
  { type: 'Pre-Checkout', trigger: '6:00 PM before checkout', message: 'Hi {guest_name}! Just a reminder — checkout is at 10 AM tomorrow. {trash_note}Please leave the keys on the kitchen counter. We hope you had an amazing stay! 🌟' },
  { type: 'Review Request', trigger: '2hrs after checkout', message: 'Thank you for staying at Desert Peak Lodge, {guest_name}! 🙏 We hope you had an incredible time. Would you mind leaving us a review? It helps other guests find us! {review_link} We look forward to hosting you again! 💫' },
];

const CONCIERGE_LOGS = [
  { time: '2:15 PM', guest: 'Sarah Mitchell', channel: 'SMS', direction: 'in', message: 'Hi! Is there a good Italian restaurant nearby?' },
  { time: '2:16 PM', guest: 'Sarah Mitchell', channel: 'SMS', direction: 'out', message: 'Great question, Sarah! 🍝 We love Tuscany on Main — it\'s about 10 minutes away. Try their truffle pasta! Want me to help with a reservation?' },
  { time: '2:18 PM', guest: 'Sarah Mitchell', channel: 'SMS', direction: 'in', message: 'Yes please! For tonight at 7?' },
  { time: '2:19 PM', guest: 'Sarah Mitchell', channel: 'SMS', direction: 'out', message: 'Done! I\'ve got you a reservation at Tuscany on Main tonight at 7 PM for 4 guests. Address: 412 Main St. Enjoy your dinner! 🎉' },
  { time: '9:30 AM', guest: 'Sarah Mitchell', channel: 'Call', direction: 'in', message: '[AI answered] Guest asked about hiking trails. Recommended Bonneville Shoreline Trail and Red Butte Garden. Sent trail maps via text.' },
];

export default function STRAgent() {
  const [tab, setTab] = useState('dashboard');

  const statusColor = (s: string) => {
    const colors: Record<string, string> = {
      active: 'text-emerald-400 bg-emerald-400/10',
      pending: 'text-amber-400 bg-amber-400/10',
      occupied: 'text-blue-400 bg-blue-400/10',
      available: 'text-emerald-400 bg-emerald-400/10',
      checked_in: 'text-blue-400 bg-blue-400/10',
      confirmed: 'text-emerald-400 bg-emerald-400/10',
      scheduled: 'text-amber-400 bg-amber-400/10',
      recurring: 'text-purple-400 bg-purple-400/10',
    };
    return colors[s] || 'text-gray-400 bg-gray-400/10';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="text-4xl">🏔️</div>
        <div>
          <h1 className="text-2xl font-bold">Short-Term Rental Agent</h1>
          <p className="text-sm text-gray-400">Multi-platform listing, guest automation, cleaning & concierge</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0A0E15] p-1 rounded-xl border border-white/5 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ' +
              (tab === t.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5')}>
            <span>{t.icon}</span> {t.name}
          </button>
        ))}
      </div>

      {/* DASHBOARD */}
      {tab === 'dashboard' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
              <div className="text-[9px] text-gray-500 uppercase">Properties</div>
              <div className="text-2xl font-bold mt-1">{PROPERTIES.length}</div>
            </div>
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
              <div className="text-[9px] text-gray-500 uppercase">Platforms Active</div>
              <div className="text-2xl font-bold mt-1 text-blue-400">{PLATFORMS.filter(p => p.status === 'active').length}</div>
            </div>
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
              <div className="text-[9px] text-gray-500 uppercase">Avg Occupancy</div>
              <div className="text-2xl font-bold mt-1 text-emerald-400">{Math.round(PROPERTIES.reduce((s, p) => s + p.occupancy, 0) / PROPERTIES.length)}%</div>
            </div>
            <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-4">
              <div className="text-[9px] text-gray-500 uppercase">Avg Rating</div>
              <div className="text-2xl font-bold mt-1 text-amber-400">⭐ {(PROPERTIES.reduce((s, p) => s + p.rating, 0) / PROPERTIES.length).toFixed(1)}</div>
            </div>
          </div>

          {/* Properties */}
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Properties</h3>
            <div className="space-y-3">
              {PROPERTIES.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/5">
                  <div>
                    <div className="font-medium text-sm">{p.name}</div>
                    <div className="text-[10px] text-gray-500">{p.beds} bed · {p.baths} bath · Up to {p.guests} guests</div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-sm font-mono">${p.rate}/night</div>
                      <div className="text-[10px] text-gray-500">{p.occupancy}% occ</div>
                    </div>
                    <span className={'px-2 py-1 rounded-md text-[10px] font-medium ' + statusColor(p.status)}>{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Automation Pipeline */}
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">🤖 Automation Pipeline</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { step: 'Booking Received', desc: 'Block all platforms, notify cleaners, send confirmation', icon: '📥', color: 'border-blue-500/20' },
                { step: 'Check-In Day 4PM', desc: 'Activate door code (last 4 of phone), send welcome text', icon: '🔑', color: 'border-emerald-500/20' },
                { step: 'Door Code Used', desc: 'Send WiFi info, house guide, ask about their trip', icon: '📱', color: 'border-purple-500/20' },
                { step: 'Checkout 10AM', desc: 'Deactivate code, request review, trigger cleaning at 11AM', icon: '👋', color: 'border-amber-500/20' },
              ].map((s, i) => (
                <div key={i} className={'p-3 bg-white/[0.02] rounded-lg border ' + s.color}>
                  <div className="text-lg mb-1">{s.icon}</div>
                  <div className="text-xs font-semibold text-white">{s.step}</div>
                  <div className="text-[10px] text-gray-500 mt-1">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LISTINGS */}
      {tab === 'listings' && (
        <div className="space-y-4">
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold">{PLATFORMS.length} Platforms ({PLATFORMS.filter(p => p.status === 'active').length} active)</h3>
              <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-500 transition">+ Add Platform</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {PLATFORMS.map((p, i) => (
                <div key={i} className="flex items-center gap-2 p-3 bg-white/[0.02] rounded-lg border border-white/5">
                  <span className="text-lg">{p.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{p.name}</div>
                    <div className="text-[10px] text-gray-500">{p.listings} listings</div>
                  </div>
                  <span className={'px-1.5 py-0.5 rounded text-[9px] font-medium ' + statusColor(p.status)}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">📡 Cross-Platform Sync</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2"><span className="text-emerald-400">✓</span> New booking → instantly blocks dates on ALL platforms</div>
              <div className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Cancellation → instantly opens dates on ALL platforms</div>
              <div className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Price change → syncs to ALL platforms within 5 minutes</div>
              <div className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Photos & descriptions synced across all active listings</div>
              <div className="flex items-center gap-2"><span className="text-amber-400">⚡</span> Last sync: 3 minutes ago</div>
            </div>
          </div>
        </div>
      )}

      {/* BOOKINGS */}
      {tab === 'bookings' && (
        <div className="space-y-4">
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="px-4 py-3 text-[10px] text-gray-500 uppercase">Guest</th>
                  <th className="px-4 py-3 text-[10px] text-gray-500 uppercase">Property</th>
                  <th className="px-4 py-3 text-[10px] text-gray-500 uppercase">Dates</th>
                  <th className="px-4 py-3 text-[10px] text-gray-500 uppercase">Platform</th>
                  <th className="px-4 py-3 text-[10px] text-gray-500 uppercase">Door Code</th>
                  <th className="px-4 py-3 text-[10px] text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-[10px] text-gray-500 uppercase">Automations</th>
                </tr>
              </thead>
              <tbody>
                {BOOKINGS.map(b => (
                  <tr key={b.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="font-medium">{b.guest}</div>
                      <div className="text-[10px] text-gray-500">{b.phone} · {b.guests} guests</div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{b.property}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs">{b.checkin}</div>
                      <div className="text-[10px] text-gray-500">→ {b.checkout}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{b.platform}</td>
                    <td className="px-4 py-3 font-mono text-blue-400">{b.doorCode}</td>
                    <td className="px-4 py-3">
                      <span className={'px-2 py-1 rounded-md text-[10px] font-medium ' + statusColor(b.status)}>{b.status.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <span title="Welcome text" className={b.automations.welcomeText ? 'text-emerald-400' : 'text-gray-700'}>💬</span>
                        <span title="Door code set" className={b.automations.doorCode ? 'text-emerald-400' : 'text-gray-700'}>🔑</span>
                        <span title="WiFi sent" className={b.automations.wifiSent ? 'text-emerald-400' : 'text-gray-700'}>📶</span>
                        <span title="Cleaner notified" className={b.automations.cleanerNotified ? 'text-emerald-400' : 'text-gray-700'}>🧹</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GUEST FLOW */}
      {tab === 'guests' && (
        <div className="space-y-4">
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-4">🤖 Automated Guest Journey</h3>
            <div className="space-y-3">
              {GUEST_MESSAGES.map((m, i) => (
                <div key={i} className="p-4 bg-white/[0.02] rounded-lg border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">{i + 1}</span>
                      <span className="text-sm font-semibold text-white">{m.type}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded">Trigger: {m.trigger}</span>
                  </div>
                  <div className="bg-blue-600/5 border border-blue-500/10 rounded-lg p-3 text-sm text-gray-300 leading-relaxed">
                    {m.message}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">🔑 Door Code Logic</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2"><span className="text-blue-400">→</span> Code = last 4 digits of guest&apos;s phone number</div>
              <div className="flex items-center gap-2"><span className="text-emerald-400">→</span> Activates at <strong className="text-white">4:00 PM</strong> on check-in day</div>
              <div className="flex items-center gap-2"><span className="text-rose-400">→</span> Deactivates at <strong className="text-white">10:00 AM</strong> on checkout day</div>
              <div className="flex items-center gap-2"><span className="text-purple-400">→</span> Smart lock API integration (Yale/August/Schlage)</div>
            </div>
          </div>

          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">🗑️ Trash Day Rules</h3>
            <div className="text-sm text-gray-400">
              If checkout falls on <strong className="text-white">Thursday</strong> or <strong className="text-white">Friday</strong>, the pre-checkout message includes:
              <div className="mt-2 bg-amber-500/5 border border-amber-500/10 rounded-lg p-3 text-amber-300">
                &ldquo;One quick favor — since tomorrow is trash day, could you please roll the trash cans to the street before you head out? Thank you so much! 🙏&rdquo;
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CLEANING & MAINTENANCE */}
      {tab === 'cleaning' && (
        <div className="space-y-4">
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">🧹 Cleaning Schedule (Auto-Generated)</h3>
            <div className="text-[10px] text-gray-500 mb-3">Cleaners auto-notified when booking confirmed. Cleaning at 11 AM after each checkout.</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="px-3 py-2 text-[10px] text-gray-500 uppercase">Date</th>
                  <th className="px-3 py-2 text-[10px] text-gray-500 uppercase">Time</th>
                  <th className="px-3 py-2 text-[10px] text-gray-500 uppercase">Property</th>
                  <th className="px-3 py-2 text-[10px] text-gray-500 uppercase">Cleaner</th>
                  <th className="px-3 py-2 text-[10px] text-gray-500 uppercase">Trigger</th>
                  <th className="px-3 py-2 text-[10px] text-gray-500 uppercase">Photos</th>
                  <th className="px-3 py-2 text-[10px] text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {CLEANING_SCHEDULE.map((c, i) => (
                  <tr key={i} className="border-b border-white/[0.03]">
                    <td className="px-3 py-2">{c.date}</td>
                    <td className="px-3 py-2 text-gray-400">{c.time}</td>
                    <td className="px-3 py-2">{c.property}</td>
                    <td className="px-3 py-2 text-gray-400">{c.cleaner}</td>
                    <td className="px-3 py-2 text-[10px] text-gray-500">{c.trigger}</td>
                    <td className="px-3 py-2">{c.photosUploaded ? <span className="text-emerald-400">✓ Uploaded</span> : <span className="text-gray-600">Pending</span>}</td>
                    <td className="px-3 py-2"><span className={'px-2 py-1 rounded text-[10px] ' + statusColor(c.status)}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">📸 Cleaning Photo Requirements</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {['Kitchen', 'Living Room', 'Master Bedroom', 'Guest Bedrooms', 'Bathrooms', 'Exterior', 'Patio/Deck', 'Garage'].map(room => (
                <div key={room} className="p-3 bg-white/[0.02] rounded-lg border border-white/5 text-center">
                  <div className="text-gray-400">{room}</div>
                  <div className="text-[10px] text-gray-600 mt-1">📷 Required</div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg text-sm text-rose-300">
              ⚠️ <strong>Damage Reporting:</strong> Any damage must be reported immediately with photos. Report auto-sent to property manager.
            </div>
          </div>

          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">🌿 Lawn Care Schedule</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="px-3 py-2 text-[10px] text-gray-500 uppercase">Day</th>
                  <th className="px-3 py-2 text-[10px] text-gray-500 uppercase">Time</th>
                  <th className="px-3 py-2 text-[10px] text-gray-500 uppercase">Provider</th>
                  <th className="px-3 py-2 text-[10px] text-gray-500 uppercase">Properties</th>
                  <th className="px-3 py-2 text-[10px] text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {LAWN_SCHEDULE.map((l, i) => (
                  <tr key={i} className="border-b border-white/[0.03]">
                    <td className="px-3 py-2">{l.day}</td>
                    <td className="px-3 py-2 text-gray-400">{l.time}</td>
                    <td className="px-3 py-2">{l.provider}</td>
                    <td className="px-3 py-2 text-gray-400">{l.properties}</td>
                    <td className="px-3 py-2"><span className={'px-2 py-1 rounded text-[10px] ' + statusColor(l.status)}>{l.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI CONCIERGE */}
      {tab === 'concierge' && (
        <div className="space-y-4">
          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-2">💬 AI Concierge — Call & Text Handler</h3>
            <p className="text-[10px] text-gray-500 mb-4">AI answers guest calls and texts 24/7. Handles questions, restaurant recommendations, activity suggestions, and issue resolution.</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white/[0.02] rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-emerald-400">97%</div>
                <div className="text-[10px] text-gray-500">AI Resolution Rate</div>
              </div>
              <div className="bg-white/[0.02] rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-blue-400">12s</div>
                <div className="text-[10px] text-gray-500">Avg Response Time</div>
              </div>
              <div className="bg-white/[0.02] rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-amber-400">4.9</div>
                <div className="text-[10px] text-gray-500">Guest Satisfaction</div>
              </div>
            </div>
          </div>

          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">Recent Conversations</h3>
            <div className="space-y-2">
              {CONCIERGE_LOGS.map((l, i) => (
                <div key={i} className={'flex gap-3 ' + (l.direction === 'out' ? 'justify-end' : '')}>
                  {l.direction === 'in' && (
                    <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px]">
                      {l.channel === 'Call' ? '📞' : '💬'}
                    </div>
                  )}
                  <div className={'max-w-[75%] px-3 py-2 rounded-xl text-sm ' +
                    (l.direction === 'out'
                      ? 'bg-blue-600/20 text-blue-100 rounded-br-sm'
                      : l.channel === 'Call'
                        ? 'bg-purple-500/10 text-purple-200 rounded-bl-sm italic'
                        : 'bg-white/[0.06] text-gray-300 rounded-bl-sm')}>
                    <div className="text-[10px] text-gray-500 mb-0.5">{l.guest} · {l.time} · {l.channel}</div>
                    {l.message}
                  </div>
                  {l.direction === 'out' && (
                    <div className="w-7 h-7 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px]">🤖</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0A0E15] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-3">🎯 Concierge Capabilities</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                '📞 Answer calls 24/7 with property-specific knowledge',
                '💬 Respond to texts within seconds',
                '🍽️ Restaurant recommendations with reservation help',
                '🏔️ Activity & recreation suggestions based on interests',
                '🔧 Handle maintenance concerns and escalate to manager',
                '⭐ Proactively ask about guest experience',
                '🗺️ Send directions, maps, and local tips',
                '🚨 Emergency escalation to property owner',
              ].map((cap, i) => (
                <div key={i} className="p-2 bg-white/[0.02] rounded-lg text-gray-400 text-xs">{cap}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
