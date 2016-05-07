var express = require("express");
var bodyParser = require("body-parser");
var postgeo = require("postgeo");
var app = express();
var router = express.Router();
var path = __dirname + '/views/';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('files'));

router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});

router.get("/",function(req,res){
  res.sendFile(path + "index.html");
});

router.get("/about",function(req,res){
  res.sendFile(path + "about.html");
});

router.get("/contact",function(req,res){
  res.sendFile(path + "contact.html");
});

router.post("/findWithin", function(req, res){
  
  var lat = req.body.lat;
  var lng = req.body.lng;
  var distance = req.body.distance;
  postgeo.connect("postgres://ubuntu:exact123@localhost:5432/sg");
  postgeo.query("select round(cast(ST_Distance(st_transform(searchpoint.geom, 3414), st_transform(addr.geom, 3414)) as numeric), 1)  as distance, name, ST_AsGeoJSON(addr.geom) AS geometry from childcare addr, (select st_setsrid(st_makepoint("+ lng + ", " + lat + "),4326) as geom) searchpoint where ST_Distance(st_transform(addr.geom,3414), st_transform(searchpoint.geom,3414))<=" + distance + " order by addr.geom <-> searchpoint.geom;", 
              "geojson",
    function (data) {
      res.send(data);
      // console.log(data);
    });
  
  
});

app.use("/",router);

app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});

app.listen(process.env.PORT, process.env.IP,function(){
  console.log("Live at " + process.env.IP + " : " + process.env.PORT);
});