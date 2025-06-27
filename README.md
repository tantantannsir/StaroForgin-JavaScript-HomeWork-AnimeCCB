# Anime Character CCB
## Introduction
This is a JavaScript project that can play a CCB game, which is a well-known game.
And this project of CCB game is also author's JavaScript class's homework. 

In CCB game, there are two player called Alice and Bob.
Alice commit a character which is known by both, but Bob don't know which character Alice commit.
There are k rounds of interaction.In each round, Bob guess a character and tell Alice and Alice will tell Bob the difference between the character she commit and the character Bob guess.
If Bob can guess the correct character in k round, then Bob wins.Otherwise, Alice wins.
The Project will build a server who can plays the role of Alice, and Chanllenger can play the role of Bob.Then chanllenger can play the CCB game.

## Build Server

Before play the game, you should build the server first.

If you don't install npm, please run

```sh
sudo apt install npm
npm install
```

The directory node_modules will include all the dependencies used in this project. If not, you can use ```npm install``` to install.

To build the app, please run   

```shell
npm run build
```

After building the app, to build the server, please run

```shell
server -s build
```

It will return a local URL, which you can open it in your browser to play the game.

If your browser support assigning header "User-Agent", please remove the annotation in ```src/BangumiRequest.js```. Otherwise, please use extension in browser to assign header "User-Agent". In Edge, you can use extension ModHeader.  In Chrome, you can use User-Agent Switcher for Chrome. You can also use developer tools to change headers temporially. You need to change header "User-Agent" into "StaroForgin/my-private-project" to request Bangumi's api.

## How to play

After enter the url, you will find a button with "开始游戏".Click it and the game will be initializing. Wait a few seconds, you can enter the game.

There are 10 times for you to guess. Each time you can write your assumption in the input area and click button with "搜索". It will return you search results, and please click the character you assume. After a few seconds, it will show you related informations in the tablelist.

If you guess the correct answer, it will show a dialog to tell you that you are right. If you don't guess the right answer in 10 rounds, it will also show a dialog to tell you the right answer.

You can also press the button with "投降" to know the right answer. You can also press the button with "重新开始" to have a new game.

All the anime data are obtained from "bangumi"(www.bgm.tv), which is a well known anime website. 

## Other Details

This game is not original, but this project is independently written by author.

If you have any other problems, you can write in  the issues of this project.