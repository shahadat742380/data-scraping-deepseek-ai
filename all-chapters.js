import axios from 'axios';
import * as cheerio from 'cheerio';

const links = [
    "1/", "2/", "3/", "4/", "5/", "6/", "7/", "8/", "9/", "10/",
    "11/", "12/", "13/", "14/", "15/", "16/", "17/", "18/"
];

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

        const result = {
            chapter: chapter,
            chapter_name: chapter_name,
            points: points
        };

        console.log(result); 

    } catch (error) {
        console.error('Error fetching data for link', link, ':', error);
    }
};

const fetchAllChapters = async () => {
    for (const link of links) {
        await fetchChapterContent(link); // Await each chapter fetch
    }
};

// Start fetching content from all links
fetchAllChapters();
