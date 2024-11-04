import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';

// const scrap = async () => {
//     try {
//         const response = await axios.get('https://vedabase.io/en/library/bg/');
        
//         const $ = cheerio.load(response.data);  

//         const title = $('h1').first().text().trim();

//         const chaptersName = [];

//         $('#content a').each((index, element) => {
//             const chapterText = $(element).text().trim();
//             if (chapterText) {
//                 chaptersName.push(chapterText);
//             }
//         });

//         const result = {
//             title: title,
//             chaptersName: chaptersName
//         };

//         console.log(result);

//     } catch (error) {
//         console.error('Error fetching data:', error);  
//     }
// };

// scrap();




const scrap2 = async () => {
    try {
        // Fetch the webpage
        const response = await axios.get('https://vedabase.io/en/library/bg/');
        
        const $ = cheerio.load(response.data);  
        const title = $('h1').first().text().trim();

        const chaptersName = [];
        $('#content a').each((index, element) => {
            const chapterText = $(element).text().trim();
            if (chapterText) {
                chaptersName.push(chapterText);
            }
        });

        const markdownContent = `# ${title}\n\n## Chapters\n\n${chaptersName.map((chapter, index) => `- Chapter ${index + 1}: ${chapter}`).join('\n')}`;

        await fs.writeFile('document.md', markdownContent);
        console.log("Data successfully saved to document.md");

    } catch (error) {
        console.error('Error fetching data:', error);  
    }
};

scrap2();
