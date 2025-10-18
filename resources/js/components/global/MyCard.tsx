import React from 'react';
import ButtonOne from './ButtonOne';

interface Card {
    imgUrl: string;
    title: string;
    excerpt: string;
}

const MyCard: React.FC<Card> = ({ imgUrl, title, excerpt }) => {
    return (
        <div className="card-container group bg-brand-white hs-shadow w-full max-w-[350px] rounded-[28px] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
            <div className="overflow-hidden rounded-t-[28px]">
                <img src={imgUrl} alt={title} className="h-auto w-full transition-all duration-300 group-hover:scale-105 group-hover:brightness-90" />
            </div>
            <div className="p-[16px]">
                <div className="flex max-h-[75px] min-h-[75px] w-full items-center">
                    <h3 className="w-full py-2">{title}</h3>
                </div>
                <p className="text-muted-black line-clamp-2 pt-2">{excerpt}</p>
                <ButtonOne text="Read More" type="button" className="btn-orange mt-4 w-full" />
            </div>
        </div>
    );
};

export default MyCard;
