const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://ollama:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

const classifyGrievance = async (title, description, category) => {
  try {
    const prompt = `You are a government grievance classification assistant. Analyze the following grievance and respond ONLY with a valid JSON object containing "department" and "priority" fields.

Title: ${title}
Category: ${category}
Description: ${description}

Rules:
- department must be one of: Electricity, Water, Roads, Sanitation, Healthcare, Education, Public Safety, Environment, Infrastructure, General
- priority must be one of: Low, Medium, High, Critical
- Respond ONLY with JSON, no explanation

Example response:
{"department":"Electricity","priority":"Medium"}`;

    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.1,
        num_predict: 100,
      },
    }, { timeout: 60000 });

    const rawText = response.data.response || '';
    
    // Extract JSON from response
    const jsonMatch = rawText.match(/\{[^}]+\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const validDepts = ['Electricity', 'Water', 'Roads', 'Sanitation', 'Healthcare', 'Education', 'Public Safety', 'Environment', 'Infrastructure', 'General'];
      const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
      
      return {
        department: validDepts.includes(parsed.department) ? parsed.department : 'General',
        priority: validPriorities.includes(parsed.priority) ? parsed.priority : 'Medium',
      };
    }

    return { department: 'General', priority: 'Medium' };
  } catch (error) {
    console.error('AI classification error:', error.message);
    return { department: 'General', priority: 'Medium' };
  }
};

module.exports = { classifyGrievance };
