const express = require('express');
const bodyParser = require('body-parser');
const { like } = require('sequelize/lib/operators');
const db = require('./models');

const app = express();

app.use(bodyParser.json());
app.use(express.static(`${__dirname}/static`));

const populateGames = async (url, platform) => {
  const response = await fetch(url);
  const data = await response.json();
  const games = data.flat().map((game) => ({
    publisherId: game.publisher_id,
    name: game.name,
    platform,
    storeId: game.id,
    bundleId: game.bundle_id,
    appVersion: game.version,
    isPublished: true,
  }));
  return db.Game.bulkCreate(games);
};

app.get('/api/games/populate', async (req, res) => {
  const androidJSONUrl = 'https://interview-marketing-eng-dev.s3.eu-west-1.amazonaws.com/android.top100.json';
  const iosJSONUrl = 'https://interview-marketing-eng-dev.s3.eu-west-1.amazonaws.com/ios.top100.json';

  Promise.all([
    populateGames(androidJSONUrl, 'android'),
    populateGames(iosJSONUrl, 'ios'),
  ])
    .then((result) => res.send(result.flat()))
    .catch((err) => {
      console.log('***Error populating games', JSON.stringify(err));
      res.status(400).send(err);
    });
});

app.get('/api/games', (req, res) => db.Game.findAll()
  .then((games) => res.send(games))
  .catch((err) => {
    console.log('There was an error querying games', JSON.stringify(err));
    return res.send(err);
  }));

app.post('/api/games', (req, res) => {
  const { publisherId, name, platform, storeId, bundleId, appVersion, isPublished } = req.body;
  return db.Game.create({ publisherId, name, platform, storeId, bundleId, appVersion, isPublished })
    .then((game) => res.send(game))
    .catch((err) => {
      console.log('***There was an error creating a game', JSON.stringify(err));
      return res.status(400).send(err);
    });
});

app.delete('/api/games/:id', (req, res) => {
  // eslint-disable-next-line radix
  const id = parseInt(req.params.id);
  return db.Game.findByPk(id)
    .then((game) => game.destroy({ force: true }))
    .then(() => res.send({ id }))
    .catch((err) => {
      console.log('***Error deleting game', JSON.stringify(err));
      res.status(400).send(err);
    });
});

app.put('/api/games/:id', (req, res) => {
  // eslint-disable-next-line radix
  const id = parseInt(req.params.id);
  return db.Game.findByPk(id)
    .then((game) => {
      const { publisherId, name, platform, storeId, bundleId, appVersion, isPublished } = req.body;
      return game.update({ publisherId, name, platform, storeId, bundleId, appVersion, isPublished })
        .then(() => res.send(game))
        .catch((err) => {
          console.log('***Error updating game', JSON.stringify(err));
          res.status(400).send(err);
        });
    });
});

app.post('/api/games/search', (req, res) => {
  const { name, platform } = req.body;
  const query = {
    where: {},
  };

  if (name && name !== '') {
    query.where.name = { [like]: `${name}&` };
  }
  if (platform && platform !== '') {
    query.where.platform = platform;
  }

  return db.Game.findAll(query)
    .then((games) => res.send(games))
    .catch((err) => {
      console.log('***Error searching games', JSON.stringify(err));
      res.status(400).send(err);
    });
});

app.listen(3000, () => {
  console.log('Server is up on port 3000');
});

module.exports = app;
