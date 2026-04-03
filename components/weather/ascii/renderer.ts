import { CLOUDS, FENCE, HOUSE_DAY, HOUSE_NIGHT, MAILBOX, MOON_PHASES, PINE_TREE, SUN_FRAMES, TREE } from "@/components/weather/ascii/scenes";
import type { Grid, RenderSceneOptions, Sprite } from "@/components/weather/ascii/types";
import type { WeatherCategory } from "@/lib/weather";

const DEFAULT_WIDTH = 72;
const DEFAULT_HEIGHT = 22;

function createGrid(width: number, height: number): Grid {
  return Array.from({ length: height }, () => Array.from({ length: width }, () => " "));
}

function spriteWidth(sprite: Sprite) {
  return sprite.reduce((max, line) => Math.max(max, line.length), 0);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function noise(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function plot(grid: Grid, x: number, y: number, character: string) {
  const row = grid[y];
  if (!row || !character.trim()) {
    return;
  }

  if (x < 0 || x >= row.length) {
    return;
  }

  row[x] = character;
}

function drawSprite(grid: Grid, sprite: Sprite, x: number, y: number) {
  sprite.forEach((line, rowOffset) => {
    for (let column = 0; column < line.length; column += 1) {
      plot(grid, x + column, y + rowOffset, line[column]);
    }
  });
}

function drawText(grid: Grid, text: string, x: number, y: number) {
  const row = grid[y];
  if (!row) {
    return;
  }

  for (let index = 0; index < text.length; index += 1) {
    const column = x + index;
    if (column < 0 || column >= row.length) {
      break;
    }

    row[column] = text[index];
  }
}

function drawStars(grid: Grid, frame: number) {
  const width = grid[0]?.length ?? DEFAULT_WIDTH;
  const skyHeight = Math.max(6, Math.floor(grid.length / 2));
  const stars = [".", ".", "*", "+", "."];

  for (let index = 0; index < 20; index += 1) {
    if ((frame + index) % 5 === 0) {
      continue;
    }

    const x = Math.floor(noise(index + 1) * width);
    const y = Math.floor(noise(index + 101) * skyHeight);
    plot(grid, x, y, stars[index % stars.length]);
  }
}

function drawClouds(grid: Grid, frame: number, category: WeatherCategory) {
  const width = grid[0]?.length ?? DEFAULT_WIDTH;
  const cloudCountMap: Record<WeatherCategory, number> = {
    clear: 1,
    "partly-cloudy": 2,
    overcast: 4,
    drizzle: 3,
    rain: 3,
    thunderstorm: 4,
    snow: 3,
    fog: 2,
    mixed: 3
  };
  const speedMap: Record<WeatherCategory, number> = {
    clear: 0.6,
    "partly-cloudy": 0.9,
    overcast: 0.8,
    drizzle: 1.1,
    rain: 1.3,
    thunderstorm: 1.6,
    snow: 0.8,
    fog: 0.5,
    mixed: 1.1
  };

  const count = cloudCountMap[category];
  const speed = speedMap[category];

  for (let index = 0; index < count; index += 1) {
    const sprite = CLOUDS[index % CLOUDS.length];
    const widthWithPadding = width + spriteWidth(sprite) + 18;
    const x = Math.floor((frame * speed + index * 17) % widthWithPadding) - spriteWidth(sprite) - 8;
    const y = 1 + (index % 3) * 2;
    drawSprite(grid, sprite, x, y);
  }
}

function drawBirds(grid: Grid, frame: number) {
  const width = grid[0]?.length ?? DEFAULT_WIDTH;
  const wingFrame = frame % 8 < 4 ? "v" : "^";
  const x = Math.floor((frame * 1.6) % (width + 12)) - 10;
  drawText(grid, `${wingFrame} ${wingFrame}`, x, 5);
  drawText(grid, wingFrame, x + 9, 7);
}

function drawFireflies(grid: Grid, frame: number) {
  const points = [
    { x: 10, y: 15 },
    { x: 17, y: 16 },
    { x: 57, y: 14 },
    { x: 63, y: 16 }
  ];

  points.forEach((point, index) => {
    if ((frame + index * 2) % 6 < 3) {
      plot(grid, point.x, point.y, ".");
    }
  });
}

function drawGround(grid: Grid) {
  const width = grid[0]?.length ?? DEFAULT_WIDTH;
  const groundRow = grid.length - 2;
  const dirtRow = grid.length - 1;

  for (let index = 0; index < width; index += 1) {
    plot(grid, index, groundRow, "_");
    if (index % 3 === 0) {
      plot(grid, index, dirtRow, ".");
    }
  }
}

function drawScene(grid: Grid, isDay: boolean) {
  const width = grid[0]?.length ?? DEFAULT_WIDTH;
  const house = isDay ? HOUSE_DAY : HOUSE_NIGHT;
  const houseX = Math.floor(width / 2) - Math.floor(spriteWidth(house) / 2);
  const houseY = grid.length - house.length - 3;

  drawSprite(grid, TREE, 4, grid.length - TREE.length - 3);
  drawSprite(grid, house, houseX, houseY);
  drawSprite(grid, MAILBOX, houseX + spriteWidth(house) + 7, grid.length - MAILBOX.length - 3);
  drawSprite(grid, FENCE, houseX + spriteWidth(house) + 1, grid.length - FENCE.length - 2);

  if (width > 62) {
    drawSprite(grid, PINE_TREE, width - spriteWidth(PINE_TREE) - 5, grid.length - PINE_TREE.length - 3);
  }
}

function drawDrizzle(grid: Grid, frame: number) {
  const width = grid[0]?.length ?? DEFAULT_WIDTH;
  const limit = grid.length - 3;
  const count = Math.floor(width / 6);

  for (let index = 0; index < count; index += 1) {
    const x = (index * 7 + Math.floor(noise(index + 20) * width)) % width;
    const y = Math.floor((frame + index * 3) % limit);
    plot(grid, x, y, index % 2 === 0 ? "." : ",");
  }
}

function drawRain(grid: Grid, frame: number, intensity: "light" | "medium" | "heavy" | "storm") {
  const width = grid[0]?.length ?? DEFAULT_WIDTH;
  const limit = grid.length - 2;
  const settings = {
    light: { count: Math.floor(width / 4), speed: 2, slant: 0, chars: ["|", ":", "."] },
    medium: { count: Math.floor(width / 3), speed: 3, slant: 0, chars: ["|", ":", "|"] },
    heavy: { count: Math.floor(width / 2.5), speed: 4, slant: 0, chars: ["|", "|", ":"] },
    storm: { count: Math.floor(width / 2), speed: 5, slant: 1, chars: ["/", "\\", "|"] }
  }[intensity];

  for (let index = 0; index < settings.count; index += 1) {
    const y = Math.floor((frame * settings.speed + index * 4) % limit);
    const baseX = (index * 5 + Math.floor(noise(index + 80) * width)) % width;
    const x = (baseX + Math.floor(y * settings.slant * 0.4)) % width;
    plot(grid, x, y, settings.chars[index % settings.chars.length]);

    if (y >= grid.length - 4) {
      plot(grid, x, grid.length - 2, index % 2 === 0 ? "o" : ".");
    }
  }
}

function drawSnow(grid: Grid, frame: number, dense = false) {
  const width = grid[0]?.length ?? DEFAULT_WIDTH;
  const limit = grid.length - 3;
  const count = dense ? Math.floor(width / 3) : Math.floor(width / 4);
  const chars = dense ? ["*", ".", "+"] : [".", "*", "+"];

  for (let index = 0; index < count; index += 1) {
    const y = Math.floor((frame * (dense ? 1.6 : 1.2) + index * 3) % limit);
    const sway = Math.round(Math.sin((frame + index * 9) / 5));
    const baseX = (index * 6 + Math.floor(noise(index + 120) * width)) % width;
    const x = (baseX + sway + width) % width;
    plot(grid, x, y, chars[index % chars.length]);
  }
}

function drawFog(grid: Grid, frame: number) {
  const width = grid[0]?.length ?? DEFAULT_WIDTH;
  const wisps = ["~ ~ ~", ".-.-.", "~~ ~~", "- ~ -"];

  for (let index = 0; index < wisps.length + 2; index += 1) {
    const wisp = wisps[index % wisps.length];
    const cycle = width + wisp.length + 18;
    const x = Math.floor((frame * 0.9 + index * 13) % cycle) - wisp.length - 8;
    const y = 7 + (index % 4) * 2;
    drawText(grid, wisp, x, y);
  }
}

export function isLightningFlashFrame(category: WeatherCategory | undefined, frame: number) {
  if (category !== "thunderstorm") {
    return false;
  }

  const cycle = frame % 72;
  return cycle === 2 || cycle === 3;
}

function drawLightning(grid: Grid, frame: number) {
  const cycle = frame % 72;
  if (cycle > 4) {
    return;
  }

  const width = grid[0]?.length ?? DEFAULT_WIDTH;
  const minX = Math.floor(width * 0.52);
  const maxX = width - 6;
  let currentX = Math.floor(width * 0.72);

  for (let y = 1; y < grid.length - 5; y += 1) {
    const direction = (y + cycle) % 2 === 0 ? -1 : 1;
    currentX = clamp(currentX + direction, minX, maxX);
    plot(grid, currentX, y, y % 2 === 0 ? "\\" : "/");

    if (y % 4 === 0) {
      plot(grid, currentX, y + 1, "|");
    }
  }
}

function drawSkyBody(grid: Grid, options: RenderSceneOptions) {
  const { frame, category = "clear", isDay = true } = options;

  if (isDay) {
    drawSprite(grid, SUN_FRAMES[frame % SUN_FRAMES.length], grid[0].length - 12, 1);
  } else {
    drawStars(grid, frame);
    drawSprite(grid, MOON_PHASES[Math.floor(frame / 10) % MOON_PHASES.length], grid[0].length - 11, 1);
    if (category === "clear" || category === "partly-cloudy") {
      drawFireflies(grid, frame);
    }
  }

  if (category !== "clear") {
    drawClouds(grid, frame, category);
  } else if (frame % 28 < 20) {
    drawClouds(grid, frame, "partly-cloudy");
  }

  if (isDay && (category === "clear" || category === "partly-cloudy")) {
    drawBirds(grid, frame);
  }
}

function drawWeatherEffects(grid: Grid, options: RenderSceneOptions) {
  const { category = "clear", frame } = options;

  switch (category) {
    case "drizzle":
      drawDrizzle(grid, frame);
      return;
    case "rain":
      drawRain(grid, frame, "medium");
      return;
    case "thunderstorm":
      drawRain(grid, frame, "storm");
      drawLightning(grid, frame);
      return;
    case "snow":
      drawSnow(grid, frame, true);
      return;
    case "mixed":
      drawRain(grid, frame, "light");
      drawSnow(grid, frame);
      return;
    case "fog":
      drawFog(grid, frame);
      return;
    default:
      return;
  }
}

function drawSceneHeader(grid: Grid, options: RenderSceneOptions) {
  const { mode, locationName, conditionLabel, temperature } = options;

  if (mode === "loading") {
    const spinner = ["-", "\\", "|", "/"][options.frame % 4];
    drawText(grid, "[ weather uplink ]", 2, 1);
    drawText(grid, `fetching live conditions ${spinner}`, 2, 3);
    drawText(grid, "geocode -> current -> forecast", 2, 5);
    return;
  }

  if (mode === "error") {
    drawText(grid, "[ weather uplink ]", 2, 1);
    drawText(grid, "request failed", 2, 3);
    drawText(grid, "adjust the query and try again", 2, 5);
    return;
  }

  if (mode === "idle") {
    drawText(grid, "[ weather uplink ]", 2, 1);
    drawText(grid, "search a city or US ZIP code", 2, 3);
    drawText(grid, "examples: austin, tx   90210", 2, 5);
    return;
  }

  const locationText = locationName ? `[ ${locationName.toLowerCase()} ]` : "[ weather uplink ]";
  const summaryText = conditionLabel
    ? `${conditionLabel.toLowerCase()}${typeof temperature === "number" ? `  ${Math.round(temperature)}f` : ""}`
    : "live weather";

  drawText(grid, locationText, 2, 1);
  drawText(grid, summaryText, 2, 3);
}

export function renderWeatherScene(options: RenderSceneOptions) {
  const width = options.width ?? DEFAULT_WIDTH;
  const height = options.height ?? DEFAULT_HEIGHT;
  const grid = createGrid(width, height);
  const baseCategory = options.mode === "ready" ? options.category ?? "clear" : "clear";
  const baseIsDay = options.mode === "ready" ? options.isDay ?? true : true;

  drawSkyBody(grid, {
    ...options,
    category: baseCategory,
    isDay: baseIsDay
  });
  drawGround(grid);
  drawScene(grid, baseIsDay);
  drawWeatherEffects(grid, options.mode === "ready" ? options : { ...options, category: "clear" });
  drawSceneHeader(grid, options);

  return grid.map((row) => row.join("")).join("\n");
}

