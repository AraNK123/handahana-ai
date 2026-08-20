import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/generate-horoscope', async (req, res) => {
    try {
        const { name, gender, dob, time, district, country } = req.body;
        const currentDate = new Date().toISOString().split('T')[0];

        const prompt = `
ඔබ ශ්‍රී ලංකා සාම්ප්‍රදායික තත්කාල නැකත් ලිත සහ වෛදික ජ්‍යොතිෂය මනාව ප්‍රගුණ කළ ප්‍රවීණ ධනාත්මක ජ්‍යොතිෂ උපදේශකයෙකි.

පහත උපන් තොරතුරු සහ වර්තමාන දිනය (${currentDate}) පදනම් කරගෙන ශ්‍රී ලංකා නැකත් ලිත අනුව විස්තරාත්මක ජ්‍යොතිෂ ගණනය කිරීමක් හා ධනාත්මක විග්‍රහයක් සිංහලෙන් සකසන්න:
- නම: ${name}
- ස්ත්‍රී/පුරුෂභාවය: ${gender}
- උපන් දිනය: ${dob}
- උපන් වේලාව: ${time}
- ස්ථානය: ${district}, ${country}
- කේන්දරය බලන අද දිනය: ${currentDate}

කරුණාකර පහත JSON ආකෘතියට පමණක් පිළිතුර ලබාදෙන්න (Markdown formatting, \`\`\`json නොමැතිව direct clean JSON පමණි):
{
  "lagna": "ලග්නය (උදා: තුලා)",
  "nekatha": "උපන් නැකත (උදා: චිත්ත)",
  "luckyColor": "සුබ වර්ණය",
  "luckyNumber": "සුබ අංකය",
  "luckyDay": "සුබ දිනය",
  "positiveAffirmation": "සිතට ශක්තිය දෙන කෙටි ධනාත්මක ආදර්ශ පාඨයක්",
  "dashaDetails": "උපන් දිනයේ සිට අද දිනය (${currentDate}) දක්වා ගෙවුණු මහ දශා සහ දැනට ගතවන මහ දශාව සහ අතුරු දශාව පිළිබඳ කාලසීමා විග්‍රහය",
  "dashaImpact": "දැනට ගතවන දශා සහ අතුරු දශාවේ බලපෑම හා ඉන් උපරිම ඵල ලබාගත හැකි ආකාරය පිළිබඳ ධනාත්මක පැහැදිලි කිරීම",
  "personality": "පෞරුෂ ශක්තීන්, සහජ දක්ෂතා සහ ගතිගුණ පිළිබඳ ධනාත්මක විග්‍රහය",
  "careerFinance": "රැකියාව, ව්‍යාපාර සහ ධන යෝග පිළිබඳ සවිස්තරාත්මක විග්‍රහය",
  "futurePredictions": "ඉදිරි වසර 1-3 තුළ උදාවන යහපත් කාලසීමාවන් සහ නව අවස්ථා පිළිබඳ විස්තරය",
  "actionableGuidance": "ජීවිතය ජය ගැනීමට සහ අපල මඟහරවා ගැනීමට කළ යුතු ප්‍රායෝගික පුරුදු, සෙත් ශාන්ති සහ උපදෙස්",
  "houses": {
    "1": ["ග්‍රහයින් (උදා: සිකුරු)"],
    "2": [],
    "3": [],
    "4": [],
    "5": [],
    "6": [],
    "7": [],
    "8": [],
    "9": [],
    "10": [],
    "11": [],
    "12": []
  }
}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        let rawText = response.text.trim();
        if (rawText.startsWith('```')) {
            rawText = rawText.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
        }

        const resultData = JSON.parse(rawText);
        res.json(resultData);

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'කේන්දරය සකස් කිරීමේදී දෝෂයක් ඇතිවිය. නැවත උත්සාහ කරන්න.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});