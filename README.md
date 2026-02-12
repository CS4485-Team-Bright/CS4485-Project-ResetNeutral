# CS4485-Project-EasyCombo


# Roles:
## Backend
### Database & Auth Lead (Firebase):
Responsible for Firebase Firestore schema, Authentication (Google/Discord login), and Security Rules. They handle how combos are stored, liked, and retrieved.

### Data Architect / API Lead:
Research and implement the Data (frame, damage, etc.) for different games (e.g., scraping SuperCombo Wiki or using a custom JSON parser). Ensure that is broadly applicable and scalable.

## Frontend
### Combo Logic & Visualization:
Focuses on the visual timeline (input display, hitstun bars?) and logic (calculating total damage, scaling, and validating if a combo is actually "true" based on frame data).

### Input Game-Loop Integration:
Manages the Gamepad API and requestAnimationFrame. React is "declarative" (it waits for state changes), but input is "imperative" (it happens 60 times a second). This person builds a bridge so that pressing "Down-Forward + Punch" on a controller actually triggers the "Hadouken" logic in your app.


### Global UI/UX Development:
General UI/UX design (responsive design, dark mode, and "Game-Agnostic" styling that shifts based on the selected game). Perhaps also Discovery Feed (search, filtering by character/game) but may split up amongst other frontend developers.

### Input State Machine Lead:
Implements the Input Buffer (Fighting games don't just check what you're pressing now; they check what you pressed over the last 10–15 frames). Distinguishes between a "Forward" tilt and a "Quarter Circle Forward" motion. Build the logic that "reads" the raw input and converts it into a "Move Name."
