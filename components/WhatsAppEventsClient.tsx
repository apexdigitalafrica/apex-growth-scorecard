'use client';

import { useState } from 'react';
import { MessageCircle, Search, Filter, Phone, Clock } from 'lucide-react';

interface Event {
  id: string;
  client_id: string;
  phone: string;
  event: string;
  message: string | null;
  meta: any;
  created_at: string;
}

export default function WhatsAppEventsClient({ 
  initialEvents, 
  clientId 
}: { 
  initialEvents: Event[];
  clientId: string;
}) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [searchPhone, setSearchPhone] = useState('');
  const [filterEvent, setFilterEvent] = useState('all');

  const filteredEvents = events.filter(event => {
    const matchesPhone = searchPhone === '' || event.phone.includes(searchPhone);
    const matchesEvent = filterEvent === 'all' || event.event === filterEvent;
    return matchesPhone && matchesEvent;
  });

  const eventColors: Record<string, string> = {
    new_inbound: 'bg-blue-500',
    first_response: 'bg-green-500',
    qualified: 'bg-yellow-500',
    booking: 'bg-purple-500',
    closed_won: 'bg-emerald-500',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-green-200 to-cyan-200 bg-clip-text text-transparent">
            WhatsApp Events Log
          </h1>
        </div>
        <p className="text-slate-400">
          Complete history of all WhatsApp interactions
        </p>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Search by Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Search by Phone
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="+234..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Filter by Event */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Filter by Event Type
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={filterEvent}
                onChange={(e) => setFilterEvent(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Events</option>
                <option value="new_inbound">New Inbound</option>
                <option value="first_response">First Response</option>
                <option value="qualified">Qualified</option>
                <option value="booking">Booking</option>
                <option value="closed_won">Closed Won</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center">
            <MessageCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No events found</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-cyan-500/50 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: Event Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`${eventColors[event.event] || 'bg-gray-500'} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                      {event.event.replace('_', ' ').toUpperCase()}
                    </span>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Phone className="w-4 h-4" />
                      <span>{event.phone}</span>
                    </div>
                  </div>
                  
                  {event.message && (
                    <p className="text-white text-lg mt-3">{event.message}</p>
                  )}
                  
                  {event.meta && (
                    <div className="mt-3 text-xs text-slate-500">
                      Source: {event.meta.source || 'unknown'}
                    </div>
                  )}
                </div>

                {/* Right: Timestamp */}
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(event.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
