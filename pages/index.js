
class Index extends React.Component {

  componentDidMount() {
    if (window) {
      const Game = require('../game.js');
      Game.init();
    }
  }

  render() {
    return (
      <div id="game" />
    );
  }
}

export default Index;
