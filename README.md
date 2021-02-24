![ScoreBox Logo](assets/scorebox_logo_md.png)
# ScoreBox Cross Country
Timing and broadcast overlay system for cross country events.

## Features
- Realtime Race Results Overlay
- OBS & Blackmagic ATEM Support (via a Luma Key)
- Mobile Timekeepers
- Export Race Results as a CSV
- Customizable Lower Third

## Use
1. Create a Race Data file by copying this [Google Sheet](https://docs.google.com/spreadsheets/d/1C6x9cADfSGFHTGfQ7JvTCFFad6zSIMX4iBdlCTSsPPY/copy)
2. Launch the application, it may take a moment to load
3. Load the Race Data file on the setup page
4. The application will automatically run the overlay fullscreen on a second monitor, if available.  To reposition the overlay, select it, hit <kbd>Alt</kbd> + <kbd>Enter</kbd> to toggle into windowed mode, and reposition it on the desired screen.
5. Timekeepers can connect to `/timekeeper` on port 5000 of the computer running the launcher
    - A service like [ngrok](https://ngrok.com) is a great way to expand beyond a LAN
6. `/` or `/splits` on port 5000 of the computer running the launcher serves a real-time display of race splits

## Requirements
- 2+ Monitors (1 for the control dashboard, 1 for the overlay)
- Windows 10