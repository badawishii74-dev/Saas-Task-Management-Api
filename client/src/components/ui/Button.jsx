import Spinner from './Spinner';

const variants = {
    primary: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
    danger: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-300',
};

const Button = ({ children, variant = 'primary', loading, className = '', ...props }) => (
    <button
        disabled={loading || props.disabled}
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium
                    transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                    ${variants[variant]} ${className}`}
        {...props}
    >
        {loading && <Spinner size="sm" />}
        {children}
    </button>
);
export default Button;