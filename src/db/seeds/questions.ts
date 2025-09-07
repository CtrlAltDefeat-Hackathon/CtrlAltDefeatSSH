import { db } from '@/db';
import { questions } from '@/db/schema';

async function main() {
    const sampleQuestions = [
        // Calculus - 5 questions
        {
            subjectId: 2,
            questionText: 'Find the limit: lim(x→0) (sin(x)/x)',
            explanation: 'This is a fundamental limit in calculus. Using L\'Hôpital\'s rule or the squeeze theorem, we can show that lim(x→0) (sin(x)/x) = 1. As x approaches 0, both sin(x) and x approach 0, creating a 0/0 indeterminate form. By L\'Hôpital\'s rule: lim(x→0) (sin(x)/x) = lim(x→0) (cos(x)/1) = cos(0) = 1.',
            difficultyLevel: 'easy',
            xpReward: 5,
            coinReward: 1,
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            subjectId: 2,
            questionText: 'Find the derivative of f(x) = x²e^x using the product rule',
            explanation: 'Using the product rule: (uv)\' = u\'v + uv\'. Let u = x² and v = e^x. Then u\' = 2x and v\' = e^x. Therefore: f\'(x) = (2x)(e^x) + (x²)(e^x) = 2xe^x + x²e^x = xe^x(2 + x). The final answer is f\'(x) = xe^x(2 + x).',
            difficultyLevel: 'medium',
            xpReward: 10,
            coinReward: 2,
            createdAt: new Date('2024-01-11').toISOString(),
            updatedAt: new Date('2024-01-11').toISOString(),
        },
        {
            subjectId: 2,
            questionText: 'Evaluate the integral: ∫ x ln(x) dx',
            explanation: 'Use integration by parts: ∫ u dv = uv - ∫ v du. Let u = ln(x) and dv = x dx. Then du = (1/x)dx and v = x²/2. Applying the formula: ∫ x ln(x) dx = ln(x) · (x²/2) - ∫ (x²/2) · (1/x) dx = (x²ln(x))/2 - ∫ x/2 dx = (x²ln(x))/2 - x²/4 + C = (x²/4)(2ln(x) - 1) + C.',
            difficultyLevel: 'hard',
            xpReward: 15,
            coinReward: 3,
            createdAt: new Date('2024-01-12').toISOString(),
            updatedAt: new Date('2024-01-12').toISOString(),
        },
        {
            subjectId: 2,
            questionText: 'Find the critical points of f(x) = x³ - 6x² + 9x + 2',
            explanation: 'Critical points occur where f\'(x) = 0 or f\'(x) is undefined. First, find the derivative: f\'(x) = 3x² - 12x + 9. Set f\'(x) = 0: 3x² - 12x + 9 = 0. Divide by 3: x² - 4x + 3 = 0. Factor: (x - 1)(x - 3) = 0. Therefore, x = 1 and x = 3 are the critical points. We can verify: f(1) = 6 and f(3) = 2.',
            difficultyLevel: 'medium',
            xpReward: 10,
            coinReward: 2,
            createdAt: new Date('2024-01-13').toISOString(),
            updatedAt: new Date('2024-01-13').toISOString(),
        },
        {
            subjectId: 2,
            questionText: 'Use the fundamental theorem of calculus to evaluate: ∫₀¹ 2x dx',
            explanation: 'By the fundamental theorem of calculus, ∫ₐᵇ f(x) dx = F(b) - F(a), where F\'(x) = f(x). Here, f(x) = 2x, so F(x) = x². Therefore: ∫₀¹ 2x dx = F(1) - F(0) = 1² - 0² = 1 - 0 = 1. This represents the area under the curve y = 2x from x = 0 to x = 1.',
            difficultyLevel: 'easy',
            xpReward: 5,
            coinReward: 1,
            createdAt: new Date('2024-01-14').toISOString(),
            updatedAt: new Date('2024-01-14').toISOString(),
        },

        // Statistics and Probability - 4 questions
        {
            subjectId: 2,
            questionText: 'A normal distribution has mean μ = 50 and standard deviation σ = 10. Find P(X > 60).',
            explanation: 'To find P(X > 60), we standardize using Z = (X - μ)/σ. Here: Z = (60 - 50)/10 = 1. So P(X > 60) = P(Z > 1). From the standard normal table, P(Z ≤ 1) ≈ 0.8413. Therefore: P(Z > 1) = 1 - P(Z ≤ 1) = 1 - 0.8413 = 0.1587 or approximately 15.87%.',
            difficultyLevel: 'medium',
            xpReward: 10,
            coinReward: 2,
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            subjectId: 2,
            questionText: 'Calculate the sample variance for the data set: {2, 4, 6, 8, 10}',
            explanation: 'Sample variance formula: s² = Σ(xᵢ - x̄)²/(n-1). First, find the mean: x̄ = (2+4+6+8+10)/5 = 30/5 = 6. Next, calculate deviations squared: (2-6)² = 16, (4-6)² = 4, (6-6)² = 0, (8-6)² = 4, (10-6)² = 16. Sum = 16+4+0+4+16 = 40. Sample variance: s² = 40/(5-1) = 40/4 = 10.',
            difficultyLevel: 'easy',
            xpReward: 5,
            coinReward: 1,
            createdAt: new Date('2024-01-16').toISOString(),
            updatedAt: new Date('2024-01-16').toISOString(),
        },
        {
            subjectId: 2,
            questionText: 'In a binomial distribution with n = 20 and p = 0.3, find P(X = 5)',
            explanation: 'For binomial probability: P(X = k) = C(n,k) × p^k × (1-p)^(n-k). Here: P(X = 5) = C(20,5) × (0.3)⁵ × (0.7)¹⁵. Calculate: C(20,5) = 20!/(5!×15!) = 15,504. (0.3)⁵ = 0.00243, (0.7)¹⁵ ≈ 0.0047589. Therefore: P(X = 5) = 15,504 × 0.00243 × 0.0047589 ≈ 0.1789 or about 17.89%.',
            difficultyLevel: 'hard',
            xpReward: 15,
            coinReward: 3,
            createdAt: new Date('2024-01-17').toISOString(),
            updatedAt: new Date('2024-01-17').toISOString(),
        },
        {
            subjectId: 2,
            questionText: 'Calculate the correlation coefficient for X and Y given: Σxy = 150, Σx² = 100, Σy² = 200, n = 10, x̄ = 5, ȳ = 8',
            explanation: 'The correlation coefficient formula is: r = [Σxy - n(x̄)(ȳ)] / √[(Σx² - n(x̄)²)(Σy² - n(ȳ)²)]. Substituting values: Numerator = 150 - 10(5)(8) = 150 - 400 = -250. Denominator = √[(100 - 10(25))(200 - 10(64))] = √[(100 - 250)(200 - 640)] = √[(-150)(-440)] = √66,000 ≈ 256.9. Therefore: r = -250/256.9 ≈ -0.973, indicating a strong negative correlation.',
            difficultyLevel: 'hard',
            xpReward: 15,
            coinReward: 3,
            createdAt: new Date('2024-01-18').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString(),
        },

        // Trigonometry and Complex Numbers - 4 questions
        {
            subjectId: 2,
            questionText: 'Convert the complex number z = 3 + 4i to polar form',
            explanation: 'For z = a + bi, polar form is z = r(cos θ + i sin θ) where r = √(a² + b²) and θ = arctan(b/a). Here: r = √(3² + 4²) = √(9 + 16) = √25 = 5. θ = arctan(4/3) ≈ 0.927 radians or 53.13°. Therefore, z = 5(cos(53.13°) + i sin(53.13°)) or z = 5e^(i×0.927).',
            difficultyLevel: 'medium',
            xpReward: 10,
            coinReward: 2,
            createdAt: new Date('2024-01-19').toISOString(),
            updatedAt: new Date('2024-01-19').toISOString(),
        },
        {
            subjectId: 2,
            questionText: 'Solve the equation: sin(2x) = √3/2 for 0 ≤ x ≤ π',
            explanation: 'We need sin(2x) = √3/2. From the unit circle, sin(θ) = √3/2 when θ = π/3 or θ = 2π/3. So: 2x = π/3 or 2x = 2π/3. This gives: x = π/6 or x = π/3. We can verify: sin(2×π/6) = sin(π/3) = √3/2 ✓ and sin(2×π/3) = sin(2π/3) = √3/2 ✓. Therefore, x = π/6 and x = π/3.',
            difficultyLevel: 'medium',
            xpReward: 10,
            coinReward: 2,
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            subjectId: 2,
            questionText: 'Find all cube roots of z = 8i',
            explanation: 'First, convert to polar form: z = 8i = 8(cos(π/2) + i sin(π/2)). For cube roots of z = r(cos θ + i sin θ), we use: ∛z = ∛r[cos((θ + 2πk)/3) + i sin((θ + 2πk)/3)] for k = 0, 1, 2. Here r = 8, θ = π/2. The three roots are: k=0: 2[cos(π/6) + i sin(π/6)] = 2(√3/2 + i/2) = √3 + i. k=1: 2[cos(5π/6) + i sin(5π/6)] = 2(-√3/2 + i/2) = -√3 + i. k=2: 2[cos(3π/2) + i sin(3π/2)] = 2(0 - i) = -2i.',
            difficultyLevel: 'hard',
            xpReward: 15,
            coinReward: 3,
            createdAt: new Date('2024-01-21').toISOString(),
            updatedAt: new Date('2024-01-21').toISOString(),
        },
        {
            subjectId: 2,
            questionText: 'Prove the identity: cos(2θ) = 2cos²(θ) - 1',
            explanation: 'Starting with the double angle formula cos(2θ) = cos²(θ) - sin²(θ), we use the Pythagorean identity sin²(θ) = 1 - cos²(θ). Substituting: cos(2θ) = cos²(θ) - (1 - cos²(θ)) = cos²(θ) - 1 + cos²(θ) = 2cos²(θ) - 1. This identity is fundamental in trigonometry and can also be derived using Euler\'s formula or the angle addition formula.',
            difficultyLevel: 'easy',
            xpReward: 5,
            coinReward: 1,
            createdAt: new Date('2024-01-22').toISOString(),
            updatedAt: new Date('2024-01-22').toISOString(),
        },

        // Linear Algebra - 4 questions
        {
            subjectId: 2,
            questionText: 'Find the determinant of the matrix A = [[2, 3], [1, 4]]',
            explanation: 'For a 2×2 matrix A = [[a, b], [c, d]], the determinant is det(A) = ad - bc. Here: a = 2, b = 3, c = 1, d = 4. Therefore: det(A) = (2)(4) - (3)(1) = 8 - 3 = 5. Since the determinant is non-zero, the matrix is invertible.',
            difficultyLevel: 'easy',
            xpReward: 5,
            coinReward: 1,
            createdAt: new Date('2024-01-23').toISOString(),
            updatedAt: new Date('2024-01-23').toISOString(),
        },
        {
            subjectId: 2,
            questionText: 'Find the eigenvalues of matrix A = [[3, 1], [0, 2]]',
            explanation: 'Eigenvalues are found by solving det(A - λI) = 0. Here: A - λI = [[3-λ, 1], [0, 2-λ]]. The determinant is: (3-λ)(2-λ) - (1)(0) = (3-λ)(2-λ) = 6 - 3λ - 2λ + λ² = λ² - 5λ + 6. Setting equal to zero: λ² - 5λ + 6 = 0. Factoring: (λ - 2)(λ - 3) = 0. Therefore, the eigenvalues are λ₁ = 2 and λ₂ = 3.',
            difficultyLevel: 'medium',
            xpReward: 10,
            coinReward: 2,
            createdAt: new Date('2024-01-24').toISOString(),
            updatedAt: new Date('2024-01-24').toISOString(),
        },
        {
            subjectId: 2,
            questionText: 'Calculate the dot product of vectors u = (2, -1, 3) and v = (1, 4, -2)',
            explanation: 'The dot product of two vectors u = (u₁, u₂, u₃) and v = (v₁, v₂, v₃) is: u · v = u₁v₁ + u₂v₂ + u₃v₃. Here: u · v = (2)(1) + (-1)(4) + (3)(-2) = 2 - 4 - 6 = -8. Since the dot product is negative, the angle between the vectors is obtuse (greater than 90°).',
            difficultyLevel: 'easy',
            xpReward: 5,
            coinReward: 1,
            createdAt: new Date('2024-01-25').toISOString(),
            updatedAt: new Date('2024-01-25').toISOString(),
        },
        {
            subjectId: 2,
            questionText: 'Perform Gaussian elimination to solve: 2x + y = 5, x - y = 1',
            explanation: 'Write as augmented matrix: [[2, 1, 5], [1, -1, 1]]. Step 1: R₁ ↔ R₂ to get leading 1: [[1, -1, 1], [2, 1, 5]]. Step 2: R₂ - 2R₁ → R₂: [[1, -1, 1], [0, 3, 3]]. Step 3: (1/3)R₂ → R₂: [[1, -1, 1], [0, 1, 1]]. Step 4: R₁ + R₂ → R₁: [[1, 0, 2], [0, 1, 1]]. Therefore: x = 2, y = 1. Verification: 2(2) + 1 = 5 ✓ and 2 - 1 = 1 ✓.',
            difficultyLevel: 'medium',
            xpReward: 10,
            coinReward: 2,
            createdAt: new Date('2024-01-26').toISOString(),
            updatedAt: new Date('2024-01-26').toISOString(),
        },

        // Advanced Topics - 3 questions
        {
            subjectId: 2,
            questionText: 'Solve the differential equation: dy/dx = 2xy with initial condition y(0) = 1',
            explanation: 'This is a separable differential equation. Separate variables: dy/y = 2x dx. Integrate both sides: ∫(1/y)dy = ∫2x dx, which gives ln|y| = x² + C. Exponentiating: |y| = e^(x²+C) = Ae^(x²) where A = e^C. Since y can be positive or negative, y = Ae^(x²). Using initial condition y(0) = 1: 1 = Ae^0 = A, so A = 1. Therefore, y = e^(x²).',
            difficultyLevel: 'hard',
            xpReward: 15,
            coinReward: 3,
            createdAt: new Date('2024-01-27').toISOString(),
            updatedAt: new Date('2024-01-27').toISOString(),
        },
        {
            subjectId: 2,
            questionText: 'Find the sum of the infinite series: Σ(n=1 to ∞) 1/2ⁿ',
            explanation: 'This is a geometric series with first term a = 1/2 and common ratio r = 1/2. Since |r| = 1/2 < 1, the series converges. The sum of an infinite geometric series is S = a/(1-r) when |r| < 1. Here: S = (1/2)/(1-1/2) = (1/2)/(1/2) = 1. We can verify this by noting that 1/2 + 1/4 + 1/8 + 1/16 + ... approaches 1.',
            difficultyLevel: 'medium',
            xpReward: 10,
            coinReward: 2,
            createdAt: new Date('2024-01-28').toISOString(),
            updatedAt: new Date('2024-01-28').toISOString(),
        },
        {
            subjectId: 2,
            questionText: 'Find the Taylor series expansion of f(x) = e^x centered at x = 0 up to the x³ term',
            explanation: 'The Taylor series of f(x) about x = a is: f(x) = Σ(n=0 to ∞) [f^(n)(a)/n!](x-a)ⁿ. For f(x) = e^x at a = 0: f(0) = e^0 = 1, f\'(0) = e^0 = 1, f\'\'(0) = e^0 = 1, f\'\'\'(0) = e^0 = 1. The series is: e^x = 1 + x + x²/2! + x³/3! + ... = 1 + x + x²/2 + x³/6 + ... Therefore, up to x³ term: e^x ≈ 1 + x + x²/2 + x³/6.',
            difficultyLevel: 'hard',
            xpReward: 15,
            coinReward: 3,
            createdAt: new Date('2024-01-29').toISOString(),
            updatedAt: new Date('2024-01-29').toISOString(),
        },
    ];

    await db.insert(questions).values(sampleQuestions);
    
    console.log('✅ Advanced Mathematics questions seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});