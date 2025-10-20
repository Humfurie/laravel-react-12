import InquiryForm from '@/components/global/InquiryForm';
import MyCard from '@/components/global/MyCard';
import SectionTitle from '@/components/global/SectionTitle';

const blogData = [
    {
        imgUrl: '/images/projects/sample-project1.webp',
        title: 'Why You Should Learn React in 2025',
        excerpt: 'Discover how React JS helps build modern web apps and why it’s still relevant today.',
    },
];

const HomeCTA = () => {
    return (
        <section className="home-blog call-to-action py-[40px] md:py-[80px]">
            <div className="primary-container flex min-h-[546px] flex-col items-center gap-[32px] lg:flex-row">
                {/* Blog Preview */}
                <div className="from-the-blogs w-full lg:w-[40%]">
                    <SectionTitle title="From the Blogs" link="/blogs" />
                    <div className="mt-4 flex flex-col items-center justify-center">
                        {blogData.map((blog, index) => (
                            <MyCard key={index} imgUrl={blog.imgUrl} title={blog.title} excerpt={blog.excerpt} />
                        ))}
                    </div>
                </div>

                {/* Contact Form */}
                <div className="form w-full lg:w-[60%]">
                    <InquiryForm />
                </div>
            </div>
        </section>
    );
};

export default HomeCTA;
