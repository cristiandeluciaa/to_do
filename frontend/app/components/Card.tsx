const Card = ({ children, className = "" } : {children: React.ReactElement, className? : string }) => {
    return (
        <div className={`bg-[#1B263B] text-white shadow-lg rounded-sm hover:shadow-xl transition-shadow duration-300 ${className}`}>
            {children}
        </div>
    )
}

export default Card;
