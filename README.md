# ShowRater
Simple Node JS command line application that will get and save the rating of any specified TV show. 

#### NOTICE:
This is done by scrapping IMDB's website. IMDB uses codes instead of the actual name of a movie/show, so I used OMDB to get the show's IMDB code and pass it as an argument.

## Install & Usage
- Requires node.js
- Because it uses omDB's API to get the show's ID, an API key from omDB is required.
Once the API key acquired, put it in the _.env_ file
- Open a terminal in the directory containing the files and run
- *npm install* (_install all dependencies_)
- *pm start* 

![Screenshot](screenshot.png)
