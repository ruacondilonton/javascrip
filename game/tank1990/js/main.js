
require.config({
    packages: [
    {
        name: 'zrender',
        location: './js/zrender',
        main: 'zrender'
    }
    ]
});
var zr;
require(
    [
    "zrender"
    ],
    function (zrender) {

        zr = zrender.init(document.getElementById("main"));
        zr.clear();

        var env = require("zrender/tool/env");

        var config = require("zrender/config");
        config.catchBrushException = true;
        config.debugMode = 1;
        //----------------------
        beginGame();

        //---------------------
        zr.render();
        //----------------------------------------------------

        if (env.os.ipad || env.os.iphone) {
            //if (env.os.phone) {
            console.log('play on the phone');
            document.getElementById('message').value = 'play on the phone';
            var left = document.getElementById('divLeft');
            if (left) {
                left.ontouchstart = function (e) {
                    doOntouchstart(e, false);
                };
                left.ontouchmove = function (e) {
                    doOntouchmove(e);
                };
                left.ontouchend = function (e) {
                    doOntouchend(e, false);
                };
                left.ontouchcancel = function (e) {
                    doOntouchcancel(e, false);
                };
            }
            var right = document.getElementById('divRight');
            if (right) {
                right.ontouchstart = function (e) {
                    doOntouchstart(e, true);
                };
                right.ontouchend = function (e) {
                    doOntouchend(e, true);
                };
            }
            //����̫����
            //window.addEventListener('deviceorientation', orientationListener, false);
            //window.addEventListener('MozOrientation', orientationListener, false);
            //window.addEventListener('devicemotion', orientationListener, false);
        } else {
            console.log('play on the pc');
            window.addEventListener('keydown', doKeyDown, true);
            window.addEventListener('keypress', doKeyPress, true);
            window.addEventListener('keyup', doKeyUp, true);
        }

    }
);

var TNK;
if (!TNK) {
    TNK = {};
}
TNK.GameOver = false;
TNK.Pause = false;
TNK.StopText;
TNK.TotalTank = 3;
TNK.Tanks = new Hashtable(); //̹��
TNK.Shapes = new Hashtable(); //ǽ ˮ ����Ʒ

function beginGame() {
    playMedia(Media.Over, true);
    playMedia(Media.Start);
    TNK.Tanks = new Hashtable();
    TNK.Shapes = new Hashtable();
    //���ر���
    var width = Math.ceil(zr.getWidth());
    var height = Math.ceil(zr.getHeight());
    var ImageShape = require("zrender/shape/Image");
    zr.addShape(new ImageShape({
        scale: [1, 1],
        zlevel: 0,
        style: {
            x: 0,
            y: 0,
            width: width,
            height: height,
            image: IMG.background.bg
        },
        //invisible: true,
        draggable: false,
        hoverable: false
    }));
    //���ص�ͼ
    new Map().init();
    //���̹��
    PlayerTank = new Tank(IMG.player.player1, IMG.tankmissile.missile1);
    PlayerTank.born();

    //��������ˢ��
    if (TNK.TankTicket)
        clearInterval(TNK.TankTicket);
    TNK.TankTicket = setInterval(function () {
        zr.refresh(function () {
            var count = TNK.TotalTank - TNK.Tanks.count() + 1;
            //����̹��
            for (var i = 0; i < count; i++) {
                var str = GetRandomNum(1, 3);
                var et = new EnemyTank(IMG.ememy["enemy" + str], IMG.enemymissile.missile1);
                et.born().run();
            }
        });
    }, 1000 / 24);
    TNK.GameOver = false;
}
function gameOver() {
    _gameover();

    //    if (TNK.TankTicket)
    //        clearInterval(TNK.TankTicket);

    if (PlayerTank._Missile && PlayerTank._Missile._missile._fireTicket) {
        clearInterval(PlayerTank._Missile._missile._fireTicket);
    }
    if (PlayerTank._moveTicket)
        clearInterval(PlayerTank._moveTicket);
    if (PlayerTank._fireTicket)
        clearInterval(PlayerTank._fireTicket);
    PlayerTank = null;

    if (TNK.Tanks.count() > 0) {
        for (key in TNK.Tanks._hash) {//������ϣ��
            if (TNK.Tanks._hash[key].length != 0) {
                var target = TNK.Tanks._hash[key];
                if (target._Missile && target._Missile._missile._fireTicket) {
                    clearInterval(target._Missile._missile._fireTicket);
                }
                if (target._bornTicket)
                    clearInterval(target._bornTicket);
                if (target._moveTicket)
                    clearInterval(target._moveTicket);
                if (target._fireTicket)
                    clearInterval(target._fireTicket);

            }
        }
    }
    //TNK.Tanks = new Hashtable();
    //TNK.Shapes = new Hashtable();
    TNK.GameOver = true;
    playMedia(Media.Over);
}
function _gameover() {
    var ImageShape = require("zrender/shape/Image");
    var width = Math.ceil(zr.getWidth());
    var height = Math.ceil(zr.getHeight());
    var gw = 320;
    var gh = 180;
    var gx = Math.round(width / 2) - Math.round(gw / 2);
    var gy = Math.round(height / 2) - Math.round(gh / 2);
    zr.addShape(new ImageShape({
        scale: [1, 1],
        zlevel: 2,
        style: {
            x: gx,
            y: gy,
            width: gw,
            height: gh,
            image: IMG.gameover.over,
            text: "press \"0\" key to continue.",
            textColor: 'white',
            textPosition: 'bottom',
            textFont: 'bold 18px verdana'
        },
        //invisible: true,
        draggable: false,
        hoverable: false
    }));
}
var PlayerTank; //�û�
function doKeyPress(e) {
    var keyCode = e.keyCode ? e.keyCode : e.which;
    if (TNK.Pause == true && keyCode == 32) {
        TNK.Pause == false;
        zr.delShape(TNK.StopText.id);
    }
    if (TNK.GameOver == true && keyCode == 48) {// 0 key
        zr.clear();
        beginGame();
        //zr.render();
    }
    if (TNK.GameOver == true || TNK.Pause == true) return;

    if (PlayerTank == null && keyCode == 49) {// 1 key
        //���̹��
        PlayerTank = new Tank(IMG.player.player1, IMG.tankmissile.missile1);
        PlayerTank.born();
    }

    if (PlayerTank == null) return;
    if (keyCode == 97 || keyCode == 65)	//	a-->left
    {
        if (!PlayerTank._moveTicket) {
            clearInterval(PlayerTank._moveTicket);
            PlayerTank._moveTicket = setInterval(function () {
                PlayerTank.move("left");
            }, 50);
        }
    }
    else if (keyCode == 119 || keyCode == 87)	//	w-->up
    {
        if (!PlayerTank._moveTicket) {
            clearInterval(PlayerTank._moveTicket);
            PlayerTank._moveTicket = setInterval(function () {
                PlayerTank.move("up");
            }, 50);
        }
    }
    else if (keyCode == 115 || keyCode == 83)	//	s-->down
    {
        if (!PlayerTank._moveTicket) {
            clearInterval(PlayerTank._moveTicket);
            PlayerTank._moveTicket = setInterval(function () {
                PlayerTank.move("down");
            }, 50);
        }
    }
    else if (keyCode == 100 || keyCode == 68)	//	d-->right
    {
        if (!PlayerTank._moveTicket) {
            clearInterval(PlayerTank._moveTicket);
            PlayerTank._moveTicket = setInterval(function () {
                PlayerTank.move("right");
            }, 50);
        }
    }
    if (keyCode == 112) {
        //stop
        TNK.Pause == true
        var TextShape = require('zrender/shape/Text');
        // �ı�
        var width = Math.ceil(zr.getWidth());
        var height = Math.ceil(zr.getHeight());
        TNK.StopText = (new TextShape({
            zlevel: 1,
            z: 2,
            style: {
                x: width / 2,
                y: height / 2,
                brushType: 'fill',
                color: 'white',
                shadowColor: 'yellow',
                shadowBlur: 10,
                lineWidth: 3,
                text: 'Pause! Press space key to continue.',
                textFont: 'normal 20px verdana',
                textAlign: 'center',
                textBaseline: 'top'
            },
            draggable: false,
            hoverable: false
        }));
        zr.addShape(TNK.StopText);
    }
}
function doKeyDown(e) {
    if (TNK.GameOver == true || TNK.Pause == true) return;
    if (PlayerTank == null) return;
    var keyCode = e.keyCode ? e.keyCode : e.which;
    //console.log("Down keyCode: " + keyCode);
    if (keyCode == 97 || keyCode == 65)	//	a-->left
    {
        PlayerTank.turn("left");
    }
    else if (keyCode == 119 || keyCode == 87)	//	w-->up
    {
        PlayerTank.turn("up");
    }
    else if (keyCode == 115 || keyCode == 83)	//	s-->down
    {
        PlayerTank.turn("down");
    }
    else if (keyCode == 100 || keyCode == 68)	//	d-->right
    {
        PlayerTank.turn("right");
    }

    if (keyCode == 13) {// enter fire
        if (!PlayerTank._fireTicket) {
            //clearInterval(PlayerTank._fireTicket);
            PlayerTank._fireTicket = setInterval(function () {
                PlayerTank.fire();
            }, 50);
        }
    }
}
function doKeyUp(e) {
    if (TNK.GameOver == true || TNK.Pause == true) return;
    if (PlayerTank == null) return;
    var keyCode = e.keyCode ? e.keyCode : e.which;

    if (keyCode == 97 || keyCode == 65)	//	a-->left
    {
        PlayerTank.stop();
    }
    else if (keyCode == 119 || keyCode == 87)	//	w-->up
    {
        PlayerTank.stop();
    }
    else if (keyCode == 115 || keyCode == 83)	//	s-->down
    {
        PlayerTank.stop();
    }
    else if (keyCode == 100 || keyCode == 68)	//	d-->right
    {
        PlayerTank.stop();
    }
    if (keyCode == 13) {// enter
        PlayerTank.ceasefire();
    }
}

function playMedia(url, stop) {

    var _id = url == Media.Start ? "soundStart" :
    url == Media.Fire ? "soundFire" :
    url == Media.Born ? "soundAdd" :
    url == Media.Hit ? "soundHit" :
    url == Media.Blast ? "soundBlast" :
    url == Media.Over ? "soundOver" :
    url == Media.Move ? "soundMove" : ""; //�ƶ���������������
    if (url == Media.Over) {
        //document.getElementById(_id).loop = '1';
    }
    if (url != "") {
        if (!stop)
            document.getElementById(_id).play();
        else
            document.getElementById(_id).pause();
        document.getElementById(_id).CurrentPosition = 0;
    }
}


function scaleShape() {

    var shapeList = zr.storage.getShapeList(true);
    if (shapeList) {
        for (var i = 0; i < shapeList.length; i++) {
            var shape = shapeList[i];
            zr.modShape(shape.id, { scale: [0.8, 0.8] });
        }
        //zr.refreshShapes(shapeList);
    }
}

function getScreen() {

    return {
        width: Math.ceil(zr.getWidth()),
        height: Math.ceil(zr.getHeight())
    }
}

//--------------------------------------------
var handLocation = {};
var currentDirection;
function doOntouchstart(e, shoot) {
    e.preventDefault();
    if (shoot != true) {
        //�¼���touches������һ�����飬����һ��Ԫ�ش���ͬһʱ�̵�һ�����ص㣬�Ӷ�����ͨ��touches��ȡ��㴥�ص�ÿ�����ص�
        //��������ֻ��һ�㴥�أ�����ֱ��ָ��[0]
        var touch = e.touches[0];
        if (PlayerTank._fireTicket) {
            touch = e.touches[1];
        }
        //��ȡ��ǰ���ص�����꣬��ͬ��MouseEvent�¼���clientX/clientY
        var x = touch.clientX;
        var y = touch.clientY;
        handLocation.x = x;
        handLocation.y = y;
        //document.getElementById('message').value = "Ontouchstart:(" + x + "," + y + ")";
    } else {
        if (!PlayerTank._fireTicket) {
            //clearInterval(PlayerTank._fireTicket);
            PlayerTank._fireTicket = setInterval(function () {
                PlayerTank.fire();
            }, 50);
        }
    }

}

function doOntouchmove(e) {
    //��Ϊtouchstart��touchmove�¼�����preventDefault�Ӷ���ֹ����ʱ����������š�������������
    e.preventDefault();

    var touch = e.touches[0];
    if (PlayerTank._fireTicket) {
        touch = e.touches[1];
    }
    var x = touch.clientX;
    var y = touch.clientY;
    //���������յ�λ�ü��㷽��
    //document.getElementById('message').value = "move:(" + x + "," + y + "),("+ handLocation.x+","+handLocation.y+")";
    if (handLocation) {
        //var angle = getAngle(x,y,handLocation.x,handLocation.y);
        var spanX = x - handLocation.x;
        var spanY = y - handLocation.y;
        if (Math.abs(spanX) > Math.abs(spanY)) {
            if (spanX > 0) {
                currentDirection = ("right");
            } else {
                currentDirection = ("left");
            }
        } else {
            if (spanY > 0) {
                currentDirection = ("down");
            } else {
                currentDirection = ("up");
            }
        }

        if (PlayerTank._direction != currentDirection) {
            handLocation.x = x;
            handLocation.y = y;
            //document.getElementById('message').value = "turn " + currentDirection;
        }
        tankMove(currentDirection);
        //document.getElementById('message').value = "doOntouchmove:(" + x + "," + y + ")";
    }
}

function tankMove(direction) {
    document.getElementById('message').value = "direction: " + direction;
    if (!PlayerTank._moveTicket) {
        clearInterval(PlayerTank._moveTicket);
        PlayerTank._moveTicket = setInterval(function () {
            PlayerTank.move(direction);
        }, 50);
    } else {
        PlayerTank._direction = direction;
    }
}

function doOntouchend(e, shoot) {

    if (shoot == true) {
        PlayerTank.ceasefire();
    } else {
        PlayerTank.stop();
    }
    document.getElementById('message').value = "doOntouchend";
}

function doOntouchcancel(e, shoot) {

    document.getElementById('message').value = "doOntouchcancel";
}


function getAngle(x1, y1, x2, y2) {
    // ֱ�ǵı߳�     
    var x = Math.abs(x1 - x2);
    var y = Math.abs(y1 - y2);
    // б�߳�     
    var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    // ����     
    var cos = y / z;
    // ����     
    var radina = Math.acos(cos);
    // �Ƕ�     
    var angle = 180 / (Math.PI / radina);
    return angle;

}

//������Ӧ ����̫����
var _lastGamma;
var _lastBeta;
function orientationListener(evt) {
    // For FF3.6+
    if (!evt.gamma && !evt.beta) {
        // angle=radian*180.0/PI ��firefox��x��y�ǻ���ֵ,
        evt.gamma = (evt.x * (180 / Math.PI)); //ת���ɽǶ�ֵ,
        evt.beta = (evt.y * (180 / Math.PI)); //ת���ɽǶ�ֵ
        evt.alpha = (evt.z * (180 / Math.PI)); //ת���ɽǶ�ֵ
    }
    var gamma = evt.gamma;
    var beta = evt.beta;
    var alpha = evt.alpha;

    if (evt.accelerationIncludingGravity) {
        // window.removeEventListener('deviceorientation', this.orientationListener, false);
        gamma = event.accelerationIncludingGravity.x * 10;
        beta = -event.accelerationIncludingGravity.y * 10;
        alpha = event.accelerationIncludingGravity.z * 10;
    }

    if (_lastGamma != gamma || _lastBeta != beta) {
        //document.querySelector("#test").innerHTML = "x: " + beta.toFixed(2) + " y: " + gamma.toFixed(2) + " z: " + (alpha != null ? alpha.toFixed(2) : 0);
        document.getElementById('message').value = "x: " + beta.toFixed(2) + " y: " + gamma.toFixed(2); // + " z: " + (alpha != null ? alpha.toFixed(2) : 0);

        //var style = document.querySelector("#pointer").style;
        //style.left = gamma / 90 * 200 + 200 + "px";
        //style.top = beta / 90 * 100 + 100 + "px";
        //		if(_lastGamma > gamma){
        //			document.getElementById('message').value = "left";
        //		}else{
        //			document.getElementById('message').value = "right";
        //		}
        //		if(_lastBeta > beta){
        //			document.getElementById('message').value = "up";
        //		}else{
        //			document.getElementById('message').value = "down";
        //		}


        _lastGamma = gamma;
        _lastBeta = beta;
    }
}



