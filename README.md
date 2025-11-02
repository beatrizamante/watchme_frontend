# Watch me

### About

This application has as an objective to search for human body hashes through re-Id in video captures and return their label.

For now, an user will have to upload a video and the application will search a given person's body hash through the frames,
given that the body hash has been saved in the database.

## Features

Currently, the app will have the following features implemented:

- **User Management**
  - **Admin routes**
    - Create a user (`POST /users`)
    - Find a user (`GET /users/:userId`)
    - Find all users (`GET /users`)
    - Delete a user (`GET /users`)
    - Create a person's hash (`POST /people`)
    - Delete a hash (`DELETE /people/:personId`)

  - **User routes**
    - List all users hashes (`GET /people`)
    - Find a hash (`GET /people/:personId`)
    - Upload video (`POST /videos`)
    - Find your videos (`GET /videos`)
    - Find a video (`GET /videos/:videoId`)
    - Delete you video (`DELETE /videos/:videoId/delete`)
    - Find people on video (`GET /people/:videoId/find`)
    - Register a user (`POST /register`)
    - Edit profile (`POST /profile`)
    - Login a user (`POST /login`)
    - Logout a user (`POST /logout`)


## Development Checklist

- [X] Login session
- [X] Admin area for managing users
- [X] Admin area for uploading and deleting a person's body hash
- [X] User area for managing videos
- [X] User area for finding a person through a video
- [ ] User profile

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

## Testing

Run the tests:

```sh
npm test
```

### Sprint Run

 > **How pointscale work**
 >
 > Once a task is set, the developer can pontuate it by the following rules:
 >  - 1 point: Completed in 4 hours;
 >  - 2 points: Completed in 8 hours;
 >  - 3 points: Completed in 16 hours;
 >  - 4 points: Completed in half a week;
 >  - 6 points: Completed in a whole week.


## 1. Task 1:
- [X]  Setup the project environment :: 1 point

## 2. Task 2:
- [X] Create navbar and footer main components :: 1 point
- [X] Create buttons and color/stylesheet :: 1 points
- [X] Create cards and side navbar :: 2 points

## Task 3:
- [X] Create layout and login page :: 1 points
- [X] Create user and admin main pages :: 2 points

## Task 4:
- [X] Create CRUD forms for user and person managing :: 2 points
- [X] Create listing pages for videos, users and people :: 3 points
- [X] Create contexts :: 2 points

## Task 5:
- [ ] Connect with backend Api :: 2 points
- [ ] Create targeting screen draw to user found person on the video with label :: 3 points

#Updates Since Last Checkpoint
##Resources applied from PDM modules:

- Used nativewind to stylize the screens and components;
- Used zustand stores for context saving of Authentication and Selections through screens;
- Implemented expo-router to nativate between different screens based on type of user role;

##Good practice on reusable components used
- Created reusable components for: Buttons, Cards, Inputs, Lists, Modals, Footers, and Navbar;
- Applied the same components between screens, keeping the  design UX standard;
- Implemented component composition for navbar and lists, making a tree of children and custom props;
