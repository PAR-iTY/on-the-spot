# on-the-spot

map of user-submitted skate spots

### serverless static site persistence with python, gmail and git

- user sends form data to formspree service
- gmail recieves data and is read by python
- python processes gmail data
- geojson file and images are updated
- git pushes updates back to static site

## experiments

- serverless persistence without significant cloud services or fees
- using a free static site form submission api for security and filtering
- email processing script that only uses python 3.8^ standard libraries
- being opinionated for predictability with data and filename text formatting
- parsing email lines into geojson to load into mapping library
- config file template with fake values for seperating environment variables
- mutation observer api to unify user and programmatic form-filling events
- formspree freemium base64 image-encoding and decoding workaround
- learning to scaffold fast responsive grid css with tailwind css
- client-side ecmascript modules syntax for readability and modularity
- uses python subprocess to run git push to close the loop and update website

## todo
- swap tailwind cdn for vite.js + tailwind + postcss to generate production css
- schedule the python script to run or somehow attach listener to email notification
- improve spot-hunting UX generally with better navigation and details and search
- add this location-search API https://www.youtube.com/watch?v=ZXT8i0qR2vE (apparently it can integrate with leaflet)

## possible
- use event driven approach over scheduling via python/powershell/RSS/other
- listen for windows user notification event (gmail itself offers desktop notifications)
- call this python script from powershell and use to drive event api calls
