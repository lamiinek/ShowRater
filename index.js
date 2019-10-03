const fs = require("fs");
const cheerio = require("cheerio");
const fetch = require("node-fetch");
const dotenv = require("dotenv");
const readline = require("readline");

// add some nice colors
const colors = require("colors");
colors.enable();
//colors.disable();

dotenv.config();

const apikey = process.env.OMDB_API_KEY;

const ombdBaseUrl = `http://www.omdbapi.com/?apikey=${apikey}`;

(async () => {
  // ascii art
  const figlet = require("figlet");
  figlet("Show Rater", (e, d) => {
    e ? console.log(`Error: ${e}`) : console.log(d);
    console.log(colors.red("\t\tby Mouhamadou Lamine Ka"));
    console.log(colors.red("\t\t\t@lamiinek\n\n"));
    console.log("Enter Show Title: ".bgBlue);
  });

  // GET CLI INPUT
  let showTitle = "";
  let showSeason = null;

  const getInput = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  //scrapIMDB(title, season)
  getInput.question("", async answer => {
    answer ? (showTitle = answer) : console.log("please enter a valid title");

    if (showTitle) {
      showTitle = showTitle.replace(" ", "+").toLocaleLowerCase();

      getInput.question("enter season (#): \n".bgCyan, async answer => {
        answer ? (showSeason = answer) : console.log("Enter a valid season #");
        getInput.close();

        const data = await scrapIMDB(showTitle, showSeason);
        await formatEpisodesDisplay(showTitle, data[0], data[1]);
        await writeMyJsonFile(showTitle, data[1], data[0]);
      });
    }
  });
})();

function formatEpisodesDisplay(show, rating, season) {
  const rftitle = show.replace("+", " ").toUpperCase();

  console.log(`\n\n${colors.bold.bgGreen(rftitle)} Season #${season}\n`);

  for (let i = 0; i < rating.length; ) {
    if (rating[i] >= 7) {
      console.log(`✅ Episode #${i + 1} ► ${colors.green(rating[i])}/10 😄`);
    } else if (rating[i] < 7 && rating[i] > 5) {
      console.log(`✅ Episode #${i + 1} ► ${colors.yellow(rating[i])}/10 😐`);
    } else if (rating[i] < 5) {
      console.log(`✅ Episode #${i + 1} ► ${colors.red(rating[i])}/10 💩`);
    }
    i++;
  }
}

// Write data to a JSON file
function writeMyJsonFile(show, season, data) {
  //
  let json = {};

  for (let i = 0; i < data.length; i++) {
    json[`episode${i + 1}`] = data[i];
  }
  const result = JSON.stringify(json);

  try {
    const filename = "saved_files/" + show + "_" + season + ".json";

    fs.writeFile(filename, result, err => {
      err ? console.log(err) : null;
    });
    fs.close();
  } catch (error) {}
}

async function getOmdbInfo(show) {
  try {
    const ombdReq = await fetch(ombdBaseUrl + "&t=" + show);
    const ombd = await ombdReq.json();

    const title = ombd["Title"];
    const poster = ombd["Poster"];
    const imdbID = ombd["imdbID"];
    const showRating = ombd["imdbRating"];

    return { title, poster, imdbID, showRating };
    //
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

async function scrapIMDB(title, season) {
  try {
    const ombdInfo = await getOmdbInfo(title);
    const id = ombdInfo["imdbID"];
    const imdbURL = `https://www.imdb.com/title/${id}/episodes?season=${season}`;
    console.log(imdbURL);
    const request = await fetch(imdbURL);
    const html = await request.text();
    const $ = cheerio.load(html);

    // get entire season's rating
    /*const seasonRating = $("span[itemprop=ratingValue]").text();
    console.log(seasonRating);
    return seasonRating;*/

    const season_episodes = [];

    const data = $(
      ".list_item > .info > .ipl-rating-widget > .ipl-rating-star .ipl-rating-star__rating"
    ).each((index, element) => {
      const rating = $(element).text();
      season_episodes.push(rating);
    });

    return [season_episodes, season];
  } catch (err) {
    console.log(err);
  }
}
