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
        const content = $('body').find('h1, h2, h4, h5, h6, p, span, ul, li, th, td, dd, dt').map((i, el) => $(el).text()).get().join('\n\n');

        console.log(content); // Log the extracted content

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
scrap('https://www.peacockindia.in/', 'peacock');
