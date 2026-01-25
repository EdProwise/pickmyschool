import { db } from '@/db';
import { reviews } from '@/db/schema';

async function main() {
    const sampleReviews = [
        // 5 STAR REVIEWS (Excellent)
        {
            userId: 1,
            schoolId: 3,
            rating: 5,
            reviewText: "Excellent school! My daughter has been studying here for 3 years now and the transformation is remarkable. The teachers are highly qualified and genuinely care about each student's progress. The science labs are well-equipped with modern instruments, and the library has an extensive collection. The sports facilities are outstanding - my daughter loves the swimming pool and basketball court. Highly recommend this school!",
            photos: JSON.stringify([
                'https://via.placeholder.com/800x600?text=School+Campus+Photo',
                'https://via.placeholder.com/800x600?text=Science+Lab',
                'https://via.placeholder.com/800x600?text=Swimming+Pool'
            ]),
            approvalStatus: 'approved',
            createdAt: new Date('2024-07-15').toISOString(),
            updatedAt: new Date('2024-07-15').toISOString(),
        },
        {
            userId: 1,
            schoolId: 7,
            rating: 5,
            reviewText: "Outstanding educational institution with world-class infrastructure. The smart classrooms with interactive boards make learning engaging and fun. Teachers use innovative teaching methods and are always available for doubt clearing sessions. The school organizes excellent extracurricular activities including robotics, coding clubs, and music classes. My son's confidence and academic performance have improved tremendously. The transportation service with GPS tracking gives us peace of mind.",
            photos: JSON.stringify([
                'https://via.placeholder.com/800x600?text=Smart+Classroom',
                'https://via.placeholder.com/800x600?text=Robotics+Lab'
            ]),
            approvalStatus: 'approved',
            createdAt: new Date('2024-08-22').toISOString(),
            updatedAt: new Date('2024-08-22').toISOString(),
        },
        {
            userId: 1,
            schoolId: 12,
            rating: 5,
            reviewText: "Best decision we made for our child's education! The school maintains exceptional standards in academics and character building. The faculty is experienced and dedicated, focusing on holistic development. Sports facilities are top-notch with professional coaches for various games. The cafeteria serves healthy, hygienic food. Safety measures including CCTV surveillance and security guards are excellent. The school regularly communicates with parents and involves them in the learning process.",
            photos: null,
            approvalStatus: 'approved',
            createdAt: new Date('2024-09-10').toISOString(),
            updatedAt: new Date('2024-09-10').toISOString(),
        },
        {
            userId: 1,
            schoolId: 18,
            rating: 5,
            reviewText: "Phenomenal school with exceptional teaching standards and infrastructure. The computer lab is equipped with latest technology and high-speed internet. Teachers are passionate about teaching and make complex concepts easy to understand. The school has excellent medical facilities with a full-time nurse. Annual day celebrations and sports meets are grand events. My daughter has developed leadership skills and excels in both academics and extracurriculars. Totally worth the investment!",
            photos: JSON.stringify([
                'https://via.placeholder.com/800x600?text=Computer+Lab',
                'https://via.placeholder.com/800x600?text=Annual+Day+Celebration'
            ]),
            approvalStatus: 'approved',
            createdAt: new Date('2024-10-05').toISOString(),
            updatedAt: new Date('2024-10-05').toISOString(),
        },
        {
            userId: 1,
            schoolId: 22,
            rating: 5,
            reviewText: "Absolutely thrilled with this school! The campus is beautiful with well-maintained gardens and play areas. The emphasis on values and ethics alongside academics is commendable. Teachers genuinely care about each child's individual progress and work on their weaknesses. The library has an amazing collection of books and digital resources. Sports infrastructure including basketball, cricket, and tennis courts is impressive. The school also has excellent tie-ups with international schools for exchange programs.",
            photos: JSON.stringify([
                'https://via.placeholder.com/800x600?text=School+Garden',
                'https://via.placeholder.com/800x600?text=Sports+Ground'
            ]),
            approvalStatus: 'approved',
            createdAt: new Date('2024-11-12').toISOString(),
            updatedAt: new Date('2024-11-12').toISOString(),
        },

        // 4 STAR REVIEWS (Very Good)
        {
            userId: 1,
            schoolId: 5,
            rating: 4,
            reviewText: "Great school overall with good infrastructure and dedicated teachers. The computer lab has the latest equipment and the smart classrooms make learning interactive. The curriculum is well-designed and focuses on practical knowledge. However, the cafeteria food could be better in terms of variety. The transport service is reliable with GPS tracking which is reassuring. My son is enjoying his time here and his grades have improved significantly. Would definitely recommend to other parents.",
            photos: null,
            approvalStatus: 'approved',
            createdAt: new Date('2024-06-28').toISOString(),
            updatedAt: new Date('2024-06-28').toISOString(),
        },
        {
            userId: 1,
            schoolId: 9,
            rating: 4,
            reviewText: "Very good school with excellent academic focus and modern facilities. Teachers are well-qualified and approachable. The school has good sports facilities and encourages students to participate in various competitions. The library is well-stocked with books for all age groups. Only concern is that sometimes parent-teacher meetings could be more frequent for better communication. Overall, a solid choice for quality education and the fees are reasonable for the facilities provided.",
            photos: JSON.stringify([
                'https://via.placeholder.com/800x600?text=Library+Interior'
            ]),
            approvalStatus: 'approved',
            createdAt: new Date('2024-07-20').toISOString(),
            updatedAt: new Date('2024-08-05').toISOString(),
        },
        {
            userId: 1,
            schoolId: 14,
            rating: 4,
            reviewText: "Impressive school with strong academics and good infrastructure. The science labs are well-equipped and students get hands-on experience. Teachers use multimedia presentations which makes learning interesting. The school organizes educational trips and workshops regularly. The playground is spacious and well-maintained. Transportation facility is good with trained drivers. My only suggestion would be to improve the variety of extracurricular activities offered. Overall satisfied with the education quality.",
            photos: JSON.stringify([
                'https://via.placeholder.com/800x600?text=Chemistry+Lab',
                'https://via.placeholder.com/800x600?text=School+Playground'
            ]),
            approvalStatus: 'approved',
            createdAt: new Date('2024-08-15').toISOString(),
            updatedAt: new Date('2024-08-15').toISOString(),
        },
        {
            userId: 1,
            schoolId: 19,
            rating: 4,
            reviewText: "Good school with competent teachers and decent facilities. The academic standards are high and students are prepared well for board exams. The school has proper safety measures with CCTV and security personnel. Digital classrooms are a great addition. The only area that needs improvement is the maintenance of some older building sections. The admin staff is helpful and responsive. My daughter is happy here and that's what matters most. Would rate 4 out of 5 overall.",
            photos: null,
            approvalStatus: 'approved',
            createdAt: new Date('2024-09-25').toISOString(),
            updatedAt: new Date('2024-09-25').toISOString(),
        },
        {
            userId: 1,
            schoolId: 24,
            rating: 4,
            reviewText: "Solid school with good teaching faculty and infrastructure. The school follows a comprehensive curriculum with focus on both theory and practical application. Computer lab is well-maintained with updated software. Teachers are supportive and encourage student participation. The cafeteria serves decent food though menu could be more diverse. Transportation service is punctual and buses are in good condition. The school could invest more in art and music programs but otherwise it's a great place for learning.",
            photos: JSON.stringify([
                'https://via.placeholder.com/800x600?text=Cafeteria'
            ]),
            approvalStatus: 'approved',
            createdAt: new Date('2024-11-08').toISOString(),
            updatedAt: new Date('2024-11-22').toISOString(),
        },

        // 3 STAR REVIEWS (Good/Average)
        {
            userId: 1,
            schoolId: 2,
            rating: 3,
            reviewText: "Decent school with average facilities. The teachers are good but the student-teacher ratio could be better for individual attention. The playground needs maintenance and the library could use more books especially for higher classes. The academic curriculum is strong but extracurricular activities are limited. Computer lab is okay but needs more systems. Good option considering the fees charged. The management is approachable but response time could be faster. It's an okay school for basic education needs.",
            photos: null,
            approvalStatus: 'approved',
            createdAt: new Date('2024-06-10').toISOString(),
            updatedAt: new Date('2024-06-10').toISOString(),
        },
        {
            userId: 1,
            schoolId: 8,
            rating: 3,
            reviewText: "Average school with standard facilities. Teaching quality varies - some teachers are excellent while others are just okay. The infrastructure is decent but not outstanding. Labs are there but equipment is limited. The school has basic sports facilities but lacks variety in games offered. Transportation is available but buses could be more comfortable. Cafeteria food is average. For the fees, I expected slightly better facilities. It's an acceptable option but there's definitely room for improvement in multiple areas.",
            photos: JSON.stringify([
                'https://via.placeholder.com/800x600?text=School+Building'
            ]),
            approvalStatus: 'approved',
            createdAt: new Date('2024-07-05').toISOString(),
            updatedAt: new Date('2024-07-05').toISOString(),
        },
        {
            userId: 1,
            schoolId: 11,
            rating: 3,
            reviewText: "The school is okay with standard educational offerings. Classrooms are clean but a bit cramped. Teachers are experienced but seem overloaded with work. The library timing could be extended for better access. Sports period is limited to once a week which is not enough. The school needs to focus more on practical learning rather than just theory. Transport facility is reliable though. Overall, it meets basic requirements but doesn't exceed expectations. Management could be more proactive in addressing parent concerns.",
            photos: null,
            approvalStatus: 'approved',
            createdAt: new Date('2024-08-18').toISOString(),
            updatedAt: new Date('2024-08-30').toISOString(),
        },
        {
            userId: 1,
            schoolId: 16,
            rating: 3,
            reviewText: "Fair school with room for improvement. The academic focus is good and syllabus completion is timely. However, the infrastructure needs upgrades - classrooms need better ventilation and the labs need more equipment. Teacher quality is inconsistent across different subjects. The school has potential but needs better management. Sports facilities are basic and could be enhanced. The fee structure is reasonable but value for money is just average. Would suggest parents visit and assess before admission.",
            photos: JSON.stringify([
                'https://via.placeholder.com/800x600?text=Classroom+View'
            ]),
            approvalStatus: 'approved',
            createdAt: new Date('2024-09-14').toISOString(),
            updatedAt: new Date('2024-09-14').toISOString(),
        },
        {
            userId: 1,
            schoolId: 21,
            rating: 3,
            reviewText: "Middle-of-the-road school with standard offerings. The teaching is adequate but lacks innovation in methodology. Infrastructure is functional but dated in some areas. Computer systems in lab are old and slow. The school organizes annual functions and competitions which is good. However, communication with parents could be better. Transport service is okay but buses need maintenance. Cafeteria options are limited. It's a decent neighborhood school but might not be the best choice if you're looking for excellence in all areas.",
            photos: null,
            approvalStatus: 'approved',
            createdAt: new Date('2024-10-20').toISOString(),
            updatedAt: new Date('2024-11-03').toISOString(),
        },

        // 2 STAR REVIEWS (Below Average)
        {
            userId: 1,
            schoolId: 4,
            rating: 2,
            reviewText: "The school has potential but needs significant improvement. The infrastructure is okay but maintenance is lacking - broken furniture in some classrooms and labs are poorly equipped. Some teachers are excellent while others seem disinterested and don't engage students properly. The transport is often delayed by 15-20 minutes which is frustrating. Communication from administration could be much better - they rarely respond to emails promptly. Expected more for the fees charged. Considering other options for next academic year.",
            photos: null,
            approvalStatus: 'approved',
            createdAt: new Date('2024-07-12').toISOString(),
            updatedAt: new Date('2024-07-12').toISOString(),
        },
        {
            userId: 1,
            schoolId: 13,
            rating: 2,
            reviewText: "Disappointed with several aspects of this school. The facilities shown during admission were not the same as what students get to use. Classrooms are overcrowded with 45+ students making it difficult for teachers to give individual attention. The promised smart classrooms are rarely used. Library has limited books and timing is restricted. Sports period is often cancelled for extra academic classes. The management doesn't seem receptive to parent feedback. Not satisfied with the overall experience and quality of education provided.",
            photos: JSON.stringify([
                'https://via.placeholder.com/800x600?text=Overcrowded+Classroom'
            ]),
            approvalStatus: 'approved',
            createdAt: new Date('2024-09-08').toISOString(),
            updatedAt: new Date('2024-09-08').toISOString(),
        },
        {
            userId: 1,
            schoolId: 20,
            rating: 2,
            reviewText: "Below expectations in multiple areas. Teachers frequently go on leave without proper replacement arrangements affecting the learning continuity. The computer lab has outdated systems and often has technical issues. Playground maintenance is poor and safety could be a concern. The cafeteria hygiene standards are questionable. Transport buses are not well-maintained. Administration is slow to respond to concerns and complaints. The school needs major improvements in infrastructure, teaching quality, and management responsiveness before I can recommend it to others.",
            photos: null,
            approvalStatus: 'approved',
            createdAt: new Date('2024-10-15').toISOString(),
            updatedAt: new Date('2024-10-15').toISOString(),
        },

        // 1 STAR REVIEWS (Poor)
        {
            userId: 1,
            schoolId: 6,
            rating: 1,
            reviewText: "Very disappointed with the school. The facilities are not as advertised during admission - many amenities shown in brochure don't exist or are non-functional. Classrooms are overcrowded with over 50 students per class. The labs are poorly maintained with broken equipment. Teachers frequently go on leave without informing and no substitute is arranged. The management is completely unresponsive to parent concerns and emails go unanswered for weeks. Safety measures are inadequate. Looking to transfer my child to another school as soon as possible. Would not recommend this school to anyone.",
            photos: JSON.stringify([
                'https://via.placeholder.com/800x600?text=Poor+Lab+Condition'
            ]),
            approvalStatus: 'approved',
            createdAt: new Date('2024-08-05').toISOString(),
            updatedAt: new Date('2024-08-05').toISOString(),
        },
        {
            userId: 1,
            schoolId: 15,
            rating: 1,
            reviewText: "Extremely poor experience with this school. The infrastructure is in terrible condition - leaking roofs during monsoon, broken benches, and dirty washrooms. Teaching quality is substandard with inexperienced teachers who can't control the class. There's no proper curriculum planning and syllabus is always running behind schedule. The promised transportation has irregular service with frequent breakdowns. Safety is a major concern with no proper security measures. The principal is rarely available and the administrative staff is rude and unhelpful. Regret admitting my child here. Parents should stay away from this school.",
            photos: null,
            approvalStatus: 'approved',
            createdAt: new Date('2024-11-18').toISOString(),
            updatedAt: new Date('2024-12-02').toISOString(),
        },
    ];

    await db.insert(reviews).values(sampleReviews);
    
    console.log('✅ Reviews seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});