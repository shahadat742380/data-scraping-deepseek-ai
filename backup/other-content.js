import axios from 'axios';
import * as cheerio from 'cheerio';

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

        const result = {
            title: title,
            contents: contents
        };

        console.log(result); 

    } catch (error) {
        console.error('Error fetching data for link', link, ':', error);
    }
};

const fetchAllChapters = async () => {
    for (const link of links) {
        await fetchChapterContent(link); 
    }
};

fetchAllChapters();
