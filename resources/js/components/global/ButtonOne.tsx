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
            className={`hs-btn flex items-center align-center gap-2 ${className}`}
            type={type}
            onClick={onClick}
        >
            <span>{text}</span>
            {icon && <span className="icon">{icon}</span>}
        </button>
    );
};

export default ButtonOne;
