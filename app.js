// 必要なパッケージの読み込み
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var date = require('date-utils');
var Promise = require('es6-promise').polyfill();
var admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(__dirname + "/service_account.json"),
  databaseURL: "https://candyguide-phase2.firebaseio.com"
});

var ref = admin.database().ref();


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
        var dt = new Date();
        var formatted = dt.toFormat("YYYY/MM/DD HH24時MI分SS秒");
        ref.child('users').child("x6fVoiVkxYZaAsQueSAevXH3tvp1").update({
            time : formatted,
            mes  : "background api"
        })
        res.json({ message: 'Successfully Posted location' });
    });

// ルーティング登録
app.use('/api', router);

//サーバ起動
app.listen(port);
console.log('listen on port ' + port);
