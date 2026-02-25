LMS Landing — Local development
================================

Quick start (local, same machine)
--------------------------------
1. Install dependencies

```bash
cd lms-landing
npm install
```

2. Start the dev server (default)

```bash
npm run dev
```

Open http://localhost:5173/ (Vite will print the actual port in the terminal — use that URL).

Run on a fixed port or expose to the network
------------------------------------------
- Start on a specific port (e.g. 5180):

```bash
npm run dev -- --port 5180
```

- Start and expose to other devices on the same network:

```bash
npm run dev -- --host --port 5180
```

Find your machine IP (so other devices can reach the server)
-----------------------------------------------------------
- Windows (PowerShell / CMD):

```powershell
ipconfig
# Look for "IPv4 Address" under your active Wi-Fi / Ethernet adapter
```

- macOS / Linux:

```bash
ip addr show    # or: ifconfig
# Look for the inet address of the active network interface
```

From another device open:

```
http://<YOUR_IP>:5180
```

Notes and troubleshooting
-------------------------
- If the page can't be reached from another device, check your OS firewall and ensure the chosen port (5180) is allowed.
- If Vite auto-selects a port (5173,5174,...), use the URL printed in the terminal.
- If the page loads but is blank, open browser DevTools Console and share errors.
- Stop the dev server with `Ctrl+C` in the terminal.

Building and previewing production build
---------------------------------------
```bash
npm run build
npm run preview -- --port 5173
```

If you want, I can add a small script to `package.json` that starts the server on a fixed port and host.
