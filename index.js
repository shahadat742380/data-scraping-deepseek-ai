import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const openai = new OpenAI({
    baseURL: process.env.BASE_URL,
    apiKey: process.env.OPENAI_API_KEY,
});

const scrap = async () => {
    try {
        const response = await axios.get('https://vedabase.io/en/library/bg/');

        const $ = cheerio.load(response.data);
        const content = $('body').text();

        const aiResponse = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                {
                    role: 'user',
                    content: `Analyze and summarize the following HTML content in Markdown format:\n\n${content}`,
                },
            ],
            model: 'deepseek-chat',
        });

        // Extract the content from the response
        const markdownContent = aiResponse.choices[0].message.content;

        await fs.writeFile('document.md', markdownContent);
        console.log('Markdown document created successfully.');

    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.error('Rate limit exceeded. Retrying after 60 seconds...');
            setTimeout(scrap, 60000); 
        } else {
            console.error('Error fetching or processing data:', error);
        }
    }
};

scrap();
