import { db } from '@/db';
import { badges } from '@/db/schema';

async function main() {
    const sampleBadges = [
        {
            name: 'First Quiz',
            description: 'Complete your first quiz',
            icon: '🎉',
            requirementType: 'quiz_completion',
            requirementValue: 1,
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'Perfect Score',
            description: 'Score 100% on any quiz',
            icon: '🏆',
            requirementType: 'perfect_score',
            requirementValue: 100,
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'Week Streak',
            description: 'Complete quizzes for 7 consecutive days',
            icon: '🔥',
            requirementType: 'quiz_streak',
            requirementValue: 7,
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'Month Streak',
            description: 'Complete quizzes for 30 consecutive days',
            icon: '⚡',
            requirementType: 'quiz_streak',
            requirementValue: 30,
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'Math Whiz',
            description: 'Score 80% or higher on 5 Math quizzes',
            icon: '📊',
            requirementType: 'subject_mastery',
            requirementValue: 5,
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'Science Explorer',
            description: 'Score 80% or higher on 5 Science quizzes',
            icon: '🔬',
            requirementType: 'subject_mastery',
            requirementValue: 5,
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'Physics Master',
            description: 'Score 80% or higher on 5 Physics quizzes',
            icon: '⚡',
            requirementType: 'subject_mastery',
            requirementValue: 5,
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'Chemistry Expert',
            description: 'Score 80% or higher on 5 Chemistry quizzes',
            icon: '🧪',
            requirementType: 'subject_mastery',
            requirementValue: 5,
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'Bronze Scholar',
            description: 'Earn 100 XP points',
            icon: '🥉',
            requirementType: 'xp_milestone',
            requirementValue: 100,
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'Silver Scholar',
            description: 'Earn 500 XP points',
            icon: '🥈',
            requirementType: 'xp_milestone',
            requirementValue: 500,
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'Gold Scholar',
            description: 'Earn 1000 XP points',
            icon: '🥇',
            requirementType: 'xp_milestone',
            requirementValue: 1000,
            createdAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'Diamond Scholar',
            description: 'Earn 5000 XP points',
            icon: '💎',
            requirementType: 'xp_milestone',
            requirementValue: 5000,
            createdAt: new Date('2024-01-01').toISOString(),
        }
    ];

    await db.insert(badges).values(sampleBadges);
    
    console.log('✅ Badges seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});