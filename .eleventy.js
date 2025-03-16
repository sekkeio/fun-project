import Image from "@11ty/eleventy-img";
import { join } from "path";
import { readFileSync } from "fs";

let notionGalleryData;
try {
  notionGalleryData = JSON.parse(readFileSync("./src/_data/notionGalleryData.json", "utf8"));
  console.log("[DEBUG] notionGalleryData успешно прочитан:", notionGalleryData.results.length, "элементов");
} catch (error) {
  console.error("[ERROR] Не удалось прочитать notionGalleryData.json:", error.message);
  console.error("Убедитесь, что вы запустили `node fetchNotionGalleryData.js` перед сборкой.");
  process.exit(1);
}

export default async function(eleventyConfig) {
  eleventyConfig.addCollection("processedGallery", async function() {
    const processedGallery = [];

    for (const item of notionGalleryData.results) {
      const imageFiles = item.properties["Files & media"]?.files || [];
      if (imageFiles.length === 0) {
        console.warn("[WARN] Пропущен элемент без изображения:", item.properties.Name?.title[0]?.plain_text);
        continue;
      }

      const filename = imageFiles[0].name.split(".")[0];
      const src = join("src", "images", "notion", imageFiles[0].name);

      let metadata;
      try {
        console.log("[DEBUG] Обрабатываем изображение:", src);
        metadata = await Image(src, {
          widths: [300, 600, 960, 1200],
          formats: ["webp", "jpeg"],
          outputDir: "./dist/images/",
          urlPath: "/images/",
          filenameFormat: function(id, src, width, format) {
            const name = filename.replace(/_/g, "-");
            return `${name}-${width}w.${format}`;
          }
        });
      } catch (error) {
        console.error("[ERROR] Ошибка обработки изображения", filename, ":", error.message);
        continue;
      }

      processedGallery.push({
        filename: filename,
        alt: item.properties.Name.title[0]?.plain_text || "Image",
        category: item.properties.Category?.multi_select.map(cat => cat.name) || [],
        url: metadata.webp[metadata.webp.length - 1].url,
        srcsetWebp: metadata.webp.map(img => `${img.url} ${img.width}w`).join(", "),
        srcsetJpeg: metadata.jpeg.map(img => `${img.url} ${img.width}w`).join(", "),
        lowestSrc: metadata.jpeg[0].url
      });
    }
    
    console.log("[DEBUG] Коллекция processedGallery:", JSON.stringify(processedGallery, null, 2));
    if (processedGallery.length === 0) {
      console.warn("[WARN] Коллекция processedGallery пуста.");
    }
    
    return processedGallery;
  });

  eleventyConfig.addPassthroughCopy({
    "src/public/": "/",
    "src/assets/": "/assets/"
  });

  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "includes",
      data: "_data"
    },
    htmlTemplateEngine: "njk"
  };
}