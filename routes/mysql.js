var express  = require('express'),
	router   = express.Router(),
	database = require('../bin/mysql');

router.get('/', function(req, res, next) {
	database.check();
	res.send("check console");
});

router.get('/:server', function(req, res, next) {
	
});

router.get('/:server/users', function(req, res, next) {
	database.getConnection(req.params.server, function(err, connection){
		connection.query('SELECT * FROM seip_user ORDER BY id LIMIT 5', function(err, rows, fields) {
			res.json(rows);
		});
	});
});

router.get('/:server/user/:id', function(req, res, next) {
	database.getConnection(req.params.server, function(err, connection){
		connection.query('SELECT * FROM seip_user WHERE id = ? LIMIT 1', [req.params.id], function(err, rows, fields) {
			res.json(rows);
		});
	});
});

module.exports = router;
