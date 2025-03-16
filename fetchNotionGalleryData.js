import { Client } from "@notionhq/client";
import { writeFile, mkdir, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import fetch from "node-fetch";

// Получаем текущий путь файла
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const notion = new Client({
  auth: "ntn_w98442816496zVQatWBmcXu1Q378ltq95hlVn9L2YzZey4",
});

const databaseId = "1b624ac3d131805e9672f84611648020";

export default async function fetchNotionGalleryData() {
  console.log("Начинаем запрос к Notion API...");
  try {
    // Запрашиваем данные из базы данных Notion
    const response = await notion.databases.query({
      database_id: databaseId,
    });

    console.log("Данные от Notion получены:", response.results.length, "элементов");

    // Создаем папку для изображений, если её нет
    const imagesDir = join(__dirname, "src", "images", "notion");
    await mkdir(imagesDir, { recursive: true });

    // Скачиваем изображения
    for (const item of response.results) {
      const imageFiles = item.properties["Files & media"]?.files || [];
      if (imageFiles.length > 0) {
        const imageUrl = imageFiles[0].file.url;
        const imageName = imageFiles[0].name;
        const imagePath = join(imagesDir, imageName);

        if (!existsSync(imagePath)) {
          console.log(`Скачиваем изображение: ${imageName}...`);
          try {
            const imageResponse = await fetch(imageUrl);
            if (imageResponse.ok) {
              const imageBuffer = await imageResponse.buffer();
              await writeFile(imagePath, imageBuffer);
              console.log(`Изображение сохранено: ${imagePath}`);
            } else {
              console.error(`Не удалось скачать изображение ${imageName}: ${imageResponse.statusText}`);
            }
          } catch (error) {
            console.error(`Ошибка при скачивании изображения ${imageName}:`, error.message);
          }
        } else {
          console.log(`Изображение ${imageName} уже существует, пропускаем.`);
        }
      }
    }

    // Формируем правильный путь к src/_data
    const outputPath = join(__dirname, "src", "_data", "notionGalleryData.json");
    console.log("Путь для сохранения JSON:", outputPath);

    // Сохраняем только нужные данные (results)
    await writeFile(outputPath, JSON.stringify({ results: response.results }, null, 2), "utf8");
    console.log("JSON успешно сохранен в:", outputPath);

    return response;
  } catch (error) {
    console.error("Ошибка при работе с Notion API или сохранении файла:");
    console.error("Сообщение ошибки:", error.message);
    console.error("Полный стек ошибки:", error.stack);
    return {};
  }
}

// Вызываем функцию, если файл запущен напрямую
if (import.meta.url === new URL(import.meta.url).href) {
  fetchNotionGalleryData();
}