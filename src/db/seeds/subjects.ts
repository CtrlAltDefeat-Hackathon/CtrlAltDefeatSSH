import { db } from '@/db';
import { subjects } from '@/db/schema';

async function main() {
    // Delete all existing subjects first
    await db.delete(subjects);
    
    const sampleSubjects = [
        {
            name: 'Mathematics',
            slug: 'mathematics',
            description: 'Numbers, algebra, and problem solving',
            icon: '📊',
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            name: 'Advanced Mathematics',
            slug: 'advanced-mathematics',
            description: 'Calculus, statistics, trigonometry, and higher mathematical reasoning',
            icon: '🔢',
            createdAt: new Date('2024-01-11').toISOString(),
            updatedAt: new Date('2024-01-11').toISOString(),
        },
        {
            name: 'Physics',
            slug: 'physics',
            description: 'Laws of motion, energy, electricity, and modern physics',
            icon: '⚡',
            createdAt: new Date('2024-01-12').toISOString(),
            updatedAt: new Date('2024-01-12').toISOString(),
        },
        {
            name: 'Chemistry',
            slug: 'chemistry',
            description: 'Chemical reactions, periodic table, and molecular structures',
            icon: '🧪',
            createdAt: new Date('2024-01-13').toISOString(),
            updatedAt: new Date('2024-01-13').toISOString(),
        },
        {
            name: 'Biology',
            slug: 'biology',
            description: 'Living organisms, genetics, ecology, and human anatomy',
            icon: '🧬',
            createdAt: new Date('2024-01-14').toISOString(),
            updatedAt: new Date('2024-01-14').toISOString(),
        },
        {
            name: 'Computer Science',
            slug: 'computer-science',
            description: 'Programming fundamentals, algorithms, and data structures',
            icon: '💻',
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        }
    ];

    await db.insert(subjects).values(sampleSubjects);
    
    console.log('✅ Subjects seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});