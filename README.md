# backendTestClient by Vladimir Shein
### Intro
This is my first experience with redis, and probably my first code that is using websockets. UI code was not the target in here, but it was modified, as for me, since I work with AngularJS, jQuery is not good for anything longer than 10-20 lines of code, so please ignore my updated on the client.
### How to
After you cloned this repo, install dependencies in folder with sources via:
```
$ npm install
```
After you are done, in 2 different consoles please one by one, first:
```
$ node server
```
second:
```
$ node server 2021
```
As you mention, running same command second time - we are launching second server of same app.
Then in your browser open: http://localhost:8080/ - first test client.
Then open second client: http://localhost:8080/#2021 - and yes, 2021 in hash is also a port number.
### Redis installation
No redis necessary to be installed on your local machine, I have windows machine, and decided not to waste my time on redis installation under windows. Yes configs like server url and passwords are hardcoded inside the code, what is not very good for open source repositories, please ignore this moment. Redis provider in here is Redis Labs, with 30mb limit for the instance.
### What is not complete?
- Expiry 24h - I used lpush to store messages. Probably you will find out that app sometimes lags - I was just having fun in the midnight, playing with task, and if I will mention and will have time - probably will fix some defects.
- All messages from the channel are send to the client, when client is switching the channel. That's not optimal, on production it will be a reason of a crash, better to send "last ten" messages.
### First Test case to check - synchronizing the messages
1. Open first client http://localhost:8080/
2. Open second client http://localhost:8080/#2021
3. Send message in first client
4. Note that message came only once.
5. Open tab with second client.
6. Mention that message came from first client.
7. Try same steps (3-6) but send message from second client and check first one.
### Second Test case to check 
1. Open first client http://localhost:8080/
2. Open second client http://localhost:8080/#2021
3. Send message in first client
4. Mention that clients are synchronized.
5. Change channel name in second client.
6. Send message in second client.
7. Mention that first client was not updated (as expected)
8. Switch channel in first client to equal second client.
9. Mention that message that we sent in second client now is available in first client.

### How long it took me to prepare this code?
1. 1-2 hrs to configure environment, including remote redis
2. 2-3 hrs to configure single server to synchronize messages between clients.
3. 1-2hrs cost me to understand that we need pub/sub on redis side and to find pub/sub for reddis.
4. 1-2hrs to prepare readme
5. x hrs (not sure if I work right now on fixing the code) - fixes, addind features like expiry date for the messages - not complete