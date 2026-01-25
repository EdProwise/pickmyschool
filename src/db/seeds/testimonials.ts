import { db } from '@/db';
import { testimonials } from '@/db/schema';

async function main() {
    const sampleTestimonials = [
        {
            parentName: 'Rajesh Kumar',
            location: 'Delhi',
            rating: 5,
            testimonialText: 'PickMySchool made our school search journey incredibly smooth. We were looking for a CBSE school in South Delhi with good sports facilities and strong academics. The platform provided detailed information about each school, including fees structure, facilities, and even virtual tours. What impressed me most was the ability to compare multiple schools side by side. We could filter schools based on our budget and preferences, which saved us countless hours of visiting schools physically. My daughter got admission to her dream school, and we couldn\'t be happier. I highly recommend PickMySchool to all parents who want a stress-free school search experience.',
            avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Rajesh+Kumar',
            featured: true,
            displayOrder: 1,
            createdAt: new Date('2024-07-15').toISOString(),
            updatedAt: new Date('2024-07-15').toISOString(),
        },
        {
            parentName: 'Priya Sharma',
            location: 'Mumbai',
            rating: 5,
            testimonialText: 'As a working mother, I had limited time to research schools for my son. PickMySchool was a lifesaver! The detailed filters helped me narrow down options based on board, fees range, and location. I particularly loved the facility images and parent reviews section. The contact information was accurate, and I could directly reach out to schools through WhatsApp. Within two weeks, we shortlisted three excellent schools and my son is now studying in a wonderful ICSE school in Andheri. The platform is user-friendly and provides all the information parents need in one place. Thank you PickMySchool for making this process so efficient!',
            avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Priya+Sharma',
            featured: true,
            displayOrder: 2,
            createdAt: new Date('2024-08-10').toISOString(),
            updatedAt: new Date('2024-08-10').toISOString(),
        },
        {
            parentName: 'Mohammed Khan',
            location: 'Bangalore',
            rating: 5,
            testimonialText: 'Finding the right school in Bangalore\'s competitive education landscape seemed daunting initially. PickMySchool simplified everything! The AI-powered search recommendations were spot-on based on our requirements. We wanted a school with strong STEM programs and international curriculum options. The platform showed us exactly what we needed, complete with fee structures, admission timelines, and even teacher-student ratios. The enquiry system was seamless - we sent enquiries to five schools and received responses within 24 hours. Our daughter is now in a fantastic IB school, and the transition has been smooth. This platform is a must-use for modern parents!',
            avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Mohammed+Khan',
            featured: true,
            displayOrder: 3,
            createdAt: new Date('2024-09-05').toISOString(),
            updatedAt: new Date('2024-09-05').toISOString(),
        },
        {
            parentName: 'Deepa Iyer',
            location: 'Pune',
            rating: 5,
            testimonialText: 'PickMySchool exceeded all our expectations! We relocated to Pune last year and had no idea about the local schools. The platform provided comprehensive information about schools in different localities, their specializations, and parent testimonials. The virtual tour feature was incredibly helpful during the pandemic. We could explore school campuses from home and get a real feel of the environment. The comparison tool helped us evaluate schools based on multiple parameters like academics, sports facilities, and extracurricular activities. My twins got admission to a wonderful school with excellent arts programs. Forever grateful to PickMySchool for this amazing service!',
            avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Deepa+Iyer',
            featured: true,
            displayOrder: 4,
            createdAt: new Date('2024-09-20').toISOString(),
            updatedAt: new Date('2024-09-20').toISOString(),
        },
        {
            parentName: 'Ankit Gupta',
            location: 'Chennai',
            rating: 5,
            testimonialText: 'As someone who values data-driven decisions, PickMySchool impressed me with its detailed analytics and transparent information. Every school profile had comprehensive details about infrastructure, faculty qualifications, board results, and even fee payment schedules. The platform helped us identify schools that matched our budget without compromising on quality education. The saved schools feature was handy - we could bookmark our favorites and revisit them anytime. The customer support team was also very responsive when we had queries. My son is now thriving in his new school, and we owe this successful admission to PickMySchool. Highly recommended for tech-savvy parents!',
            avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Ankit+Gupta',
            featured: true,
            displayOrder: 5,
            createdAt: new Date('2024-10-12').toISOString(),
            updatedAt: new Date('2024-10-12').toISOString(),
        },
        {
            parentName: 'Lakshmi Naidu',
            location: 'Hyderabad',
            rating: 5,
            testimonialText: 'PickMySchool transformed our school hunting experience from overwhelming to enjoyable! We had specific requirements - good transport facilities, emphasis on traditional values, and affordable fees. The advanced filters on the platform helped us find exactly what we were looking for. I appreciated the honest parent reviews and ratings that gave us real insights into each school\'s culture. The direct enquiry system eliminated the need for multiple phone calls and visits. Within three weeks, we had admission offers from two excellent schools. My daughter loves her new school, and as parents, we are confident about her future. Thank you PickMySchool for being such a reliable guide!',
            avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Lakshmi+Naidu',
            featured: true,
            displayOrder: 6,
            createdAt: new Date('2024-11-08').toISOString(),
            updatedAt: new Date('2024-11-08').toISOString(),
        },
        {
            parentName: 'Suresh Patel',
            location: 'Kolkata',
            rating: 5,
            testimonialText: 'Moving to Kolkata for work meant finding a new school for both my children, and I was worried about the timeline. PickMySchool made the entire process incredibly efficient. The platform\'s location-based search helped us find schools near our new home, and the detailed information about each school\'s admission process was invaluable. We could check availability for multiple classes simultaneously. The gallery images gave us a clear picture of school facilities, and the prospectus downloads saved us multiple trips. Both my children got admission to their preferred schools within a month. I\'ve already recommended PickMySchool to five colleagues who are relocating. It\'s truly a game-changer for busy parents!',
            avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Suresh+Patel',
            featured: true,
            displayOrder: 7,
            createdAt: new Date('2024-11-25').toISOString(),
            updatedAt: new Date('2024-11-25').toISOString(),
        },
        {
            parentName: 'Neha Verma',
            location: 'Ahmedabad',
            rating: 5,
            testimonialText: 'PickMySchool is hands down the best school search platform in India! As a first-time parent, I was clueless about the admission process and school selection criteria. This platform educated me about different boards, teaching methodologies, and what to look for in a school. The comparison feature was brilliant - I could evaluate schools based on fees, facilities, board results, and even transportation options. The real-time chat support answered all my questions promptly. What I loved most was the transparency - no hidden fees or misleading information. My son is now in a fantastic school with excellent sports programs, and he\'s thriving. Every parent should use PickMySchool for a hassle-free admission experience!',
            avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Neha+Verma',
            featured: true,
            displayOrder: 8,
            createdAt: new Date('2024-12-10').toISOString(),
            updatedAt: new Date('2024-12-10').toISOString(),
        },
    ];

    await db.insert(testimonials).values(sampleTestimonials);
    
    console.log('✅ Testimonials seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});