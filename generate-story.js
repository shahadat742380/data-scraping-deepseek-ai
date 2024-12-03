import { subChapter } from "./sub_chapter.js";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs/promises"; 

dotenv.config();

const openai = new OpenAI({
  baseURL: process.env.BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

const generateStories = async () => {
  try {
    const sub_chapters = subChapter; // Import the data

    const stories = new Map(); // Use a Map to ensure unique story titles

    for (const chapter of sub_chapters) {
      const content = `Sub-Chapter:\n- ID: ${chapter.id}\n- Chapter ID: ${chapter.chapter_id}\n- Content: ${chapter.content}\n`;

      // Generate AI response for each subChapter
      const aiResponse = await openai.chat.completions.create({
        messages: [
          { role: "system", content: "You are a creative and engaging storyteller." },
          {
            role: "user",
            content: `Based on the following sub-chapter data, create a JSON object with the following fields:\n\n1. 'story_title': A unique and engaging title for the story.\n2. 'content': An array of paragraphs summarizing or expanding the sub-chapter content.\n3. 'sub_chapter_id': The ID of the sub-chapter.\n\nOnly return valid JSON, no additional text:\n\n${content}`,
          },
        ],
        model: "deepseek-chat",
      });

      // Extract and sanitize the AI's response
      let responseContent = aiResponse.choices[0].message.content;
      responseContent = responseContent.replace(/```json|```/g, "").trim();

      // Parse the response JSON
      const story = JSON.parse(responseContent);

      // Ensure uniqueness of story titles
      if (stories.has(story.story_title)) {
        story.story_title += ` (Unique ${chapter.id})`;
      }

      stories.set(story.story_title, story); 
    }

    // Convert Map values to an array
    const uniqueStories = Array.from(stories.values());

    // Write the unique stories to a JSON file
    const filePath = "./stories.json"; 
    await fs.writeFile(filePath, JSON.stringify(uniqueStories, null, 2), "utf8");

    console.log("Generated Unique Stories:\n", JSON.stringify(uniqueStories, null, 2));

    return uniqueStories; // Return all generated stories
  } catch (error) {
    console.error("Error generating stories:", error);
  }
};

// Call the function to execute
generateStories();
