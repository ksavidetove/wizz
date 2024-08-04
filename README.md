# Project Setup
You will need to have Node.js, NPM, and git installed locally.
  
* In a terminal, run `npm install` from the project root to initialize your dependencies.

* Run the migrations with `npx sequelize db:migrate` in order to add the new indexes.

* Finally, to start the application, navigate to the project root in a terminal window and execute `npm start`

You should now be able to navigate to http://localhost:3000 and view the UI.

You should also be able to communicate with the API at http://localhost:3000/api/games

If you get an error like this when trying to build the project: `ERROR: Please install sqlite3 package manually` you should run `npm rebuild` from the project root.

# Practical Assignments
Pretend for a moment that you have been hired to work at Voodoo.  You have grabbed your first tickets to work on an internal game database application. 

#### FEATURE A: Add Search to Game Database
The main users of the Game Database have requested that we add a search feature that will allow them to search by name and/or by platform.  The front end team has already created UI for these features and all that remains is for the API to implement the expected interface.  The new UI can be seen at `/search.html`

The new UI sends 2 parameters via POST to a non-existent path on the API, `/api/games/search`

The parameters that are sent are `name` and `platform` and the expected behavior is to return results that match the platform and match or partially match the name string.  If no search has been specified, then the results should include everything (just like it does now).

Once the new API method is in place, we can move `search.html` to `index.html` and remove `search.html` from the repo.

#### FEATURE B: Populate your database with the top 100 apps
Add a populate button that calls a new route `/api/games/populate`. This route should populate your database with the top 100 games in the App Store and Google Play Store.
To do this, our data team have put in place 2 files at your disposal in an S3 bucket in JSON format:

- https://interview-marketing-eng-dev.s3.eu-west-1.amazonaws.com/android.top100.json
- https://interview-marketing-eng-dev.s3.eu-west-1.amazonaws.com/ios.top100.json

# Theory Assignments
You should complete these only after you have completed the practical assignments.

The business goal of the game database is to provide an internal service to get data for all apps from all app stores.  
Many other applications at Voodoo will use consume this API.

#### Question 1:
We are planning to put this project in production. According to you, what are the missing pieces to make this project production ready? 
Please elaborate an action plan.

##### Answer 1:
Here are the different topics that need to be addressed in order to make this project production ready:
  - The project need a proper environment managing system as dotenv in order to define environment-specific configurations
  - At the moment, reading the `./config/config.json` file, we can see that the production and the development databases are the same
  - We need to implement a robust logging system like Bunyan for better error tracking and debugging.
  - Error responses need to be more specific (404 when updating an undefined game, 500 when the database is not responsive)
  - A system of input validation has to be implemented
  - Some caching may be added in order to improve scalability and avoid unnecessary calls to the database
  - Add CI/CD pipeline with tools like Jenkins, AWS CodeBuild/CodePipeline or GCP Cloud Build / Deploy
  - Add some unit testing for critical code branches 

#### Question 2:
Let's pretend our data team is now delivering new files every day into the S3 bucket, and our service needs to ingest those files
every day through the populate API. Could you describe a suitable solution to automate this? Feel free to propose architectural changes.

#### Answer 2:
Since the question is mentionning S3 Buckets, I will develop an answer based on AWS only.

- Whenever a new file is available, we can leverage S3 Event Notifications in order to trigger a new file ingestion by the system.
- The Notification send a message (filename, date, path) to an Amazon SQS queue
- We can then create a Lambda Function triggered by new messages in the SQS => This lambda would call our `/api/games/populate` endpoint with the downloaded file from S3
- In order to have a more robust API, we should implement database transactions. If a file ingestion fails, the current transaction would be aborded and we could then store the file for inspection (in case of bad formating for exemple), and for a later retry.


