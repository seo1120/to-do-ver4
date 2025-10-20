require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3002;

// Gemini AI 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 미들웨어
app.use(cors());
app.use(express.json());

// Rate limiting
const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,  // 1분
    max: 10,  // 1분에 10번
    message: { success: false, error: 'Too many requests' }
});

// AI 생성 엔드포인트
app.post('/api/ai/generate', aiLimiter, async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({
            success: false,
            error: 'Prompt required'
        });
    }

    try {
        // Gemini API 키 확인
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'Gemini API key not configured'
            });
        }

        // Gemini 모델 초기화 (안정적인 모델 사용)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        // 프롬프트 생성
        const fullPrompt = `사용자가 요청한 내용에 대해 도움이 되는 답변을 해주세요: ${prompt}`;
        
        // Gemini API 호출
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const aiResponse = response.text();

        res.json({ success: true, text: aiResponse });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 사용 가능한 모델 확인 엔드포인트
app.get('/api/ai/models', async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'Gemini API key not configured'
            });
        }
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        
        res.json({ success: true, models: data });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 헬스 체크 엔드포인트
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
});

app.listen(PORT, () => {
    console.log(`Server: http://localhost:${PORT}`);
});
