const Game = require('../../model/Game');
const User = require('../../model/User');
const { v4: uuidv4 } = require('uuid');

/**
 * @controller : GameController
 * @name : CreteGame
 * @description : This method will create new Game
 * @file : gameController.js
 */
const createGame = async (data) => {
  console.log('data: ', data);
  try {
    console.log('create Game called...');
    // retrive data from the DATA
    const { name, id, email, capacity } = data;

    // color code array
    const colorArr = ['#C3CDE6', '#EEE8AA', '#FF6F61', '#FFDAB9', '#40E0D0'];

    // unique Room ID as a room code
    const code = uuidv4();

    if (!name) {
      return {
        hasError: true,
        error: 'name or code not found',
      };
    }

    // get the user's active Game based on the userID
    const findUserinGame = await User.findOne({ _id: id }).populate('games');

    // filter all the games to find the active game
    const filterdData = findUserinGame.games.filter(
      (d) => d.isComplete === false && d.isStart === true
    );

    // return the Error
    if (filterdData.length > 0) {
      return {
        hasError: true,
        message: 'You are in another game',
      };
    }

    // create newArr for Bingo Board
    let array = new Array(25);

    // Fill the array with numbers from 1 to 25
    for (let i = 0; i < array.length; i++) {
      array[i] = i + 1;
    }

    // Shuffle the array using Fisher-Yates shuffle algorithm
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    // create a Game Obj
    const gameObj = new Game({
      players: [
        { player: findUserinGame.id, color: colorArr[0], bingoBoard: array },
      ],
      admin: findUserinGame.id,
      steps: [],
      code: code,
      capacity: capacity,
    });

    // save game Object
    const createGame = await gameObj.save();

    // get the game data with populate players
    const findGame = await Game.findOne({ _id: createGame.id }).populate(
      'players.player'
    );

    // return the error
    if (!createGame) {
      return {
        hasError: true,
        error: 'game not created',
      };
    } else {
      return {
        hasError: false,
        message: 'Game created',
        error: '',
        data: {
          game: findGame,
        },
      };
    }
  } catch (error) {
    console.log('error: ', error);
    return {
      hasError: true,
      message: 'Something went wrong',
    };
  }
};

/**
 * @controller : GameController
 * @name : JoinGame
 * @description : This method will join the user in perticular game
 * @file : gameController.js
 */
const JoinGame = async (data) => {
  try {
    console.log('JoinGame called....');

    // get data from the DATA
    const { roomId, id } = data;

    // color Arr
    const colorArr = ['#C3CDE6', '#EEE8AA', '#FF6F61', '#FFDAB9', '#40E0D0'];

    // return Err
    if (!roomId || !id) {
      return {
        hasError: true,
        error: 'Insufficient Data',
      };
    }

    // find the user with all games
    const findUserinGame = await User.findOne({ _id: id }).populate('games');

    // filter the game to find the active games
    const filterdData = findUserinGame?.games?.filter(
      (d) => d.isComplete === false || d.isStart === true
    );

    // return the Err
    if (filterdData.length > 0) {
      return {
        hasError: true,
        message: 'You are in another game',
      };
    }

    // find teh game with all players
    const findGame = await Game.findOne({ code: roomId }).populate(
      'players.player'
    );

    // total player count
    const playersCount = await findGame.players.length;

    // check user already in game or not
    const findUser = await findGame.players.filter(
      (a) => a.player.id.toString() === id
    );

    //return the err
    if (findUser.length > 0) {
      return {
        hasError: false,
        error: 'You are already in Game',
        data: {
          game: findGame,
        },
      };
    }

    // create newArr for Bingo Board
    let array = new Array(25);

    // Fill the array with numbers from 1 to 25
    for (let i = 0; i < array.length; i++) {
      array[i] = i + 1;
    }

    // Shuffle the array using Fisher-Yates shuffle algorithm
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    //add user in the game
    const addInGame = await Game.findOneAndUpdate(
      { code: roomId, isStart: false, isComplete: false },
      {
        $push: {
          players: {
            player: id,
            color: colorArr[playersCount],
            bingoBoard: array,
          },
        },
      },
      {
        new: true,
      }
    ).populate('players.player');

    if (addInGame.acknowledged === false) {
      return {
        hasError: true,
        error: 'User not Added in Game!',
      };
    } else {
      return {
        hasError: false,
        message: 'userAdded In game',
        data: {
          game: addInGame,
        },
      };
    }
  } catch (error) {
    console.log('error: ', error);
    return {
      hasError: true,
      message: 'Something went wrong',
    };
  }
};

/**
 * @controller : GameController
 * @name : startMatch
 * @description : This method will join the user in perticular game
 * @file : gameController.js
 */
const startMatch = async (data) => {
  console.log('data: ', data);
  try {
    console.log('startMatch called...');

    // get the data
    const { code } = data;
    if (!data) {
      return {
        hasError: true,
      };
    }

    // update the game
    const findGame = await Game.updateOne({ code: code }, { isStart: true });

    // get the game with all player
    const getPlayers = await Game.findOne({ code: code }).populate(
      'players.player'
    );

    // firstplayer
    const firstplayer = getPlayers.players[0];

    // return the success response
    return {
      hasError: false,
      data: {
        game: getPlayers,
        firstplayer: firstplayer,
      },
    };
  } catch (error) {
    console.log('error: ', error);
    return {
      hasError: true,
      error: 'Somthing went wrong',
    };
  }
};

/**
 * @controller : GameController
 * @name : userMove
 * @description : This method will join the user in perticular game
 * @file : gameController.js
 */
const userMove = async (data) => {
  console.log('data: ', data);
  try {
    console.log('userMove called in controller....');

    const { num, id, code } = data;
    if (!num || !id || !code) {
      return {
        hasError: true,
        error: 'Insufficient Data',
      };
    }

    const getGame = await Game.findOne({ code: code }).populate(
      'players.player'
    );

    let totalPlayer = getGame.players.length;
    console.log('totalPlayer: ', totalPlayer);
    // current user data
    let userData = getGame.players.filter((a) => a.player.id === id);

    // player index
    let userIndex = getGame.players.findIndex((a) => a.player.id === id);
    console.log('userIndex: ', userIndex);

    // create a step Object
    const stepObj = {
      id: id,
      num: num,
      color: userData[0].color,
    };

    // push the steps in game Object
    let updateGame = await Game.findOneAndUpdate(
      { code: code },
      {
        $push: { steps: stepObj },
      },
      {
        new: true,
      }
    ).populate('players.player');

    if (!updateGame) {
      return {
        hasError: true,
        error: 'Step not Considered!',
      };
    }

    let nextPlayer;
    if (userIndex + 1 < totalPlayer) {
      nextPlayer = getGame.players[userIndex + 1].player;
    } else {
      nextPlayer = getGame.players[0].player;
    }

    return {
      hasError: false,
      message: `${userData[0].player.name} select ${num}`,
      data: {
        game: updateGame,
        nextPlayerTurn: nextPlayer,
      },
    };
  } catch (error) {
    console.log('error: ', error);
    return {
      hasError: true,
      error: 'Somthing went wrong',
    };
  }
};

const winner = async (data) => {
  try {
    console.log('winner called ....');

    const { id, code } = data;

    const updateGame = await Game.updateOne(
      { code: code },
      { isStart: false, isComplete: true }
    );

    if (updateGame.acknowledged === false) {
      return {
        hasError: true,
        error: 'Err in Game finish!',
      };
    }

    const findUser = await User.findOne({ _id: id });

    if (!findUser) {
      return {
        hasError: true,
        error: 'Err in Returning Winner!',
      };
    }
    return {
      hasError: false,
      message: `winner is ${findUser.name}`,
      data: {
        userData: findUser,
      },
    };
  } catch (error) {
    console.log('error: ', error);
  }
};
module.exports = {
  createGame,
  JoinGame,
  startMatch,
  userMove,
  winner,
};
