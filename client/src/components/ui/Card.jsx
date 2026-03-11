const Card = ({ children, className = '', ...props }) => (
    <div
        className={`bg-slate-800/50 backdrop-blur border border-slate-700/50
                    rounded-2xl p-5 ${className}`}
        {...props}
    >
        {children}
    </div>
);
export default Card;