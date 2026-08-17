# Login/MFA UI Flow

## Technologies used

- React + TypeScript + Vite
- Zustand (State management)
- Jest (Testing)
- React Router DOM (Client-side routing and protected routes)
- React Testing Library (User-focused component and flow testing)

## Setup/install instructions

Use Node.js 22 or newer with npm.

To install, please start by cloning this git repository.

Run `npm install` in the root directory to install all dependencies for the project.

## Local run instructions

To run the project, enter `npm run dev` in the root directory after installing. Then open [http://localhost:5173/](http://localhost:5173/) in a browser to view the UI.

## Mock user credentials/roles

```js
[
  {
    id: 'user-read-only',
    email: 'viewer@example.com',
    password: 'Viewer123!',
    mfaCode: '123456',
    name: 'Read Only User',
    role: 'read-only',
  },
  {
    id: 'user-read-write',
    email: 'editor@example.com',
    password: 'Editor123!',
    mfaCode: '654321',
    name: 'Read Write User',
    role: 'read-write',
  },
]
```

## How to test the login/MFA flow

Please use the test credentials from above to test the login/MFA flow. The core authentication flow consists of three screens:

1. Login screen (user not signed in, please enter an email/password combo)
2. MFA screen (user has used email/password credentials and now needs to enter the mock OTP)
3. Dashboard (user has successfully entered credentials and mock OTP code)

After authenticating and entering the mock OTP, you will see two text boxes at the bottom of the dashboard under account notes titled 'Profile description' and 'Access description'. Depending on the role of your authenticated account there will be two scenarios:

1. User with 'read-only' permissions - Unable to edit the text in any fashion.
2. User with 'read-write' permissions - Able to freely edit both descriptions in any way they'd like.

From the dashboard you are also able to click the sign out button, which clears the client authentication state and returns you to the login page.

The Sign Up link opens a separate mock registration screen. On submission, the mock API rejects either supplied mock-account email as already registered. Other valid submissions demonstrate the success UI, but do not create or persist a new account.


## Key design decisions and assumptions

- Authentication is represented by three explicit steps: `PASSWORD_INPUT`, `OTP_INPUT`, and `COMPLETE`.
- A Zustand store owns the current public user, authentication step, pre-authentication token, and pending email. Request loading and error feedback remain local to the screen that initiated the request.
- The mock API keeps credential records and pending authentication data outside the Zustand store. A single-use pre-authentication token links successful password verification to OTP verification without exposing a pending user or credentials to client state.
- The mock authentication API returns asynchronous, typed results to approximate a backend boundary without requiring a server.
- Protected routes redirect signed-out users to Login and partially authenticated users to the MFA screen.
- Authorization is based on the authenticated user's role. Read-only users can view protected content, while read/write users can edit the Dashboard descriptions.
- Shared form, button, card, error, and global-style modules keep repeated UI behavior consistent across screens.
- Authentication and authorization in this project are demonstrations only; real applications must enforce both on a trusted backend.


## Known limitations

- Although you are able to edit the text boxes on the dashboard, any changes you make will not stick between login sessions.
- You are unable to create new accounts as they would not persist due to the absence of a backend server.
- Authentication and MFA challenges are stored in memory, so refreshing the browser resets the active session.
- MFA codes are predefined mock values and are not delivered by email or an authenticator application.
- Client-side route protection and roles are not a substitute for server-side authorization.


## Automated tests

Run `npm test` to execute the Jest test suite once, or `npm run test:watch` while developing.

The tests cover form validation, mock authentication responses, MFA verification, duplicate-email Sign Up handling, Zustand state transitions, protected routing, Sign Up navigation, and read-only/read-write behavior.

Run `npm run lint` to check code quality and `npm run build` to run TypeScript validation and create a production build.
