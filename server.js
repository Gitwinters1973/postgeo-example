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
  postgeo.connect("postgres://ubuntu:test123@localhost:5432/sg");

  postgeo.query("select round(cast(ST_Distance(st_transform(searchpoint.geom, 3414), st_transform(addr.geom, 3414)) as numeric), 1)  as distance, name, ST_AsGeoJSON(addr.geom) AS geometry from childcare addr, (select st_setsrid(st_makepoint("+ lng + ", " + lat + "),4326) as geom) searchpoint where ST_Distance(st_transform(addr.geom,3414), st_transform(searchpoint.geom,3414))<=" + distance + " order by addr.geom <-> searchpoint.geom;", 
              "geojson",
    function (data) {
      res.send(data);
      // console.log(data);
    });
});

router.post("/routing", function(req, res){
  
  var src_lat = req.body.src_lat;
  var src_lng = req.body.src_lng;
  var tgt_lat = req.body.tgt_lat;
  var tgt_lng = req.body.tgt_lng;
  console.log("src_lat: " + src_lat);
  console.log("src_lng: " + src_lng);
  console.log("tgt_lat: " + tgt_lat);
  console.log("tgt_lng: " + tgt_lng);
  
  postgeo.connect("postgres://ubuntu:test123@localhost:5432/sg");
  var query = "select gid, source, target, name, path_seq, node, edge, cost, agg_cost, ST_AsGeoJSON(the_geom) AS geometry from ways join (select * from _pgr_dijkstra('SELECT gid as id, source::int4 as source, target::int4 as target, st_length(st_transform(the_geom, 3414))::float8 as cost from ways', (select source from ways order by st_distance(st_transform(the_geom,3414), st_transform(st_setsrid(st_makepoint("+ src_lng +", " + src_lat + "), 4326), 3414)) limit 1), (select target from ways order by st_distance(st_transform(the_geom, 3414), st_transform(st_setsrid(st_makepoint("+ tgt_lng + ", " + tgt_lat + "), 4326), 3414)) limit 1), false, false)) as route on ways.gid = route.edge;";
  console.log("query: " + query);
  postgeo.query(query, 
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