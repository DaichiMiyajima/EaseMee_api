// 必要なパッケージの読み込み
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var date = require('date-utils');
var Promise = require('es6-promise').polyfill();
var admin = require("firebase-admin");
var Geofire = require('geofire');
var log4js = require('log4js');

// ログ出力設定
log4js.configure({
  "appenders": [
    {
      "type": "file",
      "filename": "log/system.log",
      "maxLogSize": 20480,
      "backups": 3,
      "category": "system"
    },
    {
        "type": "console"
    }
  ],
  "levels": {
      "system": "ALL"
  }
});
 
// ロガーの生成
var logger = log4js.getLogger('system');
// Express の 標準ログ出力を log4js に書き換え
app.use(log4js.connectLogger(logger, {level: 'auto'}));

admin.initializeApp({
  credential: admin.credential.cert(__dirname + "/service_account.json"),
  databaseURL: "https://candyguide-phase2.firebaseio.com"
});

var ref = admin.database().ref();
var geofire = new Geofire(ref.child('geoFire'));

// POSTでdataを受け取るための記述
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 3000番を指定
var port = process.env.PORT || 3033;

// expressでAPIサーバを使うための準備
var router = express.Router();

router.use(function(req, res, next) {
    console.log('Something is happening.');
    next();
});

// 正しく実行出来るか左記にアクセスしてテストする (GET http://localhost:3000/api)
router.get('/', function(req, res) {
    res.json({ message: 'Successfully Posted a test message.' });
});


router.route('/location')
    .post(function(req, res) {
        logger.info('Receive Location Post.');
        var dt = new Date();
        var formatted = dt.toFormat("YYYYMMDDHH24MISS");
        var formatted_hh = dt.toFormat("YYYYMMDDHH24");
        logger.info('TIME:' + formatted + '  UserID:' + req.body.userid);
        userid = req.body.userid;
        var latitude = Number(req.body.latitude);
        var longitude = Number(req.body.longitude);
        
        //update the update time to user table
        ref.child('users').child(userid).update({
            positiontime : formatted,
        });
        
        //set the location history
        var postsRef = ref.child('users').child(userid).child('locationhistory').child(formatted_hh);
        var newPostRef = postsRef.push();
        newPostRef.set({
            positiontime : formatted,
            latitude : latitude,
            longitude: longitude
        });
        
        //update own location
        geofire.set(
            userid,
            [latitude, longitude]
        ).then(function() {
            console.log("Updated own location.");
        }, function(error) {
            console.log("Error: " + error);
        });
        res.sendStatus(200);
    });

// ルーティング登録
app.use('/api', router);

//サーバ起動
app.listen(port);
console.log('listen on port ' + port);
// 起動ログ
logger.info('Server running at http://localhost:3000');
