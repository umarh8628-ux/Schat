# MERN Chat App

A real-time chat application built with MongoDB, Express, React (or vanilla JS), Node.js, and WebSocket support.

## Features

✅ **Real-time Messaging** - WebSocket-based instant messaging  
✅ **Multi-user Support** - Multiple users can chat simultaneously  
✅ **Typing Indicators** - See when others are typing  
✅ **User List** - See who's online  
✅ **Responsive Design** - Works on desktop and mobile  
✅ **Render Free Tier Compatible** - Easy deployment  

## Project Structure

```
mern-chat-app/
├── package.json          # Dependencies (ROOT - IMPORTANT!)
├── server.js             # Express + WebSocket server
├── index.html            # Main HTML file
├── Procfile              # Render deployment config
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore file
├── README.md             # This file
├── js/
│   └── app.js            # Client-side chat logic
├── css/
│   └── style.css         # Chat UI styles
└── assets/               # Future: images, media files
```

## Installation

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mern-chat-app.git
   cd mern-chat-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** (optional)
   ```bash
   cp .env.example .env
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## Deployment to Render

### 1. Prepare Your Repository

Ensure your GitHub repository has this structure:
```
your-repo/
├── package.json       ← At ROOT level!
├── server.js
├── index.html
├── Procfile
├── js/
├── css/
└── assets/
```

### 2. Push to GitHub

```bash
git add .
git commit -m "Initial commit - MERN chat app"
git push origin main
```

### 3. Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: mern-chat-app
   - **Root Directory**: `.` (or leave empty)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. Click "Create Web Service"
6. Wait for deployment to complete

### 4. Access Your App

Once deployed, Render will provide a URL like:
```
https://your-app-name.onrender.com
```

## Usage

1. **Enter a username** and click "Connect"
2. **See connected users** in the sidebar
3. **Type your message** and press Enter to send
4. **Watch for typing indicators** when others are typing
5. **View real-time user count** in the header

## API Events

### WebSocket Events

#### Client → Server

- `join` - User joins chat
- `message` - Send a chat message
- `typing` - User is typing

#### Server → Client

- `message` - Receive chat messages
- `userList` - Get list of online users
- `typing` - Typing indicator

## Environment Variables

Create a `.env` file with:

```
NODE_ENV=development
PORT=3000
```

For Render, set these in the Service Settings:
- Go to Settings → Environment
- Add `NODE_ENV=production`

## Technologies Used

- **Backend**: Express.js, Node.js
- **Real-time**: WebSocket (ws library)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Deployment**: Render
- **Version Control**: Git & GitHub

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Future Enhancements

- [ ] MongoDB integration for message persistence
- [ ] User authentication (JWT)
- [ ] Direct messaging (private chats)
- [ ] File/image sharing
- [ ] Message reactions
- [ ] Voice/video calling
- [ ] Room creation
- [ ] User profiles

## Troubleshooting

### Connection Issues
- Check that WebSocket is not blocked by firewall
- Verify Render service is running (check logs)
- Try incognito mode

### Messages Not Sending
- Ensure you've entered a username
- Check browser console (F12) for errors
- Verify connection status shows "Connected ✓"

### Deployment Failed on Render
- Verify `package.json` is at repository root
- Check Root Directory is set to `.`
- View logs in Render dashboard for details

## License

ISC

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For issues or questions:
1. Check the browser console for errors
2. Review Render logs for server errors
3. Ensure all files are in correct locations
