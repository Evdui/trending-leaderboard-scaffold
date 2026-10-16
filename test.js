// test.js — proves the leaderboard works.
// Run with:  npm test   (run `npm run seed` first)
//
// The test: take a LOW-scored post, upvote it 50 times, then assert it now
// appears in the top 10 of getTop(10). If it doesn't, your upvote/getTop is wrong.

import { upvote, getTop, redis } from "./leaderboard.js";

async function run() {
  const target = "post:50"; // any seeded post id

  // Upvote the target 50 times.
  for (let i = 0; i < 50; i++) {
    // TODO: await upvote(target);
    await upvote(target);
  }

  // Fetch the top 10 WITH metadata.
  const top = await getTop(10);
  console.log("Top 10:");
  top.forEach((p, i) => console.log(`  #${i + 1}  ${p.id}  score=${p.score}  ${p.title} (${p.author})`));

  const madeIt = top.some((p) => p.id === target);
  console.log(madeIt ? `\nPASS ✅  ${target} reached the top 10` : `\nFAIL ❌  ${target} is NOT in the top 10`);

  redis.disconnect();
  process.exit(madeIt ? 0 : 1);
}

run();
