import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

const links = [
    "1/", "2/", "3/", "4/", "5/", "6/", "7/", "8/", "9/", "10/",
    "11/", "12/", "13/", "14/", "15/", "16/", "17/", "18/"
];

// Function to fetch and process each chapter
const fetchChapterContent = async (link) => {
    try {
        const response = await axios.get(`https://vedabase.io/en/library/bg/${link}`);
        const $ = cheerio.load(response.data);
        const chapterDiv = $('#content');
        
        const chapter = chapterDiv.find('h1').first().text().trim();
        const chapter_name = chapterDiv.find('h1').eq(1).text().trim();
        
        const points = [];
        chapterDiv.find('dl, dd').each((index, element) => {
            const text = $(element).text().trim();
            if (text) {
                points.push(text);
            }
        });

        // Prepare the Markdown content
        const markdownContent = `# ${chapter}\n\n## ${chapter_name}\n\n${points.map(point => `- ${point}`).join('\n')}`;

        // Ensure the chapters folder exists
        await fs.mkdir('chapters', { recursive: true });

        // Write to a Markdown file, naming it by the chapter number
        const chapterFileName = path.join('chapters', `Chapter_${link.replace('/', '')}.md`);
        await fs.writeFile(chapterFileName, markdownContent);
        console.log(`Markdown file created: ${chapterFileName}`);

    } catch (error) {
        console.error('Error fetching data for link', link, ':', error);
    }
};

// Fetch content from all chapters
const fetchAllChapters = async () => {
    for (const link of links) {
        await fetchChapterContent(link); // Await each chapter fetch
    }
};

// Start fetching content
fetchAllChapters();
