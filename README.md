# 🤖 RYAN MD - WhatsApp Bot

[![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://whatsapp.com/channel/0029Va90zAnIHphOuO8Msp3A)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

A feature-rich multi-purpose WhatsApp bot with moderation, gaming, media downloading, AI capabilities, and much more!

## ✨ Features

### 🎮 **Games**
- Tic-Tac-Toe (`.ttt`)
- Hangman (`.hangman`)
- Trivia (`.trivia`)

### 🛡️ **Moderation**
- Anti-link protection (`.antilink`)
- Anti-badword filter (`.antibadword`)
- Anti-tag system (`.antitag`)
- Welcome/Goodbye messages (`.welcome`/`.goodbye`)
- Warn system (`.warn`/`.warnings`)
- Mute/Unmute (`.mute`/`.unmute`)
- Ban/Unban (`.ban`/`.unban`)
- Kick members (`.kick`)
- Promote/Demote (`.promote`/`.demote`)

### 📥 **Media Downloaders**
- Instagram Reels/Posts (`.ig`/`.instagram`)
- TikTok videos (`.tiktok`/`.tt`)
- Facebook videos (`.fb`/`.facebook`)
- YouTube audio/video (`.song`/`.video`)
- Spotify tracks (`.spotify`)

### 🎨 **Image/Sticker Tools**
- Image to sticker (`.sticker`/`.s`)
- Sticker crop (`.crop`)
- Remove background (`.removebg`/`.rmbg`)
- Image enhancement (`.remini`/`.enhance`)
- Emoji mix (`.emojimix`/`.emix`)
- Telegram sticker import (`.tg`/`.stickertelegram`)

### 🤖 **AI Features**
- ChatGPT/Gemini integration (`.gpt`/`.gemini`)
- AI Image generation (`.imagine`/`.flux`)
- Group chatbot (`.chatbot`)

### 💬 **Fun Commands**
- Memes (`.meme`)
- Jokes (`.joke`)
- Quotes (`.quote`)
- Facts (`.fact`)
- Ship users (`.ship`)
- Simp card (`.simpcard`)
- Truth or Dare (`.truth`/`.dare`)

### 📊 **Utility**
- Weather info (`.weather`)
- News updates (`.news`)
- Lyrics finder (`.lyrics`)
- Website screenshot (`.ss`/`.screenshot`)
- URL shortener (`.url`/`.tourl`)
- Text translation (`.translate`)

## 📋 **Commands List**

### General Commands
| Command | Description |
|---------|-------------|
| `.help` / `.menu` | Show all commands |
| `.alive` | Check if bot is running |
| `.ping` | Check bot latency |
| `.owner` | Contact bot owner |
| `.git` / `.repo` | Get bot repository |
| `.settings` | View bot settings |

### Admin Commands
| Command | Description |
|---------|-------------|
| `.tagall` | Tag all group members |
| `.hidetag` | Tag everyone invisibly |
| `.tagnotadmin` | Tag non-admin members |
| `.warn @user` | Warn a user |
| `.warnings` | Check user warnings |
| `.mute 5` | Mute for 5 minutes |
| `.unmute` | Unmute group |
| `.ban @user` | Ban user from bot |
| `.unban @user` | Unban user |

### Group Settings
| Command | Description |
|---------|-------------|
| `.antilink on/off` | Block links in group |
| `.antibadword on/off` | Filter bad words |
| `.antitag on/off` | Prevent spam tagging |
| `.welcome on/off` | Welcome new members |
| `.goodbye on/off` | Goodbye leaving members |
| `.setgdesc <text>` | Change group description |
| `.setgname <name>` | Change group name |
| `.setgpp` | Change group photo |

### Media Commands
| Command | Description |
|---------|-------------|
| `.sticker` | Convert image to sticker |
| `.take <pack> <auth>` | Take sticker with author |
| `.emojimix 🐱+🐶` | Mix two emojis |
| `.removebg` | Remove image background |
| `.remini` | Enhance image quality |

## 🚀 **Installation**

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) (v8 or higher)
- WhatsApp account

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ryan-md-bot.git
cd ryan-md-bot
