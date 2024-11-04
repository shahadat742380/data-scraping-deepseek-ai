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

const scrap = async (url, documentName) => {
    try {
        const response = await axios.get(url);

        const $ = cheerio.load(response.data);
        const content = $('body').text().trim(); 

        console.log(content); 

        const aiResponse = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                {
                    role: 'user',
                    content: `Analyze and summarize the following content and create a Markdown format with the necessary content.:\n\n${content}`,
                },
            ],
            model: 'deepseek-chat',
        });

        

        const markdownContent = aiResponse.choices[0].message.content;

        await fs.writeFile(`${documentName}.md`, markdownContent);
        console.log(`Markdown document '${documentName}.md' created successfully.`);

    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.error('Rate limit exceeded. Retrying after 60 seconds...');
            setTimeout(() => scrap(url, documentName), 60000); 
        } else {
            console.error('Error fetching or processing data:', error);
        }
    }
};

// Example usage
scrap('https://vedabase.io/en/library/bg/', 'abcd');
