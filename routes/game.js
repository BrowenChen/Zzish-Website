
exports.index = function(req, res){
  res.render('game/index', { title: 'Title' });
};

exports.game = function(req, res){
  res.render('game/game', { title: 'Title' });
};