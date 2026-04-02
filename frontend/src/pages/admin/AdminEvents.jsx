import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  Plus, Calendar, MapPin,
  Edit3, Trash2, RefreshCcw,
  Search, Music,
  ArrowUpRight
} from 'lucide-react';

import { motion } from 'framer-motion';
import api from '../../api';

export default function AdminEvents() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/events');
            setEvents(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'Active' ? 'Draft' : 'Active';
        try {
            await api.put(`/admin/events/${id}`, { status: nextStatus });
            fetchEvents();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete "${name}"?\n\nIf this event has bookings, it will be archived to protect records instead of permanently deleted.`)) return;
        try {
            const { data } = await api.delete(`/admin/events/${id}`);
            if (data.archived) {
                alert(`✓ "${name}" has been archived (it had existing bookings). It is no longer visible to the public but its financial records are preserved.`);
            } else {
                alert(`✓ "${name}" permanently deleted.`);
            }
            fetchEvents();
        } catch (err) {
            alert('Deletion failed: ' + (err.response?.data?.error || 'Server error'));
        }
    };

    const handleCreate = async () => {
        const name = window.prompt('Master Designation (Event Name):');
        if (!name) return;
        try {
            await api.post('/admin/events', { 
                name, 
                status: 'Draft',
                date: new Date().toISOString().split('T')[0],
                price: 499,
                totalCapacity: 150
            });
            fetchEvents();
        } catch (err) {
            alert('Creation failed');
        }
    };

    const filteredEvents = events.filter(e => 
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.venue && e.venue.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading && events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-40 space-y-4">
                <div className="w-12 h-12 border-2 border-[#c9a84c] border-t-transparent animate-spin rounded-full" />
                <p className="text-[10px] tracking-[4px] uppercase text-[#7a6e5c]">Accessing Master Tape...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-hero-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="text-[10px] tracking-[4px] uppercase text-[#c9a84c] mb-3 font-bold flex items-center gap-3">
                       <Music size={14} /> Production Studio
                    </div>
                    <h1 className="font-playfair text-[clamp(42px,4vw,64px)] font-black leading-[0.9] tracking-[-2px] text-white">
                        The Master<br /><em className="text-[#c9a84c] not-italic italic">Catalog</em>
                    </h1>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={handleCreate}
                        className="bg-[#c9a84c] text-[#070503] px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[2px] flex items-center gap-3 hover:bg-[#b8983d] transition-all"
                    >
                        <Plus size={16} /> Forge New Track
                    </button>
                    <button 
                        onClick={fetchEvents}
                        className="w-12 h-12 flex items-center justify-center border border-[#c9a84c]/20 text-[#c9a84c] hover:bg-[#c9a84c]/5 transition-all rounded-xl"
                    >
                        <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a6e5c]" size={18} />
                    <input 
                        type="text"
                        placeholder="SEARCH PRODUCTIONS..."
                        className="w-full bg-[#c9a84c]/5 border border-[#c9a84c]/10 py-4 pl-12 pr-4 text-white text-[11px] tracking-widest focus:outline-none focus:border-[#c9a84c]/40 transition-all rounded-xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="h-[40vh] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#c9a84c]" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredEvents.map((event, idx) => (
                        <motion.div 
                            key={event._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="card-premium group relative overflow-hidden flex flex-col h-full !p-8"
                        >
                            {/* Status and Archival Badges */}
                            <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                                <button 
                                    onClick={() => toggleStatus(event._id, event.status)}
                                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                                        event.status === 'Active' 
                                            ? 'bg-green-500/10 border-green-500/30 text-green-500' 
                                            : event.status === 'Completed'
                                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-500'
                                            : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                                    }`}
                                >
                                    {event.status}
                                </button>
                                {event.isArchived && (
                                    <div className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                                        Archived (Hidden)
                                    </div>
                                )}
                            </div>

                            <div className="mb-8">
                                <div className="w-14 h-14 bg-[#c9a84c]/5 border border-[#c9a84c]/10 flex items-center justify-center text-[#c9a84c] mb-6 rounded-2xl group-hover:bg-[#c9a84c] group-hover:text-[#070503] transition-all duration-500">
                                    <Music size={24} />
                                </div>
                                <h3 className="font-playfair text-2xl font-black text-white uppercase leading-tight group-hover:text-[#c9a84c] transition-colors">
                                    {event.name}
                                </h3>
                                <div className="flex items-center gap-2 text-[10px] tracking-widest text-[#7a6e5c] uppercase mt-2 font-bold">
                                    <MapPin size={12} className="text-[#c9a84c]" /> {event.venue || 'No Venue Set'}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8 pt-8 border-t border-[#c9a84c]/10">
                                <div className="space-y-1">
                                    <p className="text-[9px] tracking-widest text-[#7a6e5c] uppercase">Price</p>
                                    <p className="text-white font-black">₹{event.price}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] tracking-widest text-[#7a6e5c] uppercase">Capacity</p>
                                    <p className="text-white font-black">{event.totalCapacity}</p>
                                </div>
                                <div className="flex items-center gap-2 col-span-2 pt-2">
                                    <Calendar size={14} className="text-[#c9a84c]" />
                                    <span className="text-[10px] text-white font-bold tracking-widest uppercase">
                                        {event.date ? new Date(event.date).toLocaleDateString() : 'TBD'} • {event.time}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-auto pt-6 flex gap-3">
                                {event.isArchived ? (
                                    <button 
                                        onClick={async () => {
                                            if(window.confirm('Restore this event for public viewing?')) {
                                                await api.put(`/admin/events/${event._id}`, { isArchived: false });
                                                fetchEvents();
                                            }
                                        }}
                                        className="flex-1 bg-green-500/10 border border-green-500/20 text-green-500 py-4 rounded-xl text-[10px] font-black uppercase tracking-[3px] flex items-center justify-center gap-2 hover:bg-green-500 hover:text-white transition-all"
                                    >
                                        Restore Production <ArrowUpRight size={14} />
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => window.location.href = `/admin/dashboard?eventId=${event._id}`}
                                        className="flex-1 bg-[#c9a84c]/5 border border-[#c9a84c]/10 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[3px] flex items-center justify-center gap-2 hover:bg-[#c9a84c] hover:text-[#070503] transition-all"
                                    >
                                        Master Desk <ArrowUpRight size={14} />
                                    </button>
                                )}
                                <button 
                                    onClick={() => window.location.href = `/admin/event?eventId=${event._id}`}
                                    className="p-4 bg-[#c9a84c]/5 border border-[#c9a84c]/10 text-[#7a6e5c] hover:text-[#c9a84c] hover:border-[#c9a84c] transition-all rounded-xl"
                                >
                                    <Edit3 size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(event._id, event.name)}
                                    className="p-4 border border-red-500/10 text-red-500/50 hover:text-red-500 hover:border-red-500 transition-all rounded-xl"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
