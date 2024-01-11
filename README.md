# Fluent-Youtube-Downloader

The most efficient open-source Youtube video converter.

_Currently on version ``0.4.1``_.

![Fluent Youtube Downloader - Light Themed](https://cdn.discordapp.com/attachments/1133720864488165416/1189200903023112343/image.png?ex=659d4ca5&is=658ad7a5&hm=e0a668bb826bcb672c93165e9233eb1f24f355ee59f3eeb3c5c3cd1e1aeb5d19&)
![Fluent Youtube Downloader - Dark Themed](https://cdn.discordapp.com/attachments/1133720864488165416/1189200977807556678/image.png?ex=659d4cb7&is=658ad7b7&hm=a900aec6933b717e85190a79d2b047f3176bc11802f35d955d20a7b8fc8525c0&)

- - -

## 🚀 About

### Motiviation

Fluent YouTube Downloader is an open-source Windows application that utilizes the FluentUI design language. Its primary function is to convert YouTube videos into media files.

The main objective of this application is to empower users to convert media files seamlessly without being interrupted by online advertisements.

Users should be able to convert YouTube videos into any audio/video format they wish, without being interrupted by advertisements or any online limitations. They should also have full control over what they would like to download on their computer.

Actively running web applications require users to have a paid subscription to use their services. That should not be a thing.

### Stage

This software is currently in it's development phase and does not fully work.

### Features

- Easy to install using the Electron application installer.
- Fluent Youtube Downloader is lightweight and does not use any heavy front-end frameworks.
- Able to convert any video you like on Youtube.
- You can convert media files to something else!
- Using the Fluent design language.
- Custom theming.

## 🚀 Pre-released software

There are several pre-released versions of this software available to use. You can find them in the 'releases' page of this repository.

Keep in mind that many features won't work because they are simply still in development. new updates are released over time.

## 🚀 Development environment

### Install required packages

In order to setup the local environment, you have to install all required packages.

```
$ npm install
```

### Start in dev mode

To start the application in development mode, you can run the following commands in the terminal.

```
# Will first build the source code, and then run the application in development mode.
$ npm run auto-build
```

```
# Will start watching on SCSS files, and build them on change.
$ npm run watch-scss
```

```
# Will start watching on client TypeScript files, and compile them on change.
$ npm run webpack
```

## 🚀 Used resources

Various third-party tools have been used to complete the development of Fluent Youtube Downloader. These third-party tools are open-source and free to use as long as I don't make any profit from Fluent Youtube Downloader.

### Tools used

- Windows Fluent icons: [https://icons8.com/](https://icons8.com/)
- NodeJS backend server: [https://expressjs.com/](https://expressjs.com/) 
- Electron application development: [https://www.electronjs.org/](https://www.electronjs.org/)
- Third-party Youtube api (ytdl-core): [https://github.com/fent/node-ytdl-core](https://github.com/fent/node-ytdl-core)
- Wrapper of the ytdl-core api (yt-dlp): [https://github.com/yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp)
- Audio and video processing: [https://ffmpeg.org/](https://ffmpeg.org/)
- Better version of CSS: [https://sass-lang.com/](https://sass-lang.com/)
- Sending sockets to the client and server: [https://socket.io/](https://socket.io/)

### Custom Fluent design language

Because I had a lot of difficulty implementing Microsoft's own Fluent design language, I created a simple framework myself to imitate the existing framework.

This selfmade framework is inspired by Microsoft's FluentUI framework. You can take a look at their [FluentUI design language documentation](https://developer.microsoft.com/en-us/fluentui).

## ?? Disclaimers

The developer(s) is(are) not responsible for the things the user does. This software is only intended to make downloading YouTube videos easier, and uses open-source third-party software to perform the conversion.
