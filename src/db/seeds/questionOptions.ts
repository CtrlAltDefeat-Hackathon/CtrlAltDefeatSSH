import { db } from '@/db';
import { questionOptions } from '@/db/schema';

async function main() {
    const sampleOptions = [
        // Question 1 - Mathematics
        { questionId: 1, optionText: '16', isCorrect: true, optionOrder: 1 },
        { questionId: 1, optionText: '14', isCorrect: false, optionOrder: 2 },
        { questionId: 1, optionText: '18', isCorrect: false, optionOrder: 3 },
        { questionId: 1, optionText: '12', isCorrect: false, optionOrder: 4 },

        // Question 2 - Mathematics  
        { questionId: 2, optionText: '25', isCorrect: true, optionOrder: 1 },
        { questionId: 2, optionText: '20', isCorrect: false, optionOrder: 2 },
        { questionId: 2, optionText: '30', isCorrect: false, optionOrder: 3 },
        { questionId: 2, optionText: '15', isCorrect: false, optionOrder: 4 },

        // Question 3 - Mathematics
        { questionId: 3, optionText: 'x = 5', isCorrect: true, optionOrder: 1 },
        { questionId: 3, optionText: 'x = 3', isCorrect: false, optionOrder: 2 },
        { questionId: 3, optionText: 'x = 7', isCorrect: false, optionOrder: 3 },
        { questionId: 3, optionText: 'x = 4', isCorrect: false, optionOrder: 4 },

        // Question 4 - Mathematics
        { questionId: 4, optionText: '50.24 cm²', isCorrect: true, optionOrder: 1 },
        { questionId: 4, optionText: '25.12 cm²', isCorrect: false, optionOrder: 2 },
        { questionId: 4, optionText: '78.54 cm²', isCorrect: false, optionOrder: 3 },
        { questionId: 4, optionText: '31.42 cm²', isCorrect: false, optionOrder: 4 },

        // Question 5 - Mathematics
        { questionId: 5, optionText: 'y = 2x + 3', isCorrect: true, optionOrder: 1 },
        { questionId: 5, optionText: 'y = 2x - 3', isCorrect: false, optionOrder: 2 },
        { questionId: 5, optionText: 'y = -2x + 3', isCorrect: false, optionOrder: 3 },
        { questionId: 5, optionText: 'y = x + 2', isCorrect: false, optionOrder: 4 },

        // Question 6 - Mathematics
        { questionId: 6, optionText: '120', isCorrect: true, optionOrder: 1 },
        { questionId: 6, optionText: '24', isCorrect: false, optionOrder: 2 },
        { questionId: 6, optionText: '60', isCorrect: false, optionOrder: 3 },
        { questionId: 6, optionText: '720', isCorrect: false, optionOrder: 4 },

        // Question 7 - Mathematics
        { questionId: 7, optionText: '8', isCorrect: true, optionOrder: 1 },
        { questionId: 7, optionText: '4', isCorrect: false, optionOrder: 2 },
        { questionId: 7, optionText: '16', isCorrect: false, optionOrder: 3 },
        { questionId: 7, optionText: '12', isCorrect: false, optionOrder: 4 },

        // Question 8 - Mathematics
        { questionId: 8, optionText: '0.75', isCorrect: true, optionOrder: 1 },
        { questionId: 8, optionText: '0.25', isCorrect: false, optionOrder: 2 },
        { questionId: 8, optionText: '1.33', isCorrect: false, optionOrder: 3 },
        { questionId: 8, optionText: '0.33', isCorrect: false, optionOrder: 4 },

        // Question 9 - Mathematics
        { questionId: 9, optionText: '60°', isCorrect: true, optionOrder: 1 },
        { questionId: 9, optionText: '90°', isCorrect: false, optionOrder: 2 },
        { questionId: 9, optionText: '45°', isCorrect: false, optionOrder: 3 },
        { questionId: 9, optionText: '30°', isCorrect: false, optionOrder: 4 },

        // Question 10 - Mathematics
        { questionId: 10, optionText: '10', isCorrect: true, optionOrder: 1 },
        { questionId: 10, optionText: '15', isCorrect: false, optionOrder: 2 },
        { questionId: 10, optionText: '8', isCorrect: false, optionOrder: 3 },
        { questionId: 10, optionText: '12', isCorrect: false, optionOrder: 4 },

        // Question 11 - Mathematics
        { questionId: 11, optionText: '17', isCorrect: true, optionOrder: 1 },
        { questionId: 11, optionText: '15', isCorrect: false, optionOrder: 2 },
        { questionId: 11, optionText: '19', isCorrect: false, optionOrder: 3 },
        { questionId: 11, optionText: '13', isCorrect: false, optionOrder: 4 },

        // Question 12 - Mathematics
        { questionId: 12, optionText: '81', isCorrect: true, optionOrder: 1 },
        { questionId: 12, optionText: '64', isCorrect: false, optionOrder: 2 },
        { questionId: 12, optionText: '100', isCorrect: false, optionOrder: 3 },
        { questionId: 12, optionText: '49', isCorrect: false, optionOrder: 4 },

        // Question 13 - Science
        { questionId: 13, optionText: 'Oxygen (O₂)', isCorrect: true, optionOrder: 1 },
        { questionId: 13, optionText: 'Carbon dioxide (CO₂)', isCorrect: false, optionOrder: 2 },
        { questionId: 13, optionText: 'Nitrogen (N₂)', isCorrect: false, optionOrder: 3 },
        { questionId: 13, optionText: 'Hydrogen (H₂)', isCorrect: false, optionOrder: 4 },

        // Question 14 - Science
        { questionId: 14, optionText: 'Gravity', isCorrect: true, optionOrder: 1 },
        { questionId: 14, optionText: 'Magnetism', isCorrect: false, optionOrder: 2 },
        { questionId: 14, optionText: 'Friction', isCorrect: false, optionOrder: 3 },
        { questionId: 14, optionText: 'Pressure', isCorrect: false, optionOrder: 4 },

        // Question 15 - Science
        { questionId: 15, optionText: '100°C', isCorrect: true, optionOrder: 1 },
        { questionId: 15, optionText: '90°C', isCorrect: false, optionOrder: 2 },
        { questionId: 15, optionText: '212°F', isCorrect: false, optionOrder: 3 },
        { questionId: 15, optionText: '0°C', isCorrect: false, optionOrder: 4 },

        // Question 16 - Science
        { questionId: 16, optionText: 'Mercury', isCorrect: true, optionOrder: 1 },
        { questionId: 16, optionText: 'Venus', isCorrect: false, optionOrder: 2 },
        { questionId: 16, optionText: 'Mars', isCorrect: false, optionOrder: 3 },
        { questionId: 16, optionText: 'Earth', isCorrect: false, optionOrder: 4 },

        // Question 17 - Science
        { questionId: 17, optionText: 'Photosynthesis', isCorrect: true, optionOrder: 1 },
        { questionId: 17, optionText: 'Respiration', isCorrect: false, optionOrder: 2 },
        { questionId: 17, optionText: 'Transpiration', isCorrect: false, optionOrder: 3 },
        { questionId: 17, optionText: 'Germination', isCorrect: false, optionOrder: 4 },

        // Question 18 - Science
        { questionId: 18, optionText: '299,792,458 m/s', isCorrect: true, optionOrder: 1 },
        { questionId: 18, optionText: '300,000,000 m/s', isCorrect: false, optionOrder: 2 },
        { questionId: 18, optionText: '186,000 m/s', isCorrect: false, optionOrder: 3 },
        { questionId: 18, optionText: '343 m/s', isCorrect: false, optionOrder: 4 },

        // Question 19 - Science
        { questionId: 19, optionText: 'pH 7', isCorrect: true, optionOrder: 1 },
        { questionId: 19, optionText: 'pH 0', isCorrect: false, optionOrder: 2 },
        { questionId: 19, optionText: 'pH 14', isCorrect: false, optionOrder: 3 },
        { questionId: 19, optionText: 'pH 1', isCorrect: false, optionOrder: 4 },

        // Question 20 - Science
        { questionId: 20, optionText: 'Mitochondria', isCorrect: true, optionOrder: 1 },
        { questionId: 20, optionText: 'Nucleus', isCorrect: false, optionOrder: 2 },
        { questionId: 20, optionText: 'Ribosome', isCorrect: false, optionOrder: 3 },
        { questionId: 20, optionText: 'Chloroplast', isCorrect: false, optionOrder: 4 },

        // Question 21 - Science
        { questionId: 21, optionText: 'DNA', isCorrect: true, optionOrder: 1 },
        { questionId: 21, optionText: 'RNA', isCorrect: false, optionOrder: 2 },
        { questionId: 21, optionText: 'Protein', isCorrect: false, optionOrder: 3 },
        { questionId: 21, optionText: 'Lipid', isCorrect: false, optionOrder: 4 },

        // Question 22 - Science
        { questionId: 22, optionText: 'Condensation', isCorrect: true, optionOrder: 1 },
        { questionId: 22, optionText: 'Evaporation', isCorrect: false, optionOrder: 2 },
        { questionId: 22, optionText: 'Sublimation', isCorrect: false, optionOrder: 3 },
        { questionId: 22, optionText: 'Precipitation', isCorrect: false, optionOrder: 4 },

        // Question 23 - Science
        { questionId: 23, optionText: 'Au', isCorrect: true, optionOrder: 1 },
        { questionId: 23, optionText: 'Ag', isCorrect: false, optionOrder: 2 },
        { questionId: 23, optionText: 'Go', isCorrect: false, optionOrder: 3 },
        { questionId: 23, optionText: 'Gd', isCorrect: false, optionOrder: 4 },

        // Question 24 - Science
        { questionId: 24, optionText: 'Sound', isCorrect: true, optionOrder: 1 },
        { questionId: 24, optionText: 'Light', isCorrect: false, optionOrder: 2 },
        { questionId: 24, optionText: 'Radio waves', isCorrect: false, optionOrder: 3 },
        { questionId: 24, optionText: 'X-rays', isCorrect: false, optionOrder: 4 },

        // Question 25 - Physics
        { questionId: 25, optionText: 'F = ma', isCorrect: true, optionOrder: 1 },
        { questionId: 25, optionText: 'E = mc²', isCorrect: false, optionOrder: 2 },
        { questionId: 25, optionText: 'F = kx', isCorrect: false, optionOrder: 3 },
        { questionId: 25, optionText: 'P = IV', isCorrect: false, optionOrder: 4 },

        // Question 26 - Physics
        { questionId: 26, optionText: '9.8 m/s²', isCorrect: true, optionOrder: 1 },
        { questionId: 26, optionText: '10 m/s²', isCorrect: false, optionOrder: 2 },
        { questionId: 26, optionText: '9.81 m/s²', isCorrect: false, optionOrder: 3 },
        { questionId: 26, optionText: '32 ft/s²', isCorrect: false, optionOrder: 4 },

        // Question 27 - Physics
        { questionId: 27, optionText: 'Joule (J)', isCorrect: true, optionOrder: 1 },
        { questionId: 27, optionText: 'Watt (W)', isCorrect: false, optionOrder: 2 },
        { questionId: 27, optionText: 'Newton (N)', isCorrect: false, optionOrder: 3 },
        { questionId: 27, optionText: 'Pascal (Pa)', isCorrect: false, optionOrder: 4 },

        // Question 28 - Physics
        { questionId: 28, optionText: 'Electromagnetic induction', isCorrect: true, optionOrder: 1 },
        { questionId: 28, optionText: 'Static electricity', isCorrect: false, optionOrder: 2 },
        { questionId: 28, optionText: 'Magnetic resonance', isCorrect: false, optionOrder: 3 },
        { questionId: 28, optionText: 'Electric conduction', isCorrect: false, optionOrder: 4 },

        // Question 29 - Physics
        { questionId: 29, optionText: 'Reflection', isCorrect: true, optionOrder: 1 },
        { questionId: 29, optionText: 'Refraction', isCorrect: false, optionOrder: 2 },
        { questionId: 29, optionText: 'Diffraction', isCorrect: false, optionOrder: 3 },
        { questionId: 29, optionText: 'Interference', isCorrect: false, optionOrder: 4 },

        // Question 30 - Physics
        { questionId: 30, optionText: 'Ohm (Ω)', isCorrect: true, optionOrder: 1 },
        { questionId: 30, optionText: 'Ampere (A)', isCorrect: false, optionOrder: 2 },
        { questionId: 30, optionText: 'Volt (V)', isCorrect: false, optionOrder: 3 },
        { questionId: 30, optionText: 'Coulomb (C)', isCorrect: false, optionOrder: 4 },

        // Question 31 - Physics
        { questionId: 31, optionText: 'Kinetic energy', isCorrect: true, optionOrder: 1 },
        { questionId: 31, optionText: 'Potential energy', isCorrect: false, optionOrder: 2 },
        { questionId: 31, optionText: 'Thermal energy', isCorrect: false, optionOrder: 3 },
        { questionId: 31, optionText: 'Elastic energy', isCorrect: false, optionOrder: 4 },

        // Question 32 - Physics
        { questionId: 32, optionText: 'Conservation of momentum', isCorrect: true, optionOrder: 1 },
        { questionId: 32, optionText: 'Conservation of energy', isCorrect: false, optionOrder: 2 },
        { questionId: 32, optionText: 'Newton\'s first law', isCorrect: false, optionOrder: 3 },
        { questionId: 32, optionText: 'Law of universal gravitation', isCorrect: false, optionOrder: 4 },

        // Question 33 - Physics
        { questionId: 33, optionText: 'Hertz (Hz)', isCorrect: true, optionOrder: 1 },
        { questionId: 33, optionText: 'Decibel (dB)', isCorrect: false, optionOrder: 2 },
        { questionId: 33, optionText: 'Second (s)', isCorrect: false, optionOrder: 3 },
        { questionId: 33, optionText: 'Meter (m)', isCorrect: false, optionOrder: 4 },

        // Question 34 - Physics
        { questionId: 34, optionText: 'Doppler effect', isCorrect: true, optionOrder: 1 },
        { questionId: 34, optionText: 'Photoelectric effect', isCorrect: false, optionOrder: 2 },
        { questionId: 34, optionText: 'Compton effect', isCorrect: false, optionOrder: 3 },
        { questionId: 34, optionText: 'Hall effect', isCorrect: false, optionOrder: 4 },

        // Question 35 - Physics
        { questionId: 35, optionText: 'Pascal (Pa)', isCorrect: true, optionOrder: 1 },
        { questionId: 35, optionText: 'Newton (N)', isCorrect: false, optionOrder: 2 },
        { questionId: 35, optionText: 'Joule (J)', isCorrect: false, optionOrder: 3 },
        { questionId: 35, optionText: 'Watt (W)', isCorrect: false, optionOrder: 4 },

        // Question 36 - Physics
        { questionId: 36, optionText: 'Absolute zero', isCorrect: true, optionOrder: 1 },
        { questionId: 36, optionText: 'Freezing point of water', isCorrect: false, optionOrder: 2 },
        { questionId: 36, optionText: 'Room temperature', isCorrect: false, optionOrder: 3 },
        { questionId: 36, optionText: 'Boiling point of water', isCorrect: false, optionOrder: 4 },

        // Question 37 - Chemistry
        { questionId: 37, optionText: 'Atoms', isCorrect: true, optionOrder: 1 },
        { questionId: 37, optionText: 'Molecules', isCorrect: false, optionOrder: 2 },
        { questionId: 37, optionText: 'Compounds', isCorrect: false, optionOrder: 3 },
        { questionId: 37, optionText: 'Elements', isCorrect: false, optionOrder: 4 },

        // Question 38 - Chemistry
        { questionId: 38, optionText: 'H₂O', isCorrect: true, optionOrder: 1 },
        { questionId: 38, optionText: 'H₂O₂', isCorrect: false, optionOrder: 2 },
        { questionId: 38, optionText: 'OH⁻', isCorrect: false, optionOrder: 3 },
        { questionId: 38, optionText: 'H₃O⁺', isCorrect: false, optionOrder: 4 },

        // Question 39 - Chemistry
        { questionId: 39, optionText: 'Hydrogen (H)', isCorrect: true, optionOrder: 1 },
        { questionId: 39, optionText: 'Helium (He)', isCorrect: false, optionOrder: 2 },
        { questionId: 39, optionText: 'Lithium (Li)', isCorrect: false, optionOrder: 3 },
        { questionId: 39, optionText: 'Carbon (C)', isCorrect: false, optionOrder: 4 },

        // Question 40 - Chemistry
        { questionId: 40, optionText: 'NaCl → Na⁺ + Cl⁻', isCorrect: true, optionOrder: 1 },
        { questionId: 40, optionText: 'H₂O → H₂ + O', isCorrect: false, optionOrder: 2 },
        { questionId: 40, optionText: 'CO₂ → C + O₂', isCorrect: false, optionOrder: 3 },
        { questionId: 40, optionText: 'CH₄ → C + H₄', isCorrect: false, optionOrder: 4 },

        // Question 41 - Chemistry
        { questionId: 41, optionText: 'Covalent bond', isCorrect: true, optionOrder: 1 },
        { questionId: 41, optionText: 'Ionic bond', isCorrect: false, optionOrder: 2 },
        { questionId: 41, optionText: 'Metallic bond', isCorrect: false, optionOrder: 3 },
        { questionId: 41, optionText: 'Hydrogen bond', isCorrect: false, optionOrder: 4 },

        // Question 42 - Chemistry
        { questionId: 42, optionText: 'Mole (mol)', isCorrect: true, optionOrder: 1 },
        { questionId: 42, optionText: 'Gram (g)', isCorrect: false, optionOrder: 2 },
        { questionId: 42, optionText: 'Liter (L)', isCorrect: false, optionOrder: 3 },
        { questionId: 42, optionText: 'Molecule', isCorrect: false, optionOrder: 4 },

        // Question 43 - Chemistry
        { questionId: 43, optionText: 'Oxidation', isCorrect: true, optionOrder: 1 },
        { questionId: 43, optionText: 'Reduction', isCorrect: false, optionOrder: 2 },
        { questionId: 43, optionText: 'Hydration', isCorrect: false, optionOrder: 3 },
        { questionId: 43, optionText: 'Substitution', isCorrect: false, optionOrder: 4 },

        // Question 44 - Chemistry
        { questionId: 44, optionText: 'Catalyst', isCorrect: true, optionOrder: 1 },
        { questionId: 44, optionText: 'Inhibitor', isCorrect: false, optionOrder: 2 },
        { questionId: 44, optionText: 'Reactant', isCorrect: false, optionOrder: 3 },
        { questionId: 44, optionText: 'Product', isCorrect: false, optionOrder: 4 },

        // Question 45 - Chemistry
        { questionId: 45, optionText: 'Noble gases', isCorrect: true, optionOrder: 1 },
        { questionId: 45, optionText: 'Alkali metals', isCorrect: false, optionOrder: 2 },
        { questionId: 45, optionText: 'Halogens', isCorrect: false, optionOrder: 3 },
        { questionId: 45, optionText: 'Transition metals', isCorrect: false, optionOrder: 4 },

        // Question 46 - Chemistry
        { questionId: 46, optionText: 'CO₂', isCorrect: true, optionOrder: 1 },
        { questionId: 46, optionText: 'CO', isCorrect: false, optionOrder: 2 },
        { questionId: 46, optionText: 'C₂O', isCorrect: false, optionOrder: 3 },
        { questionId: 46, optionText: 'C₂O₂', isCorrect: false, optionOrder: 4 },

        // Question 47 - Chemistry
        { questionId: 47, optionText: 'Sublimation', isCorrect: true, optionOrder: 1 },
        { questionId: 47, optionText: 'Evaporation', isCorrect: false, optionOrder: 2 },
        { questionId: 47, optionText: 'Condensation', isCorrect: false, optionOrder: 3 },
        { questionId: 47, optionText: 'Melting', isCorrect: false, optionOrder: 4 },

        // Question 48 - Chemistry
        { questionId: 48, optionText: 'Endothermic', isCorrect: true, optionOrder: 1 },
        { questionId: 48, optionText: 'Exothermic', isCorrect: false, optionOrder: 2 },
        { questionId: 48, optionText: 'Isothermic', isCorrect: false, optionOrder: 3 },
        { questionId: 48, optionText: 'Adiabatic', isCorrect: false, optionOrder: 4 },

        // Question 49 - Biology
        { questionId: 49, optionText: 'Cell', isCorrect: true, optionOrder: 1 },
        { questionId: 49, optionText: 'Tissue', isCorrect: false, optionOrder: 2 },
        { questionId: 49, optionText: 'Organ', isCorrect: false, optionOrder: 3 },
        { questionId: 49, optionText: 'Organism', isCorrect: false, optionOrder: 4 },

        // Question 50 - Biology
        { questionId: 50, optionText: 'Nucleus', isCorrect: true, optionOrder: 1 },
        { questionId: 50, optionText: 'Cytoplasm', isCorrect: false, optionOrder: 2 },
        { questionId: 50, optionText: 'Cell wall', isCorrect: false, optionOrder: 3 },
        { questionId: 50, optionText: 'Membrane', isCorrect: false, optionOrder: 4 },

        // Question 51 - Biology
        { questionId: 51, optionText: 'Cellular respiration', isCorrect: true, optionOrder: 1 },
        { questionId: 51, optionText: 'Photosynthesis', isCorrect: false, optionOrder: 2 },
        { questionId: 51, optionText: 'Fermentation', isCorrect: false, optionOrder: 3 },
        { questionId: 51, optionText: 'Glycolysis', isCorrect: false, optionOrder: 4 },

        // Question 52 - Biology
        { questionId: 52, optionText: 'Charles Darwin', isCorrect: true, optionOrder: 1 },
        { questionId: 52, optionText: 'Gregor Mendel', isCorrect: false, optionOrder: 2 },
        { questionId: 52, optionText: 'Louis Pasteur', isCorrect: false, optionOrder: 3 },
        { questionId: 52, optionText: 'Alfred Wallace', isCorrect: false, optionOrder: 4 },

        // Question 53 - Biology
        { questionId: 53, optionText: 'Ribosome', isCorrect: true, optionOrder: 1 },
        { questionId: 53, optionText: 'Nucleus', isCorrect: false, optionOrder: 2 },
        { questionId: 53, optionText: 'Golgi apparatus', isCorrect: false, optionOrder: 3 },
        { questionId: 53, optionText: 'Lysosome', isCorrect: false, optionOrder: 4 },

        // Question 54 - Biology
        { questionId: 54, optionText: 'Hemoglobin', isCorrect: true, optionOrder: 1 },
        { questionId: 54, optionText: 'Plasma', isCorrect: false, optionOrder: 2 },
        { questionId: 54, optionText: 'Platelets', isCorrect: false, optionOrder: 3 },
        { questionId: 54, optionText: 'White blood cells', isCorrect: false, optionOrder: 4 },

        // Question 55 - Biology
        { questionId: 55, optionText: 'Meiosis', isCorrect: true, optionOrder: 1 },
        { questionId: 55, optionText: 'Mitosis', isCorrect: false, optionOrder: 2 },
        { questionId: 55, optionText: 'Binary fission', isCorrect: false, optionOrder: 3 },
        { questionId: 55, optionText: 'Budding', isCorrect: false, optionOrder: 4 },

        // Question 56 - Biology
        { questionId: 56, optionText: 'Ecosystem', isCorrect: true, optionOrder: 1 },
        { questionId: 56, optionText: 'Community', isCorrect: false, optionOrder: 2 },
        { questionId: 56, optionText: 'Population', isCorrect: false, optionOrder: 3 },
        { questionId: 56, optionText: 'Habitat', isCorrect: false, optionOrder: 4 },

        // Question 57 - Biology
        { questionId: 57, optionText: 'Chloroplast', isCorrect: true, optionOrder: 1 },
        { questionId: 57, optionText: 'Mitochondria', isCorrect: false, optionOrder: 2 },
        { questionId: 57, optionText: 'Nucleus', isCorrect: false, optionOrder: 3 },
        { questionId: 57, optionText: 'Vacuole', isCorrect: false, optionOrder: 4 },

        // Question 58 - Biology
        { questionId: 58, optionText: 'Enzyme', isCorrect: true, optionOrder: 1 },
        { questionId: 58, optionText: 'Hormone', isCorrect: false, optionOrder: 2 },
        { questionId: 58, optionText: 'Vitamin', isCorrect: false, optionOrder: 3 },
        { questionId: 58, optionText: 'Mineral', isCorrect: false, optionOrder: 4 },

        // Question 59 - Biology
        { questionId: 59, optionText: 'Allele', isCorrect: true, optionOrder: 1 },
        { questionId: 59, optionText: 'Gene', isCorrect: false, optionOrder: 2 },
        { questionId: 59, optionText: 'Chromosome', isCorrect: false, optionOrder: 3 },
        { questionId: 59, optionText: 'Genome', isCorrect: false, optionOrder: 4 },

        // Question 60 - Biology
        { questionId: 60, optionText: 'Antibody', isCorrect: true, optionOrder: 1 },
        { questionId: 60, optionText: 'Antigen', isCorrect: false, optionOrder: 2 },
        { questionId: 60, optionText: 'Pathogen', isCorrect: false, optionOrder: 3 },
        { questionId: 60, optionText: 'Vaccine', isCorrect: false, optionOrder: 4 },

        // Question 61 - Computer Science
        { questionId: 61, optionText: 'O(n²)', isCorrect: true, optionOrder: 1 },
        { questionId: 61, optionText: 'O(n)', isCorrect: false, optionOrder: 2 },
        { questionId: 61, optionText: 'O(log n)', isCorrect: false, optionOrder: 3 },
        { questionId: 61, optionText: 'O(1)', isCorrect: false, optionOrder: 4 },

        // Question 62 - Computer Science
        { questionId: 62, optionText: 'Stack', isCorrect: true, optionOrder: 1 },
        { questionId: 62, optionText: 'Queue', isCorrect: false, optionOrder: 2 },
        { questionId: 62, optionText: 'Array', isCorrect: false, optionOrder: 3 },
        { questionId: 62, optionText: 'Linked List', isCorrect: false, optionOrder: 4 },

        // Question 63 - Computer Science
        { questionId: 63, optionText: 'Binary Search Tree', isCorrect: true, optionOrder: 1 },
        { questionId: 63, optionText: 'Hash Table', isCorrect: false, optionOrder: 2 },
        { questionId: 63, optionText: 'Heap', isCorrect: false, optionOrder: 3 },
        { questionId: 63, optionText: 'Graph', isCorrect: false, optionOrder: 4 },

        // Question 64 - Computer Science
        { questionId: 64, optionText: 'Object-oriented programming', isCorrect: true, optionOrder: 1 },
        { questionId: 64, optionText: 'Functional programming', isCorrect: false, optionOrder: 2 },
        { questionId: 64, optionText: 'Procedural programming', isCorrect: false, optionOrder: 3 },
        { questionId: 64, optionText: 'Logic programming', isCorrect: false, optionOrder: 4 },

        // Question 65 - Computer Science
        { questionId: 65, optionText: 'SELECT', isCorrect: true, optionOrder: 1 },
        { questionId: 65, optionText: 'INSERT', isCorrect: false, optionOrder: 2 },
        { questionId: 65, optionText: 'UPDATE', isCorrect: false, optionOrder: 3 },
        { questionId: 65, optionText: 'DELETE', isCorrect: false, optionOrder: 4 },

        // Question 66 - Computer Science
        { questionId: 66, optionText: 'HTTP', isCorrect: true, optionOrder: 1 },
        { questionId: 66, optionText: 'FTP', isCorrect: false, optionOrder: 2 },
        { questionId: 66, optionText: 'SMTP', isCorrect: false, optionOrder: 3 },
        { questionId: 66, optionText: 'TCP', isCorrect: false, optionOrder: 4 },

        // Question 67 - Computer Science
        { questionId: 67, optionText: 'Merge Sort', isCorrect: true, optionOrder: 1 },
        { questionId: 67, optionText: 'Bubble Sort', isCorrect: false, optionOrder: 2 },
        { questionId: 67, optionText: 'Selection Sort', isCorrect: false, optionOrder: 3 },
        { questionId: 67, optionText: 'Insertion Sort', isCorrect: false, optionOrder: 4 },

        // Question 68 - Computer Science
        { questionId: 68, optionText: 'Machine Learning', isCorrect: true, optionOrder: 1 },
        { questionId: 68, optionText: 'Data Mining', isCorrect: false, optionOrder: 2 },
        { questionId: 68, optionText: 'Data Analysis', isCorrect: false, optionOrder: 3 },
        { questionId: 68, optionText: 'Statistical Analysis', isCorrect: false, optionOrder: 4 },

        // Question 69 - Computer Science
        { questionId: 69, optionText: 'Encapsulation', isCorrect: true, optionOrder: 1 },
        { questionId: 69, optionText: 'Inheritance', isCorrect: false, optionOrder: 2 },
        { questionId: 69, optionText: 'Polymorphism', isCorrect: false, optionOrder: 3 },
        { questionId: 69, optionText: 'Abstraction', isCorrect: false, optionOrder: 4 },

        // Question 70 - Computer Science
        { questionId: 70, optionText: 'Compiler', isCorrect: true, optionOrder: 1 },
        { questionId: 70, optionText: 'Interpreter', isCorrect: false, optionOrder: 2 },
        { questionId: 70, optionText: 'Assembler', isCorrect: false, optionOrder: 3 },
        { questionId: 70, optionText: 'Debugger', isCorrect: false, optionOrder: 4 },

        // Question 71 - Computer Science
        { questionId: 71, optionText: 'Git', isCorrect: true, optionOrder: 1 },
        { questionId: 71, optionText: 'SVN', isCorrect: false, optionOrder: 2 },
        { questionId: 71, optionText: 'Mercurial', isCorrect: false, optionOrder: 3 },
        { questionId: 71, optionText: 'Bazaar', isCorrect: false, optionOrder: 4 },

        // Question 72 - Computer Science
        { questionId: 72, optionText: 'API', isCorrect: true, optionOrder: 1 },
        { questionId: 72, optionText: 'UI', isCorrect: false, optionOrder: 2 },
        { questionId: 72, optionText: 'SDK', isCorrect: false, optionOrder: 3 },
        { questionId: 72, optionText: 'IDE', isCorrect: false, optionOrder: 4 },
    ];

    await db.insert(questionOptions).values(sampleOptions);
    
    console.log('✅ Question options seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});