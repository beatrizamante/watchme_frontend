# Watch me

### About

This application has as an objective to search for human body hashes through re-Id in video captures and return their label.

## Features

Currently, the app will have the following features implemented:

- **User Management**
  - **Admin routes**
    - Create a user (`POST /user`)
    - Find a user (`GET /user?id=:userId`)
    - Find all users (`GET /users?active=:boolean (optional)`)
    - Delete a hash (`DELETE /person?id=:personId`)

  - **User routes**
    - List all users hashes (`GET /people`)
    - Find a hash (`GET /person?id=:personId`)
    - Find people on video (`GET /person/find?id=:personId&videoId=:videoId`)
    - Create a person's hash (`POST /person`)
    - Upload video (`POST /video`)
    - Find your videos (`GET /videos`)
    - Find a video (`GET /videos?id=:videoId`)
    - Delete you video (`DELETE /video?id=:videoId`)
    - Register a user (`POST /register`)
    - Edit profile (`PATCH /user?id=:userId`)
    - Delete profile picture (`DELETE /user/picture?id=:userId`)
    - Login a user (`POST /login`)
    - Logout a user (`POST /logout`)


## Db Diagram

[Click here to check the database diagram](https://dbdiagram.io/d/Watch_me-67f409154f7afba184a9d40e)

## Figma Prototype

[Click here to check the figma screen prototype](https://www.figma.com/design/pQCtP3qGJfhZh2EJbtzGmv/Watch-me?node-id=0-1&p=f&t=MiokvOPfrbSa1Rzt-0)

## Setup

To setup the project, first install the dependencies:
```sh
npm install
```

Then run the web app:
```sh
npm run start
```
