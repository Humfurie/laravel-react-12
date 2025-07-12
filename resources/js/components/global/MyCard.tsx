import React from "react";
import ButtonOne from "./ButtonOne";

interface Card {
    imgUrl: string;
    title: string;
    excerpt: string;
}

const MyCard: React.FC<Card> = (
    {
        imgUrl,
        title,
        excerpt
    }
) => {
    return (
        <div className="card-container group bg-brand-white rounded-[28px] shadow-md w-full max-w-[350px] transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
            <div className="overflow-hidden rounded-t-[28px]">
                <img
                    src={imgUrl}
                    alt={title}
                    className="w-full h-auto transition-all duration-300 group-hover:brightness-90 group-hover:scale-105"
                />
            </div>
            <div className="p-[16px]">
                <div className="flex items-center w-full max-h-[75px] min-h-[75px]">
                    <h3 className="py-2 w-full">{title}</h3>

                </div>
                <p className="pt-2 text-muted-black line-clamp-2">{excerpt}</p>
                <ButtonOne
                    text="Read More"
                    type="button"
                    className="btn-orange w-full mt-4"
                />
            </div>
        </div>

    )
}

export default MyCard
