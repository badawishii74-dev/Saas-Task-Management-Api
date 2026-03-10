// const Spinner = ({ size = 'md' }) => {
//     const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
//     return (
//         <div className={`${sizes[size]} animate-spin rounded-full border-2 border-white border-t-transparent`} />
//     );
// };
// export default Spinner;

const Spinner = ({ size = 'md', fullPage = false }) => {
    const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

    if (fullPage) return (
        <div className="flex items-center justify-center h-64">
            <div className={`${sizes.lg} animate-spin rounded-full border-2
                             border-indigo-500 border-t-transparent`} />
        </div>
    );

    return (
        <div className={`${sizes[size]} animate-spin rounded-full border-2
                         border-white border-t-transparent`} />
    );
};
export default Spinner;