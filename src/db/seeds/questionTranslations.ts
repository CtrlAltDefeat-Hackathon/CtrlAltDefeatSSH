import { db } from '@/db';
import { questionTranslations } from '@/db/schema';

async function main() {
    const sampleTranslations = [
        // Question 1 translations
        {
            questionId: 1,
            languageCode: 'hi',
            questionText: 'भारत की राजधानी क्या है?',
            explanation: 'नई दिल्ली 1911 से भारत की राजधानी है।',
        },
        {
            questionId: 1,
            languageCode: 'od',
            questionText: 'ଭାରତର ରାଜଧାନୀ କଣ?',
            explanation: 'ନୂଆ ଦିଲ୍ଲୀ ୧୯୧୧ ଠାରୁ ଭାରତର ରାଜଧାନୀ ଅଟେ।',
        },
        {
            questionId: 1,
            languageCode: 'bn',
            questionText: 'ভারতের রাজধানী কী?',
            explanation: 'নয়া দিল্লি ১৯১১ সাল থেকে ভারতের রাজধানী।',
        },
        
        // Question 2 translations
        {
            questionId: 2,
            languageCode: 'hi',
            questionText: 'পানীর রাসायनিক সূত্র কী?',
            explanation: 'পানি দুটি হাইড্রোজেন পরমাণু ও একটি অক্সিজেন পরমাণুর সমন্বয়ে গঠিত।',
        },
        {
            questionId: 2,
            languageCode: 'od',
            questionText: 'ପାଣିର ରାସାୟନିକ ସୂତ୍ର କଣ?',
            explanation: 'ପାଣି ଦୁଇଟି ହାଇଡ୍ରୋଜେନ୍ ଏବଂ ଗୋଟିଏ ଅକ୍ସିଜେନ୍ ପରମାଣୁରେ ଗଠିତ।',
        },
        {
            questionId: 2,
            languageCode: 'bn',
            questionText: 'পানির রাসায়নিক সূত্র কী?',
            explanation: 'পানি দুটি হাইড্রোজেন ও একটি অক্সিজেন পরমাণুর সমন্বয়ে গঠিত।',
        },
        
        // Question 3 translations
        {
            questionId: 3,
            languageCode: 'hi',
            questionText: '২ + ২ = কত?',
            explanation: 'এটি একটি সহজ যোগের অঙ্ক।',
        },
        {
            questionId: 3,
            languageCode: 'od',
            questionText: '୨ + ୨ = କେତେ?',
            explanation: 'ଏହା ଏକ ସରଳ ଯୋଗ ଗଣିତ।',
        },
        {
            questionId: 3,
            languageCode: 'bn',
            questionText: '২ + ২ = কত?',
            explanation: 'এটি একটি সহজ যোগের অঙ্ক।',
        },
        
        // Question 4 translations
        {
            questionId: 4,
            languageCode: 'hi',
            questionText: 'সূর্য থেকে পৃথিবীর দূরত্ব কত?',
            explanation: 'গড়ে প্রায় ১৪৯.৬ মিলিয়ন কিলোমিটার (Astronomical Unit)।',
        },
        {
            questionId: 4,
            languageCode: 'od',
            questionText: 'ସୂର୍ଯ୍ୟରୁ ପୃଥିବୀର ଦୂରତା କେତେ?',
            explanation: 'ହାରାହାରି ପ୍ରାୟ ୧୪୯.୬ ମିଲିୟନ୍ କିଲୋମିଟର (Astronomical Unit)।',
        },
        {
            questionId: 4,
            languageCode: 'bn',
            questionText: 'সূর্য থেকে পৃথিবীর দূরত্ব কত?',
            explanation: 'গড়ে প্রায় ১৪৯.৬ মিলিয়ন কিলোমিটার (Astronomical Unit)।',
        },
        
        // Question 5 translations
        {
            questionId: 5,
            languageCode: 'hi',
            questionText: 'कंप्यूटर की मुख्य मेमोरी को क्या कहते हैं?',
            explanation: 'RAM (Random Access Memory) को मुख्य मेमोरी कहते हैं।',
        },
        {
            questionId: 5,
            languageCode: 'od',
            questionText: 'କମ୍ପ୍ୟୁଟରର ମୁଖ୍ୟ ମେମୋରୀକୁ କଣ କୁହାଯାଏ?',
            explanation: 'RAM (Random Access Memory) କୁ ମୁଖ୍ୟ ମେମୋରୀ କୁହାଯାଏ।',
        },
        {
            questionId: 5,
            languageCode: 'bn',
            questionText: 'কম্পিউটারের প্রধান মেমোরিকে কী বলে?',
            explanation: 'RAM (Random Access Memory) কে প্রধান মেমোরি বলে।',
        },
        
        // Question 6 translations
        {
            questionId: 6,
            languageCode: 'hi',
            questionText: 'ইংরেজিতে "বই" শব্দটি কী?',
            explanation: 'ইংরেজিতে "বই" শব্দটি হল "Book"।',
        },
        {
            questionId: 6,
            languageCode: 'od',
            questionText: 'ଇଂରାଜୀରେ "ବହି" ଶବ୍ଦଟି କଣ?',
            explanation: 'ଇଂରାଜୀରେ "ବହି" ଶବ୍ଦଟି ହେଲା "Book"।',
        },
        {
            questionId: 6,
            languageCode: 'bn',
            questionText: 'ইংরেজিতে "বই" শব্দটি কী?',
            explanation: 'ইংরেজিতে "বই" শব্দটি হল "Book"।',
        },
        
        // Question 7 translations
        {
            questionId: 7,
            languageCode: 'hi',
            questionText: 'মহাত্মা গান্ধীর জন্ম কোন সালে?',
            explanation: '১৮৬৯ সালের ২ অক্টোবর গুজরাটের পোরবন্দরে।',
        },
        {
            questionId: 7,
            languageCode: 'od',
            questionText: 'ମହାତ୍ମା ଗାନ୍ଧୀଙ୍କ ଜନ୍ମ କେଉଁ ବର୍ଷରେ?',
            explanation: '୧୮୬୯ ବର୍ଷର ୨ ଅକ୍ଟୋବରରେ ଗୁଜରାଟର ପୋରବନ୍ଦରରେ।',
        },
        {
            questionId: 7,
            languageCode: 'bn',
            questionText: 'মহাত্মা গান্ধীর জন্ম কোন সালে?',
            explanation: '১৮৬৯ সালের ২ অক্টোবর গুজরাটের পোরবন্দরে।',
        },
        
        // Question 8 translations
        {
            questionId: 8,
            languageCode: 'hi',
            questionText: 'फोटोसिंथेसिस की प्रक्रिया कहाँ होती है?',
            explanation: 'पत्तियों में क्लोरोफिल की उपस्थिति में सूर्य के प्रकाश से।',
        },
        {
            questionId: 8,
            languageCode: 'od',
            questionText: 'ଫୋଟୋସିନ୍ଥେସିସ୍ ପ୍ରକ୍ରିୟା କେଉଁଠାରେ ହୁଏ?',
            explanation: 'ପତ୍ରରେ କ୍ଲୋରୋଫିଲ୍ ଉପସ୍ଥିତିରେ ସୂର୍ଯ୍ୟ ଆଲୋକରେ।',
        },
        {
            questionId: 8,
            languageCode: 'bn',
            questionText: 'ফটোসিনথেসিস প্রক্রিয়া কোথায় ঘটে?',
            explanation: 'পাতায় ক্লোরোফিলের উপস্থিতিতে সূর্যের আলোতে।',
        },
        
        // Question 9 translations
        {
            questionId: 9,
            languageCode: 'hi',
            questionText: '১০ × ৫ = কত?',
            explanation: 'দশ গুণ পাঁচ সমান পঞ্চাশ।',
        },
        {
            questionId: 9,
            languageCode: 'od',
            questionText: '୧୦ × ୫ = କେତେ?',
            explanation: 'ଦଶ ଗୁଣ ପାଞ୍ଚ ସମାନ ପଚାଶ।',
        },
        {
            questionId: 9,
            languageCode: 'bn',
            questionText: '১০ × ৫ = কত?',
            explanation: 'দশ গুণ পাঁচ সমান পঞ্চাশ।',
        },
        
        // Question 10 translations
        {
            questionId: 10,
            languageCode: 'hi',
            questionText: 'चांद पर गुरुत्वाकर्षण पृथ্वীর তুলনায় কেমন?',
            explanation: 'চাঁদের মাধ্যাকর্ষণ পৃথিবীর প্রায় ১/৬ ভাগ।',
        },
        {
            questionId: 10,
            languageCode: 'od',
            questionText: 'ଚନ୍ଦ୍ରରେ ଗୁରୁତ୍ୱାକର୍ଷଣ ପୃଥିବୀ ତୁଳନାରେ କେମିତି?',
            explanation: 'ଚନ୍ଦ୍ରର ମାଧ୍ୟାକର୍ଷଣ ପୃଥିବୀର ପ୍ରାୟ ୧/୬ ଭାଗ।',
        },
        {
            questionId: 10,
            languageCode: 'bn',
            questionText: 'চাঁদে মাধ্যাকর্ষণ পৃথিবীর তুলনায় কেমন?',
            explanation: 'চাঁদের মাধ্যাকর্ষণ পৃথিবীর প্রায় ১/৬ ভাগ।',
        },
        
        // Question 11 translations
        {
            questionId: 11,
            languageCode: 'hi',
            questionText: 'HTTP का फुल फॉर्म क्या है?',
            explanation: 'HyperText Transfer Protocol - ওয়েব পেজ স্থানান্তরের প্রোটোকল।',
        },
        {
            questionId: 11,
            languageCode: 'od',
            questionText: 'HTTP ର ପୂର୍ଣ୍ଣ ରୂପ କଣ?',
            explanation: 'HyperText Transfer Protocol - ୱେବ୍ ପେଜ୍ ସ୍ଥାନାନ୍ତରଣର ପ୍ରୋଟୋକଲ୍।',
        },
        {
            questionId: 11,
            languageCode: 'bn',
            questionText: 'HTTP এর পূর্ণরূপ কী?',
            explanation: 'HyperText Transfer Protocol - ওয়েব পেজ স্থানান্তরের প্রোটোকল।',
        },
        
        // Question 12 translations
        {
            questionId: 12,
            languageCode: 'hi',
            questionText: '"Hello" শব্দটি हिंदी में क्या होगा?',
            explanation: 'হিন্দিতে "Hello" শব্দটি "नमस্कार" বা "नमسते"।',
        },
        {
            questionId: 12,
            languageCode: 'od',
            questionText: '"Hello" ଶବ୍ଦଟି ଓଡ଼ିଆରେ କଣ ହେବ?',
            explanation: 'ଓଡ଼ିଆରେ "Hello" ଶବ୍ଦଟି "ନମସ୍କାର"।',
        },
        {
            questionId: 12,
            languageCode: 'bn',
            questionText: '"Hello" শব্দটি বাংলায় কী হবে?',
            explanation: 'বাংলায় "Hello" শব্দটি "নমস্কার" বা "আসসালামু আলাইকুম"।',
        },
        
        // Question 13 translations
        {
            questionId: 13,
            languageCode: 'hi',
            questionText: 'ভারতের স্বাধীনতা দিবস কবে?',
            explanation: '১৫ আগস্ট ১৯৪৭ সালে ভারত ব্রিটিশ শাসন থেকে মুক্ত হয়।',
        },
        {
            questionId: 13,
            languageCode: 'od',
            questionText: 'ଭାରତର ସ୍ୱାଧୀନତା ଦିବସ କେବେ?',
            explanation: '୧୫ ଅଗଷ୍ଟ ୁ୧୯୪୭ ସାଲରେ ଭାରତ ବ୍ରିଟିଶ୍ ଶାସନରୁ ମୁକ୍ତ ହେଲା।',
        },
        {
            questionId: 13,
            languageCode: 'bn',
            questionText: 'ভারতের স্বাধীনতা দিবস কবে?',
            explanation: '১৫ আগস্ট ১৯৪৭ সালে ভারত ব্রিটিশ শাসন থেকে মুক্ত হয়।',
        },
        
        // Question 14 translations
        {
            questionId: 14,
            languageCode: 'hi',
            questionText: 'मानব शरीर में कितनी हड्डियां होती हैं?',
            explanation: 'वयस्क मানव शरीर में ২০৬টি হাড় থাকে।',
        },
        {
            questionId: 14,
            languageCode: 'od',
            questionText: 'ମାନବ ଶରୀରରେ କେତୋଟି ହାଡ଼ ଥାଏ?',
            explanation: 'ବୟସ୍କ ମାନବ ଶରୀରରେ ୨୦୬ଟି ହାଡ଼ ଥାଏ।',
        },
        {
            questionId: 14,
            languageCode: 'bn',
            questionText: 'মানুষের শরীরে কয়টি হাড় আছে?',
            explanation: 'প্রাপ্তবয়স্ক মানুষের শরীরে ২০৬টি হাড় থাকে।',
        },
        
        // Question 15 translations
        {
            questionId: 15,
            languageCode: 'hi',
            questionText: '৫০ ÷ ১০ = কত?',
            explanation: 'পঞ্চাশ ভাগ দশ সমান পাঁচ।',
        },
        {
            questionId: 15,
            languageCode: 'od',
            questionText: '୫୦ ÷ ୧୦ = କେତେ?',
            explanation: 'ପଚାଶ ଭାଗ ଦଶ ସମାନ ପାଞ୍ଚ।',
        },
        {
            questionId: 15,
            languageCode: 'bn',
            questionText: '৫০ ÷ ১০ = কত?',
            explanation: 'পঞ্চাশ ভাগ দশ সমান পাঁচ।',
        },
        
        // Question 16 translations
        {
            questionId: 16,
            languageCode: 'hi',
            questionText: 'प्रकाश की गति कितनी है?',
            explanation: 'শূন্যস্থানে আলোর গতি প্রায় ৩,০০,০০০ কিমি/সেকেন্ড।',
        },
        {
            questionId: 16,
            languageCode: 'od',
            questionText: 'ଆଲୋକର ଗତି କେତେ?',
            explanation: 'ଶୂନ୍ୟସ୍ଥାନରେ ଆଲୋକର ଗତି ପ୍ରାୟ ୩,୦୦,୦୦୦ କିମି/ସେକେଣ୍ଡ।',
        },
        {
            questionId: 16,
            languageCode: 'bn',
            questionText: 'আলোর গতি কত?',
            explanation: 'শূন্যস্থানে আলোর গতি প্রায় ৩,০০,০০০ কিমি/সেকেন্ড।',
        },
        
        // Question 17 translations
        {
            questionId: 17,
            languageCode: 'hi',
            questionText: 'डेटाबेस में CRUD का मतलब क्या है?',
            explanation: 'Create, Read, Update, Delete - ডেটাবেস অপারেশনের মূল ক্রিয়া।',
        },
        {
            questionId: 17,
            languageCode: 'od',
            questionText: 'ଡାଟାବେସ୍‌ରେ CRUD ର ଅର୍ଥ କଣ?',
            explanation: 'Create, Read, Update, Delete - ଡାଟାବେସ୍‌ ଅପରେସନ୍‌ର ମୂଳ କ୍ରିୟା।',
        },
        {
            questionId: 17,
            languageCode: 'bn',
            questionText: 'ডেটাবেসে CRUD এর অর্থ কী?',
            explanation: 'Create, Read, Update, Delete - ডেটাবেস অপারেশনের মূল ক্রিয়া।',
        },
        
        // Question 18 translations
        {
            questionId: 18,
            languageCode: 'hi',
            questionText: '"Thank you" का हिंदी अनुवाद क्या है?',
            explanation: 'हिंदी में "Thank you" का अनुवाد "ধন্যবাদ" বা "आभार"।',
        },
        {
            questionId: 18,
            languageCode: 'od',
            questionText: '"Thank you" ର ଓଡ଼ିଆ ଅନୁବାଦ କଣ?',
            explanation: 'ଓଡ଼ିଆରେ "Thank you" ର ଅନୁବାଦ "ଧନ୍ୟବାଦ"।',
        },
        {
            questionId: 18,
            languageCode: 'bn',
            questionText: '"Thank you" এর বাংলা অনুবাদ কী?',
            explanation: 'বাংলায় "Thank you" এর অনুবাদ "ধন্যবাদ"।',
        },
    ];

    await db.insert(questionTranslations).values(sampleTranslations);
    
    console.log('✅ Question translations seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});