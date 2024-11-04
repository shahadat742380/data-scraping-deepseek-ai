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

        // Format the Markdown content
        const markdownContent = `# ${title}\n\n${contents.join('\n\n')}`;

        // Ensure the content folder exists
        await fs.mkdir('content', { recursive: true });

        // Generate a filename based on the title or link (replace spaces with underscores)
        const sanitizedTitle = title.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
        const fileName = sanitizedTitle || link.replace(/\//g, ''); // Fallback to link if title is empty
        const filePath = path.join('content', `${fileName}.md`);

        // Write the Markdown file
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
