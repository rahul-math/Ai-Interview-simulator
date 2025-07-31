
import express from 'express';
import cors from 'cors';
import 'dotenv/config'; 
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { getSystemInstruction } from './prompt-logic.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- Environment Variable Validation ---
const { API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, PORT = 3001 } = process.env;

if (!API_KEY) {
  console.error("\n🔴 CRITICAL ERROR: 'API_KEY' not found. The server will not start.\n");
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("\n🔴 CRITICAL ERROR: 'SUPABASE_URL' or 'SUPABASE_ANON_KEY' not found. The server will not start.\n");
    process.exit(1);
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error("\n🔴 CRITICAL ERROR: 'SUPABASE_SERVICE_ROLE_KEY' not found. This key is required for admin actions. The server will not start.\n");
    process.exit(1);
}


// --- Supabase and Gemini Client Setup ---
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// Create a separate client with the service role key for admin actions
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = 'gemini-2.5-flash';

// --- Auth Middleware ---
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization header is missing or invalid.' });
    }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        return res.status(401).json({ error: 'Invalid or expired token.', details: error?.message });
    }
    req.user = user;
    next();
};

// --- Centralized Error Handler ---
const handleApiError = (res, error, defaultMessage = 'An internal server error occurred.') => {
    console.error(error);
    let message = error.message || defaultMessage;
    let statusCode = 500;
    
    // Handle specific Supabase auth error for better client-side feedback
    if (message.toLowerCase().includes('user already registered')) {
        statusCode = 409;
        message = 'A user with this email already exists.';
    } else if (message.toLowerCase().includes('invalid login credentials')) {
        statusCode = 401;
        message = 'Invalid email or password.';
    }

    res.status(statusCode).json({ error: message });
};


const fetchFullUserProfile = async (userId) => {
    // Get user from auth schema (source of truth for email)
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (authError) throw authError;

    // Use the admin client to bypass RLS for this trusted server-side function
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('full_name, target_role') // Select only needed columns
        .eq('id', userId)
        .single();
        
    if (profileError) {
        // This error is now more specific, pointing to a missing profile.
        throw new Error(`Could not find a user profile for the provided ID. This can happen if the signup process was interrupted. Details: ${profileError.message}`);
    }

    const { data: reports, error: reportsError } = await supabaseAdmin
        .from('reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if(reportsError) throw reportsError;
    
    // Map snake_case from DB to camelCase for frontend
    const mappedProfile = {
        id: userId,
        email: authUser.email, // Use email from auth user object
        fullName: profile.full_name,
        targetRole: profile.target_role,
        reports: (reports || []).map(r => ({
            id: r.id,
            config: r.config,
            summary: r.summary,
            deliveryAnalysis: r.delivery_analysis,
            timestamp: r.created_at,
            codingResults: r.coding_results,
            mcqResults: r.mcq_results,
            history: r.history,
        }))
    };

    return mappedProfile;
}


// --- API Routes ---

// Health Check
app.get('/api', (req, res) => res.json({ status: 'ok', message: 'Backend is running.' }));

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
    let newUserId = null;
    try {
        const { email, password, fullName, targetRole } = req.body;
        
        // Step 1: Create the user in Supabase Auth using the admin client
        const { data: { user }, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm the email
        });

        if (signUpError) {
            throw signUpError;
        }
        if (!user) throw new Error('User creation was successful, but no user data was returned.');
        newUserId = user.id; // Store user ID for potential cleanup

        // Step 2: Manually create the profile using the ADMIN client to bypass RLS.
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
                id: user.id,
                full_name: fullName,
                target_role: targetRole || ''
                // NO 'email' field here. This was the source of the error.
            });

        if (profileError) {
            throw new Error(`Failed to create user profile in the database. Please ensure the database schema is correct. Details: ${profileError.message}`);
        }

        // Step 3: Sign in the newly created user to get a session.
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;

        // Step 4: Fetch the complete profile data to return to the client.
        const fullUser = await fetchFullUserProfile(user.id);

        res.status(201).json({ user: fullUser, session: signInData.session });

    } catch (error) {
        if (newUserId) {
            console.log(`Cleaning up partially created user: ${newUserId}`);
            await supabaseAdmin.auth.admin.deleteUser(newUserId);
        }
        handleApiError(res, error, 'Failed to sign up user.');
    }
});


app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        const fullUser = await fetchFullUserProfile(data.user.id);

        res.json({ user: fullUser, session: data.session });
    } catch (error) {
        handleApiError(res, error, 'Failed to log in.');
    }
});

app.post('/api/auth/logout', authMiddleware, async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        res.status(200).json({ message: 'Logged out successfully.' });
    } catch (error) {
        handleApiError(res, error, 'Logout failed.');
    }
});

// User Data Routes (Protected)
app.get('/api/me', authMiddleware, async (req, res) => {
    try {
        const fullUser = await fetchFullUserProfile(req.user.id);
        res.json({ user: fullUser });
    } catch (error) {
        handleApiError(res, error, 'Failed to fetch user data.');
    }
});

app.put('/api/me', authMiddleware, async (req, res) => {
    try {
        const { fullName, targetRole } = req.body;
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({ full_name: fullName, target_role: targetRole, updated_at: new Date() })
            .eq('id', req.user.id)
            .select('full_name, target_role')
            .single();

        if (error) throw error;
        res.status(200).json({ user: data });
    } catch(error) {
        handleApiError(res, error, 'Failed to update user profile.');
    }
});

app.put('/api/me/password', authMiddleware, async (req, res) => {
    try {
        const { newPassword } = req.body;
        // Use the admin client to update the user's password directly, as this is a trusted server.
        const { error } = await supabaseAdmin.auth.admin.updateUserById(
            req.user.id,
            { password: newPassword }
        );
        if (error) throw error;
        res.json({ message: 'Password updated successfully.' });
    } catch(error) {
        handleApiError(res, error, 'Failed to update password.');
    }
});


// Report Routes (Protected)
app.post('/api/reports', authMiddleware, async (req, res) => {
    try {
        const { report } = req.body;
        const { data, error } = await supabaseAdmin
            .from('reports')
            .insert({
                user_id: req.user.id,
                config: report.config,
                summary: report.summary,
                delivery_analysis: report.deliveryAnalysis,
                coding_results: report.codingResults,
                mcq_results: report.mcqResults,
                history: report.history,
            })
            .select()
            .single();

        if (error) throw error;
        const mappedReport = {
             id: data.id,
            config: data.config,
            summary: data.summary,
            deliveryAnalysis: data.delivery_analysis,
            timestamp: data.created_at,
            codingResults: data.coding_results,
            mcqResults: data.mcq_results,
            history: data.history,
        };
        res.status(201).json({ report: mappedReport });
    } catch (error) {
        handleApiError(res, error, 'Failed to save report.');
    }
});


// --- Gemini API Proxy Routes ---
const createGeminiRoute = (endpoint, handler) => {
    app.post(`/api/gemini/${endpoint}`, authMiddleware, async (req, res) => {
        try {
            await handler(req, res);
        } catch (error) {
            handleApiError(res, error, `Error in /api/gemini/${endpoint}`);
        }
    });
};

const generateTextFromGemini = async (contents, config = {}) => {
    const response = await ai.models.generateContent({ model, contents, config });
    const text = response.text;
    if (!text || !text.trim()) {
      throw new Error("The AI's response was empty, possibly due to a safety filter or invalid input.");
    }
    return text;
};

const generateJsonFromGemini = async (contents, schema) => {
    const response = await ai.models.generateContent({
        model,
        contents,
        config: { responseMimeType: "application/json", responseSchema: schema },
    });
    let responseText = response.text?.trim();
    if (!responseText) {
        throw new Error("The AI's response was empty, possibly due to a safety filter or invalid input.");
    }
    // Handle cases where the model might still wrap the JSON in markdown
    if (responseText.startsWith("```json")) {
        responseText = responseText.substring(7, responseText.length - 3).trim();
    }
    return JSON.parse(responseText);
};

createGeminiRoute('chat', async (req, res) => {
    const { config, history, newMessage } = req.body;
    const systemInstruction = getSystemInstruction(config);
    
    const conversationHistory = (Array.isArray(history) ? history : []).map(h => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.content }]
    }));

    if (newMessage) {
        conversationHistory.push({ role: 'user', parts: [{ text: newMessage }] });
    }

    const responseText = await generateTextFromGemini(
        conversationHistory,
        { systemInstruction }
    );
    res.json({ responseText });
});

createGeminiRoute('analyze-resume', async (req, res) => {
    const { resumeData, jobRole } = req.body;
    const parts = [
        { text: `Analyze this resume for a "${jobRole}" position. Evaluate ATS compatibility, keywords, and quality. Provide a score (0-100), a list of strengths, and a list of improvements. Respond ONLY with a valid JSON object matching the schema.` },
    ];
    if (resumeData.file) {
        parts.push({ inlineData: { mimeType: resumeData.file.mimeType, data: resumeData.file.data } });
    } else {
        parts.push({ text: `Resume Text:\n${resumeData.text}` });
    }
    const schema = {
        type: Type.OBJECT,
        properties: {
            score: { type: Type.NUMBER, description: "ATS compatibility score from 0-100." },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of resume strengths." },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of areas for improvement." },
        },
        required: ["score", "strengths", "improvements"],
    };
    const analysisData = await generateJsonFromGemini({ parts }, schema);
    res.json({ analysis: analysisData });
});

createGeminiRoute('generate-mcq', async (req, res) => {
    const { role } = req.body;
    const prompt = `Generate 10 technical multiple-choice questions for a "${role}". For each, provide 4 options and the correct answer. Respond ONLY with a valid JSON object matching the schema.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            questions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 4, maxItems: 4 },
                        correctAnswer: { type: Type.STRING },
                    },
                    required: ["question", "options", "correctAnswer"],
                },
            },
        },
        required: ["questions"],
    };
    const mcqData = await generateJsonFromGemini(prompt, schema);
    res.json(mcqData);
});

createGeminiRoute('generate-dsa', async (req, res) => {
    const { config } = req.body;
    const prompt = `Generate a DSA problem for a coding challenge. Topic: ${config.dsaTopic}, Difficulty: ${config.dsaDifficulty}. Provide a title, detailed description, 2-3 examples with explanations, constraints, and 5 diverse test cases (input and expectedOutput). Respond ONLY with a valid JSON object matching the schema.`;
    const schema = {
        type: Type.OBJECT, properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            examples: { type: Type.ARRAY, items: { type: Type.STRING } },
            constraints: { type: Type.ARRAY, items: { type: Type.STRING } },
            testCases: {
                type: Type.ARRAY, items: {
                    type: Type.OBJECT, properties: {
                        input: { type: Type.STRING, description: "Input for the function, as a string." },
                        expectedOutput: { type: Type.STRING, description: "Expected output, as a string." },
                    }, required: ['input', 'expectedOutput']
                }
            }
        }, required: ['title', 'description', 'examples', 'constraints', 'testCases']
    };
    const questionData = await generateJsonFromGemini(prompt, schema);
    res.json({ question: questionData });
});

createGeminiRoute('run-dsa', async (req, res) => {
    const { question, code, language } = req.body;
    const prompt = `You are a code execution engine. Given a question, a user's code in ${language}, and test cases, execute the code against each test case.
    Question: ${question.description}
    Code: \`\`\`${language.toLowerCase()}\n${code}\n\`\`\`
    Test Cases: ${JSON.stringify(question.testCases)}
    Respond ONLY with a JSON object with a key "results", which is an array of objects. Each object must have keys: "input", "expected", "actual" (the code's output), and "passed" (a boolean).`;
    const schema = {
        type: Type.OBJECT, properties: {
            results: {
                type: Type.ARRAY, items: {
                    type: Type.OBJECT, properties: {
                        input: { type: Type.STRING },
                        expected: { type: Type.STRING },
                        actual: { type: Type.STRING },
                        passed: { type: Type.BOOLEAN },
                    }, required: ["input", "expected", "actual", "passed"],
                },
            },
        }, required: ["results"],
    };
    const resultsData = await generateJsonFromGemini(prompt, schema);
    res.json(resultsData);
});

createGeminiRoute('review-dsa', async (req, res) => {
    const { question, code, language } = req.body;
    const prompt = `You are a senior engineer providing a code review. Review the following code solution in ${language} for the problem titled "${question.title}". Problem Description: "${question.description}". Provide constructive feedback on correctness, efficiency (time/space complexity), and code style/readability. Format the response in clear markdown. Solution to review:\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\``;
    const reviewText = await generateTextFromGemini(prompt);
    res.json({ review: reviewText });
});

createGeminiRoute('get-dsa-solution', async (req, res) => {
    const { question, language } = req.body;
    const prompt = `Provide an optimal, commented solution in ${language} for the problem: "${question.title}". Description: "${question.description}". Respond ONLY with the raw code for the solution, without any surrounding text or markdown formatting.`;
    const solutionText = await generateTextFromGemini(prompt);
    res.json({ solution: solutionText.replace(/```[\w]*\n|```/g, "").trim() });
});

createGeminiRoute('translate-code', async (req, res) => {
    const { code, fromLanguage, toLanguage } = req.body;
    const prompt = `Translate this code from ${fromLanguage} to ${toLanguage}. Preserve all logic and comments. Respond ONLY with the raw translated code, with no explanations or markdown formatting.\n\nCode to translate:\n\`\`\`${fromLanguage.toLowerCase()}\n${code}\n\`\`\``;
    const translatedCode = await generateTextFromGemini(prompt);
    res.json({ translatedCode: translatedCode.replace(/```[\w]*\n|```/g, "").trim() });
});

createGeminiRoute('analyze-delivery', async (req, res) => {
    const { transcript } = req.body;
    const prompt = `Analyze this transcript for common filler words (um, uh, like, you know, so, basically, actually). Respond ONLY with a valid JSON object matching the schema: { "fillerWords": { "um": 3, "uh": 2, "like": 5 } }. Transcript: "${transcript}"`;
    const schema = {
        type: Type.OBJECT,
        properties: { fillerWords: { type: Type.OBJECT, description: "Key-value pairs of filler words and their counts.", additionalProperties: { type: Type.NUMBER } } },
        required: ['fillerWords'],
    };
    const deliveryData = await generateJsonFromGemini(prompt, schema);
    res.json({ analysis: deliveryData });
});

createGeminiRoute('generate-tech-question', async (req, res) => {
    const { role, language } = req.body;
    const prompt = `Generate one concise coding question suitable for a live technical interview for a ${role} position, solvable in about 15-20 minutes. The question should be answerable using ${language}. Provide only the question text as a plain string, without examples or constraints.`;
    const questionText = await generateTextFromGemini(prompt);
    res.json({ question: questionText });
});

createGeminiRoute('review-solution', async (req, res) => {
    const { question, code, language } = req.body;
    const prompt = `As an interviewer, briefly review this coding solution. Question: "${question}". Code in ${language}:\n\`\`\`${code}\`\`\`\nProvide concise feedback on its correctness, style, and efficiency. Format the response in markdown.`;
    const reviewText = await generateTextFromGemini(prompt);
    res.json({ review: reviewText });
});


// --- Start Server ---
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
});
