const Input = ({ label, error, className = '', ...props }) => (
    <div className="flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
        <input
            className={`w-full px-4 py-2.5 rounded-xl bg-slate-800 border text-white placeholder-slate-500
                        focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200
                        ${error ? 'border-red-500' : 'border-slate-700 hover:border-slate-600'}
                        ${className}`}
            {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
);
export default Input;