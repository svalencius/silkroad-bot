# Introduction
This was my project written some years ago. Main idea was to write silkroad client in Javascript which is able to bypass security, login and spawn character into game world and repeatedly send ping packet to game server to keep alive connection. Later I got great idea to open listening port and accept connections from original game client and forward it to orginal game server making this bot work as a proxy server.
Since Silkroad Online started to lose its popularity and I got no interest into it anymore I decided to share this project to somebody who's still interested.

### Bot client
I used Security API algorithm written by PushEDX and rewrited it in Javascript. I worked with vSRO version but this project can be reconfigured to work with other versions of SRO.

### Bot server
The greatest idea of this project is the server who's accepts connections from original game client and forwards packets to original game server. [Original game client -> Bot server] and [Bot client -> Original game server] have seperate encryptions so it means that all packets going trough are decoded and can be manipulated.
Bot server accepts multiple connections as well so you can run multiple original game clients and get same view in each of them. I did that because I had further vision to build different account types allowing users to let use their game characters to another users keeping game account passwords secret.

As well you can original game client anytime you can. Bot keeps all required packets in memory and serves them to orginal game client when it starts connection.
This functionality is still crashing near crowd of people (towns, pvp arenas, etc) due to lack of fully reversed packet structures.

### About gateway and agent servers
Basic principle of original game client is that first it connect to gateway server to deal with the login and get IP of agent server. Later shuts gateway connection down and connects to agent server with temporary ID the gateway server gave.
I discovered that original game client can actually be launched without any crash by serving directly agent server type. So if the bot client is already connected to original game server, we can serve agent server data without any login communication. Looks really nice when launching game client :)

