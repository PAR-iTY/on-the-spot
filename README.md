# on-the-spot

map of user-submitted skate spots to be built up over time as a resource for skaters

### static site persistence with python, gmail and git

- user submits form data via formspree API service
- dedicated gmail account recieves form data from API
- local python script reads and processes gmail data
- geojson file and images are updated
- git pushes updates back to static site

## experiments

- static site persistence without dedicated server/cloud services or fees
- email processing script that only uses standard libraries (python 3.8^)
- uses python subprocess to run git push to close the loop and update website
- parsing email line-data into geojson to load into leaflet map library
- using opinionated and predictable name formatting for data storage
- config ini file for seperating environment variables (github values are fake)
- using a free form submission API to avoid security concerns and server
- formspree freemium base64 image-encoding and decoding workaround
- mutation observer API to unify user and programmatic form-filling events
- learning to scaffold fast responsive grid css with tailwind css
- client-side ecmascript modules syntax for readability and modularity

## note on security

As a for fun experiment, the python script uses entirely standard libraries to avoid the gmail API and associated credentials and authentication methods. This is not best practice and not reccomended if this app were handling any sensitive data, or pointed at a personal email account, or were to be used in any sort of production environment or run from an online location.

The following security mitigations are used:

- script uses the imaplib secure connection subclass
  https://docs.python.org/3/library/imaplib.html#imaplib.IMAP4_SSL
- script uses a specific, throwaway gmail account with no personal information of the owners or the users
- script is kept and run locally, using local environment variables only

As it stands, the security of this script is dependent upon the security of the local environment - which if compromised, poses much bigger threats than screwing with a collection of skate spots.

## todo

- test using ssl_context param for IMAP4_SSL call https://docs.python.org/3/library/imaplib.html#imaplib.IMAP4_SSL
- swap tailwind cdn for vite.js + tailwind + postcss to generate production css
- schedule the python script to run or somehow attach listener to email notification
- improve spot-hunting UX generally with better navigation and details and search
- add this location-search API https://www.youtube.com/watch?v=ZXT8i0qR2vE (apparently it can integrate with leaflet)

## possible

- use event driven approach over scheduling via python/powershell/RSS/other
- listen for windows user notification event (gmail itself offers desktop notifications)
- call this python script from powershell and use to drive event api calls
