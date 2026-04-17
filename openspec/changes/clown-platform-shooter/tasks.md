## 1. Project Scaffold

- [x] 1.1 Create `index.html` with p5.js and p5.sound CDN links, a canvas container, and a `<script src="sketch.js">` tag
- [x] 1.2 Create `sketch.js` with empty `setup()` and `draw()` stubs; verify the canvas opens in the browser without errors

## 2. Platform World

- [x] 2.1 Define a `platforms` array with at least 4 hand-coded platform objects (`{x, y, w, h}`)
- [x] 2.2 Draw all platforms in `draw()` using `rect()`
- [x] 2.3 Implement `applyGravity(entity)` helper that adds a vertical velocity to any entity each frame
- [x] 2.4 Implement `collidePlatforms(entity, platforms)` helper that stops an entity on the top surface of any platform it overlaps

## 3. Player Controls

- [x] 3.1 Define a `player` object with `{x, y, vx, vy, w, h, facingRight}` and place it on the top platform at startup
- [x] 3.2 In `draw()`, handle LEFT/RIGHT (or A/D) keys to set `player.vx`; reset `player.vx` to 0 when no key held
- [x] 3.3 Handle UP/W for jump: apply upward `vy` only when `player.onGround` is true
- [x] 3.4 Update player position each frame, apply gravity and platform collision; set `player.onGround` accordingly
- [x] 3.5 Clamp player to canvas horizontal bounds
- [x] 3.6 Detect player falling below canvas height → set `gameState = "dead"`
- [x] 3.7 Draw the player as a clown head (circle body, triangle hat, red nose dot, ruffled collar arcs)

## 4. Shooting Mechanic

- [x] 4.1 Define a `bullets` array; on SPACE keypress spawn a bullet `{x, y, vx}` at the player's position travelling in `player.facingRight` direction
- [x] 4.2 Each frame move all bullets by their `vx`; remove bullets that leave the canvas
- [x] 4.3 Draw bullets as small bright-coloured circles

## 5. Clown Enemies

- [x] 5.1 Define an `enemies` array with 3–5 clown enemy objects placed on platforms (`{x, y, vx, vy, w, h, platformIndex}`)
- [x] 5.2 Each frame update enemy position: apply horizontal patrol movement, flip direction at platform edges
- [x] 5.3 Apply gravity and platform collision to enemies
- [x] 5.4 Draw each enemy as a clown head (distinct from player — different hat colour, bigger red nose)
- [x] 5.5 Check bullet–enemy AABB collision: remove both bullet and enemy, increment `score`
- [x] 5.6 Display `score` in the top-left corner of the canvas
- [x] 5.7 When `enemies` array is empty, set `gameState = "win"`

## 6. Clown Audio

- [x] 6.1 Add `getAudioContext().resume()` on first keypress to unlock browser audio
- [x] 6.2 Implement `playShootSound()` — short irritating high-pitched oscillator beep using `p5.Oscillator` + `p5.Env`
- [ ] 6.3 Implement `playCreepyLaugh()` — descending frequency glide (e.g., 600 Hz → 100 Hz over 0.5 s) triggered on enemy kill
- [ ] 6.4 Implement `playJumpSound()` — short ascending tone on player jump
- [ ] 6.5 Wire up all three sounds to their respective game events (shoot, enemy kill, jump)

## 7. Game States

- [ ] 7.1 Show "GAME OVER 🤡 Press R to restart" overlay when `gameState === "dead"`
- [ ] 7.2 Show "YOU WIN 🎉 Press R to restart" overlay when `gameState === "win"`
- [ ] 7.3 Handle R keypress to reset all game state and restart
