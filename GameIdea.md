Static HTML and Javascript Game
The game as similar mechanics as Tetris
Pieces fall from top to bottom, stacking
Player can move piece left and right and rotate them and drop them
There are 8 shapes comprised of colored balls
the goal is to create as many matching colors as possible
when at least 3 balls match they pop and disappear allowing for pieces above to drop, matching is either vertical, horizontal or diagonal
once all pieces drop matching colors can pop again
there should be 3 colors to start the game and as levels get harder there are 8
there are also exploding balls when matched they clear an area of 3 balls in every direction of hte exploding balls regardless of color
there are painting balls with either vertical or horizontal or diagonal behavior if 3 are matched in the direction then the entire line is changed to that color
there are also blocking pieces that cannot be matched in later rounds that drop randomly and can only be removed if they hit the bottom of the stack or are exploded
the speed of the game should get faster for each level of each configuration
you get one point per cleared ball up to 10, then for every 5 after the point double, clearing an entire row gets a bonus of 50



coding standards
we want the code to be modular
we want the code to be unit testable
We want function headers
we want comments for all conditional blocks
no single if statements
no complex logic statements or boolean tests break them up
always end lines with a semi colon
no trailing spaces
use tabs vs spaces for indentation
Follow DRY and SOLID principles as much as possible
Lets make configuration read in via a json file

we want documentation for each module


Technical Decisions:

Target browsers/devices - Which browsers should be supported? Mobile-friendly? Only Chromium based browsers
Grid dimensions - How many columns and rows for the game board? 25 rows 15 columns?
Technology stack - Pure vanilla JS or any libraries allowed (e.g., for animations, sound)? we can pull in libraries when needed as long as they are FOSS
Asset requirements - Will you provide graphics/sound effects, or should they be generated programmatically? programmatically, but make them encapsulated so we can replace or change them later
Game Mechanics Details:
5. Piece shapes - What are the 8 specific shapes? (similar to Tetris pieces, or custom?) similar to tetris but instead of squares they shapes are comprised of balls
6. Special ball spawn rates - What percentage chance for exploding/painting balls to appear? lets make them have a 5% chance that one of the special balls appear, make easily configured
7. Blocking pieces - When do they start appearing? How frequently? they should not show before turn 50 on the easier levels getting sooner as the leveles progress
8. Level progression - What triggers a level up? Score threshold? Number of cleared balls? Levels finish when there is any column that gets stacked to the top
9. Speed progression - What's the starting drop speed and increment per level?  lets hold this for now, we may want a mechanism that pushes the bottom of the stack up or have some mechanism to restrict space
10. Color progression - At what levels do colors 4-8 unlock? Lets make it configurable, but start at level 3 then every 4 after that

Game Flow:
11. Win/lose conditions - Game over when pieces reach top? Is there an end goal? Game is over when any column is stacked to the top
12. Pause/restart - Should these features be included? yes
13. High score - Should scores persist (localStorage)? Yes

UI/UX:
14. Display requirements - Show next piece? Level indicator? Score display location? yes show next piece, yes level indicator, two scores should be shown current level and total 
15. Controls - Arrow keys only, or also mouse/touch support? Arrow keys, some choice will be need to chose rotation
16. Visual feedback - Animations for matching/exploding? Sound effects? Yes oh yes



Matching & Clearing Logic:

Cascade matching - After balls drop, do we check for matches repeatedly until no more matches exist (like Puzzle Bobble)? Yes
Diagonal matching - All 4 diagonals, or just 2? (↗↙ vs ↗↘↙↖) all 4
Painting ball activation - If 3 painting balls match in their designated direction, does the entire line become the painting ball's color, or a different color? the painting ball color
Special Balls:
4. Special ball mix - Can a single piece contain multiple special ball types, or max one per piece? Sure why not, we may need to tweak the probability of each type individually
5. Exploding ball radius - "3 balls in every direction" means a 7x7 square around it? yes, but the square must align with the direction of hte matching balls.
6. Blocking piece appearance - Are blocking balls part of falling pieces, or do they drop separately as single balls? they drop as single balls and the user has no control over them. They are teh enemy

Scoring:
7. Point doubling clarification - "every 5 after" means: balls 1-10 = 1pt each, balls 11-15 = 2pts each, balls 16-20 = 4pts each, etc.? correct
8. Combo scoring - Should cascade chains award bonus points? Yes

Controls:
9. Rotation key - Which key(s)? Up arrow? Z/X keys? Space bar? lets start with up arrow
10. Hard drop - Should there be an instant drop key (like down arrow or space)? yes down arrow

Visual/Config:
11. Ball colors - Any preference for the color palette (RGB primaries, pastels, specific hex codes)? again these should be configurable, but let start with rgb primaries and secondaries
12. Piece preview - Show just next piece, or next 2-3 pieces? 1 piece


Perfect! Just a few final details:

Cascade/Combo Mechanics:

Combo multiplier - How much bonus for cascades? (e.g., 2x for first cascade, 3x for second, etc., or fixed bonus per cascade level?) maybe there is a 3 point bonus for the first and doubling for each one after, it will get big on a big cascade. again configurable
Animation timing - Should there be delays between: piece locking → match detection → clearing → balls dropping → next match check? Or instant? I think I want this instantly, but lets leave it configurable
Blocking Balls:
3. Blocking ball frequency - How often do they drop? Every X pieces? Random chance per piece? Randomly with increasing probability with increasing levels. Start with .5%
4. Blocking ball spawn control - Do they appear at random columns or specific patterns? the spawn should always happen at the top of screen in the middle of hte board

Special Ball Details:
5. Exploding ball direction alignment - "Square must align with direction of matching balls" - does this mean if 3 exploding balls match horizontally, only a horizontal 7x1 strip clears (not a 7x7 square)? No still 7x7 but if the match is diagonal then it is 7x7 along the axis of the match
6. Painting ball types - Are there 3 types (horizontal-only, vertical-only, diagonal-only), or one type that paints in whichever direction it matches? good idea

Level Transitions:
7. Level complete behavior - When a column reaches the top, does the level immediately end and clear the board, or is it game over? (You said both "level finishes" and "game over") game is over, but we will need another mechanism to finish a level. Probably time 90 seconds but a configurable number
8. Difficulty levels - Are there preset difficulty levels (easy/medium/hard) that change blocking ball timing, or just progressive difficulty as you advance through numbered levels? good idea, lets do a scale of 1 to 5 for difficulty, increasing teh points per pop, but also increasing the frequency of the enemy pieces

Config Structure:
9. Starting level selection - Should players be able to choose their starting difficulty/level, or always start at level 1? Once a level has been completed successfully (player reaches max time) they can replay to improve their record score for that level. 


Level & Difficulty System:

Level vs Difficulty - Just to confirm: There are 5 difficulty settings (1-5), and within each difficulty there are numbered levels that last 90 seconds each. Is that correct? Correct
Level progression within difficulty - Within a single difficulty setting, do levels keep progressing (Level 1, 2, 3...) until game over, or is there a final level? no final level
Score tracking - Do we track high scores per difficulty level, or per (difficulty + level number) combination? the combination
Exploding Ball Clarification:
4. Diagonal explosion pattern - For a diagonal match creating a 7x7 explosion "along the axis" - should the 7x7 square be rotated 45° to align with the diagonal, or centered on the match but still grid-aligned? rotated 45 degrees.