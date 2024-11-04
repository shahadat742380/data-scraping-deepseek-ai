import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

const links = [
    "setting-the-scene/",
    "dedication/",
    "preface/",
    "note-2nd-edition/"
];

const fetchChapterContent = async (link) => {
    try {
        const response = await axios.get(`https://vedabase.io/en/library/bg/${link}`);
        const $ = cheerio.load(response.data);

        const chapterDiv = $('#content');
        const title = chapterDiv.find('h1').first().text().trim();

        const contents = [];
        chapterDiv.find('p').each((index, element) => {
            const paragraphText = $(element).text().trim();
            if (paragraphText) {
                contents.push(paragraphText);
            }
        });

        const markdownContent = `# ${title}\n\n${contents.join('\n\n')}`;

        await fs.mkdir('content', { recursive: true });

        const sanitizedTitle = title.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
        const fileName = sanitizedTitle || link.replace(/\//g, ''); 
        
        const filePath = path.join('content', `${fileName}.md`);

        await fs.writeFile(filePath, markdownContent);
        console.log(`Markdown file created: ${filePath}`);

    } catch (error) {
        console.error('Error fetching data for link', link, ':', error);
    }
};

const fetchAllChapters = async () => {
    for (const link of links) {
        await fetchChapterContent(link); 
    }
};

// Start fetching content
fetchAllChapters();
