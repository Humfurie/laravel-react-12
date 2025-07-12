import React from 'react';

interface ButtonOneProps {
    text: string;
    type: "button" | "submit" | "reset";
    className?: string;
    icon?: React.ReactNode; // Can be an icon component
    onClick?: () => void;
}

const ButtonOne: React.FC<ButtonOneProps> = ({
    text,
    type,
    className = '',
    icon,
    onClick
}) => {
    return (
        <button
            className={`hs-btn text-center gap-2 ${className} ${icon ? "flex items-center align-center" : ""}`}
            type={type}
            onClick={onClick}
        >
            <span>{text}</span>
            {icon && <span className="icon">{icon}</span>}
        </button>
    );
};

export default ButtonOne;
