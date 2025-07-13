import ButtonOne from "./ButtonOne";

const InquiryForm = () => {
    return (
        <div className="w-full p-4 bg-white rounded-2xl hs-shadow">
            <p className="text-center text-[24px] lg:text-[34px] font-bold text-brand-orange pb-4">
                Maybe we should work together?
            </p>
            <form className="space-y-[18px]">
                {/* Name */}
                <div>
                    <label htmlFor="name" className="block font-medium text-gray-700">
                        Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        className="input-field"
                    />
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        className="input-field"
                    />
                </div>

                {/* Contact Number */}
                <div>
                    <label htmlFor="contact" className="block font-medium text-gray-700">
                        Contact Number
                    </label>
                    <input
                        type="tel"
                        id="contact"
                        className="input-field"
                    />
                </div>

                {/* Message */}
                <div>
                    <label htmlFor="message" className="block  font-medium text-gray-700">
                        Message
                    </label>
                    <textarea
                        id="message"
                        rows={4}
                        className="input-field resize-none overflow-y-auto h-[100px] custom-scrollbar"
                    ></textarea>

                </div>

                {/* Submit Button */}
                <ButtonOne
                    text="Submit"
                    type="submit"
                    className="btn-orange"
                />
            </form>
        </div>
    );
};

export default InquiryForm;
