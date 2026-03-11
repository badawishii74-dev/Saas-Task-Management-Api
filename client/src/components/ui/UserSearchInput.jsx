import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import api from '../../api/axios';

export default function UserSearchInput({ onSelect, placeholder = 'Search users...' }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const debounceRef = useRef(null);
    const containerRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSearch = (value) => {
        setQuery(value);
        setSelected(null);
        onSelect(null);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (value.trim().length < 2) {
            setResults([]);
            setOpen(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await api.get(`/users/search?q=${encodeURIComponent(value)}`);
                setResults(res.data.users || []);
                setOpen(true);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);
    };

    const handleSelect = (user) => {
        setSelected(user);
        setQuery(user.name);
        setResults([]);
        setOpen(false);
        onSelect(user);
    };

    const handleClear = () => {
        setSelected(null);
        setQuery('');
        setResults([]);
        setOpen(false);
        onSelect(null);
    };

    return (
        <div ref={containerRef} className="relative flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Search User</label>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => results.length > 0 && setOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800 border
                               border-slate-700 text-white placeholder-slate-500
                               focus:outline-none focus:ring-2 focus:ring-indigo-500
                               transition-all duration-200 text-sm"
                />
                {(query || selected) && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500
                                   hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Selected user pill */}
            {selected && (
                <div className="flex items-center gap-2 px-3 py-2 bg-indigo-500/10
                                border border-indigo-500/20 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500
                                    to-purple-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                            {selected.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-indigo-300 text-sm font-medium truncate">
                            {selected.name}
                        </p>
                        <p className="text-indigo-400/60 text-xs truncate">{selected.email}</p>
                    </div>
                    <span className="text-xs text-indigo-400/50 font-mono truncate max-w-24">
                        {selected._id}
                    </span>
                </div>
            )}

            {/* Dropdown */}
            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800
                                border border-slate-700/50 rounded-xl shadow-2xl shadow-black/50
                                z-50 overflow-hidden">
                    {loading ? (
                        <div className="p-4 text-center text-slate-400 text-sm">
                            Searching...
                        </div>
                    ) : results.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 text-sm">
                            No users found
                        </div>
                    ) : (
                        results.map((u) => (
                            <button
                                key={u._id}
                                onClick={() => handleSelect(u)}
                                className="w-full flex items-center gap-3 px-4 py-3
                                           hover:bg-slate-700/50 transition-colors text-left"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br
                                                from-indigo-500 to-purple-600 flex items-center
                                                justify-center flex-shrink-0">
                                    <span className="text-white text-sm font-bold">
                                        {u.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium truncate">
                                        {u.name}
                                    </p>
                                    <p className="text-slate-400 text-xs truncate">{u.email}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}