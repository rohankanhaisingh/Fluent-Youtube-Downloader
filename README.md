# Fluent-Youtube-Downloader

Fluent YouTube Downloader is an open-source Windows application that utilizes the FluentUI design language. Its primary function is to convert YouTube videos into media files.

The main objective of this application is to empower users to convert media files seamlessly without being interrupted by online advertisements.

- - -

## About

### Motiviation

Users should be able to convert YouTube videos into any audio/video format they wish, without being interrupted by advertisements or any online limitations. They should also have full control over what they would like to download on their computer.

Actively running web applications require users to have a paid subscription to use their services. That should not be a thing.

### Stage

This software is currently in it's development phase and does not fully work.

## Development environment

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